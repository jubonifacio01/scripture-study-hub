import { Link, useRouterState } from "@tanstack/react-router";
import { Hop as Home, Sparkles, Library, Users, User } from "lucide-react";
import { motion } from "framer-motion";
import type { ComponentType } from "react";

type Item = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

const items: Item[] = [
  { to: "/", label: "Início", icon: Home },
  { to: "/play", label: "Praticar", icon: Sparkles },
  { to: "/collections", label: "Biblioteca", icon: Library },
  { to: "/rooms", label: "Salas", icon: Users },
  { to: "/profile", label: "Perfil", icon: User },
];

export function BottomNavigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/75 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 px-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className="group relative flex min-h-[52px] flex-col items-center justify-center gap-1 px-2"
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-bar"
                    className="absolute top-0 h-[2px] w-7 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon
                  strokeWidth={active ? 2 : 1.5}
                  className={
                    "h-[21px] w-[21px] transition-colors duration-200 " +
                    (active
                      ? "text-primary"
                      : "text-muted-foreground/70 group-hover:text-foreground")
                  }
                />
                <span
                  className={
                    "text-[10px] font-medium tracking-tight transition-colors duration-200 " +
                    (active ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground")
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
