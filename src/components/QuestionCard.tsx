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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="card-elevated overflow-hidden"
    >
      <div className="h-0.5 bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.14em]">
          <span className="text-primary">
            {item.book} {item.chapter}:{item.verse}
          </span>
          <span className="tabular-nums text-muted-foreground">
            {step} / {total}
          </span>
        </div>
        <h2 className="mt-3 text-[20px] font-semibold leading-snug tracking-tight">
          {prompt}
        </h2>
        <div className="mt-6">{children}</div>
      </div>
    </motion.div>
  );
}
