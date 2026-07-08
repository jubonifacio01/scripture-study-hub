import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Sparkles, Library, Users, User } from "lucide-react";
import type { ComponentType } from "react";

type Item = { to: string; label: string; icon: ComponentType<{ className?: string; strokeWidth?: number }> };

const items: Item[] = [
  { to: "/", label: "Início", icon: Home },
  { to: "/play", label: "Praticar", icon: Sparkles },
  { to: "/collections", label: "Coleções", icon: Library },
  { to: "/rooms", label: "Salas", icon: Users },
  { to: "/profile", label: "Perfil", icon: User },
];

export function BottomNavigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/70 bg-background/85 backdrop-blur-xl"
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
                className="group flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 press"
              >
                <Icon
                  strokeWidth={active ? 2.25 : 1.75}
                  className={
                    "h-[22px] w-[22px] transition-colors " +
                    (active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")
                  }
                />
                <span
                  className={
                    "text-[10px] font-medium transition-colors " +
                    (active ? "text-primary" : "text-muted-foreground")
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
