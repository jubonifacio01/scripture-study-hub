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

export type Difficulty = "facil" | "medio" | "dificil";

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
