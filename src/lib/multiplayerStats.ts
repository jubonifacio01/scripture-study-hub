const KEY = "memorize-multiplayer-stats";

export interface MultiplayerStats {
  matchesPlayed: number;
  matchesWon: number;
  bestCombo: number;
  roomsHosted: number;
}

const EMPTY: MultiplayerStats = {
  matchesPlayed: 0,
  matchesWon: 0,
  bestCombo: 0,
  roomsHosted: 0,
};

function load(): MultiplayerStats {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Partial<MultiplayerStats>) };
  } catch {
    // ignore
  }
  return { ...EMPTY };
}

function save(stats: MultiplayerStats) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function getMultiplayerStats(): MultiplayerStats {
  return load();
}

export function recordMultiplayerResult(won: boolean, comboReached: number): MultiplayerStats {
  const stats = load();
  stats.matchesPlayed += 1;
  if (won) stats.matchesWon += 1;
  stats.bestCombo = Math.max(stats.bestCombo, comboReached);
  save(stats);
  return stats;
}

export function recordRoomHosted(): MultiplayerStats {
  const stats = load();
  stats.roomsHosted += 1;
  save(stats);
  return stats;
}
