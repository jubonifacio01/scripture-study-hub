import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { ProgressCard } from "@/components/ProgressCard";
import { CollectionCard } from "@/components/CollectionCard";
import { demoUser, dailyGoal, continueStudying } from "@/data/user";
import { collections } from "@/data/collections";
import { getItemById } from "@/data/memoryItems";
import { ArrowUpRight, Flame, Target, BookOpen } from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const u = demoUser;
  const item = getItemById(continueStudying.itemId);
  const goalPct = Math.round((dailyGoal.completed / dailyGoal.target) * 100);
  const goalDone = dailyGoal.completed >= dailyGoal.target;

  return (
    <AppLayout>
      <Header
        subtitle={`Bom dia, ${u.name.split(" ")[0]}`}
        title="Um pequeno passo hoje."
      />

      <div className="mt-8 flex flex-col gap-8">
        {/* Continuar estudando — elemento principal, sereno */}
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Continuar estudando
            </p>
            <span className="text-xs tabular-nums text-muted-foreground">
              {continueStudying.progress}% memorizado
            </span>
          </div>
          <Link
            to="/play"
            className="press card-elevated block p-6 transition-colors hover:border-foreground/20"
          >
            <p className="text-xs font-medium tracking-tight text-primary">
              {continueStudying.reference}
            </p>
            <h2 className="mt-2 text-[22px] font-semibold leading-snug tracking-tight">
              {item?.title ?? "Nova jornada"}
            </h2>
            {item?.text ? (
              <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                “{item.text}”
              </p>
            ) : null}

            <div className="mt-5 h-[3px] w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                style={{ width: `${continueStudying.progress}%` }}
              />
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Retomar sessão</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background">
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
              </span>
            </div>
          </Link>
        </section>

        {/* Meta diária — linha sutil */}
        <section>
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Meta diária
            </p>
            <span className="text-xs tabular-nums text-muted-foreground">
              {dailyGoal.completed} / {dailyGoal.target} {dailyGoal.unit}
            </span>
          </div>
          <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
              style={{ width: `${Math.min(100, goalPct)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {goalDone
              ? "Meta cumprida. Continue no seu ritmo."
              : `Faltam ${dailyGoal.target - dailyGoal.completed} ${dailyGoal.unit} para completar hoje.`}
          </p>
        </section>

        {/* Estatísticas — inline, tipografia protagonista */}
        <section className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card">
          <QuickStat
            icon={<Flame className="h-3.5 w-3.5" strokeWidth={1.75} />}
            value={`${u.streak}`}
            label="sequência"
          />
          <QuickStat
            icon={<Target className="h-3.5 w-3.5" strokeWidth={1.75} />}
            value={`${u.accuracy}%`}
            label="precisão"
          />
          <QuickStat
            icon={<BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />}
            value={`${u.itemsStudied}`}
            label="versículos"
          />
        </section>

        {/* Progresso de jornada */}
        <ProgressCard level={u.level} xp={u.xp} xpToNext={u.xpToNext} />

        {/* Coleções em destaque */}
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Coleções em destaque
            </h2>
            <Link
              to="/collections"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {collections.slice(0, 3).map((c) => (
              <CollectionCard key={c.id} collection={c} compact />
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function QuickStat({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="px-3 py-4">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>
      <p className="mt-2 text-[20px] font-semibold tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}
