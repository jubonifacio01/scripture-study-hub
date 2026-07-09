const XP_KEY = "memorize-user-xp";
const SESSIONS_KEY = "memorize-sessions-history";

export interface UserXPData {
  totalXP: number;
  sessionsHistory: SessionRecord[];
}

export interface SessionRecord {
  date: string; // ISO date YYYY-MM-DD
  xpEarned: number;
  correct: number;
  total: number;
  objectiveId?: string;
  journeyId?: string;
}

function loadXPData(): UserXPData {
  if (typeof window === "undefined") {
    return { totalXP: 0, sessionsHistory: [] };
  }
  try {
    const raw = window.localStorage.getItem(XP_KEY);
    if (raw) return JSON.parse(raw) as UserXPData;
  } catch {
    // ignore
  }
  return { totalXP: 0, sessionsHistory: [] };
}

function saveXPData(data: UserXPData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(XP_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function recordSessionXP(
  xpEarned: number,
  correct: number,
  total: number,
  objectiveId?: string,
  journeyId?: string
): UserXPData {
  const data = loadXPData();
  const today = new Date().toISOString().split("T")[0];

  const session: SessionRecord = {
    date: today,
    xpEarned,
    correct,
    total,
    objectiveId,
    journeyId,
  };

  data.totalXP += xpEarned;
  data.sessionsHistory.push(session);

  saveXPData(data);
  return data;
}

export function getUserXP(): number {
  return loadXPData().totalXP;
}

export function calculateLevel(xp: number): { level: number; xpToNext: number; currentLevelXP: number } {
  // Level progression: each level requires more XP
  // Level 1: 0-100 XP, Level 2: 100-250 XP, Level 3: 250-450 XP, etc.
  // Formula: level N requires N*100 + (N-1)*50 cumulative XP = N*150 - 50
  // Simplified: each level needs level * 100 + (level-1) * 50 = level * 150 - 50

  let level = 1;
  let xpForLevel = 100; // XP needed for level 1->2
  let cumulativeXP = 0;

  while (cumulativeXP + xpForLevel <= xp) {
    cumulativeXP += xpForLevel;
    level++;
    xpForLevel = level * 100 + (level - 1) * 50;
  }

  const currentLevelXP = xp - cumulativeXP;
  const xpToNext = xpForLevel - currentLevelXP;

  return { level, xpToNext, currentLevelXP };
}

export function getTodayXP(): number {
  const data = loadXPData();
  const today = new Date().toISOString().split("T")[0];
  return data.sessionsHistory
    .filter((s) => s.date === today)
    .reduce((sum, s) => sum + s.xpEarned, 0);
}

export function getSessionsHistory(): SessionRecord[] {
  return loadXPData().sessionsHistory;
}
