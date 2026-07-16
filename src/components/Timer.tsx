import { useEffect, useState } from "react";

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

  const urgent = left <= 5 && running;

  return (
    <div
      className={
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs tabular-nums " +
        (urgent ? "text-destructive" : "text-muted-foreground")
      }
    >
      <span className={"h-1.5 w-1.5 rounded-full " + (urgent ? "bg-destructive" : "bg-primary")} />
      <span className="font-medium">{left}s</span>
    </div>
  );
}
