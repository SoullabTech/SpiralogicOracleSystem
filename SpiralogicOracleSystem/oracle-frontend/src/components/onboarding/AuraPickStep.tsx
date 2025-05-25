// src/components/onboarding/AuraPickStep.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const auraOptions = [
  { name: 'Radiant Ember', color: 'bg-gradient-to-br from-orange-500 to-red-600', emotion: 'Vitality', element: 'Fire' },
  { name: 'Celestial Mist', color: 'bg-gradient-to-br from-blue-400 to-indigo-600', emotion: 'Peace', element: 'Water' },
  { name: 'Verdant Glow', color: 'bg-gradient-to-br from-green-400 to-teal-600', emotion: 'Compassion', element: 'Earth' },
  { name: 'Solar Flare', color: 'bg-gradient-to-br from-yellow-300 to-pink-500', emotion: 'Joy', element: 'Air' },
];

export default function AuraPickStep({ onSelect }: { onSelect: (aura: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (name: string) => {
    setSelected(name);
    setTimeout(() => onSelect(name), 500); // Add delay to let animation play
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white bg-black px-4">
      <motion.h2
        className="text-3xl font-semibold mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Choose Your Aura
      </motion.h2>
      <motion.p
        className="text-center text-sm text-gray-400 mb-8 max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
      >
        Let your intuition guide you. Your aura shapes your ritual atmosphere and elemental alignment.
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
        {auraOptions.map((aura) => (
          <motion.div
            key={aura.name}
            onClick={() => handleSelect(aura.name)}
            className={`rounded-xl p-4 cursor-pointer border-2 transition-all duration-300 shadow-md hover:scale-105 ${
              aura.color
            } ${selected === aura.name ? 'ring-4 ring-white' : 'border-transparent'}`}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-lg font-bold">{aura.name}</div>
            <div className="text-sm italic">{aura.emotion} • {aura.element}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
