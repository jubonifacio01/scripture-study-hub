import { useState, useEffect, useCallback } from "react";
import { loadProgressStats, type ProgressStats } from "@/services/ProgressService";
import { getUserXP, calculateLevel, getTodayXP } from "@/hooks/useXPTracking";

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
  const totalXP = remote.totalXP > 0 ? remote.totalXP : getUserXP();
  const { level, xpToNext, currentLevelXP } = calculateLevel(totalXP);
  const todayXP = getTodayXP();
  const streak = remote.lastStudyDate ? calculateStreak([remote.lastStudyDate]) : 0;

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

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const unique = [
    ...new Set(dates.map((d) => new Date(d).toDateString())),
  ];
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (!unique.includes(today) && !unique.includes(yesterday)) return 0;
  return unique.includes(today) && unique.includes(yesterday) ? 2 : 1;
}

// Shared refresh trigger so play.tsx can invalidate stats after a session
let refreshCallback: (() => void) | null = null;

export function invalidateUserStats() {
  refreshCallback?.();
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
    refreshCallback = refresh;
    return () => {
      if (refreshCallback === refresh) refreshCallback = null;
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

export function getAppSubtitle(
  mode: "study" | "journey",
  stats: UserStats,
): string {
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
      const diffDays = Math.floor(
        (Date.now() - new Date(lastStudyDate).getTime()) / 86400000,
      );
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
