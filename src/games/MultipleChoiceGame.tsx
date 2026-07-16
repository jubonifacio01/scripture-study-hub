import { useMemo, useState } from "react";
import { motion } from "framer-motion";
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

/**
 * Generate unique distractors for multiple choice.
 * Ensures no duplicate references in the options.
 */
function generateUniqueOptions(
  correctItem: MemoryItem,
  bank: MemoryItem[],
  count: number = 3,
): MemoryItem[] {
  const correctRef =
    `${correctItem.book} ${correctItem.chapter}:${correctItem.verse}`.toLowerCase();

  // Filter out the correct answer and any duplicates
  const available = bank.filter((b) => {
    if (b.id === correctItem.id) return false;
    const ref = `${b.book} ${b.chapter}:${b.verse}`.toLowerCase();
    return ref !== correctRef;
  });

  // Shuffle and take unique references
  const shuffled = shuffle(available);
  const seen = new Set<string>();
  const unique: MemoryItem[] = [];

  for (const item of shuffled) {
    const ref = `${item.book} ${item.chapter}:${item.verse}`;
    if (!seen.has(ref.toLowerCase())) {
      seen.add(ref.toLowerCase());
      unique.push(item);
      if (unique.length >= count) break;
    }
  }

  // If we don't have enough unique items, generate synthetic distractors
  const books = [
    "Genesis",
    "Exodo",
    "Levitico",
    "Numeros",
    "Deuteronomio",
    "Josue",
    "Juizes",
    "Rute",
    "Samuel",
    "Reis",
    "Cronicas",
    "Esdras",
    "Neemias",
    "Ester",
    "Jo",
    "Salmos",
    "Proverbios",
    "Eclesiastes",
    "Canticos",
    "Isaias",
    "Jeremias",
    "Lamentacoes",
    "Ezequiel",
    "Daniel",
    "Oseias",
    "Joel",
    "Amos",
    "Obadias",
    "Jonas",
    "Miqueias",
    "Naum",
    "Habacuque",
    "Sofonias",
    "Ageu",
    "Zacarias",
    "Malaquias",
    "Mateus",
    "Marcos",
    "Lucas",
    "Joao",
    "Atos",
    "Romanos",
    "Corintios",
    "Galatas",
    "Efesios",
    "Filipenses",
    "Colossenses",
    "Tessalonicenses",
    "Timoteo",
    "Tito",
    "Filemom",
    "Hebreus",
    "Tiago",
    "Pedro",
    "Judas",
    "Apocalipse",
  ];

  while (unique.length < count) {
    const syntheticBook = books[unique.length % books.length];
    const syntheticChapter = Math.floor(Math.random() * 30) + 1;
    const syntheticVerse = Math.floor(Math.random() * 30) + 1;
    const syntheticRef = `${syntheticBook} ${syntheticChapter}:${syntheticVerse}`;

    if (syntheticRef.toLowerCase() !== correctRef) {
      unique.push({
        id: `synthetic-${unique.length}`,
        title: "Alternativa",
        book: syntheticBook,
        chapter: syntheticChapter,
        verse: String(syntheticVerse),
        text: "",
        category: "Synthetic",
        tags: [],
      });
    }
  }

  return unique;
}

export function MultipleChoiceGame({ item, step, total, bank, onAnswer }: MultipleChoiceGameProps) {
  const options = useMemo(() => {
    const distractors = generateUniqueOptions(item, bank, 3);
    const allOptions = [item, ...distractors];
    return shuffle(allOptions).map((it) => ({
      id: it.id,
      label: `${it.book} ${it.chapter}:${it.verse}`,
    }));
  }, [item, bank]);

  const [picked, setPicked] = useState<string | null>(null);

  const confirm = (id: string) => {
    if (picked) return;
    setPicked(id);
    setTimeout(() => onAnswer(id === item.id), 750);
  };

  return (
    <QuestionCard
      item={item}
      prompt="A qual referencia este texto pertence?"
      step={step}
      total={total}
    >
      <p className="rounded-2xl bg-muted/60 p-4 text-base italic leading-relaxed">
        &quot;{item.text}&quot;
      </p>
      <div className="mt-5 flex flex-col gap-3">
        {options.map((opt, idx) => {
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
          const shake = picked === opt.id && opt.id !== item.id;
          return (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx, duration: 0.3 }}
            >
              <motion.div
                animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Button
                  variant="outline"
                  onClick={() => confirm(opt.id)}
                  disabled={!!picked}
                  className={
                    "press h-14 w-full justify-start rounded-2xl border-2 text-base font-bold " +
                    state
                  }
                >
                  {opt.label}
                </Button>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </QuestionCard>
  );
}
