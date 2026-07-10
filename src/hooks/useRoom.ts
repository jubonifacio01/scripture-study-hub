import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  createRoomChannel,
  type RoomBroadcast,
  type RoomConfig,
  type RoomParticipant,
  type SharedQuestion,
} from "@/lib/roomChannel";

const ME_KEY = "memorize-participant-id";

function getMyId(): string {
  if (typeof window === "undefined") return "anon";
  let id = window.sessionStorage.getItem(ME_KEY);
  if (!id) {
    id = "p_" + Math.random().toString(36).slice(2, 10);
    window.sessionStorage.setItem(ME_KEY, id);
  }
  return id;
}

export interface RoomMatchState {
  questions: SharedQuestion[];
  startAt: number;
  config: RoomConfig;
}

interface UseRoomArgs {
  code: string | null;
  name: string;
  isHost: boolean;
  enabled: boolean;
}

export function useRoom({ code, name, isHost, enabled }: UseRoomArgs) {
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [status, setStatus] = useState<"idle" | "joining" | "joined" | "error">("idle");
  const [config, setConfig] = useState<RoomConfig | null>(null);
  const [match, setMatch] = useState<RoomMatchState | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const meRef = useRef<RoomParticipant>({
    id: getMyId(),
    name,
    isHost,
    ready: true,
    done: false,
    score: 0,
    correct: 0,
    timeMs: 0,
  });

  // Keep name/host flag current
  useEffect(() => {
    meRef.current = { ...meRef.current, name, isHost };
  }, [name, isHost]);

  const trackSelf = useCallback(async () => {
    const ch = channelRef.current;
    if (!ch) return;
    await ch.track(meRef.current);
  }, []);

  const updateSelf = useCallback(
    async (patch: Partial<RoomParticipant>) => {
      meRef.current = { ...meRef.current, ...patch };
      await trackSelf();
    },
    [trackSelf],
  );

  useEffect(() => {
    if (!enabled || !code) return;
    setStatus("joining");
    const ch = createRoomChannel(code);
    if (!ch) {
      setStatus("error");
      return;
    }
    channelRef.current = ch;

    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState<RoomParticipant>();
      const list: RoomParticipant[] = [];
      Object.values(state).forEach((entries) => {
        entries.forEach((e) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const p = e as any as RoomParticipant;
          list.push(p);
        });
      });
      // Deduplicate by id (keep latest)
      const map = new Map<string, RoomParticipant>();
      list.forEach((p) => map.set(p.id, p));
      setParticipants([...map.values()]);
    });

    ch.on("broadcast", { event: "room" }, ({ payload }) => {
      const msg = payload as RoomBroadcast;
      if (msg.type === "config") setConfig(msg.payload);
      else if (msg.type === "start") {
        setMatch({
          questions: msg.payload.questions,
          startAt: msg.payload.startAt,
          config: msg.payload.config,
        });
        // reset own stats
        meRef.current = {
          ...meRef.current,
          done: false,
          score: 0,
          correct: 0,
          timeMs: 0,
        };
        void trackSelf();
      } else if (msg.type === "reset") {
        setMatch(null);
        meRef.current = {
          ...meRef.current,
          done: false,
          score: 0,
          correct: 0,
          timeMs: 0,
        };
        void trackSelf();
      }
    });

    ch.subscribe(async (state) => {
      if (state === "SUBSCRIBED") {
        await trackSelf();
        setStatus("joined");
      } else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT") {
        setStatus("error");
      }
    });

    return () => {
      void ch.unsubscribe();
      channelRef.current = null;
      setStatus("idle");
      setParticipants([]);
      setConfig(null);
      setMatch(null);
    };
  }, [code, enabled, trackSelf]);

  const broadcast = useCallback(async (msg: RoomBroadcast) => {
    const ch = channelRef.current;
    if (!ch) return;
    await ch.send({ type: "broadcast", event: "room", payload: msg });
  }, []);

  return {
    myId: meRef.current.id,
    participants,
    status,
    config,
    setConfig,
    match,
    broadcast,
    updateSelf,
  };
}
