/**
 * Maya Voice System - ElevenLabs "Aunt Annie" + Sesame Intelligence
 * Modern, everyday, soulful, intelligent voice for the Oracle
 */

interface MayaVoiceConfig {
  elevenLabsApiKey?: string;
  voiceId: string; // Aunt Annie voice ID
  sesameApiKey?: string;
  fallbackToWebSpeech: boolean;
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

export class MayaVoiceSystem {
  private config: MayaVoiceConfig;
  private state: VoiceState;
  private audioContext?: AudioContext;
  private currentAudio?: HTMLAudioElement;
  private listeners: ((state: VoiceState) => void)[] = [];

  constructor(config?: Partial<MayaVoiceConfig>) {
    this.config = {
      voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_AUNT_ANNIE || 'y2TOWGCXSYEgBanvKsYJ', // Aunt Annie voice from env
      elevenLabsApiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
      fallbackToWebSpeech: true,
      naturalSettings: {
        rate: 0.95,    // Slightly slower for naturalness
        pitch: 1.05,   // Slightly higher for warmth  
        volume: 0.85,  // Softer and more comfortable
        stability: 0.8, // For ElevenLabs compatibility
        clarity: 0.9    // High clarity for intelligent conversation
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

  // Enhance text for natural conversation flow
  private enhanceTextForSpeech(text: string): string {
    return text
      // Add natural breathing pauses
      .replace(/\. /g, '. ')
      .replace(/\? /g, '? ')
      .replace(/! /g, '! ')
      // Add brief pauses for emphasis
      .replace(/\b(but|however|and|so|now|listen|look|here's the thing)\b/gi, '$1... ')
      // Natural conversation flow
      .replace(/\b(well|you know|I mean|actually|honestly)\b/gi, '$1, ')
      .trim();
  }

  // Generate Maya's natural greeting
  getNaturalGreeting(): string {
    const greetings = [
      "Hey there. I'm Maya. Good to connect with you.",
      "Hi. I'm here when you're ready to explore what's on your mind.",
      "Hello. I'm Maya, and I'm listening. What's stirring for you?",
      "Hey. Let's see what we can discover together. How are you feeling?",
      "Hi there. I'm Maya. What would it be helpful to talk about?"
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

  // Sesame conversational intelligence + voice
  private async speakWithSesame(text: string, context?: any): Promise<void> {
    if (!this.config.sesameApiKey) {
      throw new Error('Sesame API key not configured');
    }

    this.updateState({ isLoading: true, currentText: text, voiceType: 'sesame' });

    try {
      // First, enhance the text with Sesame's conversational intelligence
      const sesameResponse = await fetch('/api/voice/sesame-enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.sesameApiKey}`
        },
        body: JSON.stringify({
          text,
          personality: 'maya_natural_intelligent',
          context: context || {},
          voice_config: {
            style: 'conversational',
            emotion: 'warm_intelligent',
            pacing: 'natural'
          }
        })
      });

      const enhancedData = await sesameResponse.json();
      const enhancedText = enhancedData.enhanced_text || text;

      // Then convert to speech using Sesame's voice synthesis
      const voiceResponse = await fetch('/api/voice/sesame-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.sesameApiKey}`
        },
        body: JSON.stringify({
          text: this.enhanceTextForSpeech(enhancedText),
          voice: 'maya_aunt_annie',
          rate: this.config.naturalSettings.rate,
          pitch: this.config.naturalSettings.pitch,
          volume: this.config.naturalSettings.volume
        })
      });

      if (!voiceResponse.ok) {
        throw new Error(`Sesame voice API error: ${voiceResponse.status}`);
      }

      const audioBlob = await voiceResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return this.playAudioUrl(audioUrl);
    } catch (error) {
      console.error('Sesame voice failed:', error);
      this.updateState({ error: error.message });
      throw error;
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  // Web Speech API fallback with Maya characteristics
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
        
        // Configure Maya's natural voice characteristics
        // Optimize for naturalness - override config for better quality
        utterance.rate = 0.95; // Slightly slower for better clarity
        utterance.pitch = 1.05; // Slightly higher pitch for warmth
        utterance.volume = 0.85; // Softer for comfort
        utterance.lang = 'en-US';

        // Try to select the best available female voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = this.selectBestVoice(voices);
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

  // Select the best available voice for Maya
  private selectBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (voices.length === 0) return null;
    
    // Score voices based on quality factors
    const scoredVoices = voices.map(voice => {
      let score = 0;
      
      // Strongly prefer local voices (much better quality)
      if (voice.localService) score += 100;
      
      // Prefer English voices
      if (voice.lang.startsWith('en')) score += 50;
      
      // Prefer known high-quality voices
      const highQualityVoices = ['Samantha', 'Victoria', 'Allison', 'Ava', 'Karen', 'Hazel', 'Susan', 'Kate'];
      const voiceName = voice.name;
      if (highQualityVoices.some(name => voiceName.includes(name))) {
        score += 40;
      }
      
      // Prefer female voices for Maya
      if (voiceName.toLowerCase().includes('female') || 
          voiceName.toLowerCase().includes('woman') ||
          ['Samantha', 'Victoria', 'Allison', 'Ava', 'Karen', 'Hazel', 'Zira', 'Susan', 'Kate'].some(name => voiceName.includes(name))) {
        score += 20;
      }
      
      // Avoid known robotic voices
      const roboticVoices = ['Alex', 'Fred', 'Albert', 'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Cellos', 'Deranged'];
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

  // Play audio from URL
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
        };

        audio.onended = () => {
          this.updateState({ 
            isPlaying: false, 
            currentText: '' 
          });
          URL.revokeObjectURL(audioUrl); // Clean up blob URL
          resolve();
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

        audio.volume = this.config.naturalSettings.volume;
        audio.play();
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
      console.error('Maya voice system failed:', error);
      this.updateState({ 
        error: `Voice system error: ${error.message}`,
        isPlaying: false,
        isLoading: false
      });
      throw error;
    }
  }

  // Speak Maya's greeting
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
      const MayaVoiceMobile = await import('./maya-voice-mobile');
      const mobileVoice = new MayaVoiceMobile.default();
      return await mobileVoice.generateSpeech(text, options);
    }

    // Desktop version - use Sesame directly
    try {
      const response = await fetch('/api/voice/sesame-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: this.enhanceTextForSpeech(text),
          voice: 'maya_natural',
          ...options,
          naturalSettings: this.config.naturalSettings
        })
      });

      if (!response.ok) {
        throw new Error(`Sesame TTS failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.warn('Sesame TTS failed, falling back to Web Speech:', error);
      
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

// Global Maya voice instance
let mayaVoiceInstance: MayaVoiceSystem | null = null;

export function getMayaVoice(config?: Partial<MayaVoiceConfig>): MayaVoiceSystem {
  if (!mayaVoiceInstance) {
    mayaVoiceInstance = new MayaVoiceSystem(config);
  }
  return mayaVoiceInstance;
}

// Configuration helper
export function configureMayaVoice(config: Partial<MayaVoiceConfig>): void {
  if (mayaVoiceInstance) {
    // Update existing instance
    Object.assign(mayaVoiceInstance['config'], config);
  } else {
    // Create new instance with config
    mayaVoiceInstance = new MayaVoiceSystem(config);
  }
}