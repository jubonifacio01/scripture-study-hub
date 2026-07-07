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
      const t = setTimeout(onDone, 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((v) => v - 1), 700);
    return () => clearTimeout(t);
  }, [n, onDone]);

  const label = n > 0 ? String(n) : "Vai!";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 1.6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="grid h-40 w-40 place-items-center rounded-full gradient-primary text-primary-foreground shadow-lift"
        >
          <span className="font-display text-6xl font-black">{label}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
