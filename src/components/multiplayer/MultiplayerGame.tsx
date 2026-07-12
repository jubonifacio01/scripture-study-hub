import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/QuestionCard";
import { X } from "lucide-react";
import type { SharedQuestion } from "@/types";

interface Props {
  questions: SharedQuestion[];
  startAt: number;
  secondsPerQuestion: number;
  onFinish: (result: { correct: number; score: number; timeMs: number }) => void;
  onAnswer: (
    questionIndex: number,
    questionId: string,
    answer: string,
    correct: boolean,
    elapsedMs: number,
  ) => void;
}

export function MultiplayerGame({ questions, startAt, secondsPerQuestion, onFinish, onAnswer }: Props) {
  const total = questions.length;
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [chosen, setChosen] = useState<{ id: string; word: string }[]>([]);
  const [pool, setPool] = useState<{ id: string; word: string }[]>([]);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState(secondsPerQuestion);
  const startedRef = useRef<number>(Date.now());
  const stepStartRef = useRef<number>(0);

  const [waitingMs, setWaitingMs] = useState<number>(Math.max(0, startAt - Date.now()));
  useEffect(() => {
    if (waitingMs <= 0) return;
    const t = setInterval(() => {
      const left = Math.max(0, startAt - Date.now());
      setWaitingMs(left);
      if (left <= 0) {
        startedRef.current = Date.now();
        stepStartRef.current = Date.now();
      }
    }, 100);
    return () => clearInterval(t);
  }, [startAt, waitingMs]);

  const current = questions[step];

  // Initialize pool for order-words
  useEffect(() => {
    if (current?.gameType === "order-words" && current.wordOrder) {
      const initialPool = current.wordOrder.map((w, i) => ({ id: `${i}-${w}`, word: w }));
      setPool(shuffleArr(initialPool));
      setChosen([]);
      setLocked(false);
    }
  }, [current]);

  const advance = (isRight: boolean, elapsedMs: number) => {
    const nextCorrect = correct + (isRight ? 1 : 0);
    const bonus = isRight ? Math.max(0, secondsPerQuestion * 1000 - elapsedMs) : 0;
    const nextScore = score + (isRight ? 100 : 0) + Math.round(bonus / 20);
    setCorrect(nextCorrect);
    setScore(nextScore);
    setPicked(null);

    if (step + 1 >= total) {
      const timeMs = Date.now() - startedRef.current;
      onFinish({ correct: nextCorrect, score: nextScore, timeMs });
    } else {
      setStep((s) => s + 1);
      setRemaining(secondsPerQuestion);
      stepStartRef.current = Date.now();
    }
  };

  useEffect(() => {
    if (waitingMs > 0) return;
    setRemaining(secondsPerQuestion);
    stepStartRef.current = Date.now();
    const t = setInterval(() => {
      const elapsed = (Date.now() - stepStartRef.current) / 1000;
      const left = Math.max(0, secondsPerQuestion - elapsed);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(t);
        advance(false, secondsPerQuestion * 1000);
      }
    }, 100);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, waitingMs]);

  const confirmChoice = (optId: string) => {
    if (picked) return;
    const elapsed = Date.now() - stepStartRef.current;
    setPicked(optId);
    const isRight = optId === current.correctOptionId;
    onAnswer(step, current.itemId, optId, isRight, elapsed);
    setTimeout(() => advance(isRight, elapsed), 600);
  };

  // Order-words handlers
  const pickWord = (id: string) => {
    if (locked) return;
    const w = pool.find((p) => p.id === id);
    if (!w) return;
    setPool((p) => p.filter((x) => x.id !== id));
    setChosen((c) => [...c, w]);
  };

  const removeWord = (id: string) => {
    if (locked) return;
    const w = chosen.find((p) => p.id === id);
    if (!w) return;
    setChosen((c) => c.filter((x) => x.id !== id));
    setPool((p) => [...p, w]);
  };

  const confirmOrder = () => {
    if (chosen.length !== current.wordOrder?.length) return;
    setLocked(true);
    const isRight = chosen.every((w, i) => w.word === current.wordOrder![i]);
    const elapsed = Date.now() - stepStartRef.current;
    onAnswer(step, current.itemId, chosen.map((w) => w.word).join(" "), isRight, elapsed);
    setTimeout(() => advance(isRight, elapsed), 700);
  };

  const memoItem = useMemo(
    () => ({
      id: current.itemId,
      title: "",
      book: "",
      chapter: 0,
      verse: "",
      text: current.text,
      category: "",
      tags: [],
    }),
    [current],
  );

  if (waitingMs > 0) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Sincronizando com a sala
          </p>
          <p className="mt-4 text-6xl font-semibold tabular-nums tracking-tight">
            {Math.ceil(waitingMs / 1000)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Pergunta {step + 1} / {total}
        </div>
        <div className={"inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs tabular-nums " + (remaining <= 3 ? "text-destructive" : "text-muted-foreground")}>
          <span className={"h-1.5 w-1.5 rounded-full " + (remaining <= 3 ? "bg-destructive" : "bg-primary")} />
          <span className="font-medium">{Math.ceil(remaining)}s</span>
        </div>
      </div>

      <QuestionCard item={memoItem} prompt={getPrompt(current.gameType)} step={step + 1} total={total}>
        {current.gameType === "multiple-choice" && (
          <>
            <p className="rounded-2xl bg-muted/60 p-4 text-base italic leading-relaxed">
              &quot;{current.text}&quot;
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {current.options.map((opt, idx) => {
                const state =
                  picked == null
                    ? ""
                    : opt.id === picked && opt.id === current.correctOptionId
                      ? "border-success bg-success/15"
                      : opt.id === picked
                        ? "border-destructive bg-destructive/15"
                        : opt.id === current.correctOptionId
                          ? "border-success bg-success/10"
                          : "opacity-60";
                return (
                  <motion.div key={opt.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * idx, duration: 0.25 }}>
                    <Button variant="outline" onClick={() => confirmChoice(opt.id)} disabled={!!picked} className={"press h-14 w-full justify-start rounded-2xl border-2 text-base font-semibold " + state}>
                      {opt.label}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {current.gameType === "fill-blank" && (
          <FillBlankContent
            current={current}
            picked={picked}
            setPicked={setPicked}
            confirmChoice={confirmChoice}
          />
        )}

        {current.gameType === "order-words" && (
          <>
            <p className="rounded-2xl bg-muted/60 p-4 text-base italic leading-relaxed">
              &quot;{current.text}&quot;
            </p>
            <div className={"mt-4 min-h-24 rounded-2xl border-2 border-dashed p-3 " + (locked ? (chosen.every((w, i) => w.word === current.wordOrder![i]) ? "border-success bg-success/10" : "border-destructive bg-destructive/10") : "border-border bg-muted/40")}>
              {chosen.length === 0 ? (
                <p className="p-2 text-sm text-muted-foreground">Toque nas palavras abaixo…</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {chosen.map((w) => (
                    <button key={w.id} onClick={() => removeWord(w.id)} disabled={locked} className="press rounded-xl border-2 border-primary/30 bg-card px-3 py-2 text-sm font-bold shadow-soft">
                      {w.word}
                      {!locked ? <X className="ml-1 inline h-3 w-3 text-muted-foreground" /> : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {pool.map((w) => (
                <button key={w.id} onClick={() => pickWord(w.id)} disabled={locked} className="press rounded-xl border-2 border-border bg-card px-3 py-2 text-sm font-bold">
                  {w.word}
                </button>
              ))}
            </div>
            <Button size="lg" onClick={confirmOrder} disabled={chosen.length !== current.wordOrder?.length || locked} className="mt-5 w-full rounded-2xl">
              Confirmar
            </Button>
          </>
        )}
      </QuestionCard>
    </div>
  );
}

function getPrompt(gameType: string): string {
  switch (gameType) {
    case "multiple-choice": return "A qual referência este texto pertence?";
    case "fill-blank": return "Complete a palavra que falta";
    case "order-words": return "Coloque as palavras na ordem correta";
    default: return "";
  }
}

function FillBlankContent({
  current,
  picked,
  setPicked,
  confirmChoice,
}: {
  current: SharedQuestion;
  picked: string | null;
  setPicked: (v: string | null) => void;
  confirmChoice: (optId: string) => void;
}) {
  const tokens = current.text.split(/\s+/).filter(Boolean);
  const eligible = tokens.map((t, i) => ({ t: t.replace(/[.,;!?]/g, ""), i })).filter((x) => x.t.length >= 4);
  const blankIdx = eligible.length > 0 ? eligible[Math.floor(eligible.length * 0.3)].i : Math.floor(tokens.length / 2);
  const answer = tokens[blankIdx]?.replace(/[.,;!?]/g, "") ?? "";
  const isRight = picked != null && current.options.find((o) => o.id === picked)?.label.toLowerCase() === answer.toLowerCase();

  return (
    <>
      <motion.p animate={picked ? (isRight ? { scale: [1, 1.02, 1] } : { x: [0, -8, 8, -6, 6, 0] }) : {}} transition={{ duration: 0.45 }} className="rounded-2xl bg-muted/60 p-4 text-lg leading-relaxed">
        {tokens.map((t, i) => (
          <span key={i}>
            {i === blankIdx ? (
              <span className={"mx-1 inline-block min-w-24 rounded-lg border-2 border-dashed px-2 " + (picked ? (isRight ? "border-success bg-success/15 text-success" : "border-destructive bg-destructive/15 text-destructive") : "border-primary text-primary")}>
                {picked ? current.options.find((o) => o.id === picked)?.label ?? "____" : "____"}
              </span>
            ) : t}{" "}
          </span>
        ))}
      </motion.p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {current.options.map((opt, idx) => {
          const state = picked == null ? "" : opt.id === picked && opt.label.toLowerCase() === answer.toLowerCase() ? "border-success bg-success/15" : opt.id === picked ? "border-destructive bg-destructive/15" : opt.label.toLowerCase() === answer.toLowerCase() ? "border-success bg-success/10" : "opacity-60";
          return (
            <motion.div key={opt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * idx, duration: 0.3 }}>
              <Button variant="outline" size="lg" onClick={() => { setPicked(opt.id); confirmChoice(opt.id); }} disabled={!!picked} className={"press h-14 w-full rounded-2xl border-2 text-base font-bold " + state}>
                {opt.label}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
