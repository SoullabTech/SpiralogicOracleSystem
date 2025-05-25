import { supabase } from "./supabase/client";

export async function saveJournalEntry({
  userId,
  agent,
  prompt,
  response,
  metadata = {},
}: {
  userId: string;
  agent: string;
  prompt: string;
  response: string;
  metadata?: Record<string, any>;
}) {
  const { data, error } = await supabase.from("journal_entries").insert([
    {
      user_id: userId,
      agent,
      prompt,
      response,
      metadata,
    },
  ]);

  if (error) throw new Error(error.message);
  return data;
}
