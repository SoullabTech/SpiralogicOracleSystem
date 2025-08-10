// backend/server/services/userPhaseService.ts
import { supabase } from "@/lib/supabase";

export async function saveUserPhase({
  userId,
  phase,
  archetype,
  element,
}: {
  userId: string;
  phase: string;
  archetype?: string;
  element?: string;
}) {
  const { data, error } = await supabase
    .from("user_phases")
    .insert([{ user_id: userId, phase, archetype, element }]);
  if (error) throw error;
  return data?.[0];
}
