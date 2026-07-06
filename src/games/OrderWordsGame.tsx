import { useMemo, useState } from "react";
import type { MemoryItem } from "@/types";
import { shuffle, tokenize } from "./gameUtils";
import { QuestionCard } from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface OrderWordsGameProps {
  item: MemoryItem;
  step: number;
  total: number;
  onAnswer: (correct: boolean) => void;
}

export function OrderWordsGame({ item, step, total, onAnswer }: OrderWordsGameProps) {
  const target = useMemo(() => tokenize(item.text).slice(0, 8), [item]);
  const initialPool = useMemo(
    () => shuffle(target.map((t, i) => ({ id: `${i}-${t}`, word: t }))),
    [target],
  );
  const [pool, setPool] = useState(initialPool);
  const [chosen, setChosen] = useState<typeof initialPool>([]);
  const [locked, setLocked] = useState(false);

  const pick = (id: string) => {
    if (locked) return;
    const w = pool.find((p) => p.id === id);
    if (!w) return;
    setPool((p) => p.filter((x) => x.id !== id));
    setChosen((c) => [...c, w]);
  };

  const remove = (id: string) => {
    if (locked) return;
    const w = chosen.find((p) => p.id === id);
    if (!w) return;
    setChosen((c) => c.filter((x) => x.id !== id));
    setPool((p) => [...p, w]);
  };

  const confirm = () => {
    if (chosen.length !== target.length) return;
    setLocked(true);
    const correct = chosen.every((w, i) => w.word === target[i]);
    setTimeout(() => onAnswer(correct), 700);
  };

  const isCorrectSoFar = chosen.every((w, i) => w.word === target[i]);

  return (
    <QuestionCard item={item} prompt="Coloque as palavras na ordem correta" step={step} total={total}>
      <div
        className={
          "min-h-24 rounded-2xl border-2 border-dashed p-3 " +
          (locked
            ? isCorrectSoFar
              ? "border-success bg-success/10"
              : "border-destructive bg-destructive/10"
            : "border-border bg-muted/40")
        }
      >
        {chosen.length === 0 ? (
          <p className="p-2 text-sm text-muted-foreground">Toque nas palavras abaixo…</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {chosen.map((w) => (
              <button
                key={w.id}
                onClick={() => remove(w.id)}
                disabled={locked}
                className="press rounded-xl border-2 border-primary/30 bg-card px-3 py-2 text-sm font-bold shadow-soft"
              >
                {w.word}
                {!locked ? <X className="ml-1 inline h-3 w-3 text-muted-foreground" /> : null}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {pool.map((w) => (
          <button
            key={w.id}
            onClick={() => pick(w.id)}
            disabled={locked}
            className="press rounded-xl border-2 border-border bg-card px-3 py-2 text-sm font-bold"
          >
            {w.word}
          </button>
        ))}
      </div>

      <Button
        size="lg"
        onClick={confirm}
        disabled={chosen.length !== target.length || locked}
        className="mt-5 w-full rounded-2xl gradient-primary text-primary-foreground"
      >
        Confirmar
      </Button>
    </QuestionCard>
  );
}
