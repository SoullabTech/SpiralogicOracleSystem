// Singleton Audio Service - Prevents multiple AudioContext instances
import { SACRED_CONFIG } from '../config/sacred.config';

class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isInitialized = false;
  private oscillatorPool: OscillatorNode[] = [];
  
  private constructor() {}
  
  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = SACRED_CONFIG.audio.volumes.master;
      this.isInitialized = true;
    } catch (error) {
      console.error('AudioService: Failed to initialize', error);
      throw error;
    }
  }
  
  async playElementalTone(
    element: keyof typeof SACRED_CONFIG.audio.sacredFrequencies,
    duration: number = 500,
    volume?: number
  ): Promise<void> {
    if (!this.isReady()) {
      await this.initialize();
    }
    
    const frequency = SACRED_CONFIG.audio.sacredFrequencies[element];
    const finalVolume = volume ?? SACRED_CONFIG.audio.volumes.feedback;
    
    return this.playTone(frequency, duration, finalVolume);
  }
  
  private async playTone(
    frequency: number,
    duration: number,
    volume: number
  ): Promise<void> {
    if (!this.audioContext || !this.masterGain) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    // Envelope
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
    
    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  }
  
  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
  
  isReady(): boolean {
    return this.isInitialized && this.audioContext?.state === 'running';
  }
  
  async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
  
  suspend(): void {
    if (this.audioContext?.state === 'running') {
      this.audioContext.suspend();
    }
  }
  
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
      this.isInitialized = false;
    }
  }
}

export const audioService = AudioService.getInstance();