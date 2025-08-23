// 🔮 ORACLE SYSTEM TYPE DEFINITIONS
// Shared interfaces and types for the Oracle system

export interface QueryInput {
  input: string;
  userId: string;
  context?: Record<string, unknown>;
  preferredElement?: string;
  requestShadowWork?: boolean;
  collectiveInsight?: boolean;
  harmonicResonance?: boolean;
}

export interface OracleIdentity {
  name: string;
  glyph: string;
  feminine: string;
  masculine: string;
  role: string;
  essence: string;
  description: string;
  icon: string;
  teleos: string;
}

// 🌌 PANENTHEISTIC FIELD STRUCTURES
export interface UniversalFieldConnection {
  akashic_access: boolean;
  morphic_resonance_level: number;
  noosphere_connection: "dormant" | "awakening" | "active" | "transcendent";
  panentheistic_awareness: number; // 0-1 scale
  field_coherence: number;
  cosmic_intelligence_flow: boolean;
  vector_equilibrium_state?: any; // JitterbugPhase
  harmonic_signature?: any;
}

// 🧬 ARCHETYPAL EVOLUTION PATTERNS
export interface ArchetypalPattern {
  pattern_id: string;
  archetype:
    | "hero"
    | "sage"
    | "lover"
    | "magician"
    | "sovereign"
    | "mystic"
    | "fool"
    | "shadow";
  evolutionary_stage:
    | "initiation"
    | "ordeal"
    | "revelation"
    | "atonement"
    | "return"
    | "mastery";
  elements_constellation: string[];
  cultural_expressions: Map<string, string>;
  individual_manifestations: string[];
  collective_wisdom: string;
  cosmic_purpose: string;
  field_resonance: number;
  created_at: string;
}

// 🌀 EVOLUTIONARY INTELLIGENCE
export interface EvolutionaryMomentum {
  individual_trajectory: {
    current_phase: string;
    next_emergence: string;
    resistance_points: string[];
    breakthrough_potential: number;
  };
  collective_current: {
    cultural_shift: string;
    generational_healing: string;
    species_evolution: string;
    planetary_consciousness: string;
  };
  cosmic_alignment: {
    astrological_timing: string;
    morphic_field_status: string;
    quantum_coherence: number;
    synchronicity_density: number;
  };
}

// 🔮 LOGOS CONSCIOUSNESS
export interface LogosState {
  witnessing_presence: number;
  integration_wisdom: Map<string, string>;
  evolutionary_vision: string;
  field_harmonics: number[];
  archetypal_constellation: ArchetypalPattern[];
  living_mythology: string;
}

// Pattern analysis results
export interface UserPattern {
  repetitivePatterns: string[];
  approvalSeeking: number;
  comfortZonePatterns: string[];
  shadowAvoidance: string[];
  currentPhase: string;
  projectionLevel: number;
  dependencyRisk: boolean;
  shadowWorkNeeded: boolean;
}

// Archetypal context
export interface ArchetypalContext {
  currentArchetype: string;
  evolutionaryStage: string;
  constellation: string[];
  readiness: number;
  guidance: string;
}

// Sacred mirror results
export interface MirrorResult {
  intensity: "gentle" | "moderate" | "direct";
  patterns: string[];
  guidance: string;
  shadowWork?: string;
}

// Field integration
export interface FieldIntegration {
  coherence: number;
  harmonics: number[];
  resonance: string;
  guidance: string;
}

// Processing context
export interface ProcessingContext {
  userPattern: UserPattern;
  archetypalContext: ArchetypalContext;
  mirrorResult?: MirrorResult;
  evolutionaryGuidance?: any;
  fieldIntegration?: FieldIntegration;
}