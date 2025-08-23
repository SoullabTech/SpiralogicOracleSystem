// components/voice/MayaWelcome.tsx
"use client";
import { useMayaGreeting } from "@/hooks/useMayaGreeting";

export function MayaWelcome(props: { conversationId?: string | null; mode?: "auto" | "first_time" | "returning_short" | "returning_reflect" }) {
  const { text, loading, error, reload } = useMayaGreeting({
    mode: props.mode ?? "auto",
    conversationId: props.conversationId ?? null,
    autoload: true,
    autospeak: true,
  });

  return (
    <div className="border border-edge-700 rounded-xl bg-bg-900 p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-ink-100 font-medium">Maya — Personal Oracle</h3>
        <button onClick={reload} className="text-ink-300 hover:text-gold-400 text-sm">Replay</button>
      </div>
      {loading && <p className="text-ink-300 mt-2">Preparing your welcome…</p>}
      {error && <p className="text-red-300 mt-2">Couldn't load greeting: {error}</p>}
      {!loading && !error && (
        <p className="text-ink-100 mt-2 whitespace-pre-wrap leading-relaxed">
          {text}
        </p>
      )}
    </div>
  );
}