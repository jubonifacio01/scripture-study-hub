import { supabase } from "@/lib/supabaseClient";
import { getGuestId } from "@/lib/guestId";
import type { Objective, MemoryItem } from "@/types";
import { formatLastActivity } from "@/data/objectives";

// ─── DB row shapes ────────────────────────────────────────────────────────────

interface DbObjective {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface DbMemoryText {
  id: string;
  objective_id: string;
  reference: string;
  text: string;
  order_index: number;
  created_at: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

/**
 * Maps a DB objective row + its memory_texts rows to the app's Objective type.
 * `itemIds` is the ordered list of memory_text UUIDs.
 */
function toObjective(row: DbObjective, texts: DbMemoryText[]): Objective {
  const sorted = [...texts].sort((a, b) => a.order_index - b.order_index);
  return {
    id: row.id,
    name: row.title,
    description: row.description ?? undefined,
    itemIds: sorted.map((t) => t.id),
    createdAt: row.created_at,
    // last_studied_at lives only in user_progress; we don't load it here yet
    lastStudiedAt: undefined,
  };
}

/**
 * Maps a DB memory_text row to the app's MemoryItem type.
 * `reference` is stored as "Book Chapter:Verse" (e.g. "João 3:16").
 * We parse it back into separate fields for the UI.
 */
function toMemoryItem(row: DbMemoryText): MemoryItem {
  const parsed = parseReference(row.reference);
  return {
    id: row.id,
    title: row.reference,
    book: parsed.book,
    chapter: parsed.chapter,
    verse: parsed.verse,
    text: row.text,
    category: "Pessoal",
    tags: [],
    createdAt: row.created_at,
    reviewCount: 0,
    mastery: 0,
  };
}

function parseReference(ref: string): { book: string; chapter: number; verse: string } {
  // e.g. "João 3:16" → { book: "João", chapter: 3, verse: "16" }
  const match = ref.match(/^(.+?)\s+(\d+):(.+)$/);
  if (match) {
    return { book: match[1], chapter: parseInt(match[2]) || 0, verse: match[3] };
  }
  return { book: ref, chapter: 0, verse: "" };
}

function buildReference(item: { title: string; book: string; chapter: number; verse: string }): string {
  if (item.book && item.book !== "—" && item.chapter) {
    return `${item.book} ${item.chapter}:${item.verse}`;
  }
  return item.title;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

export interface ObjectiveWithItems {
  objective: Objective;
  items: MemoryItem[];
}

/**
 * Load all objectives for the current guest, with their memory_texts.
 */
export async function fetchObjectives(): Promise<ServiceResult<ObjectiveWithItems[]>> {
  const ownerId = getGuestId();

  const { data: objRows, error: objErr } = await supabase
    .from("objectives")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (objErr) {
    return { data: null, error: objErr.message };
  }
  if (!objRows || objRows.length === 0) {
    return { data: [], error: null };
  }

  const objIds = (objRows as DbObjective[]).map((r) => r.id);

  const { data: textRows, error: textErr } = await supabase
    .from("memory_texts")
    .select("*")
    .in("objective_id", objIds)
    .order("order_index", { ascending: true });

  if (textErr) {
    return { data: null, error: textErr.message };
  }

  const textsById = new Map<string, DbMemoryText[]>();
  for (const text of (textRows ?? []) as DbMemoryText[]) {
    const arr = textsById.get(text.objective_id) ?? [];
    arr.push(text);
    textsById.set(text.objective_id, arr);
  }

  const result: ObjectiveWithItems[] = (objRows as DbObjective[]).map((row) => {
    const texts = textsById.get(row.id) ?? [];
    return {
      objective: toObjective(row, texts),
      items: texts.map(toMemoryItem),
    };
  });

  return { data: result, error: null };
}

/**
 * Create a new objective. Returns the created Objective.
 */
export async function createObjectiveInDb(
  name: string,
  description: string,
): Promise<ServiceResult<Objective>> {

  const ownerId = getGuestId();

  const { data, error } = await supabase
    .from("objectives")
    .insert({
      owner_id: ownerId,
      title: name.trim(),
      description: description.trim() || null,
      is_public: false,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Erro ao criar objetivo." };
  }

  return { data: toObjective(data as DbObjective, []), error: null };
}

/**
 * Update an objective's title and/or description.
 */
export async function updateObjectiveInDb(
  objectiveId: string,
  updates: { name?: string; description?: string },
): Promise<ServiceResult<Objective>> {
  if (!supabase) return { data: null, error: "Supabase não configurado." };

  const patch: Record<string, unknown> = {};
  if (updates.name !== undefined) patch.title = updates.name.trim();
  if (updates.description !== undefined) {
    patch.description = updates.description.trim() || null;
  }

  const { data, error } = await supabase
    .from("objectives")
    .update(patch)
    .eq("id", objectiveId)
    .eq("owner_id", getGuestId())
    .select("*")
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Erro ao atualizar objetivo." };
  }

  // Re-fetch texts so itemIds stays accurate
  const { data: texts } = await supabase
    .from("memory_texts")
    .select("*")
    .eq("objective_id", objectiveId)
    .order("order_index", { ascending: true });

  return {
    data: toObjective(data as DbObjective, (texts ?? []) as DbMemoryText[]),
    error: null,
  };
}

/**
 * Delete an objective and all its memory_texts (cascade handles DB side).
 */
export async function deleteObjectiveInDb(objectiveId: string): Promise<ServiceResult<void>> {
  const { error } = await supabase
    .from("objectives")
    .delete()
    .eq("id", objectiveId)
    .eq("owner_id", getGuestId());

  if (error) return { data: null, error: error.message };
  return { data: undefined, error: null };
}

/**
 * Add a memory text to an objective.
 */
export async function addMemoryText(
  objectiveId: string,
  item: Omit<MemoryItem, "id" | "createdAt" | "reviewCount" | "mastery">,
  orderIndex: number,
): Promise<ServiceResult<MemoryItem>> {
  const reference = buildReference(item);

  const { data, error } = await supabase
    .from("memory_texts")
    .insert({
      objective_id: objectiveId,
      reference,
      text: item.text.trim(),
      order_index: orderIndex,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Erro ao salvar texto." };
  }

  return { data: toMemoryItem(data as DbMemoryText), error: null };
}

/**
 * Update a memory text's content.
 */
export async function updateMemoryText(
  textId: string,
  updates: Partial<Omit<MemoryItem, "id" | "createdAt">>,
): Promise<ServiceResult<MemoryItem>> {
  if (!supabase) return { data: null, error: "Supabase não configurado." };

  const patch: Record<string, unknown> = {};
  if (updates.title !== undefined || updates.book !== undefined || updates.chapter !== undefined || updates.verse !== undefined) {
    patch.reference = buildReference({
      title: updates.title ?? "",
      book: updates.book ?? "",
      chapter: updates.chapter ?? 0,
      verse: updates.verse ?? "",
    });
  }
  if (updates.text !== undefined) patch.text = updates.text.trim();

  const { data, error } = await supabase
    .from("memory_texts")
    .update(patch)
    .eq("id", textId)
    .select("*")
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Erro ao atualizar texto." };
  }

  return { data: toMemoryItem(data as DbMemoryText), error: null };
}

/**
 * Delete a memory text.
 */
export async function deleteMemoryText(textId: string): Promise<ServiceResult<void>> {
  if (!supabase) return { data: null, error: "Supabase não configurado." };

  const { error } = await supabase
    .from("memory_texts")
    .delete()
    .eq("id", textId);

  if (error) return { data: null, error: error.message };
  return { data: undefined, error: null };
}

/**
 * Duplicate a memory text within the same objective.
 */
export async function duplicateMemoryText(
  textId: string,
  objectiveId: string,
  currentItemCount: number,
): Promise<ServiceResult<MemoryItem>> {
  if (!supabase) return { data: null, error: "Supabase não configurado." };

  const { data: original, error: fetchErr } = await supabase
    .from("memory_texts")
    .select("*")
    .eq("id", textId)
    .maybeSingle();

  if (fetchErr || !original) {
    return { data: null, error: fetchErr?.message ?? "Texto não encontrado." };
  }

  const src = original as DbMemoryText;
  const { data, error } = await supabase
    .from("memory_texts")
    .insert({
      objective_id: objectiveId,
      reference: src.reference + " (cópia)",
      text: src.text,
      order_index: currentItemCount,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Erro ao duplicar texto." };
  }

  return { data: toMemoryItem(data as DbMemoryText), error: null };
}

/**
 * Duplicate an entire objective with all its texts.
 */
export async function duplicateObjectiveInDb(
  objectiveId: string,
  currentObjectives: Objective[],
): Promise<ServiceResult<ObjectiveWithItems>> {

  const ownerId = getGuestId();

  // Fetch the source objective
  const { data: srcObj, error: srcErr } = await supabase
    .from("objectives")
    .select("*")
    .eq("id", objectiveId)
    .maybeSingle();

  if (srcErr || !srcObj) {
    return { data: null, error: srcErr?.message ?? "Objetivo não encontrado." };
  }

  // Fetch its texts
  const { data: srcTexts } = await supabase
    .from("memory_texts")
    .select("*")
    .eq("objective_id", objectiveId)
    .order("order_index", { ascending: true });

  const src = srcObj as DbObjective;

  // Create new objective
  const { data: newObj, error: newObjErr } = await supabase
    .from("objectives")
    .insert({
      owner_id: ownerId,
      title: `${src.title} (cópia)`,
      description: src.description,
      is_public: false,
    })
    .select("*")
    .single();

  if (newObjErr || !newObj) {
    return { data: null, error: newObjErr?.message ?? "Erro ao duplicar objetivo." };
  }

  const newObjRow = newObj as DbObjective;
  let newTexts: DbMemoryText[] = [];

  if (srcTexts && srcTexts.length > 0) {
    const textInserts = (srcTexts as DbMemoryText[]).map((t) => ({
      objective_id: newObjRow.id,
      reference: t.reference,
      text: t.text,
      order_index: t.order_index,
    }));

    const { data: inserted, error: insertErr } = await supabase
      .from("memory_texts")
      .insert(textInserts)
      .select("*");

    if (insertErr) {
      return { data: null, error: insertErr.message };
    }
    newTexts = ((inserted ?? []) as DbMemoryText[]).sort(
      (a, b) => a.order_index - b.order_index,
    );
  }

  return {
    data: {
      objective: toObjective(newObjRow, newTexts),
      items: newTexts.map(toMemoryItem),
    },
    error: null,
  };
}

/**
 * Mark an objective as studied (updates user_progress.updated_at as a proxy;
 * for now we just return the objective with lastStudiedAt set to now so the
 * UI can reflect it — persisting this will come with the user_progress migration).
 */
export function markStudiedLocally(objective: Objective): Objective {
  return { ...objective, lastStudiedAt: new Date().toISOString() };
}

// Re-export formatLastActivity so callers don't need to import from two places
export { formatLastActivity };

// ─── Progress helpers (local-only, seed-item compatible) ─────────────────────

export function getObjectiveProgress(
  objective: Objective,
  items: MemoryItem[],
): { totalTexts: number; studiedTexts: number; masteryPct: number; lastActivityLabel: string } {
  const totalTexts = items.length;
  const studiedTexts = items.filter((i) => (i.reviewCount ?? 0) > 0).length;
  const avgMastery =
    totalTexts > 0
      ? Math.round(items.reduce((sum, i) => sum + (i.mastery ?? 0), 0) / totalTexts)
      : 0;
  return {
    totalTexts,
    studiedTexts,
    masteryPct: avgMastery,
    lastActivityLabel: formatLastActivity(objective.lastStudiedAt),
  };
}
