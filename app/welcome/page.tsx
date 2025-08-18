"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VOICE_OPTIONS, preview } from "../../lib/voice";
import { VoicePlayer } from "../../components/voice/VoicePlayer";

type PersonaKey = "mentor" | "shaman" | "analyst";
type Step = "persona" | "agent-name" | "voice-choice" | "confirm";

const PERSONAS: Record<PersonaKey, { title: string; blurb: string; emoji: string }> = {
  mentor:  { title: "Mentor",  blurb: "Direct, practical, steady.", emoji: "🧭" },
  shaman:  { title: "Shaman",  blurb: "Symbolic, imaginal, deep.",  emoji: "🜁"  },
  analyst: { title: "Analyst", blurb: "Clear, structured, precise.", emoji: "📐" },
};

const PREVIEW_TEXT = "Hi, I'm your Oracle. I'll keep things clear and honest.";

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("persona");
  const [persona, setPersona] = useState<PersonaKey | null>(null);
  const [intention, setIntention] = useState("");
  const [agentName, setAgentName] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);

  const handlePreview = async (selectedVoiceId: string) => {
    if (selectedVoiceId === 'later') return;
    
    setPreviewing(selectedVoiceId);
    setPreviewError(null);
    setPreviewAudio(null);

    try {
      const result = await preview(PREVIEW_TEXT, selectedVoiceId);
      
      if (result.success) {
        if (result.usedFallback) {
          // For Web Speech API, we show a message instead of audio player
          setPreviewError("using system voice");
        } else if (result.audioUrl) {
          setPreviewAudio(result.audioUrl);
        }
      } else {
        setPreviewError(result.error || "Preview failed");
      }
    } catch (error) {
      setPreviewError("voice offline");
    } finally {
      setPreviewing(null);
    }
  };

  async function handleFinalSubmit() {
    if (!persona) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          persona, 
          intention,
          agentName: agentName || null,
          voiceProvider: "elevenlabs",
          voiceId: voiceId || null,
          ttsEnabled,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      router.push("/now");
    } catch (e) {
      alert("Could not complete setup. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const canContinuePersona = !!persona;
  const canContinueAgentName = agentName.length >= 1 && agentName.length <= 32;
  const canContinueVoice = !!voiceId;

  if (step === "persona") {
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
            <span className={["text-sm", canContinuePersona ? "text-white/60" : "text-red-300"].join(" ")}>
              {canContinuePersona ? "Ready." : "Pick a guide to continue."}
            </span>
            <button
              type="button"
              onClick={() => setStep("agent-name")}
              disabled={!canContinuePersona}
              className={[
                "inline-flex items-center justify-center rounded-xl px-4 py-2",
                "bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50",
                "font-medium",
              ].join(" ")}
            >
              Continue
            </button>
          </div>

          <footer className="mt-10 text-center">
            <p className="text-xs text-white/50">You can change your guide later in Settings.</p>
          </footer>
        </div>
      </main>
    );
  }

  if (step === "agent-name") {
    return (
      <main className="min-h-dvh bg-[#0b1220] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <header className="text-center mb-10">
            <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-white/10 grid place-items-center">
              <span className="text-xl">✨</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              What should I call myself?
            </h1>
            <p className="text-white/70 mt-2">Give your Oracle a name that feels right.</p>
          </header>

          <div className="mb-6">
            <label className="block mb-2 text-sm text-white/80" htmlFor="agent-name">
              Agent Name
            </label>
            <input
              id="agent-name"
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value.slice(0, 32))}
              placeholder="Oracle, Sage, Wisdom, etc."
              className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-white/30 outline-none p-3 text-white placeholder-white/40"
              maxLength={32}
            />
            <p className="text-xs text-white/50 mt-1">
              {agentName.length}/32 characters • You can change this later.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("persona")}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20 font-medium"
            >
              Back
            </button>
            <span className={["text-sm", canContinueAgentName ? "text-white/60" : "text-red-300"].join(" ")}>
              {canContinueAgentName ? "Ready." : "Enter a name (1-32 characters)."}
            </span>
            <button
              type="button"
              onClick={() => setStep("voice-choice")}
              disabled={!canContinueAgentName}
              className={[
                "inline-flex items-center justify-center rounded-xl px-4 py-2",
                "bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50",
                "font-medium",
              ].join(" ")}
            >
              Continue
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (step === "voice-choice") {
    return (
      <main className="min-h-dvh bg-[#0b1220] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          <header className="text-center mb-10">
            <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-white/10 grid place-items-center">
              <span className="text-xl">🎙️</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Choose your voice
            </h1>
            <p className="text-white/70 mt-2">How should {agentName || "I"} sound when speaking?</p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {VOICE_OPTIONS.map((voice) => {
              const active = voiceId === voice.id;
              const canPreview = voice.id !== 'later';
              
              return (
                <div
                  key={voice.id}
                  className={[
                    "rounded-2xl border p-4 text-left transition",
                    "bg-white/5 border-white/10",
                    active ? "ring-2 ring-indigo-400 border-indigo-400" : "",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => setVoiceId(voice.id)}
                    className="w-full text-left"
                    aria-pressed={active}
                  >
                    <div className="font-medium mb-1">{voice.name}</div>
                    <div className="text-sm text-white/70">{voice.description}</div>
                  </button>
                  
                  {canPreview && (
                    <div className="mt-3 space-y-2">
                      <button
                        type="button"
                        onClick={() => handlePreview(voice.id)}
                        disabled={previewing === voice.id}
                        className="w-full px-3 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
                      >
                        {previewing === voice.id ? 'Previewing...' : 'Preview'}
                      </button>
                      
                      {previewAudio && voiceId === voice.id && (
                        <VoicePlayer 
                          src={previewAudio} 
                          className="w-full"
                          onEnd={() => setPreviewAudio(null)}
                        />
                      )}
                      
                      {previewError && voiceId === voice.id && (
                        <p className="text-xs text-orange-400">
                          {previewError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("agent-name")}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20 font-medium"
            >
              Back
            </button>
            <span className={["text-sm", canContinueVoice ? "text-white/60" : "text-red-300"].join(" ")}>
              {canContinueVoice ? "Ready." : "Choose a voice option."}
            </span>
            <button
              type="button"
              onClick={() => setStep("confirm")}
              disabled={!canContinueVoice}
              className={[
                "inline-flex items-center justify-center rounded-xl px-4 py-2",
                "bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50",
                "font-medium",
              ].join(" ")}
            >
              Continue
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Confirm step
  return (
    <main className="min-h-dvh bg-[#0b1220] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-10">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-white/10 grid place-items-center">
            <span className="text-xl">✅</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            All set!
          </h1>
          <p className="text-white/70 mt-2">Review your choices before we begin.</p>
        </header>

        <div className="space-y-4 mb-8">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-medium mb-2">Guide</h3>
            <p className="text-white/70">{PERSONAS[persona!].title} • {PERSONAS[persona!].blurb}</p>
          </div>
          
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-medium mb-2">Agent Name</h3>
            <p className="text-white/70">{agentName || "Not set"}</p>
          </div>
          
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h3 className="font-medium mb-2">Voice</h3>
            <p className="text-white/70">
              {VOICE_OPTIONS.find(v => v.id === voiceId)?.name || "Not selected"}
            </p>
          </div>
          
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={ttsEnabled}
                onChange={(e) => setTtsEnabled(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
              />
              <span className="font-medium">Speak replies aloud</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep("voice-choice")}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20 font-medium"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={submitting}
            className={[
              "inline-flex items-center justify-center rounded-xl px-6 py-2",
              "bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50",
              "font-medium",
            ].join(" ")}
          >
            {submitting ? "Setting up…" : "Continue to Oracle"}
          </button>
        </div>

        <footer className="mt-10 text-center">
          <p className="text-xs text-white/50">You can change any of these settings later.</p>
        </footer>
      </div>
    </main>
  );
}