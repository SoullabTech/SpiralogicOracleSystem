'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Sparkles, ArrowLeft } from 'lucide-react';
import { Copy } from '@/lib/copy/MaiaCopy';
import { useMaiaStore } from '@/lib/maia/state';
import { getJournalingPrompt } from '@/lib/journaling/JournalingPrompts';
import { JOURNALING_MODE_DESCRIPTIONS } from '@/lib/journaling/JournalingPrompts';

interface VoiceRecognition {
  start: () => void;
  stop: () => void;
  abort: () => void;
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

export default function VoiceJournaling() {
  const { selectedMode, currentEntry, setEntry, addEntry, setProcessing, isProcessing, resetEntry } = useMaiaStore();
  const [isListening, setIsListening] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<VoiceRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setEntry(currentEntry + finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'no-speech' || event.error === 'aborted') {
            return;
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          if (isListening) {
            recognition.start();
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentEntry) {
      setWordCount(currentEntry.trim().split(/\s+/).filter(Boolean).length);
    } else {
      setWordCount(0);
    }
  }, [currentEntry]);

  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current || !isSupported) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setDuration(0);
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!currentEntry.trim() || !selectedMode) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

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
          mode: selectedMode,
          entry: currentEntry,
          userId: 'current-user',
          enableMemory: true
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
        duration,
        isVoice: true
      });

      setDuration(0);
    } catch (error) {
      console.error('Failed to submit entry:', error);
      setProcessing(false);
    }
  };

  if (!selectedMode) return null;

  const modeInfo = JOURNALING_MODE_DESCRIPTIONS[selectedMode];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Mic className="w-3 h-3" />
              {modeInfo.name}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              {wordCount} words • {formatDuration(duration)}
            </p>
          </div>
        </div>
      </div>

      {!isSupported && (
        <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Voice recognition is not supported in your browser. Try Chrome, Edge, or Safari.
          </p>
        </div>
      )}

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
        <div className="relative">
          <textarea
            value={currentEntry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder={isListening ? "Listening..." : "Tap the microphone to speak, or type here..."}
            className="w-full min-h-[400px] p-6 rounded-2xl bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 focus:border-[#FFD700] dark:focus:border-[#FFD700] focus:outline-none transition-colors resize-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
            disabled={isListening}
          />

          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 rounded-2xl border-2 border-[#FFD700] pointer-events-none"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 to-amber-500/5 rounded-2xl" />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-6 right-6 w-4 h-4 bg-red-500 rounded-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-6 right-6 flex items-center gap-3">
          <AnimatePresence>
            {currentEntry.trim() && !isListening && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleSubmit}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD700] to-amber-600 text-[#0A0E27] rounded-full font-semibold hover:shadow-lg hover:shadow-[#FFD700]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          {isSupported && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleListening}
              disabled={isProcessing}
              className={`p-4 rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-500/25'
              }`}
            >
              {isListening ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 text-center text-xs text-neutral-500 dark:text-neutral-600"
      >
        {isListening ? Copy.voice.readyToListen : Copy.voice.tapToStart}
      </motion.div>
    </motion.div>
  );
}