import { motion } from "framer-motion";
import type { AppMode } from "@/hooks/useAppMode";

interface ModeSwitcherProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

const OPTIONS: { id: AppMode; label: string; emoji: string }[] = [
  { id: "study", label: "Estudo", emoji: "📚" },
  { id: "journey", label: "Jornada", emoji: "🏛️" },
];

export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5 shadow-soft">
      {OPTIONS.map((opt) => {
        const active = opt.id === mode;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className="relative rounded-full px-3.5 py-1.5 text-[12px] font-medium tracking-tight transition-colors"
          >
            {active && (
              <motion.span
                layoutId="mode-switcher-pill"
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span
              className={
                "relative z-10 flex items-center gap-1.5 transition-colors " +
                (active ? "text-background" : "text-muted-foreground hover:text-foreground")
              }
            >
              <span aria-hidden>{opt.emoji}</span>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
