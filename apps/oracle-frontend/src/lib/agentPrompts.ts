// src/lib/agentPrompts.ts
import { supabase } from "@/lib/supabaseClient";

export async function getLatestPromptForElement(element: string) {
  const { data, error } = await supabase
    .from("agent_prompts")
    .select("prompt")
    .eq("element", element)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data?.length) {
    return getDefaultPrompt(element); // fallback
  }

  return data[0].prompt;
}

export function getDefaultPrompt(element: string): string {
  switch (element.toLowerCase()) {
    case "fire":
      return "What lights your internal flame today?";
    case "water":
      return "What feelings are surfacing that want to be honored?";
    case "earth":
      return "What can you ground into or nurture with care today?";
    case "air":
      return "What message or insight wants to move through you?";
    case "aether":
      return "What pattern, dream, or synchronicity are you noticing?";
    default:
      return "What is arising in your consciousness now?";
  }
}
