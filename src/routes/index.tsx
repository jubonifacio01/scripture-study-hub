import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { ModeSwitcher } from "@/components/ModeSwitcher";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { StudyHomeContent } from "@/components/StudyHomeContent";
import { JourneyHomeContent } from "@/components/JourneyHomeContent";
import { useAppMode } from "@/hooks/useAppMode";
import { getSelectedCharacter, getCharacterById, CHARACTERS } from "@/data/characters";
import { demoUser } from "@/data/user";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { mode, setMode, ready } = useAppMode();
  const u = demoUser;
  const charId = getSelectedCharacter();
  const character = getCharacterById(charId) ?? CHARACTERS[0];
  const firstName = u.name.split(" ")[0];

  if (!ready) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!mode) {
    return <OnboardingScreen onSelect={setMode} />;
  }

  return (
    <AppLayout>
      <Header
        subtitle={`Bom dia, ${firstName}`}
        title={mode === "study" ? "Um pequeno passo hoje." : "Sua jornada aguarda."}
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
          {mode === "study" ? <StudyHomeContent /> : <JourneyHomeContent />}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}
