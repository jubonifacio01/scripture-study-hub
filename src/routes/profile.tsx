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

      <div className="mt-8 flex flex-col gap-6">
        <section className="flex items-center gap-4">
          <Avatar name={u.name} size={64} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold tracking-tight">{u.name}</h2>
            <p className="text-xs text-muted-foreground">
              Peregrino da Palavra · Nível {u.level}
            </p>
          </div>
        </section>

        <section className="card-elevated p-5">
          <XPBar xp={u.xp} xpToNext={u.xpToNext} level={u.level} />
          <p className="mt-3 text-xs text-muted-foreground">
            Faltam <span className="font-medium text-foreground tabular-nums">{u.xpToNext - u.xp} XP</span> para o próximo nível.
          </p>
        </section>

        <section>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Estatísticas
          </p>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
            <StatCell icon={<Flame className="h-4 w-4" strokeWidth={1.75} />} value={`${u.streak} dias`} label="Sequência" />
            <StatCell icon={<BookOpen className="h-4 w-4" strokeWidth={1.75} />} value={`${u.itemsStudied}`} label="Versículos" />
            <StatCell icon={<Target className="h-4 w-4" strokeWidth={1.75} />} value={`${u.accuracy}%`} label="Precisão" />
            <StatCell icon={<Trophy className="h-4 w-4" strokeWidth={1.75} />} value={`${u.xp}`} label="XP total" />
          </div>
        </section>

        <section>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Conquistas
          </p>
          <div className="card-elevated p-6 text-center">
            <p className="text-sm font-medium">Em breve</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Conquistas, ranking e personagens chegam nas próximas versões.
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function StatCell({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-card p-4">
      <div className="text-muted-foreground">{icon}</div>
      <p className="mt-3 text-lg font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
