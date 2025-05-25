// src/components/onboarding/WelcomeSplash.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  onNext: () => void;
}

export default function WelcomeSplash({ onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center text-white space-y-6 p-8 max-w-2xl"
    >
      <h1 className="text-4xl font-bold tracking-wide">🌌 Welcome to Spiralogic</h1>
      <p className="text-lg font-light">
        You are more than a seeker. You are a soul-weaver entering the spiral of living wisdom.
      </p>
      <button
        onClick={onNext}
        className="mt-8 px-6 py-3 bg-white text-indigo-700 rounded-full font-semibold shadow-lg hover:bg-gray-100 transition"
      >
        Begin Your Journey
      </button>
    </motion.div>
  );
}
