// components/settings/VoiceSelector.tsx
"use client";
import { features } from "@/lib/config/features";
import { useVoice } from "@/hooks/useVoice";
import { useState } from "react";

export function VoiceSelector({ onChange }: { onChange?: (v: { provider: string; id: string }) => void }) {
  const { selectionEnabled, voiceEnabled, choices, voice } = useVoice();
  const [provider, setProvider] = useState<"sesame" | "elevenlabs">(features.voice.provider as any);
  const [selected, setSelected] = useState(voice.id);

  // Hidden in beta unless selection is enabled
  if (!selectionEnabled || !voiceEnabled) return null;

  const handleProviderChange = (newProvider: "sesame" | "elevenlabs") => {
    setProvider(newProvider);
    // Determine voice ID based on provider
    const voiceId = newProvider === 'elevenlabs' ? 
      (process.env.ELEVENLABS_VOICE_ID ?? '') : 'maya';
    onChange?.({ provider: newProvider, id: voiceId });
  };

  const handleVoiceSelection = (choice: typeof choices[0]) => {
    setSelected(choice.id);
    onChange?.({ provider: choice.provider, id: choice.id });
  };

  return (
    <div className="border border-edge-700 rounded-xl p-3 bg-bg-900">
      {/* Provider Selection */}
      <div className="mb-4">
        <div className="text-ink-100 font-medium mb-2">Voice Provider</div>
        <select
          className="bg-bg-800 border border-edge-700 rounded-md px-2 py-1 text-ink-100 w-full"
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value as any)}
        >
          <option value="sesame">Maya (Sesame)</option>
          <option value="elevenlabs">ElevenLabs</option>
        </select>
      </div>

      {/* Voice Choices */}
      <div className="mb-3">
        <div className="text-ink-100 font-medium mb-2">Voice</div>
        <div className="flex gap-2 flex-wrap">
          {choices.map((c) => (
            <button
              key={`${c.provider}:${c.id}`}
              onClick={() => handleVoiceSelection(c)}
              className={`px-3 py-2 rounded-md border transition-colors ${
                selected === c.id ? 'border-gold-400 text-gold-400' : 'border-edge-700 text-ink-300 hover:border-ink-200'
              }`}
              title={c.label}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Message */}
      {choices.length === 1 ? (
        <p className="text-ink-300 text-sm">
          More voices coming soon.
        </p>
      ) : (
        <p className="text-ink-300 text-sm">
          In beta, voice selection is disabled by default. Flip flags to enable.
        </p>
      )}
    </div>
  );
}