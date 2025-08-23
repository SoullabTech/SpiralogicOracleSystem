// app/api/voice/sesame/route.ts
import { NextRequest, NextResponse } from "next/server";
import { synthesizeViaRunpod, respondWithWav } from "@/lib/voice/SesameAdapter";

// optional: your existing ElevenLabs fallback
import { synthesizeWithElevenLabs } from "@/lib/voice";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text required" }, { status: 400 });
    }

    // Primary: RunPod Sesame
    try {
      const wav = await synthesizeViaRunpod(text);
      return respondWithWav(wav);
    } catch (e) {
      // Fallback: ElevenLabs if configured
      if (process.env.ELEVENLABS_API_KEY) {
        const audioUrl = await synthesizeWithElevenLabs({
          voiceId: "calm",
          text,
        });
        // synthesizeWithElevenLabs returns a blob URL, we need to fetch it
        const response = await fetch(audioUrl);
        const audioBuffer = await response.arrayBuffer();
        return new NextResponse(audioBuffer, {
          status: 200,
          headers: { "Content-Type": "audio/mpeg" },
        });
      }
      throw e;
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "synthesis failed" },
      { status: 502 }
    );
  }
}