import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Share2, Copy, Check, Link, Loader as Loader2, Users, Eye, Library } from "lucide-react";
import { toast } from "sonner";
import type { SharedPermissionLevel } from "@/lib/supabaseClient";
import type { Objective, MemoryItem } from "@/types";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  objective: Objective | null;
  items: MemoryItem[];
  onShare: (
    objective: Objective,
    items: MemoryItem[],
    permissionLevel: SharedPermissionLevel,
  ) => Promise<{ shareCode: string; error: Error | null }>;
}

export function ShareDialog({ open, onOpenChange, objective, items, onShare }: ShareDialogProps) {
  const [permissionLevel, setPermissionLevel] = useState<SharedPermissionLevel>("allow_copy");
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setShareCode(null);
      setCopied(false);
      setShowSuccess(false);
      setPermissionLevel("allow_copy");
    }
  }, [open]);

  const handleShare = async () => {
    if (!objective) return;
    setLoading(true);
    const result = await onShare(objective, items, permissionLevel);
    setLoading(false);

    if (result.error) {
      toast("Erro ao compartilhar. Tente novamente.");
    } else {
      setShareCode(result.shareCode);
      setShowSuccess(true);
    }
  };

  const shareUrl = shareCode ? `${window.location.origin}/collections?import=${shareCode}` : "";

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Não foi possível copiar o link.");
    }
  };

  const handleCopyCode = async () => {
    if (!shareCode) return;
    try {
      await navigator.clipboard.writeText(shareCode);
      toast("Código copiado!");
    } catch {
      toast("Não foi possível copiar o código.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[18px] font-semibold tracking-tight">
            <Share2 className="h-5 w-5" strokeWidth={1.75} />
            Compartilhar objetivo
          </DialogTitle>
        </DialogHeader>

        {!showSuccess ? (
          <div className="flex flex-col gap-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Compartilhe "{objective?.name}" com outras pessoas. Elas poderão importar para sua
              própria biblioteca.
            </p>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Nível de permissão
              </Label>
              <Select
                value={permissionLevel}
                onValueChange={(v) => setPermissionLevel(v as SharedPermissionLevel)}
              >
                <SelectTrigger className="mt-1.5 h-12 rounded-[14px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[14px]">
                  <SelectItem value="read_only" className="rounded-[10px]">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" strokeWidth={1.75} />
                      <div>
                        <p className="font-medium">Somente leitura</p>
                        <p className="text-xs text-muted-foreground">
                          Apenas visualizar, sem copiar
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="allow_copy" className="rounded-[10px]">
                    <div className="flex items-center gap-2">
                      <Library className="h-4 w-4" strokeWidth={1.75} />
                      <div>
                        <p className="font-medium">Permitir copiar</p>
                        <p className="text-xs text-muted-foreground">
                          Importar para a biblioteca pessoal
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="allow_collaboration" className="rounded-[10px]">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" strokeWidth={1.75} />
                      <div>
                        <p className="font-medium">Colaboração</p>
                        <p className="text-xs text-muted-foreground">Editar textos em conjunto</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-[14px] border border-border bg-muted/50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Este objetivo contém
              </p>
              <p className="mt-1 text-sm text-foreground">
                {items.length} texto{items.length !== 1 ? "s" : ""}
              </p>
            </div>

            <Button
              onClick={handleShare}
              disabled={loading || items.length === 0}
              className="h-12 rounded-[16px] bg-primary text-[14px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Share2 className="h-4 w-4" strokeWidth={2} />
                  Gerar link de compartilhamento
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Check className="h-6 w-6" strokeWidth={2} />
              </div>
              <p className="text-center text-sm text-muted-foreground">Link gerado com sucesso!</p>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Código de compartilhamento
              </Label>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 rounded-[14px] border border-border bg-muted/50 px-4 py-3">
                  <p className="font-mono text-lg font-bold tracking-wider text-foreground">
                    {shareCode}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleCopyCode}
                  className="h-12 rounded-[14px] px-4"
                >
                  <Copy className="h-4 w-4" strokeWidth={2} />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Link completo</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 overflow-hidden rounded-[14px] border border-border bg-muted/50 px-4 py-3">
                  <p className="truncate text-sm text-muted-foreground">{shareUrl}</p>
                </div>
                <Button onClick={handleCopyLink} className="h-12 rounded-[14px] px-4">
                  {copied ? (
                    <Check className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <Link className="h-4 w-4" strokeWidth={2} />
                  )}
                </Button>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Compartilhe o código "<span className="font-mono font-medium">{shareCode}</span>" ou o
              link acima.
            </p>

            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 rounded-[16px] text-[14px] font-medium"
            >
              Concluir
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  shareCode: string | null;
  onImport: (
    shareCode: string,
    copyToLibrary: boolean,
  ) => Promise<{
    data: import("@/lib/supabaseClient").SharedObjectiveWithItems | null;
    error: Error | null;
    objectiveId?: string;
  }>;
  onSuccess?: (objectiveId?: string) => void;
}

export function ImportDialog({
  open,
  onOpenChange,
  shareCode,
  onImport,
  onSuccess,
}: ImportDialogProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<
    import("@/lib/supabaseClient").SharedObjectiveWithItems | null
  >(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (open && shareCode) {
      setCode(shareCode);
      loadPreview(shareCode);
    } else if (open) {
      setCode("");
      setPreview(null);
      setPreviewError(null);
    }
  }, [open, shareCode]);

  const loadPreview = async (codeToLoad: string) => {
    if (!codeToLoad.trim()) return;
    setPreviewLoading(true);
    setPreviewError(null);
    setPreview(null);

    const { getSharedObjective } = await import("@/lib/supabaseClient");
    const result = await getSharedObjective(codeToLoad.trim().toUpperCase());

    setPreviewLoading(false);
    if (result.error) {
      setPreviewError("Objetivo não encontrado ou código inválido.");
    } else {
      setPreview(result.data);
    }
  };

  const handlePreview = () => {
    if (code.trim()) {
      loadPreview(code.trim());
    }
  };

  const handleImport = async (copyToLibrary: boolean) => {
    if (!code.trim()) return;
    setLoading(true);
    const result = await onImport(code.trim(), copyToLibrary);
    setLoading(false);

    if (result.error) {
      toast("Erro ao importar. Verifique o código e tente novamente.");
    } else {
      toast(
        copyToLibrary
          ? "Importado para sua biblioteca!"
          : "Adicionado às bibliotecas compartilhadas",
      );
      onOpenChange(false);
      onSuccess?.(result.objectiveId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[18px] font-semibold tracking-tight">
            <Library className="h-5 w-5" strokeWidth={1.75} />
            Importar objetivo
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Cole o código de compartilhamento para importar um objetivo.
          </p>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">
              Código de compartilhamento
            </Label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex.: ABC123DE"
                className="h-12 flex-1 rounded-[14px] border border-border bg-background px-4 font-mono text-lg uppercase tracking-wider focus:border-foreground/30 focus:outline-none"
              />
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!code.trim() || previewLoading}
                className="h-12 rounded-[14px] px-4"
              >
                {previewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
              </Button>
            </div>
          </div>

          {previewError && (
            <p className="rounded-[12px] bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {previewError}
            </p>
          )}

          {preview && (
            <div className="rounded-[14px] border border-border bg-muted/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold tracking-tight">{preview.name}</p>
                  {preview.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{preview.description}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span>Por {preview.owner_name}</span>
                <span>·</span>
                <span>{preview.items.length} textos</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                {preview.permission_level === "read_only" && (
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                    <Eye className="h-3 w-3" /> Somente leitura
                  </span>
                )}
                {preview.permission_level === "allow_copy" && (
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                    <Library className="h-3 w-3" /> Permitir copiar
                  </span>
                )}
                {preview.permission_level === "allow_collaboration" && (
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                    <Users className="h-3 w-3" /> Colaboração
                  </span>
                )}
              </div>
            </div>
          )}

          {preview && (
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleImport(true)}
                disabled={loading || preview.permission_level === "read_only"}
                className="h-12 rounded-[16px] bg-primary text-[14px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Library className="h-4 w-4" strokeWidth={2} />
                    Copiar para minha biblioteca
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleImport(false)}
                disabled={loading}
                className="h-12 rounded-[16px] text-[14px] font-medium"
              >
                Adicionar às compartilhadas (sem copiar)
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
