import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Schema = z.object({
  id: z.string().uuid(),
  minutes: z.number().min(5).max(24*60)
});

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error:"unauthorized" }, { status:401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status:400 });

  const recallAt = new Date(Date.now() + parsed.data.minutes*60*1000).toISOString();
  const { error } = await supabase
    .from("micro_memories")
    .update({ recall_at: recallAt })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status:500 });
  return NextResponse.json({ ok:true, recall_at: recallAt });
}