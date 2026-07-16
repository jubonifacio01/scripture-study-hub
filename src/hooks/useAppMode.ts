import { useCallback, useEffect, useState } from "react";

export type AppMode = "study" | "journey";

const MODE_KEY = "memorize-app-mode";
const NAME_KEY = "memorize-user-name";

function getInitialMode(): AppMode | null {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(MODE_KEY);
  if (saved === "study" || saved === "journey") return saved;
  return null;
}

function getInitialName(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(NAME_KEY);
}

export function useAppMode() {
  const [mode, setModeState] = useState<AppMode | null>(null);
  const [userName, setUserNameState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setModeState(getInitialMode());
    setUserNameState(getInitialName());
    setReady(true);
  }, []);

  const setMode = useCallback((next: AppMode) => {
    setModeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MODE_KEY, next);
    }
  }, []);

  const setUserName = useCallback((name: string) => {
    setUserNameState(name);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(NAME_KEY, name);
    }
  }, []);

  const clearMode = useCallback(() => {
    setModeState(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(MODE_KEY);
    }
  }, []);

  const clearUserName = useCallback(() => {
    setUserNameState(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(NAME_KEY);
    }
  }, []);

  return { mode, setMode, clearMode, userName, setUserName, clearUserName, ready };
}

export function getUserName(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(NAME_KEY);
}
