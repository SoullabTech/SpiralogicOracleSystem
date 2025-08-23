import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rankWhispers } from "@/lib/whispers/rankWhispers";
import { features } from "@/lib/config/features";
import { loadWhisperWeightsForUser } from "@/lib/whispers/loadWeightsServer";
import { validateUserAccess, validateLimit } from "@/lib/whispers/validate";

const Body = z.object({
  recapBuckets: z.array(z.object({
    element: z.enum(["fire","water","earth","air","aether"]),
    titles: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
  })),
  since: z.string().datetime().optional(), // optional window start
  limit: z.number().min(1).max(10).optional(), // Enforce limit <= 10 for production
});

export async function POST(req: Request) {
  if (!features.whispers.enabled) {
    return NextResponse.json({ whispers: [] }, { headers: { "cache-control": "no-store" } });
  }

  // Validate user access with proper error handling
  const { valid, userId, error: authError } = await validateUserAccess();
  if (!valid) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }
  
  const supabase = createClient();

  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { recapBuckets, since, limit: rawLimit } = parsed.data;
  const limit = validateLimit(rawLimit ?? features.whispers.maxItems);

  // Pull candidates (last 30d by default or custom window)
  const windowStart = since ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("micro_memories")
    .select("*")
    .eq("user_id", userId!)
    .gte("created_at", windowStart)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Transform to expected format
  const transformedMemories = (data ?? []).map(m => ({
    id: m.id,
    user_id: m.user_id,
    text: m.content,
    tags: m.nd_tags ?? [],
    energy_level: m.energy,
    element: null, // Will be inferred by ranking
    status: "active" as const,
    created_at: m.created_at,
    last_seen_at: null,
    recall_at: m.recall_at,
    metadata: null,
  }));

  let ranked;
  if (features.whispers.contextRanking) {
    try {
      // Ranking with timeout for graceful degradation
      const startTime = Date.now();
      const weights = await loadWhisperWeightsForUser();
      ranked = rankWhispers({ memories: transformedMemories, recapBuckets, weights });
      
      // If ranking took too long, log and fall back to recency sort
      const duration = Date.now() - startTime;
      if (duration > features.whispers.rankingTimeoutMs) {
        console.warn(`Whispers ranking exceeded budget: ${duration}ms > ${features.whispers.rankingTimeoutMs}ms`);
        ranked = transformedMemories
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map(m => ({ ...m, score: 0, reason: "fallback:timeout" }));
      }
    } catch (error) {
      console.error("Whispers ranking failed, falling back to recency:", error);
      ranked = transformedMemories
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(m => ({ ...m, score: 0, reason: "fallback:recency" }));
    }
  } else {
    ranked = transformedMemories.map(m => ({ ...m, score: 0, reason: "ranking disabled" }));
  }

  const out = ranked.slice(0, limit ?? features.whispers.maxItems);

  // Short shared cache (CDN) + per-user cache key to avoid cross-user caching
  const res = NextResponse.json({ whispers: out });
  res.headers.set("cache-control", "public, s-maxage=30, stale-while-revalidate=120, max-age=5");
  res.headers.set("vary", "authorization"); // Prevent cross-user caching
  return res;
}