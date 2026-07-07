import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { ProgressCard } from "@/components/ProgressCard";
import { CollectionCard } from "@/components/CollectionCard";
import { demoUser, dailyGoal, continueStudying } from "@/data/user";
import { collections } from "@/data/collections";
import { getItemById } from "@/data/memoryItems";
import {
  Flame,
  Target,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

function HomePage() {
  const u = demoUser;
  const item = getItemById(continueStudying.itemId);
  const goalPct = Math.round((dailyGoal.completed / dailyGoal.target) * 100);
  const goalDone = dailyGoal.completed >= dailyGoal.target;

  return (
    <AppLayout>
      <Header
        subtitle={`Olá, ${u.name.split(" ")[0]} 👋`}
        title="Bora memorizar hoje?"
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mt-5 flex flex-col gap-5"
      >
        {/* Hero: Continuar estudando */}
        <motion.div variants={rise}>
          <Link
            to="/play"
            className="press card-elevated relative block overflow-hidden p-0"
          >
            <div className="gradient-primary relative p-5 text-primary-foreground">
              <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest">
                  Continue de onde parou
                </span>
              </div>
              <h2 className="relative mt-3 font-display text-2xl font-black leading-tight">
                {item?.title ?? "Nova jornada"}
              </h2>
              <p className="relative mt-1 text-sm opacity-90">
                {continueStudying.reference} · {continueStudying.progress}% memorizado
              </p>

              <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-white/25">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${continueStudying.progress}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="h-full rounded-full bg-white"
                />
              </div>

              <div className="relative mt-5 flex items-center justify-between">
                <span className="text-sm font-bold opacity-90">Continuar estudando</span>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-primary shadow-lift">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Meta diária */}
        <motion.section variants={rise} className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent-foreground/70">
                Meta diária
              </p>
              <h2 className="font-display text-lg font-extrabold">
                {goalDone ? "Meta cumprida hoje!" : `${dailyGoal.completed} / ${dailyGoal.target} ${dailyGoal.unit}`}
              </h2>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-accent text-accent-foreground shadow-soft">
              {goalDone ? <CheckCircle2 className="h-6 w-6" /> : <Target className="h-6 w-6" />}
            </div>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, goalPct)}%` }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
              className="h-full gradient-accent"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {goalDone
              ? "Continue jogando para acumular XP bônus."
              : `Faltam ${dailyGoal.target - dailyGoal.completed} ${dailyGoal.unit} para completar sua meta.`}
          </p>
        </motion.section>

        {/* Progresso de jornada */}
        <motion.div variants={rise}>
          <ProgressCard level={u.level} xp={u.xp} xpToNext={u.xpToNext} />
        </motion.div>

        {/* Estatísticas rápidas */}
        <motion.section variants={rise} className="grid grid-cols-3 gap-3">
          <QuickStat
            icon={<Flame className="h-4 w-4" />}
            value={`${u.streak}`}
            label="dias seguidos"
            tone="fun"
          />
          <QuickStat
            icon={<Target className="h-4 w-4" />}
            value={`${u.accuracy}%`}
            label="precisão"
            tone="primary"
          />
          <QuickStat
            icon={<BookOpen className="h-4 w-4" />}
            value={`${u.itemsStudied}`}
            label="versículos"
            tone="accent"
          />
        </motion.section>

        {/* Coleções em destaque */}
        <motion.section variants={rise}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-black uppercase tracking-widest text-muted-foreground">
              Coleções em destaque
            </h2>
            <Link
              to="/collections"
              className="flex items-center gap-1 text-xs font-bold text-primary"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {collections.slice(0, 3).map((c) => (
              <CollectionCard key={c.id} collection={c} compact />
            ))}
          </div>
        </motion.section>

        {/* CTA final */}
        <motion.div variants={rise}>
          <Link
            to="/play"
            className="press card-elevated flex items-center gap-3 p-4"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl gradient-fun text-primary-foreground shadow-soft">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-extrabold">Explorar jogos</p>
              <p className="truncate text-xs text-muted-foreground">
                3 modos disponíveis para praticar
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}

function QuickStat({
  icon,
  value,
  label,
  tone,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  tone: "primary" | "accent" | "fun";
}) {
  const bg =
    tone === "fun" ? "gradient-fun" : tone === "accent" ? "gradient-accent" : "gradient-primary";
  return (
    <div className="card-elevated overflow-hidden p-3">
      <div className={"grid h-8 w-8 place-items-center rounded-xl text-primary-foreground " + bg}>
        {icon}
      </div>
      <p className="mt-2 font-display text-lg font-black tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
