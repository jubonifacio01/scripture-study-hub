import type { RoomPlayer, RankingEntry } from "@/types";

export function buildRanking(players: RoomPlayer[]): RankingEntry[] {
  return [...players]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.time_ms - b.time_ms;
    })
    .map((p) => ({
      playerId: p.id,
      displayName: p.display_name,
      score: p.score,
      correct: p.correct,
      timeMs: p.time_ms,
      combo: p.combo,
      done: p.done,
      character: p.character,
      avatar: p.avatar,
      isHost: p.is_host,
    }));
}

export function calculateScore(
  correct: boolean,
  elapsedMs: number,
  secondsPerQuestion: number,
  combo: number,
): number {
  if (!correct) return 0;
  const base = 100;
  const timeBonus = Math.max(0, Math.round((secondsPerQuestion * 1000 - elapsedMs) / 20));
  const comboBonus = combo * 10;
  return base + timeBonus + comboBonus;
}

export function calculateXP(correct: number, total: number, score: number): number {
  const baseXP = correct * 15;
  const bonusXP = Math.round(score / 10);
  return baseXP + bonusXP;
}
