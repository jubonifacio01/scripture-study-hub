export interface Character {
  id: string;
  name: string;
  description: string;
  /** Accent color for the illustration background */
  accent: string;
}

export const CHARACTERS: Character[] = [
  {
    id: "shepherd",
    name: "Jovem Pastor",
    description: "Cuida das ovelhas com dedicação e confiança.",
    accent: "#8B9A6B",
  },
  {
    id: "scribe",
    name: "Escriba",
    description: "Estuda e preserva as palavras com cuidado.",
    accent: "#6B7280",
  },
  {
    id: "traveler",
    name: "Viajante",
    description: "Percorre caminhos em busca de sabedoria.",
    accent: "#C89B3C",
  },
  {
    id: "fisherman",
    name: "Pescador",
    description: "Lança as redes com fé e paciência.",
    accent: "#4A7A8C",
  },
  {
    id: "artisan",
    name: "Artesã",
    description: "Cria com mãos hábeis e coração atento.",
    accent: "#A67B6B",
  },
];

const STORAGE_KEY = "memorize-character";

export function getSelectedCharacter(): string {
  if (typeof window === "undefined") return CHARACTERS[0].id;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && CHARACTERS.some((c) => c.id === saved)) return saved;
  return CHARACTERS[0].id;
}

export function setSelectedCharacter(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
}

export function getCharacterById(id: string): Character | undefined {
  return CHARACTERS.find((c) => c.id === id);
}
