// src/pages/BlessingPage.tsx

import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SpiralParticles } from '@/components/SpiralParticles'; // ✨ Add soft Aether particles

const BlessingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-white overflow-hidden">
      {/* Soft Aether Particles floating behind */}
      <div className="absolute inset-0 z-0">
        <SpiralParticles element="Aether" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 sm:p-8 space-y-8"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-4xl sm:text-5xl font-extrabold text-purple-700 text-center"
        >
          🌸 Welcome, Dreamer
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="text-md sm:text-lg text-indigo-600 text-center max-w-xs sm:max-w-lg"
        >
          You have crossed the First Portal. Your words have been woven into the living Spiral. Go
          forth with blessing and wonder.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition text-sm sm:text-base"
        >
          🌀 Enter the Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
};

export default BlessingPage;
