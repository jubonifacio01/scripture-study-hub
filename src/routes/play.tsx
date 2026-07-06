import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { GameCard } from "@/components/GameCard";
import { FillBlankGame } from "@/games/FillBlankGame";
import { MultipleChoiceGame } from "@/games/MultipleChoiceGame";
import { OrderWordsGame } from "@/games/OrderWordsGame";
import { ScoreCard } from "@/components/ScoreCard";
import { Button } from "@/components/ui/button";
import { collections } from "@/data/collections";
import { memoryItems, getItemById } from "@/data/memoryItems";
import { pickRandom } from "@/games/gameUtils";
import type { Difficulty, GameType, MemoryItem } from "@/types";
import { Blocks, ListChecks, TextCursorInput } from "lucide-react";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Jogar — Memorize+" },
      {
        name: "description",
        content: "Escolha uma coleção, a dificuldade e comece a memorizar jogando.",
      },
    ],
  }),
  component: PlayPage,
});

type Phase = "setup" | "playing" | "done";

const DIFFICULTIES: { id: Difficulty; label: string; hint: string }[] = [
  { id: "facil", label: "Fácil", hint: "Palavras curtas ausentes" },
  { id: "medio", label: "Médio", hint: "Reordenar frases" },
  { id: "dificil", label: "Difícil", hint: "Referências e ordem" },
];

const GAME_TYPES: {
  id: GameType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "primary" | "fun" | "accent";
}[] = [
  {
    id: "fill-blank",
    title: "Complete a palavra",
    description: "Preencha o espaço em branco",
    icon: <TextCursorInput className="h-6 w-6" />,
    color: "primary",
  },
  {
    id: "multiple-choice",
    title: "Escolha múltipla",
    description: "Identifique a referência correta",
    icon: <ListChecks className="h-6 w-6" />,
    color: "accent",
  },
  {
    id: "order-words",
    title: "Ordene as palavras",
    description: "Monte o versículo na ordem certa",
    icon: <Blocks className="h-6 w-6" />,
    color: "fun",
  },
];

function PlayPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("setup");
  const [collectionId, setCollectionId] = useState(collections[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>("medio");
  const [count, setCount] = useState(5);
  const [gameType, setGameType] = useState<GameType>("fill-blank");
  const [queue, setQueue] = useState<MemoryItem[]>([]);
  const [step, setStep] = useState(0);
  const [correct, setCorrect] = useState(0);

  const start = (type: GameType) => {
    const col = collections.find((c) => c.id === collectionId)!;
    const items = col.itemIds.map(getItemById).filter(Boolean) as MemoryItem[];
    const q = pickRandom(items, Math.min(count, items.length));
    setQueue(q);
    setStep(0);
    setCorrect(0);
    setGameType(type);
    setPhase("playing");
  };

  const onAnswer = (isRight: boolean) => {
    const nextCorrect = correct + (isRight ? 1 : 0);
    if (step + 1 >= queue.length) {
      setCorrect(nextCorrect);
      setPhase("done");
    } else {
      setCorrect(nextCorrect);
      setStep((s) => s + 1);
    }
  };

  if (phase === "playing") {
    const item = queue[step];
    return (
      <AppLayout>
        <Header
          subtitle={`Rodada ${step + 1} de ${queue.length}`}
          title="Foco total 🔥"
          right={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPhase("setup")}
              className="rounded-xl"
            >
              Sair
            </Button>
          }
        />
        <div className="mt-4">
          {gameType === "fill-blank" ? (
            <FillBlankGame
              item={item}
              step={step + 1}
              total={queue.length}
              bank={memoryItems}
              onAnswer={onAnswer}
            />
          ) : gameType === "multiple-choice" ? (
            <MultipleChoiceGame
              item={item}
              step={step + 1}
              total={queue.length}
              bank={memoryItems}
              onAnswer={onAnswer}
            />
          ) : (
            <OrderWordsGame
              item={item}
              step={step + 1}
              total={queue.length}
              onAnswer={onAnswer}
            />
          )}
        </div>
      </AppLayout>
    );
  }

  if (phase === "done") {
    return (
      <AppLayout>
        <Header subtitle="Resultado" title="Bom trabalho!" />
        <div className="mt-5">
          <ScoreCard
            result={{ correct, total: queue.length, xpEarned: correct * 10 }}
            onPlayAgain={() => start(gameType)}
            onExit={() => navigate({ to: "/" })}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Header subtitle="Nova partida" title="Jogar Agora" />

      <Section title="Coleção">
        <div className="flex flex-col gap-2">
          {collections.map((c) => {
            const active = c.id === collectionId;
            return (
              <button
                key={c.id}
                onClick={() => setCollectionId(c.id)}
                className={
                  "press flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition " +
                  (active
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card")
                }
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl gradient-primary text-xl text-primary-foreground">
                  {c.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display font-extrabold">
                    {c.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {c.itemIds.length} versículos
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Dificuldade">
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTIES.map((d) => {
            const active = d.id === difficulty;
            return (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={
                  "press rounded-2xl border-2 p-3 text-center transition " +
                  (active ? "border-primary bg-primary/5" : "border-border")
                }
              >
                <p className="font-display text-sm font-black">{d.label}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{d.hint}</p>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Quantidade de questões">
        <div className="grid grid-cols-4 gap-2">
          {[3, 5, 8, 10].map((n) => {
            const active = n === count;
            return (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={
                  "press rounded-2xl border-2 py-3 text-center font-display font-black transition " +
                  (active ? "border-primary bg-primary/5 text-primary" : "border-border")
                }
              >
                {n}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Escolha um desafio">
        <div className="flex flex-col gap-3">
          {GAME_TYPES.map((g) => (
            <GameCard
              key={g.id}
              title={g.title}
              description={g.description}
              icon={g.icon}
              color={g.color}
              onClick={() => start(g.id)}
            />
          ))}
        </div>
      </Section>
    </AppLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 font-display text-sm font-black uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}
