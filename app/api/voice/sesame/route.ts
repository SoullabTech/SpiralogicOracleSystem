import { NextRequest, NextResponse } from "next/server";
import { synthesizeToWav } from "@/lib/runpodSesame";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }
    const wav = await synthesizeToWav(text);
    return new NextResponse(wav, {
      status: 200,
      headers: { "content-type": "audio/wav" },
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}