import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const CaptureSchema = z.object({
  content: z.string().min(1),
  nd_tags: z.array(z.string()).max(8).optional(),
  energy: z.enum(["low","medium","high"]).optional(),
  recall_at: z.string().datetime().optional()
});

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error:"unauthorized" }, { status:401 });

  const body = await req.json();
  const parsed = CaptureSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status:400 });

  const { content, nd_tags, energy, recall_at } = parsed.data;
  const { error } = await supabase.from("micro_memories").insert({
    user_id: user.id,
    content,
    nd_tags: nd_tags ?? [],
    energy: energy ?? null,
    recall_at: recall_at ?? null
  });
  if (error) return NextResponse.json({ error: error.message }, { status:500 });

  return NextResponse.json({ ok:true });
}

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error:"unauthorized" }, { status:401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "active";
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const query = supabase
    .from("micro_memories")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  // Add status filter if provided
  if (status && status !== "all") {
    // For now, we just have active captures (no status field yet)
    // This can be extended later
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status:500 });

  return NextResponse.json({ captures: data || [] });
}