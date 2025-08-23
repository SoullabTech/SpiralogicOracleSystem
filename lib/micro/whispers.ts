import { createClient } from "@/lib/supabase/server";

export type Whisper = {
  id: string;
  content: string;
  tags: string[];
  energy?: "low" | "medium" | "high" | null;
  created_at: string;
  // for RecapView surfacing
  element?: "fire" | "water" | "earth" | "air" | "aether";
};

const TAG_TO_ELEMENT: Record<string, Whisper["element"]> = {
  fear: "water",
  inspiration: "fire",
  reflection: "earth",
  idea: "air",
  ritual: "aether",
  todo: "earth",
};

function inferElement(tags: string[], energy?: Whisper["energy"]): Whisper["element"] {
  for (const t of tags) {
    const el = TAG_TO_ELEMENT[t.toLowerCase()];
    if (el) return el;
  }
  if (energy === "high") return "fire";
  if (energy === "low") return "water";
  return "air";
}

export async function fetchWhispers(opts: {
  userId?: string;          // if omitted, infer from session
  sinceISO?: string;        // only return recent
  limit?: number;           // default 12
  tags?: string[];          // optional filter
}) {
  const supabase = createClient();

  // resolve user
  let userId = opts.userId;
  if (!userId) {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error("Unauthorized");
    userId = data.user.id;
  }

  let q = supabase
    .from("micro_memories")
    .select("id, content, nd_tags, energy, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 12);

  if (opts.sinceISO) q = q.gte("created_at", opts.sinceISO);
  if (opts.tags?.length) q = q.contains("nd_tags", opts.tags);

  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);

  const whispers: Whisper[] = (rows ?? []).map((r) => ({
    id: r.id,
    content: r.content,
    tags: r.nd_tags ?? [],
    energy: r.energy as any,
    created_at: r.created_at,
    element: inferElement(r.nd_tags ?? [], r.energy as any),
  }));

  return whispers;
}