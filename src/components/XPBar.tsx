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
        <span className="text-muted-foreground">
          {xp} / {xpToNext} XP
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 gradient-primary rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
