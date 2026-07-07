import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card-elevated flex flex-col items-center justify-center p-8 text-center"
    >
      {icon ? (
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl gradient-primary text-primary-foreground shadow-lift">
          {icon}
        </div>
      ) : null}
      <h3 className="mt-4 font-display text-lg font-black">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </motion.div>
  );
}
