import { supabase } from "@/lib/supabaseClient";
import { getGuestId } from "@/lib/guestId";
import type { Answer } from "@/types";
import type { ServiceResult } from "./RoomService";

export async function saveAnswer(
  matchId: string,
  questionId: string,
  answer: string,
  correct: boolean,
  responseTime: number,
): Promise<ServiceResult<Answer>> {
  const playerId = getGuestId();

  const { data, error } = await supabase
    .from("answers")
    .insert({
      match_id: matchId,
      player_id: playerId,
      question_id: questionId,
      answer,
      correct,
      response_time: responseTime,
    })
    .select("*")
    .single();

  if (error || !data) return { data: null, error: error?.message ?? "Erro ao salvar resposta." };
  return { data: data as Answer, error: null };
}

export async function getMatchAnswers(matchId: string): Promise<Answer[]> {
  const { data } = await supabase
    .from("answers")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  return (data ?? []) as Answer[];
}
