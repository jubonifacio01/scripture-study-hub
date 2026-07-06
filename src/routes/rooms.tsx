import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayerCard } from "@/components/PlayerCard";
import { toast } from "sonner";
import { Users2, KeyRound, Copy, Sparkles } from "lucide-react";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Salas — Memorize+" },
      {
        name: "description",
        content: "Crie salas com amigos ou entre com um código para jogar juntos.",
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
    toast("Multiplayer em breve!", {
      description: `Você pediu para entrar na sala ${joinCode.toUpperCase()}.`,
    });
  };

  return (
    <AppLayout>
      <Header subtitle="Jogue com amigos" title="Salas" />

      <div className="card-elevated mt-5 overflow-hidden">
        <div className="gradient-primary p-5 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20">
              <Users2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                Modo multiplayer
              </p>
              <h2 className="font-display text-xl font-black">Crie uma sala</h2>
            </div>
          </div>
          <p className="mt-3 text-sm opacity-90">
            Convide amigos com um código e compitam em tempo real.
          </p>
          <Button
            onClick={create}
            size="lg"
            className="mt-4 w-full rounded-2xl bg-white text-primary hover:bg-white/90"
          >
            <Sparkles className="mr-1 h-4 w-4" />
            Gerar código
          </Button>
        </div>

        {code ? (
          <div className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Seu código
              </p>
              <p className="font-display text-3xl font-black tracking-widest">{code}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                navigator.clipboard?.writeText(code);
                toast("Código copiado!");
              }}
              className="rounded-2xl"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>

      <section className="mt-5">
        <h2 className="mb-3 font-display text-sm font-black uppercase tracking-widest text-muted-foreground">
          Entrar com código
        </h2>
        <div className="card-elevated flex items-center gap-2 p-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-muted text-primary">
            <KeyRound className="h-5 w-5" />
          </span>
          <Input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="ABC12"
            maxLength={6}
            className="h-11 rounded-xl border-none bg-transparent text-lg font-black tracking-widest uppercase focus-visible:ring-0"
          />
          <Button
            onClick={join}
            className="rounded-2xl gradient-primary text-primary-foreground"
          >
            Entrar
          </Button>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 font-display text-sm font-black uppercase tracking-widest text-muted-foreground">
          Amigos ativos
        </h2>
        <div className="flex flex-col gap-2">
          <PlayerCard name="Ana Souza" subtitle="Online agora" score={1240} rank={1} />
          <PlayerCard name="João Lima" subtitle="Estudou hoje" score={980} rank={2} />
          <PlayerCard name="Maria Reis" subtitle="Sequência de 14 dias" score={860} rank={3} />
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Sincronização em tempo real chega em breve ⚡
        </p>
      </section>
    </AppLayout>
  );
}
