import type { ReactNode } from "react";

interface GameCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  color?: "primary" | "accent" | "fun" | "success";
  onClick?: () => void;
  disabled?: boolean;
}

const gradientMap = {
  primary: "gradient-primary",
  accent: "gradient-accent",
  fun: "gradient-fun",
  success: "bg-success",
} as const;

export function GameCard({
  title,
  description,
  icon,
  color = "primary",
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
        <div
          className={
            "grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-primary-foreground shadow-soft " +
            gradientMap[color]
          }
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-extrabold">{title}</h3>
          <p className="truncate text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}
