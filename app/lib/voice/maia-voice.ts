"use client";

/**
 * Maya Voice System - Web Speech API Integration
 * Provides immediate voice functionality with mystical Oracle characteristics
 */

export interface MayaVoiceConfig {
  rate: number;        // Speech rate (0.1 - 10)
  pitch: number;       // Voice pitch (0 - 2)
  volume: number;      // Volume level (0 - 1)
  lang: string;        // Language code
  voiceURI?: string;   // Specific voice URI
  mysticalEffect?: boolean; // Add mystical processing
}

export interface VoiceState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  supportedVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
}

// Maya's natural voice configuration - Alloy voice profile
export const MAYA_VOICE_CONFIG: MayaVoiceConfig = {
  rate: 0.95,          // Natural conversational pace
  pitch: 1.0,          // Neutral pitch for grounded presence
  volume: 0.85,        // Comfortable listening level
  lang: 'en-US',       // Clear English
  mysticalEffect: false // No artificial effects - natural presence
};

// Natural greetings for Maya - conversational presence
export const MAYA_GREETINGS = [
  "Hey there. I'm Maya. What's on your mind?",
  "Hi. I'm here when you're ready to explore what's stirring.",
  "Hello. I'm Maya. What would be helpful to look at together?",
  "Good to connect with you. What's present for you right now?",
  "Hey. I'm Maya. Take your time, I'm listening."
];

/**
 * Enhanced Maya Voice System Class
 */
export class MayaVoiceSystem {
  private utterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private config: MayaVoiceConfig;
  private state: VoiceState;
  private onStateChange?: (state: VoiceState) => void;

  constructor(config: Partial<MayaVoiceConfig> = {}, onStateChange?: (state: VoiceState) => void) {
    this.config = { ...MAYA_VOICE_CONFIG, ...config };
    this.onStateChange = onStateChange;
    this.state = {
      isPlaying: false,
      isPaused: false,
      currentText: '',
      supportedVoices: [],
      selectedVoice: null
    };

    this.initializeVoices();
  }

  /**
   * Initialize available voices and select the best one for Maya
   */
  private async initializeVoices(): Promise<void> {
    // Wait for voices to be loaded
    if (typeof window === 'undefined') return;
    
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      this.state.supportedVoices = voices;
      this.state.selectedVoice = this.selectBestVoiceForMaya(voices);
      this.updateState();
    };

    // Some browsers load voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Try to load voices immediately
    loadVoices();
    
    // Fallback: wait a bit and try again
    setTimeout(loadVoices, 100);
  }

  /**
   * Select the most suitable voice for Maya&apos;s mystical character
   */
  private selectBestVoiceForMaya(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (!voices.length) return null;

    // Preferred voices for Maya (in order of preference)
    const preferredVoices = [
      'Samantha',           // macOS - warm, clear female voice
      'Victoria',           // macOS - sophisticated female voice
      'Allison',           // macOS - friendly female voice
      'Karen',             // Windows - clear female voice
      'Hazel',             // Windows - warm female voice
      'Zira',              // Windows - professional female voice
      'Google UK English Female',  // Chrome - clear pronunciation
      'Microsoft Aria Online (Natural) - English (United States)', // Modern neural voice
      'en-US-AriaNeural',  // Azure voice
      'en-GB-LibbyNeural'  // British accent for mystical touch
    ];

    // First, try exact matches
    for (const preferred of preferredVoices) {
      const voice = voices.find(v => v.name === preferred);
      if (voice) return voice;
    }

    // Then try partial matches for female voices
    const femaleKeywords = ['female', 'woman', 'aria', 'samantha', 'victoria', 'karen', 'hazel', 'libby'];
    for (const keyword of femaleKeywords) {
      const voice = voices.find(v => 
        v.name.toLowerCase().includes(keyword.toLowerCase()) && 
        v.lang.startsWith('en')
      );
      if (voice) return voice;
    }

    // Fallback: any English voice, preferring local voices
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    const localVoice = englishVoices.find(v => v.localService);
    
    return localVoice || englishVoices[0] || voices[0];
  }

  /**
   * Update state and notify listeners
   */
  private updateState(): void {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state });
    }
  }

  /**
   * Play Maya&apos;s greeting
   */
  public async playGreeting(): Promise<void> {
    const greeting = MAYA_GREETINGS[Math.floor(Math.random() * MAYA_GREETINGS.length)];
    return this.speak(greeting);
  }

  /**
   * Speak text with Maya's voice using ElevenLabs (with fallback to Web Speech API)
   */
  public async speak(text: string): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Speech synthesis not available in server environment');
    }

    if (!text.trim()) {
      throw new Error('No text provided');
    }

    // Stop any current speech
    this.stop();

    // Apply mystical effects if enabled
    if (this.config.mysticalEffect) {
      text = this.applyMysticalEffects(text);
    }

    // Update state to indicate we're starting
    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.state.currentText = text;
    this.updateState();

    try {
      // First, try OpenAI TTS with Alloy voice
      await this.speakWithOpenAITTS(text);
    } catch (error) {
      console.warn('OpenAI TTS synthesis failed, falling back to Web Speech API:', error);
      
      // Fallback to Web Speech API
      try {
        await this.speakWithWebSpeechAPI(text);
      } catch (fallbackError) {
        console.error('All voice synthesis methods failed:', fallbackError);
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.currentText = '';
        this.updateState();
        throw fallbackError;
      }
    }
  }

  /**
   * Speak using OpenAI TTS API (Alloy voice)
   */
  private async speakWithOpenAITTS(text: string): Promise<void> {
    const response = await fetch('/api/voice/openai-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: 'alloy',
        speed: 0.95
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS API failed: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.currentText = '';
        this.updateState();
        resolve();
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.currentText = '';
        this.updateState();
        reject(new Error('Audio playback failed'));
      };
      
      // Store reference for pause/resume functionality
      this.currentAudio = audio;
      
      audio.play().catch(reject);
    });
  }

  /**
   * Fallback to Web Speech API
   */
  private async speakWithWebSpeechAPI(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create new utterance
      this.utterance = new SpeechSynthesisUtterance(text);
      
      // Apply Maya's voice configuration
      this.utterance.rate = this.config.rate;
      this.utterance.pitch = this.config.pitch;
      this.utterance.volume = this.config.volume;
      this.utterance.lang = this.config.lang;

      // Set voice if available
      if (this.state.selectedVoice) {
        this.utterance.voice = this.state.selectedVoice;
      }

      // Set up event handlers
      this.utterance.onend = () => {
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.currentText = '';
        this.updateState();
        resolve();
      };

      this.utterance.onerror = (event) => {
        console.error('Maya voice synthesis error:', event.error);
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.currentText = '';
        this.updateState();
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.utterance.onpause = () => {
        this.state.isPaused = true;
        this.updateState();
      };

      this.utterance.onresume = () => {
        this.state.isPaused = false;
        this.updateState();
      };

      // Speak the text
      speechSynthesis.speak(this.utterance);
    });
  }

  /**
   * Apply mystical effects to text before speaking
   */
  private applyMysticalEffects(text: string): string {
    // Simply clean the text without adding pauses
    // Let the TTS engine handle natural pacing
    return text
      .replace(/\.{3,}/g, ',')     // Replace ellipses with comma
      .replace(/—/g, ',')           // Replace em-dash with comma
      .replace(/\s+/g, ' ')        // Normalize whitespace
      .trim();
  }

  /**
   * Pause current speech
   */
  public pause(): void {
    if (this.state.isPlaying && !this.state.isPaused) {
      if (this.currentAudio) {
        this.currentAudio.pause();
      } else {
        speechSynthesis.pause();
      }
      this.state.isPaused = true;
      this.updateState();
    }
  }

  /**
   * Resume paused speech
   */
  public resume(): void {
    if (this.state.isPaused) {
      if (this.currentAudio) {
        this.currentAudio.play();
      } else {
        speechSynthesis.resume();
      }
      this.state.isPaused = false;
      this.updateState();
    }
  }

  /**
   * Stop current speech
   */
  public stop(): void {
    // Stop ElevenLabs audio if playing
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    
    // Stop Web Speech API
    speechSynthesis.cancel();
    
    // Reset state
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.currentText = '';
    this.updateState();
  }

  /**
   * Check if speech synthesis is supported
   */
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Get current state
   */
  public getState(): VoiceState {
    return { ...this.state };
  }

  /**
   * Update voice configuration
   */
  public updateConfig(newConfig: Partial<MayaVoiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Set specific voice
   */
  public setVoice(voice: SpeechSynthesisVoice): void {
    this.state.selectedVoice = voice;
    this.updateState();
  }

  /**
   * Get available voices
   */
  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return [...this.state.supportedVoices];
  }
}

/**
 * Global Maya voice instance (singleton)
 */
let globalMayaVoice: MayaVoiceSystem | null = null;

/**
 * Get the global Maya voice instance
 */
export function getMayaVoice(onStateChange?: (state: VoiceState) => void): MayaVoiceSystem {
  if (!globalMayaVoice) {
    globalMayaVoice = new MayaVoiceSystem({}, onStateChange);
  }
  return globalMayaVoice;
}

/**
 * Quick function to play Maya&apos;s greeting
 */
export async function playMayaGreeting(): Promise<void> {
  const maya = getMayaVoice();
  await maya.playGreeting();
}

/**
 * Quick function to make Maya speak
 */
export async function mayaSpeak(text: string): Promise<void> {
  const maya = getMayaVoice();
  await maya.speak(text);
}

// Export the default instance as mayaVoice for backward compatibility
export const mayaVoice = getMayaVoice();

/**
 * Enhanced voice service that tries multiple methods
 */
export class EnhancedVoiceService {
  private mayaVoice: MayaVoiceSystem;
  
  constructor(onStateChange?: (state: VoiceState) => void) {
    this.mayaVoice = new MayaVoiceSystem({}, onStateChange);
  }

  /**
   * Try voice synthesis with multiple fallbacks
   */
  public async synthesize(text: string): Promise<void> {
    try {
      // First, try Northflank/Sesame service (existing integration)
      await this.tryServerVoiceSynthesis(text);
    } catch (error) {
      console.log('Server voice synthesis failed, using Web Speech API:', error);
      
      // Fallback to Web Speech API
      if (MayaVoiceSystem.isSupported()) {
        await this.mayaVoice.speak(text);
      } else {
        throw new Error('No voice synthesis available');
      }
    }
  }

  /**
   * Try server-side voice synthesis (existing Northflank integration)
   */
  private async tryServerVoiceSynthesis(text: string): Promise<void> {
    const response = await fetch('/api/voice/sesame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (response.ok) {
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };
        audio.play().catch(reject);
      });
    } else {
      throw new Error(`Server synthesis failed: ${response.status}`);
    }
  }
}