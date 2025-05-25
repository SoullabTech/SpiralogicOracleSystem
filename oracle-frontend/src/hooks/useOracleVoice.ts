// src/hooks/useOracleChat.ts

'use client';

import { useState } from 'react';

export type Message = {
  sender: 'user' | 'oracle';
  content: string;
};

export type VoiceData = {
  text: string;
  emotion: string;
  element: string;
  phase: number;
};

export function useOracleChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [element, setElement] = useState('fire');
  const [phase, setPhase] = useState(0);
  const [emotion, setEmotion] = useState('neutral');

  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [autoSendEnabled, setAutoSendEnabled] = useState(true);
  const [memoryLoggingEnabled, setMemoryLoggingEnabled] = useState(true);

  const handleSend = async (
    text: string,
    detectedElement?: string,
    detectedPhase?: number,
    emotionOverride?: string,
  ) => {
    const userMessage = text.trim();
    if (!userMessage) return;

    const usedElement = detectedElement || element;
    const usedPhase = detectedPhase ?? phase;
    const usedEmotion = emotionOverride || emotion;

    // Log user message
    setMessages((prev) => [...prev, { sender: 'user', content: userMessage }]);

    // Fetch Oracle response
    const response = await fetch('/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: userMessage,
        element: usedElement,
        phase: usedPhase,
        emotion: usedEmotion,
        mode: 'oracle',
      }),
    });

    const data = await response.json();
    const oracleResponse = data?.response || 'The Oracle is silent...';

    // Add oracle message
    setMessages((prev) => [...prev, { sender: 'oracle', content: oracleResponse }]);

    // TTS Playback
    if (ttsEnabled && typeof window !== 'undefined') {
      try {
        const ttsRes = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: oracleResponse, emotion: usedEmotion }),
        });

        const audioBlob = await ttsRes.blob();
        const audioURL = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioURL);
        audio.play();
      } catch (error) {
        console.error('TTS failed, falling back to browser:', error);
        const fallback = new SpeechSynthesisUtterance(oracleResponse);
        fallback.lang = 'en-US';
        window.speechSynthesis.speak(fallback);
      }
    }

    // Memory Logging
    if (memoryLoggingEnabled) {
      await fetch('/api/memory/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage,
          response: oracleResponse,
          emotion: usedEmotion,
          element: usedElement,
          phase: usedPhase,
        }),
      });
    }

    setInput('');
  };

  return {
    input,
    setInput,
    messages,
    setMessages,
    element,
    setElement,
    phase,
    setPhase,
    emotion,
    setEmotion,
    ttsEnabled,
    setTtsEnabled,
    autoSendEnabled,
    setAutoSendEnabled,
    memoryLoggingEnabled,
    setMemoryLoggingEnabled,
    handleSend,
  };
}
