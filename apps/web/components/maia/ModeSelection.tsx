'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Copy } from '@/lib/copy/MaiaCopy';
import { JournalingMode, JOURNALING_MODE_DESCRIPTIONS } from '@/lib/journaling/JournalingPrompts';
import { useMaiaStore } from '@/lib/maia/state';

export default function ModeSelection() {
  const setMode = useMaiaStore((state) => state.setMode);

  const modes: JournalingMode[] = ['free', 'dream', 'emotional', 'shadow', 'direction'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {Copy.introPrompt}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Choose a journaling mode to begin
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map((mode, index) => {
          const modeInfo = JOURNALING_MODE_DESCRIPTIONS[mode];
          return (
            <motion.button
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setMode(mode)}
              className="group relative p-6 rounded-2xl bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 hover:border-[#FFD700] dark:hover:border-[#FFD700] transition-all hover:shadow-lg hover:shadow-[#FFD700]/10 text-left"
            >
              <div className="flex items-start gap-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="text-4xl"
                >
                  {modeInfo.icon}
                </motion.div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-[#FFD700] transition-colors">
                    {modeInfo.name}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    {modeInfo.description}
                  </p>
                  <p className="text-xs italic text-neutral-500 dark:text-neutral-500">
                    "{modeInfo.prompt}"
                  </p>
                </div>
              </div>

              <motion.div
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#FFD700] to-amber-500"
              />
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-600"
      >
        Your words are private and sacred. MAIA reflects, never judges.
      </motion.div>
    </motion.div>
  );
}