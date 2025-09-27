'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Clock, Search, HelpCircle, Sparkles, Mic, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { Copy } from '@/lib/copy/MaiaCopy';
import { useMaiaStore } from '@/lib/maia/state';
import { mockEntries } from '@/lib/maia/mockData';

import SoulfulAppShell from '@/components/onboarding/SoulfulAppShell';
import ModeSelection from '@/components/maia/ModeSelection';
import JournalEntry from '@/components/maia/JournalEntry';
import VoiceJournaling from '@/components/maia/VoiceJournaling';
import MaiaReflection from '@/components/maia/MaiaReflection';
import TimelineView from '@/components/maia/TimelineView';
import SemanticSearch from '@/components/maia/SemanticSearch';
import Analytics from '@/components/maia/Analytics';
import Settings from '@/components/maia/Settings';
import CoherencePulse from '@/components/maia/CoherencePulse';
import SoulprintSnapshot from '@/components/maia/SoulprintSnapshot';

export default function MaiaPage() {
  const { currentView, setView, entries } = useMaiaStore();
  const [userId] = useState('demo-user');
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSoulprint, setShowSoulprint] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [useVoiceMode, setUseVoiceMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const demo = params.get('demo');
      const dev = params.get('dev');

      if (demo === 'true') {
        setIsDemoMode(true);
      }
      if (dev === 'true') {
        setIsDevMode(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isDemoMode && entries.length === 0) {
      mockEntries.forEach(entry => {
        useMaiaStore.setState((state) => ({
          entries: [...state.entries, entry]
        }));
      });
    }
  }, [isDemoMode, entries.length]);

  const renderView = () => {
    switch (currentView) {
      case 'mode-select':
        return <ModeSelection />;
      case 'journal-entry':
        return useVoiceMode ? <VoiceJournaling /> : <JournalEntry />;
      case 'reflection':
        return <MaiaReflection />;
      case 'timeline':
        return <TimelineView />;
      case 'search':
        return <SemanticSearch />;
      default:
        return <ModeSelection />;
    }
  };

  return (
    <SoulfulAppShell userId={userId}>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-amber-50 dark:from-[#0A0E27] dark:via-[#0E1428] dark:to-[#1A1F3A]">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0A0E27]/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] via-amber-500 to-orange-500 flex items-center justify-center"
                >
                  <Sparkles className="w-5 h-5 text-[#0A0E27]" />
                </motion.div>
                <div>
                  <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    MAIA Journal
                  </h1>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Your sacred space for reflection
                  </p>
                </div>
              </div>

              {entries.length > 0 && (
                <div className="hidden md:block">
                  <CoherencePulse />
                </div>
              )}
            </div>

            <nav className="flex items-center gap-2">
              <button
                onClick={() => setView('mode-select')}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
                  currentView === 'mode-select' || currentView === 'journal-entry' || currentView === 'reflection'
                    ? 'bg-[#FFD700] text-[#0A0E27] font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Journal</span>
              </button>

              {entries.length >= 3 && (
                <button
                  onClick={() => setView('timeline')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
                    currentView === 'timeline'
                      ? 'bg-[#FFD700] text-[#0A0E27] font-medium'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Timeline</span>
                </button>
              )}

              {entries.length >= 5 && (
                <button
                  onClick={() => setView('search')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
                    currentView === 'search'
                      ? 'bg-[#FFD700] text-[#0A0E27] font-medium'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              )}

              {entries.length > 0 && (
                <button
                  onClick={() => setShowSoulprint(!showSoulprint)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                  title="Soulprint"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                title="Analytics"
              >
                <BarChart3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                title="Settings"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                title="Help"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </nav>
          </div>
        </header>

        <main className="py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {entries.length === 0 && !isDemoMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="fixed bottom-6 right-6 flex flex-col gap-2"
          >
            <button
              onClick={() => setIsDemoMode(true)}
              className="px-4 py-2 bg-violet-600 text-white rounded-full text-sm font-medium hover:bg-violet-700 transition-colors shadow-lg"
            >
              Load Demo Entries
            </button>
          </motion.div>
        )}

        {isDevMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-20 right-6 p-3 bg-amber-100 dark:bg-amber-900 rounded-lg border border-amber-300 dark:border-amber-700 text-xs"
          >
            <div className="font-bold mb-1">Dev Mode</div>
            <div>Entries: {entries.length}</div>
            <div>View: {currentView}</div>
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={useVoiceMode}
                onChange={(e) => setUseVoiceMode(e.target.checked)}
                className="rounded"
              />
              Voice Mode
            </label>
          </motion.div>
        )}

        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setShowHelp(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-neutral-800 rounded-2xl p-8 max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                  {Copy.help.title}
                </h2>

                <div className="space-y-4 text-sm text-neutral-700 dark:text-neutral-300">
                  <div>
                    <h3 className="font-semibold mb-1">{Copy.help.whatIsJournaling}</h3>
                    <p>MAIA helps you explore your inner world through 5 guided modes—each designed to support different types of reflection.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">{Copy.help.aboutPatterns}</h3>
                    <p>As you write, MAIA notices symbols, archetypes, and emotional patterns. Over time, these reveal themes in your journey.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">Progressive Discovery</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>After 3 entries: Timeline view unlocks</li>
                      <li>After 5 entries: Semantic search unlocks</li>
                      <li>Voice journaling available anytime</li>
                    </ul>
                  </div>

                  {isDevMode && (
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <h3 className="font-semibold mb-1 text-amber-800 dark:text-amber-300">Test Modes</h3>
                      <ul className="text-xs space-y-1">
                        <li><code>?demo=true</code> - Load demo entries</li>
                        <li><code>?dev=true</code> - Show dev panel</li>
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowHelp(false)}
                  className="mt-6 w-full py-3 bg-[#FFD700] text-[#0A0E27] rounded-full font-semibold hover:shadow-lg hover:shadow-[#FFD700]/25 transition-all"
                >
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}

          {showSettings && <Settings onClose={() => setShowSettings(false)} />}

          {showSoulprint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setShowSoulprint(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-neutral-800 rounded-2xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    Your Soulprint
                  </h2>
                  <button
                    onClick={() => setShowSoulprint(false)}
                    className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Close
                  </button>
                </div>
                <SoulprintSnapshot />
              </motion.div>
            </motion.div>
          )}

          {showAnalytics && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setShowAnalytics(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-neutral-800 rounded-2xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    Analytics
                  </h2>
                  <button
                    onClick={() => setShowAnalytics(false)}
                    className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    Close
                  </button>
                </div>
                <Analytics />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SoulfulAppShell>
  );
}