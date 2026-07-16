import type { MemoryItem } from "@/types";

export interface JourneySession {
  id: string;
  title: string;
  /** Intro text shown before the reading */
  intro: string;
  /** The biblical texts for this session */
  texts: MemoryItem[];
  /** Summary shown on the conclusion screen */
  characters: string[];
  events: string[];
  references: string[];
  memorized: string;
}

export interface JourneyChapter {
  id: string;
  title: string;
  sessions: JourneySession[];
}

export interface Journey {
  id: string;
  title: string;
  description: string;
  /** Accent color for the cover illustration */
  accent: string;
  chapters: JourneyChapter[];
}

const PROGRESS_KEY = "memorize-journey-progress";

export type JourneyProgress = Record<
  string,
  {
    /** Set of completed session IDs */
    completedSessions: string[];
    /** ISO date of last activity */
    lastActivity?: string;
  }
>;

function loadProgress(): JourneyProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw) as JourneyProgress;
  } catch {
    // ignore
  }
  return {};
}

function saveProgress(progress: JourneyProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function getJourneyProgress(journeyId: string): {
  completedSessions: string[];
  lastActivity?: string;
} {
  const all = loadProgress();
  return all[journeyId] ?? { completedSessions: [] };
}

export function markSessionComplete(journeyId: string, sessionId: string) {
  const all = loadProgress();
  const current = all[journeyId] ?? { completedSessions: [] };
  if (!current.completedSessions.includes(sessionId)) {
    current.completedSessions = [...current.completedSessions, sessionId];
  }
  current.lastActivity = new Date().toISOString();
  all[journeyId] = current;
  saveProgress(all);
}

export function getJourneyStats(journey: Journey, journeyId: string) {
  const progress = getJourneyProgress(journeyId);
  const allSessions = journey.chapters.flatMap((c) => c.sessions);
  const totalSessions = allSessions.length;
  const completedCount = allSessions.filter((s) =>
    progress.completedSessions.includes(s.id),
  ).length;
  const totalChapters = journey.chapters.length;
  const completedChapters = journey.chapters.filter((chapter) =>
    chapter.sessions.every((s) => progress.completedSessions.includes(s.id)),
  ).length;
  const pct = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;
  return {
    totalSessions,
    completedSessions: completedCount,
    totalChapters,
    completedChapters,
    pct,
    lastActivity: progress.lastActivity,
  };
}

export function getChapterStats(
  chapter: JourneyChapter,
  journeyId: string,
): {
  totalSessions: number;
  completedSessions: number;
  pct: number;
  isComplete: boolean;
} {
  const progress = getJourneyProgress(journeyId);
  const total = chapter.sessions.length;
  const completed = chapter.sessions.filter((s) =>
    progress.completedSessions.includes(s.id),
  ).length;
  return {
    totalSessions: total,
    completedSessions: completed,
    pct: total > 0 ? Math.round((completed / total) * 100) : 0,
    isComplete: total > 0 && completed === total,
  };
}

export function getLastActiveSession(
  journey: Journey,
  journeyId: string,
): { chapter: JourneyChapter; session: JourneySession; sessionIndex: number } | null {
  const progress = getJourneyProgress(journeyId);
  const allSessions = journey.chapters.flatMap((c) =>
    c.sessions.map((s, i) => ({ chapter: c, session: s, sessionIndex: i })),
  );
  // Find first incomplete session
  const next = allSessions.find(({ session }) => !progress.completedSessions.includes(session.id));
  if (next) return next;
  // All complete — return last session
  return allSessions.length > 0 ? allSessions[allSessions.length - 1] : null;
}

export function formatJourneyLastActivity(iso: string | undefined): string {
  if (!iso) return "Sem atividade";
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `Há ${diffDays} dias`;
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}
