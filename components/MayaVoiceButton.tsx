"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  text: string;                 // what Maya should say
  className?: string;           // tailwind overrides
  endpoint?: string;            // override api route if needed
};

export default function MayaVoiceButton({
  text,
  className = "",
  endpoint = "/api/voice/sesame",
}: Props) {
  const [status, setStatus] = useState<"idle"|"loading"|"ready"|"error">("idle");
  const [err, setErr] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // revoke old blob urls
  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

  async function speak() {
    if (!text?.trim()) return;
    setStatus("loading"); setErr(null);

    // abort any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const msg = await safeError(res);
        throw new Error(msg || `HTTP ${res.status}`);
      }

      const blob = await res.blob();

      // lightweight validation: must look like WAV and be > 100KB
      if (blob.type && !blob.type.includes("wav")) {
        throw new Error(`Unexpected content-type: ${blob.type}`);
      }
      if (blob.size < 100_000) {
        throw new Error("Audio too small (likely a fallback).");
      }

      // play
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = URL.createObjectURL(blob);
      ensureAudio().src = urlRef.current;
      await ensureAudio().play();

      setStatus("ready");
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setErr(e?.message ?? "Failed to synthesize.");
      setStatus("error");
    }
  }

  function ensureAudio() {
    if (!audioRef.current) audioRef.current = new Audio();
    return audioRef.current!;
  }

  function stop() {
    const a = ensureAudio();
    a.pause(); a.currentTime = 0;
    abortRef.current?.abort();
    setStatus("idle");
  }

  const label = useMemo(() => {
    if (status === "loading") return "Synthesizing…";
    if (status === "ready")   return "Play again";
    if (status === "error")   return "Retry";
    return "Speak";
  }, [status]);

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      <button
        onClick={status === "loading" ? stop : speak}
        className={`px-4 py-2 rounded-2xl text-sm font-medium shadow
          ${status==="loading" ? "bg-zinc-200 text-zinc-500" : "bg-indigo-600 text-white hover:bg-indigo-500"}
          disabled:opacity-50`}
        disabled={status === "loading" && !err}
        aria-busy={status === "loading"}
      >
        {label}
      </button>

      {status === "loading" && (
        <p className="text-xs text-zinc-500">Contacting RunPod + loading model…</p>
      )}
      {err && (
        <p className="text-xs text-rose-600">Error: {err}</p>
      )}
    </div>
  );
}

async function safeError(res: Response) {
  try {
    const t = await res.text();
    try { return JSON.parse(t)?.error || t; } catch { return t; }
  } catch { return ""; }
}