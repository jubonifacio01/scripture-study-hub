import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { CollectionCard } from "@/components/CollectionCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { collections as seed } from "@/data/collections";
import type { Collection } from "@/types";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Coleções — Memorize+" },
      {
        name: "description",
        content: "Organize seus versículos em coleções e revise por tema.",
      },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>(seed);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📖");

  const create = () => {
    if (!name.trim()) return;
    const c: Collection = {
      id: `col-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || "Nova coleção pessoal.",
      emoji: emoji || "📖",
      itemIds: [],
      color: "accent",
    };
    setCollections((cs) => [c, ...cs]);
    setName("");
    setDescription("");
    setEmoji("📖");
    setOpen(false);
  };

  return (
    <AppLayout>
      <Header
        subtitle="Sua biblioteca"
        title="Coleções"
        right={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-2xl gradient-primary text-primary-foreground">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-display">Nova coleção</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-[80px_1fr] gap-3">
                  <div>
                    <Label className="text-xs">Emoji</Label>
                    <Input
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      className="mt-1 h-12 text-center text-2xl"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Nome</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex.: Salmos favoritos"
                      className="mt-1 h-12"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Descrição</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Sobre o que é essa coleção?"
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={create}
                  className="w-full rounded-2xl gradient-primary text-primary-foreground"
                >
                  Criar coleção
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <p className="mt-1 text-sm text-muted-foreground">
        {collections.length} coleções · {collections.reduce((a, c) => a + c.itemIds.length, 0)}{" "}
        versículos
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3">
        {collections.map((c) => (
          <CollectionCard key={c.id} collection={c} />
        ))}
      </div>
    </AppLayout>
  );
}
