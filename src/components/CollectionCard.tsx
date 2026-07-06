import { Link } from "@tanstack/react-router";
import type { Collection } from "@/types";

const colorMap: Record<Collection["color"], string> = {
  primary: "gradient-primary",
  accent: "gradient-accent",
  success: "bg-success",
  fun: "gradient-fun",
  warning: "bg-warning",
};

interface CollectionCardProps {
  collection: Collection;
  compact?: boolean;
}

export function CollectionCard({ collection, compact = false }: CollectionCardProps) {
  const gradient = colorMap[collection.color];
  return (
    <Link
      to="/collections"
      className="card-elevated press group block overflow-hidden p-4"
    >
      <div className="flex items-center gap-3">
        <div
          className={
            "grid place-items-center rounded-2xl text-3xl text-primary-foreground shadow-soft " +
            gradient +
            " " +
            (compact ? "h-12 w-12 text-2xl" : "h-14 w-14")
          }
          aria-hidden
        >
          {collection.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-extrabold">
            {collection.name}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {collection.itemIds.length} versículos
          </p>
        </div>
      </div>
      {!compact ? (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {collection.description}
        </p>
      ) : null}
    </Link>
  );
}
