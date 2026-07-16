import type { Journey } from "@/data/journeys";

interface JourneyCoverProps {
  journey: Journey;
  className?: string;
}

/**
 * Minimalist editorial cover illustration for a journey.
 * Simple geometric shapes, few colors, no cartoon style.
 * Each journey gets a unique abstract composition.
 */
export function JourneyCover({ journey, className = "" }: JourneyCoverProps) {
  const color = journey.accent;

  return (
    <svg
      viewBox="0 0 320 160"
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {/* Background */}
      <rect width="320" height="160" fill={color} fillOpacity="0.08" />

      {/* Journey-specific abstract composition */}
      {journey.id === "davi" && (
        <>
          {/* Hills + sheep */}
          <path
            d="M0 120 C 40 100, 80 105, 120 115 C 160 125, 200 110, 240 118 C 280 126, 320 115, 320 115 L 320 160 L 0 160 Z"
            fill={color}
            fillOpacity="0.15"
          />
          <circle cx="80" cy="118" r="4" fill={color} fillOpacity="0.3" />
          <circle cx="95" cy="122" r="3" fill={color} fillOpacity="0.25" />
          <circle cx="110" cy="119" r="4" fill={color} fillOpacity="0.3" />
          <circle cx="200" cy="125" r="3" fill={color} fillOpacity="0.25" />
          {/* Sun */}
          <circle cx="250" cy="50" r="18" fill={color} fillOpacity="0.12" />
        </>
      )}

      {journey.id === "jose" && (
        <>
          {/* Pyramid + stars */}
          <path
            d="M160 50 L 210 130 L 110 130 Z"
            fill={color}
            fillOpacity="0.15"
            stroke={color}
            strokeWidth="1.5"
          />
          <circle cx="80" cy="40" r="2" fill={color} fillOpacity="0.4" />
          <circle cx="100" cy="55" r="1.5" fill={color} fillOpacity="0.3" />
          <circle cx="240" cy="35" r="2" fill={color} fillOpacity="0.4" />
          <circle cx="260" cy="50" r="1.5" fill={color} fillOpacity="0.3" />
          <circle cx="270" cy="70" r="2" fill={color} fillOpacity="0.35" />
        </>
      )}

      {journey.id === "moises" && (
        <>
          {/* Mountains + parted sea */}
          <path
            d="M0 130 L 60 70 L 120 130 Z"
            fill={color}
            fillOpacity="0.12"
            stroke={color}
            strokeWidth="1.5"
          />
          <path
            d="M200 130 L 260 70 L 320 130 Z"
            fill={color}
            fillOpacity="0.12"
            stroke={color}
            strokeWidth="1.5"
          />
          {/* Water walls */}
          <path
            d="M130 130 C 140 110, 140 100, 145 90 C 150 100, 150 110, 155 130"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.3"
          />
          <path
            d="M175 130 C 180 110, 180 100, 185 90 C 190 100, 190 110, 195 130"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.3"
          />
        </>
      )}

      {journey.id === "paulo" && (
        <>
          {/* Road + light rays */}
          <path d="M160 20 L 160 80" stroke={color} strokeWidth="1.5" strokeOpacity="0.2" />
          <path d="M140 20 L 160 80" stroke={color} strokeWidth="1.5" strokeOpacity="0.15" />
          <path d="M180 20 L 160 80" stroke={color} strokeWidth="1.5" strokeOpacity="0.15" />
          <path d="M120 20 L 160 80" stroke={color} strokeWidth="1.5" strokeOpacity="0.1" />
          <path d="M200 20 L 160 80" stroke={color} strokeWidth="1.5" strokeOpacity="0.1" />
          {/* Road */}
          <path
            d="M140 160 L 160 80 L 180 160"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.25"
          />
        </>
      )}

      {journey.id === "jesus" && (
        <>
          {/* Radiant light */}
          <circle cx="160" cy="70" r="24" fill={color} fillOpacity="0.1" />
          <circle cx="160" cy="70" r="14" fill={color} fillOpacity="0.15" />
          {/* Rays */}
          <path
            d="M160 30 L 160 45"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.2"
            strokeLinecap="round"
          />
          <path
            d="M160 95 L 160 110"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.2"
            strokeLinecap="round"
          />
          <path
            d="M120 70 L 135 70"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.2"
            strokeLinecap="round"
          />
          <path
            d="M185 70 L 200 70"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.2"
            strokeLinecap="round"
          />
          <path
            d="M130 40 L 140 50"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.15"
            strokeLinecap="round"
          />
          <path
            d="M180 50 L 190 40"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.15"
            strokeLinecap="round"
          />
          <path
            d="M130 100 L 140 90"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.15"
            strokeLinecap="round"
          />
          <path
            d="M180 90 L 190 100"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.15"
            strokeLinecap="round"
          />
        </>
      )}

      {journey.id === "daniel" && (
        <>
          {/* Arch + lion silhouette */}
          <path
            d="M100 130 L 100 80 C 100 60, 120 50, 160 50 C 200 50, 220 60, 220 80 L 220 130"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.2"
          />
          {/* Stars through the arch */}
          <circle cx="140" cy="80" r="1.5" fill={color} fillOpacity="0.3" />
          <circle cx="160" cy="70" r="2" fill={color} fillOpacity="0.4" />
          <circle cx="180" cy="85" r="1.5" fill={color} fillOpacity="0.3" />
        </>
      )}

      {/* Subtle border accent */}
      <rect
        x="0.5"
        y="0.5"
        width="319"
        height="159"
        stroke={color}
        strokeOpacity="0.06"
        strokeWidth="1"
        rx="0"
      />
    </svg>
  );
}
