'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, MessageCircle, ChevronRight, Edit3, Save, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { HoloflowerSnapshot, generateSnapshotDataURL } from './HoloflowerSnapshot';

interface HoloflowerJournalFlowProps {
  isOpen: boolean;
  onClose: () => void;
  checkInData?: any;
}

export function HoloflowerJournalFlow({ isOpen, onClose, checkInData }: HoloflowerJournalFlowProps) {
  const router = useRouter();
  const [journalEntry, setJournalEntry] = useState('');
  const [savedEntry, setSavedEntry] = useState(false);
  const [showingInsights, setShowingInsights] = useState(true);

  // Pre-populate journal with holoflower insights
  useEffect(() => {
    if (checkInData && isOpen) {
      const highElements = checkInData.facets.filter((f: any) => f.value > 7);
      const lowElements = checkInData.facets.filter((f: any) => f.value < 3);
      const balancedElements = checkInData.facets.filter((f: any) => f.value >= 5 && f.value <= 7);

      // Generate visual snapshot data URL
      const snapshotDataURL = generateSnapshotDataURL(checkInData.facets, checkInData.coherence);

      let prompt = `🌸 Today's Holoflower Reading (${new Date().toLocaleDateString()})\n\n`;
      prompt += `[HOLOFLOWER_SNAPSHOT:${snapshotDataURL}]\n\n`; // Embed snapshot

      if (highElements.length > 0) {
        prompt += `✨ Strong Energy in:\n`;
        highElements.forEach((f: any) => {
          prompt += `• ${f.name} (${f.element} ${f.phase}): ${f.value}/10\n`;
        });
        prompt += '\n';
      }

      if (balancedElements.length > 0) {
        prompt += `⚖️ Balanced Flow in:\n`;
        balancedElements.forEach((f: any) => {
          prompt += `• ${f.name}: ${f.value}/10\n`;
        });
        prompt += '\n';
      }

      if (lowElements.length > 0) {
        prompt += `🌱 Calling for Attention:\n`;
        lowElements.forEach((f: any) => {
          prompt += `• ${f.name} (${f.element}): ${f.value}/10\n`;
        });
        prompt += '\n';
      }

      prompt += `Overall Coherence: ${Math.round(checkInData.coherence * 100)}%\n`;
      prompt += `Field Signature: ${checkInData.signature}\n\n`;
      prompt += `💭 Reflections:\n`;
      prompt += `What patterns am I noticing?\n\n`;
      prompt += `What wants to shift?\n\n`;
      prompt += `What support do I need?\n\n`;

      setJournalEntry(prompt);
    }
  }, [checkInData, isOpen]);

  const handleSaveJournal = async () => {
    // Save journal entry
    const entry = {
      content: journalEntry,
      checkInData,
      timestamp: new Date().toISOString(),
      type: 'holoflower_reflection'
    };

    // Save to localStorage
    const existingJournal = JSON.parse(localStorage.getItem('sacredJournal') || '[]');
    existingJournal.push(entry);
    localStorage.setItem('sacredJournal', JSON.stringify(existingJournal));

    // Save for MAIA context
    sessionStorage.setItem('latestJournalEntry', JSON.stringify(entry));

    setSavedEntry(true);
    setTimeout(() => {
      setShowingInsights(false);
    }, 1500);
  };

  const handleChatWithMAIA = () => {
    // Pass journal context to MAIA
    const context = {
      journalEntry,
      checkInData,
      prompt: `Based on my holoflower check-in and journal reflection, I'd like guidance on...`
    };
    sessionStorage.setItem('maiaContext', JSON.stringify(context));

    onClose();
    router.push('/chat?context=holoflower_journal');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gradient-to-br from-black via-indigo-950 to-black rounded-3xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-amber-400" />
                  <h2 className="text-xl font-light text-white">Sacred Journal</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {showingInsights ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Holoflower Snapshot */}
                    {checkInData && (
                      <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                          <Camera className="w-5 h-5 text-amber-400" />
                          <h3 className="text-white font-medium">Your Holoflower Configuration</h3>
                        </div>
                        <div className="flex justify-center">
                          <HoloflowerSnapshot
                            facets={checkInData.facets}
                            coherence={checkInData.coherence}
                            timestamp={checkInData.timestamp}
                            size="medium"
                            showLabels={false}
                          />
                        </div>
                      </div>
                    )}

                    {/* Journal Entry Area */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-amber-300 text-sm">
                          Your holoflower insights have been captured. Add your reflections:
                        </p>
                        {!savedEntry && (
                          <button
                            onClick={handleSaveJournal}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-600/30 hover:bg-amber-600/50 text-white rounded-lg transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Save Entry
                          </button>
                        )}
                      </div>

                      <textarea
                        value={journalEntry}
                        onChange={(e) => setJournalEntry(e.target.value)}
                        className="w-full h-[400px] bg-white/5 border border-white/10 rounded-xl p-4 text-white/90 placeholder-white/40 resize-none focus:outline-none focus:border-amber-500/50"
                        placeholder="Reflect on your holoflower reading..."
                      />

                      {savedEntry && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-green-600/20 border border-green-600/40 rounded-lg"
                        >
                          <p className="text-green-300 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Journal entry saved successfully!
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full space-y-6"
                >
                  <div className="text-center space-y-4">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl"
                    >
                      🌸
                    </motion.div>
                    <h3 className="text-2xl font-light text-white">Journal Saved</h3>
                    <p className="text-white/70 max-w-md">
                      Your reflections have been captured. Would you like to explore
                      deeper insights with MAIA?
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      Finish
                    </button>
                    <button
                      onClick={handleChatWithMAIA}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Chat with MAIA
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer Guide */}
            {showingInsights && (
              <div className="p-4 border-t border-white/10 bg-amber-600/10">
                <div className="flex items-center gap-3 text-sm">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <p className="text-white/70">
                    This is your sacred space. Let your thoughts flow naturally.
                    Your journal entries help MAIA understand your journey better.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}