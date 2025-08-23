// 🎯 EVENT TYPES - Oracle System Event Definitions
// Defines all event types and their payload structures

// ========== QUERY EVENTS ==========
export const QUERY_EVENTS = {
  QUERY_RECEIVED: 'query.received',
  QUERY_PROCESSED: 'query.processed',
  QUERY_FAILED: 'query.failed',
  ELEMENTAL_ANALYSIS_REQUESTED: 'query.elemental_analysis_requested',
  ARCHETYPAL_ANALYSIS_REQUESTED: 'query.archetypal_analysis_requested',
} as const;

export interface QueryReceivedPayload {
  userId: string;
  input: string;
  context?: any;
  requestId: string;
}

export interface QueryProcessedPayload {
  userId: string;
  requestId: string;
  response: any;
  processingTime: number;
  agentUsed?: string;
  element?: string;
}

export interface QueryFailedPayload {
  userId: string;
  requestId: string;
  error: string;
  errorCode?: string;
}

// ========== AGENT EVENTS ==========
export const AGENT_EVENTS = {
  AGENT_PROCESSING_STARTED: 'agent.processing_started',
  AGENT_PROCESSING_COMPLETED: 'agent.processing_completed',
  AGENT_PROCESSING_FAILED: 'agent.processing_failed',
  ELEMENTAL_AGENT_ACTIVATED: 'agent.elemental_activated',
  ARCHETYPAL_AGENT_ACTIVATED: 'agent.archetypal_activated',
  SHADOW_WORK_TRIGGERED: 'agent.shadow_work_triggered',
} as const;

export interface AgentProcessingPayload {
  agentType: string;
  agentId: string;
  userId: string;
  requestId: string;
  element?: string;
  archetype?: string;
}

// ========== ORCHESTRATION EVENTS ==========
export const ORCHESTRATION_EVENTS = {
  ORCHESTRATION_STARTED: 'orchestration.started',
  ORCHESTRATION_ROUTING_DECISION: 'orchestration.routing_decision',
  ORCHESTRATION_COMPLETED: 'orchestration.completed',
  ELEMENT_ROUTING_REQUESTED: 'orchestration.element_routing_requested',
  MULTI_AGENT_SYNTHESIS_REQUESTED: 'orchestration.multi_agent_synthesis_requested',
} as const;

export interface OrchestrationRoutingPayload {
  userId: string;
  requestId: string;
  routingDecision: {
    primaryAgent: string;
    secondaryAgent?: string;
    reasoning: string;
    confidence: number;
  };
  elementalNeed?: string;
  archetypalContext?: any;
}

// ========== MEMORY EVENTS ==========
export const MEMORY_EVENTS = {
  MEMORY_STORED: 'memory.stored',
  MEMORY_RETRIEVED: 'memory.retrieved',
  PATTERN_DETECTED: 'memory.pattern_detected',
  INSIGHT_GENERATED: 'memory.insight_generated',
  SOUL_MEMORY_UPDATED: 'memory.soul_memory_updated',
} as const;

export interface MemoryStoredPayload {
  userId: string;
  memoryId: string;
  content: string;
  element?: string;
  tags?: string[];
  context?: any;
}

export interface PatternDetectedPayload {
  userId: string;
  patternType: string;
  patterns: string[];
  confidence: number;
  recommendations?: string[];
}

// ========== WISDOM EVENTS ==========
export const WISDOM_EVENTS = {
  WISDOM_SYNTHESIS_REQUESTED: 'wisdom.synthesis_requested',
  WISDOM_SYNTHESIS_COMPLETED: 'wisdom.synthesis_completed',
  COLLECTIVE_WISDOM_ACTIVATED: 'wisdom.collective_activated',
  ARCHETYPAL_WISDOM_ACCESSED: 'wisdom.archetypal_accessed',
  EVOLUTIONARY_GUIDANCE_GENERATED: 'wisdom.evolutionary_guidance_generated',
} as const;

export interface WisdomSynthesisPayload {
  userId: string;
  requestId: string;
  sources: string[];
  synthesisType: 'individual' | 'collective' | 'archetypal';
  wisdom: string;
  confidence: number;
}

// ========== TRANSFORMATION EVENTS ==========
export const TRANSFORMATION_EVENTS = {
  PHASE_TRANSITION_DETECTED: 'transformation.phase_transition_detected',
  BREAKTHROUGH_POTENTIAL_IDENTIFIED: 'transformation.breakthrough_potential',
  SHADOW_INTEGRATION_OPPORTUNITY: 'transformation.shadow_integration',
  ARCHETYPAL_EVOLUTION_READY: 'transformation.archetypal_evolution',
  SACRED_MIRROR_ACTIVATED: 'transformation.sacred_mirror_activated',
} as const;

export interface PhaseTransitionPayload {
  userId: string;
  fromPhase: string;
  toPhase: string;
  confidence: number;
  triggers: string[];
  guidance: string;
}

export interface BreakthroughPotentialPayload {
  userId: string;
  area: string;
  potential: number;
  blockingPatterns: string[];
  recommendations: string[];
}

// ========== VOICE EVENTS ==========
export const VOICE_EVENTS = {
  VOICE_SYNTHESIS_REQUESTED: 'voice.synthesis_requested',
  VOICE_SYNTHESIS_COMPLETED: 'voice.synthesis_completed',
  VOICE_PROFILE_UPDATED: 'voice.profile_updated',
  CEREMONIAL_SPEECH_TRIGGERED: 'voice.ceremonial_speech_triggered',
} as const;

export interface VoiceSynthesisPayload {
  userId: string;
  text: string;
  voiceProfile: string;
  audioUrl?: string;
  duration?: number;
}

// ========== SYSTEM EVENTS ==========
export const SYSTEM_EVENTS = {
  SYSTEM_HEALTH_CHECK: 'system.health_check',
  PERFORMANCE_METRICS: 'system.performance_metrics',
  ERROR_OCCURRED: 'system.error',
  RATE_LIMIT_EXCEEDED: 'system.rate_limit_exceeded',
} as const;

export interface SystemHealthPayload {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, 'up' | 'down' | 'degraded'>;
  timestamp: Date;
}

// ========== COMBINED TYPES ==========
export type AllEventTypes = 
  | typeof QUERY_EVENTS[keyof typeof QUERY_EVENTS]
  | typeof AGENT_EVENTS[keyof typeof AGENT_EVENTS]
  | typeof ORCHESTRATION_EVENTS[keyof typeof ORCHESTRATION_EVENTS]
  | typeof MEMORY_EVENTS[keyof typeof MEMORY_EVENTS]
  | typeof WISDOM_EVENTS[keyof typeof WISDOM_EVENTS]
  | typeof TRANSFORMATION_EVENTS[keyof typeof TRANSFORMATION_EVENTS]
  | typeof VOICE_EVENTS[keyof typeof VOICE_EVENTS]
  | typeof SYSTEM_EVENTS[keyof typeof SYSTEM_EVENTS];

export type EventPayloadMap = {
  [QUERY_EVENTS.QUERY_RECEIVED]: QueryReceivedPayload;
  [QUERY_EVENTS.QUERY_PROCESSED]: QueryProcessedPayload;
  [QUERY_EVENTS.QUERY_FAILED]: QueryFailedPayload;
  [AGENT_EVENTS.AGENT_PROCESSING_STARTED]: AgentProcessingPayload;
  [AGENT_EVENTS.AGENT_PROCESSING_COMPLETED]: AgentProcessingPayload;
  [ORCHESTRATION_EVENTS.ORCHESTRATION_ROUTING_DECISION]: OrchestrationRoutingPayload;
  [MEMORY_EVENTS.MEMORY_STORED]: MemoryStoredPayload;
  [MEMORY_EVENTS.PATTERN_DETECTED]: PatternDetectedPayload;
  [WISDOM_EVENTS.WISDOM_SYNTHESIS_COMPLETED]: WisdomSynthesisPayload;
  [TRANSFORMATION_EVENTS.PHASE_TRANSITION_DETECTED]: PhaseTransitionPayload;
  [TRANSFORMATION_EVENTS.BREAKTHROUGH_POTENTIAL_IDENTIFIED]: BreakthroughPotentialPayload;
  [VOICE_EVENTS.VOICE_SYNTHESIS_COMPLETED]: VoiceSynthesisPayload;
  [SYSTEM_EVENTS.SYSTEM_HEALTH_CHECK]: SystemHealthPayload;
};