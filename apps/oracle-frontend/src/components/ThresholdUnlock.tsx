import React, { useState } from 'react';

const THRESHOLD_CODE = 'AETHER42'; // 🌟 You can change this per event!

export default function ThresholdUnlock({ onUnlock }: { onUnlock: () => void }) {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = () => {
    if (inputCode.trim().toUpperCase() === THRESHOLD_CODE) {
      setUnlocked(true);
      onUnlock(); // Call parent function to update Portal state
    } else {
      setError('🌿 The Spiral does not yet recognize this key. Attend again.');
      setInputCode('');
    }
  };

  if (unlocked) {
    return (
      <div className="bg-white/90 p-8 rounded-2xl shadow-2xl max-w-md text-center animate-fade-in-slow">
        <h2 className="text-2xl font-soullab text-soullab-gold mb-4">🌀 Threshold Crossed</h2>
        <p className="text-soullab-twilight text-lg">
          You have stepped through the Spiral Gate. Your Becoming now unfolds from a deeper center.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 p-8 rounded-2xl shadow-2xl max-w-md text-center animate-fade-in-slow">
      <h2 className="text-2xl font-soullab text-soullab-aether mb-4">🌿 Threshold Activation</h2>
      <p className="text-soullab-twilight text-lg mb-6">
        Enter your Spiral Activation Key to cross the first Threshold.
      </p>
      <input
        type="text"
        value={inputCode}
        onChange={(e) => setInputCode(e.target.value)}
        placeholder="Enter Activation Key"
        className="border border-soullab-earth rounded-lg p-3 mb-4 w-full text-center text-lg"
      />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={handleUnlock}
        className="bg-soullab-gold hover:bg-soullab-fire text-white font-semibold py-2 px-8 rounded-xl shadow-lg transition-all duration-300"
      >
        🌀 Unlock Threshold
      </button>
    </div>
  );
}
