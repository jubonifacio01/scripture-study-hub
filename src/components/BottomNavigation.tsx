import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Gamepad2, Library, Users, User } from "lucide-react";
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
      <ul className="mx-auto grid max-w-md grid-cols-5 px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                className="group flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 press"
              >
                <span
                  className={
                    "grid h-10 w-10 place-items-center rounded-2xl transition-colors " +
                    (active
                      ? "gradient-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground group-hover:bg-muted")
                  }
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={
                    "text-[10px] font-semibold " +
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
