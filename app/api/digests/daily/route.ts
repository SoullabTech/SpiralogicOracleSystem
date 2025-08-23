import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { features } from "@/lib/config/features";

export async function GET() {
  if (!features.neurodivergent.adhdDigests) return NextResponse.json({ ok:false, reason:"disabled" });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error:"unauthorized" }, { status:401 });

  const since = new Date(Date.now() - 24*60*60*1000).toISOString();
  const { data: rows, error } = await supabase
    .from("micro_memories")
    .select("id,content,nd_tags,energy,created_at")
    .eq("user_id", user.id)
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status:500 });

  // Tiny heuristic digest:
  const themes = {
    inspiration: rows?.filter(r=>r.nd_tags?.includes("inspiration")).length ?? 0,
    fear:        rows?.filter(r=>r.nd_tags?.includes("fear")).length ?? 0,
    todo:        rows?.filter(r=>r.nd_tags?.includes("todo")).length ?? 0,
    reflection:  rows?.filter(r=>r.nd_tags?.includes("reflection")).length ?? 0,
  };
  const nudges = [
    themes.fear > 0 ? "Schedule a 10-minute worry unpack." : null,
    themes.todo > 0 ? "Pick one tiny task and time-box 5 minutes." : null,
    themes.inspiration > 0 ? "Pin 1 idea for tomorrow's focus." : null,
  ].filter(Boolean);

  const maya_voice_cue = {
    context: "adhd_daily_digest",
    text: "Here's your gentle digest: a few sparks, a few worries. Shall we anchor one small step?",
    speak: true
  };

  return NextResponse.json({ ok:true, themes, count: rows?.length ?? 0, nudges, maya_voice_cue });
}