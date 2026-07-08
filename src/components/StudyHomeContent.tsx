import { Link, useNavigate } from "@tanstack/react-router";
import { ProgressCard } from "@/components/ProgressCard";
import { ObjectiveCard } from "@/components/ObjectiveCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { demoUser, dailyGoal } from "@/data/user";
import {
  loadObjectives,
  loadCustomItems,
  getLastStudiedObjective,
  getObjectiveItems,
  getObjectiveProgress,
} from "@/data/objectives";
import { ArrowUpRight, Flame, Target, BookOpen, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo } from "react";

export function StudyHomeContent() {
  const navigate = useNavigate();
  const u = demoUser;
  const goalPct = Math.round((dailyGoal.completed / dailyGoal.target) * 100);
  const goalDone = dailyGoal.completed >= dailyGoal.target;

  const { objectives, lastObjective, customItems } = useMemo(() => {
    const objs = loadObjectives();
    const items = loadCustomItems();
    return {
      objectives: objs,
      lastObjective: getLastStudiedObjective(objs),
      customItems: items,
    };
  }, []);

  const hasObjectives = objectives.length > 0;
  const lastItems = lastObjective ? getObjectiveItems(lastObjective, customItems) : [];
  const lastProgress = lastObjective ? getObjectiveProgress(lastObjective, customItems) : null;

  return (
    <div className="mt-8 flex flex-col gap-8">
      {/* Continue / Empty state — main entry point */}
      {hasObjectives && lastObjective && lastItems.length > 0 ? (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Continuar estudando
            </p>
            <span className="text-xs tabular-nums text-muted-foreground">
              {lastProgress?.masteryPct}% concluído
            </span>
          </div>
          <Link
            to="/collections"
            search={{ objective: lastObjective.id }}
            className="press card-elevated block p-6 transition-colors hover:border-foreground/20"
          >
            <p className="text-xs font-medium tracking-tight text-primary">
              {lastObjective.name}
            </p>
            <h2 className="mt-2 text-[22px] font-semibold leading-snug tracking-tight">
              {lastItems[0]?.title ?? "Retomar estudo"}
            </h2>
            {lastItems[0]?.text ? (
              <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                "{lastItems[0].text}"
              </p>
            ) : null}

            <div className="mt-5 h-[3px] w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                style={{ width: `${lastProgress?.masteryPct ?? 0}%` }}
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
      ) : (
        <section>
          <EmptyState
            icon={<Sparkles className="h-5 w-5" strokeWidth={1.5} />}
            title="Toda grande jornada começa com o primeiro conhecimento."
            action={
              <Button
                onClick={() => navigate({ to: "/collections" })}
                className="h-11 rounded-[16px] bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Criar meu primeiro objetivo
              </Button>
            }
          />
        </section>
      )}

      {/* Daily goal — subtle line */}
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

      {/* Stats — inline, typography as protagonist */}
      <section className="grid grid-cols-3 divide-x divide-border rounded-[20px] border border-border bg-card shadow-soft">
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

      {/* Journey progress */}
      <ProgressCard level={u.level} xp={u.xp} xpToNext={u.xpToNext} />

      {/* Objectives in focus */}
      {hasObjectives && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Seus objetivos
            </h2>
            <Link to="/collections" className="text-xs font-medium text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {objectives.slice(0, 3).map((o) => (
              <ObjectiveCard key={o.id} objective={o} />
            ))}
          </div>
        </section>
      )}
    </div>
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
        <span className="text-[10px] font-medium uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="mt-2 text-[20px] font-semibold tabular-nums tracking-tight">{value}</p>
    </div>
  );
}
