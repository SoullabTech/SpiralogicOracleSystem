'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';

export default function BetaSignup() {
  const router = useRouter();
  const [entering, setEntering] = useState(false);

  const handleBegin = () => {
    setEntering(true);
    setTimeout(() => {
      router.push('/beta-entry');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#1a1f3a] flex items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center max-w-lg w-full"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="mb-12 flex justify-center"
        >
          <Holoflower size="xl" glowIntensity="high" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="space-y-6 mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extralight text-amber-50 tracking-wide">
            Welcome to the Future
          </h1>

          <p className="text-amber-200/70 text-lg font-light leading-relaxed">
            Thank you for being part of the Soullab beta.
          </p>

          <p className="text-amber-200/50 text-base font-light leading-relaxed max-w-md mx-auto">
            You&apos;re among the first to experience what meaningful AI conversation can become.
            The next few minutes will show you what makes this different.
          </p>
        </motion.div>

        <motion.button
          onClick={handleBegin}
          disabled={entering}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className={`px-12 py-4 rounded-full transition-all text-lg ${
            entering
              ? 'bg-amber-500/20 text-amber-200/40 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500/80 to-amber-600/80 text-white hover:from-amber-500 hover:to-amber-600 cursor-pointer'
          }`}
          whileHover={!entering ? { scale: 1.02 } : {}}
          whileTap={!entering ? { scale: 0.98 } : {}}
        >
          {entering ? 'Entering...' : 'Begin'}
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2, delay: 1.5 }}
          className="text-amber-200/20 text-xs mt-16 font-light tracking-wider"
        >
          Beta v1.0 · September 2025
        </motion.p>
      </motion.div>
    </div>
  );
}