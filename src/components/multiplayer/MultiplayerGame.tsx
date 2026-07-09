import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/QuestionCard";

import type { SharedQuestion } from "@/lib/roomChannel";

interface Props {
  questions: SharedQuestion[];
  startAt: number;
  secondsPerQuestion: number;
  onFinish: (result: { correct: number; score: number; timeMs: number }) => void;
}

/**
 * Renders a synchronized multiple-choice match.
 * All players receive identical `questions` (host-generated) and the same
 * `startAt` timestamp. Each question has a shared time budget; when it
 * expires the round auto-advances.
 */
export function MultiplayerGame({ questions, startAt, secondsPerQuestion, onFinish }: Props) {
  const total = questions.length;
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState(secondsPerQuestion);
  const startedRef = useRef<number>(Date.now());
  const stepStartRef = useRef<number>(0);

  // Countdown wait for shared start
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

  // Per-question timer
  useEffect(() => {
    if (waitingMs > 0) return;
    if (picked !== null) return;
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

  const confirm = (optId: string) => {
    if (picked) return;
    const elapsed = Date.now() - stepStartRef.current;
    setPicked(optId);
    setTimeout(() => advance(optId === current.correctOptionId, elapsed), 600);
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
      <QuestionCard item={memoItem} prompt="A qual referência este texto pertence?" step={step + 1} total={total}>
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
              <motion.div
                key={opt.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * idx, duration: 0.25 }}
              >
                <Button
                  variant="outline"
                  onClick={() => confirm(opt.id)}
                  disabled={!!picked}
                  className={"press h-14 w-full justify-start rounded-2xl border-2 text-base font-semibold " + state}
                >
                  {opt.label}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </QuestionCard>
    </div>
  );
}
