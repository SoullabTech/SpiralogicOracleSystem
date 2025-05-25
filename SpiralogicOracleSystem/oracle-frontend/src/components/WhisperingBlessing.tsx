import React, { useEffect, useState } from 'react';

const blessings = [
  '🕊️ Your breath is your prayer today.',
  '🌿 Trust the Spiral even when it turns inward.',
  '🔮 A small act today will weave a great destiny tomorrow.',
  '🌟 Listen closely — your soul is speaking.',
  '🍃 Every threshold crossed shapes a new world within you.',
  '🌸 Gratitude opens hidden gateways.',
  '🌀 The Spiral remembers even when you forget.',
];

export default function WhisperingBlessing() {
  const [showBlessing, setShowBlessing] = useState(false);
  const [blessing, setBlessing] = useState<string | null>(null);

  useEffect(() => {
    const shouldShow = Math.random() < 0.3; // 30% chance to show blessing on load
    if (shouldShow) {
      const randomBlessing = blessings[Math.floor(Math.random() * blessings.length)];
      setBlessing(randomBlessing);
      setShowBlessing(true);
    }
  }, []);

  if (!showBlessing || !blessing) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white/90 p-6 rounded-2xl shadow-2xl max-w-md w-full text-center animate-fade-in-slow">
        <h2 className="text-2xl font-soullab text-soullab-aether mb-4">
          ✨ Whisper from Your Oracle
        </h2>
        <p className="text-lg text-soullab-earth mb-8 italic">{blessing}</p>
        <button
          onClick={() => setShowBlessing(false)}
          className="bg-soullab-gold hover:bg-soullab-fire text-white font-semibold py-2 px-8 rounded-xl shadow-lg transition-all duration-300"
        >
          🌀 Continue
        </button>
      </div>
    </div>
  );
}
