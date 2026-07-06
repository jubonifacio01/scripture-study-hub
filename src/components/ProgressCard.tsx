import { XPBar } from "./XPBar";
import { Sparkles } from "lucide-react";

interface ProgressCardProps {
  level: number;
  xp: number;
  xpToNext: number;
}

export function ProgressCard({ level, xp, xpToNext }: ProgressCardProps) {
  return (
    <section className="card-elevated relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full gradient-primary opacity-20 blur-2xl" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Sua jornada
          </p>
          <h2 className="font-display text-xl font-extrabold">Nível de Memorização</h2>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
          <Sparkles className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4">
        <XPBar level={level} xp={xp} xpToNext={xpToNext} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Faltam <span className="font-bold text-foreground">{xpToNext - xp} XP</span> para o
        próximo nível.
      </p>
    </section>
  );
}
