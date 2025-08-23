'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { resolveDefaultVoice, type VoiceChoice } from '@/lib/voice/config';
import { features } from '@/lib/config/features';
import { logger } from '@/lib/shared/observability/logger';

export interface VoiceSessionState {
  sessionId: string | null;
  conversationId: string | null;
  isActive: boolean;
  isInitializing: boolean;
  isProcessing: boolean;
  error: string | null;
  voiceProfile: any | null;
  selectedVoice: VoiceChoice;
}

export interface VoiceProcessingResult {
  response: {
    text: string;
    audioUrl?: string;
    confidence: number;
    consciousnessState: {
      archetypes: any[];
      dominantElement: string;
      micropsiConfidence: number;
      spiralogicPhase: string;
    };
    insights: string[];
    memoryStored: boolean;
  };
}

export interface UseVoiceSessionOptions {
  conversationId?: string;
  autoInitialize?: boolean;
  onResponse?: (result: VoiceProcessingResult) => void;
  onError?: (error: string) => void;
  voiceChoice?: VoiceChoice;
}

export function useVoiceSession(options: UseVoiceSessionOptions = {}) {
  const {
    conversationId,
    autoInitialize = false,
    onResponse,
    onError,
    voiceChoice
  } = options;

  const [state, setState] = useState<VoiceSessionState>({
    sessionId: null,
    conversationId: null,
    isActive: false,
    isInitializing: false,
    isProcessing: false,
    error: null,
    voiceProfile: null,
    selectedVoice: voiceChoice || resolveDefaultVoice()
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
    }
  }, []);

  // Auto-initialize session if requested
  useEffect(() => {
    if (autoInitialize && !state.isActive && !state.isInitializing) {
      initializeSession();
    }
  }, [autoInitialize]);

  // Update voice choice when prop changes
  useEffect(() => {
    if (voiceChoice && voiceChoice.id !== state.selectedVoice.id) {
      setState(prev => ({ ...prev, selectedVoice: voiceChoice }));
      
      // If session is active, adapt voice profile
      if (state.isActive) {
        adaptVoiceProfile({
          archeType: getArchetypeForVoice(voiceChoice),
          voiceId: voiceChoice.id
        });
      }
    }
  }, [voiceChoice, state.selectedVoice.id, state.isActive]);

  const makeVoiceRequest = useCallback(async (body: any) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/oracle/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Voice request failed');
      }

      return await response.json();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw error;
    }
  }, []);

  const initializeSession = useCallback(async () => {
    if (!features.oracle.voiceEnabled) {
      const error = 'Voice interface is not enabled';
      setState(prev => ({ ...prev, error }));
      onError?.(error);
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isInitializing: true, 
      error: null 
    }));

    try {
      const result = await makeVoiceRequest({
        action: 'initialize',
        conversationId: conversationId || `voice_${Date.now()}`
      });

      if (result.success) {
        setState(prev => ({
          ...prev,
          sessionId: result.session.sessionId,
          conversationId: result.session.conversationId,
          voiceProfile: result.session.voiceProfile,
          isActive: true,
          isInitializing: false,
          error: null
        }));

        logger.info('Voice session initialized', {
          sessionId: result.session.sessionId,
          voiceProfile: result.session.voiceProfile?.archeType
        });
      } else {
        throw new Error('Session initialization failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to initialize voice session';
      setState(prev => ({ 
        ...prev, 
        isInitializing: false, 
        error: errorMessage 
      }));
      onError?.(errorMessage);
      logger.error('Voice session initialization failed', { error });
    }
  }, [conversationId, makeVoiceRequest, onError]);

  const processVoiceInput = useCallback(async (
    text: string,
    audioMetadata?: {
      emotionalTone?: string;
      energyLevel?: number;
      confidence?: number;
      duration?: number;
    }
  ) => {
    if (!state.isActive || !state.sessionId) {
      const error = 'Voice session not active';
      setState(prev => ({ ...prev, error }));
      onError?.(error);
      return null;
    }

    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      error: null 
    }));

    try {
      const result = await makeVoiceRequest({
        action: 'process',
        text,
        conversationId: state.conversationId,
        audioMetadata: {
          emotionalTone: audioMetadata?.emotionalTone || inferEmotionalTone(text),
          energyLevel: audioMetadata?.energyLevel || inferEnergyLevel(text),
          confidence: audioMetadata?.confidence || 0.9,
          duration: audioMetadata?.duration || text.length * 50,
          ...audioMetadata
        },
        sessionContext: {
          spiralogicPhase: getSpiralogicPhase(),
          elementalResonance: getElementalResonance(state.selectedVoice),
          voiceChoice: state.selectedVoice
        }
      });

      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          isProcessing: false 
        }));

        // Play audio if available
        if (result.response.audioUrl && audioRef.current) {
          try {
            audioRef.current.src = result.response.audioUrl;
            await audioRef.current.play();
          } catch (audioError) {
            console.warn('Audio playback failed:', audioError);
          }
        }

        onResponse?.(result);
        return result;
      } else {
        throw new Error('Voice processing failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to process voice input';
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: errorMessage 
      }));
      onError?.(errorMessage);
      logger.error('Voice processing failed', { error, text });
      return null;
    }
  }, [state.isActive, state.sessionId, state.conversationId, state.selectedVoice, makeVoiceRequest, onResponse, onError]);

  const adaptVoiceProfile = useCallback(async (adaptations: any) => {
    if (!state.isActive || !state.sessionId) {
      return;
    }

    try {
      const result = await makeVoiceRequest({
        action: 'adapt',
        conversationId: state.conversationId,
        voiceAdaptations: adaptations
      });

      if (result.success) {
        setState(prev => ({
          ...prev,
          voiceProfile: result.updatedProfile
        }));

        logger.info('Voice profile adapted', {
          sessionId: state.sessionId,
          adaptations
        });
      }
    } catch (error: any) {
      logger.warn('Voice profile adaptation failed', { error });
    }
  }, [state.isActive, state.sessionId, state.conversationId, makeVoiceRequest]);

  const endSession = useCallback(async () => {
    if (!state.isActive) return;

    try {
      await makeVoiceRequest({
        action: 'end',
        conversationId: state.conversationId
      });

      setState({
        sessionId: null,
        conversationId: null,
        isActive: false,
        isInitializing: false,
        isProcessing: false,
        error: null,
        voiceProfile: null,
        selectedVoice: state.selectedVoice
      });

      // Stop any playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      logger.info('Voice session ended', {
        sessionId: state.sessionId
      });
    } catch (error: any) {
      logger.error('Failed to end voice session', { error });
      // Force reset state anyway
      setState(prev => ({
        ...prev,
        isActive: false,
        sessionId: null,
        conversationId: null,
        isProcessing: false
      }));
    }
  }, [state.isActive, state.conversationId, state.sessionId, makeVoiceRequest]);

  const changeVoice = useCallback((newVoice: VoiceChoice) => {
    setState(prev => ({ ...prev, selectedVoice: newVoice }));
    
    if (state.isActive) {
      adaptVoiceProfile({
        archeType: getArchetypeForVoice(newVoice),
        voiceId: newVoice.id,
        provider: newVoice.provider
      });
    }
  }, [state.isActive, adaptVoiceProfile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return {
    ...state,
    initializeSession,
    processVoiceInput,
    endSession,
    changeVoice,
    adaptVoiceProfile,
    // Utility methods
    playAudio: (url: string) => {
      if (audioRef.current) {
        audioRef.current.src = url;
        return audioRef.current.play();
      }
      return Promise.reject(new Error('Audio not available'));
    },
    stopAudio: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };
}

// Helper functions
function inferEmotionalTone(text: string): string {
  const tones = {
    'happy': /\b(happy|joy|excited|wonderful|amazing|great|love|fantastic)\b/i,
    'sad': /\b(sad|depressed|down|hurt|pain|sorrow|grief)\b/i,
    'anxious': /\b(anxious|worried|nervous|stress|fear|scared)\b/i,
    'angry': /\b(angry|mad|furious|irritated|annoyed|frustrated)\b/i,
    'calm': /\b(calm|peaceful|serene|relaxed|centered|balanced)\b/i,
    'curious': /\b(wonder|curious|question|explore|understand|learn)\b/i
  };

  for (const [tone, pattern] of Object.entries(tones)) {
    if (pattern.test(text)) return tone;
  }
  return 'neutral';
}

function inferEnergyLevel(text: string): number {
  const highEnergy = /\b(excited|amazing|incredible|awesome|fantastic|energy|!!!)\b/i;
  const lowEnergy = /\b(tired|exhausted|drained|low|quiet|still|\.\.\.)\b/i;
  
  if (highEnergy.test(text)) return 0.8;
  if (lowEnergy.test(text)) return 0.3;
  return 0.5;
}

function getArchetypeForVoice(voice: VoiceChoice): string {
  const archetypeMapping: Record<string, string> = {
    'maya': 'balanced_guide',
    'elder_sage': 'wise_elder',
    'compassionate_friend': 'heart_companion',
    'creative_catalyst': 'inspiring_muse',
    'clear_guide': 'mental_clarity'
  };
  return archetypeMapping[voice.id] || 'balanced_guide';
}

function getElementalResonance(voice: VoiceChoice): string {
  const elementMapping: Record<string, string> = {
    'maya': 'aether',
    'elder_sage': 'earth',
    'compassionate_friend': 'water',
    'creative_catalyst': 'fire',
    'clear_guide': 'air'
  };
  return elementMapping[voice.id] || 'aether';
}

function getSpiralogicPhase(): string {
  // This could be determined from user profile or conversation context
  // For now, return a default that encourages integration
  return 'integration';
}