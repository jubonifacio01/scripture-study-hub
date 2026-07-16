export interface Companion {
  id: string;
  characterId: string;
  name: string;
}

/**
 * Companions never speak, encourage, praise, or teach — they have no text
 * of their own. Each one's personality is expressed entirely through the
 * distinct idle/reaction motion assigned to its id in styles.css and
 * rendered by CompanionPortrait.
 */
export const COMPANIONS: Companion[] = [
  {
    id: "sheep",
    characterId: "shepherd",
    name: "Cordeirinho",
  },
  {
    id: "owl",
    characterId: "scribe",
    name: "Coruja Sábia",
  },
  {
    id: "donkey",
    characterId: "traveler",
    name: "Burrico Fiel",
  },
  {
    id: "fish",
    characterId: "fisherman",
    name: "Peixinho Dourado",
  },
  {
    id: "vase",
    characterId: "artisan",
    name: "Vaso Decorado",
  },
];

export function getCompanionForCharacter(characterId: string): Companion | undefined {
  return COMPANIONS.find((c) => c.characterId === characterId);
}

export function getCompanionById(id: string): Companion | undefined {
  return COMPANIONS.find((c) => c.id === id);
}
