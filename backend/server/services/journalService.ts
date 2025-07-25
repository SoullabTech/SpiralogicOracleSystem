// backend/server/services/journalService.ts
import { supabase } from "@/lib/supabase"

export async function saveJournalEntry({
  userId,
  content,
  mood,
  petalData,
  archetypeTag,
  elementalTag,
  ritual,
  phase,
  metadata = {}
}: {
  userId: string
  content: string
  mood?: string
  petalData?: Record<string, number>
  archetypeTag?: string
  elementalTag?: string
  ritual?: string
  phase?: string
  metadata?: any
}) {
  const { data, error } = await supabase.from("journal_entries").insert([
    {
      user_id: userId,
      content,
      mood,
      elemental_tag: elementalTag,
      archetype_tag: archetypeTag,
      ritual,
      phase,
      progression_in: petalData,
      metadata,
    }
  ])

  if (error) throw error
  return data?.[0]
}
