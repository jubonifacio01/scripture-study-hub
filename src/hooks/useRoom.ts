import { useCallback, useEffect, useRef, useState } from "react";
import { RealtimeRoomService, type RoomBroadcast } from "@/services/RealtimeRoomService";
import {
  createRoom,
  joinRoom,
  leaveRoom,
  updateRoomConfig,
  updateRoomStatus,
  updatePlayerReady,
  updatePlayerScore,
  resetPlayerStats,
  getRoomByCode,
  getRoomPlayers,
  type ServiceResult,
} from "@/services/RoomService";
import { createMatch, finishMatch, buildQuestions, saveMatchProgress } from "@/services/MatchService";
import { saveAnswer } from "@/services/AnswerService";
import { calculateScore, calculateXP, buildRanking } from "@/services/RankingService";
import type { RankingEntry } from "@/types";
import { getGuestId } from "@/lib/guestId";
import { getUserName } from "@/hooks/useAppMode";
import { getSelectedCharacter } from "@/data/characters";
import { fetchObjectives } from "@/services/ObjectiveService";
import { memoryItems as seedItems } from "@/data/memoryItems";
import type { Room, RoomPlayer, SharedQuestion, RoomConfig, MultiplayerDifficulty, Match } from "@/types";

export type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

export interface MatchState {
  questions: SharedQuestion[];
  startAt: number;
  config: RoomConfig;
  matchId: string;
}

interface UseRoomArgs {
  code: string | null;
  isHost: boolean;
  enabled: boolean;
}

export function useRoom({ code, isHost, enabled }: UseRoomArgs) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [config, setConfig] = useState<RoomConfig | null>(null);
  const [match, setMatch] = useState<MatchState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [matchRecord, setMatchRecord] = useState<Match | null>(null);

  const realtimeRef = useRef<RealtimeRoomService | null>(null);
  const roomRef = useRef<Room | null>(null);
  const myPlayerRef = useRef<RoomPlayer | null>(null);
  const isHostRef = useRef(isHost);
  const comboRef = useRef(0);

  useEffect(() => { isHostRef.current = isHost; }, [isHost]);

  const displayName = getUserName() ?? "Visitante";
  const character = getSelectedCharacter();

  const updateMyPlayerRef = useCallback((list: RoomPlayer[]) => {
    const me = list.find((p) => p.player_id === getGuestId());
    if (me) {
      myPlayerRef.current = me;
      setMyPlayerId(me.id);
      if (roomRef.current && me.is_host) {
        isHostRef.current = true;
      }
    }
  }, []);

  // ─── Create or join room ──────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !code) return;

    let cancelled = false;
    setStatus("connecting");

    (async () => {
      if (isHost) {
        const result = await createRoom(displayName, character, null);
        if (cancelled) return;
        if (result.error || !result.data) {
          setStatus("error");
          return;
        }
        roomRef.current = result.data.room;
        setRoom(result.data.room);
        myPlayerRef.current = result.data.player;
        setMyPlayerId(result.data.player.id);
        setPlayers([result.data.player]);
      } else {
        const result = await joinRoom(code, displayName, character, null);
        if (cancelled) return;
        if (result.error || !result.data) {
          setStatus("error");
          return;
        }
        roomRef.current = result.data.room;
        setRoom(result.data.room);
        myPlayerRef.current = result.data.player;
        setMyPlayerId(result.data.player.id);

        const playersResult = await getRoomPlayers(result.data.room.id);
        if (!cancelled && playersResult.data) {
          setPlayers(playersResult.data);
          updateMyPlayerRef(playersResult.data);
        }
      }

      if (cancelled || !roomRef.current) return;

      const roomId = roomRef.current.id;
      const roomCode = roomRef.current.code;

      const realtime = new RealtimeRoomService(roomId, roomCode, {
        onPlayersChange: (newPlayers) => {
          setPlayers(newPlayers);
          updateMyPlayerRef(newPlayers);
        },
        onRoomChange: (updatedRoom) => {
          roomRef.current = updatedRoom;
          setRoom(updatedRoom);
        },
        onConfig: (cfg) => setConfig(cfg),
        onStart: (payload) => {
          setMatch({
            questions: payload.questions,
            startAt: payload.startAt,
            config: payload.config,
            matchId: payload.matchId,
          });
          comboRef.current = 0;
        },
        onReset: () => {
          setMatch(null);
          setMatchRecord(null);
          comboRef.current = 0;
        },
        onAnswer: () => {},
        onConnectionChange: (s) => {
          setStatus(s === "connected" ? "connected" : s === "error" ? "error" : "connecting");
        },
      });

      realtime.connect();
      realtimeRef.current = realtime;
    })();

    return () => {
      cancelled = true;
      realtimeRef.current?.disconnect();
      realtimeRef.current = null;
      setStatus("idle");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, enabled]);

  // ─── Public actions ───────────────────────────────────────────────────────

  const broadcast = useCallback((msg: RoomBroadcast) => {
    realtimeRef.current?.broadcast(msg);
  }, []);

  const publishConfig = useCallback(async (cfg: RoomConfig) => {
    if (!roomRef.current) return;
    await updateRoomConfig(roomRef.current.id, {
      selected_objective: cfg.objectiveId,
      difficulty: cfg.difficulty,
      question_count: cfg.questionCount,
    });
    broadcast({ type: "config", payload: cfg });
  }, [broadcast]);

  const toggleReady = useCallback(async (ready: boolean) => {
    if (!myPlayerRef.current) return;
    await updatePlayerReady(myPlayerRef.current.id, ready);
  }, []);

  const startMatch = useCallback(async (cfg: RoomConfig) => {
    if (!roomRef.current) return;

    // Always fetch objectives + items fresh from the DB — no localStorage.
    const { data } = await fetchObjectives();
    const row = (data ?? []).find((r) => r.objective.id === cfg.objectiveId);
    if (!row) return;

    const items = row.items;
    if (items.length === 0) return;

    const bank = [...items, ...seedItems];
    const questions = buildQuestions(items, bank, Math.min(cfg.questionCount, items.length), cfg.difficulty);
    const startAt = Date.now() + 3500;

    const matchResult = await createMatch(roomRef.current.id);
    if (!matchResult.data) return;
    setMatchRecord(matchResult.data);

    await updateRoomStatus(roomRef.current.id, "playing");

    broadcast({
      type: "start",
      payload: { questions, startAt, config: { ...cfg, questionCount: questions.length }, matchId: matchResult.data.id },
    });
  }, [broadcast]);

  const submitAnswer = useCallback(async (
    questionIndex: number,
    questionId: string,
    answer: string,
    correct: boolean,
    elapsedMs: number,
    secondsPerQuestion: number,
  ) => {
    if (!match) return;

    const isCorrect = correct;
    if (isCorrect) comboRef.current += 1;
    else comboRef.current = 0;

    const score = calculateScore(isCorrect, elapsedMs, secondsPerQuestion, comboRef.current);

    if (myPlayerRef.current) {
      const me = myPlayerRef.current;
      const newScore = me.score + score;
      const newCorrect = me.correct + (isCorrect ? 1 : 0);
      const newTimeMs = me.time_ms + elapsedMs;
      const newCombo = Math.max(me.combo, comboRef.current);

      await updatePlayerScore(me.id, newScore, newCorrect, newTimeMs, newCombo, false);

      broadcast({
        type: "answer",
        payload: {
          playerId: me.id,
          questionIndex,
          correct: isCorrect,
          score: newScore,
          combo: comboRef.current,
        },
      });
    }

    await saveAnswer(match.matchId, questionId, answer, isCorrect, elapsedMs);
  }, [match, broadcast]);

  const finishPlaying = useCallback(async (totalCorrect: number, totalQuestions: number, totalTimeMs: number) => {
    if (!myPlayerRef.current || !match) return;

    const me = myPlayerRef.current;
    const xpEarned = calculateXP(totalCorrect, totalQuestions, me.score);

    await updatePlayerScore(me.id, me.score, totalCorrect, totalTimeMs, Math.max(me.combo, comboRef.current), true);

    await saveMatchProgress(match.config.objectiveId, totalCorrect, totalQuestions, xpEarned, totalTimeMs);
  }, [match]);

  const playAgain = useCallback(async () => {
    if (!roomRef.current) return;
    await resetPlayerStats(roomRef.current.id);
    await updateRoomStatus(roomRef.current.id, "waiting");
    broadcast({ type: "reset", payload: null });
    setMatch(null);
    setMatchRecord(null);
    comboRef.current = 0;
  }, [broadcast]);

  const leave = useCallback(async () => {
    if (myPlayerRef.current && roomRef.current) {
      const wasHost = myPlayerRef.current.is_host;
      await leaveRoom(roomRef.current.id, myPlayerRef.current.id, wasHost);
    }
    realtimeRef.current?.disconnect();
    realtimeRef.current = null;
    setStatus("idle");
    setRoom(null);
    setPlayers([]);
    setConfig(null);
    setMatch(null);
    setMatchRecord(null);
    roomRef.current = null;
    myPlayerRef.current = null;
  }, []);

  // ─── Reconnection: restore room state on refresh ──────────────────────────
  useEffect(() => {
    if (!enabled || !code || isHost) return;
    if (roomRef.current) return;

    let cancelled = false;

    (async () => {
      const result = await getRoomByCode(code);
      if (cancelled || result.error || !result.data) return;

      const roomData = result.data;
      if (roomData.status === "finished") return;

      const playersResult = await getRoomPlayers(roomData.id);
      if (cancelled || !playersResult.data) return;

      const me = playersResult.data.find((p) => p.player_id === getGuestId());
      if (!me) return;

      roomRef.current = roomData;
      setRoom(roomData);
      myPlayerRef.current = me;
      setMyPlayerId(me.id);
      setPlayers(playersResult.data);
      updateMyPlayerRef(playersResult.data);

      if (roomData.selected_objective && roomData.difficulty && roomData.question_count) {
        setConfig({
          objectiveId: roomData.selected_objective,
          objectiveName: "",
          questionCount: roomData.question_count,
          difficulty: roomData.difficulty as MultiplayerDifficulty,
        });
      }

      if (roomData.status === "playing") {
        const { data: matchData } = await (await import("@/lib/supabaseClient")).supabase
          .from("matches")
          .select("*")
          .eq("room_id", roomData.id)
          .is("finished_at", null)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (matchData) {
          setMatchRecord(matchData as Match);
        }
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, enabled, isHost]);

  // ─── Auto-finish: when every player is done, host marks room finished ─────
  useEffect(() => {
    if (!isHostRef.current) return;
    if (!roomRef.current || roomRef.current.status !== "playing") return;
    if (players.length === 0) return;
    if (!players.every((p) => p.done)) return;
    void (async () => {
      if (!roomRef.current) return;
      await updateRoomStatus(roomRef.current.id, "finished");
      if (matchRecord) await finishMatch(matchRecord.id);
    })();
  }, [players, matchRecord]);


  const ranking: RankingEntry[] = buildRanking(players);

  return {
    room,
    players,
    status,
    config,
    setConfig,
    match,
    matchRecord,
    myPlayerId,
    myPlayer: myPlayerRef.current,
    isHost: isHostRef.current,
    ranking,
    broadcast,
    publishConfig,
    toggleReady,
    startMatch,
    submitAnswer,
    finishPlaying,
    playAgain,
    leave,
  };
}
