import type { ReactNode } from "react";
import { motion } from "framer-motion";
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
    <motion.div
      key={item.id + step}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -18, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="card-elevated overflow-hidden"
    >
      <div className="h-1.5 bg-muted">
        <motion.div
          className="h-full gradient-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
          <span className="text-primary">
            {item.book} {item.chapter}:{item.verse}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground tabular-nums">
            {step} / {total}
          </span>
        </div>
        <h2 className="mt-2 font-display text-xl font-extrabold leading-tight">
          {prompt}
        </h2>
        <div className="mt-5">{children}</div>
      </div>
    </motion.div>
  );
}
