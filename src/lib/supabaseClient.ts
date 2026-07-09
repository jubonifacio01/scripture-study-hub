import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SharedPermissionLevel = "read_only" | "allow_copy" | "allow_collaboration";

export interface SharedObjective {
  id: string;
  share_code: string;
  name: string;
  description: string | null;
  owner_name: string;
  permission_level: SharedPermissionLevel;
  created_at: string;
  updated_at: string;
}

export interface SharedObjectiveItem {
  id: string;
  shared_objective_id: string;
  title: string;
  book: string;
  chapter: number;
  verse: string;
  text: string;
  category: string;
  tags: string[];
  order_index: number;
}

export interface SharedObjectiveWithItems extends SharedObjective {
  items: SharedObjectiveItem[];
}

/**
 * Share an objective with its items
 */
export async function shareObjective(
  name: string,
  description: string | null,
  items: Array<{
    title: string;
    book: string;
    chapter: number;
    verse: string;
    text: string;
  }>,
  ownerName: string,
  permissionLevel: SharedPermissionLevel = "allow_copy"
): Promise<{ shareCode: string; error: Error | null }> {
  try {
    // Insert shared objective
    const { data: objectiveData, error: objectiveError } = await supabase
      .from("shared_objectives")
      .insert({
        name,
        description,
        owner_name: ownerName,
        permission_level: permissionLevel,
      })
      .select("share_code")
      .single();

    if (objectiveError || !objectiveData) {
      return { shareCode: "", error: objectiveError || new Error("Failed to create shared objective") };
    }

    const shareCode = objectiveData.share_code;

    // Insert items if any
    if (items.length > 0) {
      const { data: objectiveIdData } = await supabase
        .from("shared_objectives")
        .select("id")
        .eq("share_code", shareCode)
        .single();

      if (objectiveIdData) {
        const itemsToInsert = items.map((item, index) => ({
          shared_objective_id: objectiveIdData.id,
          title: item.title,
          book: item.book || "—",
          chapter: item.chapter || 0,
          verse: item.verse || "",
          text: item.text,
          order_index: index,
        }));

        const { error: itemsError } = await supabase
          .from("shared_objective_items")
          .insert(itemsToInsert);

        if (itemsError) {
          // Try to clean up the objective if items failed
          await supabase.from("shared_objectives").delete().eq("share_code", shareCode);
          return { shareCode: "", error: itemsError };
        }
      }
    }

    return { shareCode, error: null };
  } catch (err) {
    return { shareCode: "", error: err as Error };
  }
}

/**
 * Get a shared objective by its share code
 */
export async function getSharedObjective(shareCode: string): Promise<{
  data: SharedObjectiveWithItems | null;
  error: Error | null;
}> {
  try {
    const { data: objectiveData, error: objectiveError } = await supabase
      .from("shared_objectives")
      .select("*")
      .eq("share_code", shareCode.toUpperCase())
      .single();

    if (objectiveError || !objectiveData) {
      return { data: null, error: objectiveError || new Error("Shared objective not found") };
    }

    const { data: itemsData, error: itemsError } = await supabase
      .from("shared_objective_items")
      .select("*")
      .eq("shared_objective_id", objectiveData.id)
      .order("order_index");

    if (itemsError) {
      return { data: null, error: itemsError };
    }

    return {
      data: {
        ...objectiveData,
        items: itemsData || [],
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Update items in a shared objective (for collaboration)
 */
export async function updateSharedObjectiveItems(
  shareCode: string,
  items: Array<{
    title: string;
    book: string;
    chapter: number;
    verse: string;
    text: string;
  }>
): Promise<{ error: Error | null }> {
  try {
    const { data: objectiveData, error: objectiveError } = await supabase
      .from("shared_objectives")
      .select("id, permission_level")
      .eq("share_code", shareCode.toUpperCase())
      .single();

    if (objectiveError || !objectiveData) {
      return { error: objectiveError || new Error("Shared objective not found") };
    }

    if (objectiveData.permission_level !== "allow_collaboration") {
      return { error: new Error("This shared objective does not allow collaboration") };
    }

    // Delete existing items
    await supabase.from("shared_objective_items").delete().eq("shared_objective_id", objectiveData.id);

    // Insert new items
    if (items.length > 0) {
      const itemsToInsert = items.map((item, index) => ({
        shared_objective_id: objectiveData.id,
        title: item.title,
        book: item.book || "—",
        chapter: item.chapter || 0,
        verse: item.verse || "",
        text: item.text,
        order_index: index,
      }));

      const { error: insertError } = await supabase
        .from("shared_objective_items")
        .insert(itemsToInsert);

      if (insertError) {
        return { error: insertError };
      }
    }

    // Update the updated_at timestamp
    await supabase
      .from("shared_objectives")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", objectiveData.id);

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * List recently shared objectives (for discovery)
 */
export async function listRecentSharedObjectives(limit = 10): Promise<{
  data: SharedObjective[];
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from("shared_objectives")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err as Error };
  }
}
