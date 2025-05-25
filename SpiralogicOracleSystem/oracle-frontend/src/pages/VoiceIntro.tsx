// src/pages/VoiceIntro.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';
import { ElementalVoicePlayer } from '@/components/audio/ElementalVoicePlayer';

const greetings = [
  {
    element: 'Fire',
    text: 'Welcome, Visionary. Your spark lights the way forward.',
    voiceId: 'fire-voice-01',
  },
  {
    element: 'Water',
    text: 'Welcome, Mystic. Flow with intuition and depth.',
    voiceId: 'water-voice-01',
  },
  {
    element: 'Earth',
    text: 'Welcome, Steward. Root your presence in sacred form.',
    voiceId: 'earth-voice-01',
  },
  {
    element: 'Air',
    text: 'Welcome, Messenger. Speak truth through light and pattern.',
    voiceId: 'air-voice-01',
  },
  {
    element: 'Aether',
    text: 'Welcome, Oracle. Weave coherence through the cosmic spiral.',
    voiceId: 'aether-voice-01',
  },
];

export default function VoiceIntro() {
  const [index, setIndex] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setShowContinue(true), 6000);
    return () => clearTimeout(timer);
  }, [index]);

  const handleNext = () => {
    if (index < greetings.length - 1) {
      setIndex(index + 1);
      setShowContinue(false);
    } else {
      navigate('/dashboard');
    }
  };

  const current = greetings[index];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-black text-white p-8">
        <motion.h2
          className="text-3xl mb-4 font-bold text-soullab-aether"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {current.element} Invocation
        </motion.h2>

        <motion.p
          className="text-xl text-gray-300 mb-6 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          {current.text}
        </motion.p>

        <ElementalVoicePlayer voiceId={current.voiceId} />

        {showContinue && (
          <button
            onClick={handleNext}
            className="mt-10 px-6 py-3 rounded-full bg-soullab-fire text-white hover:bg-orange-600 transition"
          >
            {index < greetings.length - 1 ? 'Next Voice' : 'Enter the Spiral'}
          </button>
        )}
      </div>
    </PageTransition>
  );
}
