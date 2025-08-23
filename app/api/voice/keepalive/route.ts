// app/api/voice/keepalive/route.ts
import { NextResponse } from "next/server";

const SESAME_BASE_URL = process.env.SESAME_BASE_URL; // e.g. https://<runpod-endpoint>
const TIMEOUT_MS = 8000;

export async function GET() {
  if (!SESAME_BASE_URL) {
    return NextResponse.json({ ok: false, error: "SESAME_BASE_URL not set" }, { status: 500 });
  }
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), TIMEOUT_MS);

  try {
    const r = await fetch(`${SESAME_BASE_URL}/v1/models`, {
      method: "GET",
      signal: ctl.signal,
      headers: { "Accept": "application/json" },
      // Tiny CF cache to reduce bursts if multiple pings hit at once
      next: { revalidate: 30 },
    });
    clearTimeout(to);

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return NextResponse.json({ ok: false, status: r.status, body: text.slice(0, 200) }, { status: 502 });
    }
    const body = await r.json().catch(() => ({}));
    return NextResponse.json({ ok: true, provider: "sesame-runpod", warmed: true, body });
  } catch (err: any) {
    clearTimeout(to);
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 504 });
  }
}