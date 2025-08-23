// hooks/useMayaGreeting.ts
"use client";
import { useEffect, useState } from "react";
import { features } from "@/lib/config/features";
import { speak } from "@/lib/voice/speak"; // your unified TTS router

type Mode = "auto" | "first_time" | "returning_short" | "returning_reflect";

export function useMayaGreeting(opts?: { mode?: Mode; conversationId?: string | null; autoload?: boolean; autospeak?: boolean }) {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(!!opts?.autoload);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/oracle/greeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: opts?.mode ?? "auto", conversationId: opts?.conversationId ?? null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "failed");
      setText(data.text || "");
      if (features.oracle.voiceEnabled && features.oracle.mayaVoice && (opts?.autospeak ?? true) && data.text) {
        // Speak as Maya (Sesame/web TTS via your speak router)
        await speak(data.text);
      }
    } catch (e: any) {
      setError(e?.message ?? "greeting_error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (opts?.autoload) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { text, loading, error, reload: load };
}