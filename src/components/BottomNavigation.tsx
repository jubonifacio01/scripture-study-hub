import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Gamepad2, Library, Users, User } from "lucide-react";
import { motion } from "framer-motion";
import type { ComponentType } from "react";

type Item = { to: string; label: string; icon: ComponentType<{ className?: string }> };

const items: Item[] = [
  { to: "/", label: "Início", icon: Home },
  { to: "/play", label: "Jogar", icon: Gamepad2 },
  { to: "/collections", label: "Coleções", icon: Library },
  { to: "/rooms", label: "Salas", icon: Users },
  { to: "/profile", label: "Perfil", icon: User },
];

export function BottomNavigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-card/85 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 px-2 py-1.5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className="group relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 press"
              >
                <span className="relative grid h-10 w-10 place-items-center">
                  {active && (
                    <motion.span
                      layoutId="tab-active-pill"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      className="absolute inset-0 rounded-2xl gradient-primary shadow-soft"
                    />
                  )}
                  <Icon
                    className={
                      "relative h-5 w-5 transition-colors " +
                      (active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")
                    }
                  />
                </span>
                <span
                  className={
                    "text-[10px] font-bold transition-colors " +
                    (active ? "text-foreground" : "text-muted-foreground")
                  }
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
