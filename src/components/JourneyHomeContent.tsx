import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { JOURNEYS } from "@/data/journeyContent";
import { getJourneyStats, getLastActiveSession } from "@/data/journeys";
import { JourneyCover } from "@/components/JourneyCover";
import { formatLastStudyDate } from "@/hooks/useUserStats";

interface JourneyHomeContentProps {
  lastStudyDate?: string | null;
  sessionsCompleted?: number;
}

export function JourneyHomeContent({
  lastStudyDate,
  sessionsCompleted = 0,
}: JourneyHomeContentProps) {
  // Find the journey with most recent activity for "Continue" card
  const activeJourney = JOURNEYS.map((j) => ({
    journey: j,
    stats: getJourneyStats(j, j.id),
  }))
    .filter(({ stats }) => stats.completedSessions > 0)
    .sort((a, b) => {
      const aTime = a.stats.lastActivity ? new Date(a.stats.lastActivity).getTime() : 0;
      const bTime = b.stats.lastActivity ? new Date(b.stats.lastActivity).getTime() : 0;
      return bTime - aTime;
    })[0];

  const continueData = activeJourney
    ? (() => {
        const last = getLastActiveSession(activeJourney.journey, activeJourney.journey.id);
        if (!last) return null;
        return {
          journey: activeJourney.journey,
          chapter: last.chapter,
          session: last.session,
          sessionIndex: last.sessionIndex,
        };
      })()
    : null;

  const showLastStudy = lastStudyDate !== null;

  return (
    <div className="mt-8 flex flex-col gap-8">
      {/* Last study indicator */}
      {showLastStudy && (
        <section className="flex items-center gap-3 rounded-[16px] border border-border bg-card p-4">
          <div className="grid h-9 w-9 place-items-center rounded-[12px] bg-muted">
            <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-foreground">
              Último estudo: {formatLastStudyDate(lastStudyDate ?? null)}
            </p>
            {sessionsCompleted > 0 && (
              <p className="text-[11px] text-muted-foreground">
                {sessionsCompleted} sess{sessionsCompleted > 1 ? "ões" : "ão"} completada
                {sessionsCompleted > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Continue Journey card */}
      {continueData && (
        <section>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Continue
          </p>
          <Link
            to="/play"
            search={{
              journey: continueData.journey.id,
              chapter: continueData.chapter.id,
              session: continueData.session.id,
            }}
            className="press block overflow-hidden rounded-[20px] border border-border bg-card shadow-soft transition-colors hover:border-foreground/20"
          >
            <div className="h-24">
              <JourneyCover journey={continueData.journey} className="h-full w-full" />
            </div>
            <div className="p-5">
              <p className="text-xs font-medium tracking-tight text-primary">
                {continueData.journey.title}
              </p>
              <h2 className="mt-1.5 text-[20px] font-semibold leading-snug tracking-tight">
                {continueData.chapter.title}
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Sessão: {continueData.sessionIndex + 1} de {continueData.chapter.sessions.length}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Continuar jornada</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* All journeys */}
      <section>
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Jornadas disponíveis
        </p>
        <div className="flex flex-col gap-3">
          {JOURNEYS.map((journey) => {
            const stats = getJourneyStats(journey, journey.id);
            return (
              <Link
                key={journey.id}
                to="/play"
                search={{ journey: journey.id }}
                className="press overflow-hidden rounded-[20px] border border-border bg-card shadow-soft transition-colors hover:border-foreground/15"
              >
                <div className="h-28">
                  <JourneyCover journey={journey} className="h-full w-full" />
                </div>
                <div className="p-5">
                  <h2 className="text-[17px] font-semibold tracking-tight">{journey.title}</h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {journey.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {stats.completedSessions} de {stats.totalSessions} sessões
                      </span>
                      <span className="text-border">·</span>
                      <span>{stats.pct}%</span>
                    </div>
                    <span className="flex items-center gap-1 text-[13px] font-medium text-primary">
                      {stats.completedSessions > 0 ? "Continuar" : "Começar"}
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                  </div>

                  {stats.completedSessions > 0 && (
                    <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                        style={{ width: `${stats.pct}%` }}
                      />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
