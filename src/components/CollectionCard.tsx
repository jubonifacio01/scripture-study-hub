import { ObjectiveCard } from "@/components/ObjectiveCard";
import type { Collection } from "@/types";
import { loadObjectives } from "@/data/objectives";

interface CollectionCardProps {
  collection: Collection;
  compact?: boolean;
}

/**
 * @deprecated Use ObjectiveCard instead.
 * Delegates to ObjectiveCard by finding the matching objective.
 */
export function CollectionCard({ collection, compact = false }: CollectionCardProps) {
  const objectives = loadObjectives();
  const objective = objectives.find((o) => o.id === collection.id);
  if (!objective) return null;
  return <ObjectiveCard objective={objective} compact={compact} />;
}
