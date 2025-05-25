// src/components/onboarding/ColorPickStep.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  selected: string;
  setSelected: (color: string) => void;
  onNext: () => void;
}

const colors = [
  { name: 'Crimson Flame', value: '#D72638' },
  { name: 'Ocean Dream', value: '#3F88C5' },
  { name: 'Sun Aura', value: '#FFBA08' },
  { name: 'Emerald Calm', value: '#4CAF50' },
  { name: 'Mystic Violet', value: '#6A0DAD' },
];

export default function ColorPickStep({ selected, setSelected, onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="text-center space-y-8"
    >
      <h2 className="text-2xl font-semibold">🌈 Choose Your Aura</h2>
      <p className="text-gray-600 max-w-md mx-auto">
        Each aura color represents your energetic field. Choose the one that resonates most deeply.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        {colors.map(({ name, value }) => (
          <button
            key={name}
            className={`w-20 h-20 rounded-full border-4 transition ${
              selected === value ? 'border-white shadow-xl scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: value }}
            onClick={() => setSelected(value)}
            title={name}
          />
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!selected}
        className={`mt-6 px-6 py-3 rounded-full font-bold transition ${
          selected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Next
      </button>
    </motion.div>
  );
}
