'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalingMode, JOURNALING_MODE_DESCRIPTIONS } from '@/lib/journaling/JournalingPrompts';
import HybridInput from '@/components/chat/HybridInput';
import MaiaReflector from './MaiaReflector';
import FeatureDiscovery, { trackJournalEntry, trackShadowWork } from '@/components/onboarding/FeatureDiscovery';
import ContextualHelp from '@/components/onboarding/ContextualHelp';
import DemoMode from '@/components/onboarding/DemoMode';
import SoulfulAppShell, { useOnboardingStep } from '@/components/onboarding/SoulfulAppShell';
import JournalNavigation from './JournalNavigation';
import ExportButton from '@/components/export/ExportButton';
import { BookOpen, Sparkles } from 'lucide-react';

interface JournalEntry {
  id: string;
  mode: JournalingMode;
  entry: string;
  timestamp: Date;
  reflection?: any;
  isProcessing?: boolean;
}

export default function JournalingPortal() {
  const [selectedMode, setSelectedMode] = useState<JournalingMode>('free');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const onboardingStep = useOnboardingStep('beta-user');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [entries]);

  useEffect(() => {
    const handleDemoLoad = (event: CustomEvent) => {
      const { mode, entry, reflection } = event.detail;
      setSelectedMode(mode);
      setShowModeSelector(false);

      const demoEntry: JournalEntry = {
        id: `demo_${Date.now()}`,
        mode,
        entry,
        timestamp: new Date(),
        reflection,
        isProcessing: false
      };

      setEntries(prev => [...prev, demoEntry]);
    };

    window.addEventListener('demo:load', handleDemoLoad as EventListener);
    return () => window.removeEventListener('demo:load', handleDemoLoad as EventListener);
  }, []);

  const handleStartJournaling = (mode: JournalingMode) => {
    setSelectedMode(mode);
    setShowModeSelector(false);
  };

  const handleJournalEntry = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      mode: selectedMode,
      entry: text,
      timestamp: new Date(),
      isProcessing: true
    };

    setEntries(prev => [...prev, newEntry]);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry: text,
          mode: selectedMode,
          userId: 'beta-user'
        })
      });

      const data = await response.json();

      if (data.success) {
        setEntries(prev =>
          prev.map(e =>
            e.id === newEntry.id
              ? { ...e, reflection: data.reflection, isProcessing: false }
              : e
          )
        );

        trackJournalEntry();
        if (selectedMode === 'shadow') {
          trackShadowWork();
        }

        await fetch('/api/journal/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entry: text,
            mode: selectedMode,
            reflection: data.reflection,
            userId: 'beta-user',
            element: 'aether'
          })
        });
      }
    } catch (error) {
      console.error('Journal analysis error:', error);
      setEntries(prev =>
        prev.map(e =>
          e.id === newEntry.id
            ? { ...e, isProcessing: false }
            : e
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeMode = () => {
    setShowModeSelector(true);
  };

  return (
    <SoulfulAppShell userId="beta-user">
      <FeatureDiscovery />
      <ContextualHelp />
      <DemoMode />

      <div className="flex flex-col h-screen bg-gradient-to-br from-violet-50 via-neutral-50 to-amber-50 dark:from-neutral-950 dark:via-violet-950/20 dark:to-neutral-900">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-500 flex items-center justify-center"
            >
              <BookOpen className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Sacred Journaling with MAIA
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {showModeSelector ? 'Choose your mode' : `${JOURNALING_MODE_DESCRIPTIONS[selectedMode].name}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <JournalNavigation />
            <div className="flex items-center gap-2">
              {!showModeSelector && (
                <button
                  onClick={handleChangeMode}
                  className="px-3 py-1.5 text-sm rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Change Mode
                </button>
              )}
              <ExportButton
                userId="beta-user"
                variant="icon"
                label="Export to Obsidian"
              />
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {showModeSelector ? (
              <motion.div
                key="mode-selector"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {(Object.keys(JOURNALING_MODE_DESCRIPTIONS) as JournalingMode[]).map((mode) => {
                  const modeInfo = JOURNALING_MODE_DESCRIPTIONS[mode];
                  return (
                    <motion.button
                      key={mode}
                      onClick={() => handleStartJournaling(mode)}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all text-left"
                    >
                      <div className="text-4xl mb-3">{modeInfo.icon}</div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                        {modeInfo.name}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        {modeInfo.description}
                      </p>
                      <p className="text-xs italic text-neutral-500 dark:text-neutral-500">
                        "{modeInfo.prompt}"
                      </p>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="journal-entries"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{JOURNALING_MODE_DESCRIPTIONS[selectedMode].icon}</span>
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {JOURNALING_MODE_DESCRIPTIONS[selectedMode].name}
                      </h2>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {JOURNALING_MODE_DESCRIPTIONS[selectedMode].description}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm italic text-neutral-500 dark:text-neutral-400">
                    {JOURNALING_MODE_DESCRIPTIONS[selectedMode].prompt}
                  </p>
                </motion.div>

                {entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                          Your Entry
                        </span>
                        <span className="text-xs text-neutral-400">
                          {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                        {entry.entry}
                      </p>
                    </div>

                    {entry.reflection && (
                      <MaiaReflector
                        reflection={entry.reflection}
                        mode={entry.mode}
                        isProcessing={entry.isProcessing}
                      />
                    )}

                    {entry.isProcessing && !entry.reflection && (
                      <div className="flex items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border border-violet-200 dark:border-violet-800">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </motion.div>
                        <span className="text-sm text-violet-700 dark:text-violet-300">
                          MAIA is reflecting on your words...
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}

                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!showModeSelector && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
        >
          <div className="max-w-5xl mx-auto px-6 py-4">
            <HybridInput
              onSend={handleJournalEntry}
              onTranscript={() => {}}
              disabled={isProcessing}
              placeholder={`${JOURNALING_MODE_DESCRIPTIONS[selectedMode].icon} Write or speak freely...`}
            />
          </div>
        </motion.div>
      )}
      </div>
    </SoulfulAppShell>
  );
}