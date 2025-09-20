/**
 * Simplified Organic Voice - Clean, golden mic with holoflower visualization
 * No annoying sounds, just beautiful visuals
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface SimplifiedOrganicVoiceProps {
  onTranscript: (text: string) => void;
  enabled?: boolean;
  isMayaSpeaking?: boolean;
  onAudioLevelChange?: (level: number) => void;
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

export interface VoiceActivatedMaiaRef {
  startListening: () => void;
  stopListening: () => void;
  muteImmediately: () => void;
  isListening: boolean;
  audioLevel: number;
}

export const SimplifiedOrganicVoice = React.forwardRef<VoiceActivatedMaiaRef, SimplifiedOrganicVoiceProps>(({
  onTranscript,
  enabled = true,
  isMayaSpeaking = false,
  onAudioLevelChange,
}, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [isPausedForMaya, setIsPausedForMaya] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sparkles] = useState(() => generateSparkles(30));
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');

  const WAKE_WORDS = ['hey maya', 'maya', 'okay maya', 'hi maya', 'hello maya', 'hey', 'hello', 'hi'];
  const SILENCE_THRESHOLD = 5000; // 5 seconds of silence to process (allow for complete thoughts and pauses)

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
        const level = average / 255;
        setAudioLevel(level);
        onAudioLevelChange?.(level);

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

            // Filter out problematic patterns and ensure meaningful messages
            const words = finalMessage.split(' ');
            const isLongEnough = words.length >= 3; // At least 3 words for a meaningful sentence
            const isNotJustRepeats = !(/^(\w+\s*)\1+$/.test(finalMessage)); // Not just repeated words

            // Enhanced filtering to prevent feedback loops
            const commonFeedbackWords = ['fuck', 'mirror', 'hear', 'what', 'you', 'the', 'and', 'or', 'but', 'maya', 'speaking', 'response', 'paused', 'finished'];
            const isNotCommonFragment = !commonFeedbackWords.includes(finalMessage.toLowerCase().trim());
            const isNotSelfReference = !finalMessage.toLowerCase().includes('maya is') && !finalMessage.toLowerCase().includes('speaking') && !finalMessage.toLowerCase().includes('paused');

            if (finalMessage && isLongEnough && isNotJustRepeats && isNotCommonFragment && isNotSelfReference) {
              console.log('🚀 Sending to Maya:', finalMessage);
              onTranscript(finalMessage);
              setIsWaitingForInput(false);
              accumulatedTranscriptRef.current = '';
              setTranscript('');
            } else {
              console.log('⚠️ Ignoring fragment/repeat:', finalMessage, { isLongEnough, isNotJustRepeats, isNotCommonFragment });
              // Reset but don't send
              setIsWaitingForInput(false);
              accumulatedTranscriptRef.current = '';
              setTranscript('');
            }
          }, SILENCE_THRESHOLD);
        }
      }
    };

    recognition.onerror = (event: any) => {
      // Log the error but don't display in console for abort errors
      if (event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
      }
      // Auto-restart on certain errors only if not paused
      if ((event.error === 'no-speech' || event.error === 'aborted' || event.error === 'network') && !isPausedForMaya && enabled) {
        setTimeout(() => {
          if (recognitionRef.current && isListening && !isPausedForMaya) {
            try {
              recognitionRef.current.stop();
              setTimeout(() => {
                try {
                  if (!isPausedForMaya) {
                    recognitionRef.current.start();
                    console.log('Speech recognition restarted after error');
                  }
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
      // Auto-restart for continuous listening only if Maya is not speaking and not paused
      if (isListening && !isMayaSpeaking && !isPausedForMaya) {
        setTimeout(() => {
          if (recognitionRef.current && !isMayaSpeaking && !isPausedForMaya) {
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
  }, [isWaitingForInput, isListening, onTranscript, isMayaSpeaking, isPausedForMaya]);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    startListening: () => {
      if (recognitionRef.current && !isListening && !isPausedForMaya) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.log('Could not start recognition:', e);
        }
      }
    },
    stopListening: () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          setIsListening(false);
        } catch (e) {
          // Already stopped
        }
      }
    },
    muteImmediately: () => {
      setIsPausedForMaya(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Already stopped
        }
      }
    },
    isListening,
    audioLevel
  }), [isListening, isPausedForMaya, audioLevel]);

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

  // Auto-start listening when enabled and not muted
  useEffect(() => {
    if (enabled && !isListening && !isMayaSpeaking && !isMuted) {
      toggleListening();
    }
  }, [enabled]);

  // Stop listening when muted
  useEffect(() => {
    if (isMuted && isListening) {
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
      console.log('🔇 Muted - stopped listening');
    } else if (!isMuted && !isListening && enabled && !isMayaSpeaking) {
      // Resume listening when unmuted
      toggleListening();
    }
  }, [isMuted, enabled, isMayaSpeaking]);

  // Keyboard shortcut for muting (Cmd/Ctrl + M)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault();
        setIsMuted(prev => !prev);
        console.log('🎛️ Toggled mute via keyboard');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Pause/resume listening when Maya is speaking to prevent feedback loop
  useEffect(() => {
    console.log('🔄 Voice state check:', { isMayaSpeaking, isListening, isPausedForMaya, enabled });

    if (isMayaSpeaking && !isPausedForMaya) {
      console.log('🔇 IMMEDIATELY Pausing voice recognition - Maya is speaking');
      setIsPausedForMaya(true);
      setIsWaitingForInput(false);
      setTranscript('🔇 Paused while Maya speaks...');

      // Clear any pending silence timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Reset accumulated transcript to prevent old text from being sent
      accumulatedTranscriptRef.current = '';

      // IMMEDIATELY stop recognition while Maya speaks
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log('🛑 Recognition stopped for Maya');
        } catch (e) {
          console.log('Recognition already stopped');
        }
      }

      // IMMEDIATELY mute microphone stream to prevent feedback
      if (micStreamRef.current) {
        micStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = false;
          console.log('🔇 Microphone track disabled');
        });
      }
    } else if (!isMayaSpeaking && isPausedForMaya && enabled) {
      console.log('🔊 Resuming voice recognition - Maya finished speaking');
      setIsPausedForMaya(false);
      setTranscript('');

      // Clear any accumulated text to prevent sending old speech
      accumulatedTranscriptRef.current = '';

      // Re-enable microphone
      if (micStreamRef.current) {
        micStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = true;
        });
      }

      // Resume recognition after a longer delay to ensure audio has fully stopped
      setTimeout(() => {
        if (recognitionRef.current && !isMayaSpeaking && isListening) {
          try {
            recognitionRef.current.start();
            console.log('Voice recognition resumed after Maya finished');
          } catch (e) {
            console.log('Could not resume recognition:', e);
          }
        }
      }, 4000); // Increased to 4 second delay to ensure Maya's audio has completely stopped
    }
  }, [isMayaSpeaking, isListening, enabled, isPausedForMaya]);

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

  // Return minimal UI - voice logic only
  return (
    <div className="hidden">
      {/* Living Field - Always breathing, responsive to both voices */}
      <div className="absolute inset-0 -z-10">
        {/* Ambient breathing glow - always present to show the field is alive */}
        <motion.div
          className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
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
          className="w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
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
            className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
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
            className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
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

      {/* Mute Button */}
      <motion.button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute -left-14 sm:-left-16 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
        style={{
          background: isMuted
            ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.25))'
            : 'linear-gradient(135deg, rgba(212,184,150,0.05), rgba(212,184,150,0.1))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: isMuted ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(212,184,150,0.1)',
          boxShadow: isMuted
            ? '0 0 20px rgba(239,68,68,0.15)'
            : '0 4px 15px rgba(0,0,0,0.1)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={isMuted ? "Unmute (⌘+M)" : "Mute (⌘+M)"}
      >
        {isMuted ? (
          <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: 'rgba(239,68,68,0.8)' }} />
        ) : (
          <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: 'rgba(212,184,150,0.6)' }} />
        )}
      </motion.button>

      {/* Golden Mic Button - Subtle and elegant */}
      <motion.button
        onClick={() => !isMuted && toggleListening()}
        className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center"
        style={{
          background: isListening
            ? 'linear-gradient(135deg, rgba(212,184,150,0.15), rgba(212,184,150,0.25))'
            : 'linear-gradient(135deg, rgba(212,184,150,0.08), rgba(212,184,150,0.12))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: isListening ? '1px solid rgba(212,184,150,0.3)' : '1px solid rgba(212,184,150,0.15)',
          boxShadow: isMuted
            ? '0 4px 15px rgba(0,0,0,0.1)'
            : isListening
            ? '0 0 30px rgba(212,184,150,0.2), inset 0 0 20px rgba(212,184,150,0.1)'
            : '0 4px 20px rgba(0,0,0,0.2)',
          opacity: isMuted ? 0.5 : 1,
          cursor: isMuted ? 'not-allowed' : 'pointer',
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
        {isMuted ? (
          <MicOff className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" style={{ color: 'rgba(239,68,68,0.6)' }} />
        ) : isListening ? (
          <Mic className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" style={{ color: 'rgba(212,184,150,0.9)' }} />
        ) : (
          <MicOff className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" style={{ color: 'rgba(212,184,150,0.5)' }} />
        )}

        {/* Pulse animation when listening */}
        {isListening && !isMuted && (
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
        {isWaitingForInput && !isMuted && (
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
        {isMuted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-14 sm:bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
          >
            <div className="backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm" style={{
              background: 'rgba(239,68,68,0.2)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#ef4444'
            }}>
              🔇 Muted - Press ⌘+M to unmute
            </div>
          </motion.div>
        )}
        {transcript && !isMuted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-14 sm:bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
          >
            <div className="backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm" style={{
              background: 'rgba(30,30,40,0.3)',
              border: '1px solid rgba(212,184,150,0.15)',
              color: '#d4b896'
            }}>
              {isWaitingForInput ? '✨ Listening...' : transcript}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});