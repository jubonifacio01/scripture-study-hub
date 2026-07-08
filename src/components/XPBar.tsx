import { motion } from "framer-motion";

interface XPBarProps {
  xp: number;
  xpToNext: number;
  level: number;
  className?: string;
}

export function XPBar({ xp, xpToNext, level, className = "" }: XPBarProps) {
  const pct = Math.min(100, Math.round((xp / xpToNext) * 100));
  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">Nível {level}</span>
        <span className="tabular-nums text-muted-foreground">
          {xp} / {xpToNext} XP
        </span>
      </div>
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
        />
      </div>
    </div>
  );
}
