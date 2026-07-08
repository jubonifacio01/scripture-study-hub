import { useCallback, useEffect, useState } from "react";

export type AppMode = "study" | "journey";

const KEY = "memorize-app-mode";

function getInitial(): AppMode | null {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(KEY);
  if (saved === "study" || saved === "journey") return saved;
  return null;
}

export function useAppMode() {
  const [mode, setModeState] = useState<AppMode | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setModeState(getInitial());
    setReady(true);
  }, []);

  const setMode = useCallback((next: AppMode) => {
    setModeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, next);
    }
  }, []);

  const clearMode = useCallback(() => {
    setModeState(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(KEY);
    }
  }, []);

  return { mode, setMode, clearMode, ready };
}
