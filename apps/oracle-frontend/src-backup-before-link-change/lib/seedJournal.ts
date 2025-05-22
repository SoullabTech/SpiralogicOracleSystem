// 📁 lib/seedJournal.ts
import { supabase } from "./supabaseClient";

export async function seedJournal(userId: string) {
  const elements = ["Fire", "Water", "Earth", "Air", "Aether"];
  const prompts = [
    "Felt the surge of creative fire today.",
    "Reflected on deep emotions this morning.",
    "Grounded myself with a long walk in nature.",
    "Insight came through a conversation unexpectedly.",
    "Noticed synchronicity around a dream symbol."
  ];

  for (let i = 0; i < elements.length; i++) {
    await supabase.from("journal_entries").insert({
      user_id: userId,
      element: elements[i],
      content: prompts[i],
    });
  }
}
