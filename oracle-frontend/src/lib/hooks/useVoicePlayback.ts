import { useCallback } from 'react';
import { playTextWithVoice } from '@/lib/elevenlabs';

const toneToVoiceMap: Record<string, string> = {
  mystic: 'anya',
  poetic: 'eleven_poet',
  direct: 'clarity_voice',
  nurturing: 'mother_tone',
};

export function useVoicePlayback() {
  const playVoice = useCallback((tone: string, text: string) => {
    const voiceId = toneToVoiceMap[tone] || 'anya';
    playTextWithVoice(voiceId, text);
  }, []);

  return { playVoice };
}
