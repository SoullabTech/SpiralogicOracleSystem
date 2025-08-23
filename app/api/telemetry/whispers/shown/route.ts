import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({ ids: z.array(z.string().uuid()).min(1) });

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return NextResponse.json({ ok: true }); // ignore silently when not authed

  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: true }); // non-blocking

  const { ids } = parsed.data;
  await supabase.from("micro_memories")
    .update({ last_seen_at: new Date().toISOString() })
    .in("id", ids)
    .eq("user_id", user.user.id);

  return NextResponse.json({ ok: true });
}