import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { GameCard } from "@/components/GameCard";
import { FillBlankGame } from "@/games/FillBlankGame";
import { MultipleChoiceGame } from "@/games/MultipleChoiceGame";
import { OrderWordsGame } from "@/games/OrderWordsGame";
import { ScoreCard } from "@/components/ScoreCard";
import { CountdownOverlay } from "@/components/CountdownOverlay";
import { Timer } from "@/components/Timer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { loadObjectives, getObjectiveItems, loadCustomItems, markObjectiveStudied } from "@/data/objectives";
import { memoryItems } from "@/data/memoryItems";
import { pickRandom } from "@/games/gameUtils";
import type { Difficulty, GameType, MemoryItem, Objective } from "@/types";
import { Blocks, ListChecks, TextCursorInput, BookOpen } from "lucide-react";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Praticar — Memorize+" },
      {
        name: "description",
        content: "Escolha um objetivo, a dificuldade e comece a memorizar.",
      },
    ],
  }),
  component: PlayPage,
  validateSearch: (search: Record<string, unknown>) => ({
    objective: (search.objective as string) || undefined,
  }),
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
    icon: <TextCursorInput className="h-[18px] w-[18px]" strokeWidth={1.75} />,
    color: "primary",
  },
  {
    id: "multiple-choice",
    title: "Escolha múltipla",
    description: "Identifique a referência correta",
    icon: <ListChecks className="h-[18px] w-[18px]" strokeWidth={1.75} />,
    color: "accent",
  },
  {
    id: "order-words",
    title: "Ordene as palavras",
    description: "Monte o versículo na ordem certa",
    icon: <Blocks className="h-[18px] w-[18px]" strokeWidth={1.75} />,
    color: "fun",
  },
];

function PlayPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [phase, setPhase] = useState<Phase>("setup");
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [customItems, setCustomItems] = useState<MemoryItem[]>([]);
  const [objectiveId, setObjectiveId] = useState<string | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<Difficulty>("medio");
  const [count, setCount] = useState(5);
  const [gameType, setGameType] = useState<GameType>("fill-blank");
  const [queue, setQueue] = useState<MemoryItem[]>([]);
  const [step, setStep] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [countdown, setCountdown] = useState(false);

  useEffect(() => {
    const objs = loadObjectives();
    setObjectives(objs);
    setCustomItems(loadCustomItems());
    if (search.objective) {
      setObjectiveId(search.objective);
    } else if (objs.length > 0) {
      setObjectiveId(objs[0].id);
    }
  }, []);

  const activeObjective = objectives.find((o) => o.id === objectiveId);
  const availableItems = activeObjective
    ? getObjectiveItems(activeObjective, customItems)
    : [];

  const start = (type: GameType) => {
    if (!activeObjective || availableItems.length === 0) return;
    const q = pickRandom(availableItems, Math.min(count, availableItems.length));
    setQueue(q);
    setStep(0);
    setCorrect(0);
    setCombo(0);
    setGameType(type);
    setCountdown(true);
    // Mark objective as studied
    const updated = markObjectiveStudied(activeObjective.id, objectives);
    setObjectives(updated);
  };

  const onAnswer = (isRight: boolean) => {
    const nextCorrect = correct + (isRight ? 1 : 0);
    const nextCombo = isRight ? combo + 1 : 0;
    setCombo(nextCombo);
    if (step + 1 >= queue.length) {
      setCorrect(nextCorrect);
      setPhase("done");
    } else {
      setCorrect(nextCorrect);
      setStep((s) => s + 1);
    }
  };

  if (phase === "playing" || countdown) {
    const item = queue[step];
    return (
      <AppLayout>
        {countdown ? (
          <CountdownOverlay
            onDone={() => {
              setCountdown(false);
              setPhase("playing");
            }}
          />
        ) : null}
        <Header
          subtitle={`Rodada ${step + 1} de ${queue.length}`}
          title="Sessão em foco"
          right={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCountdown(false);
                setPhase("setup");
              }}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              Sair
            </Button>
          }
        />

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-border bg-card px-2.5 py-1 text-xs tabular-nums">
              <span className="text-muted-foreground">Pontos </span>
              <span className="font-medium text-foreground">{correct * 10}</span>
            </div>
            <AnimatePresence>
              {combo >= 2 && (
                <motion.div
                  key={combo}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {combo}× seguidas
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {phase === "playing" ? <Timer seconds={30} running /> : null}
        </div>

        <div className="mt-4">
          <AnimatePresence mode="wait">
            {phase === "playing" && item ? (
              <div key={item.id + step}>
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
            ) : null}
          </AnimatePresence>
        </div>
      </AppLayout>
    );
  }

  if (phase === "done") {
    return (
      <AppLayout>
        <Header subtitle="Resultado" title="Bem feito." />
        <div className="mt-6">
          <ScoreCard
            result={{ correct, total: queue.length, xpEarned: correct * 10 }}
            onPlayAgain={() => start(gameType)}
            onExit={() => navigate({ to: "/" })}
          />
        </div>
      </AppLayout>
    );
  }

  // --- Setup phase ---
  return (
    <AppLayout>
      <Header subtitle="Nova sessão" title="Praticar" />

      {objectives.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<BookOpen className="h-5 w-5" strokeWidth={1.5} />}
            title="Nenhum objetivo ainda"
            description="Crie um objetivo na Biblioteca e adicione textos para começar a praticar."
            action={
              <Button
                onClick={() => navigate({ to: "/collections" })}
                className="h-11 rounded-[16px] bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Ir para a Biblioteca
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <Section title="Objetivo">
            <div className="flex flex-col gap-2">
              {objectives.map((o) => {
                const active = o.id === objectiveId;
                const itemCount = getObjectiveItems(o, customItems).length;
                return (
                  <button
                    key={o.id}
                    onClick={() => setObjectiveId(o.id)}
                    className={
                      "press flex items-center gap-3 rounded-[16px] border p-3.5 text-left transition-colors " +
                      (active
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-foreground/15")
                    }
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-muted text-foreground">
                      <BookOpen className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium tracking-tight">
                        {o.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {itemCount} {itemCount === 1 ? "texto" : "textos"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>

          {activeObjective && availableItems.length === 0 && (
            <div className="mt-6">
              <EmptyState
                icon={<BookOpen className="h-5 w-5" strokeWidth={1.5} />}
                title="Este objetivo não tem textos"
                description="Adicione textos a este objetivo na Biblioteca para começar a praticar."
                action={
                  <Button
                    onClick={() =>
                      navigate({
                        to: "/collections",
                        search: { objective: activeObjective.id },
                      })
                    }
                    variant="outline"
                    className="h-11 rounded-[16px]"
                  >
                    Adicionar textos
                  </Button>
                }
              />
            </div>
          )}

          {activeObjective && availableItems.length > 0 && (
            <>
              <Section title="Dificuldade">
                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTIES.map((d) => {
                    const active = d.id === difficulty;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setDifficulty(d.id)}
                        className={
                          "press rounded-[14px] border p-3.5 text-center transition-colors " +
                          (active
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card hover:border-foreground/15")
                        }
                      >
                        <p className="text-[13px] font-medium tracking-tight">{d.label}</p>
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
                          "press rounded-[14px] border py-3 text-center text-[15px] font-medium tabular-nums tracking-tight transition-colors " +
                          (active
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-card hover:border-foreground/15")
                        }
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section title="Escolha um desafio">
                <div className="flex flex-col gap-2">
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
            </>
          )}
        </>
      )}
    </AppLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}
