import { supabase } from "@/lib/supabaseClient";
import { getGuestId } from "@/lib/guestId";
import type { Match, SharedQuestion, MemoryItem, GameType, MultiplayerDifficulty } from "@/types";
import { shuffle } from "@/games/gameUtils";
import type { ServiceResult } from "./RoomService";

export async function createMatch(roomId: string): Promise<ServiceResult<Match>> {
  const { data, error } = await supabase
    .from("matches")
    .insert({ room_id: roomId, started_at: new Date().toISOString() })
    .select("*")
    .single();

  if (error || !data) return { data: null, error: error?.message ?? "Erro ao criar partida." };
  return { data: data as Match, error: null };
}

export async function finishMatch(matchId: string): Promise<ServiceResult<void>> {
  const { error } = await supabase
    .from("matches")
    .update({ finished_at: new Date().toISOString() })
    .eq("id", matchId);
  if (error) return { data: null, error: error.message };
  return { data: undefined, error: null };
}

function difficultyToGameType(difficulty: MultiplayerDifficulty): GameType {
  switch (difficulty) {
    case "facil":
      return "multiple-choice";
    case "medio":
      return "fill-blank";
    case "dificil":
      return "order-words";
    case "aleatorio": {
      const types: GameType[] = ["multiple-choice", "fill-blank", "order-words"];
      return types[Math.floor(Math.random() * types.length)];
    }
  }
}

export function buildQuestions(
  items: MemoryItem[],
  bank: MemoryItem[],
  count: number,
  difficulty: MultiplayerDifficulty,
): SharedQuestion[] {
  const chosen = shuffle(items).slice(0, Math.min(count, items.length));

  return chosen.map((it, idx) => {
    const gameType = difficultyToGameType(difficulty);

    if (gameType === "multiple-choice") {
      const distractors = shuffle(bank.filter((b) => b.id !== it.id)).slice(0, 3);
      const options = shuffle([it, ...distractors]).map((o, i) => ({
        id: `${idx}-${i}`,
        label: `${o.book} ${o.chapter}:${o.verse}`,
        _origId: o.id,
      }));
      const correctOptionId = options.find((o) => o._origId === it.id)!.id;
      return {
        itemId: it.id,
        text: it.text,
        correctOptionId,
        options: options.map(({ id, label }) => ({ id, label })),
        gameType,
      };
    }

    if (gameType === "fill-blank") {
      const tokens = it.text.split(/\s+/).filter(Boolean);
      const eligible = tokens
        .map((t, i) => ({ t: t.replace(/[.,;!?]/g, ""), i }))
        .filter((x) => x.t.length >= 4);
      const blankIdx =
        eligible.length > 0
          ? eligible[Math.floor(Math.random() * eligible.length)].i
          : Math.floor(tokens.length / 2);
      const blankAnswer = tokens[blankIdx].replace(/[.,;!?]/g, "");
      const otherWords = shuffle([
        ...new Set(
          bank.flatMap((b) =>
            b.text
              .split(/\s+/)
              .map((w) => w.replace(/[.,;!?]/g, ""))
              .filter((w) => w.length >= 4 && w.toLowerCase() !== blankAnswer.toLowerCase()),
          ),
        ),
      ]).slice(0, 3);
      const options = shuffle([blankAnswer, ...otherWords]).map((w, i) => ({
        id: `${idx}-${i}`,
        label: w,
      }));
      const correctOptionId = options.find((o) => o.label === blankAnswer)!.id;
      return {
        itemId: it.id,
        text: it.text,
        correctOptionId,
        options: options.map(({ id, label }) => ({ id, label })),
        gameType,
        blankAnswer,
      };
    }

    // order-words
    const wordOrder = shuffle(it.text.split(/\s+/).filter(Boolean).slice(0, 8));
    return {
      itemId: it.id,
      text: it.text,
      correctOptionId: it.text,
      options: [],
      gameType,
      wordOrder,
    };
  });
}

export async function saveMatchProgress(
  objectiveId: string,
  correct: number,
  total: number,
  xpEarned: number,
  durationMs: number,
): Promise<void> {
  const userId = getGuestId();

  const { data: existing } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("objective_id", objectiveId)
    .maybeSingle();

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  if (existing) {
    const newTotal = existing.total_answers + total;
    const newCorrect = existing.correct_answers + correct;
    const newAccuracy = newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 0;
    const newXP = existing.xp + xpEarned;
    const newStreak = accuracy >= 70 ? (existing.current_streak ?? 0) + 1 : 0;

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
      objective_id: objectiveId,
      xp: xpEarned,
      accuracy,
      total_answers: total,
      correct_answers: correct,
      current_streak: accuracy >= 70 ? 1 : 0,
    });
  }
}
