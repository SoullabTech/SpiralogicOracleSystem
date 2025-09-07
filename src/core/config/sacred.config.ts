// Centralized Sacred Configuration
export const SACRED_CONFIG = {
  motion: {
    breathingRate: 3000, // 3s breathing cycle
    shimmerSpeed: 2000,
    pulseInterval: 1500,
    transitionDuration: 800,
    fps: 60,
    reducedMotion: false
  },
  
  audio: {
    sacredFrequencies: {
      fire: 528,    // Love frequency / DNA repair
      water: 417,   // Facilitating change
      earth: 396,   // Root chakra / grounding
      air: 741,     // Expression / solutions
      aether: 963   // Crown chakra / transcendence
    },
    volumes: {
      master: 0.5,
      ambient: 0.3,
      feedback: 0.4,
      voice: 0.6
    },
    fadeInDuration: 200,
    fadeOutDuration: 500
  },
  
  coherence: {
    thresholds: {
      low: 0.3,
      medium: 0.5,
      high: 0.7,
      breakthrough: 0.85
    },
    shifts: {
      rising: 0.15,   // Threshold for rising detection
      falling: -0.15, // Threshold for falling detection
      stable: 0.05    // Range for stable state
    },
    updateInterval: 1000 // Update coherence every 1s
  },
  
  api: {
    endpoints: {
      oracle: '/api/oracle',
      coherence: '/api/oracle/coherence',
      voice: '/api/oracle/voice'
    },
    timeouts: {
      default: 30000,
      voice: 60000,
      longPoll: 120000
    },
    retries: 3
  },
  
  voice: {
    sampleRate: 48000,
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    silenceThreshold: 0.05,
    silenceTimeout: 1500
  },
  
  performance: {
    maxAnimations: 3,      // Max simultaneous animations
    throttleMs: 16,        // ~60fps
    debounceMs: 300,
    particleLimit: 20,
    shadowLimit: 4,
    mobileParticleLimit: 6
  }
} as const;

export type SacredConfig = typeof SACRED_CONFIG;