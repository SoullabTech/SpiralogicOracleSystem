import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const BodySchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { ids } = parsed.data;

  // For now, we don't have last_seen_at in the actual table, so this is a no-op
  // But the endpoint exists for future enhancement
  return NextResponse.json({ ok: true });
}