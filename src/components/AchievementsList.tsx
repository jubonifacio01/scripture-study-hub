import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CATEGORY_LABELS, type AchievementCategory } from "@/data/achievements";
import type { AchievementWithStatus } from "@/hooks/useAchievements";
import { Lock, Trophy, X } from "lucide-react";

interface AchievementsListProps {
  achievements: AchievementWithStatus[];
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  const [active, setActive] = useState<AchievementWithStatus | null>(null);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const categories = Array.from(
    new Set(achievements.map((a) => a.category)),
  ) as AchievementCategory[];

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Conquistas
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {unlockedCount}/{achievements.length}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {categories.map((cat) => {
          const items = achievements.filter((a) => a.category === cat);
          return (
            <div key={cat}>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {CATEGORY_LABELS[cat]}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {items.map((a) => {
                  const showSecret = a.secret && !a.unlocked;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setActive(a)}
                      className={
                        "press flex aspect-square flex-col items-center justify-center gap-1 rounded-[16px] border p-2 text-center " +
                        (a.unlocked ? "border-primary/25 bg-primary/5" : "border-border bg-card")
                      }
                    >
                      <div
                        className={
                          "grid h-8 w-8 place-items-center rounded-full " +
                          (a.unlocked
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        {a.unlocked ? (
                          <Trophy className="h-4 w-4" strokeWidth={1.75} />
                        ) : (
                          <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
                        )}
                      </div>
                      <p className="line-clamp-2 text-[10px] font-medium leading-tight text-foreground">
                        {showSecret ? "???" : a.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setActive(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-sm rounded-t-[28px] border border-border bg-card p-6 shadow-lift sm:rounded-[28px]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={
                      "grid h-11 w-11 shrink-0 place-items-center rounded-full " +
                      (active.unlocked
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground")
                    }
                  >
                    {active.unlocked ? (
                      <Trophy className="h-5 w-5" strokeWidth={1.75} />
                    ) : (
                      <Lock className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold tracking-tight">
                      {active.secret && !active.unlocked ? "Conquista secreta" : active.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {CATEGORY_LABELS[active.category]}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActive(null)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
                {active.secret && !active.unlocked
                  ? "Continue explorando o app para descobrir como desbloquear esta conquista."
                  : active.description}
              </p>
              {active.reward?.type === "companion" && (
                <p className="mt-3 text-[13px] font-medium text-primary">
                  {active.unlocked
                    ? "Recompensa desbloqueada: um novo companheiro."
                    : "Recompensa: um novo companheiro."}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
