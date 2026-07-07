import { Trophy, Target, Zap } from "lucide-react";
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
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="card-elevated relative overflow-hidden p-6 text-center"
    >
      <div className="pointer-events-none absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full gradient-primary opacity-25 blur-3xl" />
      <motion.div
        initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
        className="relative mx-auto grid h-20 w-20 place-items-center rounded-3xl gradient-primary text-primary-foreground shadow-lift"
      >
        <Trophy className="h-10 w-10" />
      </motion.div>
      <h2 className="relative mt-4 font-display text-2xl font-black">Sessão concluída!</h2>
      <p className="relative text-sm text-muted-foreground">
        Cada versículo memorizado é um tesouro.
      </p>

      <div className="relative mt-6 grid grid-cols-3 gap-3">
        <Stat icon={<Target className="h-4 w-4" />} label="Acertos" value={`${result.correct}/${result.total}`} delay={0.25} />
        <Stat icon={<Zap className="h-4 w-4" />} label="Precisão" value={`${accuracy}%`} delay={0.32} />
        <Stat icon={<Trophy className="h-4 w-4" />} label="XP" value={`+${result.xpEarned}`} delay={0.39} />
      </div>

      <div className="relative mt-6 flex flex-col gap-2">
        <Button size="lg" onClick={onPlayAgain} className="press rounded-2xl gradient-primary text-primary-foreground shadow-soft">
          Jogar novamente
        </Button>
        <Button size="lg" variant="ghost" onClick={onExit} className="rounded-2xl">
          Voltar ao início
        </Button>
      </div>
    </motion.div>
  );
}

function Stat({
  icon,
  label,
  value,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-border bg-muted/40 p-3"
    >
      <div className="mx-auto grid h-8 w-8 place-items-center rounded-xl bg-card text-primary">
        {icon}
      </div>
      <p className="mt-1 text-lg font-black tabular-nums">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </motion.div>
  );
}
