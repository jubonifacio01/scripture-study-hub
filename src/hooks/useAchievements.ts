import { useEffect, useMemo, useState } from "react";
import { useUserStats } from "@/hooks/useUserStats";
import { getSessionsHistory, type SessionRecord } from "@/hooks/useXPTracking";
import { getMultiplayerStats } from "@/lib/multiplayerStats";
import { ACHIEVEMENTS, type Achievement, type AchievementInput } from "@/data/achievements";

const UNLOCKED_KEY = "memorize-achievements-unlocked";

function loadUnlockedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(UNLOCKED_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {
    // ignore
  }
  return [];
}

function saveUnlockedIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(UNLOCKED_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

function perfectSessionStreak(history: SessionRecord[]): number {
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const s = history[i];
    if (s.total >= 5 && s.correct === s.total) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function studiedAtNight(history: SessionRecord[]): boolean {
  return history.some((s) => {
    if (!s.completedAt) return false;
    const hour = new Date(s.completedAt).getHours();
    return hour >= 0 && hour < 5;
  });
}

function studiedBothWeekendDays(history: SessionRecord[]): boolean {
  const days = new Set(history.map((s) => new Date(s.date).toDateString()));
  for (const d of days) {
    const dt = new Date(d);
    if (dt.getDay() === 6) {
      const sunday = new Date(dt.getTime() + 86_400_000).toDateString();
      if (days.has(sunday)) return true;
    }
  }
  return false;
}

function buildInput(
  stats: ReturnType<typeof useUserStats>,
  history: SessionRecord[],
  mp: ReturnType<typeof getMultiplayerStats>,
): AchievementInput {
  const totalCorrect = history.reduce((sum, s) => sum + s.correct, 0);
  const distinctJourneys = new Set(history.filter((s) => s.journeyId).map((s) => s.journeyId)).size;
  const bestComboSolo = Math.max(0, ...history.map((s) => s.comboMax ?? 0));

  return {
    streak: stats.streak,
    totalXP: stats.totalXP,
    level: stats.level,
    totalCorrect,
    hasPerfectSession: history.some((s) => s.total >= 5 && s.correct === s.total),
    perfectSessionStreak: perfectSessionStreak(history),
    distinctJourneys,
    bestCombo: Math.max(bestComboSolo, mp.bestCombo),
    matchesPlayed: mp.matchesPlayed,
    matchesWon: mp.matchesWon,
    roomsHosted: mp.roomsHosted,
    hasMasteredObjective: history.some(
      (s) => s.objectiveId && s.total >= 5 && s.correct / s.total >= 0.9,
    ),
    studiedAtNight: studiedAtNight(history),
    studiedBothWeekendDays: studiedBothWeekendDays(history),
  };
}

export interface AchievementWithStatus extends Achievement {
  unlocked: boolean;
}

export function useAchievements() {
  const stats = useUserStats();
  const [justUnlocked, setJustUnlocked] = useState<Achievement[]>([]);
  const [storageVersion, setStorageVersion] = useState(0);

  // These read from localStorage rather than from `stats` directly, but we want them
  // to re-run whenever `stats` changes (i.e. whenever invalidateUserStats() fires after
  // a session), since that's the same moment new session/match data was written.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const history = useMemo(() => getSessionsHistory(), [stats]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mpStats = useMemo(() => getMultiplayerStats(), [stats]);
  const input = useMemo(() => buildInput(stats, history, mpStats), [stats, history, mpStats]);

  const computedUnlockedIds = useMemo(
    () => new Set(ACHIEVEMENTS.filter((a) => a.isUnlocked(input)).map((a) => a.id)),
    [input],
  );

  useEffect(() => {
    const persisted = new Set(loadUnlockedIds());
    const newlyUnlocked: Achievement[] = [];
    for (const a of ACHIEVEMENTS) {
      if (computedUnlockedIds.has(a.id) && !persisted.has(a.id)) {
        persisted.add(a.id);
        newlyUnlocked.push(a);
      }
    }
    if (newlyUnlocked.length > 0) {
      saveUnlockedIds([...persisted]);
      setJustUnlocked((prev) => [...prev, ...newlyUnlocked]);
      setStorageVersion((v) => v + 1);
    }
  }, [computedUnlockedIds]);

  // Achievements never re-lock even if a live stat like streak drops back to 0,
  // so the visible "unlocked" set is the union of everything ever persisted
  // plus whatever is true right now.
  const unlockedIds = useMemo(() => {
    const ids = new Set(loadUnlockedIds());
    for (const id of computedUnlockedIds) ids.add(id);
    return ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedUnlockedIds, storageVersion]);

  const achievements: AchievementWithStatus[] = ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: unlockedIds.has(a.id),
  }));

  const unlockedCompanionIds = useMemo(
    () =>
      new Set(
        achievements
          .filter((a) => a.unlocked && a.reward?.type === "companion")
          .map((a) => a.reward!.companionId),
      ),
    [achievements],
  );

  const dismissJustUnlocked = (id: string) => {
    setJustUnlocked((prev) => prev.filter((a) => a.id !== id));
  };

  return { achievements, unlockedCompanionIds, justUnlocked, dismissJustUnlocked };
}
