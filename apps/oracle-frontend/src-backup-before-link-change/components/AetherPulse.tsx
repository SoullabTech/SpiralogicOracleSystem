'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface AetherPulseProps {
  elementsTouched: Set<string>; // e.g., Set(['Fire', 'Earth', 'Water', 'Air'])
}

export default function AetherPulse({ elementsTouched }: AetherPulseProps) {
  const harmony = elementsTouched.size >= 4;

  return (
    <div className="text-center mt-10">
      <AnimatePresence>
        {harmony && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: 'mirror',
            }}
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-300 via-pink-300 to-yellow-200 shadow-2xl flex items-center justify-center"
          >
            <motion.div
              className="w-10 h-10 bg-purple-700 rounded-full shadow-inner"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-4 text-sm text-purple-700 font-medium">
        {harmony
          ? '✨ Elemental Harmony Achieved'
          : 'Reflect in 4+ elements to activate Aether'}
      </p>
    </div>
  );
}
