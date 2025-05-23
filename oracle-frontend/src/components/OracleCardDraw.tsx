// /components/OracleCardDraw.tsx
import { useState } from 'react';

const invocationDeck = [
  { name: 'The Phoenix', symbol: '🔥', meaning: 'Rebirth through fire. What must be surrendered to begin again?' },
  { name: 'The Chalice', symbol: '💧', meaning: 'Emotional truth flows when the heart is soft.' },
  { name: 'The Stone', symbol: '🌿', meaning: 'Ground your vision in form. What structure wants to emerge?' },
  { name: 'The Feather', symbol: '🌬️', meaning: 'Speak clearly. Your voice carries the current of change.' },
  { name: 'The Spiral', symbol: '✨', meaning: 'You are returning to wholeness. Integration is sacred work.' }
];

export default function OracleCardDraw() {
  const [drawn, setDrawn] = useState<null | number>(null);

  const drawCard = () => {
    const index = Math.floor(Math.random() * invocationDeck.length);
    setDrawn(index);
  };

  const card = drawn !== null ? invocationDeck[drawn] : null;

  return (
    <div className="text-center space-y-6 py-10 px-4">
      <h2 className="text-2xl font-bold">🃏 Draw an Oracle Card</h2>
      <p className="text-sm text-gray-300">Let the symbol meet you where you are.</p>

      {card ? (
        <div className="bg-white/10 p-6 rounded-xl shadow border border-white/20 inline-block">
          <div className="text-5xl mb-2">{card.symbol}</div>
          <div className="text-xl font-medium">{card.name}</div>
          <div className="text-sm text-gray-200 mt-2">{card.meaning}</div>
          <button
            onClick={() => setDrawn(null)}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold"
          >
            Draw Again
          </button>
        </div>
      ) : (
        <button
          onClick={drawCard}
          className="bg-purple-600 hover:bg-purple-500 transition px-4 py-2 rounded-xl font-bold"
        >
          Draw Card
        </button>
      )}
    </div>
  );
}
