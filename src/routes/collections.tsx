import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Plus,
  FileText,
  Calendar,
  RefreshCw,
  BookOpen,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Check,
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
  updateObjective,
  deleteObjective,
  updateCustomItem,
  deleteCustomItem,
  duplicateCustomItem,
} from "@/data/objectives";
import { toast } from "sonner";

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

type View = "list" | "detail";

function LibraryPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [customItems, setCustomItems] = useState<MemoryItem[]>([]);
  const [view, setView] = useState<View>("list");
  const [activeObjective, setActiveObjective] = useState<Objective | null>(null);
  const [showNewObjective, setShowNewObjective] = useState(false);
  const [showAddText, setShowAddText] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [deletingObjective, setDeletingObjective] = useState<Objective | null>(null);
  const [editingText, setEditingText] = useState<MemoryItem | null>(null);
  const [deletingText, setDeletingText] = useState<MemoryItem | null>(null);

  useEffect(() => {
    setObjectives(loadObjectives());
    setCustomItems(loadCustomItems());
  }, []);

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

  const syncState = (objs: Objective[], items: MemoryItem[]) => {
    setObjectives(objs);
    setCustomItems(items);
    if (activeObjective) {
      setActiveObjective(objs.find((o) => o.id === activeObjective.id) ?? null);
    }
  };

  const handleCreateObjective = (name: string, description: string) => {
    const obj = createObjective(name, description, objectives);
    setObjectives([obj, ...objectives]);
    setShowNewObjective(false);
    toast("Objetivo criado.");
  };

  const handleUpdateObjective = (name: string, description: string) => {
    if (!editingObjective) return;
    const updated = updateObjective(
      editingObjective.id,
      { name, description },
      objectives,
    );
    setObjectives(updated);
    if (activeObjective) {
      setActiveObjective(updated.find((o) => o.id === activeObjective.id) ?? null);
    }
    setEditingObjective(null);
    toast("Objetivo atualizado.");
  };

  const handleDeleteObjective = () => {
    if (!deletingObjective) return;
    const result = deleteObjective(deletingObjective.id, objectives, customItems);
    syncState(result.objectives, result.customItems);
    setDeletingObjective(null);
    if (view === "detail" && activeObjective?.id === deletingObjective.id) {
      navigate({ to: "/collections" });
    }
    toast("Objetivo removido.");
  };

  const handleAddText = (
    text: Omit<MemoryItem, "id" | "createdAt" | "reviewCount" | "mastery">,
    addAnother: boolean,
  ) => {
    if (!activeObjective) return;
    const result = addTextToObjective(activeObjective.id, text, objectives, customItems);
    setObjectives(result.objectives);
    setCustomItems(result.customItems);
    setActiveObjective(
      result.objectives.find((o) => o.id === activeObjective.id) ?? null,
    );
    if (addAnother) {
      toast("Texto salvo. Adicione outro.");
    } else {
      setShowAddText(false);
      toast("Texto salvo.");
    }
  };

  const handleUpdateText = (
    itemId: string,
    updates: Partial<Omit<MemoryItem, "id" | "createdAt">>,
  ) => {
    const updated = updateCustomItem(itemId, updates, customItems);
    setCustomItems(updated);
    setEditingText(null);
    toast("Texto atualizado.");
  };

  const handleDeleteText = () => {
    if (!deletingText || !activeObjective) return;
    const result = deleteCustomItem(deletingText.id, objectives, customItems);
    syncState(result.objectives, result.customItems);
    setDeletingText(null);
    toast("Texto removido.");
  };

  const handleDuplicateText = (itemId: string) => {
    if (!activeObjective) return;
    const result = duplicateCustomItem(itemId, activeObjective.id, objectives, customItems);
    syncState(result.objectives, result.customItems);
    toast("Texto duplicado.");
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
              title="Seu conhecimento começa com um primeiro passo."
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
                <div key={obj.id} className="relative">
                  <ObjectiveCard objective={obj} />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Opções do objetivo"
                        >
                          <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-[14px]">
                        <DropdownMenuItem
                          onClick={() => setEditingObjective(obj)}
                          className="gap-2 rounded-[10px]"
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingObjective(obj)}
                          className="gap-2 rounded-[10px] text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <NewObjectiveDialog
          open={showNewObjective}
          onOpenChange={setShowNewObjective}
          onCreate={handleCreateObjective}
        />

        <EditObjectiveDialog
          objective={editingObjective}
          onOpenChange={(v) => !v && setEditingObjective(null)}
          onSave={handleUpdateObjective}
        />

        <AlertDialog
          open={!!deletingObjective}
          onOpenChange={(v) => !v && setDeletingObjective(null)}
        >
          <AlertDialogContent className="rounded-[24px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[18px] font-semibold tracking-tight">
                Excluir objetivo
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {deletingObjective
                  ? `"${deletingObjective.name}" e seus textos serão removidos permanentemente. Esta ação não pode ser desfeita.`
                  : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-[14px]">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteObjective}
                className="rounded-[14px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Opções do objetivo"
                    className="rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <MoreVertical className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-[14px]">
                  <DropdownMenuItem
                    onClick={() => setEditingObjective(activeObjective)}
                    className="gap-2 rounded-[10px]"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeletingObjective(activeObjective)}
                    className="gap-2 rounded-[10px] text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: "/collections" })}
                aria-label="Voltar"
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </Button>
            </div>
          }
        />

        {activeObjective.description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {activeObjective.description}
          </p>
        ) : null}

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
                <TextRow
                  key={item.id}
                  item={item}
                  onEdit={() => setEditingText(item)}
                  onDelete={() => setDeletingText(item)}
                  onDuplicate={() => handleDuplicateText(item.id)}
                />
              ))}
            </div>
          )}
        </div>

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

        <EditTextDialog
          item={editingText}
          onOpenChange={(v) => !v && setEditingText(null)}
          onSave={handleUpdateText}
        />

        <EditObjectiveDialog
          objective={editingObjective}
          onOpenChange={(v) => !v && setEditingObjective(null)}
          onSave={handleUpdateObjective}
        />

        <AlertDialog
          open={!!deletingObjective}
          onOpenChange={(v) => !v && setDeletingObjective(null)}
        >
          <AlertDialogContent className="rounded-[24px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[18px] font-semibold tracking-tight">
                Excluir objetivo
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {deletingObjective
                  ? `"${deletingObjective.name}" e seus textos serão removidos permanentemente. Esta ação não pode ser desfeita.`
                  : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-[14px]">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteObjective}
                className="rounded-[14px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={!!deletingText}
          onOpenChange={(v) => !v && setDeletingText(null)}
        >
          <AlertDialogContent className="rounded-[24px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[18px] font-semibold tracking-tight">
                Excluir texto
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {deletingText
                  ? `"${deletingText.title}" será removido permanentemente.`
                  : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-[14px]">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteText}
                className="rounded-[14px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AppLayout>
    );
  }

  return null;
}

function TextRow({
  item,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  item: MemoryItem;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Opções do texto"
          >
            <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-[14px]">
          <DropdownMenuItem onClick={onEdit} className="gap-2 rounded-[10px]">
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDuplicate} className="gap-2 rounded-[10px]">
            <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onDelete}
            className="gap-2 rounded-[10px] text-destructive focus:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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

function EditObjectiveDialog({
  objective,
  onOpenChange,
  onSave,
}: {
  objective: Objective | null;
  onOpenChange: (v: boolean) => void;
  onSave: (name: string, description: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (objective) {
      setName(objective.name);
      setDescription(objective.description ?? "");
    }
  }, [objective]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name, description);
  };

  return (
    <Dialog open={!!objective} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold tracking-tight">
            Editar objetivo
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
            onClick={handleSave}
            disabled={!name.trim()}
            className="h-12 w-full rounded-[16px] bg-primary text-[14px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TextFormData {
  title: string;
  book: string;
  chapter: string;
  verse: string;
  text: string;
  notes: string;
}

function AddTextDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (
    text: Omit<MemoryItem, "id" | "createdAt" | "reviewCount" | "mastery">,
    addAnother: boolean,
  ) => void;
}) {
  const [form, setForm] = useState<TextFormData>({
    title: "",
    book: "",
    chapter: "",
    verse: "",
    text: "",
    notes: "",
  });

  const reset = () => {
    setForm({ title: "", book: "", chapter: "", verse: "", text: "", notes: "" });
  };

  const buildItem = () => ({
    title: form.title.trim(),
    book: form.book.trim() || "—",
    chapter: parseInt(form.chapter) || 0,
    verse: form.verse.trim(),
    text: form.text.trim(),
    category: "Pessoal",
    tags: [],
  });

  const canSave = form.title.trim() && form.text.trim();

  const handleSave = () => {
    if (!canSave) return;
    onAdd(buildItem(), false);
    reset();
  };

  const handleSaveAndAdd = () => {
    if (!canSave) return;
    onAdd(buildItem(), true);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold tracking-tight">
            Adicionar texto
          </DialogTitle>
        </DialogHeader>
        <TextFormFields form={form} setForm={setForm} />
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className="h-12 w-full rounded-[16px] bg-primary text-[14px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            <Check className="h-4 w-4" strokeWidth={2} />
            Concluir
          </Button>
          <Button
            onClick={handleSaveAndAdd}
            disabled={!canSave}
            variant="outline"
            className="h-12 w-full rounded-[16px] text-[14px] font-medium disabled:opacity-40"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Salvar e adicionar outro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditTextDialog({
  item,
  onOpenChange,
  onSave,
}: {
  item: MemoryItem | null;
  onOpenChange: (v: boolean) => void;
  onSave: (
    itemId: string,
    updates: Partial<Omit<MemoryItem, "id" | "createdAt">>,
  ) => void;
}) {
  const [form, setForm] = useState<TextFormData>({
    title: "",
    book: "",
    chapter: "",
    verse: "",
    text: "",
    notes: "",
  });

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title,
        book: item.book,
        chapter: String(item.chapter),
        verse: item.verse,
        text: item.text,
        notes: "",
      });
    }
  }, [item]);

  const handleSave = () => {
    if (!item || !form.title.trim() || !form.text.trim()) return;
    onSave(item.id, {
      title: form.title.trim(),
      book: form.book.trim() || "—",
      chapter: parseInt(form.chapter) || 0,
      verse: form.verse.trim(),
      text: form.text.trim(),
    });
  };

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold tracking-tight">
            Editar texto
          </DialogTitle>
        </DialogHeader>
        <TextFormFields form={form} setForm={setForm} />
        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={!form.title.trim() || !form.text.trim()}
            className="h-12 w-full rounded-[16px] bg-primary text-[14px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TextFormFields({
  form,
  setForm,
}: {
  form: TextFormData;
  setForm: (f: TextFormData) => void;
}) {
  const update = (key: keyof TextFormData, value: string) =>
    setForm({ ...form, [key]: value });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label className="text-xs font-medium text-muted-foreground">Título</Label>
        <Input
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Ex.: O amor de Deus"
          className="mt-1.5 h-12 rounded-[14px]"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Livro</Label>
          <Input
            value={form.book}
            onChange={(e) => update("book", e.target.value)}
            placeholder="João"
            className="mt-1.5 h-12 rounded-[14px]"
          />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Cap.</Label>
          <Input
            value={form.chapter}
            onChange={(e) => update("chapter", e.target.value)}
            placeholder="3"
            inputMode="numeric"
            className="mt-1.5 h-12 rounded-[14px]"
          />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Vers.</Label>
          <Input
            value={form.verse}
            onChange={(e) => update("verse", e.target.value)}
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
          value={form.text}
          onChange={(e) => update("text", e.target.value)}
          placeholder="Porque Deus amou o mundo..."
          className="mt-1.5 min-h-[100px] rounded-[14px]"
        />
      </div>
      <div>
        <Label className="text-xs font-medium text-muted-foreground">
          Observações (opcional)
        </Label>
        <Textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Anotações pessoais sobre este texto"
          className="mt-1.5 rounded-[14px]"
        />
      </div>
    </div>
  );
}
