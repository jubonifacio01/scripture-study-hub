import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { ModeSwitcher } from "@/components/ModeSwitcher";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { StudyHomeContent } from "@/components/StudyHomeContent";
import { JourneyHomeContent } from "@/components/JourneyHomeContent";
import { useAppMode } from "@/hooks/useAppMode";
import { useUserStats, getTimeBasedGreeting, getAppSubtitle } from "@/hooks/useUserStats";
import { fetchObjectives } from "@/services/ObjectiveService";
import type { Objective, MemoryItem } from "@/types";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { mode, setMode, userName, setUserName, ready } = useAppMode();
  const stats = useUserStats();

  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [itemsMap, setItemsMap] = useState<Record<string, MemoryItem[]>>({});

  useEffect(() => {
    fetchObjectives().then(({ data }) => {
      if (!data) return;
      setObjectives(data.map((r) => r.objective));
      const map: Record<string, MemoryItem[]> = {};
      for (const r of data) map[r.objective.id] = r.items;
      setItemsMap(map);
    });
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!mode) {
    return (
      <OnboardingScreen
        onSelect={(selectedMode, name) => {
          setUserName(name);
          setMode(selectedMode);
        }}
      />
    );
  }

  const displayName = userName || "Peregrino";
  const greeting = getTimeBasedGreeting();
  const subtitle = getAppSubtitle(mode, stats);

  return (
    <AppLayout>
      <Header
        subtitle={`${greeting}, ${displayName}.`}
        title={subtitle}
        right={<ModeSwitcher mode={mode} onChange={setMode} />}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {mode === "study" ? (
            <StudyHomeContent
              stats={stats}
              objectives={objectives}
              itemsMap={itemsMap}
            />
          ) : (
            <JourneyHomeContent
              lastStudyDate={stats.lastStudyDate}
              sessionsCompleted={stats.sessionsCompleted}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}
