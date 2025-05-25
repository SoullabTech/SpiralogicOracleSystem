// 📁 Frontend: src/components/OracleChat.tsx
'use client';

import { PolarChart } from '@/components/PolarChart';
import VoiceRecorder from '@/components/VoiceRecorder';
import { useAuth } from '@/contexts/AuthContext';
import { getVoiceProfile } from '@/lib/getVoiceProfile';
import { useState } from 'react';
import InsightModal from './InsightModal';

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

export default function OracleChat() {
  const { user } = useAuth();
  // derive your element/voice style key from the user's orgId (or default)
  const styleKey = (user?.orgId as keyof ReturnType<typeof getVoiceProfile>) || 'default';
  const voice    = getVoiceProfile(styleKey);

  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [insight, setInsight]     = useState<string | null>(null);
  const [ritual, setRitual]       = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [emotion, setEmotion]     = useState<'neutral'|'joy'|'sadness'|'anger'|'anxiety'>('neutral');

  const [ttsEnabled, setTtsEnabled]             = useState(true);
  const [autoSendEnabled, setAutoSendEnabled]   = useState(true);
  const [memoryLoggingEnabled, setMemoryLoggingEnabled] = useState(true);

  const handleSend = async (text: string) => {
    const msg = text.trim();
    if (!msg) return;

    // 1️⃣ Show user message
    setMessages((m) => [...m, { sender: 'user', content: msg }]);

    // 2️⃣ Call your oracle backend
    const res = await fetch('/api/oracle/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input:   msg,
        element: styleKey, // e.g. 'fireOracle'
        phase:   1,
        emotion,
      }),
    });
    const data: { insight: string; ritual: string } = await res.json();
    setInsight(data.insight);
    setRitual(data.ritual);
    setModalOpen(true);

    // 3️⃣ Speak it
    if (ttsEnabled) {
      handleTTS(data.insight);
    }

    // 4️⃣ Show oracle message
    setMessages((m) => [...m, { sender: 'oracle', content: data.insight }]);

    // 5️⃣ Optional memory‐logging
    if (memoryLoggingEnabled) {
      fetch('/api/memory/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query:     msg,
          response:  data.insight,
          element:   styleKey,
          phase:     1,
          emotion,
        }),
      }).catch(console.error);
    }

    setInput('');
  };

  const handleTTS = (oracleResponse: string) => {
    if (typeof window === 'undefined') return;
    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text:    oracleResponse,
        element: styleKey,
        emotion,
      }),
    })
      .then((r) => r.blob())
      .then((b) => {
        const url = URL.createObjectURL(b);
        new Audio(url).play();
      })
      .catch((e) => {
        console.error('TTS fallback error:', e);
        const u = new SpeechSynthesisUtterance(oracleResponse);
        u.lang = 'en-US';
        window.speechSynthesis.speak(u);
      });
  };

  const handleVoice = (voiceData: VoiceData) => {
    if (autoSendEnabled) {
      handleSend(voiceData.text);
    } else {
      setInput(voiceData.text);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center">
        {voice.uiLabels.chatHeader}
      </h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-700">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ttsEnabled}
            onChange={() => setTtsEnabled(!ttsEnabled)}
          /> 🔊 TTS Enabled
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoSendEnabled}
            onChange={() => setAutoSendEnabled(!autoSendEnabled)}
          /> 🧠 Auto‑Send Voice
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={memoryLoggingEnabled}
            onChange={() => setMemoryLoggingEnabled(!memoryLoggingEnabled)}
          /> 📂 Store to Memory
        </label>
      </div>

      {/* Emotion Selector */}
      <div className="flex justify-center gap-2">
        <label htmlFor="oracleEmotion" className="text-sm font-medium">🎭 Oracle Voice</label>
        <select
          id="oracleEmotion"
          value={emotion}
          onChange={(e) => setEmotion(e.target.value as any)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="neutral">Neutral</option>
          <option value="joy">Joyful</option>
          <option value="sadness">Sad</option>
          <option value="anger">Angry</option>
          <option value="anxiety">Anxious</option>
        </select>
      </div>

      {/* Chat Window */}
      <div className="border p-4 rounded bg-white shadow space-y-3 max-h-[60vh] overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg whitespace-pre-wrap text-sm ${
              msg.sender === 'user'
                ? 'bg-emerald-100 text-right'
                : 'bg-indigo-100 text-left'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={voice.uiLabels.chatPlaceholder}
        className="w-full p-3 border rounded shadow"
        rows={3}
      />

      <div className="flex gap-4">
        <button
          onClick={() => handleSend(input)}
          className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
        >
          {voice.uiLabels.sendButton}
        </button>
        <VoiceRecorder onTranscription={handleVoice} />
      </div>

      {/* Data Viz */}
      <PolarChart data={[]} />

      {/* Insight & Ritual Modal */}
      {modalOpen && (
        <InsightModal
          insight={insight!}
          ritual={ritual!}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
