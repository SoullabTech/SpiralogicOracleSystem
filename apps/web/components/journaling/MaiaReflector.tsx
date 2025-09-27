'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { JournalingMode } from '@/lib/journaling/JournalingPrompts';
import { Sparkles, Hash, Users, Heart, Lightbulb } from 'lucide-react';

interface MaiaReflectorProps {
  reflection: {
    symbols: string[];
    archetypes: string[];
    emotionalTone: string;
    reflection: string;
    prompt: string;
    closing: string;
    metadata?: Record<string, string>;
  };
  mode: JournalingMode;
  isProcessing?: boolean;
}

export default function MaiaReflector({ reflection, mode, isProcessing }: MaiaReflectorProps) {
  const modeColors = {
    free: 'from-cyan-500 to-blue-500',
    dream: 'from-purple-500 to-fuchsia-500',
    emotional: 'from-pink-500 to-rose-500',
    shadow: 'from-slate-600 to-neutral-700',
    direction: 'from-amber-500 to-orange-500'
  };

  const modeIcons = {
    free: '🌀',
    dream: '🔮',
    emotional: '💓',
    shadow: '🌓',
    direction: '🧭'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${modeColors[mode]} opacity-5 rounded-2xl`} />

      <div className="relative p-6 rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </motion.div>
          <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">
            MAIA Reflected
          </span>
          <span className="text-xl ml-auto">{modeIcons[mode]}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-start gap-2">
            <Hash className="w-4 h-4 text-neutral-500 dark:text-neutral-400 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Symbols
              </div>
              <div className="flex flex-wrap gap-1">
                {reflection.symbols.map((symbol, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  >
                    {symbol}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-neutral-500 dark:text-neutral-400 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Archetypes
              </div>
              <div className="flex flex-wrap gap-1">
                {reflection.archetypes.map((archetype, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                  >
                    {archetype}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Heart className="w-4 h-4 text-neutral-500 dark:text-neutral-400 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Emotional Tone
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">
                {reflection.emotionalTone}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full" />
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wide">
                Reflection
              </span>
            </div>
            <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed pl-3">
              {reflection.reflection}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border border-violet-200 dark:border-violet-800">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wide">
                Invitation
              </span>
            </div>
            <p className="text-sm text-violet-800 dark:text-violet-200 italic pl-6">
              {reflection.prompt}
            </p>
          </div>

          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
              {reflection.closing}
            </p>
          </div>

          {reflection.metadata && Object.keys(reflection.metadata).length > 0 && (
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
              <details className="cursor-pointer">
                <summary className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300">
                  Additional Insights
                </summary>
                <div className="mt-2 space-y-1 pl-3">
                  {Object.entries(reflection.metadata).map(([key, value]) => (
                    <div key={key} className="text-xs text-neutral-600 dark:text-neutral-400">
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${modeColors[mode]} rounded-full`}
      />
    </motion.div>
  );
}