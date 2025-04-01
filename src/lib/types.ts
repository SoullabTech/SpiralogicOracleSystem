export interface Memory {
  id: string;
  timestamp: Date;
  type: 'conversation' | 'insight' | 'pattern' | 'evolution';
  content: string;
  metadata: {
    element?: string;
    phase?: string;
    archetype?: string;
    emotionalState?: string;
    confidence?: number;
    source?: string;
  };
  connections: string[];
  strength: number;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  model?: string;
  element?: string;
  insight_type?: 'reflection' | 'challenge' | 'guidance' | 'integration';
  context?: {
    client?: string;
    archetype?: string;
    phase?: string;
    element?: string;
    focus_areas?: string[];
  };
}

export interface ClientData {
  client_name: string;
  email?: string;
  journey?: {
    current_phase?: 'exploration' | 'growth' | 'integration' | 'mastery';
    dominant_element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    archetype?: string;
    progress?: number;
  };
  preferences?: {
    communication_style?: 'direct' | 'nurturing' | 'analytical' | 'motivational';
    focus_areas?: string[];
    session_frequency?: 'daily' | 'weekly' | 'monthly';
  };
}

export interface SpiralContext {
  relationshipStage: 'initial' | 'developing' | 'established' | 'deep';
  interactionCount: number;
  firstInteraction: number;
}

export interface ArchetypeData {
  name: string;
  element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
  spiralLevel: string;
  alchemyPhase: string;
  shadowPresence: number;
  shadowSymptoms: string[];
  integratedQualities: string[];
  color: string;
}

export interface ConversationEntry {
  timestamp: number;
  input: string;
  response: string;
  archetype: string;
}