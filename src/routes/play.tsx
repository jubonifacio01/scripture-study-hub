import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
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
import { JourneyCover } from "@/components/JourneyCover";
import { fetchObjectives } from "@/services/ObjectiveService";
import { saveSessionProgress } from "@/services/ProgressService";
import { invalidateUserStats } from "@/hooks/useUserStats";
import { recordSessionXP } from "@/hooks/useXPTracking";
import { getJourneyById } from "@/data/journeyContent";
import {
  getJourneyStats,
  getChapterStats,
  getLastActiveSession,
  markSessionComplete,
  type JourneySession,
  type JourneyChapter,
} from "@/data/journeys";
import { pickRandom } from "@/games/gameUtils";
import type { Difficulty, GameType, MemoryItem, Objective } from "@/types";
import type { Journey } from "@/data/journeys";
import { Blocks, ListChecks, TextCursorInput, BookOpen, ArrowLeft, ArrowRight, Check, BookMarked, FileText, Users, Calendar, Sparkles, Loader as Loader2 } from "lucide-react";

type Phase = "setup" | "playing" | "done";
type JourneyPhase = "chapters" | "intro" | "reading" | "challenges" | "conclusion";

const DIFFICULTIES: {
  id: Difficulty;
  label: string;
  hint: string;
  gameType: GameType | "random";
}[] = [
  { id: "facil", label: "Fácil", hint: "Múltipla escolha", gameType: "multiple-choice" },
  { id: "medio", label: "Médio", hint: "Completar palavras", gameType: "fill-blank" },
  { id: "dificil", label: "Difícil", hint: "Ordenar palavras", gameType: "order-words" },
  { id: "aleatorio", label: "Aleatório", hint: "Mistura de desafios", gameType: "random" },
];

const QUESTION_COUNTS = [5, 10, 20] as const;

function getGameTypeForDifficulty(difficulty: Difficulty): GameType {
  const diff = DIFFICULTIES.find((d) => d.id === difficulty);
  if (!diff || diff.gameType === "random") {
    const types: GameType[] = ["multiple-choice", "fill-blank", "order-words"];
    return types[Math.floor(Math.random() * types.length)];
  }
  return diff.gameType;
}

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
    journey: (search.journey as string) || undefined,
    chapter: (search.chapter as string) || undefined,
    session: (search.session as string) || undefined,
  }),
});

function PlayPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  // Journey mode
  const [journey, setJourney] = useState<Journey | null>(null);
  const [journeyPhase, setJourneyPhase] = useState<JourneyPhase>("chapters");
  const [activeChapter, setActiveChapter] = useState<JourneyChapter | null>(null);
  const [activeSession, setActiveSession] = useState<JourneySession | null>(null);

  // Objective mode
  const [phase, setPhase] = useState<Phase>("setup");
  const [loading, setLoading] = useState(false);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  // All items across all objectives — used as the bank for distractor generation
  const [allItems, setAllItems] = useState<MemoryItem[]>([]);
  // Items per objective
  const [itemsMap, setItemsMap] = useState<Record<string, MemoryItem[]>>({});
  const [objectiveId, setObjectiveId] = useState<string | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<Difficulty>("medio");
  const [count, setCount] = useState<number | "all">(5);
  const [gameType, setGameType] = useState<GameType>("fill-blank");
  const [queue, setQueue] = useState<MemoryItem[]>([]);
  const [step, setStep] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [countdown, setCountdown] = useState(false);
  const sessionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    // Journey mode — skip Supabase load
    if (search.journey) {
      const j = getJourneyById(search.journey);
      if (j) {
        setJourney(j);
        if (search.chapter && search.session) {
          const ch = j.chapters.find((c) => c.id === search.chapter);
          const sess = ch?.sessions.find((s) => s.id === search.session);
          if (ch && sess) {
            setActiveChapter(ch);
            setActiveSession(sess);
            setJourneyPhase("intro");
            return;
          }
        }
        setJourneyPhase("chapters");
        return;
      }
    }

    // Objective mode — load from Supabase
    setLoading(true);
    fetchObjectives().then(({ data, error }) => {
      setLoading(false);
      if (error || !data) return;

      const objs = data.map((r) => r.objective);
      const map: Record<string, MemoryItem[]> = {};
      const all: MemoryItem[] = [];
      for (const r of data) {
        map[r.objective.id] = r.items;
        all.push(...r.items);
      }
      setObjectives(objs);
      setItemsMap(map);
      setAllItems(all);

      if (search.objective) {
        setObjectiveId(search.objective);
      } else if (objs.length > 0) {
        setObjectiveId(objs[0].id);
      }
    });
  }, []);

  // --- Journey handlers ---
  const handleOpenChapter = (chapter: JourneyChapter) => {
    setActiveChapter(chapter);
    const last = getLastActiveSession(journey!, journey!.id);
    const firstSession = chapter.sessions[0];
    const targetSession =
      last && last.chapter.id === chapter.id ? last.session : firstSession;
    setActiveSession(targetSession);
    setJourneyPhase("intro");
  };

  const handleStartChallenges = () => {
    if (!activeSession) return;
    setQueue(activeSession.texts);
    setStep(0);
    setCorrect(0);
    setCombo(0);
    setGameType("fill-blank");
    setCountdown(true);
    setJourneyPhase("challenges");
  };

  const onJourneyAnswer = (isRight: boolean) => {
    const nextCorrect = correct + (isRight ? 1 : 0);
    const nextCombo = isRight ? combo + 1 : 0;
    setCombo(nextCombo);
    if (step + 1 >= queue.length) {
      setCorrect(nextCorrect);
      const xpEarned = nextCorrect * 10;
      if (journey && activeSession) {
        markSessionComplete(journey.id, activeSession.id);
        recordSessionXP(xpEarned, nextCorrect, queue.length, undefined, journey.id);
      }
      setJourneyPhase("conclusion");
    } else {
      setCorrect(nextCorrect);
      setStep((s) => s + 1);
    }
  };

  const handleContinueJourney = () => {
    if (!journey || !activeChapter) return;
    const sessionIndex = activeChapter.sessions.findIndex(
      (s) => s.id === activeSession?.id,
    );
    if (sessionIndex < activeChapter.sessions.length - 1) {
      const next = activeChapter.sessions[sessionIndex + 1];
      setActiveSession(next);
      setJourneyPhase("intro");
      return;
    }
    const chapterIndex = journey.chapters.findIndex(
      (c) => c.id === activeChapter.id,
    );
    if (chapterIndex < journey.chapters.length - 1) {
      const nextChapter = journey.chapters[chapterIndex + 1];
      setActiveChapter(nextChapter);
      setActiveSession(nextChapter.sessions[0]);
      setJourneyPhase("intro");
      return;
    }
    navigate({ to: "/" });
  };

  // --- Objective handlers ---
  const activeObjective = objectives.find((o) => o.id === objectiveId);
  const availableItems = activeObjective ? (itemsMap[activeObjective.id] ?? []) : [];

  const start = () => {
    if (!activeObjective || availableItems.length === 0) return;
    const n = count === "all" ? availableItems.length : Math.min(count, availableItems.length);
    const q = pickRandom(availableItems, n);
    setQueue(q);
    setStep(0);
    setCorrect(0);
    setCombo(0);
    const type = getGameTypeForDifficulty(difficulty);
    setGameType(type);
    sessionStartRef.current = Date.now();
    setCountdown(true);
  };

  const onAnswer = (isRight: boolean) => {
    const nextCorrect = correct + (isRight ? 1 : 0);
    const nextCombo = isRight ? combo + 1 : 0;
    setCombo(nextCombo);
    if (step + 1 >= queue.length) {
      setCorrect(nextCorrect);
      const xpEarned = nextCorrect * 10;
      const durationMs = Date.now() - sessionStartRef.current;

      // Persist to Supabase user_progress
      if (objectiveId) {
        void saveSessionProgress({
          objectiveId,
          correct: nextCorrect,
          total: queue.length,
          xpEarned,
          durationMs,
        });
      }

      // Also keep XP in localStorage for level calc until full auth migration
      recordSessionXP(xpEarned, nextCorrect, queue.length, objectiveId ?? undefined);

      // Invalidate home screen stats so they refresh
      invalidateUserStats();

      setPhase("done");
    } else {
      setCorrect(nextCorrect);
      setStep((s) => s + 1);
    }
  };

  // ==================== JOURNEY MODE RENDER ====================
  if (journey) {
    return (
      <JourneyPlayView
        journey={journey}
        phase={journeyPhase}
        chapter={activeChapter}
        session={activeSession}
        onOpenChapter={handleOpenChapter}
        onBack={() => navigate({ to: "/" })}
        onStartReading={() => setJourneyPhase("reading")}
        onStartChallenges={handleStartChallenges}
        onAnswer={onJourneyAnswer}
        onContinue={handleContinueJourney}
        queue={queue}
        step={step}
        correct={correct}
        combo={combo}
        countdown={countdown}
        gameType={gameType}
        onCountdownDone={() => setCountdown(false)}
        onExitChallenges={() => {
          setCountdown(false);
          setJourneyPhase("intro");
        }}
        bank={allItems}
      />
    );
  }

  // ==================== OBJECTIVE MODE RENDER ====================
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
                    bank={allItems.length > 1 ? allItems : availableItems}
                    onAnswer={onAnswer}
                  />
                ) : gameType === "multiple-choice" ? (
                  <MultipleChoiceGame
                    item={item}
                    step={step + 1}
                    total={queue.length}
                    bank={allItems.length > 1 ? allItems : availableItems}
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
            onPlayAgain={() => {
              setPhase("setup");
            }}
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

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : objectives.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<BookOpen className="h-5 w-5" strokeWidth={1.5} />}
            title="Você ainda não possui nenhum Objetivo."
            description="Crie sua primeira Biblioteca para começar seus estudos."
            action={
              <Button
                onClick={() => navigate({ to: "/collections" })}
                className="h-11 rounded-[16px] bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Criar Objetivo
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
                const items = itemsMap[o.id] ?? [];
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
                        {items.length} {items.length === 1 ? "texto" : "textos"}
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
              <Section title="Quantidade de questões">
                <div className="grid grid-cols-4 gap-2">
                  {[...QUESTION_COUNTS, "all" as const].map((n) => {
                    const active = n === count;
                    const label = n === "all" ? "Todas" : String(n);
                    const disabled =
                      n !== "all" && typeof n === "number" && availableItems.length < n;
                    return (
                      <button
                        key={label}
                        onClick={() => !disabled && setCount(n)}
                        disabled={disabled}
                        className={
                          "press rounded-[14px] border py-3 text-center text-[15px] font-medium tabular-nums tracking-tight transition-colors " +
                          (active
                            ? "border-primary bg-primary/5 text-primary"
                            : disabled
                              ? "border-border bg-card opacity-40 cursor-not-allowed"
                              : "border-border bg-card hover:border-foreground/15")
                        }
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section title="Dificuldade">
                <div className="grid grid-cols-2 gap-2">
                  {DIFFICULTIES.map((d) => {
                    const active = d.id === difficulty;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setDifficulty(d.id)}
                        className={
                          "press rounded-[14px] border p-3.5 text-left transition-colors " +
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

              <div className="mt-4">
                <Button
                  onClick={() => start()}
                  className="h-12 w-full rounded-[16px] bg-primary text-[14px] font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Sparkles className="h-4 w-4" strokeWidth={2} />
                  Começar sessão
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </AppLayout>
  );
}

// ==================== JOURNEY PLAY VIEW ====================

function JourneyPlayView({
  journey,
  phase,
  chapter,
  session,
  onOpenChapter,
  onBack,
  onStartReading,
  onStartChallenges,
  onAnswer,
  onContinue,
  queue,
  step,
  correct,
  combo,
  countdown,
  gameType,
  onCountdownDone,
  onExitChallenges,
  bank,
}: {
  journey: Journey;
  phase: JourneyPhase;
  chapter: JourneyChapter | null;
  session: JourneySession | null;
  onOpenChapter: (chapter: JourneyChapter) => void;
  onBack: () => void;
  onStartReading: () => void;
  onStartChallenges: () => void;
  onAnswer: (isRight: boolean) => void;
  onContinue: () => void;
  queue: MemoryItem[];
  step: number;
  correct: number;
  combo: number;
  countdown: boolean;
  gameType: GameType;
  onCountdownDone: () => void;
  onExitChallenges: () => void;
  bank: MemoryItem[];
}) {
  if (phase === "chapters") {
    const stats = getJourneyStats(journey, journey.id);
    return (
      <AppLayout>
        <Header
          subtitle="Jornada"
          title={journey.title}
          right={
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              aria-label="Voltar"
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Button>
          }
        />
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {journey.description}
        </p>

        <div className="mt-6 card-elevated p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Progresso
            </p>
            <span className="text-xs tabular-nums text-muted-foreground">
              {stats.completedSessions} de {stats.totalSessions} sessões
            </span>
          </div>
          <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Capítulos
          </p>
          <div className="flex flex-col divide-y divide-border rounded-[20px] border border-border bg-card shadow-soft">
            {journey.chapters.map((ch, i) => {
              const chStats = getChapterStats(ch, journey.id);
              return (
                <button
                  key={ch.id}
                  onClick={() => onOpenChapter(ch)}
                  className="press flex items-center gap-4 p-4 text-left transition-colors hover:bg-muted/30"
                >
                  <span className="w-6 shrink-0 text-center text-[13px] font-medium tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold tracking-tight">
                      {ch.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {chStats.totalSessions}{" "}
                      {chStats.totalSessions === 1 ? "sessão" : "sessões"}
                    </p>
                  </div>
                  {chStats.isComplete ? (
                    <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </div>
                  ) : chStats.completedSessions > 0 ? (
                    <span className="shrink-0 text-[12px] font-semibold tabular-nums text-primary">
                      {chStats.pct}%
                    </span>
                  ) : (
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      strokeWidth={1.75}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (phase === "intro" && chapter && session) {
    return (
      <AppLayout>
        <Header
          subtitle={`${journey.title} · ${chapter.title}`}
          title={session.title}
          right={
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              aria-label="Voltar"
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Button>
          }
        />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          <div className="mb-6 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <BookMarked className="h-3.5 w-3.5" strokeWidth={1.75} />
            Introdução
          </div>
          <p className="text-[17px] leading-[1.7] text-foreground">{session.intro}</p>
        </motion.div>
        <div className="mt-10">
          <Button
            onClick={onStartReading}
            className="h-12 w-full rounded-[16px] bg-primary text-[14px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            <BookOpen className="h-4 w-4" strokeWidth={2} />
            Começar leitura
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (phase === "reading" && session) {
    return (
      <AppLayout>
        <Header
          subtitle={`${journey.title} · ${chapter?.title}`}
          title="Leitura"
          right={
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              aria-label="Voltar"
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Button>
          }
        />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          {session.texts.map((text) => (
            <div key={text.id} className="card-elevated p-6">
              <p className="text-xs font-medium tracking-tight text-primary">
                {text.book} {text.chapter}:{text.verse}
              </p>
              <h2 className="mt-2 text-[18px] font-semibold tracking-tight">{text.title}</h2>
              <p className="mt-4 text-[16px] leading-[1.8] text-foreground">{text.text}</p>
            </div>
          ))}
        </motion.div>
        <div className="mt-8">
          <Button
            onClick={onStartChallenges}
            className="h-12 w-full rounded-[16px] bg-primary text-[14px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} />
            Iniciar desafios
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (phase === "challenges" && session) {
    const item = queue[step];
    return (
      <AppLayout>
        {countdown ? <CountdownOverlay onDone={onCountdownDone} /> : null}
        <Header
          subtitle={`Desafio ${step + 1} de ${queue.length}`}
          title="Sessão em foco"
          right={
            <Button
              variant="ghost"
              size="sm"
              onClick={onExitChallenges}
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
          {!countdown ? <Timer seconds={30} running /> : null}
        </div>
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {!countdown && item ? (
              <div key={item.id + step}>
                {gameType === "fill-blank" ? (
                  <FillBlankGame
                    item={item}
                    step={step + 1}
                    total={queue.length}
                    bank={bank.length > 1 ? bank : queue}
                    onAnswer={onAnswer}
                  />
                ) : gameType === "multiple-choice" ? (
                  <MultipleChoiceGame
                    item={item}
                    step={step + 1}
                    total={queue.length}
                    bank={bank.length > 1 ? bank : queue}
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

  if (phase === "conclusion" && session) {
    const journeyStats = getJourneyStats(journey, journey.id);
    const chapterStats = chapter ? getChapterStats(chapter, journey.id) : null;

    return (
      <AppLayout>
        <Header subtitle="Resultado" title="Sessão concluída" />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          <div className="card-elevated p-8 text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
              className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary"
            >
              <Check className="h-6 w-6" strokeWidth={2} />
            </motion.div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              Mais um passo na sua jornada.
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Bom trabalho. Continue fortalecendo sua memória.
            </p>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Hoje você aprendeu
            </p>
            <div className="flex flex-col divide-y divide-border rounded-[20px] border border-border bg-card shadow-soft">
              <LearnedRow
                icon={<Users className="h-4 w-4" strokeWidth={1.75} />}
                label="Personagens"
                value={session.characters.join(", ")}
              />
              <LearnedRow
                icon={<Calendar className="h-4 w-4" strokeWidth={1.75} />}
                label="Acontecimentos"
                value={session.events.join(", ")}
              />
              <LearnedRow
                icon={<FileText className="h-4 w-4" strokeWidth={1.75} />}
                label="Referências"
                value={session.references.join(", ")}
              />
              <LearnedRow
                icon={<BookOpen className="h-4 w-4" strokeWidth={1.75} />}
                label="Texto memorizado"
                value={session.memorized}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {chapterStats && (
              <div className="card-elevated p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Capítulo
                </p>
                <p className="mt-1 text-[15px] font-semibold tracking-tight">{chapter?.title}</p>
                <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                    style={{ width: `${chapterStats.pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
                  {chapterStats.completedSessions} de {chapterStats.totalSessions} sessões
                </p>
              </div>
            )}
            <div className="card-elevated p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Jornada
              </p>
              <p className="mt-1 text-[15px] font-semibold tracking-tight">{journey.title}</p>
              <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                  style={{ width: `${journeyStats.pct}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
                {journeyStats.completedSessions} de {journeyStats.totalSessions} sessões
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Button
              onClick={onContinue}
              className="h-12 w-full rounded-[16px] bg-primary text-[14px] font-medium text-primary-foreground hover:bg-primary/90"
            >
              Continuar jornada
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Button>
          </div>
        </motion.div>
      </AppLayout>
    );
  }

  return null;
}

function LearnedRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-[14px] leading-relaxed text-foreground">{value}</p>
      </div>
      <div className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/15 text-success">
        <Check className="h-3 w-3" strokeWidth={2.5} />
      </div>
    </div>
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
