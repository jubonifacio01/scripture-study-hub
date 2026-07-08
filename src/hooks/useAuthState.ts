import { useCallback, useEffect, useState } from "react";

export type AuthState = "guest" | "authenticated";

export interface AuthUser {
  name: string;
  provider: "google" | "apple" | "email";
}

const KEY = "memorize-auth";

function getInitial(): { state: AuthState; user: AuthUser | null } {
  if (typeof window === "undefined") return { state: "guest", user: null };
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as { state: AuthState; user: AuthUser | null };
      if (parsed.state === "authenticated" && parsed.user) return parsed;
    }
  } catch {
    // ignore malformed
  }
  return { state: "guest", user: null };
}

export function useAuthState() {
  const [state, setState] = useState<AuthState>("guest");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = getInitial();
    setState(initial.state);
    setUser(initial.user);
    setReady(true);
  }, []);

  const signIn = useCallback((u: AuthUser) => {
    setState("authenticated");
    setUser(u);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, JSON.stringify({ state: "authenticated", user: u }));
    }
  }, []);

  const signOut = useCallback(() => {
    setState("guest");
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(KEY);
    }
  }, []);

  return { state, user, signIn, signOut, ready };
}
