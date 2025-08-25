// Minimal RunPod v2 client for sesame-tts
const RP_BASE = "https://api.runpod.ai/v2";

export type SesameInput = { text: string };
export type SesameResult = {
  ok: boolean;
  // your handler should return { audioBase64, mime:"audio/wav" } in output
  audioBase64?: string;
  mime?: string;
  error?: string;
};

async function rp<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${RP_BASE}/${process.env.RUNPOD_ENDPOINT_ID}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.RUNPOD_API_KEY!}`,
    },
    body: JSON.stringify(body ?? {}),
    signal,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`RunPod ${path} ${res.status}: ${txt}`);
  }
  return res.json() as Promise<T>;
}

/** Submit a job */
export async function submitSesameJob(input: SesameInput, signal?: AbortSignal) {
  return rp<{ id: string }>("/run", { input }, signal);
}

/** Poll until completed or failed */
export async function waitForJob<T = any>(id: string, { timeoutMs = 180_000, pollMs = 1500 } = {}) {
  const t0 = Date.now();
  for (;;) {
    const { status, output } = await rp<{ status: string; output?: T }>("/status", { id });
    if (status === "COMPLETED") return output as T;
    if (status === "FAILED" || status === "CANCELLED") throw new Error(`RunPod job ${status}`);
    if (Date.now() - t0 > timeoutMs) throw new Error("RunPod wait timeout");
    await new Promise(r => setTimeout(r, pollMs));
  }
}

/** One-shot call that returns WAV bytes (Buffer) */
export async function synthesizeToWav(text: string) {
  const { id } = await submitSesameJob({ text });
  const out = await waitForJob<SesameResult>(id);
  if (!out?.ok || !out.audioBase64) {
    throw new Error(out?.error || "Sesame output missing audio");
  }
  return Buffer.from(out.audioBase64, "base64");
}