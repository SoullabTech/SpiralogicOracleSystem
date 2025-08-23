import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { oracleWeave } from "@/lib/oracle/sendToOracle";
import { bucketize } from "@/lib/recap/map";

// URL param validator
const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Validate params
    const { id } = paramsSchema.parse(params);

    // 2. Authenticated supabase client
    const supabase = createClient({ req });
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Fetch the dream
    const { data: dream, error } = await supabase
      .from("dreams")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !dream) {
      return NextResponse.json({ error: "Dream not found" }, { status: 404 });
    }

    // 4. Transform into oracle context
    const textParts: string[] = [];
    if (dream.title) textParts.push(`# ${dream.title}`);
    if (dream.notes) textParts.push(dream.notes);
    if (Array.isArray(dream.segments)) {
      dream.segments.forEach((s: any, i: number) => {
        textParts.push(
          `Segment ${i + 1}: ${s.title ?? ""} ${s.notes ?? ""} (lucidity: ${
            s.lucidity ?? "?"
          }, emotion: ${s.emotion ?? "?"})`
        );
      });
    }
    const text = textParts.join("\n\n");

    const withCtx = {
      userId: user.id,
      input: text,
      system: "Weave insights from this dream journal entry.",
      meta: { source: "dream", dreamId: id },
    };

    // 5. Call oracleWeave pipeline
    const weaveResult = await oracleWeave(withCtx);

    // 6. Bucketize recap (server-side)
    const buckets = bucketize(weaveResult.text);

    // 7. Return response
    return NextResponse.json({
      text: weaveResult.text,
      userQuote: weaveResult.userQuote,
      buckets,
      maya_voice_cue: {
        context: "dream-weave",
        text: "I've woven your dream into patterns of meaning. Would you like to reflect on these today?",
        speak: true,
      },
    });
  } catch (e: any) {
    console.error("Dream weave error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to weave dream" },
      { status: 500 }
    );
  }
}