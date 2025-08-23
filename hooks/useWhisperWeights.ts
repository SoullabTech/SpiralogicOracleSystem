"use client";

import * as React from "react";
import { DEFAULT_WEIGHTS, WhisperWeights } from "@/app/api/whispers/weights/schema";

type State =
  | { status: "idle"; weights: WhisperWeights }
  | { status: "loading"; weights: WhisperWeights }
  | { status: "ready"; weights: WhisperWeights }
  | { status: "error"; weights: WhisperWeights; error: string };

export function useWhisperWeights() {
  const [state, setState] = React.useState<State>({ status: "idle", weights: DEFAULT_WEIGHTS });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setState(s => ({ ...s, status: "loading" }));
      try {
        const res = await fetch("/api/whispers/weights", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setState({ status: "ready", weights: data.weights ?? DEFAULT_WEIGHTS });
      } catch (e: any) {
        // fallback to localStorage if present
        const local = localStorage.getItem("whisperWeights");
        const fallback = local ? JSON.parse(local) as WhisperWeights : DEFAULT_WEIGHTS;
        if (cancelled) return;
        
        // Log telemetry event for fallback
        try {
          fetch("/api/telemetry/weights/fallback", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ error: e?.message ?? "fetch failed", source: local ? "localStorage" : "default" })
          }).catch(() => {}); // Non-blocking telemetry
        } catch {}
        
        setState({ status: "error", weights: fallback, error: e?.message ?? "fetch failed" });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function save(weights: WhisperWeights) {
    // optimistic update
    setState({ status: "loading", weights });
    localStorage.setItem("whisperWeights", JSON.stringify(weights));
    try {
      const res = await fetch("/api/whispers/weights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(weights),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setState({ status: "ready", weights });
    } catch (e: any) {
      setState(s => ({ status: "error", weights: s.weights, error: e?.message ?? "save failed" }));
    }
  }

  return {
    ...state,
    save,
  };
}