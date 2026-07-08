import { XPBar } from "./XPBar";

interface ProgressCardProps {
  level: number;
  xp: number;
  xpToNext: number;
}

export function ProgressCard({ level, xp, xpToNext }: ProgressCardProps) {
  return (
    <section className="card-elevated p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Sua jornada
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">Nível {level}</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">{xpToNext - xp}</span> XP restantes
        </p>
      </div>
      <div className="mt-4">
        <XPBar level={level} xp={xp} xpToNext={xpToNext} />
      </div>
    </section>
  );
}
