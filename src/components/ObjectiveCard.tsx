import { Link } from "@tanstack/react-router";
import { ChevronRight, FileText, Clock } from "lucide-react";
import type { Objective } from "@/types";
import { formatLastActivity } from "@/data/objectives";

interface ObjectiveCardProps {
  objective: Objective;
  compact?: boolean;
}

export function ObjectiveCard({ objective, compact = false }: ObjectiveCardProps) {
  // Derive count directly from DB-provided itemIds. No local state.
  const totalTexts = objective.itemIds.length;
  const lastActivityLabel = formatLastActivity(objective.lastStudiedAt);

  return (
    <Link
      to="/collections"
      search={{ objective: objective.id }}
      className="card-elevated press group flex items-center gap-4 p-4 transition-colors hover:border-foreground/15"
    >
      <div
        className={
          "grid shrink-0 place-items-center rounded-[14px] bg-muted text-foreground " +
          (compact ? "h-11 w-11" : "h-12 w-12")
        }
      >
        <FileText className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold tracking-tight">
          {objective.name}
        </h3>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" strokeWidth={1.75} />
            {progress.totalTexts} {progress.totalTexts === 1 ? "texto" : "textos"}
          </span>
          {!compact && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" strokeWidth={1.75} />
              {progress.lastActivityLabel}
            </span>
          )}
        </div>
      </div>
      {!compact && progress.totalTexts > 0 && (
        <div className="shrink-0 text-right">
          <p className="text-[13px] font-semibold tabular-nums text-foreground">
            {progress.masteryPct}%
          </p>
          <p className="text-[10px] text-muted-foreground">domínio</p>
        </div>
      )}
      <ChevronRight
        strokeWidth={1.75}
        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
