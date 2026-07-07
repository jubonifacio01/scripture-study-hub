import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { Avatar } from "@/components/Avatar";
import { XPBar } from "@/components/XPBar";
import { demoUser } from "@/data/user";
import { Flame, Target, BookOpen, Trophy, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Perfil — Memorize+" },
      { name: "description", content: "Seu progresso, sequência e estatísticas." },
    ],
  }),
  component: ProfilePage,
});

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

function ProfilePage() {
  const u = demoUser;
  return (
    <AppLayout>
      <Header subtitle="Sua conta" title="Perfil" />

      <motion.div variants={stagger} initial="hidden" animate="show" className="mt-5 flex flex-col gap-5">
        <motion.section
          variants={rise}
          className="card-elevated relative overflow-hidden p-6 text-center"
        >
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full gradient-fun opacity-25 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full gradient-primary opacity-20 blur-3xl" />

          <div className="relative mx-auto inline-block">
            <motion.div
              animate={{ rotate: [0, 4, -4, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-2 rounded-full gradient-primary opacity-30 blur-md"
            />
            <Avatar name={u.name} size={96} className="relative ring-4 ring-background" />
            <span className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full gradient-fun text-xs font-black text-primary-foreground shadow-lift ring-4 ring-background">
              {u.level}
            </span>
          </div>

          <h2 className="relative mt-4 font-display text-2xl font-black">{u.name}</h2>
          <p className="relative flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Peregrino da Palavra · Nível {u.level}
          </p>

          <div className="relative mt-5 rounded-2xl border border-border bg-muted/40 p-4 text-left">
            <XPBar xp={u.xp} xpToNext={u.xpToNext} level={u.level} />
            <p className="mt-2 text-xs text-muted-foreground">
              Faltam <span className="font-bold text-foreground">{u.xpToNext - u.xp} XP</span> para o próximo nível.
            </p>
          </div>
        </motion.section>

        <motion.section variants={rise} className="grid grid-cols-2 gap-3">
          <StatCard icon={<Flame className="h-5 w-5" />} value={`${u.streak} dias`} label="Sequência atual" tone="fun" />
          <StatCard icon={<BookOpen className="h-5 w-5" />} value={`${u.itemsStudied}`} label="Versículos estudados" tone="accent" />
          <StatCard icon={<Target className="h-5 w-5" />} value={`${u.accuracy}%`} label="Precisão média" tone="primary" />
          <StatCard icon={<Trophy className="h-5 w-5" />} value={`${u.xp}`} label="XP total" tone="success" />
        </motion.section>

        <motion.section variants={rise}>
          <h2 className="mb-3 font-display text-sm font-black uppercase tracking-widest text-muted-foreground">
            Conquistas
          </h2>
          <div className="card-elevated p-5 text-center">
            <p className="text-4xl">🏆</p>
            <p className="mt-2 font-display font-extrabold">Continue jogando!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Conquistas, ranking e personagens chegam em breve.
            </p>
          </div>
        </motion.section>
      </motion.div>
    </AppLayout>
  );
}

function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  tone: "primary" | "accent" | "fun" | "success";
}) {
  const bg =
    tone === "fun"
      ? "gradient-fun"
      : tone === "accent"
        ? "gradient-accent"
        : tone === "success"
          ? "bg-success"
          : "gradient-primary";
  return (
    <motion.div whileTap={{ scale: 0.97 }} className="card-elevated press p-4">
      <div className={"grid h-10 w-10 place-items-center rounded-2xl text-primary-foreground shadow-soft " + bg}>
        {icon}
      </div>
      <p className="mt-3 font-display text-xl font-black tabular-nums">{value}</p>
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
    </motion.div>
  );
}
