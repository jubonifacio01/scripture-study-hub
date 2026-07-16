import { createContext, useContext, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAchievements, type AchievementWithStatus } from "@/hooks/useAchievements";
import { getCompanionById } from "@/data/companions";
import { getCharacterById } from "@/data/characters";
import { CompanionPortrait } from "@/components/CompanionPortrait";
import { Trophy } from "lucide-react";

interface AchievementsContextValue {
  achievements: AchievementWithStatus[];
  unlockedCompanionIds: Set<string>;
}

const AchievementsContext = createContext<AchievementsContextValue | null>(null);

export function useAchievementsContext() {
  const ctx = useContext(AchievementsContext);
  if (!ctx) {
    throw new Error("useAchievementsContext must be used within AchievementsProvider");
  }
  return ctx;
}

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const { achievements, unlockedCompanionIds, justUnlocked, dismissJustUnlocked } =
    useAchievements();
  const current = justUnlocked[0] ?? null;
  const companion =
    current?.reward?.type === "companion"
      ? getCompanionById(current.reward.companionId)
      : undefined;
  const character = companion ? getCharacterById(companion.characterId) : undefined;

  return (
    <AchievementsContext.Provider value={{ achievements, unlockedCompanionIds }}>
      {children}

      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => dismissJustUnlocked(current.id)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-sm rounded-[28px] border border-border bg-card p-7 text-center shadow-lift"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                Conquista desbloqueada
              </p>

              {companion && character ? (
                <motion.div
                  initial={{ scale: 0.6, rotate: -6 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto mt-4 h-24 w-24"
                >
                  <CompanionPortrait
                    companionId={companion.id}
                    accent={character.accent}
                    size={96}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.6, rotate: -6 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto mt-4 grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary"
                >
                  <Trophy className="h-8 w-8" strokeWidth={1.75} />
                </motion.div>
              )}

              <h2 className="mt-4 text-lg font-semibold tracking-tight">{current.title}</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {current.description}
              </p>

              {companion && (
                <p className="mt-3 text-[13px] font-medium text-primary">
                  Novo companheiro: {companion.name}
                </p>
              )}

              <button
                onClick={() => dismissJustUnlocked(current.id)}
                className="press mt-6 h-11 w-full rounded-xl bg-primary text-sm font-medium text-primary-foreground"
              >
                Continuar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AchievementsContext.Provider>
  );
}
