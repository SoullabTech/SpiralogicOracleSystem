import { createClient } from "@/lib/supabase/server";
import { DEFAULT_WEIGHTS, whisperWeightsSchema } from "@/app/api/whispers/weights/schema";

export async function loadWhisperWeightsForUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return DEFAULT_WEIGHTS;

  const { data, error } = await supabase
    .from("whisper_weights")
    .select("weights")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return DEFAULT_WEIGHTS;

  const parsed = whisperWeightsSchema.safeParse(data.weights);
  return parsed.success ? parsed.data : DEFAULT_WEIGHTS;
}