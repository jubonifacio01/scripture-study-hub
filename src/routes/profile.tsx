import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { Avatar } from "@/components/Avatar";
import { XPBar } from "@/components/XPBar";
import { demoUser } from "@/data/user";
import { Flame, Target, BookOpen, Trophy } from "lucide-react";
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

function ProfilePage() {
  const u = demoUser;
  return (
    <AppLayout>
      <Header subtitle="Sua conta" title="Perfil" />

      <section className="card-elevated relative mt-5 overflow-hidden p-5 text-center">
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full gradient-fun opacity-20 blur-3xl" />
        <div className="mx-auto">
          <Avatar name={u.name} size={88} className="mx-auto" />
        </div>
        <h2 className="mt-3 font-display text-2xl font-black">{u.name}</h2>
        <p className="text-sm text-muted-foreground">Peregrino da Palavra · Nível {u.level}</p>
        <div className="mt-4">
          <XPBar xp={u.xp} xpToNext={u.xpToNext} level={u.level} />
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          value={`${u.streak} dias`}
          label="Sequência atual"
          tone="fun"
        />
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          value={`${u.itemsStudied}`}
          label="Versículos estudados"
          tone="accent"
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          value={`${u.accuracy}%`}
          label="Precisão média"
          tone="primary"
        />
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          value={`${u.xp}`}
          label="XP total"
          tone="success"
        />
      </section>

      <section className="mt-6">
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
      </section>
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
    <div className="card-elevated p-4">
      <div className={"grid h-10 w-10 place-items-center rounded-2xl text-primary-foreground " + bg}>
        {icon}
      </div>
      <p className="mt-3 font-display text-xl font-black tabular-nums">{value}</p>
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
    </div>
  );
}
