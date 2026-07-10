import { supabase } from "@/lib/supabaseClient";
import { getGuestId } from "@/lib/guestId";

export interface SessionResult {
  objectiveId: string;
  correct: number;
  total: number;
  xpEarned: number;
  durationMs: number;
}

export interface ProgressStats {
  objectivesCount: number;
  totalTexts: number;
  sessionsCompleted: number;
  lastStudyDate: string | null;
  totalXP: number;
  accuracy: number;
}

/**
 * Upsert progress for a study session.
 * Creates the row if it doesn't exist, otherwise increments it.
 */
export async function saveSessionProgress(result: SessionResult): Promise<void> {
  if (!supabase) return;

  const userId = getGuestId();

  // Fetch existing row (if any)
  const { data: existing } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("objective_id", result.objectiveId)
    .maybeSingle();

  const accuracy =
    result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;

  if (existing) {
    const newTotal = existing.total_answers + result.total;
    const newCorrect = existing.correct_answers + result.correct;
    const newAccuracy = newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 0;
    const newXP = existing.xp + result.xpEarned;
    const newStreak =
      accuracy >= 70 ? (existing.current_streak ?? 0) + 1 : 0;

    await supabase
      .from("user_progress")
      .update({
        xp: newXP,
        accuracy: newAccuracy,
        total_answers: newTotal,
        correct_answers: newCorrect,
        current_streak: newStreak,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("user_progress").insert({
      user_id: userId,
      objective_id: result.objectiveId,
      xp: result.xpEarned,
      accuracy,
      total_answers: result.total,
      correct_answers: result.correct,
      current_streak: accuracy >= 70 ? 1 : 0,
    });
  }
}

/**
 * Load aggregate progress stats for the current guest.
 * Used by the home screen.
 */
export async function loadProgressStats(): Promise<ProgressStats> {
  if (!supabase) {
    return {
      objectivesCount: 0,
      totalTexts: 0,
      sessionsCompleted: 0,
      lastStudyDate: null,
      totalXP: 0,
      accuracy: 0,
    };
  }

  const userId = getGuestId();

  // All progress rows for this user
  const { data: progressRows } = await supabase
    .from("user_progress")
    .select("xp, accuracy, total_answers, correct_answers, updated_at, objective_id")
    .eq("user_id", userId);

  if (!progressRows || progressRows.length === 0) {
    // Still need objective/text counts even with no sessions
    const { data: objRows } = await supabase
      .from("objectives")
      .select("id")
      .eq("owner_id", userId);

    const objIds = (objRows ?? []).map((r: { id: string }) => r.id);
    let totalTexts = 0;
    if (objIds.length > 0) {
      const { count } = await supabase
        .from("memory_texts")
        .select("id", { count: "exact", head: true })
        .in("objective_id", objIds);
      totalTexts = count ?? 0;
    }

    return {
      objectivesCount: objIds.length,
      totalTexts,
      sessionsCompleted: 0,
      lastStudyDate: null,
      totalXP: 0,
      accuracy: 0,
    };
  }

  const totalXP = progressRows.reduce((s: number, r: { xp: number }) => s + r.xp, 0);
  const sessionsCompleted = progressRows.length;

  const totalAnswers = progressRows.reduce((s: number, r: { total_answers: number }) => s + r.total_answers, 0);
  const correctAnswers = progressRows.reduce((s: number, r: { correct_answers: number }) => s + r.correct_answers, 0);
  const accuracy =
    totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  const dates = progressRows
    .map((r: { updated_at: string }) => r.updated_at)
    .filter(Boolean)
    .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
  const lastStudyDate = dates[0] ?? null;

  // Objective + text counts
  const { data: objRows } = await supabase
    .from("objectives")
    .select("id")
    .eq("owner_id", userId);

  const objIds = (objRows ?? []).map((r: { id: string }) => r.id);
  let totalTexts = 0;
  if (objIds.length > 0) {
    const { count } = await supabase
      .from("memory_texts")
      .select("id", { count: "exact", head: true })
      .in("objective_id", objIds);
    totalTexts = count ?? 0;
  }

  return {
    objectivesCount: objIds.length,
    totalTexts,
    sessionsCompleted,
    lastStudyDate,
    totalXP,
    accuracy,
  };
}
