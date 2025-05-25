import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  selected: string;
  onSelect: (totem: string) => void;
}

const totems = [
  { id: 'phoenix', name: 'Phoenix', symbol: '🕊️', element: 'Fire', meaning: 'Rebirth & Courage' },
  { id: 'whale', name: 'Whale', symbol: '🐋', element: 'Water', meaning: 'Depth & Intuition' },
  { id: 'stag', name: 'Stag', symbol: '🦌', element: 'Earth', meaning: 'Rooted Wisdom' },
  { id: 'owl', name: 'Owl', symbol: '🦉', element: 'Air', meaning: 'Perception & Mystery' },
];

export default function TotemPickStep({ selected, onSelect }: Props) {
  const handlePick = (id: string) => {
    onSelect(id);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center bg-gradient-to-b from-black to-gray-900 text-white">
      <motion.h2
        className="text-3xl font-bold mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Choose Your Totem
      </motion.h2>
      <p className="text-sm text-gray-400 mb-8 max-w-sm">
        A symbol that guides your journey. Each totem channels a different archetypal energy.
      </p>
      <div className="grid grid-cols-2 gap-6 max-w-md">
        {totems.map((t) => (
          <motion.div
            key={t.id}
            onClick={() => handlePick(t.id)}
            className={`border-2 rounded-xl p-6 cursor-pointer shadow-lg transition-transform duration-300 ${
              selected === t.id ? 'border-white scale-105 shadow-xl' : 'border-transparent hover:scale-105'
            }`}
            whileHover={{ scale: 1.1 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-4xl mb-2">{t.symbol}</div>
            <div className="font-semibold text-lg">{t.name}</div>
            <div className="text-xs text-gray-400">{t.meaning}</div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => selected && onSelect(selected)}
        disabled={!selected}
        className={`mt-8 px-6 py-3 rounded-full font-bold transition ${
          selected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Next
      </button>
    </div>
  );
}
