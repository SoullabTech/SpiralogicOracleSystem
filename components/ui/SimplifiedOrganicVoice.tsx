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
  isMayaSpeaking?: boolean;
  mayaVoiceState?: any;
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
  isMayaSpeaking = false,
  mayaVoiceState,
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

  const WAKE_WORDS = ['hey maya', 'maya', 'okay maya', 'hi maya', 'hello maya', 'hey', 'hello', 'hi'];
  const SILENCE_THRESHOLD = 1500; // 1.5 seconds of silence to process

  // Initialize audio context and analyzer
  const initializeAudioContext = useCallback(async () => {
    try {
      console.log('📡 Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      console.log('✅ Microphone permission granted');
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
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🟢 Speech recognition started');
    };

    recognition.onspeechstart = () => {
      console.log('🎙️ Speech detected');
    };

    recognition.onaudiostart = () => {
      console.log('🔊 Audio capture started');
    };

    recognition.onresult = (event: any) => {
      console.log('🎤 Speech recognition event:', event);
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        console.log(`📝 Result ${i}:`, transcript, 'isFinal:', event.results[i].isFinal);
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
        console.log('🎯 Wake word detected:', lowerTranscript);
        setIsWaitingForInput(true);
        accumulatedTranscriptRef.current = '';
        setTranscript('✨ Listening...');

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
              console.log('🚀 Sending to Maya:', finalMessage);
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
      if (event.error === 'no-speech' || event.error === 'aborted' || event.error === 'network') {
        setTimeout(() => {
          if (recognitionRef.current && isListening) {
            try {
              recognitionRef.current.stop();
              setTimeout(() => {
                try {
                  recognitionRef.current.start();
                  console.log('Speech recognition restarted after error');
                } catch (e) {
                  console.log('Could not restart speech recognition:', e);
                }
              }, 500);
            } catch (e) {
              // Already stopped
            }
          }
        }, 100);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      // Auto-restart for continuous listening
      if (isListening) {
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
              console.log('Speech recognition restarted');
            } catch (e) {
              console.log('Could not restart:', e);
            }
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [isWaitingForInput, isListening, onTranscript]);

  // Start/stop listening
  const toggleListening = useCallback(async () => {
    if (!isListening) {
      console.log('🎤 Starting voice recognition...');
      // Start listening
      const audioInit = await initializeAudioContext();
      const speechInit = initializeSpeechRecognition();

      if (audioInit && speechInit && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          console.log('✅ Voice recognition started successfully');
        } catch (error) {
          console.error('❌ Failed to start recognition:', error);
        }
      } else {
        console.error('❌ Failed to initialize:', { audioInit, speechInit, hasRecognition: !!recognitionRef.current });
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
      {/* Living Field - Always breathing, responsive to both voices */}
      <div className="absolute inset-0 -z-10">
        {/* Ambient breathing glow - always present to show the field is alive */}
        <motion.div
          className="w-64 h-64 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(ellipse, rgba(212,184,150,0.05) 0%, rgba(212,184,150,0.02) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* User voice glow - golden/amber */}
        <motion.div
          className="w-48 h-48 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            background: isListening
              ? `radial-gradient(ellipse, rgba(251,191,36,${0.15 + audioLevel * 0.3}) 0%, rgba(251,191,36,${0.05 + audioLevel * 0.2}) 40%, transparent 70%)`
              : 'radial-gradient(ellipse, rgba(251,191,36,0.03) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={{
            scale: isListening ? (audioLevel > 0.1 ? 1 + audioLevel * 0.8 : [1, 1.4, 1]) : 1,
            opacity: isListening ? (audioLevel > 0.1 ? 0.3 + audioLevel * 0.5 : [0.3, 0.6, 0.3]) : 0.1,
          }}
          transition={{
            duration: audioLevel > 0.1 ? 0.1 : 3,
            repeat: audioLevel > 0.1 ? 0 : Infinity,
            ease: audioLevel > 0.1 ? "linear" : "easeInOut"
          }}
        />

        {/* Maya's voice signature - purple/violet crystalline patterns */}
        {isMayaSpeaking && (
          <motion.div
            className="w-56 h-56 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              background: 'radial-gradient(ellipse, rgba(147,51,234,0.3) 0%, rgba(147,51,234,0.1) 40%, transparent 70%)',
              filter: 'blur(35px)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              scale: [1, 1.3, 1.1, 1.2, 1],
              opacity: [0.4, 0.7, 0.5, 0.6, 0.4],
              rotate: [0, 30, -20, 15, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Additional glow when registering words */}
        {isWaitingForInput && (
          <motion.div
            className="w-64 h-64 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              background: 'radial-gradient(ellipse, rgba(251,191,36,0.2) 0%, transparent 60%)',
              filter: 'blur(50px)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
        )}
      </div>

      {/* Ambient particles - always present but subtle */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        {sparkles.slice(0, 10).map((sparkle) => (
          <motion.div
            key={`ambient-${sparkle.id}`}
            className="absolute rounded-full"
            style={{
              left: `calc(50% + ${sparkle.x * 1.5}px)`,
              top: `calc(50% + ${sparkle.y * 1.5}px)`,
              width: 1,
              height: 1,
              backgroundColor: 'rgba(212,184,150,0.3)',
              boxShadow: '0 0 2px rgba(212,184,150,0.2)',
            }}
            animate={{
              opacity: [0, 0.3, 0],
              x: [0, sparkle.x * 0.2, sparkle.x * 0.4],
              y: [0, sparkle.y * 0.2, sparkle.y * 0.4],
            }}
            transition={{
              duration: sparkle.duration * 2,
              delay: sparkle.delay * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* User voice sparkles - golden */}
      {isListening && (
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          {sparkles.map((sparkle) => (
            <motion.div
              key={`user-${sparkle.id}`}
              className="absolute rounded-full"
              style={{
                left: `calc(50% + ${sparkle.x}px)`,
                top: `calc(50% + ${sparkle.y}px)`,
                width: isWaitingForInput ? sparkle.size * 2 : sparkle.size,
                height: isWaitingForInput ? sparkle.size * 2 : sparkle.size,
                backgroundColor: isWaitingForInput ? '#fbbf24' : 'rgba(251,191,36,0.6)',
                boxShadow: `0 0 ${sparkle.size * 3}px ${isWaitingForInput ? '#fbbf24' : 'rgba(251,191,36,0.4)'}`,
              }}
              animate={{
                opacity: isWaitingForInput ? [0, 1, 0] : [0, 0.6, 0],
                scale: isWaitingForInput ? [0, 1.5, 0] : [0, 1, 0],
                rotate: isWaitingForInput ? [0, 180, 360] : 0,
              }}
              transition={{
                duration: isWaitingForInput ? sparkle.duration * 0.5 : sparkle.duration,
                delay: isWaitingForInput ? sparkle.delay * 0.5 : sparkle.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Maya's voice sparkles - crystalline purple */}
      {isMayaSpeaking && (
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          {sparkles.map((sparkle, i) => (
            <motion.div
              key={`maya-${sparkle.id}`}
              className="absolute"
              style={{
                left: `calc(50% + ${Math.cos(i * 0.5) * 80}px)`,
                top: `calc(50% + ${Math.sin(i * 0.5) * 80}px)`,
                width: 3,
                height: 3,
              }}
              animate={{
                x: [0, Math.cos(i) * 30, 0],
                y: [0, Math.sin(i) * 30, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                  boxShadow: '0 0 6px rgba(147,51,234,0.8)',
                  transform: 'rotate(45deg)',
                }}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Golden Mic Button - Subtle and elegant */}
      <motion.button
        onClick={toggleListening}
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center"
        style={{
          background: isListening
            ? 'linear-gradient(135deg, rgba(212,184,150,0.15), rgba(212,184,150,0.25))'
            : 'linear-gradient(135deg, rgba(212,184,150,0.08), rgba(212,184,150,0.12))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: isListening ? '1px solid rgba(212,184,150,0.3)' : '1px solid rgba(212,184,150,0.15)',
          boxShadow: isListening
            ? '0 0 30px rgba(212,184,150,0.2), inset 0 0 20px rgba(212,184,150,0.1)'
            : '0 4px 20px rgba(0,0,0,0.2)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isListening ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: isListening ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {isListening ? (
          <Mic className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'rgba(212,184,150,0.9)' }} />
        ) : (
          <MicOff className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'rgba(212,184,150,0.5)' }} />
        )}

        {/* Pulse animation when listening */}
        {isListening && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(251,191,36,0.4), transparent)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Audio level indicator - ripples */}
            <motion.div
              className="absolute inset-0 rounded-full border border-amber-400/50"
              style={{
                scale: 1 + audioLevel * 0.3,
              }}
              animate={{
                opacity: audioLevel > 0.1 ? [0.6, 0.2] : 0,
              }}
              transition={{
                duration: 0.3,
                repeat: audioLevel > 0.1 ? Infinity : 0,
              }}
            />
          </>
        )}

        {/* Sparkle effect when registering words */}
        {isWaitingForInput && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                '0 0 10px rgba(251,191,36,0.5)',
                '0 0 20px rgba(251,191,36,0.8)',
                '0 0 10px rgba(251,191,36,0.5)',
              ],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
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
            className="absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
          >
            <div className="backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm" style={{
              background: 'rgba(30,30,40,0.7)',
              border: '1px solid rgba(212,184,150,0.2)',
              color: '#d4b896'
            }}>
              {isWaitingForInput ? '✨ Listening...' : transcript}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};