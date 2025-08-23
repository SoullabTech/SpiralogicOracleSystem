import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({ id: z.string().uuid() });

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return NextResponse.json({ ok: true });

  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: true });

  const { id } = parsed.data;
  await supabase.from("micro_memories")
    .update({ metadata: { used_at: new Date().toISOString() } })
    .eq("id", id)
    .eq("user_id", user.user.id);

  return NextResponse.json({ ok: true });
}