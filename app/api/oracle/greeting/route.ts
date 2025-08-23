// app/api/oracle/greeting/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getMayaGreeting } from "@/lib/voice/scripts/maya";

type Body = {
  mode?: "auto" | "first_time" | "returning_short" | "returning_reflect";
  conversationId?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const user = (await supabase.auth.getUser()).data.user;
    const { mode = "auto", conversationId } = (await req.json()) as Body;

    // Heuristic: first message ever? else returning.
    let ctx: "first_time" | "returning_short" | "returning_reflect" = "returning_short";
    if (mode === "first_time") ctx = "first_time";
    else if (mode === "returning_reflect") ctx = "returning_reflect";
    else if (mode === "auto") {
      if (!user) ctx = "first_time";
      else {
        // Check for prior messages/journal as a simple proxy
        const [{ count: msgCount }, { count: jCount }] = await Promise.all([
          supabase.from("messages").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("journal_entries").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        ]);
        if (!msgCount && !jCount) ctx = "first_time";
        else ctx = (msgCount && msgCount > 5) || (jCount && jCount > 0) ? "returning_reflect" : "returning_short";
      }
    }

    const text = getMayaGreeting(ctx);
    return NextResponse.json({ text, context: ctx, conversationId: conversationId ?? null });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "greeting-failed" }, { status: 500 });
  }
}