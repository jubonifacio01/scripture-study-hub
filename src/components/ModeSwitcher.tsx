import { motion } from "framer-motion";
import { BookOpen, Landmark } from "lucide-react";
import type { ComponentType } from "react";
import type { AppMode } from "@/hooks/useAppMode";

interface ModeSwitcherProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

const OPTIONS: { id: AppMode; label: string; icon: ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { id: "study", label: "Estudo", icon: BookOpen },
  { id: "journey", label: "Jornada", icon: Landmark },
];

export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card/80 p-0.5 shadow-soft backdrop-blur-sm">
      {OPTIONS.map((opt) => {
        const active = opt.id === mode;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className="relative rounded-full px-3 py-1.5 text-[12px] font-medium tracking-tight transition-colors"
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
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
