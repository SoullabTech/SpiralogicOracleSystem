// MicHUD - Voice input component with idle/listening/confirm states
// Web Speech API fallback and voice metadata emission
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useElementTheme } from '@/hooks/useElementTheme';

export type VoiceState = 'idle' | 'listening' | 'confirm';

export interface VoiceMeta {
  confidence: number;
  isFinal: boolean;
  timestamp: number;
  language: string;
}

export interface VoiceResult {
  text: string;
  voiceMeta: VoiceMeta;
}

interface MicHUDProps {
  onVoiceResult?: (result: VoiceResult) => void;
  className?: string;
}

export function MicHUD({ onVoiceResult, className = '' }: MicHUDProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [currentText, setCurrentText] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const { textClass, bgClass, borderClass } = useElementTheme();
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        
        recognition.onstart = () => {
          setVoiceState('listening');
          setCurrentText('');
        };
        
        recognition.onresult = (event) => {
          const result = event.results[event.results.length - 1];
          const transcript = result[0].transcript;
          
          setCurrentText(transcript);
          
          if (result.isFinal) {
            setVoiceState('confirm');
            
            const voiceResult: VoiceResult = {
              text: transcript.trim(),
              voiceMeta: {
                confidence: result[0].confidence || 0.8,
                isFinal: true,
                timestamp: Date.now(),
                language: recognition.lang,
              },
            };
            
            // Auto-confirm after 2 seconds or emit immediately
            timeoutRef.current = setTimeout(() => {
              handleConfirm(voiceResult);
            }, 2000);
          }
        };
        
        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          setVoiceState('idle');
          setCurrentText('');
        };
        
        recognition.onend = () => {
          if (voiceState === 'listening') {
            setVoiceState('idle');
            setCurrentText('');
          }
        };
        
        recognitionRef.current = recognition;
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [voiceState]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && voiceState === 'idle') {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.warn('Speech recognition start error:', error);
      }
    }
  }, [voiceState]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && voiceState === 'listening') {
      recognitionRef.current.stop();
    }
  }, [voiceState]);

  const handleConfirm = useCallback((result: VoiceResult) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    onVoiceResult?.(result);
    setVoiceState('idle');
    setCurrentText('');
  }, [onVoiceResult]);

  const handleCancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setVoiceState('idle');
    setCurrentText('');
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (voiceState === 'idle') {
          startListening();
        } else if (voiceState === 'listening') {
          stopListening();
        }
      } else if (event.key === 'Escape' && voiceState !== 'idle') {
        event.preventDefault();
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [voiceState, startListening, stopListening, handleCancel]);

  if (!isSupported) {
    return (
      <div className={`text-app-muted text-caption text-center ${className}`}>
        Voice input not supported
      </div>
    );
  }

  // Idle state - floating mic button
  if (voiceState === 'idle') {
    return (
      <button
        onClick={startListening}
        className={`
          w-16 h-16 rounded-full ${bgClass}/20 border-2 ${borderClass}
          flex items-center justify-center
          transition-all duration-apple hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-white/20
          shadow-voice backdrop-blur-lg
          ${className}
        `}
        aria-label="Start voice input (Cmd+Space)"
        title="Hold Cmd+Space to speak"
      >
        <svg className={`w-8 h-8 ${textClass}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3z"/>
          <path d="M19 10v1a7 7 0 01-14 0v-1"/>
          <path d="M12 18v4"/>
          <path d="M8 22h8"/>
        </svg>
      </button>
    );
  }

  // Listening state - pulsing with waveform
  if (voiceState === 'listening') {
    return (
      <div className={`flex flex-col items-center space-y-4 ${className}`}>
        <button
          onClick={stopListening}
          className={`
            w-20 h-20 rounded-full ${bgClass}/30 border-2 ${borderClass}
            flex items-center justify-center
            animate-pulse transition-all duration-apple
            focus:outline-none focus:ring-2 focus:ring-white/20
            shadow-voice backdrop-blur-lg
          `}
          aria-label="Stop listening"
        >
          <svg className={`w-10 h-10 ${textClass}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3z"/>
            <path d="M19 10v1a7 7 0 01-14 0v-1"/>
          </svg>
        </button>
        
        {currentText && (
          <div className="bg-app-surface/95 backdrop-blur-lg rounded-apple px-4 py-2 max-w-xs">
            <p className={`text-body ${textClass} text-center`}>
              {currentText}
            </p>
          </div>
        )}
        
        <p className="text-app-muted text-caption">Listening...</p>
      </div>
    );
  }

  // Confirm state - show text with confirm/cancel options
  if (voiceState === 'confirm') {
    const finalResult: VoiceResult = {
      text: currentText.trim(),
      voiceMeta: {
        confidence: 0.8,
        isFinal: true,
        timestamp: Date.now(),
        language: 'en-US',
      },
    };

    return (
      <div className={`flex flex-col items-center space-y-4 ${className}`}>
        <div className="bg-app-surface/95 backdrop-blur-lg rounded-apple px-6 py-4 max-w-sm shadow-apple">
          <p className={`text-body ${textClass} text-center mb-4`}>
            "{currentText}"
          </p>
          
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => handleConfirm(finalResult)}
              className={`
                px-4 py-2 rounded-apple-sm ${bgClass} ${textClass}
                transition-all duration-apple hover:opacity-80
                focus:outline-none focus:ring-2 focus:ring-white/20
              `}
              aria-label="Confirm voice input"
            >
              Confirm
            </button>
            
            <button
              onClick={handleCancel}
              className="
                px-4 py-2 rounded-apple-sm bg-app-border text-app-muted
                transition-all duration-apple hover:bg-app-surface
                focus:outline-none focus:ring-2 focus:ring-white/20
              "
              aria-label="Cancel voice input"
            >
              Cancel
            </button>
          </div>
        </div>
        
        <p className="text-app-muted text-caption">Auto-confirm in 2s...</p>
      </div>
    );
  }

  return null;
}