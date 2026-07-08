import { CharacterPortrait } from "@/components/CharacterPortrait";
import { getSelectedCharacter, getCharacterById, CHARACTERS } from "@/data/characters";
import { MemorizeMark } from "@/components/MemorizeMark";

interface AvatarProps {
  name?: string;
  seed?: string;
  size?: number;
  className?: string;
}

export function Avatar({ size = 64, className = "" }: AvatarProps) {
  const charId = getSelectedCharacter();
  const character = getCharacterById(charId) ?? CHARACTERS[0];

  return (
    <div
      className={"grid shrink-0 place-items-center rounded-full bg-muted " + className}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <CharacterPortrait character={character} size={size} />
    </div>
  );
}

export function AvatarFallback({ size = 64, className = "" }: AvatarProps) {
  return (
    <div
      className={
        "grid shrink-0 place-items-center rounded-full bg-muted text-foreground " + className
      }
      style={{ width: size, height: size }}
      aria-hidden
    >
      <MemorizeMark size={Math.round(size * 0.5)} strokeWidth={1.5} />
    </div>
  );
}
