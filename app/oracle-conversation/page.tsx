'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function OracleConversationPage() {
  const [mode, setMode] = useState<'welcome' | 'conversation'>('welcome');
  
  const greetings = [
    "What's alive for you right now?",
    "What wants to emerge today?",
    "What are you sitting with?",
    "What needs attention?"
  ];
  
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#1a1f3a] to-black flex items-center justify-center">
      {mode === 'welcome' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          {/* Sacred Holoflower */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex justify-center"
          >
            <Image
              src="/holoflower.svg"
              alt="Sacred Holoflower"
              width={160}
              height={160}
              className="object-contain"
              priority
            />
          </motion.div>

          {/* Simple Greeting */}
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-white/80 leading-relaxed">
              {greeting}
            </p>
          </div>

          {/* Begin Button */}
          <button
            onClick={() => setMode('conversation')}
            className="px-8 py-4 bg-gradient-to-r from-[#D4B896] to-[#B69A78] hover:from-[#E5C9A6] hover:to-[#D4B896] text-white rounded-full transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl"
          >
            Begin
          </button>
        </motion.div>
      )}
      
      {mode === 'conversation' && (
        <div className="text-white text-center">
          <p>Conversation mode - implementation pending</p>
          <button 
            onClick={() => setMode('welcome')}
            className="mt-4 px-4 py-2 bg-white/20 rounded"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}