import { Trophy, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GameResult } from "@/types";

interface ScoreCardProps {
  result: GameResult;
  onPlayAgain: () => void;
  onExit: () => void;
}

export function ScoreCard({ result, onPlayAgain, onExit }: ScoreCardProps) {
  const accuracy = Math.round((result.correct / Math.max(1, result.total)) * 100);
  return (
    <div className="card-elevated p-6 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl gradient-primary text-primary-foreground shadow-lift">
        <Trophy className="h-10 w-10" />
      </div>
      <h2 className="mt-4 font-display text-2xl font-black">Sessão concluída!</h2>
      <p className="text-sm text-muted-foreground">
        Cada versículo memorizado é um tesouro.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat icon={<Target className="h-4 w-4" />} label="Acertos" value={`${result.correct}/${result.total}`} />
        <Stat icon={<Zap className="h-4 w-4" />} label="Precisão" value={`${accuracy}%`} />
        <Stat icon={<Trophy className="h-4 w-4" />} label="XP" value={`+${result.xpEarned}`} />
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Button size="lg" onClick={onPlayAgain} className="rounded-2xl gradient-primary text-primary-foreground">
          Jogar novamente
        </Button>
        <Button size="lg" variant="ghost" onClick={onExit} className="rounded-2xl">
          Voltar ao início
        </Button>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-3">
      <div className="mx-auto grid h-8 w-8 place-items-center rounded-xl bg-card text-primary">
        {icon}
      </div>
      <p className="mt-1 text-lg font-black tabular-nums">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
