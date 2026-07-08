import { motion } from "framer-motion";
import { BookOpen, Landmark, ArrowRight } from "lucide-react";
import type { AppMode } from "@/hooks/useAppMode";

interface OnboardingScreenProps {
  onSelect: (mode: AppMode) => void;
}

export function OnboardingScreen({ onSelect }: OnboardingScreenProps) {
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
          className="pt-10"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Memorize+
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          <h1 className="text-[28px] font-semibold leading-[1.15] tracking-tight text-foreground">
            Como você deseja estudar hoje?
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Escolha uma experiência para começar. Você poderá alternar entre os modos a qualquer
            momento.
          </p>
        </motion.div>

        <div className="mt-12 flex flex-col gap-4">
          <ModeCard
            index={0}
            icon={<BookOpen className="h-5 w-5" strokeWidth={1.5} />}
            emoji="📚"
            title="Modo Estudo"
            description="Organize seus próprios textos, crie objetivos e fortaleça sua memória diariamente."
            buttonLabel="Começar"
            onClick={() => onSelect("study")}
          />
          <ModeCard
            index={1}
            icon={<Landmark className="h-5 w-5" strokeWidth={1.5} />}
            emoji="🏛️"
            title="Modo Jornada"
            description="Explore personagens, acontecimentos e temas bíblicos através de jornadas guiadas de aprendizado."
            buttonLabel="Explorar"
            onClick={() => onSelect("journey")}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-auto pt-12 text-center text-[11px] font-medium tracking-[0.14em] text-muted-foreground/70"
        >
          Sem conta necessária para começar
        </motion.p>
      </div>
    </div>
  );
}

interface ModeCardProps {
  index: number;
  icon: React.ReactNode;
  emoji: string;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
}

function ModeCard({ index, icon, emoji, title, description, buttonLabel, onClick }: ModeCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.18 + index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileTap={{ scale: 0.985 }}
      className="group w-full rounded-2xl border border-border bg-card p-6 text-left shadow-soft transition-colors hover:border-foreground/15"
    >
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-muted text-foreground">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden>
              {emoji}
            </span>
            <h2 className="text-[17px] font-semibold tracking-tight text-foreground">{title}</h2>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-[13px] font-medium text-primary">{buttonLabel}</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background transition-transform duration-200 group-hover:translate-x-0.5">
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
    </motion.button>
  );
}
