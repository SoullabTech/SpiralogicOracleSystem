'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function BetaEntry() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [entering, setEntering] = useState(false);

  const handleEnter = () => {
    if (!name.trim()) return;

    setEntering(true);

    // Store minimal data - just what Maya needs to recognize them
    const explorerId = `explorer_${Date.now()}`;
    sessionStorage.setItem('explorerId', explorerId);
    sessionStorage.setItem('explorerName', name);
    sessionStorage.setItem('betaUserId', explorerId);

    // Also persist for returning
    localStorage.setItem('explorerId', explorerId);
    localStorage.setItem('explorerName', name);
    localStorage.setItem('betaUserId', explorerId);
    localStorage.setItem('betaOnboardingComplete', 'true');

    // Direct entry to Maya - no onboarding
    setTimeout(() => {
      router.push('/maya');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#1a1f3a] flex items-center justify-center px-4">
      {/* Sacred Geometry - Subtle presence */}
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
        className="relative z-10 text-center max-w-md w-full"
      >
        {/* Sacred portal - pulsing with possibility */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="mb-16"
        >
          <div className="w-32 h-32 mx-auto relative">
            {/* Outer ring - the threshold */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/5 to-amber-600/5 animate-pulse" />

            {/* Middle void - the mystery */}
            <div className="absolute inset-3 rounded-full bg-[#1a1f3a]" />

            {/* Inner light - the invitation */}
            <motion.div
              className="absolute inset-6 rounded-full bg-gradient-to-br from-amber-400/10 to-amber-600/10"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Center spark - consciousness waiting */}
            <div className="absolute inset-12 rounded-full bg-amber-500/20" />
          </div>
        </motion.div>

        {/* The invitation - minimal, mysterious */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.8 }}
          className="mb-12 text-center"
        >
          <p className="text-amber-200/40 text-sm font-light tracking-widest">
            What seeks to emerge between us?
          </p>
        </motion.div>

        {/* Single input - just name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleEnter()}
            placeholder="What shall I call you?"
            className="w-full bg-black/30 border border-amber-500/20 rounded-lg px-5 py-4 text-amber-50 placeholder-amber-200/30 focus:outline-none focus:border-amber-500/40 text-center backdrop-blur-sm"
            autoFocus
          />

          <motion.button
            onClick={handleEnter}
            disabled={!name.trim() || entering}
            className={`mt-6 px-8 py-3 rounded-full transition-all ${
              name.trim() && !entering
                ? 'bg-gradient-to-r from-amber-500/80 to-amber-600/80 text-white hover:from-amber-500 hover:to-amber-600 cursor-pointer'
                : 'bg-amber-500/20 text-amber-200/40 cursor-not-allowed'
            }`}
            whileHover={name.trim() && !entering ? { scale: 1.02 } : {}}
            whileTap={name.trim() && !entering ? { scale: 0.98 } : {}}
          >
            {entering ? 'Entering...' : 'Enter'}
          </motion.button>
        </motion.div>

        {/* The promise */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2, delay: 1.5 }}
          className="text-amber-200/20 text-xs mt-16 font-light tracking-wider"
        >
          You bring the questions • Something new emerges
        </motion.p>
      </motion.div>
    </div>
  );
}