import { useState, useEffect, useCallback } from "react";
import { loadProgressStats, type ProgressStats } from "@/services/ProgressService";
import { getUserXP, calculateLevel, getTodayXP, getSessionsHistory } from "@/hooks/useXPTracking";

export interface UserStats {
  totalTexts: number;
  studiedTexts: number;
  sessionsCompleted: number;
  lastStudyDate: string | null;
  streak: number;
  accuracy: number;
  objectivesCount: number;
  totalXP: number;
  level: number;
  xpToNext: number;
  currentLevelXP: number;
  todayXP: number;
}

const DEFAULT_STATS: UserStats = {
  totalTexts: 0,
  studiedTexts: 0,
  sessionsCompleted: 0,
  lastStudyDate: null,
  streak: 0,
  accuracy: 0,
  objectivesCount: 0,
  totalXP: 0,
  level: 1,
  xpToNext: 100,
  currentLevelXP: 0,
  todayXP: 0,
};

function buildStats(remote: ProgressStats): UserStats {
  const localHistory = getSessionsHistory();

  // Journey sessions are only ever recorded locally (there is no Supabase table for
  // journey progress yet — see play.tsx's onJourneyAnswer), so their XP must be added
  // on top of the remote total. Without this, journey XP silently disappeared the
  // moment the user also had at least one objective session saved remotely, because
  // `remote.totalXP > 0` made the code ignore local data entirely.
  const journeyXP = localHistory.filter((s) => s.journeyId).reduce((sum, s) => sum + s.xpEarned, 0);

  const totalXP = remote.totalXP > 0 ? remote.totalXP + journeyXP : getUserXP();
  const { level, xpToNext, currentLevelXP } = calculateLevel(totalXP);
  const todayXP = getTodayXP();
  const streak = calculateStreak(localHistory.map((s) => s.date));

  return {
    totalTexts: remote.totalTexts,
    studiedTexts: remote.sessionsCompleted > 0 ? remote.totalTexts : 0,
    sessionsCompleted: remote.sessionsCompleted,
    lastStudyDate: remote.lastStudyDate,
    streak,
    accuracy: remote.accuracy,
    objectivesCount: remote.objectivesCount,
    totalXP,
    level,
    xpToNext,
    currentLevelXP,
    todayXP,
  };
}

/**
 * Counts consecutive study days ending today or yesterday (a streak is still
 * considered "alive" for the current day until the user misses a full day).
 * Takes the *entire* history of study dates rather than a single date, since a
 * single-date input can never represent more than one day of streak.
 */
function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const oneDayMs = 86_400_000;
  const toDayStart = (d: string) => new Date(new Date(d).toDateString()).getTime();

  const uniqueDays = [...new Set(dates.map(toDayStart))].sort((a, b) => b - a);

  const todayStart = new Date(new Date().toDateString()).getTime();
  const yesterdayStart = todayStart - oneDayMs;

  if (uniqueDays[0] !== todayStart && uniqueDays[0] !== yesterdayStart) return 0;

  let streak = 1;
  for (let i = 0; i < uniqueDays.length - 1; i++) {
    if (uniqueDays[i] - uniqueDays[i + 1] === oneDayMs) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Shared refresh trigger so play.tsx can invalidate stats after a session.
// Multiple components may call useUserStats() at once (e.g. a page and the
// achievements provider wrapping it), so every mounted instance subscribes here.
const refreshCallbacks = new Set<() => void>();

export function invalidateUserStats() {
  for (const cb of refreshCallbacks) cb();
}

export function useUserStats(): UserStats {
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);

  const refresh = useCallback(async () => {
    try {
      const remote = await loadProgressStats();
      setStats(buildStats(remote));
    } catch {
      // keep previous stats on error
    }
  }, []);

  useEffect(() => {
    void refresh();
    refreshCallbacks.add(refresh);
    return () => {
      refreshCallbacks.delete(refresh);
    };
  }, [refresh]);

  return stats;
}

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function getAppSubtitle(mode: "study" | "journey", stats: UserStats): string {
  const { totalTexts, studiedTexts, sessionsCompleted, lastStudyDate, objectivesCount } = stats;

  if (mode === "study") {
    const textsToReview = totalTexts - studiedTexts;

    if (objectivesCount === 0) {
      return "Comece sua jornada de memorização.";
    }

    if (textsToReview > 0) {
      return `Hoje você possui ${textsToReview} texto${textsToReview > 1 ? "s" : ""} para revisar.`;
    }

    if (lastStudyDate) {
      const diffDays = Math.floor((Date.now() - new Date(lastStudyDate).getTime()) / 86400000);
      if (diffDays === 0) return "Você já estudou hoje. Continue assim.";
      if (diffDays === 1) return "Você estudou ontem. Vamos continuar?";
    }

    return "Um pequeno passo hoje.";
  } else {
    if (sessionsCompleted === 0) return "Sua jornada aguarda.";
    return `Você completou ${sessionsCompleted} sess${sessionsCompleted > 1 ? "ões" : "ão"} de jornada.`;
  }
}

export function formatLastStudyDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30)
    return `Há ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? "s" : ""}`;
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}
