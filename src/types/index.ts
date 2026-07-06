export interface MemoryItem {
  id: string;
  title: string;
  book: string;
  chapter: number;
  verse: string;
  text: string;
  category: string;
  tags: string[];
}

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
