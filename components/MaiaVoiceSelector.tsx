'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const OPENAI_VOICES = [
  {
    id: 'alloy',
    name: 'Alloy (Current)',
    description: 'Neutral, balanced - currently being used',
    personality: 'Professional, clear, moderate warmth'
  },
  {
    id: 'shimmer',
    name: 'Shimmer',
    description: 'Soft, gentle, nurturing',
    personality: 'RECOMMENDED: Warm, soulful, wisdom-keeper energy'
  },
  {
    id: 'nova',
    name: 'Nova',
    description: 'Lively, energetic, engaging',
    personality: 'Bright, encouraging, uplifting'
  },
  {
    id: 'fable',
    name: 'Fable',
    description: 'Warm, expressive, storytelling',
    personality: 'Rich, emotive, deep presence'
  },
  {
    id: 'echo',
    name: 'Echo',
    description: 'Male voice - calm, steady',
    personality: 'Grounded, supportive (male)'
  },
  {
    id: 'onyx',
    name: 'Onyx',
    description: 'Male voice - deep, authoritative',
    personality: 'Strong, wise (male)'
  }
];

export function MaiaVoiceSelector() {
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [isPlaying, setIsPlaying] = useState(false);
  const [testText] = useState("Hey there. I'm Maya. Good to connect with you. What's on your heart today?");

  const testVoice = async (voiceId: string) => {
    setIsPlaying(true);
    try {
      const response = await fetch('/api/voice/openai-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testText,
          voice: voiceId,
          speed: 0.95,
          model: 'tts-1-hd'
        })
      });

      if (!response.ok) throw new Error('Voice test failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Voice test error:', error);
      setIsPlaying(false);
    }
  };

  const saveVoiceSelection = async (voiceId: string) => {
    // Save to localStorage for now
    localStorage.setItem('maya_voice_preference', voiceId);
    setSelectedVoice(voiceId);

    // TODO: Save to user preferences in database
    console.log(`✅ Voice preference saved: ${voiceId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-light text-amber-50 mb-2">Maya Voice Selection</h2>
        <p className="text-amber-200/60">Choose the voice that feels right for Maya's presence</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OPENAI_VOICES.map((voice, index) => (
          <motion.div
            key={voice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border transition-all ${
              selectedVoice === voice.id
                ? 'border-amber-500/50 bg-amber-500/10'
                : 'border-white/10 bg-black/20 hover:border-white/20'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-medium text-white">{voice.name}</h3>
                <p className="text-sm text-white/60">{voice.description}</p>
              </div>
              {voice.id === 'shimmer' && (
                <span className="px-2 py-1 text-xs rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Recommended
                </span>
              )}
            </div>

            <p className="text-xs text-white/40 mb-3 italic">{voice.personality}</p>

            <div className="flex gap-2">
              <button
                onClick={() => testVoice(voice.id)}
                disabled={isPlaying}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30
                         text-blue-400 hover:bg-blue-500/30 transition-all disabled:opacity-50
                         disabled:cursor-not-allowed text-sm"
              >
                {isPlaying ? 'Playing...' : 'Test Voice'}
              </button>

              <button
                onClick={() => saveVoiceSelection(voice.id)}
                className={`flex-1 px-4 py-2 rounded-lg transition-all text-sm ${
                  selectedVoice === voice.id
                    ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {selectedVoice === voice.id ? 'Selected ✓' : 'Select'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg"
      >
        <h3 className="text-sm font-medium text-amber-400 mb-2">💡 Recommendation</h3>
        <p className="text-sm text-amber-200/80">
          Based on Maya's personality (soulful, warm, wise, grounded), we recommend <strong>Shimmer</strong>
          for her soft, gentle, nurturing quality. However, <strong>Fable</strong> is also excellent if you
          prefer more expressive, storytelling energy.
        </p>
        <p className="text-xs text-amber-200/60 mt-2">
          The current voice (Alloy) is quite neutral - it works, but doesn't capture Maya's unique presence.
        </p>
      </motion.div>

      <div className="mt-6 text-center">
        <a
          href="/maya"
          className="inline-block px-6 py-2 bg-amber-500/20 border border-amber-500/30
                   text-amber-400 rounded-lg hover:bg-amber-500/30 transition-all"
        >
          Back to Maya
        </a>
      </div>
    </div>
  );
}