// Sacred Audio System - Elemental tones and feedback cues
import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface SacredAudioSystemProps {
  enabled?: boolean;
  volume?: number; // 0.0 - 1.0
  onAudioStateChange?: (isPlaying: boolean) => void;
}

export type ElementalTone = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export type AudioCue = 
  | 'petal_tap'
  | 'coherence_rise' 
  | 'coherence_fall'
  | 'breakthrough'
  | 'listening_start'
  | 'processing'
  | 'response_complete';

// Frequency mappings for elemental tones (Hz)
const ELEMENTAL_FREQUENCIES = {
  fire: 528,    // Love frequency / DNA repair
  water: 417,   // Facilitating change
  earth: 396,   // Root chakra / grounding
  air: 741,     // Expression / solutions
  aether: 963   // Crown chakra / transcendence
};

// Audio cue configurations
const AUDIO_CUES = {
  petal_tap: { frequency: 440, duration: 150, volume: 0.3, type: 'gentle' as const },
  coherence_rise: { frequency: 528, duration: 800, volume: 0.4, type: 'ascending' as const },
  coherence_fall: { frequency: 396, duration: 800, volume: 0.4, type: 'descending' as const },
  breakthrough: { frequency: 963, duration: 2000, volume: 0.5, type: 'starburst' as const },
  listening_start: { frequency: 417, duration: 300, volume: 0.3, type: 'gentle' as const },
  processing: { frequency: 741, duration: 1000, volume: 0.2, type: 'pulse' as const },
  response_complete: { frequency: 528, duration: 400, volume: 0.3, type: 'gentle' as const }
};

export class SacredAudioEngine {
  private audioContext: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.initialize();
    }
  }

  private async initialize() {
    try {
      this.audioContext = new AudioContext();
      this.masterVolume = this.audioContext.createGain();
      this.masterVolume.connect(this.audioContext.destination);
      this.masterVolume.gain.value = 0.5;
      this.isInitialized = true;
    } catch (error) {
      console.warn('Sacred Audio System: Failed to initialize Web Audio API', error);
    }
  }

  public async playElementalTone(
    element: ElementalTone,
    duration: number = 500,
    volume: number = 0.3
  ): Promise<void> {
    if (!this.isReady()) return;

    const frequency = ELEMENTAL_FREQUENCIES[element];
    await this.playTone(frequency, duration, volume, 'sine');
  }

  public async playCue(cue: AudioCue, volume: number = 0.3): Promise<void> {
    if (!this.isReady()) return;

    const config = AUDIO_CUES[cue];
    const adjustedVolume = config.volume * volume;

    switch (config.type) {
      case 'gentle':
        await this.playTone(config.frequency, config.duration, adjustedVolume, 'sine');
        break;
      case 'ascending':
        await this.playFrequencySweep(config.frequency * 0.8, config.frequency * 1.2, config.duration, adjustedVolume);
        break;
      case 'descending':
        await this.playFrequencySweep(config.frequency * 1.2, config.frequency * 0.8, config.duration, adjustedVolume);
        break;
      case 'pulse':
        await this.playPulseTone(config.frequency, config.duration, adjustedVolume);
        break;
      case 'starburst':
        await this.playStarburstTone(config.frequency, config.duration, adjustedVolume);
        break;
    }
  }

  private async playTone(
    frequency: number,
    duration: number,
    volume: number,
    waveType: OscillatorType = 'sine'
  ): Promise<void> {
    if (!this.audioContext || !this.masterVolume) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = waveType;
    oscillator.frequency.value = frequency;

    gainNode.gain.value = 0;
    gainNode.gain.exponentialRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterVolume);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);

    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  }

  private async playFrequencySweep(
    startFreq: number,
    endFreq: number,
    duration: number,
    volume: number
  ): Promise<void> {
    if (!this.audioContext || !this.masterVolume) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = startFreq;
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration / 1000);

    gainNode.gain.value = 0;
    gainNode.gain.exponentialRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterVolume);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);

    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  }

  private async playPulseTone(frequency: number, duration: number, volume: number): Promise<void> {
    const pulseCount = Math.floor(duration / 200);
    for (let i = 0; i < pulseCount; i++) {
      await this.playTone(frequency, 100, volume * 0.7);
      await this.delay(100);
    }
  }

  private async playStarburstTone(frequency: number, duration: number, volume: number): Promise<void> {
    const harmonics = [1, 1.2, 1.5, 2, 2.4, 3];
    const promises = harmonics.map((harmonic, index) => {
      const delay = index * 100;
      const harmonicVolume = volume / (index + 1);
      return new Promise<void>(resolve => {
        setTimeout(() => {
          this.playTone(frequency * harmonic, duration - delay, harmonicVolume).then(resolve);
        }, delay);
      });
    });

    await Promise.all(promises);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public setMasterVolume(volume: number) {
    if (this.masterVolume) {
      this.masterVolume.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  public isReady(): boolean {
    return this.isInitialized && this.audioContext?.state === 'running';
  }

  public async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  public suspend(): void {
    if (this.audioContext?.state === 'running') {
      this.audioContext.suspend();
    }
  }
}

export const SacredAudioSystem: React.FC<SacredAudioSystemProps> = ({
  enabled = true,
  volume = 0.5,
  onAudioStateChange
}) => {
  const audioEngineRef = useRef<SacredAudioEngine | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioEngineRef.current = new SacredAudioEngine();
      
      const checkReady = () => {
        const ready = audioEngineRef.current?.isReady() || false;
        setIsReady(ready);
        onAudioStateChange?.(ready);
      };

      checkReady();
      const interval = setInterval(checkReady, 500);
      
      return () => clearInterval(interval);
    }
  }, [onAudioStateChange]);

  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setMasterVolume(enabled ? volume : 0);
    }
  }, [enabled, volume]);

  useEffect(() => {
    if (!userInteracted) {
      const handleInteraction = async () => {
        if (audioEngineRef.current) {
          await audioEngineRef.current.resume();
          setUserInteracted(true);
        }
      };

      document.addEventListener('click', handleInteraction, { once: true });
      document.addEventListener('touchstart', handleInteraction, { once: true });

      return () => {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      };
    }
  }, [userInteracted]);

  // Expose audio methods through a context or imperative handle
  const playElementalTone = useCallback(async (element: ElementalTone, duration?: number, vol?: number) => {
    if (enabled && audioEngineRef.current) {
      await audioEngineRef.current.playElementalTone(element, duration, vol);
    }
  }, [enabled]);

  const playCue = useCallback(async (cue: AudioCue, vol?: number) => {
    if (enabled && audioEngineRef.current) {
      await audioEngineRef.current.playCue(cue, vol);
    }
  }, [enabled]);

  // Expose methods to parent components via ref
  React.useImperativeHandle(audioEngineRef, () => ({
    playElementalTone,
    playCue,
    isReady,
    resume: () => audioEngineRef.current?.resume(),
    suspend: () => audioEngineRef.current?.suspend()
  }));

  // Render nothing, this is a service component
  return null;
};

// Hook for using the audio system
export const useSacredAudio = () => {
  const [audioSystem, setAudioSystem] = useState<{
    playElementalTone: (element: ElementalTone, duration?: number, volume?: number) => Promise<void>;
    playCue: (cue: AudioCue, volume?: number) => Promise<void>;
    isReady: boolean;
  } | null>(null);

  useEffect(() => {
    const engine = new SacredAudioEngine();
    
    setAudioSystem({
      playElementalTone: (element, duration, volume) => engine.playElementalTone(element, duration, volume),
      playCue: (cue, volume) => engine.playCue(cue, volume),
      isReady: engine.isReady()
    });
  }, []);

  return audioSystem;
};

export default SacredAudioSystem;