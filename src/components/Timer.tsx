import { useEffect, useState } from "react";
import { Timer as TimerIcon } from "lucide-react";

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

  const pct = Math.max(0, (left / seconds) * 100);

  return (
    <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm font-bold">
      <TimerIcon className="h-4 w-4 text-primary" />
      <span className="tabular-nums">{left}s</span>
      <span className="ml-1 hidden h-1.5 w-20 overflow-hidden rounded-full bg-border sm:block">
        <span
          className="block h-full gradient-primary transition-[width] duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </span>
    </div>
  );
}
