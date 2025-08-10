// backend/server/services/ritualEntryService.ts
import { supabase } from "@/lib/supabase";

export async function logRitualEntry({
  userId,
  ritualType,
  linkedDreamId,
  notes,
}: {
  userId: string;
  ritualType: string;
  linkedDreamId?: string;
  notes?: string;
}) {
  const { data, error } = await supabase.from("ritual_entries").insert([
    {
      user_id: userId,
      ritual_type: ritualType,
      linked_dream_id: linkedDreamId,
      notes,
    },
  ]);
  if (error) throw error;
  return data?.[0];
}
