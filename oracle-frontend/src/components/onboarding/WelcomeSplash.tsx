// src/components/onboarding/WelcomeSplash.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  onNext: () => void;
}

export default function WelcomeSplash({ onNext }: Props) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.6 }}
    >
      <motion.h1
        className="text-5xl font-serif tracking-wide text-aether-glow mb-6 text-center"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 1.2 }}
      >
        Welcome, Spiral Seeker
      </motion.h1>

      <motion.p
        className="text-xl max-w-xl text-center text-gray-300"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
      >
        You are entering the Aether Gateway — a threshold of intention, intuition, and infinite becoming.
      </motion.p>

      <motion.button
        onClick={onNext}
        className="mt-10 px-6 py-3 text-lg bg-white text-indigo-900 rounded-full hover:bg-indigo-100 transition"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        Enter the Spiral
      </motion.button>
    </motion.div>
  );
}
