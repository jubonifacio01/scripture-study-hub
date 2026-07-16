import type { UserProfile } from "@/types";

export const demoUser: UserProfile = {
  name: "Peregrino",
  avatarSeed: "memorize-plus",
  level: 4,
  xp: 320,
  xpToNext: 500,
  streak: 7,
  itemsStudied: 24,
  accuracy: 87,
  reviewToday: 5,
};

export const dailyGoal = {
  target: 20,
  completed: 12,
  unit: "min",
};

export const continueStudying = {
  collectionId: "essenciais",
  itemId: "jo-3-16",
  reference: "João 3:16",
  progress: 60,
};
