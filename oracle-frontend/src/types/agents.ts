/**
 * Oracle agent model definitions
 */

/**
 * Elemental types used throughout the Oracle system
 */
export type ElementalType = 'fire' | 'water' | 'earth' | 'air' | 'aether';

/**
 * Oracle archetype definition
 */
export interface OracleArchetype {
  name: string;
  icon: React.ReactNode;
  element: ElementalType;
  gradient: string;
  shadow: string;
  description: string;
}

/**
 * Oracle agent entity
 */
export interface OracleAgent {
  id: string;
  name: string;
  archetype: string;
  sub_archetype: string;
  symbol: string;
  element: ElementalType;
  personality_traits: string[];
  communication_style: string;
  specialties: string[];
  greeting?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Agent interaction metadata
 */
export interface AgentInteraction {
  id: string;
  agent_id: string;
  user_id: string;
  prompt: string;
  response: string;
  metadata?: {
    archetype?: string;
    element?: string;
    phase?: string;
    emotional_tone?: string;
    keywords?: string[];
  };
  created_at: string;
}

/**
 * Agent memory item
 */
export interface AgentMemory {
  id: string;
  agent_id: string;
  user_id: string;
  type: 'interaction' | 'insight' | 'milestone' | 'preference';
  content: string;
  importance: number;
  tags?: string[];
  created_at: string;
}

/**
 * Agent relationship/bond with user
 */
export interface AgentBond {
  agent_id: string;
  user_id: string;
  bond_strength: number;
  interaction_count: number;
  last_interaction: string;
  favorite_topics: string[];
  emotional_patterns: Record<string, number>;
}