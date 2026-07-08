import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { Collection } from "@/types";

interface CollectionCardProps {
  collection: Collection;
  compact?: boolean;
}

export function CollectionCard({ collection, compact = false }: CollectionCardProps) {
  return (
    <Link
      to="/collections"
      className="card-elevated press group flex items-center gap-4 p-4"
    >
      <div
        className={
          "grid shrink-0 place-items-center rounded-xl bg-muted text-foreground " +
          (compact ? "h-11 w-11 text-xl" : "h-12 w-12 text-2xl")
        }
        aria-hidden
      >
        {collection.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold tracking-tight">
          {collection.name}
        </h3>
        <p className="truncate text-xs text-muted-foreground">
          {collection.itemIds.length} versículos
          {!compact && collection.description ? ` · ${collection.description}` : ""}
        </p>
      </div>
      <ChevronRight
        strokeWidth={1.75}
        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
