"use client";

import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { Mic, MicOff, Loader2, Activity, Wifi, WifiOff } from "lucide-react";
import { Analytics } from "../../lib/analytics/supabaseAnalytics";

interface ContinuousConversationProps {
  onTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  isProcessing?: boolean;
  isSpeaking?: boolean; // When Maya is speaking
  autoStart?: boolean; // Start listening immediately
  silenceThreshold?: number; // Silence detection threshold in ms (default 2000)
  vadSensitivity?: number; // Voice activity detection sensitivity 0-1
}

export interface ContinuousConversationRef {
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  isListening: boolean;
  isRecording: boolean;
}

export const ContinuousConversation = forwardRef<ContinuousConversationRef, ContinuousConversationProps>((props, ref) => {
  const { 
    onTranscript, 
    onInterimTranscript, 
    onRecordingStateChange, 
    isProcessing = false,
    isSpeaking = false,
    autoStart = true,
    silenceThreshold = 1200,
    vadSensitivity = 0.3
  } = props;

  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const lastSpeechTime = useRef<number>(Date.now());
  const accumulatedTranscript = useRef<string>("");
  const isProcessingRef = useRef(false);
  const recognitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentRef = useRef<string>("");

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    startListening,
    stopListening,
    toggleListening,
    isListening,
    isRecording
  }));

  // Initialize Web Speech API
  const initializeSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition || 
                             (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      onRecordingStateChange?.(true);
      accumulatedTranscript.current = "";
      
      // Set timeout to auto-stop recognition after 30 seconds (increased from 6)
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
      }
      recognitionTimeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isRecording) {
          // Only stop if no speech detected for a while
          const timeSinceLastSpeech = Date.now() - lastSpeechTime.current;
          if (timeSinceLastSpeech > 5000) {
            recognitionRef.current.stop();
          } else {
            // Reset the timeout if there was recent speech
            recognitionTimeoutRef.current = setTimeout(() => {
              if (recognitionRef.current && isRecording) {
                recognitionRef.current.stop();
              }
            }, 10000);
          }
        }
      }, 30000);
    };

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

      // Update speech time on any speech
      if (interimTranscript || finalTranscript) {
        lastSpeechTime.current = Date.now();
        
        // Reset silence timer on speech
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        
        // Start new silence timer
        silenceTimerRef.current = setTimeout(() => {
          if (isRecording && !isProcessingRef.current && accumulatedTranscript.current.trim()) {
            processAccumulatedTranscript();
          }
        }, silenceThreshold);
      }

      if (interimTranscript) {
        onInterimTranscript?.(interimTranscript);
      }

      if (finalTranscript) {
        accumulatedTranscript.current += finalTranscript;
      }
    };

    recognition.onerror = (event: any) => {
      console.error('❌ [Continuous] Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Process accumulated transcript before restarting
        if (accumulatedTranscript.current.trim()) {
          processAccumulatedTranscript();
        } else {
          // Restart recognition if no speech detected and no accumulated text
          if (isListening) {
            setTimeout(() => {
              if (recognitionRef.current && isListening) {
                recognitionRef.current.start();
              }
            }, 100);
          }
        }
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      onRecordingStateChange?.(false);
      
      // Clear timeout
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
        recognitionTimeoutRef.current = null;
      }
      
      // Process any accumulated transcript before restarting
      if (accumulatedTranscript.current.trim() && !isProcessingRef.current) {
        processAccumulatedTranscript();
      }
      
      // Restart if we're still listening and not processing/speaking
      if (isListening && !isProcessingRef.current && !isSpeaking) {
        setTimeout(() => {
          if (recognitionRef.current && isListening && !isRecording) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              console.error('Error restarting recognition:', err);
              // Try again after a longer delay
              setTimeout(() => {
                if (recognitionRef.current && isListening && !isRecording) {
                  try {
                    recognitionRef.current.start();
                  } catch (err2) {
                    console.error('Error restarting recognition (retry):', err2);
                  }
                }
              }, 500);
            }
          }
        }, 100);
      }
    };

    return recognition;
  }, [isListening, isRecording, isSpeaking, silenceThreshold, onInterimTranscript, onRecordingStateChange]);

  // Process accumulated transcript
  const processAccumulatedTranscript = useCallback(() => {
    const transcript = accumulatedTranscript.current.trim();
    
    if (!transcript) {
      return;
    }
    
    if (isProcessingRef.current) {
      return;
    }
    
    // ✅ Prevent duplicate sends
    if (transcript === lastSentRef.current) {
      accumulatedTranscript.current = ""; // Clear duplicate
      return;
    }
    
    lastSentRef.current = transcript;
    
    isProcessingRef.current = true;
    
    // Stop recognition while processing
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Send transcript
    onTranscript(transcript);
    
    // Track analytics
    Analytics.transcriptionSuccess({
      transcription_duration_ms: Date.now() - lastSpeechTime.current,
      transcription_length: transcript.length,
      mode: 'continuous'
    });
    
    // Clear accumulated
    accumulatedTranscript.current = "";
    
    // Will restart when Maya finishes speaking
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 500);
  }, [onTranscript]);

  // Initialize audio level monitoring
  const initializeAudioMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      micStreamRef.current = stream;
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 256;
      
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Monitor audio levels
      const checkAudioLevel = () => {
        if (!analyserRef.current) return;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average level
        const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        const normalizedLevel = Math.min(average / 128, 1);
        setAudioLevel(normalizedLevel);
        
        if (isListening) {
          requestAnimationFrame(checkAudioLevel);
        }
      };
      
      checkAudioLevel();
      
      return true;
    } catch (error) {
      console.error('❌ [Continuous] Microphone access error:', error);
      return false;
    }
  }, [isListening]);

  // Start listening
  const startListening = useCallback(async () => {
    
    // Initialize audio monitoring
    const audioReady = await initializeAudioMonitoring();
    if (!audioReady) {
      alert('Unable to access microphone. Please check permissions.');
      return;
    }
    
    // Initialize speech recognition
    if (!recognitionRef.current) {
      recognitionRef.current = initializeSpeechRecognition();
    }
    
    if (recognitionRef.current) {
      setIsListening(true);
      isProcessingRef.current = false;
      
      try {
        recognitionRef.current.start();
        
        // Track analytics
        Analytics.startRecording({
          timestamp: new Date().toISOString(),
          mode: 'continuous',
          user_agent: window.navigator.userAgent
        });
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  }, [initializeSpeechRecognition, initializeAudioMonitoring]);

  // Stop listening
  const stopListening = useCallback(() => {
    
    setIsListening(false);
    setIsRecording(false);
    setAudioLevel(0);
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    // Clear timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
      recognitionTimeoutRef.current = null;
    }
    
    // Stop audio monitoring
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Track analytics
    Analytics.stopRecording({
      recording_duration_ms: Date.now() - lastSpeechTime.current,
      success: true,
      mode: 'continuous'
    });
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !isListening && !isSpeaking && !isProcessing) {
      const timer = setTimeout(() => {
        startListening();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, isSpeaking, isProcessing]);

  // Restart listening when Maya stops speaking
  useEffect(() => {
    if (isListening && !isSpeaking && !isProcessing && !isRecording) {
      // Restart recognition after Maya finishes
      const timer = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            // Already started, ignore
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, isProcessing, isListening, isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // Visual states
  const isActive = isListening && !isSpeaking && !isProcessing;
  const showLoader = isTranscribing || isProcessing;

  return (
    <div className="flex items-center gap-3">
      {/* Main control button */}
      <button
        onClick={toggleListening}
        disabled={isProcessing}
        className={`
          relative p-3 rounded-lg transition-all
          ${isListening 
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
            : 'bg-white/10 text-gray-400 hover:bg-white/20'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label={isListening ? 'Stop continuous listening' : 'Start continuous listening'}
      >
        {showLoader ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isListening ? (
          <Wifi className="w-5 h-5" />
        ) : (
          <WifiOff className="w-5 h-5" />
        )}

        {/* Recording indicator */}
        {isRecording && (
          <span className="absolute -top-1 -right-1 w-3 h-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
        )}
      </button>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm">
        {isListening && (
          <>
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-green-400">
              {isRecording ? 'Listening...' : 
               isSpeaking ? 'Maya speaking...' : 
               isProcessing ? 'Processing...' : 'Ready'}
            </span>
          </>
        )}
      </div>

      {/* Audio level indicator */}
      {isListening && isRecording && (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 h-${Math.max(1, Math.floor(audioLevel * 5) - i)} 
                         bg-green-400/60 rounded-full transition-all duration-100`}
              style={{ height: `${Math.max(4, audioLevel * 20 * (1 - i * 0.15))}px` }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

ContinuousConversation.displayName = 'ContinuousConversation';