import { useEffect, useState } from "react";
import { Timer as TimerIcon } from "lucide-react";
import { motion } from "framer-motion";

interface TimerProps {
  seconds: number;
  onExpire?: () => void;
  running?: boolean;
}

export function Timer({ seconds, onExpire, running = true }: TimerProps) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => setLeft(seconds), [seconds]);

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      onExpire?.();
      return;
    }
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left, running, onExpire]);

  const pct = Math.max(0, Math.min(1, left / seconds));
  const urgent = left <= 5 && running;
  const R = 14;
  const C = 2 * Math.PI * R;

  return (
    <div
      className={
        "inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-2 py-1 backdrop-blur " +
        (urgent ? "text-destructive" : "text-foreground")
      }
    >
      <div className="relative h-8 w-8">
        <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90">
          <circle
            cx="18"
            cy="18"
            r={R}
            fill="none"
            className="stroke-muted"
            strokeWidth="4"
          />
          <motion.circle
            cx="18"
            cy="18"
            r={R}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className={urgent ? "stroke-destructive" : "stroke-primary"}
            strokeDasharray={C}
            animate={{ strokeDashoffset: C * (1 - pct) }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        <TimerIcon
          className={
            "absolute inset-0 m-auto h-3.5 w-3.5 " +
            (urgent ? "text-destructive" : "text-primary")
          }
        />
      </div>
      <motion.span
        key={left}
        initial={urgent ? { scale: 1.25 } : false}
        animate={{ scale: 1 }}
        transition={{ duration: 0.25 }}
        className="pr-1 text-sm font-black tabular-nums"
      >
        {left}s
      </motion.span>
    </div>
  );
}
