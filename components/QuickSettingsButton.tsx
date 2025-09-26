'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Mic, Brain, Sparkles, X } from 'lucide-react';
import { MaiaSettingsPanel } from './MaiaSettingsPanel';

export function QuickSettingsButton() {
  const [showPanel, setShowPanel] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load current settings for preview
  const [currentSettings, setCurrentSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('maia_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      voice: { openaiVoice: 'shimmer', speed: 0.95 },
      memory: { enabled: true, depth: 'moderate' },
      personality: { warmth: 0.8 }
    };
  });

  return (
    <>
      {/* Floating Settings Button */}
      <motion.div
        className="fixed bottom-24 right-8 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <button
          onClick={() => setShowPanel(true)}
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={() => setShowPreview(false)}
          className="relative p-4 bg-gradient-to-br from-amber-500/20 to-amber-600/20
                   backdrop-blur-sm border border-amber-500/30 rounded-full
                   hover:from-amber-500/30 hover:to-amber-600/30 hover:border-amber-500/50
                   transition-all duration-300 shadow-lg hover:shadow-amber-500/20 group"
        >
          <Settings className="w-6 h-6 text-amber-400 group-hover:rotate-90 transition-transform duration-500" />

          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-amber-500/50"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </button>

        {/* Quick Preview Tooltip */}
        <AnimatePresence>
          {showPreview && !showPanel && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="absolute right-full mr-4 top-0 w-64 bg-black/90 backdrop-blur-md
                       border border-amber-500/30 rounded-lg p-4 shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
                  <Settings className="w-4 h-4" />
                  Current Settings
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/60">
                      <Mic className="w-3 h-3" />
                      Voice
                    </div>
                    <span className="text-amber-400">{currentSettings.voice.openaiVoice}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/60">
                      <Brain className="w-3 h-3" />
                      Memory
                    </div>
                    <span className="text-amber-400">{currentSettings.memory.depth}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/60">
                      <Sparkles className="w-3 h-3" />
                      Warmth
                    </div>
                    <span className="text-amber-400">{(currentSettings.personality.warmth * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 text-xs text-white/40">
                  Click to customize →
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Full Settings Panel */}
      {showPanel && (
        <MaiaSettingsPanel
          onClose={() => {
            setShowPanel(false);
            // Reload settings after closing
            const saved = localStorage.getItem('maia_settings');
            if (saved) {
              setCurrentSettings(JSON.parse(saved));
            }
          }}
        />
      )}
    </>
  );
}