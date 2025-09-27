"use client";

/**
 * DEPRECATED: Use useMayaVoice from '@/hooks/useMayaVoice' instead
 * This hook wraps the legacy MayaVoiceSystem and will be removed in a future version
 *
 * @deprecated Use useMayaVoice for new implementations
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  MayaVoiceSystem, 
  VoiceState, 
  getMayaVoice, 
  playMayaGreeting, 
  mayaSpeak,
  EnhancedVoiceService
} from '@/lib/voice/maya-voice';

export interface UseMayaVoiceReturn {
  // State
  voiceState: VoiceState;
  isSupported: boolean;
  isReady: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  lastError: string | null;
  error: string | null;
  
  // Actions
  speak: (text: string) => Promise<void>;
  playGreeting: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  
  // Configuration
  setVoice: (voice: SpeechSynthesisVoice | null) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  getAvailableVoices: () => SpeechSynthesisVoice[];
  
  // Auto-speak
  autoSpeak: boolean;
  setAutoSpeak: (enabled: boolean) => void;
  
  // Error handling
  clearError: () => void;
  
  // Enhanced service (with server fallback)
  synthesizeWithFallback: (text: string) => Promise<void>;
}

/**
 * Main hook for Maya voice functionality
 */
export function useMayaVoice(): UseMayaVoiceReturn {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isPlaying: false,
    isPaused: false,
    currentText: '',
    supportedVoices: [],
    selectedVoice: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [mayaVoice] = useState(() => getMayaVoice(setVoiceState));
  const [enhancedService] = useState(() => new EnhancedVoiceService(setVoiceState));

  // Check if speech synthesis is supported
  const isSupported = MayaVoiceSystem.isSupported();
  const isReady = isSupported && voiceState.supportedVoices.length > 0;

  // Initialize voice system
  useEffect(() => {
    if (isSupported) {
      // Give voices time to load
      const timer = setTimeout(() => {
        setVoiceState(mayaVoice.getState());
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isSupported, mayaVoice]);

  // Speak text with Maya&apos;s voice
  const speak = useCallback(async (text: string): Promise<void> => {
    if (!isSupported) {
      throw new Error('Speech synthesis not supported in this browser');
    }

    setIsLoading(true);
    setError(null);

    try {
      await mayaVoice.speak(text);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Voice synthesis failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, mayaVoice]);

  // Play Maya&apos;s greeting
  const playGreeting = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      throw new Error('Speech synthesis not supported in this browser');
    }

    setIsLoading(true);
    setError(null);

    try {
      await mayaVoice.playGreeting();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Voice greeting failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, mayaVoice]);

  // Enhanced synthesis with server fallback
  const synthesizeWithFallback = useCallback(async (text: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await enhancedService.synthesize(text);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'All voice synthesis methods failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [enhancedService]);

  // Voice controls
  const pause = useCallback(() => {
    mayaVoice.pause();
  }, [mayaVoice]);

  const resume = useCallback(() => {
    mayaVoice.resume();
  }, [mayaVoice]);

  const stop = useCallback(() => {
    mayaVoice.stop();
  }, [mayaVoice]);

  // Configuration
  const setVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    if (voice) {
      mayaVoice.setVoice(voice);
    }
  }, [mayaVoice]);

  const setRate = useCallback((rate: number) => {
    mayaVoice.updateConfig({ rate });
  }, [mayaVoice]);

  const setPitch = useCallback((pitch: number) => {
    mayaVoice.updateConfig({ pitch });
  }, [mayaVoice]);

  const setVolume = useCallback((volume: number) => {
    mayaVoice.updateConfig({ volume });
  }, [mayaVoice]);

  const getAvailableVoices = useCallback(() => {
    return mayaVoice.getAvailableVoices();
  }, [mayaVoice]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    voiceState,
    isSupported,
    isReady,
    isLoading,
    isPlaying: voiceState.isPlaying,
    lastError: error,
    error,
    
    // Actions
    speak,
    playGreeting,
    pause,
    resume,
    stop,
    
    // Configuration
    setVoice,
    setRate,
    setPitch,
    setVolume,
    getAvailableVoices,
    
    // Auto-speak
    autoSpeak,
    setAutoSpeak,
    
    // Error handling
    clearError,
    
    // Enhanced service
    synthesizeWithFallback
  };
}

/**
 * Hook for simple Maya greeting functionality
 */
export function useMayaGreeting() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playGreeting = useCallback(async () => {
    setIsPlaying(true);
    setError(null);

    try {
      await playMayaGreeting();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Greeting failed';
      setError(errorMessage);
    } finally {
      setIsPlaying(false);
    }
  }, []);

  return {
    isPlaying,
    error,
    playGreeting,
    isSupported: MayaVoiceSystem.isSupported()
  };
}

/**
 * Hook for Maya chat integration
 */
export function useMayaChat() {
  const { speak, voiceState, isLoading, error, synthesizeWithFallback } = useMayaVoice();
  const [autoSpeak, setAutoSpeak] = useState(false);

  // Speak Oracle responses automatically if enabled
  const speakOracleResponse = useCallback(async (text: string, useServerFirst: boolean = true) => {
    if (!autoSpeak) return;

    try {
      if (useServerFirst) {
        await synthesizeWithFallback(text);
      } else {
        await speak(text);
      }
    } catch (err) {
      console.warn('Auto-speak failed:', err);
    }
  }, [autoSpeak, speak, synthesizeWithFallback]);

  return {
    voiceState,
    isLoading,
    error,
    autoSpeak,
    setAutoSpeak,
    speakOracleResponse,
    speak,
    synthesizeWithFallback
  };
}

/**
 * Simple utility hook for voice status
 */
export function useVoiceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    webSpeechSupported: false,
    voicesLoaded: false,
    voiceCount: 0,
    hasEnglishVoices: false,
    hasFemaleVoices: false
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkCapabilities = () => {
      const isSupported = MayaVoiceSystem.isSupported();
      const voices = isSupported ? speechSynthesis.getVoices() : [];
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      const femaleVoices = voices.filter(v => 
        v.name.toLowerCase().includes('female') || 
        ['samantha', 'victoria', 'karen', 'hazel', 'aria', 'libby'].some(name => 
          v.name.toLowerCase().includes(name)
        )
      );

      setCapabilities({
        webSpeechSupported: isSupported,
        voicesLoaded: voices.length > 0,
        voiceCount: voices.length,
        hasEnglishVoices: englishVoices.length > 0,
        hasFemaleVoices: femaleVoices.length > 0
      });
    };

    // Check immediately
    checkCapabilities();

    // Listen for voice changes
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = checkCapabilities;
    }

    // Fallback check after delay
    const timer = setTimeout(checkCapabilities, 500);

    return () => {
      clearTimeout(timer);
      if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  return capabilities;
}