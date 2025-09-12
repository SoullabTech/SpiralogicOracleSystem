/**
 * Agent Configuration
 * Allows users to customize their guide's voice and name
 */

export interface AgentConfig {
  name: string;
  voice: 'maya' | 'anthony';
  gender: 'female' | 'male';
  elevenLabsVoiceId?: string;
}

export const DEFAULT_AGENTS: Record<string, AgentConfig> = {
  maya: {
    name: 'Maya',
    voice: 'maya',
    gender: 'female',
    elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL' // Sarah voice from ElevenLabs
  },
  anthony: {
    name: 'Anthony',
    voice: 'anthony', 
    gender: 'male',
    elevenLabsVoiceId: 'pNInz6obpgDQGcFmaJgB' // Adam voice from ElevenLabs (deep, mature)
  }
};

// Alternative male voices to consider:
// 'pNInz6obpgDQGcFmaJgB' - Adam (deep)
// 'VR6AewLTigWG4xSOukaG' - Arnold (strong)
// 'yoZ06aMxZJJ28mfd3POQ' - Sam (raspy)
// 'EXAVITQu4vr4xnSDxMaL' - Sarah (current Maya)
// 'MF3mGyEYCl7XYWbV9V6O' - Elli (alternative female)

/**
 * Get or create agent configuration from localStorage
 */
export function getAgentConfig(): AgentConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_AGENTS.maya;
  }
  
  const stored = localStorage.getItem('oracle-agent-config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid stored config, return default
    }
  }
  
  return DEFAULT_AGENTS.maya;
}

/**
 * Save agent configuration to localStorage
 */
export function saveAgentConfig(config: AgentConfig): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('oracle-agent-config', JSON.stringify(config));
  
  // Dispatch event so other components can react
  window.dispatchEvent(new CustomEvent('agent-config-changed', { 
    detail: config 
  }));
}

/**
 * Get the appropriate greeting based on agent
 */
export function getAgentGreeting(config: AgentConfig): string {
  const greetings = {
    maya: [
      "Hey, what's on your mind?",
      "Good to see you. What's happening?",
      "So what's your story today?"
    ],
    anthony: [
      "Pull up a chair. What's going on?",
      "Let's hear it. What brings you here?",
      "What's the real story?"
    ]
  };
  
  const agentGreetings = greetings[config.voice] || greetings.maya;
  return agentGreetings[Math.floor(Math.random() * agentGreetings.length)];
}

/**
 * Get voice synthesis settings based on agent
 */
export function getVoiceSettings(config: AgentConfig) {
  if (config.voice === 'anthony') {
    return {
      pitch: 0.8,      // Lower pitch for male voice
      rate: 0.95,      // Slightly slower, more deliberate
      volume: 0.9,
      // ElevenLabs settings
      stability: 0.5,        // More variation for natural speech
      similarity_boost: 0.7,  // Natural sounding
      style: 0.3,            // Slower, more contemplative pacing
      use_speaker_boost: true
    };
  }
  
  // Maya settings (default)
  return {
    pitch: 1.1,      // Slightly higher for female voice
    rate: 1.0,       // Natural pace
    volume: 0.85,
    // ElevenLabs settings
    stability: 0.4,
    similarity_boost: 0.6,
    style: 0.0,
    use_speaker_boost: false
  };
}