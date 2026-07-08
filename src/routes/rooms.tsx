import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayerCard } from "@/components/PlayerCard";
import { toast } from "sonner";
import { Users2, Copy } from "lucide-react";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Salas — Memorize+" },
      {
        name: "description",
        content: "Crie salas com amigos ou entre com um código para praticar juntos.",
      },
    ],
  }),
  component: RoomsPage,
});

function generateCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

function RoomsPage() {
  const [code, setCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");

  const create = () => setCode(generateCode());
  const join = () => {
    if (joinCode.trim().length < 4) {
      toast.error("Código inválido");
      return;
    }
    toast("Multiplayer em breve", {
      description: `Você pediu para entrar na sala ${joinCode.toUpperCase()}.`,
    });
  };

  return (
    <AppLayout>
      <Header subtitle="Estudo em grupo" title="Salas" />

      <section className="mt-8 card-elevated p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground">
            <Users2 className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Sala privada
            </p>
            <h2 className="text-base font-semibold tracking-tight">Criar uma sala</h2>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Convide amigos com um código e pratiquem juntos em tempo real.
        </p>
        <Button
          onClick={create}
          size="lg"
          className="mt-5 h-11 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Gerar código
        </Button>

        {code ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Seu código
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-[0.15em] tabular-nums">{code}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                navigator.clipboard?.writeText(code);
                toast("Código copiado");
              }}
              className="rounded-full"
            >
              <Copy className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </div>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Entrar com código
        </h2>
        <div className="flex items-center gap-2">
          <Input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Ex.: ABC12"
            maxLength={6}
            className="h-11 rounded-xl border-border bg-card text-base font-medium tracking-[0.15em] uppercase"
          />
          <Button
            onClick={join}
            className="h-11 shrink-0 rounded-xl bg-foreground px-5 text-background hover:bg-foreground/90"
          >
            Entrar
          </Button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Amigos ativos
        </h2>
        <div className="flex flex-col gap-2">
          <PlayerCard name="Ana Souza" subtitle="Online agora" score={1240} rank={1} />
          <PlayerCard name="João Lima" subtitle="Estudou hoje" score={980} rank={2} />
          <PlayerCard name="Maria Reis" subtitle="Sequência de 14 dias" score={860} rank={3} />
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Sincronização em tempo real em breve.
        </p>
      </section>
    </AppLayout>
  );
}
