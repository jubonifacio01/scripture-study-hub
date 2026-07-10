import { supabase } from "@/lib/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface RoomParticipant {
  id: string;
  name: string;
  isHost: boolean;
  ready: boolean;
  done: boolean;
  score: number;
  correct: number;
  timeMs: number;
}

export interface SharedQuestion {
  itemId: string;
  text: string;
  correctOptionId: string;
  options: { id: string; label: string }[];
}

export interface RoomConfig {
  objectiveId: string;
  objectiveName: string;
  questionCount: number;
  difficulty: "facil" | "medio" | "dificil";
}

export type RoomBroadcast =
  | { type: "config"; payload: RoomConfig }
  | { type: "start"; payload: { questions: SharedQuestion[]; startAt: number; config: RoomConfig } }
  | { type: "reset"; payload: null };

const ADJECTIVES = ["ABC", "LUZ", "SOL", "PAZ", "FE", "AMOR", "JOY"];
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
void ADJECTIVES;

export function createRoomChannel(code: string): RealtimeChannel | null {
  if (!supabase) return null;
  return supabase.channel(`room:${code}`, {
    config: {
      broadcast: { self: true, ack: false },
      presence: { key: "" },
    },
  });
}
