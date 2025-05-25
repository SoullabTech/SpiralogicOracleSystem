'use client';

import { motion } from 'framer-motion';

export default function WelcomeOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white text-gray-900 rounded-xl p-8 shadow-2xl max-w-md text-center"
      >
        <h2 className="text-2xl font-bold mb-4">🌕 Oralia is with you</h2>
        <p className="text-sm mb-4">This space remembers. Begin when you are ready.</p>
        <button
          onClick={onClose}
          className="bg-soullab-indigo text-white px-4 py-2 rounded shadow"
        >
          Enter Portal
        </button>
      </motion.div>
    </motion.div>
  );
}
