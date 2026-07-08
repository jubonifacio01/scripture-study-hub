import { Check } from "lucide-react";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="card-elevated p-8 text-center"
    >
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
        <Check className="h-6 w-6" strokeWidth={2} />
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-tight">Sessão concluída</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Um passo a mais na Palavra memorizada.
      </p>

      <div className="mt-8 grid grid-cols-3 divide-x divide-border rounded-xl border border-border">
        <Stat label="Acertos" value={`${result.correct}/${result.total}`} />
        <Stat label="Precisão" value={`${accuracy}%`} />
        <Stat label="XP" value={`+${result.xpEarned}`} />
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <Button size="lg" onClick={onPlayAgain} className="press h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
          Praticar novamente
        </Button>
        <Button size="lg" variant="ghost" onClick={onExit} className="h-11 rounded-xl text-muted-foreground hover:text-foreground">
          Voltar ao início
        </Button>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-4">
      <p className="text-[17px] font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
