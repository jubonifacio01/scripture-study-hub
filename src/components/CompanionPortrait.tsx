interface CompanionPortraitProps {
  companionId: string;
  accent: string;
  size?: number;
  /** Renders a muted silhouette instead of the full illustration, for locked companions */
  locked?: boolean;
  /** Plays the companion's continuous idle behavior loop */
  idle?: boolean;
  /** Plays the companion's one-shot reaction to being tapped, overriding idle briefly */
  reacting?: boolean;
  className?: string;
}

/**
 * Minimalist line-art illustration for each companion, matching the visual
 * language of CharacterPortrait — a single accent color, few shapes, no
 * cartoonish detail.
 *
 * Companions never speak: personality is expressed only through the
 * distinct idle/reaction motion assigned per companionId in styles.css.
 */
export function CompanionPortrait({
  companionId,
  accent,
  size = 80,
  locked = false,
  idle = false,
  reacting = false,
  className = "",
}: CompanionPortraitProps) {
  const stroke = locked ? "currentColor" : accent;
  const fillSoft = locked ? "currentColor" : accent;
  const strokeOpacity = locked ? 0.28 : 1;
  const fillOpacity = locked ? 0.06 : 0.18;

  const motionClass = locked
    ? ""
    : [
        "companion-motion",
        `companion-${companionId}`,
        reacting ? "companion-tap" : idle ? "companion-idle" : "",
      ]
        .filter(Boolean)
        .join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="60" cy="60" r="60" fill={accent} fillOpacity={locked ? 0.04 : 0.12} />

      <g className={motionClass} opacity={strokeOpacity}>
        {companionId === "sheep" && (
          <>
            {/* Fluffy body */}
            <path
              d="M32 76 C 28 66, 34 58, 44 58 C 46 50, 54 46, 62 50 C 70 44, 82 48, 82 58 C 90 60, 92 72, 84 78 C 84 88, 74 92, 62 90 C 50 94, 36 88, 32 76 Z"
              fill={fillSoft}
              fillOpacity={fillOpacity}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Head */}
            <circle
              cx="86"
              cy="66"
              r="10"
              fill={fillSoft}
              fillOpacity={fillOpacity + 0.06}
              stroke={stroke}
              strokeWidth="1.5"
            />
            {/* Ear */}
            <path
              d="M92 60 C 96 58, 98 60, 96 64"
              fill="none"
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Legs */}
            <path
              d="M46 90 L 44 100 M58 92 L 58 102 M72 90 L 74 100"
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        )}

        {companionId === "owl" && (
          <>
            {/* Body */}
            <path
              d="M60 34 C 76 34, 84 48, 84 64 C 84 82, 74 92, 60 92 C 46 92, 36 82, 36 64 C 36 48, 44 34, 60 34 Z"
              fill={fillSoft}
              fillOpacity={fillOpacity}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Ear tufts */}
            <path
              d="M46 38 L 42 28 M74 38 L 78 28"
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Eyes */}
            <circle cx="50" cy="60" r="9" fill="none" stroke={stroke} strokeWidth="1.5" />
            <circle cx="70" cy="60" r="9" fill="none" stroke={stroke} strokeWidth="1.5" />
            <circle cx="50" cy="60" r="2.2" fill={stroke} />
            <circle cx="70" cy="60" r="2.2" fill={stroke} />
            {/* Beak */}
            <path
              d="M57 70 L 60 75 L 63 70"
              fill="none"
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Feet */}
            <path
              d="M52 92 L 50 100 M68 92 L 70 100"
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        )}

        {companionId === "donkey" && (
          <>
            {/* Body */}
            <path
              d="M30 84 C 28 68, 40 58, 58 58 C 76 58, 90 66, 90 80 C 90 90, 80 94, 60 94 C 42 94, 30 92, 30 84 Z"
              fill={fillSoft}
              fillOpacity={fillOpacity}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Head */}
            <path
              d="M28 68 C 20 66, 16 56, 22 48 C 28 42, 38 44, 40 54 C 42 62, 36 70, 28 68 Z"
              fill={fillSoft}
              fillOpacity={fillOpacity + 0.06}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Ears */}
            <path
              d="M22 46 L 16 34 M32 42 L 30 28"
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Tail */}
            <path
              d="M90 78 C 96 80, 98 86, 94 90"
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Legs */}
            <path
              d="M46 92 L 44 102 M74 92 L 76 102"
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        )}

        {companionId === "fish" && (
          <>
            {/* Body */}
            <path
              d="M28 60 C 28 46, 48 38, 66 44 C 80 48, 90 54, 94 60 C 90 66, 80 72, 66 76 C 48 82, 28 74, 28 60 Z"
              fill={fillSoft}
              fillOpacity={fillOpacity}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Tail */}
            <path
              d="M94 60 L 104 50 L 102 60 L 104 70 Z"
              fill={fillSoft}
              fillOpacity={fillOpacity}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Top fin */}
            <path
              d="M56 42 C 58 36, 64 34, 68 36"
              stroke={stroke}
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Eye */}
            <circle cx="42" cy="56" r="2.2" fill={stroke} />
            {/* Scale lines */}
            <path
              d="M52 58 C 56 60, 56 66, 52 68 M62 56 C 66 58, 66 66, 62 68"
              stroke={stroke}
              strokeWidth="1.2"
              fill="none"
              opacity="0.6"
            />
          </>
        )}

        {companionId === "vase" && (
          <>
            {/* Vase silhouette */}
            <path
              d="M52 30 L 68 30 L 68 38 C 78 44, 82 56, 78 68 C 84 76, 84 92, 74 98 C 66 102, 54 102, 46 98 C 36 92, 36 76, 42 68 C 38 56, 42 44, 52 38 Z"
              fill={fillSoft}
              fillOpacity={fillOpacity}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Rim */}
            <path d="M48 30 L 72 30" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
            {/* Decorative bands */}
            <path
              d="M40 70 C 50 74, 70 74, 80 70"
              stroke={stroke}
              strokeWidth="1.2"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M44 84 C 52 87, 68 87, 76 84"
              stroke={stroke}
              strokeWidth="1.2"
              fill="none"
              opacity="0.7"
            />
          </>
        )}
      </g>
    </svg>
  );
}
