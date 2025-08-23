import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rankWhispers } from "@/lib/whispers/rankWhispers";
import { fetchWhispers } from "@/lib/micro/whispers";
import { loadWhisperWeightsForUser } from "@/lib/whispers/loadWeightsServer";

const BodySchema = z.object({
  recapBuckets: z.array(z.object({
    element: z.enum(["fire","water","earth","air","aether"]),
    titles: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional()
  })),
  limit: z.number().min(1).max(12).default(6),
});

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { recapBuckets, limit } = parsed.data;

  // Pull candidate memories for this user (only active with near-term recall or recent)
  const { data: memories, error } = await supabase
    .from("micro_memories")
    .select("*")
    .eq("user_id", user.user.id)
    .gte("created_at", new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()) // last 30 days
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Transform to expected format
  const transformedMemories = (memories ?? []).map(m => ({
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

  const weights = await loadWhisperWeightsForUser();
  const ranked = rankWhispers({ memories: transformedMemories, recapBuckets, weights });
  return NextResponse.json({ whispers: ranked.slice(0, limit) });
}

export async function GET(req: Request) {
  try {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const days = searchParams.get("days") ? Number(searchParams.get("days")) : 7;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;
    const tags = searchParams.getAll("tag");
    
    const windowStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    let query = supabase
      .from("micro_memories")
      .select("*")
      .eq("user_id", user.user.id)
      .gte("created_at", windowStart)
      .order("created_at", { ascending: false })
      .limit(limit);
      
    if (tags.length > 0) {
      query = query.contains("nd_tags", tags);
    }
    
    const { data, error } = await query;
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    // Transform to expected format
    const whispers = (data ?? []).map(m => ({
      id: m.id,
      content: m.content,
      tags: m.nd_tags ?? [],
      element: m.element || null,
      energy: m.energy,
      created_at: m.created_at,
      recall_at: m.recall_at,
    }));
    
    return NextResponse.json({ whispers });
  } catch (e: any) {
    const msg = e?.message || "Failed to fetch whispers";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}