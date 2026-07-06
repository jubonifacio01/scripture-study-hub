import { useMemo, useState } from "react";
import type { MemoryItem } from "@/types";
import { otherWordsFrom, pickBlankIndex, shuffle, tokenize } from "./gameUtils";
import { QuestionCard } from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";

interface FillBlankGameProps {
  item: MemoryItem;
  step: number;
  total: number;
  bank: MemoryItem[];
  onAnswer: (correct: boolean) => void;
}

export function FillBlankGame({ item, step, total, bank, onAnswer }: FillBlankGameProps) {
  const tokens = useMemo(() => tokenize(item.text), [item]);
  const blankIndex = useMemo(() => pickBlankIndex(tokens), [tokens]);
  const answer = tokens[blankIndex].replace(/[.,;!?]/g, "");
  const options = useMemo(
    () => shuffle([answer, ...otherWordsFrom(bank, answer, 3)]),
    [answer, bank],
  );
  const [picked, setPicked] = useState<string | null>(null);

  const confirm = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    setTimeout(() => onAnswer(opt.toLowerCase() === answer.toLowerCase()), 700);
  };

  return (
    <QuestionCard item={item} prompt="Complete a palavra que falta" step={step} total={total}>
      <p className="rounded-2xl bg-muted/60 p-4 text-lg leading-relaxed">
        {tokens.map((t, i) => (
          <span key={i}>
            {i === blankIndex ? (
              <span className="mx-1 inline-block min-w-24 rounded-lg border-2 border-dashed border-primary px-2 text-primary">
                {picked ?? "____"}
              </span>
            ) : (
              t
            )}{" "}
          </span>
        ))}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const state =
            picked == null
              ? ""
              : opt === picked && opt.toLowerCase() === answer.toLowerCase()
                ? "border-success bg-success/15 text-success-foreground"
                : opt === picked
                  ? "border-destructive bg-destructive/15"
                  : opt.toLowerCase() === answer.toLowerCase()
                    ? "border-success bg-success/10"
                    : "opacity-60";
          return (
            <Button
              key={opt}
              variant="outline"
              size="lg"
              onClick={() => confirm(opt)}
              disabled={!!picked}
              className={"press h-14 rounded-2xl border-2 text-base font-bold " + state}
            >
              {opt}
            </Button>
          );
        })}
      </div>
    </QuestionCard>
  );
}
