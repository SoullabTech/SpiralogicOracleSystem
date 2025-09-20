/**
 * Maia Voice System - ElevenLabs "Aunt Annie" + Sesame Intelligence
 * Modern, everyday, soulful, intelligent voice for the Oracle
 */

import { AgentConfig } from '../agent-config';
import { VoicePreprocessor } from './VoicePreprocessor';

interface MaiaVoiceConfig {
  elevenLabsApiKey?: string;
  voiceId: string; // Dynamic based on agent
  sesameApiKey?: string;
  fallbackToWebSpeech: boolean;
  agentConfig?: AgentConfig; // Agent configuration for voice selection
  naturalSettings: {
    rate: number;
    pitch: number;
    volume: number;
    stability: number;
    clarity: number;
  };
}

interface VoiceState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentText: string;
  voiceType: 'elevenlabs' | 'webspeech' | 'sesame';
  error?: string;
}

export class MaiaVoiceSystem {
  private config: MaiaVoiceConfig;
  private state: VoiceState;
  private audioContext?: AudioContext;
  private currentAudio?: HTMLAudioElement;
  private listeners: ((state: VoiceState) => void)[] = [];

  constructor(config?: Partial<MaiaVoiceConfig>) {
    // Determine voice settings based on agent
    const isAnthony = config?.agentConfig?.voice === 'anthony';
    const defaultVoiceId = isAnthony 
      ? 'c6SfcYrb2t09NHXiT80T'  // Anthony's voice
      : 'EXAVITQu4vr4xnSDxMaL'; // Maia's voice
    
    this.config = {
      voiceId: config?.voiceId || defaultVoiceId,
      elevenLabsApiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
      fallbackToWebSpeech: true,
      agentConfig: config?.agentConfig,
      naturalSettings: isAnthony ? {
        rate: 0.9,     // Slower for male voice
        pitch: 0.85,   // Lower pitch for male  
        volume: 0.9,   // Slightly louder
        stability: 0.85, // More stable for deeper voice
        clarity: 0.95   // High clarity for gravitas
      } : {
        rate: 0.95,    // Natural female pace
        pitch: 1.05,   // Slightly higher for warmth  
        volume: 0.85,  // Softer and more comfortable
        stability: 0.8, // Natural variation
        clarity: 0.9    // High clarity
      },
      ...config
    };

    this.state = {
      isPlaying: false,
      isPaused: false,
      isLoading: false,
      currentText: '',
      voiceType: 'sesame' // Default to Sesame instead of ElevenLabs
    };

    // Initialize audio context for better browser compatibility
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('AudioContext not available:', error);
      }
    }
  }

  // Subscribe to voice state changes
  subscribe(listener: (state: VoiceState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private updateState(updates: Partial<VoiceState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  // Clean text for speech without artificial pauses
  private enhanceTextForSpeech(text: string): string {
    // Remove stage directions that shouldn't be spoken
    let processedText = VoicePreprocessor.extractSpokenContent(text);

    // Simply return the clean text without adding pauses
    // Let the TTS engine handle natural pacing
    return processedText.trim();
  }

  // Generate Maia's natural greeting
  getNaturalGreeting(): string {
    const greetings = [
      "Hey there. I'm Maia. Good to connect with you.",
      "Hi. I'm here when you're ready to explore what's on your mind.",
      "Hello. I'm Maia, and I'm listening. What's stirring for you?",
      "Hey. Let's see what we can discover together. How are you feeling?",
      "Hi there. I'm Maia. What would it be helpful to talk about?"
    ];
    
    return this.enhanceTextForSpeech(
      greetings[Math.floor(Math.random() * greetings.length)]
    );
  }

  // ElevenLabs TTS with Aunt Annie voice
  private async speakWithElevenLabs(text: string): Promise<void> {
    if (!this.config.elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    this.updateState({ isLoading: true, currentText: text, voiceType: 'elevenlabs' });

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.config.elevenLabsApiKey
        },
        body: JSON.stringify({
          text: this.enhanceTextForSpeech(text),
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: this.config.naturalSettings.stability,
            similarity_boost: this.config.naturalSettings.clarity,
            style: 0.0, // Natural conversational style
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return this.playAudioUrl(audioUrl);
    } catch (error) {
      console.error('ElevenLabs TTS failed:', error);
      this.updateState({ error: error.message });
      throw error;
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  // Sesame conversational intelligence + voice - DISABLED
  private async speakWithSesame(text: string, context?: any): Promise<void> {
    // Sesame CI has been disabled - using internal response system
    // Redirect to ElevenLabs for voice synthesis
    console.log('Sesame CI disabled, using ElevenLabs directly');
    return this.speakWithElevenLabs(text);
  }

  // Web Speech API fallback with agent-appropriate characteristics
  private async speakWithWebSpeech(text: string): Promise<void> {
    if (!('speechSynthesis' in window)) {
      throw new Error('Web Speech API not supported');
    }

    this.updateState({ isLoading: true, currentText: text, voiceType: 'webspeech' });

    return new Promise((resolve, reject) => {
      try {
        // Cancel any existing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(this.enhanceTextForSpeech(text));
        
        // Configure voice based on agent
        const isAnthony = this.config.agentConfig?.voice === 'anthony';
        
        if (isAnthony) {
          // Anthony's voice characteristics
          utterance.rate = 0.9;   // Slower, more deliberate
          utterance.pitch = 0.8;  // Lower pitch for male voice
          utterance.volume = 0.9; // Slightly louder
        } else {
          // Maia's voice characteristics  
          utterance.rate = 0.95;  // Natural female pace
          utterance.pitch = 1.05;  // Slightly higher for warmth
          utterance.volume = 0.85; // Softer for comfort
        }
        utterance.lang = 'en-US';

        // Try to select the best available voice based on gender
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = this.selectBestVoice(voices, isAnthony ? 'male' : 'female');
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        // Event handlers
        utterance.onstart = () => {
          this.updateState({ 
            isPlaying: true, 
            isLoading: false, 
            isPaused: false 
          });
        };

        utterance.onend = () => {
          this.updateState({ 
            isPlaying: false, 
            currentText: '' 
          });
          resolve();
        };

        utterance.onerror = (event) => {
          this.updateState({ 
            isPlaying: false, 
            isLoading: false,
            error: event.error 
          });
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        utterance.onpause = () => {
          this.updateState({ isPaused: true });
        };

        utterance.onresume = () => {
          this.updateState({ isPaused: false });
        };

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        this.updateState({ 
          isLoading: false, 
          error: error.message 
        });
        reject(error);
      }
    });
  }

  // Select the best available voice for the agent
  private selectBestVoice(voices: SpeechSynthesisVoice[], gender: 'male' | 'female' = 'female'): SpeechSynthesisVoice | null {
    if (voices.length === 0) return null;
    
    // Score voices based on quality factors
    const scoredVoices = voices.map(voice => {
      let score = 0;
      
      // Strongly prefer local voices (much better quality)
      if (voice.localService) score += 100;
      
      // Prefer English voices
      if (voice.lang.startsWith('en')) score += 50;
      
      // Prefer known high-quality voices based on gender
      const highQualityFemaleVoices = ['Samantha', 'Victoria', 'Allison', 'Ava', 'Karen', 'Hazel', 'Susan', 'Kate'];
      const highQualityMaleVoices = ['Alex', 'Daniel', 'Fred', 'Gordon', 'Lee', 'Oliver', 'Thomas', 'Tom'];
      const voiceName = voice.name;
      
      if (gender === 'male') {
        if (highQualityMaleVoices.some(name => voiceName.includes(name))) {
          score += 40;
        }
      } else {
        if (highQualityFemaleVoices.some(name => voiceName.includes(name))) {
          score += 40;
        }
      }
      
      // Prefer voices matching the desired gender
      const isFemaleVoice = voiceName.toLowerCase().includes('female') || 
          voiceName.toLowerCase().includes('woman') ||
          highQualityFemaleVoices.some(name => voiceName.includes(name));
      
      const isMaleVoice = voiceName.toLowerCase().includes('male') || 
          voiceName.toLowerCase().includes('man') ||
          highQualityMaleVoices.some(name => voiceName.includes(name));
      
      if (gender === 'male' && isMaleVoice) {
        score += 30;
      } else if (gender === 'female' && isFemaleVoice) {
        score += 30;
      }
      
      // Avoid known robotic voices
      const roboticVoices = ['Albert', 'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Cellos', 'Deranged'];
      if (roboticVoices.some(name => voiceName.includes(name))) {
        score -= 50;
      }
      
      return { voice, score };
    });
    
    // Sort by score and return best
    scoredVoices.sort((a, b) => b.score - a.score);
    const selected = scoredVoices[0]?.voice || null;
    
    if (selected) {
      console.log('Selected voice:', selected.name, 'Local:', selected.localService, 'Score:', scoredVoices[0].score);
    }
    
    return selected;
  }

  // Play audio from URL with feedback prevention
  private async playAudioUrl(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Clean up previous audio
        if (this.currentAudio) {
          this.currentAudio.pause();
          this.currentAudio = undefined;
        }

        const audio = new Audio(audioUrl);
        this.currentAudio = audio;

        // Configure audio element to prevent feedback
        audio.crossOrigin = 'anonymous';
        audio.preload = 'metadata';

        // Connect to AudioContext for better control if available
        if (this.audioContext) {
          try {
            const source = this.audioContext.createMediaElementSource(audio);

            // Create a gain node to control volume more precisely
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = this.config.naturalSettings.volume;

            // Connect: source -> gain -> destination (speakers)
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            console.log('🔊 Audio connected through AudioContext for better isolation');
          } catch (contextError) {
            console.warn('Could not use AudioContext, using direct audio:', contextError);
            audio.volume = this.config.naturalSettings.volume;
          }
        } else {
          audio.volume = this.config.naturalSettings.volume;
        }

        audio.onloadstart = () => {
          this.updateState({ isLoading: true });
        };

        audio.oncanplay = () => {
          this.updateState({ isLoading: false });
        };

        audio.onplay = () => {
          this.updateState({
            isPlaying: true,
            isPaused: false
          });
          console.log('🎵 Maia audio started playing');
        };

        audio.onended = () => {
          this.updateState({
            isPlaying: false,
            currentText: ''
          });
          console.log('🎵 Maia audio finished playing');
          URL.revokeObjectURL(audioUrl); // Clean up blob URL

          // Add a small delay before resolving to ensure audio has fully stopped
          setTimeout(() => {
            resolve();
          }, 100);
        };

        audio.onerror = (error) => {
          this.updateState({
            isPlaying: false,
            isLoading: false,
            error: 'Audio playback failed'
          });
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };

        audio.onpause = () => {
          this.updateState({ isPaused: true });
        };

        audio.play().catch(error => {
          console.error('Audio play failed:', error);
          reject(error);
        });
      } catch (error) {
        this.updateState({
          isLoading: false,
          error: error.message
        });
        reject(error);
      }
    });
  }

  // Main speak method with intelligent fallback
  async speak(text: string, context?: any): Promise<void> {
    try {
      // Reset error state
      this.updateState({ error: undefined });

      // Try Sesame first (if configured)
      if (this.config.sesameApiKey) {
        try {
          await this.speakWithSesame(text, context);
          return;
        } catch (error) {
          console.warn('Sesame voice failed, trying ElevenLabs:', error);
        }
      }

      // Try ElevenLabs second (if configured)
      if (this.config.elevenLabsApiKey) {
        try {
          await this.speakWithElevenLabs(text);
          return;
        } catch (error) {
          console.warn('ElevenLabs failed, falling back to Web Speech:', error);
        }
      }

      // Fallback to Web Speech API
      if (this.config.fallbackToWebSpeech) {
        await this.speakWithWebSpeech(text);
        return;
      }

      throw new Error('No voice services available');
    } catch (error) {
      console.error('Maia voice system failed:', error);
      this.updateState({ 
        error: `Voice system error: ${error.message}`,
        isPlaying: false,
        isLoading: false
      });
      throw error;
    }
  }

  // Speak Maia's greeting
  async playGreeting(context?: any): Promise<void> {
    const greeting = this.getNaturalGreeting();
    return this.speak(greeting, { ...context, type: 'greeting' });
  }

  // Control methods
  pause(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
    } else if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = undefined;
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.updateState({ 
      isPlaying: false, 
      isPaused: false, 
      currentText: '' 
    });
  }

  // Get current state
  getState(): VoiceState {
    return { ...this.state };
  }

  // Check voice capabilities
  getCapabilities() {
    return {
      elevenLabs: !!this.config.elevenLabsApiKey,
      sesame: !!this.config.sesameApiKey,
      webSpeech: 'speechSynthesis' in window,
      audioContext: !!this.audioContext
    };
  }

  /**
   * Detect if running on mobile device
   */
  private isMobileDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'opera mini'];
    
    return mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
           ('ontouchstart' in window) ||
           (window.innerWidth <= 768);
  }

  /**
   * Generate speech with automatic mobile optimization
   */
  async generateSpeech(text: string, options?: any): Promise<string> {
    // Use mobile-optimized version on mobile devices
    if (this.isMobileDevice()) {
      const MaiaVoiceMobile = await import('./maia-voice-mobile');
      const mobileVoice = new MaiaVoiceMobile.default();
      return await mobileVoice.generateSpeech(text, options);
    }

    // Desktop version - use ElevenLabs directly (Sesame disabled)
    try {
      await this.speakWithElevenLabs(text);
      return 'elevenlabs-success';
    } catch (error) {
      console.warn('ElevenLabs failed, falling back to Web Speech:', error);
      
      // Fallback to Web Speech API
      await this.speakWithWebSpeech(text);
      return 'web-speech-fallback';
    }
  }

  /**
   * Get current state for external components
   */
  getState(): VoiceState {
    return { ...this.state };
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = undefined;
    }
    
    if (this.audioContext?.state !== 'closed') {
      this.audioContext?.close();
    }
    
    this.listeners = [];
  }
}

// Global Maia voice instance
let maiaVoiceInstance: MaiaVoiceSystem | null = null;

export function getMaiaVoice(config?: Partial<MaiaVoiceConfig>): MaiaVoiceSystem {
  if (!maiaVoiceInstance) {
    maiaVoiceInstance = new MaiaVoiceSystem(config);
  }
  return maiaVoiceInstance;
}

// Configuration helper
export function configureMaiaVoice(config: Partial<MaiaVoiceConfig>): void {
  if (maiaVoiceInstance) {
    // Update existing instance
    Object.assign(maiaVoiceInstance['config'], config);
  } else {
    // Create new instance with config
    maiaVoiceInstance = new MaiaVoiceSystem(config);
  }
}