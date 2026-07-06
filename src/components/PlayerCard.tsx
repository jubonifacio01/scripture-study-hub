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
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-muted font-black text-muted-foreground">
          {rank}
        </span>
      ) : null}
      <Avatar name={name} size={44} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display font-extrabold">{name}</p>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {typeof score === "number" ? (
        <span className="shrink-0 rounded-xl gradient-primary px-3 py-1 text-sm font-black text-primary-foreground">
          {score} XP
        </span>
      ) : null}
    </div>
  );
}
