import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MicroMemorySchema } from "./schema";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = MicroMemorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { content, tags, energy, recall_at } = parsed.data;
  const { data, error } = await supabase.from("micro_memories").insert({
    user_id: user.id,
    content,
    nd_tags: tags ?? [],
    energy: energy ?? null,
    recall_at: recall_at ?? null,
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, memory: data });
}