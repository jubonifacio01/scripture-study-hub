import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Milestone, Scroll } from "lucide-react";
import { collections } from "@/data/collections";
import { CollectionCard } from "@/components/CollectionCard";

const JOURNEY_HIGHLIGHTS = [
  {
    id: "genesis",
    emoji: "🌱",
    title: "Criação & Origem",
    description: "O começo de tudo — da criação ao chamado de Abraão.",
    chapters: 12,
  },
  {
    id: "psalms",
    emoji: "🎶",
    title: "Salmos da Alma",
    description: "Louvor, lamento e confiança nas palavras de Davi.",
    chapters: 8,
  },
  {
    id: "gospels",
    emoji: "✦",
    title: "A Vida de Jesus",
    description: "Ensinamentos, milagres e a missão do Filho de Deus.",
    chapters: 15,
  },
];

export function JourneyHomeContent() {
  return (
    <div className="mt-8 flex flex-col gap-8">
      <section>
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Jornadas em destaque
        </p>
        <div className="flex flex-col gap-2.5">
          {JOURNEY_HIGHLIGHTS.map((j) => (
            <Link
              key={j.id}
              to="/play"
              className="press card-elevated flex items-center gap-4 p-4 transition-colors hover:border-foreground/15"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-muted text-2xl">
                {j.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold tracking-tight">{j.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{j.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Temas para explorar
        </p>
        <div className="grid grid-cols-2 gap-2">
          <ThemeChip icon={<Milestone className="h-4 w-4" strokeWidth={1.75} />} label="Fé" />
          <ThemeChip icon={<BookOpen className="h-4 w-4" strokeWidth={1.75} />} label="Sabedoria" />
          <ThemeChip icon={<Scroll className="h-4 w-4" strokeWidth={1.75} />} label="Profecia" />
          <ThemeChip icon={<span className="text-sm">🕊</span>} label="Esperança" />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Coleções disponíveis
          </p>
          <Link to="/collections" className="text-xs font-medium text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {collections.slice(0, 3).map((c) => (
            <CollectionCard key={c.id} collection={c} compact />
          ))}
        </div>
      </section>
    </div>
  );
}

function ThemeChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="press card-elevated flex items-center gap-2.5 p-3.5 transition-colors hover:border-foreground/15"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[13px] font-medium tracking-tight">{label}</span>
    </button>
  );
}
