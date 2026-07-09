import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayerCard } from "@/components/PlayerCard";
import { EmptyState } from "@/components/EmptyState";
import { MultiplayerGame } from "@/components/multiplayer/MultiplayerGame";
import { useRoom } from "@/hooks/useRoom";
import { generateRoomCode, type SharedQuestion, type RoomConfig } from "@/lib/roomChannel";
import { loadObjectives, getObjectiveItems, loadCustomItems } from "@/data/objectives";
import { memoryItems as seedItems } from "@/data/memoryItems";
import { getUserName } from "@/hooks/useAppMode";
import { toast } from "sonner";
import type { Objective, MemoryItem } from "@/types";
import { Users, Copy, Share2, Trophy, LogOut, QrCode, Sparkles, Crown, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Salas — Memorize+" },
      { name: "description", content: "Jogue em tempo real com amigos usando um código de sala." },
    ],
  }),
  component: RoomsPage,
  validateSearch: (s: Record<string, unknown>) => ({
    code: typeof s.code === "string" ? (s.code as string).toUpperCase() : undefined,
  }),
});

type View = "lobby" | "room" | "playing" | "results";

const DIFFICULTY_SECONDS: Record<RoomConfig["difficulty"], number> = {
  facil: 18,
  medio: 12,
  dificil: 7,
};

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(items: MemoryItem[], bank: MemoryItem[], count: number): SharedQuestion[] {
  const chosen = shuffleArr(items).slice(0, count);
  return chosen.map((it, idx) => {
    const distractors = shuffleArr(bank.filter((b) => b.id !== it.id)).slice(0, 3);
    const options = shuffleArr([it, ...distractors]).map((o, i) => ({
      id: `${idx}-${i}`,
      label: `${o.book} ${o.chapter}:${o.verse}`,
      _origId: o.id,
    }));
    const correctOptionId = options.find((o) => o._origId === it.id)!.id;
    return {
      itemId: it.id,
      text: it.text,
      correctOptionId,
      options: options.map(({ id, label }) => ({ id, label })),
    };
  });
}

function RoomsPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [view, setView] = useState<View>("lobby");
  const [name, setName] = useState<string>("");
  const [nameDraft, setNameDraft] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [isHost, setIsHost] = useState(false);

  // Load stored name
  useEffect(() => {
    const stored = getUserName();
    if (stored) setName(stored);
  }, []);

  // Auto-join if ?code= is present and name is set
  useEffect(() => {
    if (search.code && name && view === "lobby") {
      setCode(search.code);
      setIsHost(false);
      setView("room");
    }
  }, [search.code, name, view]);

  const room = useRoom({ code, name, isHost, enabled: view !== "lobby" });

  const leave = () => {
    setView("lobby");
    setCode(null);
    setIsHost(false);
    navigate({ to: "/rooms", search: {} });
  };

  const createRoom = () => {
    if (!name) return;
    const c = generateRoomCode();
    setCode(c);
    setIsHost(true);
    setView("room");
  };

  const joinRoom = () => {
    if (!name) return;
    const clean = joinCode.trim().toUpperCase();
    if (clean.length < 4) {
      toast.error("Código inválido");
      return;
    }
    setCode(clean);
    setIsHost(false);
    setView("room");
  };

  const saveName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed.length < 2) {
      toast.error("Digite seu nome");
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("memorize-user-name", trimmed);
    }
    setName(trimmed);
  };

  // Auto-transition to "playing" when host broadcasts a start
  useEffect(() => {
    if (room.match && view === "room") setView("playing");
  }, [room.match, view]);

  // Ask for name inline if missing
  if (!name) {
    return (
      <AppLayout>
        <Header subtitle="Estudo em grupo" title="Salas" />
        <section className="mt-8 card-elevated p-6">
          <h2 className="text-base font-semibold tracking-tight">Como podemos te chamar?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu nome aparecerá para os outros participantes.
          </p>
          <div className="mt-5 flex gap-2">
            <Input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Seu nome"
              className="h-11 rounded-xl"
              maxLength={24}
            />
            <Button onClick={saveName} className="h-11 rounded-xl">
              Salvar
            </Button>
          </div>
        </section>
      </AppLayout>
    );
  }

  if (view === "lobby") return <LobbyView onCreate={createRoom} joinCode={joinCode} setJoinCode={setJoinCode} onJoin={joinRoom} />;
  if (view === "room" && code) return <RoomView code={code} isHost={isHost} room={room} onLeave={leave} onGameStart={() => setView("playing")} />;
  if (view === "playing" && code && room.match) {
    return (
      <PlayingView
        room={room}
        onFinished={() => setView("results")}
      />
    );
  }
  if (view === "results" && code) {
    return (
      <ResultsView
        room={room}
        isHost={isHost}
        onPlayAgain={() => setView("room")}
        onLeave={leave}
      />
    );
  }
  return null;
}

/* ============ LOBBY ============ */

function LobbyView({
  onCreate,
  joinCode,
  setJoinCode,
  onJoin,
}: {
  onCreate: () => void;
  joinCode: string;
  setJoinCode: (v: string) => void;
  onJoin: () => void;
}) {
  return (
    <AppLayout>
      <Header subtitle="Estudo em grupo" title="Salas" />

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-8 card-elevated p-5"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
            <Users className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Nova partida
            </p>
            <h2 className="text-base font-semibold tracking-tight">Criar uma sala</h2>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Gere um código, compartilhe com amigos e comece quando todos entrarem.
        </p>
        <Button onClick={onCreate} size="lg" className="mt-5 h-11 w-full rounded-xl">
          Criar sala
        </Button>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mt-6 card-elevated p-5"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Já tem um código?
        </p>
        <h2 className="mt-1 text-base font-semibold tracking-tight">Entrar em uma sala</h2>
        <div className="mt-4 flex items-center gap-2">
          <Input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Ex.: ABC123"
            maxLength={6}
            className="h-11 rounded-xl text-base font-semibold tracking-[0.2em] uppercase"
          />
          <Button
            onClick={onJoin}
            className="h-11 shrink-0 rounded-xl bg-foreground px-5 text-background hover:bg-foreground/90"
          >
            Entrar
          </Button>
        </div>
      </motion.section>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Multiplayer em tempo real • sem necessidade de conta
      </p>
    </AppLayout>
  );
}

/* ============ ROOM (waiting) ============ */

function RoomView({
  code,
  isHost,
  room,
  onLeave,
  onGameStart,
}: {
  code: string;
  isHost: boolean;
  room: ReturnType<typeof useRoom>;
  onLeave: () => void;
  onGameStart: () => void;
}) {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [customItems, setCustomItems] = useState<MemoryItem[]>([]);
  const [showQR, setShowQR] = useState(false);

  const [objectiveId, setObjectiveId] = useState<string>("");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<RoomConfig["difficulty"]>("medio");

  useEffect(() => {
    const objs = loadObjectives();
    setObjectives(objs);
    setCustomItems(loadCustomItems());
    if (objs[0] && !objectiveId) setObjectiveId(objs[0].id);
  }, []);

  // If host, publish config on any change so guests see it
  useEffect(() => {
    if (!isHost || !objectiveId) return;
    const o = objectives.find((x) => x.id === objectiveId);
    if (!o) return;
    void room.broadcast({
      type: "config",
      payload: {
        objectiveId,
        objectiveName: o.name,
        questionCount,
        difficulty,
      },
    });
  }, [isHost, objectiveId, questionCount, difficulty, objectives, room]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/rooms?code=${code}`;
  }, [code]);

  const copyCode = () => {
    navigator.clipboard?.writeText(code);
    toast("Código copiado");
  };

  const shareLink = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Memorize+ — Sala",
          text: `Entre na minha sala com o código ${code}`,
          url: shareUrl,
        });
        return;
      } catch {
        // fallthrough
      }
    }
    navigator.clipboard?.writeText(shareUrl);
    toast("Link copiado");
  };

  const start = () => {
    const o = objectives.find((x) => x.id === objectiveId);
    if (!o) {
      toast.error("Escolha um objetivo");
      return;
    }
    const items = getObjectiveItems(o, customItems);
    if (items.length === 0) {
      toast.error("Este objetivo não tem versículos");
      return;
    }
    const bank = [...items, ...seedItems];
    const questions = buildQuestions(items, bank, Math.min(questionCount, items.length));
    const startAt = Date.now() + 3500; // 3s countdown for everyone
    void room.broadcast({
      type: "start",
      payload: {
        questions,
        startAt,
        config: { objectiveId: o.id, objectiveName: o.name, questionCount: questions.length, difficulty },
      },
    });
    onGameStart();
  };

  const cfg = room.config;
  const remoteObjectiveName = !isHost && cfg ? cfg.objectiveName : undefined;
  const displayCount = !isHost && cfg ? cfg.questionCount : questionCount;
  const displayDifficulty = !isHost && cfg ? cfg.difficulty : difficulty;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(shareUrl)}&size=220x220&margin=8`;

  return (
    <AppLayout>
      <div className="mt-2 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onLeave} className="h-9 gap-1.5 rounded-full px-3 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Sair
        </Button>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-3 card-elevated p-6 text-center"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Código da sala
        </p>
        <p className="mt-2 text-4xl font-semibold tabular-nums tracking-[0.28em]">{code}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={copyCode} className="h-9 gap-1.5 rounded-full">
            <Copy className="h-3.5 w-3.5" /> Copiar
          </Button>
          <Button variant="outline" size="sm" onClick={shareLink} className="h-9 gap-1.5 rounded-full">
            <Share2 className="h-3.5 w-3.5" /> Compartilhar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowQR((v) => !v)} className="h-9 gap-1.5 rounded-full">
            <QrCode className="h-3.5 w-3.5" /> QR
          </Button>
        </div>
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 flex justify-center overflow-hidden"
            >
              <div className="rounded-2xl border border-border bg-card p-3">
                <img src={qrUrl} alt="QR code da sala" width={220} height={220} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="mt-4 text-xs text-muted-foreground">
          Status:{" "}
          <span className={room.status === "joined" ? "text-primary" : ""}>
            {room.status === "joined" ? "Conectado" : "Conectando…"}
          </span>{" "}
          • {room.participants.length} participante{room.participants.length === 1 ? "" : "s"}
        </p>
      </motion.section>

      <section className="mt-6">
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Participantes
        </h2>
        <div className="flex flex-col gap-2">
          {room.participants.length === 0 ? (
            <EmptyState title="Aguardando conexão" description="Compartilhe o código para começar." />
          ) : (
            room.participants.map((p, i) => (
              <div key={p.id} className="card-elevated flex items-center gap-3 p-3">
                <span className="w-6 shrink-0 text-center text-xs font-medium tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-[14px] font-medium tracking-tight">
                    {p.name || "Convidado"}
                    {p.isHost && <Crown className="h-3.5 w-3.5 text-primary" strokeWidth={2} />}
                    {p.id === room.myId && (
                      <span className="text-[10px] font-normal text-muted-foreground">(você)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.isHost ? "Anfitrião" : "Pronto"}
                  </p>
                </div>
                <span className="h-2 w-2 rounded-full bg-success" />
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-6 card-elevated p-5">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Configuração da partida
        </h2>

        {isHost ? (
          <>
            <label className="mt-4 block text-xs font-medium text-muted-foreground">Objetivo</label>
            <select
              value={objectiveId}
              onChange={(e) => setObjectiveId(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
            >
              {objectives.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-xs font-medium text-muted-foreground">
              Perguntas: <span className="tabular-nums text-foreground">{questionCount}</span>
            </label>
            <input
              type="range"
              min={3}
              max={10}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="mt-2 w-full accent-primary"
            />

            <label className="mt-4 block text-xs font-medium text-muted-foreground">Dificuldade</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["facil", "medio", "dificil"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={
                    "press h-10 rounded-xl border text-sm font-medium capitalize transition-colors " +
                    (difficulty === d
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:text-foreground")
                  }
                >
                  {d === "facil" ? "Fácil" : d === "medio" ? "Médio" : "Difícil"}
                </button>
              ))}
            </div>

            <Button
              onClick={start}
              size="lg"
              className="mt-6 h-12 w-full rounded-xl"
              disabled={room.participants.length < 1 || !objectiveId}
            >
              <Sparkles className="mr-2 h-4 w-4" /> Iniciar partida
            </Button>
          </>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Objetivo" value={remoteObjectiveName ?? "aguardando…"} />
            <Row label="Perguntas" value={String(displayCount)} />
            <Row
              label="Dificuldade"
              value={displayDifficulty === "facil" ? "Fácil" : displayDifficulty === "medio" ? "Médio" : "Difícil"}
            />
            <p className="pt-2 text-center text-xs text-muted-foreground">
              Aguardando o anfitrião iniciar a partida…
            </p>
          </div>
        )}
      </section>

      <div className="mt-6">
        <Button variant="ghost" onClick={onLeave} className="w-full text-muted-foreground">
          <LogOut className="mr-2 h-4 w-4" /> Sair da sala
        </Button>
      </div>
    </AppLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2 last:border-none">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

/* ============ PLAYING ============ */

function PlayingView({
  room,
  onFinished,
}: {
  room: ReturnType<typeof useRoom>;
  onFinished: () => void;
}) {
  const match = room.match!;
  const spq = DIFFICULTY_SECONDS[match.config.difficulty];
  const [myDone, setMyDone] = useState(false);

  const handleFinish = async (r: { correct: number; score: number; timeMs: number }) => {
    setMyDone(true);
    await room.updateSelf({ done: true, correct: r.correct, score: r.score, timeMs: r.timeMs });
  };

  // When everyone is done, transition to results
  useEffect(() => {
    if (!myDone) return;
    const all = room.participants.length > 0 && room.participants.every((p) => p.done);
    if (all) onFinished();
  }, [room.participants, myDone, onFinished]);

  return (
    <AppLayout>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Partida ao vivo • {room.participants.length} jogadores
        </p>
      </div>

      <div className="mt-4">
        {myDone ? (
          <div className="card-elevated p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Trophy className="h-5 w-5" strokeWidth={2} />
            </div>
            <h2 className="mt-4 text-lg font-semibold tracking-tight">Você terminou!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Aguardando os outros jogadores concluírem…
            </p>
            <div className="mt-6 space-y-2 text-left">
              {[...room.participants]
                .sort((a, b) => b.score - a.score)
                .map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2">
                    <span className="text-sm font-medium truncate">
                      {p.name}
                      {p.id === room.myId ? " (você)" : ""}
                    </span>
                    <span className={"text-xs tabular-nums " + (p.done ? "text-success" : "text-muted-foreground")}>
                      {p.done ? `${p.score} pts` : "jogando…"}
                    </span>
                  </div>
                ))}
            </div>
            <Button onClick={onFinished} variant="outline" className="mt-6 h-11 w-full rounded-xl">
              Ver ranking agora
            </Button>
          </div>
        ) : (
          <MultiplayerGame
            questions={match.questions}
            startAt={match.startAt}
            secondsPerQuestion={spq}
            onFinish={handleFinish}
          />
        )}
      </div>
    </AppLayout>
  );
}

/* ============ RESULTS ============ */

function ResultsView({
  room,
  isHost,
  onPlayAgain,
  onLeave,
}: {
  room: ReturnType<typeof useRoom>;
  isHost: boolean;
  onPlayAgain: () => void;
  onLeave: () => void;
}) {
  const ranking = useMemo(
    () =>
      [...room.participants].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeMs - b.timeMs;
      }),
    [room.participants],
  );

  const handleAgain = async () => {
    if (isHost) await room.broadcast({ type: "reset", payload: null });
    await room.updateSelf({ done: false, score: 0, correct: 0, timeMs: 0 });
    onPlayAgain();
  };

  return (
    <AppLayout>
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-6 card-elevated p-6 text-center"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          <Trophy className="h-6 w-6" strokeWidth={2} />
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-tight">Ranking da partida</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confira o desempenho de todos os participantes.
        </p>
      </motion.section>

      <div className="mt-6 flex flex-col gap-2">
        {ranking.map((p, i) => {
          const medal = i === 0 ? "bg-primary/10 text-primary" : i === 1 ? "bg-muted text-foreground" : i === 2 ? "bg-accent/20 text-foreground" : "";
          const isTop3 = i < 3;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={
                "card-elevated flex items-center gap-3 p-3 " +
                (isTop3 ? "ring-1 ring-border" : "")
              }
            >
              <div className={"grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold tabular-nums " + (isTop3 ? medal : "bg-muted text-muted-foreground")}>
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium tracking-tight">
                  {p.name}
                  {p.id === room.myId && (
                    <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">(você)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {p.correct} acertos • {(p.timeMs / 1000).toFixed(1)}s
                </p>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold tabular-nums">{p.score}</p>
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  pontos
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-2">
        {isHost && (
          <Button size="lg" onClick={handleAgain} className="h-12 rounded-xl">
            Jogar novamente
          </Button>
        )}
        {!isHost && (
          <Button size="lg" variant="outline" onClick={handleAgain} className="h-12 rounded-xl">
            Voltar à sala
          </Button>
        )}
        <Button variant="ghost" onClick={onLeave} className="h-11 rounded-xl text-muted-foreground">
          Sair da sala
        </Button>
      </div>
    </AppLayout>
  );
}
