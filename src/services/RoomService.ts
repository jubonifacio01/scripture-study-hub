import { supabase } from "@/lib/supabaseClient";
import { getGuestId } from "@/lib/guestId";
import type { Room, RoomPlayer, RoomStatus, MultiplayerDifficulty } from "@/types";

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_PLAYERS = 8;

function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

async function isCodeUnique(code: string): Promise<boolean> {
  const { data } = await supabase.from("rooms").select("id").eq("code", code).maybeSingle();
  return !data;
}

export async function createUniqueRoomCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateRoomCode();
    if (await isCodeUnique(code)) return code;
  }
  return generateRoomCode();
}

export async function createRoom(
  displayName: string,
  character: string | null,
  avatar: string | null,
): Promise<ServiceResult<{ room: Room; player: RoomPlayer }>> {
  const userId = getGuestId();
  const code = await createUniqueRoomCode();

  const { data: roomData, error: roomErr } = await supabase
    .from("rooms")
    .insert({
      code,
      host_id: userId,
      status: "waiting" as RoomStatus,
    })
    .select("*")
    .single();

  if (roomErr || !roomData) {
    return { data: null, error: roomErr?.message ?? "Erro ao criar sala." };
  }

  const room = roomData as Room;

  const { data: playerData, error: playerErr } = await supabase
    .from("room_players")
    .insert({
      room_id: room.id,
      player_id: userId,
      display_name: displayName,
      is_host: true,
      connected: true,
      ready: true,
      score: 0,
      correct: 0,
      time_ms: 0,
      combo: 0,
      done: false,
      character,
      avatar,
    })
    .select("*")
    .single();

  if (playerErr || !playerData) {
    await supabase.from("rooms").delete().eq("id", room.id);
    return { data: null, error: playerErr?.message ?? "Erro ao criar jogador." };
  }

  return { data: { room, player: playerData as RoomPlayer }, error: null };
}

export async function joinRoom(
  code: string,
  displayName: string,
  character: string | null,
  avatar: string | null,
): Promise<ServiceResult<{ room: Room; player: RoomPlayer }>> {
  const userId = getGuestId();
  const cleanCode = code.trim().toUpperCase();

  const { data: roomData, error: roomErr } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", cleanCode)
    .maybeSingle();

  if (roomErr) return { data: null, error: roomErr.message };
  if (!roomData) return { data: null, error: "Sala não encontrada." };

  const room = roomData as Room;

  if (room.status === "finished") {
    return { data: null, error: "Esta sala já foi encerrada." };
  }

  const { data: existingPlayers } = await supabase
    .from("room_players")
    .select("*")
    .eq("room_id", room.id);

  const players = (existingPlayers ?? []) as RoomPlayer[];

  if (players.length >= MAX_PLAYERS) {
    return { data: null, error: "Sala cheia." };
  }

  const existing = players.find((p) => p.player_id === userId);
  if (existing) {
    const { data: updated, error: updErr } = await supabase
      .from("room_players")
      .update({ connected: true, display_name: displayName, character, avatar })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (updErr) return { data: null, error: updErr.message };
    return { data: { room, player: updated as RoomPlayer }, error: null };
  }

  const { data: playerData, error: playerErr } = await supabase
    .from("room_players")
    .insert({
      room_id: room.id,
      player_id: userId,
      display_name: displayName,
      is_host: false,
      connected: true,
      ready: false,
      score: 0,
      correct: 0,
      time_ms: 0,
      combo: 0,
      done: false,
      character,
      avatar,
    })
    .select("*")
    .single();

  if (playerErr) return { data: null, error: playerErr.message };

  return { data: { room, player: playerData as RoomPlayer }, error: null };
}

export async function getRoomByCode(code: string): Promise<ServiceResult<Room>> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: "Sala não encontrada." };
  return { data: data as Room, error: null };
}

export async function getRoomPlayers(roomId: string): Promise<ServiceResult<RoomPlayer[]>> {
  const { data, error } = await supabase
    .from("room_players")
    .select("*")
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as RoomPlayer[], error: null };
}

export async function updateRoomConfig(
  roomId: string,
  config: {
    selected_objective?: string | null;
    difficulty?: MultiplayerDifficulty | null;
    question_count?: number | null;
  },
): Promise<ServiceResult<Room>> {
  const { data, error } = await supabase
    .from("rooms")
    .update(config)
    .eq("id", roomId)
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Room, error: null };
}

export async function updateRoomStatus(
  roomId: string,
  status: RoomStatus,
): Promise<ServiceResult<void>> {
  const { error } = await supabase.from("rooms").update({ status }).eq("id", roomId);
  if (error) return { data: null, error: error.message };
  return { data: undefined, error: null };
}

export async function updatePlayerReady(
  playerId: string,
  ready: boolean,
): Promise<ServiceResult<void>> {
  const { error } = await supabase.from("room_players").update({ ready }).eq("id", playerId);
  if (error) return { data: null, error: error.message };
  return { data: undefined, error: null };
}

export async function updatePlayerConnected(
  playerId: string,
  connected: boolean,
): Promise<ServiceResult<void>> {
  const { error } = await supabase.from("room_players").update({ connected }).eq("id", playerId);
  if (error) return { data: null, error: error.message };
  return { data: undefined, error: null };
}

export async function removePlayer(playerId: string): Promise<ServiceResult<void>> {
  const { error } = await supabase.from("room_players").delete().eq("id", playerId);
  if (error) return { data: null, error: error.message };
  return { data: undefined, error: null };
}

export async function transferHost(roomId: string): Promise<ServiceResult<void>> {
  const { data: players } = await supabase
    .from("room_players")
    .select("*")
    .eq("room_id", roomId)
    .eq("connected", true)
    .order("joined_at", { ascending: true });

  const connected = (players ?? []) as RoomPlayer[];
  if (connected.length === 0) return { data: undefined, error: null };

  const newHost = connected[0];
  await supabase.from("room_players").update({ is_host: false }).eq("room_id", roomId);

  await supabase.from("room_players").update({ is_host: true }).eq("id", newHost.id);

  await supabase.from("rooms").update({ host_id: newHost.player_id }).eq("id", roomId);

  return { data: undefined, error: null };
}

export async function leaveRoom(
  roomId: string,
  playerId: string,
  wasHost: boolean,
): Promise<ServiceResult<void>> {
  await removePlayer(playerId);

  if (wasHost) {
    await transferHost(roomId);
  }

  const { data: remaining } = await supabase
    .from("room_players")
    .select("id")
    .eq("room_id", roomId);

  if (!remaining || remaining.length === 0) {
    await supabase.from("rooms").update({ status: "finished" }).eq("id", roomId);
  }

  return { data: undefined, error: null };
}

export async function resetPlayerStats(roomId: string): Promise<ServiceResult<void>> {
  const { error } = await supabase
    .from("room_players")
    .update({ score: 0, correct: 0, time_ms: 0, combo: 0, done: false, ready: false })
    .eq("room_id", roomId);
  if (error) return { data: null, error: error.message };
  return { data: undefined, error: null };
}

export async function updatePlayerScore(
  playerId: string,
  score: number,
  correct: number,
  timeMs: number,
  combo: number,
  done: boolean,
): Promise<ServiceResult<void>> {
  const { error } = await supabase
    .from("room_players")
    .update({ score, correct, time_ms: timeMs, combo, done })
    .eq("id", playerId);
  if (error) return { data: null, error: error.message };
  return { data: undefined, error: null };
}
