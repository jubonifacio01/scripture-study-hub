export interface MemoryItem {
  id: string;
  title: string;
  book: string;
  chapter: number;
  verse: string;
  text: string;
  category: string;
  tags: string[];
  /** ISO date string */
  createdAt?: string;
  /** ISO date string */
  lastReviewedAt?: string;
  /** Number of times this text has been reviewed */
  reviewCount?: number;
  /** Mastery level 0–100 */
  mastery?: number;
}

/**
 * An Objective represents what the user wants to learn.
 * It groups together biblical texts and tracks progress.
 */
export interface Objective {
  id: string;
  name: string;
  description?: string;
  /** IDs of MemoryItems belonging to this objective */
  itemIds: string[];
  /** ISO date string of last study activity */
  lastStudiedAt?: string;
  /** ISO date string of creation */
  createdAt: string;
}

/**
 * Legacy Collection type — kept for backward compatibility.
 * @deprecated Use Objective instead.
 */
export interface Collection {
  id: string;
  name: string;
  description: string;
  emoji: string;
  itemIds: string[];
  color: "primary" | "accent" | "success" | "fun" | "warning";
}

export interface UserProfile {
  name: string;
  avatarSeed: string;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  itemsStudied: number;
  accuracy: number;
  reviewToday: number;
}

export type Difficulty = "facil" | "medio" | "dificil" | "aleatorio";

export type GameType = "fill-blank" | "multiple-choice" | "order-words";

export interface GameConfig {
  collectionId: string;
  difficulty: Difficulty;
  questionCount: number;
}

export interface GameResult {
  correct: number;
  total: number;
  xpEarned: number;
}

// ─── Multiplayer Types ──────────────────────────────────────────────────────

export type RoomStatus = "waiting" | "playing" | "finished";
export type MultiplayerDifficulty = "facil" | "medio" | "dificil" | "aleatorio";

export interface RoomPlayer {
  id: string;
  room_id: string;
  player_id: string | null;
  display_name: string;
  is_host: boolean;
  connected: boolean;
  ready: boolean;
  joined_at: string;
  score: number;
  correct: number;
  time_ms: number;
  combo: number;
  done: boolean;
  character: string | null;
  avatar: string | null;
}

export interface Room {
  id: string;
  code: string;
  host_id: string | null;
  status: RoomStatus;
  selected_objective: string | null;
  difficulty: MultiplayerDifficulty | null;
  question_count: number | null;
  created_at: string;
}

export interface Match {
  id: string;
  room_id: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface Answer {
  id: string;
  match_id: string;
  player_id: string | null;
  question_id: string;
  answer: string;
  correct: boolean;
  response_time: number | null;
  created_at: string;
}

export interface SharedQuestion {
  itemId: string;
  text: string;
  correctOptionId: string;
  options: { id: string; label: string }[];
  gameType: GameType;
  blankAnswer?: string;
  wordOrder?: string[];
}

export interface RoomConfig {
  objectiveId: string;
  objectiveName: string;
  questionCount: number;
  difficulty: MultiplayerDifficulty;
}

export interface RankingEntry {
  playerId: string;
  displayName: string;
  score: number;
  correct: number;
  timeMs: number;
  combo: number;
  done: boolean;
  character: string | null;
  avatar: string | null;
  isHost: boolean;
}
