import type { ReactNode } from "react";
import type { MemoryItem } from "@/types";

interface QuestionCardProps {
  item: MemoryItem;
  prompt: string;
  children: ReactNode;
  step: number;
  total: number;
}

export function QuestionCard({ item, prompt, children, step, total }: QuestionCardProps) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="card-elevated overflow-hidden">
      <div className="h-2 bg-muted">
        <div
          className="h-full gradient-primary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
          <span className="text-primary">
            {item.book} {item.chapter}:{item.verse}
          </span>
          <span className="text-muted-foreground">
            {step} / {total}
          </span>
        </div>
        <h2 className="mt-2 font-display text-xl font-extrabold leading-tight">
          {prompt}
        </h2>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
