// Voice synthesis unified API
// Routes between different TTS providers based on configuration

import { resolveDefaultVoice } from '@/lib/voice/config';
import { elevenlabsTTS } from '@/lib/voice/providers/elevenlabs';

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voice?: SpeechSynthesisVoice;
  volume?: number;
  voiceId?: string;
}

// Sesame TTS integration placeholder - using Web Speech API for now
async function sesameSpeak(opts: { text: string; voice: string }): Promise<Blob> {
  // For now, use Web Speech API as a fallback
  // TODO: Replace with actual Sesame TTS integration when available
  return new Promise((resolve, reject) => {
    try {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(opts.text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to find Maya-like voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.localService
      ) || voices.find(voice => 
        voice.lang.startsWith('en')
      ) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
      
      // Create empty blob as placeholder - Web Speech API doesn't return audio data
      resolve(new Blob([], { type: 'audio/wav' }));
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Main speak function that routes through provider configuration
 */
export async function speak(text: string, opts?: { voiceId?: string }): Promise<Blob> {
  const voice = resolveDefaultVoice();
  const chosenId = opts?.voiceId ?? voice.id;

  if (voice.provider === 'elevenlabs') {
    const blob = await elevenlabsTTS({ text, voiceId: chosenId });
    return blob;
  }

  // Default beta path: Sesame/Maya
  const blob = await sesameSpeak({ text, voice: chosenId });
  return blob;
}

/**
 * Legacy Web Speech API speak function for backwards compatibility
 */
export function speakLegacy(text: string, options: SpeakOptions = {}): void {
  try {
    // Check if Web Speech is supported
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech parameters
    utterance.rate = options.rate ?? 0.95; // Slightly slower for greetings/natural flow
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    // Try to find a good voice if not specified
    if (!options.voice) {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Prefer English, local voices
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.localService
        ) || voices.find(voice => 
          voice.lang.startsWith('en')
        ) || voices[0];
        
        utterance.voice = preferredVoice;
      }
    } else {
      utterance.voice = options.voice;
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.info('[speak] playing text', { 
        length: text.length, 
        rate: utterance.rate,
        voice: utterance.voice?.name 
      });
    }

    // Speak the text
    window.speechSynthesis.speak(utterance);

  } catch (error) {
    console.warn('Speech synthesis failed:', error);
  }
}

/**
 * Check if speech synthesis is available
 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Get available voices
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  return window.speechSynthesis.getVoices();
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}