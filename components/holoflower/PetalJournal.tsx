'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Mic, Save, X, Sparkles } from 'lucide-react';
import { useOracleJournal, usePetalInteractions } from '@/lib/hooks/useOracleData';
import { PetalVoicePreview } from '@/components/voice/PetalVoicePreview';
import type { Petal, Element } from '@/lib/types/oracle';

interface PetalJournalProps {
  isOpen: boolean;
  onClose: () => void;
  petal?: Petal;
  petalInteractionId?: string;
}

const journalPrompts: Record<Element, string[]> = {
  air: [
    "What new ideas are wanting to emerge through you?",
    "How can you create more space for inspiration today?",
    "What thoughts are ready to take flight?"
  ],
  fire: [
    "What passion is ready to ignite within you?",
    "How can you transform challenge into power?",
    "What needs to be burned away to reveal your truth?"
  ],
  water: [
    "What emotions are flowing through you right now?",
    "How can you honor your feelings as teachers?",
    "What wisdom lies in the depths of your heart?"
  ],
  earth: [
    "What foundations are you building in your life?",
    "How can you nurture your growth today?",
    "What seeds are you planting for the future?"
  ],
  aether: [
    "How are you bridging the earthly and the divine?",
    "What cosmic connections are you feeling?",
    "How does your soul want to express itself?"
  ]
};

export function PetalJournal({ isOpen, onClose, petal, petalInteractionId }: PetalJournalProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { saveJournalEntry } = useOracleJournal();
  const { trackInteraction } = usePetalInteractions();

  // Set prompt based on petal element
  useEffect(() => {
    if (petal && isOpen) {
      const prompts = journalPrompts[petal.element];
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      setCurrentPrompt(randomPrompt);
      setTitle(`${petal.element.charAt(0).toUpperCase() + petal.element.slice(1)} ${petal.number}: ${petal.name}`);
    }
  }, [petal, isOpen]);

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      // Track the petal interaction if we have a petal
      let interactionId = petalInteractionId;
      if (petal && !interactionId) {
        const interaction = await trackInteraction(petal, 'click', isVoiceActive);
        interactionId = interaction?.id;
      }

      // Save the journal entry
      await saveJournalEntry(
        content,
        'petal_reflection',
        {
          title,
          element: petal?.element,
          petalInteractionId: interactionId,
          voiceContext: currentPrompt,
          tags: petal ? [petal.element, petal.name] : []
        }
      );

      // Reset and close
      setContent('');
      setTitle('');
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
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-purple-950 to-indigo-950 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-purple-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-light text-white">Sacred Journal</h2>
              </div>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Petal context */}
            {petal && (
              <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: petal.color }}
                  />
                  <div>
                    <p className="text-white font-medium">{title}</p>
                    <p className="text-white/60 text-sm">{petal.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Journal prompt */}
            {currentPrompt && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-300 text-sm">Reflection Prompt</p>
                  <button
                    onClick={() => setIsVoiceActive(!isVoiceActive)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isVoiceActive 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-white/80 italic">{currentPrompt}</p>
                
                {isVoiceActive && (
                  <div className="mt-2">
                    <PetalVoicePreview
                      text={currentPrompt}
                      context="journal_prompt"
                      element={petal?.element || 'aether'}
                      autoPlay={true}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Title input */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your reflection a title..."
              className="w-full mb-4 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
            />

            {/* Journal textarea */}
            <div className="flex-1 mb-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Let your thoughts flow..."
                className="w-full h-full min-h-[200px] px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>

            {/* Word count */}
            <div className="text-white/40 text-sm mb-4">
              {content.split(/\s+/).filter(Boolean).length} words
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!content.trim() || isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg transition-colors"
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Reflection
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}