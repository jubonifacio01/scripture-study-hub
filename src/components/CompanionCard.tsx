import { useEffect, useRef, useState } from "react";
import { CompanionPortrait } from "@/components/CompanionPortrait";
import { getCompanionForCharacter } from "@/data/companions";
import { ACHIEVEMENTS } from "@/data/achievements";
import { Lock } from "lucide-react";
import type { Character } from "@/data/characters";

interface CompanionCardProps {
  character: Character;
  unlockedCompanionIds: Set<string>;
}

// Matches the tap animation duration for each companion in styles.css.
const TAP_DURATION_MS: Record<string, number> = {
  sheep: 600,
  owl: 500,
  donkey: 550,
  fish: 500,
  vase: 600,
};

/**
 * The companion never speaks — no messages, no encouragement, no praise.
 * All of its personality comes through movement: a continuous idle
 * behavior loop, and a one-shot reaction when tapped.
 */
export function CompanionCard({ character, unlockedCompanionIds }: CompanionCardProps) {
  const companion = getCompanionForCharacter(character.id);
  const [reacting, setReacting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!companion) return null;

  const unlocked = unlockedCompanionIds.has(companion.id);
  const unlockAchievement = ACHIEVEMENTS.find(
    (a) => a.reward?.type === "companion" && a.reward.companionId === companion.id,
  );

  const handleTap = () => {
    if (!unlocked) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setReacting(true);
    const duration = TAP_DURATION_MS[companion.id] ?? 600;
    timeoutRef.current = setTimeout(() => setReacting(false), duration);
  };

  return (
    <div className="rounded-[20px] border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-4">
        <button
          onClick={handleTap}
          disabled={!unlocked}
          aria-label={unlocked ? companion.name : "Companheiro bloqueado"}
          className={
            "relative grid h-20 w-20 shrink-0 place-items-center rounded-full " +
            (unlocked ? "press bg-primary/5" : "cursor-default bg-muted")
          }
        >
          <CompanionPortrait
            companionId={companion.id}
            accent={character.accent}
            size={64}
            locked={!unlocked}
            idle={unlocked}
            reacting={reacting}
          />
          {!unlocked && (
            <div className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border border-border bg-card text-muted-foreground">
              <Lock className="h-3 w-3" strokeWidth={2} />
            </div>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold tracking-tight">
            {unlocked ? companion.name : "Companheiro bloqueado"}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {unlocked
              ? "Toque para observar."
              : (unlockAchievement?.description ?? "Continue estudando para desbloquear.")}
          </p>
        </div>
      </div>
    </div>
  );
}
