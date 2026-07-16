import type { Objective, MemoryItem } from "@/types";
import { memoryItems as seedItems, getItemById } from "@/data/memoryItems";

const STORAGE_KEY = "memorize-objectives";
const ITEMS_KEY = "memorize-custom-items";

/** Seed objectives derived from the legacy collections. */
function seedObjectives(): Objective[] {
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  return [
    {
      id: "essenciais",
      name: "Essenciais da Fé",
      description: "Versículos fundamentais para começar sua jornada.",
      itemIds: ["jo-3-16", "sl-23-1", "fp-4-13", "rm-8-28"],
      lastStudiedAt: yesterday,
      createdAt: now,
    },
    {
      id: "coragem",
      name: "Coragem & Força",
      description: "Palavras para os dias difíceis.",
      itemIds: ["fp-4-13", "is-40-31", "js-1-9"],
      lastStudiedAt: undefined,
      createdAt: now,
    },
    {
      id: "sabedoria",
      name: "Sabedoria Diária",
      description: "Direção para escolhas importantes.",
      itemIds: ["pv-3-5", "mt-6-33"],
      lastStudiedAt: undefined,
      createdAt: now,
    },
    {
      id: "esperanca",
      name: "Esperança",
      description: "Para renovar o coração.",
      itemIds: ["is-40-31", "rm-8-28", "sl-23-1"],
      lastStudiedAt: undefined,
      createdAt: now,
    },
  ];
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // ignore malformed
  }
  return fallback;
}

function saveToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota
  }
}

/** Load all objectives (seeded on first run). */
export function loadObjectives(): Objective[] {
  const existing = loadFromStorage<Objective[] | null>(STORAGE_KEY, null);
  if (existing) return existing;
  const seeded = seedObjectives();
  saveToStorage(STORAGE_KEY, seeded);
  return seeded;
}

/** Persist objectives. */
export function saveObjectives(objectives: Objective[]) {
  saveToStorage(STORAGE_KEY, objectives);
}

/** Load custom memory items (user-created texts). */
export function loadCustomItems(): MemoryItem[] {
  return loadFromStorage<MemoryItem[]>(ITEMS_KEY, []);
}

/** Persist custom items. */
export function saveCustomItems(items: MemoryItem[]) {
  saveToStorage(ITEMS_KEY, items);
}

/**
 * Resolve a memory item by ID, checking both seed and custom items.
 */
export function resolveItem(id: string, customItems: MemoryItem[]): MemoryItem | undefined {
  return customItems.find((i) => i.id === id) ?? getItemById(id);
}

/**
 * Get all items belonging to an objective.
 */
export function getObjectiveItems(objective: Objective, customItems: MemoryItem[]): MemoryItem[] {
  return objective.itemIds
    .map((id) => resolveItem(id, customItems))
    .filter(Boolean) as MemoryItem[];
}

/**
 * Calculate progress for an objective.
 */
export function getObjectiveProgress(
  objective: Objective,
  customItems: MemoryItem[],
): {
  totalTexts: number;
  studiedTexts: number;
  masteryPct: number;
  lastActivityLabel: string;
} {
  const items = getObjectiveItems(objective, customItems);
  const totalTexts = items.length;
  const studiedTexts = items.filter((i) => (i.reviewCount ?? 0) > 0).length;
  const avgMastery =
    totalTexts > 0
      ? Math.round(items.reduce((sum, i) => sum + (i.mastery ?? 0), 0) / totalTexts)
      : 0;
  const lastActivityLabel = formatLastActivity(objective.lastStudiedAt);
  return { totalTexts, studiedTexts, masteryPct: avgMastery, lastActivityLabel };
}

export function formatLastActivity(iso: string | undefined): string {
  if (!iso) return "Sem atividade";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

/**
 * Create a new objective.
 */
export function createObjective(
  name: string,
  description: string,
  objectives: Objective[],
): Objective {
  const now = new Date().toISOString();
  const obj: Objective = {
    id: `obj-${Date.now()}`,
    name: name.trim(),
    description: description.trim() || undefined,
    itemIds: [],
    lastStudiedAt: undefined,
    createdAt: now,
  };
  saveObjectives([obj, ...objectives]);
  return obj;
}

/**
 * Add a text to an objective. Creates a MemoryItem if it doesn't exist.
 */
export function addTextToObjective(
  objectiveId: string,
  text: Omit<MemoryItem, "id" | "createdAt" | "reviewCount" | "mastery">,
  objectives: Objective[],
  customItems: MemoryItem[],
): { objectives: Objective[]; customItems: MemoryItem[] } {
  const now = new Date().toISOString();
  const itemId = `item-${Date.now()}`;
  const newItem: MemoryItem = {
    ...text,
    id: itemId,
    createdAt: now,
    reviewCount: 0,
    mastery: 0,
  };
  const updatedItems = [newItem, ...customItems];
  saveCustomItems(updatedItems);

  const updatedObjectives = objectives.map((o) =>
    o.id === objectiveId ? { ...o, itemIds: [...o.itemIds, itemId] } : o,
  );
  saveObjectives(updatedObjectives);

  return { objectives: updatedObjectives, customItems: updatedItems };
}

/**
 * Mark an objective as studied now.
 */
export function markObjectiveStudied(objectiveId: string, objectives: Objective[]): Objective[] {
  const now = new Date().toISOString();
  const updated = objectives.map((o) => (o.id === objectiveId ? { ...o, lastStudiedAt: now } : o));
  saveObjectives(updated);
  return updated;
}

/**
 * Get the last studied objective, or the first one if none has been studied.
 */
export function getLastStudiedObjective(objectives: Objective[]): Objective | null {
  if (objectives.length === 0) return null;
  const studied = objectives.filter((o) => o.lastStudiedAt);
  if (studied.length === 0) return objectives[0];
  studied.sort(
    (a, b) => new Date(b.lastStudiedAt!).getTime() - new Date(a.lastStudiedAt!).getTime(),
  );
  return studied[0];
}

/**
 * Update an objective's name and/or description.
 */
export function updateObjective(
  objectiveId: string,
  updates: { name?: string; description?: string },
  objectives: Objective[],
): Objective[] {
  const updated = objectives.map((o) =>
    o.id === objectiveId
      ? {
          ...o,
          name: updates.name?.trim() ?? o.name,
          description:
            updates.description !== undefined
              ? updates.description.trim() || undefined
              : o.description,
        }
      : o,
  );
  saveObjectives(updated);
  return updated;
}

/**
 * Delete an objective. Also removes its custom items from the items list
 * (but not seed items).
 */
export function deleteObjective(
  objectiveId: string,
  objectives: Objective[],
  customItems: MemoryItem[],
): { objectives: Objective[]; customItems: MemoryItem[] } {
  const obj = objectives.find((o) => o.id === objectiveId);
  if (!obj) return { objectives, customItems };
  const customIds = new Set(customItems.map((i) => i.id));
  const itemIdsToRemove = obj.itemIds.filter((id) => customIds.has(id));
  const updatedItems = customItems.filter((i) => !itemIdsToRemove.includes(i.id));
  saveCustomItems(updatedItems);
  const updatedObjectives = objectives.filter((o) => o.id !== objectiveId);
  saveObjectives(updatedObjectives);
  return { objectives: updatedObjectives, customItems: updatedItems };
}

/**
 * Update a custom item's fields.
 */
export function updateCustomItem(
  itemId: string,
  updates: Partial<Omit<MemoryItem, "id" | "createdAt">>,
  customItems: MemoryItem[],
): MemoryItem[] {
  const updated = customItems.map((i) => (i.id === itemId ? { ...i, ...updates } : i));
  saveCustomItems(updated);
  return updated;
}

/**
 * Delete a custom item from storage and remove it from any objectives.
 */
export function deleteCustomItem(
  itemId: string,
  objectives: Objective[],
  customItems: MemoryItem[],
): { objectives: Objective[]; customItems: MemoryItem[] } {
  const updatedItems = customItems.filter((i) => i.id !== itemId);
  saveCustomItems(updatedItems);
  const updatedObjectives = objectives.map((o) => ({
    ...o,
    itemIds: o.itemIds.filter((id) => id !== itemId),
  }));
  saveObjectives(updatedObjectives);
  return { objectives: updatedObjectives, customItems: updatedItems };
}

/**
 * Duplicate a custom item and add the copy to the same objective.
 */
export function duplicateCustomItem(
  itemId: string,
  objectiveId: string,
  objectives: Objective[],
  customItems: MemoryItem[],
): { objectives: Objective[]; customItems: MemoryItem[] } {
  const original = customItems.find((i) => i.id === itemId);
  if (!original) return { objectives, customItems };
  const newId = `item-${Date.now()}`;
  const copy: MemoryItem = {
    ...original,
    id: newId,
    title: `${original.title} (cópia)`,
    createdAt: new Date().toISOString(),
    reviewCount: 0,
    mastery: 0,
    lastReviewedAt: undefined,
  };
  const updatedItems = [copy, ...customItems];
  saveCustomItems(updatedItems);
  const updatedObjectives = objectives.map((o) =>
    o.id === objectiveId ? { ...o, itemIds: [...o.itemIds, newId] } : o,
  );
  saveObjectives(updatedObjectives);
  return { objectives: updatedObjectives, customItems: updatedItems };
}
