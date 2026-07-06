import type { Collection } from "@/types";

export const collections: Collection[] = [
  {
    id: "essenciais",
    name: "Essenciais da Fé",
    description: "Versículos fundamentais para começar sua jornada.",
    emoji: "✨",
    itemIds: ["jo-3-16", "sl-23-1", "fp-4-13", "rm-8-28"],
    color: "primary",
  },
  {
    id: "coragem",
    name: "Coragem & Força",
    description: "Palavras para os dias difíceis.",
    emoji: "🦁",
    itemIds: ["fp-4-13", "is-40-31", "js-1-9"],
    color: "fun",
  },
  {
    id: "sabedoria",
    name: "Sabedoria Diária",
    description: "Direção para escolhas importantes.",
    emoji: "🧭",
    itemIds: ["pv-3-5", "mt-6-33"],
    color: "accent",
  },
  {
    id: "esperanca",
    name: "Esperança",
    description: "Para renovar o coração.",
    emoji: "🌅",
    itemIds: ["is-40-31", "rm-8-28", "sl-23-1"],
    color: "success",
  },
];

export const getCollectionById = (id: string) => collections.find((c) => c.id === id);
