import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface CountdownOverlayProps {
  onDone: () => void;
  from?: number;
}

export function CountdownOverlay({ onDone, from = 3 }: CountdownOverlayProps) {
  const [n, setN] = useState(from);

  useEffect(() => {
    if (n <= 0) {
      const t = setTimeout(onDone, 300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((v) => v - 1), 650);
    return () => clearTimeout(t);
  }, [n, onDone]);

  const label = n > 0 ? String(n) : "Começar";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Foco
          </p>
          <p className="mt-3 text-7xl font-semibold tracking-tight text-foreground tabular-nums">
            {label}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
