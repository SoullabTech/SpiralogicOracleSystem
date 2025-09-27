'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { Copy } from '@/lib/copy/MaiaCopy';
import { useMaiaStore } from '@/lib/maia/state';
import { JOURNALING_MODE_DESCRIPTIONS } from '@/lib/journaling/JournalingPrompts';
import { getJournalingPrompt } from '@/lib/journaling/JournalingPrompts';

export default function JournalEntry() {
  const { selectedMode, currentEntry, setEntry, addEntry, setProcessing, isProcessing, resetEntry } = useMaiaStore();
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (currentEntry) {
      setWordCount(currentEntry.trim().split(/\s+/).filter(Boolean).length);
    } else {
      setWordCount(0);
    }
  }, [currentEntry]);

  const handleSubmit = async () => {
    if (!currentEntry.trim() || !selectedMode) return;

    setProcessing(true);

    try {
      const prompt = getJournalingPrompt(selectedMode, {
        mode: selectedMode,
        entry: currentEntry
      });

      const response = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          mode: selectedMode
        })
      });

      if (!response.ok) throw new Error('Failed to analyze');

      const reflection = await response.json();

      addEntry({
        id: Date.now().toString(),
        userId: 'current-user',
        mode: selectedMode,
        content: currentEntry,
        reflection,
        timestamp: new Date(),
        wordCount,
        isVoice: false
      });
    } catch (error) {
      console.error('Failed to submit entry:', error);
      setProcessing(false);
    }
  };

  if (!selectedMode) return null;

  const modeInfo = JOURNALING_MODE_DESCRIPTIONS[selectedMode];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={resetEntry}
          className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to modes</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-2xl">{modeInfo.icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {modeInfo.name}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              {wordCount} words
            </p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-4 p-4 rounded-xl bg-gradient-to-br from-[#FFD700]/10 to-amber-500/10 border border-[#FFD700]/30"
      >
        <p className="text-sm italic text-neutral-700 dark:text-neutral-300">
          {modeInfo.prompt}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        <textarea
          value={currentEntry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Begin writing..."
          className="w-full min-h-[400px] p-6 rounded-2xl bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 focus:border-[#FFD700] dark:focus:border-[#FFD700] focus:outline-none transition-colors resize-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
          autoFocus
        />

        <AnimatePresence>
          {currentEntry.trim() && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleSubmit}
              disabled={isProcessing}
              className="absolute bottom-6 right-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD700] to-amber-600 text-[#0A0E27] rounded-full font-semibold hover:shadow-lg hover:shadow-[#FFD700]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Reflecting...</span>
                </>
              ) : (
                <>
                  <span>{Copy.buttons.complete}</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 text-center text-xs text-neutral-500 dark:text-neutral-600"
      >
        Take your time. MAIA will reflect when you're ready.
      </motion.div>
    </motion.div>
  );
}