'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, Save, Sparkles } from 'lucide-react';

interface BetaJournalProps {
  isOpen: boolean;
  onClose: () => void;
  explorerName?: string;
}

const journalPrompts = [
  "What insights emerged from today's conversation?",
  "How did Maia's perspective shift your understanding?",
  "What patterns are you noticing in your journey?",
  "What questions are alive for you right now?",
  "How has your inner landscape changed today?"
];

export default function BetaJournal({ isOpen, onClose, explorerName }: BetaJournalProps) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      // Save to localStorage for now (can integrate with Supabase later)
      const journalEntry = {
        id: Date.now().toString(),
        content: content.trim(),
        explorerName,
        timestamp: new Date().toISOString(),
        prompt: randomPrompt
      };

      const existingEntries = JSON.parse(localStorage.getItem('maya-journal') || '[]');
      existingEntries.push(journalEntry);
      localStorage.setItem('maya-journal', JSON.stringify(existingEntries));

      // Reset and close
      setContent('');
      onClose();
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-2xl w-full max-h-[85vh] bg-black/60 backdrop-blur-xl rounded-2xl border border-amber-500/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-black/60 backdrop-blur-xl p-6 border-b border-amber-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-extralight text-amber-50 tracking-wide">Reflection Journal</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-amber-200/60 hover:text-amber-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Prompt */}
              <div className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/10">
                <p className="text-xs uppercase tracking-wider text-amber-200/40 mb-2">Reflection Prompt</p>
                <p className="text-amber-50/80 italic">{randomPrompt}</p>
              </div>

              {/* Journal textarea */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-amber-200/40">
                  Your Reflection
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Let your thoughts flow..."
                  className="w-full h-64 px-4 py-3 bg-black/40 border border-amber-500/20 rounded-lg text-amber-50 placeholder-amber-200/20 focus:outline-none focus:border-amber-500/40 focus:bg-black/60 transition-all resize-none text-[16px]"
                  autoFocus
                />
              </div>

              {/* Word count */}
              <div className="text-amber-200/40 text-xs">
                {content.split(/\s+/).filter(Boolean).length} words
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-black/60 backdrop-blur-xl p-6 border-t border-amber-500/10">
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={!content.trim() || isSaving}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-light tracking-wide transition-all ${
                    content.trim() && !isSaving
                      ? 'bg-gradient-to-r from-amber-600/80 to-amber-500/80 hover:from-amber-600 hover:to-amber-500 text-black'
                      : 'bg-amber-600/20 text-amber-200/40 cursor-not-allowed'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      <span className="text-sm uppercase">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span className="text-sm uppercase">Save Reflection</span>
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-black/40 text-amber-200/60 rounded-lg hover:bg-black/60 border border-amber-500/10 transition-all text-sm uppercase font-light tracking-wide"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}