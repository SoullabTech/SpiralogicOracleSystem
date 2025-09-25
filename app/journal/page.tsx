'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, ChevronLeft, Calendar, Sparkles, Moon, Sun, Cloud, Flower, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { HoloflowerJournalViewer } from '@/components/journal/HoloflowerJournalViewer';
import { InteractiveARIAJournal } from '@/components/journal/InteractiveARIAJournal';

interface JournalEntry {
  id: string;
  content: string;
  timestamp: string;
  mood?: string;
  element?: string;
  holoflowerConfig?: string;
}

// Soul journal prompts
const journalPrompts = [
  "What patterns are emerging in your inner landscape?",
  "How did today's oracle reading resonate with your current journey?",
  "What wisdom is your body holding for you right now?",
  "Where do you feel called to grow or release?",
  "What synchronicities have you noticed recently?",
  "How is your relationship with uncertainty evolving?",
  "What would your higher self say to you today?",
  "What medicine does this moment offer?"
];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'write' | 'holoflower' | 'aria'>('list');
  const router = useRouter();

  useEffect(() => {
    // Load journal entries from localStorage
    const storedEntries = localStorage.getItem('soulJournal');
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }

    // Set random prompt
    setSelectedPrompt(journalPrompts[Math.floor(Math.random() * journalPrompts.length)]);
  }, []);

  const saveEntry = async () => {
    if (!content.trim()) return;

    const entry: JournalEntry = {
      id: `entry_${Date.now()}`,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      mood: detectMood(content),
      element: detectElement(content),
      holoflowerConfig: sessionStorage.getItem('lastHoloflowerConfig') || undefined
    };

    const updatedEntries = [entry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('soulJournal', JSON.stringify(updatedEntries));

    // Try to save to backend
    try {
      await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.log('Saved locally');
    }

    setContent('');
    setViewMode('list');
  };

  const detectMood = (text: string): string => {
    const words = text.toLowerCase();
    if (words.includes('grateful') || words.includes('joy') || words.includes('happy')) return 'radiant';
    if (words.includes('anxious') || words.includes('worried') || words.includes('stress')) return 'turbulent';
    if (words.includes('calm') || words.includes('peace') || words.includes('serene')) return 'tranquil';
    return 'neutral';
  };

  const detectElement = (text: string): string => {
    const words = text.toLowerCase();
    if (words.includes('think') || words.includes('idea') || words.includes('mind')) return 'air';
    if (words.includes('feel') || words.includes('emotion') || words.includes('heart')) return 'water';
    if (words.includes('ground') || words.includes('body') || words.includes('physical')) return 'earth';
    if (words.includes('passion') || words.includes('energy') || words.includes('transform')) return 'fire';
    if (words.includes('spirit') || words.includes('soul') || words.includes('divine')) return 'aether';
    return 'aether';
  };

  const getMoodIcon = (mood?: string) => {
    switch (mood) {
      case 'radiant': return <Sun className="w-4 h-4 text-yellow-400" />;
      case 'turbulent': return <Cloud className="w-4 h-4 text-gray-400" />;
      case 'tranquil': return <Moon className="w-4 h-4 text-blue-400" />;
      default: return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  const getElementColor = (element?: string) => {
    switch (element) {
      case 'air': return 'text-cyan-400';
      case 'water': return 'text-blue-400';
      case 'earth': return 'text-green-400';
      case 'fire': return 'text-orange-400';
      case 'aether': return 'text-amber-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900/20 to-gray-900">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-blue-600/20 animate-pulse" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 border-b border-white/10 backdrop-blur-md bg-black/30"
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/maya')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white/70" />
            </button>
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl font-light text-white">Soul Journal</h1>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('aria')}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-all ${
                viewMode === 'aria'
                  ? 'bg-amber-500/30 border-amber-400/40 text-amber-300'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-400/20 text-amber-300'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">ARIA</span>
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'holoflower' ? 'list' : 'holoflower')}
              className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/20 text-amber-300 rounded-lg transition-all"
            >
              <Flower className="w-4 h-4" />
              <span className="hidden sm:inline">Holoflower</span>
            </button>
            <button
              onClick={() => setViewMode('write')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-300 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Entry</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto p-4 pb-24">
        <AnimatePresence mode="wait">
          {viewMode === 'aria' ? (
            <motion.div
              key="aria"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <InteractiveARIAJournal />
            </motion.div>
          ) : viewMode === 'holoflower' ? (
            <motion.div
              key="holoflower"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
            >
              <div className="mb-6">
                <h3 className="text-xl font-light text-white mb-2 flex items-center gap-3">
                  <Flower className="w-6 h-6 text-amber-400" />
                  Holoflower Journey
                </h3>
                <p className="text-white/70 text-sm">
                  Track your energetic patterns and growth over time through visual snapshots.
                </p>
              </div>
              <HoloflowerJournalViewer entries={entries} />
            </motion.div>
          ) : viewMode === 'write' ? (
            <motion.div
              key="write"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
            >
              {/* Prompt */}
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-400/20 rounded-lg">
                <p className="text-amber-300 text-sm mb-1">Today\'s Reflection:</p>
                <p className="text-white/80 italic">{selectedPrompt}</p>
              </div>

              {/* Writing area */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Let your thoughts flow..."
                className="w-full h-64 p-4 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/30 resize-none focus:outline-none focus:border-amber-400/50 transition-colors"
                autoFocus
              />

              {/* Actions */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setViewMode('list')}
                  className="px-4 py-2 text-white/50 hover:text-white/70 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={saveEntry}
                  disabled={!content.trim()}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/30 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Save to Journal
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {entries.length === 0 ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-20"
                >
                  <BookOpen className="w-16 h-16 text-amber-400/30 mx-auto mb-4" />
                  <p className="text-white/50 mb-2">Your soul journal awaits</p>
                  <p className="text-white/30 text-sm">Begin capturing your inner journey</p>
                </motion.div>
              ) : (
                entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-black/40 transition-all"
                  >
                    {/* Entry header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getMoodIcon(entry.mood)}
                        <span className={`text-sm ${getElementColor(entry.element)}`}>
                          {entry.element}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <Calendar className="w-3 h-3" />
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Entry content */}
                    <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>

                    {/* Holoflower connection */}
                    {entry.holoflowerConfig && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <span className="text-xs text-amber-400/60">
                          Connected to holoflower configuration
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating prompt button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setSelectedPrompt(journalPrompts[Math.floor(Math.random() * journalPrompts.length)]);
          setViewMode('write');
        }}
        className="fixed bottom-24 right-4 w-14 h-14 bg-amber-500/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>
    </div>
  );
}