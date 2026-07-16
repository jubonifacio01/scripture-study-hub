import { Link, useNavigate } from "@tanstack/react-router";
import { ObjectiveCard } from "@/components/ObjectiveCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { XPBar } from "@/components/XPBar";
import { getObjectiveProgress } from "@/services/ObjectiveService";
import { ArrowUpRight, Flame, Target, BookOpen, Sparkles, Clock, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { formatLastStudyDate, type UserStats } from "@/hooks/useUserStats";
import type { Objective, MemoryItem } from "@/types";

interface StudyHomeContentProps {
  stats: UserStats;
  objectives: Objective[];
  itemsMap: Record<string, MemoryItem[]>;
}

export function StudyHomeContent({ stats, objectives, itemsMap }: StudyHomeContentProps) {
  const navigate = useNavigate();

  const hasObjectives = objectives.length > 0;

  // Find the most recently studied objective
  const lastObjective =
    objectives.reduce<Objective | null>((best, o) => {
      if (!o.lastStudiedAt) return best;
      if (!best || !best.lastStudiedAt) return o;
      return new Date(o.lastStudiedAt) > new Date(best.lastStudiedAt) ? o : best;
    }, null) ?? (objectives.length > 0 ? objectives[0] : null);

  const lastItems = lastObjective ? (itemsMap[lastObjective.id] ?? []) : [];
  const lastProgress = lastObjective ? getObjectiveProgress(lastObjective, lastItems) : null;

  const showStreak = stats.streak > 0;
  const showAccuracy = stats.sessionsCompleted > 0 && stats.accuracy > 0;
  const showTexts = stats.totalTexts > 0;
  const showLastStudy = stats.lastStudyDate !== null;
  const activeStatsCount = [showStreak, showAccuracy, showTexts].filter(Boolean).length;

  return (
    <div className="mt-8 flex flex-col gap-8">
      {/* Continue / Empty state */}
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
            <p className="text-xs font-medium tracking-tight text-primary">{lastObjective.name}</p>
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

      {/* Stats */}
      {activeStatsCount > 0 && (
        <section
          className="grid divide-x divide-border rounded-[20px] border border-border bg-card shadow-soft"
          style={{ gridTemplateColumns: `repeat(${activeStatsCount}, 1fr)` }}
        >
          {showStreak && (
            <QuickStat
              icon={<Flame className="h-3.5 w-3.5" strokeWidth={1.75} />}
              value={`${stats.streak}`}
              label="sequência"
            />
          )}
          {showAccuracy && (
            <QuickStat
              icon={<Target className="h-3.5 w-3.5" strokeWidth={1.75} />}
              value={`${stats.accuracy}%`}
              label="precisão"
            />
          )}
          {showTexts && (
            <QuickStat
              icon={<BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />}
              value={`${stats.studiedTexts}`}
              label="estudados"
            />
          )}
        </section>
      )}

      {/* Last study indicator */}
      {showLastStudy && (
        <section className="flex items-center gap-3 rounded-[16px] border border-border bg-card p-4">
          <div className="grid h-9 w-9 place-items-center rounded-[12px] bg-muted">
            <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-foreground">
              Último estudo: {formatLastStudyDate(stats.lastStudyDate)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Continue praticando para melhorar sua memorização
            </p>
          </div>
        </section>
      )}

      {/* XP Progress */}
      {stats.totalXP > 0 && (
        <section className="rounded-[20px] border border-border bg-card p-5 shadow-soft">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Sua jornada
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">Nível {stats.level}</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground tabular-nums">{stats.xpToNext}</span>{" "}
                XP restantes
              </span>
            </div>
          </div>
          <div className="mt-4">
            <XPBar level={stats.level} xp={stats.currentLevelXP} xpToNext={stats.xpToNext} />
          </div>
          {stats.todayXP > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              <span className="font-medium text-primary">+{stats.todayXP} XP</span> ganho hoje.
            </p>
          )}
        </section>
      )}

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

function QuickStat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
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
