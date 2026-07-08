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
    <header className="flex items-end justify-between gap-3 pt-3">
      <div className="min-w-0">
        {subtitle ? (
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
        {title ? (
          <h1 className="mt-1 truncate text-[26px] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {right}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label="Alternar tema"
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} /> : <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} />}
        </Button>
      </div>
    </header>
  );
}
