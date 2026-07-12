import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type { Room, RoomPlayer, SharedQuestion, RoomConfig } from "@/types";

export type RoomBroadcast =
  | { type: "config"; payload: RoomConfig }
  | { type: "start"; payload: { questions: SharedQuestion[]; startAt: number; config: RoomConfig; matchId: string } }
  | { type: "reset"; payload: null }
  | { type: "answer"; payload: { playerId: string; questionIndex: number; correct: boolean; score: number; combo: number } };

export function createRoomChannel(roomCode: string): RealtimeChannel {
  return supabase.channel(`room:${roomCode}`, {
    config: {
      broadcast: { self: true, ack: false },
      presence: { key: "" },
    },
  });
}

export interface RealtimeCallbacks {
  onPlayersChange?: (players: RoomPlayer[]) => void;
  onRoomChange?: (room: Room) => void;
  onConfig?: (config: RoomConfig) => void;
  onStart?: (payload: { questions: SharedQuestion[]; startAt: number; config: RoomConfig; matchId: string }) => void;
  onReset?: () => void;
  onAnswer?: (payload: { playerId: string; questionIndex: number; correct: boolean; score: number; combo: number }) => void;
  onConnectionChange?: (status: "connecting" | "connected" | "error") => void;
}

export class RealtimeRoomService {
  private channel: RealtimeChannel | null = null;
  private callbacks: RealtimeCallbacks;
  private roomId: string;
  private roomCode: string;

  constructor(roomId: string, roomCode: string, callbacks: RealtimeCallbacks) {
    this.roomId = roomId;
    this.roomCode = roomCode;
    this.callbacks = callbacks;
  }

  connect(): void {
    if (this.channel) return;

    this.channel = createRoomChannel(this.roomCode);
    this.callbacks.onConnectionChange?.("connecting");

    this.channel.on("postgres_changes",
      { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${this.roomId}` },
      () => { void this.refreshPlayers(); },
    );

    this.channel.on("postgres_changes",
      { event: "*", schema: "public", table: "rooms", filter: `id=eq.${this.roomId}` },
      (payload) => {
        this.callbacks.onRoomChange?.(payload.new as Room);
      },
    );

    this.channel.on("broadcast", { event: "room" }, ({ payload }) => {
      const msg = payload as RoomBroadcast;
      if (msg.type === "config") this.callbacks.onConfig?.(msg.payload);
      else if (msg.type === "start") this.callbacks.onStart?.(msg.payload);
      else if (msg.type === "reset") this.callbacks.onReset?.();
      else if (msg.type === "answer") this.callbacks.onAnswer?.(msg.payload);
    });

    this.channel.subscribe((state) => {
      if (state === "SUBSCRIBED") {
        this.callbacks.onConnectionChange?.("connected");
        void this.refreshPlayers();
      } else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT") {
        this.callbacks.onConnectionChange?.("error");
      }
    });
  }

  private async refreshPlayers(): Promise<void> {
    const { data } = await supabase
      .from("room_players")
      .select("*")
      .eq("room_id", this.roomId)
      .order("joined_at", { ascending: true });
    this.callbacks.onPlayersChange?.((data ?? []) as RoomPlayer[]);
  }

  broadcast(msg: RoomBroadcast): void {
    this.channel?.send({ type: "broadcast", event: "room", payload: msg });
  }

  disconnect(): void {
    if (this.channel) {
      void this.channel.unsubscribe();
      this.channel = null;
    }
  }
}
