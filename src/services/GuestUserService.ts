import { supabase } from "@/lib/supabaseClient";
import { getGuestId } from "@/lib/guestId";
import { getUserName } from "@/hooks/useAppMode";
import { getSelectedCharacter } from "@/data/characters";

let ensured = false;
let ensuring: Promise<void> | null = null;

/**
 * Ensures a row exists in the `users` table for the current guest UUID,
 * syncing display_name and selected_character from localStorage.
 * Runs only once per session — subsequent calls resolve immediately.
 */
export async function ensureGuestUser(): Promise<void> {
  if (ensured) return;
  if (ensuring) return ensuring;

  ensuring = (async () => {
    const guestId = getGuestId();
    const displayName = getUserName() ?? "Visitante";
    const character = getSelectedCharacter();

    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", guestId)
      .maybeSingle();

    if (error) {
      ensuring = null;
      throw error;
    }

    if (data) {
      await supabase
        .from("users")
        .update({ display_name: displayName, selected_character: character })
        .eq("id", guestId);
      ensured = true;
      ensuring = null;
      return;
    }

    const { error: insertError } = await supabase.from("users").insert({
      id: guestId,
      display_name: displayName,
      avatar: null,
      selected_character: character,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        ensured = true;
        ensuring = null;
        return;
      }
      ensuring = null;
      throw insertError;
    }

    ensured = true;
    ensuring = null;
  })();

  return ensuring;
}

export function resetGuestUserCheck(): void {
  ensured = false;
  ensuring = null;
}
