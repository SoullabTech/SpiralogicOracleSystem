import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const endpoint = process.env.RUNPOD_SESAME_ENDPOINT_ID;
  const key = process.env.RUNPOD_API_KEY;
  let sesameOk = false;
  let note: string | undefined;

  if (endpoint && key) {
    try {
      const res = await fetch(`https://api.runpod.ai/v2/${endpoint}/run`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ input: { text: "ping test" } }),
      });
      sesameOk = res.ok;
      if (!res.ok) note = `run status ${res.status}`;
    } catch (e: any) {
      note = e?.message;
    }
  } else {
    note = "RUNPOD env not set";
  }

  return NextResponse.json({
    provider: "sesame-runpod",
    ok: sesameOk,
    note,
  });
}