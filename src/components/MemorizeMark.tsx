interface MemorizeMarkProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Memorize+ brand mark — a minimalist open book whose pages
 * form the letter "M". Works at any size, no fill, pure stroke.
 */
export function MemorizeMark({ className = "", size = 24, strokeWidth = 1.5 }: MemorizeMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      {/* Left page — forms left leg of M */}
      <path
        d="M16 8.5 C 13.5 6.5, 10 5.5, 5 6 L 5 24 C 10 23.5, 13.5 24.5, 16 26.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right page — forms right leg of M */}
      <path
        d="M16 8.5 C 18.5 6.5, 22 5.5, 27 6 L 27 24 C 22 23.5, 18.5 24.5, 16 26.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center V — completes the M shape */}
      <path
        d="M16 8.5 L 16 26.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
