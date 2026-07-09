import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { Avatar } from "@/components/Avatar";
import { CharacterPortrait } from "@/components/CharacterPortrait";
import { XPBar } from "@/components/XPBar";
import { Button } from "@/components/ui/button";
import { demoUser } from "@/data/user";
import {
  CHARACTERS,
  getSelectedCharacter,
  setSelectedCharacter,
  getCharacterById,
} from "@/data/characters";
import { useAppMode } from "@/hooks/useAppMode";
import { Flame, Target, BookOpen, Trophy, Check, Pencil, X, CircleCheck as CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Perfil — Memorize+" },
      { name: "description", content: "Seu progresso, sequência e estatísticas." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const u = demoUser;
  const { userName, setUserName } = useAppMode();
  const [selectedChar, setSelectedChar] = useState(getSelectedCharacter());
  const [showCharacterPicker, setShowCharacterPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  const handleSelectCharacter = (id: string) => {
    setSelectedCharacter(id);
    setSelectedCharacter(id);
    setShowCharacterPicker(false);
    toast("Personagem atualizado.");
  };

  const handleStartEditName = () => {
    setTempName(userName || "");
    setEditingName(true);
  };

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      setUserName(trimmed);
      toast("Nome atualizado.");
    }
    setEditingName(false);
  };

  const handleCancelEditName = () => {
    setEditingName(false);
    setTempName("");
  };

  const currentCharacter = getCharacterById(selectedChar) ?? CHARACTERS[0];
  const displayName = userName || "Peregrino";

  return (
    <AppLayout>
      <Header subtitle="Sua conta" title="Perfil" />

      <div className="mt-8 flex flex-col gap-6">
        <section className="flex items-center gap-4">
          <Avatar size={64} />
          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") handleCancelEditName();
                  }}
                  autoFocus
                  className="h-9 flex-1 rounded-[10px] border border-border bg-background px-3 text-[15px] text-foreground focus:border-foreground/30 focus:outline-none"
                />
                <button
                  onClick={handleCancelEditName}
                  className="grid h-9 w-9 place-items-center rounded-[10px] text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSaveName}
                  className="grid h-9 w-9 place-items-center rounded-[10px] bg-primary text-primary-foreground"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="truncate text-lg font-semibold tracking-tight">{displayName}</h2>
                <button
                  onClick={handleStartEditName}
                  className="grid h-7 w-7 place-items-center rounded-[8px] text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {currentCharacter.name} · Nível {u.level}
            </p>
          </div>
        </section>

        <section className="card-elevated p-5">
          <XPBar xp={u.xp} xpToNext={u.xpToNext} level={u.level} />
          <p className="mt-3 text-xs text-muted-foreground">
            Faltam <span className="font-medium text-foreground tabular-nums">{u.xpToNext - u.xp} XP</span> para o próximo nível.
          </p>
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Seu personagem
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCharacterPicker(true)}
              className="rounded-full text-[13px] font-medium text-primary hover:text-primary"
            >
              Personalizar
            </Button>
          </div>
          <div className="card-elevated flex items-center gap-4 p-4">
            <CharacterPortrait character={currentCharacter} size={56} />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold tracking-tight">
                {currentCharacter.name}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {currentCharacter.description}
              </p>
            </div>
          </div>
        </section>

        <section>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Estatísticas
          </p>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-border bg-border shadow-soft">
            <StatCell icon={<Flame className="h-4 w-4" strokeWidth={1.75} />} value={`${u.streak} dias`} label="Sequência" />
            <StatCell icon={<BookOpen className="h-4 w-4" strokeWidth={1.75} />} value={`${u.itemsStudied}`} label="Versículos" />
            <StatCell icon={<Target className="h-4 w-4" strokeWidth={1.75} />} value={`${u.accuracy}%`} label="Precisão" />
            <StatCell icon={<Trophy className="h-4 w-4" strokeWidth={1.75} />} value={`${u.xp}`} label="XP total" />
          </div>
        </section>

        <section>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Conquistas
          </p>
          <div className="card-elevated p-6 text-center">
            <p className="text-sm font-medium">Em breve</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Conquistas, ranking e personagens chegam nas próximas versões.
            </p>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showCharacterPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCharacterPicker(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-[28px] border border-border bg-card p-6 shadow-lift sm:rounded-[28px]"
            >
              <h2 className="text-[18px] font-semibold tracking-tight">
                Escolha seu personagem
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Seu companheiro durante os estudos.
              </p>

              <div className="mt-5 flex flex-col gap-2.5">
                {CHARACTERS.map((char) => {
                  const active = char.id === selectedChar;
                  return (
                    <button
                      key={char.id}
                      onClick={() => handleSelectCharacter(char.id)}
                      className={
                        "press flex items-center gap-4 rounded-[18px] border p-3.5 text-left transition-colors " +
                        (active
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-foreground/15")
                      }
                    >
                      <CharacterPortrait character={char} size={48} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold tracking-tight">
                          {char.name}
                        </p>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                          {char.description}
                        </p>
                      </div>
                      {active && (
                        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

function StatCell({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-card p-4">
      <div className="text-muted-foreground">{icon}</div>
      <p className="mt-3 text-lg font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
