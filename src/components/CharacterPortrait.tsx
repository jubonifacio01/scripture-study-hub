import type { Character } from "@/data/characters";

interface CharacterPortraitProps {
  character: Character;
  size?: number;
  className?: string;
}

/**
 * Minimalist editorial illustration of a biblical-era person.
 * Simple shapes, few colors, elegant — not cartoonish.
 * Each character variant uses the same base figure with
 * subtle differences in headwear and accessory.
 */
export function CharacterPortrait({
  character,
  size = 80,
  className = "",
}: CharacterPortraitProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden
    >
      {/* Background circle */}
      <circle cx="60" cy="60" r="60" fill={character.accent} fillOpacity="0.12" />

      {/* Robe / tunic — shared base */}
      <path
        d="M38 118 C 38 96, 42 88, 60 88 C 78 88, 82 96, 82 118 Z"
        fill={character.accent}
        fillOpacity="0.18"
        stroke={character.accent}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Neck */}
      <path
        d="M54 88 L 54 80 L 66 80 L 66 88"
        fill="none"
        stroke={character.accent}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Head — shared */}
      <circle cx="60" cy="64" r="14" fill="none" stroke={character.accent} strokeWidth="1.5" />

      {/* Character-specific headwear / accessory */}
      {character.id === "shepherd" && (
        <>
          {/* Head wrap */}
          <path
            d="M46 60 C 46 50, 50 46, 60 46 C 70 46, 74 50, 74 60 L 74 62 L 46 62 Z"
            fill={character.accent}
            fillOpacity="0.25"
            stroke={character.accent}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Staff */}
          <path
            d="M88 118 L 88 52 C 88 48, 84 46, 82 48"
            fill="none"
            stroke={character.accent}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}

      {character.id === "scribe" && (
        <>
          {/* Cap */}
          <path
            d="M48 54 C 48 46, 52 42, 60 42 C 68 42, 72 46, 72 54 L 72 56 L 48 56 Z"
            fill={character.accent}
            fillOpacity="0.3"
            stroke={character.accent}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Scroll in hand */}
          <path
            d="M84 100 C 84 96, 86 94, 90 94 L 94 94 C 96 94, 96 98, 94 98 L 90 98 C 88 98, 88 102, 90 102 L 94 102"
            fill="none"
            stroke={character.accent}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}

      {character.id === "traveler" && (
        <>
          {/* Hood */}
          <path
            d="M44 62 C 42 48, 48 40, 60 40 C 72 40, 78 48, 76 62 L 76 66 L 44 66 Z"
            fill={character.accent}
            fillOpacity="0.22"
            stroke={character.accent}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Satchel strap */}
          <path
            d="M52 90 L 72 96"
            fill="none"
            stroke={character.accent}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}

      {character.id === "fisherman" && (
        <>
          {/* Bandana */}
          <path
            d="M46 58 C 46 50, 50 48, 60 48 C 70 48, 74 50, 74 58 L 74 60 L 46 60 Z"
            fill={character.accent}
            fillOpacity="0.28"
            stroke={character.accent}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Fishing net line */}
          <path
            d="M86 118 L 86 72 C 86 68, 90 66, 92 68"
            fill="none"
            stroke={character.accent}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}

      {character.id === "artisan" && (
        <>
          {/* Head scarf with flow */}
          <path
            d="M46 60 C 44 48, 50 44, 60 44 C 70 44, 76 48, 74 60 L 74 62 L 46 62 Z"
            fill={character.accent}
            fillOpacity="0.26"
            stroke={character.accent}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Scarf tail */}
          <path
            d="M74 56 C 80 56, 82 60, 80 64"
            fill="none"
            stroke={character.accent}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Subtle face details — minimal */}
      <circle cx="55" cy="65" r="0.8" fill={character.accent} fillOpacity="0.6" />
      <circle cx="65" cy="65" r="0.8" fill={character.accent} fillOpacity="0.6" />
    </svg>
  );
}
