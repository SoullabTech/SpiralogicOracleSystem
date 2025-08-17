"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PersonaKey = "mentor" | "shaman" | "analyst";

const PERSONAS: Record<PersonaKey, { title: string; blurb: string; emoji: string }> = {
  mentor:  { title: "Mentor",  blurb: "Direct, practical, steady.", emoji: "🧭" },
  shaman:  { title: "Shaman",  blurb: "Symbolic, imaginal, deep.",  emoji: "🜁"  },
  analyst: { title: "Analyst", blurb: "Clear, structured, precise.", emoji: "📐" },
};

export default function WelcomePage() {
  const router = useRouter();
  const [persona, setPersona] = useState<PersonaKey | null>(null);
  const [intention, setIntention] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleContinue() {
    if (!persona) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona, intention }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      router.push("/oracle");
    } catch (e) {
      alert("Could not complete setup. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[#0b1220] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-10">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-white/10 grid place-items-center">
            <span className="text-xl">🌀</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Begin where you are.
          </h1>
          <p className="text-white/70 mt-2">Choose a guide. The wisdom stays the same.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(PERSONAS).map(([key, p]) => {
            const k = key as PersonaKey;
            const active = persona === k;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPersona(k)}
                className={[
                  "rounded-2xl border p-4 text-left transition",
                  "bg-white/5 border-white/10 hover:border-white/20",
                  active ? "ring-2 ring-indigo-400 border-indigo-400" : "",
                ].join(" ")}
                aria-pressed={active}
              >
                <div className="text-2xl mb-2">{p.emoji}</div>
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-white/70">{p.blurb}</div>
              </button>
            );
          })}
        </section>

        <label className="block mb-2 text-sm text-white/80" htmlFor="intention">
          What's on your mind right now?
        </label>
        <textarea
          id="intention"
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="One line is enough."
          rows={3}
          className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-white/30 outline-none p-3 text-white placeholder-white/40"
        />

        <div className="mt-6 flex items-center justify-between gap-3">
          <span className={["text-sm", persona ? "text-white/60" : "text-red-300"].join(" ")}>
            {persona ? "Ready." : "Pick a guide to continue."}
          </span>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!persona || submitting}
            className={[
              "inline-flex items-center justify-center rounded-xl px-4 py-2",
              "bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50",
              "font-medium",
            ].join(" ")}
          >
            {submitting ? "Setting up…" : "Continue"}
          </button>
        </div>

        <footer className="mt-10 text-center">
          <p className="text-xs text-white/50">You can change your guide later in Settings.</p>
        </footer>
      </div>
    </main>
  );
}