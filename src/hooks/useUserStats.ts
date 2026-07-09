import { useMemo } from "react";
import { loadObjectives, loadCustomItems } from "@/data/objectives";
import { getJourneyProgress, type JourneyProgress } from "@/data/journeys";
import { memoryItems } from "@/data/memoryItems";
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

export function useUserStats(): UserStats {
  return useMemo(() => {
    if (typeof window === "undefined") {
      return {
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
    }

    const objectives = loadObjectives();
    const customItems = loadCustomItems();

    // Count total texts (unique across all objectives)
    const allItemIds = new Set(objectives.flatMap((o) => o.itemIds));
    const totalTexts = allItemIds.size;

    // Calculate studied texts (have reviewCount > 0)
    const allItems = [...memoryItems, ...customItems];
    const studiedTexts = allItemIds.size > 0
      ? Array.from(allItemIds).filter((id) => {
          const item = allItems.find((i) => i.id === id);
          return item && (item.reviewCount ?? 0) > 0;
        }).length
      : 0;

    // Count completed journey sessions
    const journeyProgress = getJourneyProgressRaw();
    const sessionsCompleted = Object.values(journeyProgress).reduce(
      (sum, p) => sum + p.completedSessions.length,
      0
    );

    // Count total game sessions from XP tracking
    const sessionsHistory = getSessionsHistory();
    const totalGameSessions = sessionsHistory.length;

    // Find the most recent study date
    const objectiveDates = objectives
      .map((o) => o.lastStudiedAt)
      .filter(Boolean) as string[];
    const journeyDates = Object.values(journeyProgress)
      .map((p) => p.lastActivity)
      .filter(Boolean) as string[];
    const sessionDates = sessionsHistory.map((s) => s.date);
    const allDates = [...objectiveDates, ...journeyDates, ...sessionDates].sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    );
    const lastStudyDate = allDates[0] ?? null;

    // Calculate streak from last study dates
    const streak = calculateStreak(allDates);

    // Calculate accuracy from items that have been reviewed
    const reviewedItems = allItems.filter((i) => (i.reviewCount ?? 0) > 0);
    const accuracy = reviewedItems.length > 0
      ? Math.round(
          reviewedItems.reduce((sum, i) => sum + (i.mastery ?? 0), 0) /
            reviewedItems.length
        )
      : 0;

    // XP and level calculation
    const totalXP = getUserXP();
    const { level, xpToNext, currentLevelXP } = calculateLevel(totalXP);
    const todayXP = getTodayXP();

    return {
      totalTexts,
      studiedTexts,
      sessionsCompleted: sessionsCompleted + totalGameSessions,
      lastStudyDate,
      streak,
      accuracy,
      objectivesCount: objectives.length,
      totalXP,
      level,
      xpToNext,
      currentLevelXP,
      todayXP,
    };
  }, []);
}

function getJourneyProgressRaw(): JourneyProgress {
  try {
    const raw = window.localStorage.getItem("memorize-journey-progress");
    if (raw) return JSON.parse(raw) as JourneyProgress;
  } catch {
    // ignore
  }
  return {};
}

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = dates
    .map((d) => new Date(d).toDateString())
    .filter(Boolean);
  const uniqueDates = [...new Set(sortedDates)];

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
    return 0;
  }

  return uniqueDates.includes(today) ? (uniqueDates.includes(yesterday) ? 2 : 1) : 1;
}

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function getAppSubtitle(
  mode: "study" | "journey",
  stats: UserStats
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
      const lastDate = new Date(lastStudyDate);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / 86400000);

      if (diffDays === 0) {
        return "Você já estudou hoje. Continue assim.";
      }
      if (diffDays === 1) {
        return "Você estudou ontem. Vamos continuar?";
      }
    }

    return "Um pequeno passo hoje.";
  } else {
    if (sessionsCompleted === 0) {
      return "Sua jornada aguarda.";
    }

    return `Você completou ${sessionsCompleted} sess${sessionsCompleted > 1 ? "ões" : "ão"} de jornada.`;
  }
}

export function formatLastStudyDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? "s" : ""}`;
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}
