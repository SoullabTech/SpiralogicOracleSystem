import React, { useEffect, useState } from 'react';

const wisdomTransmissions = [
  'The forge refines you, not to destroy, but to reveal your true form.',
  'Surrender to the river. What you release returns as life renewed.',
  'The unseen roots anchor the future you are becoming.',
  'Breath carries the seeds of new worlds across hidden thresholds.',
  'What fractures is often the shell of something luminous awakening.',
  'The Spiral carries you forward even when your path feels unseen.',
];

export default function WisdomTransmission() {
  const [showTransmission, setShowTransmission] = useState(false);
  const [transmission, setTransmission] = useState<string | null>(null);

  useEffect(() => {
    const shouldShow = Math.random() < 0.25; // 25% chance
    if (shouldShow) {
      const randomTransmission =
        wisdomTransmissions[Math.floor(Math.random() * wisdomTransmissions.length)];
      setTransmission(randomTransmission);
      setShowTransmission(true);
    }
  }, []);

  if (!showTransmission || !transmission) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white/90 p-6 rounded-2xl shadow-2xl max-w-md w-full text-center animate-fade-in-slow">
        <h2 className="text-2xl font-soullab text-soullab-aether mb-4">✨ Wisdom Transmission</h2>
        <p className="text-lg text-soullab-earth mb-8 italic">{transmission}</p>
        <button
          onClick={() => setShowTransmission(false)}
          className="bg-soullab-gold hover:bg-soullab-fire text-white font-semibold py-2 px-8 rounded-xl shadow-lg transition-all duration-300"
        >
          🌀 Continue
        </button>
      </div>
    </div>
  );
}
