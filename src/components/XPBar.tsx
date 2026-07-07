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
      <div className="mb-2 flex items-center justify-between text-xs font-bold">
        <span className="text-muted-foreground">Nível {level}</span>
        <span className="text-muted-foreground tabular-nums">
          {xp} / {xpToNext} XP
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 left-0 gradient-primary rounded-full"
        />
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
          className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          style={{ mixBlendMode: "overlay" }}
        />
      </div>
    </div>
  );
}
