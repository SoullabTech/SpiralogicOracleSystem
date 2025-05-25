// oracle-frontend/lib/hooks/useElevenLabs.ts

import { useCallback } from 'react';

export function useElevenLabs(voiceId: string) {
  const speak = useCallback(async (text: string) => {
    try {
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceId, text }),
      });

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Voice playback error:', error);
    }
  }, [voiceId]);

  return { speak };
}
