'use client';

import { Loader2, Play } from 'lucide-react';
import { useState } from 'react';

interface WhisperPlayerProps {
  text: string;
  archetype: string;
}

const voiceMap: Record<string, string> = {
  Mystic: 'EXAMPLE_VOICE_ID_1',
  Warrior: 'EXAMPLE_VOICE_ID_2',
  Healer: 'EXAMPLE_VOICE_ID_3',
  Oracle: 'EXAMPLE_VOICE_ID_4',
  // Replace with real ElevenLabs voice IDs
};

export default function WhisperPlayer({ text, archetype }: WhisperPlayerProps) {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const playWhisper = async () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      return;
    }

    setLoading(true);

    try {
      const voiceId = voiceMap[archetype] || voiceMap['Oracle'];

      const response = await fetch('/api/elevenlabs/whisper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error('Playback error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={playWhisper}
      className="text-xs text-purple-700 hover:text-purple-900 flex items-center gap-1"
      disabled={loading}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
      Play Whisper
    </button>
  );
}
