import { useMemo, useState } from "react";
import type { MemoryItem } from "@/types";
import { shuffle } from "./gameUtils";
import { QuestionCard } from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";

interface MultipleChoiceGameProps {
  item: MemoryItem;
  step: number;
  total: number;
  bank: MemoryItem[];
  onAnswer: (correct: boolean) => void;
}

export function MultipleChoiceGame({
  item,
  step,
  total,
  bank,
  onAnswer,
}: MultipleChoiceGameProps) {
  const options = useMemo(() => {
    const distractors = bank.filter((b) => b.id !== item.id).slice(0, 3);
    return shuffle([item, ...distractors]).map((it) => ({
      id: it.id,
      label: `${it.book} ${it.chapter}:${it.verse}`,
    }));
  }, [item, bank]);
  const [picked, setPicked] = useState<string | null>(null);

  const confirm = (id: string) => {
    if (picked) return;
    setPicked(id);
    setTimeout(() => onAnswer(id === item.id), 700);
  };

  return (
    <QuestionCard item={item} prompt="A qual referência este texto pertence?" step={step} total={total}>
      <p className="rounded-2xl bg-muted/60 p-4 text-base italic leading-relaxed">
        “{item.text}”
      </p>
      <div className="mt-5 flex flex-col gap-3">
        {options.map((opt) => {
          const state =
            picked == null
              ? ""
              : opt.id === picked && opt.id === item.id
                ? "border-success bg-success/15"
                : opt.id === picked
                  ? "border-destructive bg-destructive/15"
                  : opt.id === item.id
                    ? "border-success bg-success/10"
                    : "opacity-60";
          return (
            <Button
              key={opt.id}
              variant="outline"
              onClick={() => confirm(opt.id)}
              disabled={!!picked}
              className={"press h-14 justify-start rounded-2xl border-2 text-base font-bold " + state}
            >
              {opt.label}
            </Button>
          );
        })}
      </div>
    </QuestionCard>
  );
}
