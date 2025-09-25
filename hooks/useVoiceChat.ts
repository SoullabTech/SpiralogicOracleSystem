/**
 * Simplified Voice Chat Hook for Maya
 * Provides smooth, responsive voice interaction with minimal lag
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceChatOptions {
  onMessage: (message: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  autoListen?: boolean; // Automatically start listening after Maya speaks
}

export function useVoiceChat({
  onMessage,
  onListeningChange,
  autoListen = true
}: UseVoiceChatOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timer | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timer | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition ||
                              (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  // Setup audio analysis for volume visualization
  const setupAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const microphone = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 256;
      microphone.connect(analyserRef.current);

      // Start volume monitoring
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      volumeIntervalRef.current = setInterval(() => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setVolume(Math.min(average / 128, 1)); // Normalize to 0-1
        }
      }, 50);
    } catch (err) {
      console.error('Failed to setup audio analysis:', err);
    }
  }, [isListening]);

  // Handle speech recognition events
  useEffect(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    let finalTranscript = '';

    recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      setError(null);
      finalTranscript = '';
    };

    recognition.onresult = (event: any) => {
      let interim = '';

      // Clear existing silence timer
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart + ' ';
          setTranscript(finalTranscript.trim());

          // Set a timer to send the message after silence
          silenceTimeoutRef.current = setTimeout(() => {
            if (finalTranscript.trim()) {
              onMessage(finalTranscript.trim());
              finalTranscript = '';
              setTranscript('');
              setInterimTranscript('');
            }
          }, 1500); // 1.5 seconds of silence triggers send
        } else {
          interim += transcriptPart;
        }
      }

      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.error('Recognition error:', event.error);

      if (event.error === 'no-speech') {
        // Normal - just continue
        return;
      }

      if (event.error === 'aborted') {
        // Aborted - restart if we should be listening
        if (isListening) {
          setTimeout(() => startListening(), 100);
        }
        return;
      }

      setError(`Voice error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('🎤 Recognition ended');

      // Restart if we should still be listening
      if (isListening && !isSpeaking) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            // Already started
          }
        }, 100);
      }
    };

  }, [onMessage, isListening, isSpeaking]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!recognitionRef.current || isListening) return;

    try {
      // Setup audio analysis if not already done
      if (!audioContextRef.current) {
        await setupAudioAnalysis();
      }

      await recognitionRef.current.start();
      setIsListening(true);
      setError(null);

      if (onListeningChange) {
        onListeningChange(true);
      }
    } catch (err: any) {
      if (err.message?.includes('already started')) {
        setIsListening(true);
      } else {
        console.error('Failed to start listening:', err);
        setError('Failed to start voice input');
      }
    }
  }, [isListening, setupAudioAnalysis, onListeningChange]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
      setIsListening(false);
      setTranscript('');
      setInterimTranscript('');

      // Clear timers
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }

      // Stop audio analysis
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }

      if (onListeningChange) {
        onListeningChange(false);
      }
    } catch (err) {
      console.error('Failed to stop listening:', err);
    }
  }, [isListening, onListeningChange]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Speak text using speech synthesis
  const speak = useCallback((text: string, onComplete?: () => void) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 0.9;

      // Try to find a good female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v =>
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('victoria') ||
        v.name.toLowerCase().includes('karen')
      );

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        // Stop listening while Maya speaks
        if (isListening) {
          stopListening();
        }
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onComplete) {
          onComplete();
        }
        // Auto-resume listening if enabled
        if (autoListen && !isListening) {
          setTimeout(() => startListening(), 500);
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        if (onComplete) {
          onComplete();
        }
      };

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [autoListen, isListening, startListening, stopListening]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    // State
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    volume,
    error,

    // Actions
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,

    // Combined display transcript
    displayTranscript: transcript || interimTranscript
  };
}