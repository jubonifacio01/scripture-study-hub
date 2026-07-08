import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  color?: "primary" | "accent" | "fun" | "success";
  onClick?: () => void;
  disabled?: boolean;
}

export function GameCard({
  title,
  description,
  icon,
  onClick,
  disabled = false,
}: GameCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="card-elevated press group w-full p-4 text-left disabled:opacity-60"
    >
      <div className="flex items-center gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-foreground">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold tracking-tight">{title}</h3>
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        </div>
        <ChevronRight
          strokeWidth={1.75}
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </button>
  );
}
