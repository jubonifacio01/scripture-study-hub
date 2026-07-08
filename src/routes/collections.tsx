import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { ObjectiveCard } from "@/components/ObjectiveCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  FileText,
  Calendar,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import type { Objective, MemoryItem } from "@/types";
import {
  loadObjectives,
  createObjective,
  addTextToObjective,
  getObjectiveItems,
  getObjectiveProgress,
  loadCustomItems,
  markObjectiveStudied,
  formatLastActivity,
} from "@/data/objectives";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Biblioteca — Memorize+" },
      {
        name: "description",
        content: "Organize seus objetivos de estudo e adicione seus próprios textos.",
      },
    ],
  }),
  component: LibraryPage,
  validateSearch: (search: Record<string, unknown>) => ({
    objective: (search.objective as string) || undefined,
  }),
});

type View = "list" | "detail" | "addText";

function LibraryPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [customItems, setCustomItems] = useState<MemoryItem[]>([]);
  const [view, setView] = useState<View>("list");
  const [activeObjective, setActiveObjective] = useState<Objective | null>(null);
  const [showNewObjective, setShowNewObjective] = useState(false);
  const [showAddText, setShowAddText] = useState(false);

  useEffect(() => {
    setObjectives(loadObjectives());
    setCustomItems(loadCustomItems());
  }, []);

  // Sync with URL search param
  useEffect(() => {
    if (search.objective) {
      const obj = objectives.find((o) => o.id === search.objective);
      if (obj) {
        setActiveObjective(obj);
        setView("detail");
      }
    } else {
      setView("list");
      setActiveObjective(null);
    }
  }, [search.objective, objectives]);

  const refreshObjectives = useCallback(() => {
    const updated = loadObjectives();
    setObjectives(updated);
    if (activeObjective) {
      const updatedActive = updated.find((o) => o.id === activeObjective.id) ?? null;
      setActiveObjective(updatedActive);
    }
  }, [activeObjective]);

  const handleCreateObjective = (name: string, description: string) => {
    const obj = createObjective(name, description, objectives);
    setObjectives([obj, ...objectives]);
    setShowNewObjective(false);
  };

  const handleAddText = (
    text: Omit<MemoryItem, "id" | "createdAt" | "reviewCount" | "mastery">,
  ) => {
    if (!activeObjective) return;
    const result = addTextToObjective(activeObjective.id, text, objectives, customItems);
    setObjectives(result.objectives);
    setCustomItems(result.customItems);
    setActiveObjective(
      result.objectives.find((o) => o.id === activeObjective.id) ?? null,
    );
    setShowAddText(false);
  };

  const handleOpenObjective = (obj: Objective) => {
    navigate({ to: "/collections", search: { objective: obj.id } });
  };

  const handleBackToList = () => {
    navigate({ to: "/collections" });
  };

  const handleStartStudy = () => {
    if (!activeObjective) return;
    const updated = markObjectiveStudied(activeObjective.id, objectives);
    setObjectives(updated);
    navigate({ to: "/play", search: { objective: activeObjective.id } });
  };

  // --- List View ---
  if (view === "list") {
    return (
      <AppLayout>
        <Header
          subtitle="Biblioteca"
          title="Seus objetivos"
          right={
            <Button
              size="icon"
              onClick={() => setShowNewObjective(true)}
              aria-label="Novo objetivo"
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
            </Button>
          }
        />

        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Organize seu conhecimento e continue aprendendo.
        </p>

        <div className="mt-6">
          {objectives.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-5 w-5" strokeWidth={1.5} />}
              title="Nenhum objetivo ainda"
              description="Crie seu primeiro objetivo para começar a organizar seus textos de estudo."
              action={
                <Button
                  onClick={() => setShowNewObjective(true)}
                  className="h-11 rounded-[16px] bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Novo objetivo
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              {objectives.map((obj) => (
                <ObjectiveCard key={obj.id} objective={obj} />
              ))}
            </div>
          )}
        </div>

        <NewObjectiveDialog
          open={showNewObjective}
          onOpenChange={setShowNewObjective}
          onCreate={handleCreateObjective}
        />
      </AppLayout>
    );
  }

  // --- Detail View ---
  if (view === "detail" && activeObjective) {
    const items = getObjectiveItems(activeObjective, customItems);
    const progress = getObjectiveProgress(activeObjective, customItems);

    return (
      <AppLayout>
        <Header
          title={activeObjective.name}
          right={
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToList}
              aria-label="Voltar"
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Button>
          }
        />

        {activeObjective.description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {activeObjective.description}
          </p>
        ) : null}

        {/* Progress summary */}
        <div className="mt-6 card-elevated p-5">
          <div className="grid grid-cols-3 divide-x divide-border">
            <DetailStat
              icon={<FileText className="h-4 w-4" strokeWidth={1.75} />}
              value={`${progress.totalTexts}`}
              label="textos"
            />
            <DetailStat
              icon={<Calendar className="h-4 w-4" strokeWidth={1.75} />}
              value={progress.lastActivityLabel}
              label="último estudo"
            />
            <DetailStat
              icon={<BookOpen className="h-4 w-4" strokeWidth={1.75} />}
              value={`${progress.masteryPct}%`}
              label="domínio"
            />
          </div>
        </div>

        {/* Texts list */}
        <div className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Textos
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddText(true)}
              className="gap-1.5 rounded-full text-[13px] font-medium text-primary hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Adicionar texto
            </Button>
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-5 w-5" strokeWidth={1.5} />}
              title="Nenhum texto ainda"
              description="Adicione seu primeiro texto bíblico a este objetivo para começar a estudar."
              action={
                <Button
                  onClick={() => setShowAddText(true)}
                  className="h-11 rounded-[16px] bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Adicionar texto
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col divide-y divide-border rounded-[20px] border border-border bg-card shadow-soft">
              {items.map((item) => (
                <TextRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Start study button */}
        {items.length > 0 && (
          <div className="mt-8">
            <Button
              onClick={handleStartStudy}
              className="h-12 w-full rounded-[16px] bg-primary text-[14px] font-medium text-primary-foreground hover:bg-primary/90"
            >
              <BookOpen className="h-4 w-4" strokeWidth={2} />
              Estudar este objetivo
            </Button>
          </div>
        )}

        <AddTextDialog
          open={showAddText}
          onOpenChange={setShowAddText}
          onAdd={handleAddText}
        />
      </AppLayout>
    );
  }

  return null;
}

function TextRow({ item }: { item: MemoryItem }) {
  return (
    <div className="flex items-start gap-3 p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-muted text-foreground">
        <FileText className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold tracking-tight">
          {item.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.book} {item.chapter}:{item.verse}
        </p>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
          {item.text}
        </p>
      </div>
      {(item.reviewCount ?? 0) > 0 && (
        <div className="shrink-0 text-right">
          <p className="text-[12px] font-semibold tabular-nums text-foreground">
            {item.mastery ?? 0}%
          </p>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <RefreshCw className="h-2.5 w-2.5" strokeWidth={1.75} />
            {item.reviewCount}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="px-3 py-1 text-center">
      <div className="mx-auto flex items-center justify-center gap-1.5 text-muted-foreground">
        {icon}
      </div>
      <p className="mt-2 text-[16px] font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function NewObjectiveDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (name: string, description: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name, description);
    setName("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold tracking-tight">
            Novo objetivo
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Conhecer Davi"
              className="mt-1.5 h-12 rounded-[14px]"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">
              Descrição (opcional)
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="O que você deseja aprender?"
              className="mt-1.5 rounded-[14px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="h-12 w-full rounded-[16px] bg-primary text-[14px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            Criar objetivo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddTextDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (text: Omit<MemoryItem, "id" | "createdAt" | "reviewCount" | "mastery">) => void;
}) {
  const [title, setTitle] = useState("");
  const [book, setBook] = useState("");
  const [chapter, setChapter] = useState("");
  const [verse, setVerse] = useState("");
  const [text, setText] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!title.trim() || !text.trim()) return;
    onAdd({
      title: title.trim(),
      book: book.trim() || "—",
      chapter: parseInt(chapter) || 0,
      verse: verse.trim(),
      text: text.trim(),
      category: "Pessoal",
      tags: [],
    });
    setTitle("");
    setBook("");
    setChapter("");
    setVerse("");
    setText("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold tracking-tight">
            Adicionar texto
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: O amor de Deus"
              className="mt-1.5 h-12 rounded-[14px]"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Livro</Label>
              <Input
                value={book}
                onChange={(e) => setBook(e.target.value)}
                placeholder="João"
                className="mt-1.5 h-12 rounded-[14px]"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Cap.</Label>
              <Input
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="3"
                inputMode="numeric"
                className="mt-1.5 h-12 rounded-[14px]"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Vers.</Label>
              <Input
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                placeholder="16"
                className="mt-1.5 h-12 rounded-[14px]"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">
              Texto bíblico
            </Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Porque Deus amou o mundo..."
              className="mt-1.5 min-h-[100px] rounded-[14px]"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">
              Observações (opcional)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anotações pessoais sobre este texto"
              className="mt-1.5 rounded-[14px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || !text.trim()}
            className="h-12 w-full rounded-[16px] bg-primary text-[14px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            Salvar texto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
