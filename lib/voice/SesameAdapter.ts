// lib/voice/SesameAdapter.ts
import { NextResponse } from "next/server";

const RUNPOD_BASE = "https://api.runpod.ai/v2";

type RunpodRunResp = { id: string };
type RunpodStatus =
  | "IN_QUEUE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "TIMED_OUT";

type RunpodStatusResp = {
  status: RunpodStatus;
  output?: any;           // expected to contain base64 audio
  error?: string;
};

function reqHeaders() {
  const key = process.env.RUNPOD_API_KEY;
  if (!key) throw new Error("RUNPOD_API_KEY missing");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };
}

function pickBase64Audio(output: any): string | undefined {
  // Be flexible with worker output shapes
  return (
    output?.audio_base64 ??
    output?.audio?.base64 ??
    output?.wavBase64 ??
    output?.wav_base64 ??
    output?.data?.audio_base64
  );
}

export async function synthesizeViaRunpod(text: string): Promise<Buffer> {
  const endpoint = process.env.RUNPOD_SESAME_ENDPOINT_ID;
  if (!endpoint) throw new Error("RUNPOD_SESAME_ENDPOINT_ID missing");

  console.log(`[SesameAdapter] Synthesizing text: "${text.substring(0, 50)}..."`);

  // 1) Kick off job
  const runRes = await fetch(`${RUNPOD_BASE}/${endpoint}/run`, {
    method: "POST",
    headers: reqHeaders(),
    body: JSON.stringify({
      input: { text }, // your worker should read input.text
    }),
  });
  if (!runRes.ok) {
    const body = await runRes.text();
    throw new Error(`RunPod run failed: ${runRes.status} ${body}`);
  }
  const { id: requestId } = (await runRes.json()) as RunpodRunResp;

  // 2) Poll for completion
  const pollMs = Number(process.env.RUNPOD_POLL_MS ?? 1500);
  const deadline = Date.now() + Number(process.env.RUNPOD_TIMEOUT_MS ?? 120000);

  while (Date.now() < deadline) {
    const st = await fetch(
      `${RUNPOD_BASE}/${endpoint}/status/${requestId}`,
      { headers: reqHeaders(), cache: "no-store" }
    );
    if (!st.ok) {
      const body = await st.text();
      throw new Error(`RunPod status failed: ${st.status} ${body}`);
    }
    const data = (await st.json()) as RunpodStatusResp;

    if (data.status === "COMPLETED") {
      console.log(`[SesameAdapter] Job completed, output keys:`, Object.keys(data.output || {}));
      const b64 = pickBase64Audio(data.output);
      if (!b64) {
        console.error(`[SesameAdapter] No audio found in output:`, JSON.stringify(data.output).substring(0, 200));
        throw new Error("RunPod completed but no audio in output");
      }
      console.log(`[SesameAdapter] Found base64 audio, length: ${b64.length} chars`);
      const buffer = Buffer.from(b64, "base64");
      console.log(`[SesameAdapter] Decoded to buffer, size: ${buffer.length} bytes (${(buffer.length / 1024).toFixed(2)} KB)`);
      return buffer;
    }
    if (["FAILED", "CANCELLED", "TIMED_OUT"].includes(data.status)) {
      throw new Error(`RunPod job ${data.status}: ${data.error ?? ""}`);
    }
    await new Promise((r) => setTimeout(r, pollMs));
  }
  throw new Error("RunPod timeout waiting for audio");
}

// Small helper for API routes
export async function respondWithWav(buf: Buffer) {
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "no-store",
    },
  });
}