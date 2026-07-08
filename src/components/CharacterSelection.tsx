import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { CHARACTERS, setSelectedCharacter, type Character } from "@/data/characters";
import { CharacterPortrait } from "@/components/CharacterPortrait";
import { MemorizeMark } from "@/components/MemorizeMark";
import { useState } from "react";

interface CharacterSelectionProps {
  onSelect: () => void;
}

export function CharacterSelection({ onSelect }: CharacterSelectionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selected) {
      setSelectedCharacter(selected);
    }
    onSelect();
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          <h1 className="text-[26px] font-semibold leading-[1.15] tracking-tight text-foreground">
            Escolha um companheiro para sua jornada.
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
            Você poderá trocar quando quiser, no seu perfil.
          </p>
        </motion.div>

        <div className="mt-8 flex flex-col gap-3">
          {CHARACTERS.map((char, i) => (
            <CharacterOption
              key={char.id}
              character={char}
              index={i}
              selected={selected === char.id}
              onSelect={() => setSelected(char.id)}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-auto pt-8"
        >
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selected}
            className="press flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-foreground text-[14px] font-medium text-background transition-opacity disabled:opacity-30"
          >
            Continuar
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </motion.div>
      </div>
    </div>
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
      transition={{ duration: 0.45, delay: 0.12 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.985 }}
      className={
        "flex items-center gap-4 rounded-[20px] border p-4 text-left transition-colors " +
        (selected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-foreground/15")
      }
    >
      <CharacterPortrait character={character} size={56} />
      <div className="min-w-0 flex-1">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          {character.name}
        </h2>
        <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
          {character.description}
        </p>
      </div>
      {selected && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        </motion.div>
      )}
    </motion.button>
  );
}
