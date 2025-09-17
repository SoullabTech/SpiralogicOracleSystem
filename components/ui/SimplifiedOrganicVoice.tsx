/**
 * Simplified Organic Voice - Clean, golden mic with holoflower visualization
 * No annoying sounds, just beautiful visuals
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface SimplifiedOrganicVoiceProps {
  onTranscript: (text: string) => void;
  isProcessing?: boolean;
  enabled?: boolean;
}

// Sacred geometry sparkle generation
const generateSparkles = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = Math.random() * 100 + 50;
    return {
      id: i,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
    };
  });
};

export const SimplifiedOrganicVoice: React.FC<SimplifiedOrganicVoiceProps> = ({
  onTranscript,
  isProcessing = false,
  enabled = true,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sparkles] = useState(() => generateSparkles(30));
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');

  const WAKE_WORDS = ['hey maya', 'maya', 'okay maya', 'hi maya', 'hello maya'];
  const SILENCE_THRESHOLD = 1500; // 1.5 seconds of silence to process

  // Initialize audio context and analyzer
  const initializeAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Start monitoring audio levels
      const monitorAudioLevel = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        setAudioLevel(average / 255);

        animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
      };

      monitorAudioLevel();
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }, []);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);

      // Check for wake word
      const lowerTranscript = currentTranscript.toLowerCase().trim();
      const hasWakeWord = WAKE_WORDS.some(word => lowerTranscript.includes(word));

      if (hasWakeWord && !isWaitingForInput) {
        console.log('Wake word detected! Listening for input...');
        setIsWaitingForInput(true);
        accumulatedTranscriptRef.current = '';
        setTranscript('Listening...');

        // Clear any existing silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      } else if (isWaitingForInput && finalTranscript) {
        // Accumulate transcript after wake word
        const cleanTranscript = finalTranscript
          .replace(new RegExp(WAKE_WORDS.join('|'), 'gi'), '')
          .trim();

        if (cleanTranscript) {
          accumulatedTranscriptRef.current += ' ' + cleanTranscript;

          // Reset silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Set timer to process after silence
          silenceTimerRef.current = setTimeout(() => {
            const finalMessage = accumulatedTranscriptRef.current.trim();
            if (finalMessage) {
              console.log('Processing:', finalMessage);
              onTranscript(finalMessage);
              setIsWaitingForInput(false);
              accumulatedTranscriptRef.current = '';
              setTranscript('');
            }
          }, SILENCE_THRESHOLD);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      // Auto-restart on certain errors
      if (event.error === 'no-speech' || event.error === 'aborted') {
        setTimeout(() => {
          if (recognitionRef.current && isListening) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // Already started
            }
          }
        }, 100);
      }
    };

    recognition.onend = () => {
      // Auto-restart for continuous listening
      if (isListening) {
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // Already started
            }
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [isWaitingForInput, isListening, onTranscript]);

  // Start/stop listening
  const toggleListening = useCallback(async () => {
    if (!isListening) {
      // Start listening
      const audioInit = await initializeAudioContext();
      const speechInit = initializeSpeechRecognition();

      if (audioInit && speechInit) {
        recognitionRef.current.start();
        setIsListening(true);
        console.log('Started listening...');
      }
    } else {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsListening(false);
      setIsWaitingForInput(false);
      setTranscript('');
      console.log('Stopped listening');
    }
  }, [isListening, initializeAudioContext, initializeSpeechRecognition]);

  // Auto-start listening when enabled
  useEffect(() => {
    if (enabled && !isListening) {
      toggleListening();
    }
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      {/* Holoflower-like background glow */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="w-48 h-48 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            background: isListening
              ? 'radial-gradient(ellipse, rgba(251,191,36,0.2) 0%, rgba(251,191,36,0.1) 40%, transparent 70%)'
              : 'radial-gradient(ellipse, rgba(251,191,36,0.05) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
          animate={{
            scale: isListening ? [1, 1.3, 1] : 1,
            opacity: isListening ? [0.3, 0.5, 0.3] : 0.2,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Sparkles */}
      {isListening && (
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute rounded-full"
              style={{
                left: `calc(50% + ${sparkle.x}px)`,
                top: `calc(50% + ${sparkle.y}px)`,
                width: sparkle.size,
                height: sparkle.size,
                backgroundColor: '#fbbf24',
                boxShadow: `0 0 ${sparkle.size * 2}px #fbbf24`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: sparkle.duration,
                delay: sparkle.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Golden Mic Button */}
      <motion.button
        onClick={toggleListening}
        className="relative w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: isListening
            ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
            : 'linear-gradient(135deg, #d4d4d8, #a1a1aa)',
          boxShadow: isListening
            ? '0 0 30px rgba(251,191,36,0.5), 0 4px 15px rgba(0,0,0,0.2)'
            : '0 4px 15px rgba(0,0,0,0.1)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isWaitingForInput ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 1,
          repeat: isWaitingForInput ? Infinity : 0,
        }}
      >
        {isListening ? (
          <Mic className="w-6 h-6 text-white" />
        ) : (
          <MicOff className="w-6 h-6 text-gray-600" />
        )}

        {/* Audio level indicator */}
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-amber-400"
            style={{
              scale: 1 + audioLevel * 0.5,
              opacity: 0.3 + audioLevel * 0.7,
            }}
          />
        )}
      </motion.button>

      {/* Status text */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
          >
            <div className="bg-gray-900/80 backdrop-blur-sm text-amber-400 px-4 py-2 rounded-full text-sm">
              {isWaitingForInput ? '✨ Listening...' : transcript}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};