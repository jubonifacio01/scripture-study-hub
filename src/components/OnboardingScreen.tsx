import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Landmark, ArrowRight } from "lucide-react";
import type { AppMode } from "@/hooks/useAppMode";
import { MemorizeMark } from "@/components/MemorizeMark";
import { CHARACTERS, setSelectedCharacter, type Character } from "@/data/characters";
import { CharacterPortrait } from "@/components/CharacterPortrait";

interface OnboardingScreenProps {
  onSelect: (mode: AppMode, userName: string) => void;
}

type Phase = "name" | "character" | "mode";

export function OnboardingScreen({ onSelect }: OnboardingScreenProps) {
  const [phase, setPhase] = useState<Phase>("name");
  const [userName, setUserName] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [chosenMode, setChosenMode] = useState<AppMode | null>(null);

  const handleNameSubmit = () => {
    if (userName.trim()) {
      setPhase("character");
    }
  };

  const handleCharacterConfirm = () => {
    if (selectedCharacter) {
      setSelectedCharacter(selectedCharacter);
      setPhase("mode");
    }
  };

  const handleModeSelect = (mode: AppMode) => {
    setChosenMode(mode);
    if (selectedCharacter) {
      setSelectedCharacter(selectedCharacter);
    }
    onSelect(mode, userName.trim());
  };

  return (
    <div className="min-h-screen bg-background">
      <div
        className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6"
        style={{
          paddingTop: "max(3rem, env(safe-area-inset-top))",
          paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
        }}
      >
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2 pt-10"
        >
          <MemorizeMark size={22} strokeWidth={1.5} className="text-foreground" />
          <span className="text-[13px] font-semibold tracking-tight text-foreground">
            Memorize+
          </span>
        </motion.header>

        <AnimatePresence mode="wait">
          {phase === "name" && (
            <NameStep
              key="name"
              userName={userName}
              onUserNameChange={setUserName}
              onSubmit={handleNameSubmit}
            />
          )}
          {phase === "character" && (
            <CharacterStep
              key="character"
              selected={selectedCharacter}
              onSelect={setSelectedCharacter}
              onConfirm={handleCharacterConfirm}
            />
          )}
          {phase === "mode" && <ModeStep key="mode" onSelect={handleModeSelect} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NameStep({
  userName,
  onUserNameChange,
  onSubmit,
}: {
  userName: string;
  onUserNameChange: (name: string) => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mt-16"
      >
        <h1 className="text-[28px] font-semibold leading-[1.15] tracking-tight text-foreground">
          Bem-vindo ao Memorium
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Sua biblioteca pessoal para aprender e memorizar textos bíblicos.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10"
      >
        <label className="text-[14px] font-medium text-foreground">
          Como você gostaria de ser chamado?
        </label>
        <input
          type="text"
          value={userName}
          onChange={(e) => onUserNameChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder="Digite seu nome"
          className="mt-3 h-12 w-full rounded-[14px] border border-border bg-background px-4 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/30 focus:outline-none"
          autoFocus
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mt-auto pt-8"
      >
        <button
          type="button"
          onClick={onSubmit}
          disabled={!userName.trim()}
          className="press flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-foreground text-[14px] font-medium text-background transition-opacity disabled:opacity-30"
        >
          Continuar
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </motion.div>
    </>
  );
}

function CharacterStep({
  selected,
  onSelect,
  onConfirm,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mt-12"
      >
        <h1 className="text-[26px] font-semibold leading-[1.15] tracking-tight text-foreground">
          Escolha seu companheiro de jornada.
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 grid grid-cols-2 gap-3"
      >
        {CHARACTERS.map((char, i) => (
          <CharacterOption
            key={char.id}
            character={char}
            index={i}
            selected={selected === char.id}
            onSelect={() => onSelect(char.id)}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mt-auto pt-6"
      >
        <button
          type="button"
          onClick={onConfirm}
          disabled={!selected}
          className="press flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-foreground text-[14px] font-medium text-background transition-opacity disabled:opacity-30"
        >
          Continuar
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </motion.div>
    </>
  );
}

function CharacterOption({
  character,
  index,
  selected,
  onSelect,
}: {
  character: Character;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.97 }}
      className={
        "flex flex-col items-center gap-2 rounded-[18px] border p-4 text-center transition-colors " +
        (selected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-foreground/15")
      }
    >
      <CharacterPortrait character={character} size={64} />
      <span className="text-[13px] font-medium text-foreground">{character.name}</span>
    </motion.button>
  );
}

function ModeStep({ onSelect }: { onSelect: (mode: AppMode) => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mt-12"
      >
        <h1 className="text-[26px] font-semibold leading-[1.15] tracking-tight text-foreground">
          Como você deseja estudar hoje?
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 flex flex-1 flex-col gap-4"
      >
        <ModeCard
          index={0}
          icon={<BookOpen className="h-5 w-5" strokeWidth={1.5} />}
          title="Modo Estudo"
          description="Crie sua própria biblioteca e memorize textos no seu ritmo."
          onClick={() => onSelect("study")}
        />
        <ModeCard
          index={1}
          icon={<Landmark className="h-5 w-5" strokeWidth={1.5} />}
          title="Modo Jornada"
          description="Explore personagens, acontecimentos e temas bíblicos através de jornadas guiadas."
          onClick={() => onSelect("journey")}
        />
      </motion.div>
    </>
  );
}

interface ModeCardProps {
  index: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function ModeCard({ index, icon, title, description, onClick }: ModeCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: 0.15 + index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileTap={{ scale: 0.985 }}
      className="group w-full rounded-[20px] border border-border bg-card p-5 text-left shadow-soft transition-colors hover:border-foreground/15"
    >
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-muted text-foreground">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.button>
  );
}
