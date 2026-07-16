import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
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
  MoveVertical as MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Check,
  Share2,
  Download,
  Loader as Loader2,
} from "lucide-react";
import type { Objective, MemoryItem } from "@/types";
import {
  fetchObjectives,
  createObjectiveInDb,
  updateObjectiveInDb,
  deleteObjectiveInDb,
  addMemoryText,
  updateMemoryText,
  deleteMemoryText,
  duplicateMemoryText,
  duplicateObjectiveInDb,
  markStudiedLocally,
  getObjectiveProgress,
} from "@/services/ObjectiveService";
import { useSharedObjectives } from "@/hooks/useSharedObjectives";
import { ShareDialog, ImportDialog } from "@/components/ShareDialog";
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
  validateSearch: (search: Record<string, unknown>): { objective?: string } => ({
    objective: (search.objective as string) || undefined,
  }),
});

type View = "list" | "detail";

// Map of objectiveId → MemoryItem[] kept in sync with DB
type ItemsMap = Record<string, MemoryItem[]>;

function LibraryPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [itemsMap, setItemsMap] = useState<ItemsMap>({});
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const [view, setView] = useState<View>("list");
  const [activeObjective, setActiveObjective] = useState<Objective | null>(null);
  const [showNewObjective, setShowNewObjective] = useState(false);
  const [showAddText, setShowAddText] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [deletingObjective, setDeletingObjective] = useState<Objective | null>(null);
  const [editingText, setEditingText] = useState<MemoryItem | null>(null);
  const [deletingText, setDeletingText] = useState<MemoryItem | null>(null);
  const [sharingObjective, setSharingObjective] = useState<Objective | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importCode, setImportCode] = useState<string | null>(null);

  const { importedObjectives, shareObjective, importSharedObjective, removeImportedObjective } =
    useSharedObjectives();

  // ─── Load data ──────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    setDbError(null);

    const { data, error } = await fetchObjectives();

    if (error) {
      setDbError(error);
      setLoading(false);
      return;
    }

    if (data) {
      const objs = data.map((r) => r.objective);
      const map: ItemsMap = {};
      for (const r of data) {
        map[r.objective.id] = r.items;
      }
      setObjectives(objs);
      setItemsMap(map);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ─── URL → detail view ──────────────────────────────────────────────────────

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

  // ─── Import URL param ───────────────────────────────────────────────────────

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const importParam = params.get("import");
    if (importParam) {
      setImportCode(importParam);
      setShowImport(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const getItems = (obj: Objective): MemoryItem[] => itemsMap[obj.id] ?? [];

  const updateObjectiveInState = (updated: Objective) => {
    setObjectives((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    if (activeObjective?.id === updated.id) setActiveObjective(updated);
  };

  // ─── Objectives CRUD ────────────────────────────────────────────────────────

  const handleCreateObjective = async (name: string, description: string) => {
    const { data, error } = await createObjectiveInDb(name, description);
    if (error || !data) {
      toast.error(error ?? "Erro ao criar objetivo.");
      return;
    }
    setObjectives((prev) => [data, ...prev]);
    setItemsMap((prev) => ({ ...prev, [data.id]: [] }));
    setShowNewObjective(false);
    toast.success("Objetivo criado.");
  };

  const handleUpdateObjective = async (name: string, description: string) => {
    if (!editingObjective) return;
    const { data, error } = await updateObjectiveInDb(editingObjective.id, { name, description });
    if (error || !data) {
      toast.error(error ?? "Erro ao atualizar objetivo.");
      return;
    }
    // Preserve items in the updated objective
    const withItems = { ...data, itemIds: getItems(editingObjective).map((i) => i.id) };
    updateObjectiveInState(withItems);
    setEditingObjective(null);
    toast.success("Objetivo atualizado.");
  };

  const handleDeleteObjective = async () => {
    if (!deletingObjective) return;
    const { error } = await deleteObjectiveInDb(deletingObjective.id);
    if (error) {
      toast.error(error);
      setDeletingObjective(null);
      return;
    }
    setObjectives((prev) => prev.filter((o) => o.id !== deletingObjective.id));
    setItemsMap((prev) => {
      const next = { ...prev };
      delete next[deletingObjective.id];
      return next;
    });
    setDeletingObjective(null);
    if (view === "detail" && activeObjective?.id === deletingObjective.id) {
      navigate({ to: "/collections" });
    }
    toast.success("Objetivo removido.");
  };

  const handleDuplicateObjective = async (obj: Objective) => {
    const { data, error } = await duplicateObjectiveInDb(obj.id, objectives);
    if (error || !data) {
      toast.error(error ?? "Erro ao duplicar objetivo.");
      return;
    }
    setObjectives((prev) => [data.objective, ...prev]);
    setItemsMap((prev) => ({ ...prev, [data.objective.id]: data.items }));
    toast.success("Objetivo duplicado.");
  };

  // ─── Texts CRUD ─────────────────────────────────────────────────────────────

  const handleAddText = async (
    text: Omit<MemoryItem, "id" | "createdAt" | "reviewCount" | "mastery">,
    addAnother: boolean,
  ) => {
    if (!activeObjective) return;
    const currentItems = getItems(activeObjective);
    const { data, error } = await addMemoryText(activeObjective.id, text, currentItems.length);
    if (error || !data) {
      toast.error(error ?? "Erro ao salvar texto.");
      return;
    }
    const newItems = [...currentItems, data];
    setItemsMap((prev) => ({ ...prev, [activeObjective.id]: newItems }));
    // Update objective itemIds in state
    const updatedObj = { ...activeObjective, itemIds: newItems.map((i) => i.id) };
    updateObjectiveInState(updatedObj);

    if (addAnother) {
      toast.success("Texto salvo. Adicione outro.");
    } else {
      setShowAddText(false);
      toast.success("Texto salvo.");
    }
  };

  const handleUpdateText = async (
    itemId: string,
    updates: Partial<Omit<MemoryItem, "id" | "createdAt">>,
  ) => {
    const { data, error } = await updateMemoryText(itemId, updates);
    if (error || !data) {
      toast.error(error ?? "Erro ao atualizar texto.");
      return;
    }
    if (activeObjective) {
      setItemsMap((prev) => ({
        ...prev,
        [activeObjective.id]: (prev[activeObjective.id] ?? []).map((i) =>
          i.id === itemId ? data : i,
        ),
      }));
    }
    setEditingText(null);
    toast.success("Texto atualizado.");
  };

  const handleDeleteText = async () => {
    if (!deletingText || !activeObjective) return;
    const { error } = await deleteMemoryText(deletingText.id);
    if (error) {
      toast.error(error);
      setDeletingText(null);
      return;
    }
    const newItems = getItems(activeObjective).filter((i) => i.id !== deletingText.id);
    setItemsMap((prev) => ({ ...prev, [activeObjective.id]: newItems }));
    const updatedObj = { ...activeObjective, itemIds: newItems.map((i) => i.id) };
    updateObjectiveInState(updatedObj);
    setDeletingText(null);
    toast.success("Texto removido.");
  };

  const handleDuplicateText = async (itemId: string) => {
    if (!activeObjective) return;
    const currentItems = getItems(activeObjective);
    const { data, error } = await duplicateMemoryText(
      itemId,
      activeObjective.id,
      currentItems.length,
    );
    if (error || !data) {
      toast.error(error ?? "Erro ao duplicar texto.");
      return;
    }
    const newItems = [...currentItems, data];
    setItemsMap((prev) => ({ ...prev, [activeObjective.id]: newItems }));
    const updatedObj = { ...activeObjective, itemIds: newItems.map((i) => i.id) };
    updateObjectiveInState(updatedObj);
    toast.success("Texto duplicado.");
  };

  const handleStartStudy = () => {
    if (!activeObjective) return;
    const updated = markStudiedLocally(activeObjective);
    updateObjectiveInState(updated);
    navigate({ to: "/play", search: { objective: activeObjective.id } });
  };

  // ─── Share / Import ──────────────────────────────────────────────────────────

  const handleShare = async (
    objective: Objective,
    items: MemoryItem[],
    permissionLevel: "read_only" | "allow_copy" | "allow_collaboration",
  ) => {
    return shareObjective(objective, items, permissionLevel);
  };

  const handleImport = async (shareCode: string, copyToLibrary: boolean) => {
    const result = await importSharedObjective(shareCode, copyToLibrary);
    if (!result.error) void loadData(); // refresh after import
    return result;
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AppLayout>
        <Header subtitle="Biblioteca" title="Seus objetivos" />
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (dbError) {
    return (
      <AppLayout>
        <Header subtitle="Biblioteca" title="Seus objetivos" />
        <div className="mt-8 rounded-[20px] border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">Não foi possível carregar os dados.</p>
          <p className="mt-1 text-xs text-muted-foreground">{dbError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadData()}
            className="mt-4 rounded-full"
          >
            Tentar novamente
          </Button>
        </div>
      </AppLayout>
    );
  }

  // ─── List View ───────────────────────────────────────────────────────────────

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

        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImport(true)}
            className="gap-1.5 rounded-full text-[13px] font-medium"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            Importar
          </Button>
        </div>

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
                        <DropdownMenuItem
                          onClick={() => setSharingObjective(obj)}
                          className="gap-2 rounded-[10px]"
                        >
                          <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Compartilhar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => void handleDuplicateObjective(obj)}
                          className="gap-2 rounded-[10px]"
                        >
                          <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Duplicar
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

        {/* Shared Libraries Section */}
        {importedObjectives.length > 0 && (
          <div className="mt-10">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Bibliotecas Compartilhadas
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {importedObjectives.map((shared) => (
                <div
                  key={shared.shareCode}
                  className="rounded-[20px] border border-border bg-card shadow-soft p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold tracking-tight">{shared.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Por {shared.ownerName}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Opções"
                        >
                          <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-[14px]">
                        <DropdownMenuItem
                          onClick={() => {
                            setImportCode(shared.shareCode);
                            setShowImport(true);
                          }}
                          className="gap-2 rounded-[10px]"
                        >
                          <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Ver conteúdo
                        </DropdownMenuItem>
                        {shared.objectiveId && (
                          <DropdownMenuItem
                            onClick={() =>
                              navigate({
                                to: "/collections",
                                search: { objective: shared.objectiveId },
                              })
                            }
                            className="gap-2 rounded-[10px]"
                          >
                            <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
                            Abrir na biblioteca
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => removeImportedObjective(shared.shareCode)}
                          className="gap-2 rounded-[10px] text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase">
                      {shared.permissionLevel === "read_only" && "Somente leitura"}
                      {shared.permissionLevel === "allow_copy" && "Permitir copiar"}
                      {shared.permissionLevel === "allow_collaboration" && "Colaboração"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <NewObjectiveDialog
          open={showNewObjective}
          onOpenChange={setShowNewObjective}
          onCreate={(name, desc) => void handleCreateObjective(name, desc)}
        />

        <EditObjectiveDialog
          objective={editingObjective}
          onOpenChange={(v) => !v && setEditingObjective(null)}
          onSave={(name, desc) => void handleUpdateObjective(name, desc)}
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
                onClick={() => void handleDeleteObjective()}
                className="rounded-[14px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ShareDialog
          open={!!sharingObjective}
          onOpenChange={(v) => !v && setSharingObjective(null)}
          objective={sharingObjective}
          items={sharingObjective ? getItems(sharingObjective) : []}
          onShare={handleShare}
        />

        <ImportDialog
          open={showImport}
          onOpenChange={setShowImport}
          shareCode={importCode}
          onImport={handleImport}
        />
      </AppLayout>
    );
  }

  // ─── Detail View ─────────────────────────────────────────────────────────────

  if (view === "detail" && activeObjective) {
    const items = getItems(activeObjective);
    const progress = getObjectiveProgress(activeObjective, items);

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
                  <DropdownMenuItem
                    onClick={() => setSharingObjective(activeObjective)}
                    className="gap-2 rounded-[10px]"
                  >
                    <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Compartilhar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => void handleDuplicateObjective(activeObjective)}
                    className="gap-2 rounded-[10px]"
                  >
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Duplicar
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
                  onDuplicate={() => void handleDuplicateText(item.id)}
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
          onAdd={(text, addAnother) => void handleAddText(text, addAnother)}
        />

        <EditTextDialog
          item={editingText}
          onOpenChange={(v) => !v && setEditingText(null)}
          onSave={(id, updates) => void handleUpdateText(id, updates)}
        />

        <EditObjectiveDialog
          objective={editingObjective}
          onOpenChange={(v) => !v && setEditingObjective(null)}
          onSave={(name, desc) => void handleUpdateObjective(name, desc)}
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
                onClick={() => void handleDeleteObjective()}
                className="rounded-[14px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!deletingText} onOpenChange={(v) => !v && setDeletingText(null)}>
          <AlertDialogContent className="rounded-[24px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[18px] font-semibold tracking-tight">
                Excluir texto
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {deletingText ? `"${deletingText.title}" será removido permanentemente.` : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-[14px]">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void handleDeleteText()}
                className="rounded-[14px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ShareDialog
          open={!!sharingObjective}
          onOpenChange={(v) => !v && setSharingObjective(null)}
          objective={sharingObjective}
          items={sharingObjective ? getItems(sharingObjective) : []}
          onShare={handleShare}
        />

        <ImportDialog
          open={showImport}
          onOpenChange={setShowImport}
          shareCode={importCode}
          onImport={handleImport}
        />
      </AppLayout>
    );
  }

  return null;
}

// ─── Sub-components (UI only — unchanged from original) ──────────────────────

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
        <p className="truncate text-[14px] font-semibold tracking-tight">{item.title}</p>
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
      <p className="mt-2 text-[16px] font-semibold tabular-nums tracking-tight">{value}</p>
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
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
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
  onSave: (itemId: string, updates: Partial<Omit<MemoryItem, "id" | "createdAt">>) => void;
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
  const update = (key: keyof TextFormData, value: string) => setForm({ ...form, [key]: value });

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
        <Label className="text-xs font-medium text-muted-foreground">Texto bíblico</Label>
        <Textarea
          value={form.text}
          onChange={(e) => update("text", e.target.value)}
          placeholder="Porque Deus amou o mundo..."
          className="mt-1.5 min-h-[100px] rounded-[14px]"
        />
      </div>
      <div>
        <Label className="text-xs font-medium text-muted-foreground">Observações (opcional)</Label>
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
