import { NextResponse } from "next/server";
import { whisperWeightsSchema, DEFAULT_WEIGHTS } from "./schema";
import { createClient } from "@/lib/supabase/server";

// GET -> returns persisted weights or defaults
export async function GET() {
  const supabase = createClient();
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr) return NextResponse.json({ error: uerr.message }, { status: 401 });
  if (!user) return NextResponse.json({ weights: DEFAULT_WEIGHTS, source: "default" });

  const { data, error } = await supabase
    .from("whisper_weights")
    .select("weights, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ weights: DEFAULT_WEIGHTS, source: "default" });
  }

  // Validate on the way out (protect against bad rows)
  const parsed = whisperWeightsSchema.safeParse(data.weights);
  if (!parsed.success) {
    return NextResponse.json({ weights: DEFAULT_WEIGHTS, source: "default-invalid-row" });
  }

  return NextResponse.json({ weights: parsed.data, updated_at: data.updated_at, source: "db" });
}

// POST -> upsert weights for current user
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = whisperWeightsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid weights", details: parsed.error.format() }, { status: 400 });
  }

  const { error } = await supabase
    .from("whisper_weights")
    .upsert({
      user_id: user.id,
      weights: parsed.data,
    }, { onConflict: "user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}