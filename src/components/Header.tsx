import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
}

export function Header({ title, subtitle, right }: HeaderProps) {
  const { theme, toggle } = useTheme();
  return (
    <header className="flex items-center justify-between gap-3 pt-2">
      <div className="min-w-0">
        {subtitle ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
        {title ? (
          <h1 className="truncate text-2xl font-black text-foreground">{title}</h1>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {right}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label="Alternar tema"
          className="rounded-2xl"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
