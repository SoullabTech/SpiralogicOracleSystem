import axios from 'axios';
import { EventEmitter } from 'events';

export interface VoiceProfile {
  id: string;
  name: string;
  baseVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  clonedFrom?: string; // URL or file path if cloned
  parameters: VoiceModulation;
  metadata?: {
    createdAt: Date;
    lastUsed: Date;
    usageCount: number;
  };
}

export interface VoiceModulation {
  temperature: number;      // 0.0 - 1.0 (emotional variation)
  speed: number;            // 0.5 - 2.0 (speaking rate)
  pitch: number;            // -12 to +12 semitones
  consistency: number;      // 0.0 - 1.0 (voice stability)
  emotionalDepth: number;   // 0.0 - 1.0 (expressiveness)
  resonance: number;        // 0.0 - 1.0 (warmth/depth)
  clarity: number;          // 0.0 - 1.0 (articulation)
  breathiness: number;      // 0.0 - 1.0 (softness)
}

export interface SesameVoiceConfig {
  apiUrl: string;
  apiKey?: string;
  defaultVoice: VoiceProfile['baseVoice'];
  enableCloning: boolean;
  cacheEnabled: boolean;
  maxConcurrentRequests: number;
}

export interface VoiceGenerationRequest {
  text: string;
  voiceProfile?: VoiceProfile;
  element?: string; // Fire, Water, Earth, Air, Aether
  emotionalContext?: {
    mood: string;
    intensity: number;
    jungianPhase?: 'mirror' | 'shadow' | 'anima' | 'self';
  };
  prosodyHints?: {
    emphasis?: string[];
    pauses?: { position: number; duration: number }[];
    intonation?: 'rising' | 'falling' | 'neutral' | 'questioning';
  };
  format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav';
  stream?: boolean;
}

export interface VoiceCloneRequest {
  sourceUrl?: string;
  sourceFile?: Buffer;
  name: string;
  baseVoice?: VoiceProfile['baseVoice'];
  preserveAccent?: boolean;
  preserveAge?: boolean;
  preserveGender?: boolean;
}

export class SesameVoiceService extends EventEmitter {
  private config: SesameVoiceConfig;
  private voiceProfiles: Map<string, VoiceProfile>;
  private audioCache: Map<string, Buffer>;
  private activeRequests: number = 0;

  constructor(config: Partial<SesameVoiceConfig> = {}) {
    super();

    this.config = {
      apiUrl: process.env.SESAME_API_URL || 'http://localhost:8000',
      apiKey: process.env.SESAME_API_KEY,
      defaultVoice: 'nova',
      enableCloning: true,
      cacheEnabled: true,
      maxConcurrentRequests: 3,
      ...config
    };

    this.voiceProfiles = new Map();
    this.audioCache = new Map();

    this.initializeDefaultProfiles();
  }

  private initializeDefaultProfiles() {
    // Maya's elemental voice profiles
    const elementalProfiles: Record<string, Partial<VoiceProfile>> = {
      fire: {
        id: 'maya-fire',
        name: 'Maya Fire Voice',
        baseVoice: 'fable',
        parameters: {
          temperature: 0.8,
          speed: 1.1,
          pitch: 2,
          consistency: 0.7,
          emotionalDepth: 0.9,
          resonance: 0.6,
          clarity: 0.8,
          breathiness: 0.2
        }
      },
      water: {
        id: 'maya-water',
        name: 'Maya Water Voice',
        baseVoice: 'nova',
        parameters: {
          temperature: 0.6,
          speed: 0.9,
          pitch: -1,
          consistency: 0.8,
          emotionalDepth: 0.8,
          resonance: 0.9,
          clarity: 0.7,
          breathiness: 0.5
        }
      },
      earth: {
        id: 'maya-earth',
        name: 'Maya Earth Voice',
        baseVoice: 'onyx',
        parameters: {
          temperature: 0.4,
          speed: 0.85,
          pitch: -3,
          consistency: 0.95,
          emotionalDepth: 0.6,
          resonance: 1.0,
          clarity: 0.9,
          breathiness: 0.1
        }
      },
      air: {
        id: 'maya-air',
        name: 'Maya Air Voice',
        baseVoice: 'shimmer',
        parameters: {
          temperature: 0.7,
          speed: 1.05,
          pitch: 3,
          consistency: 0.6,
          emotionalDepth: 0.7,
          resonance: 0.4,
          clarity: 0.95,
          breathiness: 0.7
        }
      },
      aether: {
        id: 'maya-aether',
        name: 'Maya Aether Voice',
        baseVoice: 'echo',
        parameters: {
          temperature: 0.9,
          speed: 1.0,
          pitch: 0,
          consistency: 0.5,
          emotionalDepth: 1.0,
          resonance: 0.8,
          clarity: 0.85,
          breathiness: 0.4
        }
      }
    };

    Object.entries(elementalProfiles).forEach(([key, profile]) => {
      this.voiceProfiles.set(profile.id!, profile as VoiceProfile);
    });
  }

  async generateSpeech(request: VoiceGenerationRequest): Promise<{
    audioData?: Buffer;
    audioUrl?: string;
    duration?: number;
    metadata?: any;
  }> {
    // Check concurrent request limit
    if (this.activeRequests >= this.config.maxConcurrentRequests) {
      await this.waitForSlot();
    }

    this.activeRequests++;
    this.emit('generation:start', request);

    try {
      // Check cache first
      const cacheKey = this.getCacheKey(request);
      if (this.config.cacheEnabled && this.audioCache.has(cacheKey)) {
        this.emit('cache:hit', cacheKey);
        return { audioData: this.audioCache.get(cacheKey)! };
      }

      // Select voice profile based on element or use provided profile
      const voiceProfile = this.selectVoiceProfile(request);

      // Apply emotional and prosody modulation
      const modulatedParams = this.applyEmotionalModulation(
        voiceProfile.parameters,
        request.emotionalContext
      );

      // Prepare API request
      const apiRequest = {
        model: 'sesame-csm-1b',
        input: request.text,
        voice: voiceProfile.baseVoice,
        response_format: request.format || 'mp3',
        speed: modulatedParams.speed,
        // Additional Sesame-specific parameters
        temperature: modulatedParams.temperature,
        pitch_shift: modulatedParams.pitch,
        voice_consistency: modulatedParams.consistency,
        emotional_depth: modulatedParams.emotionalDepth,
        resonance: modulatedParams.resonance,
        clarity: modulatedParams.clarity,
        breathiness: modulatedParams.breathiness,
        // Prosody hints
        emphasis: request.prosodyHints?.emphasis,
        pauses: request.prosodyHints?.pauses,
        intonation: request.prosodyHints?.intonation
      };

      // Make API call
      const response = await axios.post(
        `${this.config.apiUrl}/v1/audio/speech`,
        apiRequest,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: request.stream ? 'stream' : 'arraybuffer'
        }
      );

      const audioData = Buffer.from(response.data);

      // Cache the result
      if (this.config.cacheEnabled) {
        this.audioCache.set(cacheKey, audioData);
      }

      this.emit('generation:complete', {
        request,
        size: audioData.length,
        profile: voiceProfile.id
      });

      return {
        audioData,
        duration: response.headers['x-audio-duration'],
        metadata: {
          profile: voiceProfile.id,
          modulation: modulatedParams,
          cached: false
        }
      };

    } catch (error) {
      this.emit('generation:error', error);
      throw error;
    } finally {
      this.activeRequests--;
    }
  }

  async cloneVoice(request: VoiceCloneRequest): Promise<VoiceProfile> {
    this.emit('clone:start', request);

    try {
      const formData = new FormData();

      if (request.sourceUrl) {
        formData.append('source_url', request.sourceUrl);
      } else if (request.sourceFile) {
        formData.append('audio_file', new Blob([request.sourceFile]));
      }

      formData.append('name', request.name);
      formData.append('base_voice', request.baseVoice || 'nova');
      formData.append('preserve_accent', String(request.preserveAccent ?? true));
      formData.append('preserve_age', String(request.preserveAge ?? true));
      formData.append('preserve_gender', String(request.preserveGender ?? true));

      const response = await axios.post(
        `${this.config.apiUrl}/v1/voice-cloning/clone`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const clonedProfile: VoiceProfile = {
        id: response.data.voice_id,
        name: request.name,
        baseVoice: request.baseVoice || 'nova',
        clonedFrom: request.sourceUrl || 'uploaded_file',
        parameters: {
          temperature: 0.7,
          speed: 1.0,
          pitch: 0,
          consistency: 0.9,
          emotionalDepth: 0.8,
          resonance: 0.7,
          clarity: 0.85,
          breathiness: 0.3
        },
        metadata: {
          createdAt: new Date(),
          lastUsed: new Date(),
          usageCount: 0
        }
      };

      this.voiceProfiles.set(clonedProfile.id, clonedProfile);
      this.emit('clone:complete', clonedProfile);

      return clonedProfile;

    } catch (error) {
      this.emit('clone:error', error);
      throw error;
    }
  }

  private selectVoiceProfile(request: VoiceGenerationRequest): VoiceProfile {
    if (request.voiceProfile) {
      return request.voiceProfile;
    }

    if (request.element) {
      const elementProfile = this.voiceProfiles.get(`maya-${request.element.toLowerCase()}`);
      if (elementProfile) {
        return elementProfile;
      }
    }

    // Return default profile
    return {
      id: 'default',
      name: 'Default Voice',
      baseVoice: this.config.defaultVoice,
      parameters: {
        temperature: 0.7,
        speed: 1.0,
        pitch: 0,
        consistency: 0.8,
        emotionalDepth: 0.7,
        resonance: 0.6,
        clarity: 0.8,
        breathiness: 0.3
      }
    };
  }

  private applyEmotionalModulation(
    baseParams: VoiceModulation,
    emotionalContext?: VoiceGenerationRequest['emotionalContext']
  ): VoiceModulation {
    if (!emotionalContext) {
      return baseParams;
    }

    const modulated = { ...baseParams };
    const { mood, intensity, jungianPhase } = emotionalContext;

    // Mood-based modulation
    const moodModulations: Record<string, Partial<VoiceModulation>> = {
      joyful: { speed: 1.1, pitch: 2, emotionalDepth: 0.9 },
      sad: { speed: 0.9, pitch: -2, breathiness: 0.6 },
      angry: { speed: 1.05, clarity: 0.95, resonance: 0.8 },
      peaceful: { speed: 0.95, breathiness: 0.5, emotionalDepth: 0.6 },
      mystical: { resonance: 0.9, breathiness: 0.4, consistency: 0.6 },
      passionate: { temperature: 0.9, emotionalDepth: 1.0, speed: 1.05 }
    };

    if (mood && moodModulations[mood]) {
      const moodMod = moodModulations[mood];
      Object.entries(moodMod).forEach(([key, value]) => {
        const k = key as keyof VoiceModulation;
        modulated[k] = (modulated[k] + value) / 2; // Blend with base
      });
    }

    // Jungian phase modulation
    const jungianModulations: Record<string, Partial<VoiceModulation>> = {
      mirror: { clarity: 0.95, consistency: 0.9 },
      shadow: { resonance: 0.8, breathiness: 0.4, pitch: -2 },
      anima: { emotionalDepth: 0.9, breathiness: 0.5, temperature: 0.8 },
      self: { consistency: 0.95, clarity: 0.9, resonance: 0.85 }
    };

    if (jungianPhase && jungianModulations[jungianPhase]) {
      const jungMod = jungianModulations[jungianPhase];
      Object.entries(jungMod).forEach(([key, value]) => {
        const k = key as keyof VoiceModulation;
        modulated[k] = (modulated[k] + value) / 2;
      });
    }

    // Apply intensity scaling
    if (intensity) {
      modulated.emotionalDepth *= intensity;
      modulated.temperature = Math.min(1.0, modulated.temperature * (0.5 + intensity * 0.5));
    }

    return this.normalizeParameters(modulated);
  }

  private normalizeParameters(params: VoiceModulation): VoiceModulation {
    return {
      temperature: Math.max(0, Math.min(1, params.temperature)),
      speed: Math.max(0.5, Math.min(2, params.speed)),
      pitch: Math.max(-12, Math.min(12, params.pitch)),
      consistency: Math.max(0, Math.min(1, params.consistency)),
      emotionalDepth: Math.max(0, Math.min(1, params.emotionalDepth)),
      resonance: Math.max(0, Math.min(1, params.resonance)),
      clarity: Math.max(0, Math.min(1, params.clarity)),
      breathiness: Math.max(0, Math.min(1, params.breathiness))
    };
  }

  private getCacheKey(request: VoiceGenerationRequest): string {
    return `${request.text}-${request.voiceProfile?.id || 'default'}-${request.element}-${JSON.stringify(request.emotionalContext)}`;
  }

  private async waitForSlot(): Promise<void> {
    return new Promise((resolve) => {
      const checkSlot = setInterval(() => {
        if (this.activeRequests < this.config.maxConcurrentRequests) {
          clearInterval(checkSlot);
          resolve();
        }
      }, 100);
    });
  }

  // Voice profile management
  async saveVoiceProfile(profile: VoiceProfile): Promise<void> {
    this.voiceProfiles.set(profile.id, profile);
    this.emit('profile:saved', profile);
  }

  getVoiceProfile(id: string): VoiceProfile | undefined {
    return this.voiceProfiles.get(id);
  }

  getAllVoiceProfiles(): VoiceProfile[] {
    return Array.from(this.voiceProfiles.values());
  }

  // Cache management
  clearCache(): void {
    this.audioCache.clear();
    this.emit('cache:cleared');
  }

  getCacheSize(): number {
    let size = 0;
    this.audioCache.forEach(buffer => {
      size += buffer.length;
    });
    return size;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.apiUrl}/v1/audio/models`);
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export default SesameVoiceService;