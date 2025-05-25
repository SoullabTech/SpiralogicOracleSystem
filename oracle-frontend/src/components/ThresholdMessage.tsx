import React, { useEffect, useState } from 'react';

const thresholdMessages = [
  'The forge refines you, not to destroy, but to reveal.',
  'Surrender to the river that dissolves what clings.',
  'What roots you grows you. Tend to the unseen.',
  'The unseen breath carries new seeds across thresholds.',
  'What breaks is often the shell of the real becoming.',
  'The Spiral does not return you to where you began — it returns you to where you are.',
];

export default function ThresholdMessage() {
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const shouldShow = Math.random() < 0.25; // 25% chance — makes it rare and sacred
    if (shouldShow) {
      const randomMessage = thresholdMessages[Math.floor(Math.random() * thresholdMessages.length)];
      setMessage(randomMessage);
      setShowMessage(true);
    }
  }, []);

  if (!showMessage || !message) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white/90 p-6 rounded-2xl shadow-2xl max-w-md w-full text-center animate-fade-in-slow">
        <h2 className="text-2xl font-soullab text-soullab-aether mb-4">✨ Threshold Message</h2>
        <p className="text-lg text-soullab-earth mb-8 italic">{message}</p>
        <button
          onClick={() => setShowMessage(false)}
          className="bg-soullab-gold hover:bg-soullab-fire text-white font-semibold py-2 px-8 rounded-xl shadow-lg transition-all duration-300"
        >
          Continue My Journey 🌀
        </button>
      </div>
    </div>
  );
}
