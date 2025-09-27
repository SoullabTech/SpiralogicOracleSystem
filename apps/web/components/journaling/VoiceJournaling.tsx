'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalingMode, JOURNALING_MODE_DESCRIPTIONS } from '@/lib/journaling/JournalingPrompts';
import ContextualHelp from '@/components/onboarding/ContextualHelp';
import JournalNavigation from './JournalNavigation';
import { trackVoiceUsage } from '@/components/onboarding/FeatureDiscovery';
import { Mic, MicOff, Play, Pause, Sparkles, Volume2 } from 'lucide-react';

interface VoiceJournalEntry {
  id: string;
  mode: JournalingMode;
  transcript: string;
  reflection?: any;
  audioUrl?: string;
  timestamp: Date;
  isProcessing?: boolean;
}

export default function VoiceJournaling() {
  const [selectedMode, setSelectedMode] = useState<JournalingMode>('free');
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [entries, setEntries] = useState<VoiceJournalEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enableVoiceResponse, setEnableVoiceResponse] = useState(true);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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

          setCurrentTranscript(prev => prev + finalTranscript || interimTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      setIsRecording(true);
      setCurrentTranscript('');
      trackVoiceUsage();

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Microphone access error:', error);
      alert('Please allow microphone access to use voice journaling');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (currentTranscript.trim()) {
      await processVoiceEntry(currentTranscript);
    }
  };

  const processVoiceEntry = async (transcript: string) => {
    const newEntry: VoiceJournalEntry = {
      id: Date.now().toString(),
      mode: selectedMode,
      transcript,
      timestamp: new Date(),
      isProcessing: true
    };

    setEntries(prev => [...prev, newEntry]);
    setIsProcessing(true);
    setCurrentTranscript('');

    try {
      const response = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry: transcript,
          mode: selectedMode,
          userId: 'beta-user',
          enableVoice: enableVoiceResponse
        })
      });

      const data = await response.json();

      if (data.success) {
        setEntries(prev =>
          prev.map(e =>
            e.id === newEntry.id
              ? {
                  ...e,
                  reflection: data.reflection,
                  audioUrl: data.audioUrl,
                  isProcessing: false
                }
              : e
          )
        );

        if (data.audioUrl && enableVoiceResponse) {
          playAudioResponse(data.audioUrl);
        }

        await fetch('/api/journal/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entry: transcript,
            mode: selectedMode,
            reflection: data.reflection,
            userId: 'beta-user',
            element: 'aether'
          })
        });
      }
    } catch (error) {
      console.error('Voice journal processing error:', error);
      setEntries(prev =>
        prev.map(e =>
          e.id === newEntry.id ? { ...e, isProcessing: false } : e
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudioResponse = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Audio playback error:', error);
    });
  };

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
    <div className="flex flex-col h-screen bg-gradient-to-br from-violet-50 via-neutral-50 to-amber-50 dark:from-neutral-950 dark:via-violet-950/20 dark:to-neutral-900">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: isRecording ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 1, repeat: isRecording ? Infinity : 0 }}
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${modeColors[selectedMode]} flex items-center justify-center`}
            >
              <Mic className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Voice Journaling with MAIA
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Speak your truth • {JOURNALING_MODE_DESCRIPTIONS[selectedMode].name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <JournalNavigation />
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={enableVoiceResponse}
                onChange={(e) => setEnableVoiceResponse(e.target.checked)}
                className="rounded"
              />
              <Volume2 className="w-4 h-4" />
              MAIA voice
            </label>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {(Object.keys(JOURNALING_MODE_DESCRIPTIONS) as JournalingMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                disabled={isRecording}
                className={`p-4 rounded-xl text-center transition-all ${
                  selectedMode === mode
                    ? `bg-gradient-to-br ${modeColors[mode]} text-white shadow-lg`
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="text-3xl mb-2">{modeIcons[mode]}</div>
                <div className="text-xs font-medium capitalize">{mode}</div>
              </button>
            ))}
          </div>

          {currentTranscript && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-md mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Mic className="w-4 h-4 text-violet-600 dark:text-violet-400 animate-pulse" />
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Live Transcript
                </span>
              </div>
              <p className="text-neutral-800 dark:text-neutral-200">{currentTranscript}</p>
            </motion.div>
          )}

          <div className="space-y-6">
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{modeIcons[entry.mode]}</span>
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {entry.audioUrl && (
                      <button
                        onClick={() => playAudioResponse(entry.audioUrl!)}
                        className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                    {entry.transcript}
                  </p>
                </div>

                {entry.isProcessing && (
                  <div className="flex items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border border-violet-200 dark:border-violet-800">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </motion.div>
                    <span className="text-sm text-violet-700 dark:text-violet-300">
                      MAIA is listening to your soul...
                    </span>
                  </div>
                )}

                {entry.reflection && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-violet-50 dark:from-neutral-800 dark:to-violet-900/20 border border-violet-200 dark:border-violet-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                        MAIA Reflected
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-200 mb-3">
                      {entry.reflection.reflection}
                    </p>
                    <p className="text-sm text-violet-700 dark:text-violet-300 italic">
                      {entry.reflection.prompt}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-6"
      >
        <div className="max-w-5xl mx-auto flex justify-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording
                ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/50'
                : `bg-gradient-to-br ${modeColors[selectedMode]} shadow-lg`
            }`}
          >
            {isRecording ? (
              <MicOff className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
            {isRecording && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-white"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>
        </div>
        <p className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-4">
          {isRecording ? 'Tap to finish • Speak freely' : 'Tap to begin speaking'}
        </p>
      </motion.div>

      <ContextualHelp />
    </div>
  );
}