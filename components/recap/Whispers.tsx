"use client";
import * as React from "react";
import { useEffect } from "react";
import { btnCx } from "@/lib/ui/btn";
import type { Whisper } from "@/lib/whispers/rankWhispers";
import { emitWhispersShown, emitWhisperUsed } from "@/lib/whispers/emit";

type Props = {
  whispers: Whisper[] | null | undefined;
  onUse?: (w: Whisper) => void; // e.g., open drawer, copy into notes, or attach to recap
};

export default function Whispers({ whispers, onUse }: Props) {
  // Track whispers shown
  useEffect(() => {
    if (!whispers?.length) return;
    emitWhispersShown(whispers.slice(0, 6).map(w => w.id));
  }, [JSON.stringify(whispers?.map(w => w.id))]);
  
  // Gracefully hide if no whispers (no layout jump)
  if (!whispers || whispers.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-edge-700 p-4 bg-bg-800/50">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-ink-200 opacity-70">Whispers</h3>
        <span className="text-xs text-ink-400 opacity-60">light suggestions from your notes</span>
      </div>

      <ul className="space-y-3">
        {whispers.map((w) => (
          <li key={w.id} className="rounded-lg border border-edge-600 p-3 bg-bg-900/30">
            <div className="mb-1 text-sm text-ink-200">
              {w.text}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
              {w.element ? <span className="px-2 py-0.5 rounded bg-edge-700 text-ink-300">{w.element}</span> : null}
              {w.tags?.map(t => (
                <span key={t} className="px-2 py-0.5 rounded bg-edge-700 text-ink-300">{t}</span>
              ))}
              <span>score: {Math.round(w.score)}</span>
              {w.reason && <span>• {w.reason}</span>}
            </div>
            {onUse && (
              <div className="mt-2">
                <button
                  className={btnCx("text-xs", { intent: "ghost", size: "sm" })}
                  onClick={() => {
                    emitWhisperUsed(w.id);
                    onUse(w);
                  }}
                >
                  Use this
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}