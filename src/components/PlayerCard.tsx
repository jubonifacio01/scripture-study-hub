import { Avatar } from "./Avatar";

interface PlayerCardProps {
  name: string;
  subtitle?: string;
  score?: number;
  rank?: number;
}

export function PlayerCard({ name, subtitle, score, rank }: PlayerCardProps) {
  return (
    <div className="card-elevated flex items-center gap-3 p-3">
      {rank ? (
        <span className="w-6 shrink-0 text-center text-xs font-medium tabular-nums text-muted-foreground">
          {rank}
        </span>
      ) : null}
      <Avatar name={name} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium tracking-tight">{name}</p>
        {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {typeof score === "number" ? (
        <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
          {score}
          <span className="ml-1 text-xs text-muted-foreground">XP</span>
        </span>
      ) : null}
    </div>
  );
}
