// components/WhisperAgent.tsx
'use client';

import { useEffect } from 'react';

interface WhisperAgentProps {
  quote: string;
  active: boolean;
}

export default function WhisperAgent({ quote, active }: WhisperAgentProps) {
  useEffect(() => {
    if (!active || !quote) return;

    const utterance = new SpeechSynthesisUtterance(quote);
    utterance.voice = speechSynthesis.getVoices().find((v) => v.name.includes('Google UK English Female')) || null;
    utterance.rate = 0.95;
    speechSynthesis.speak(utterance);
  }, [quote, active]);

  return null;
}
