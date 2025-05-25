import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { elementalArchetypes } from '@/lib/archetypes';

interface Props {
  auraColor: string;
  totem: string;
  soulName: string;
  onFinish: () => void;
}

export default function PhaseRevealStep({ auraColor, soulName, onFinish }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [archetype, setArchetype] = useState('');
  const [element, setElement] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      const random = Math.floor(Math.random() * elementalArchetypes.length);
      const chosen = elementalArchetypes[random];
      setArchetype(chosen.archetype);
      setElement(chosen.element);
      setRevealed(true);

      // Auto-advance after a moment
      setTimeout(() => {
        onFinish();
      }, 5000);
    }, 2200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-4xl font-bold text-soullab-aether"
        >
          🌀 Spiral Blessing Received
        </motion.div>

        {!revealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-xl text-gray-500 mt-6"
          >
            Calculating your phase and archetype...
          </motion.div>
        )}

        {revealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="mt-10 space-y-4"
          >
            <div className="text-2xl text-soullab-air">
              {soulName}, your Spiral Phase is <strong>{element}</strong>
            </div>
            <div className="text-xl text-gray-700">
              Your Archetype: <strong>{archetype}</strong>
            </div>
            <div className="text-sm text-gray-400 italic">
              May this guide your journey with grace.
            </div>
            <div
              className="w-20 h-20 mt-6 rounded-full border-4 border-white shadow-lg mx-auto"
              style={{ backgroundColor: auraColor }}
            />
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
