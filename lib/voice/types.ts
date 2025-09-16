// lib/voice/types.ts
// Core types for voice interaction and collective listening

export type Element = "fire" | "water" | "earth" | "air" | "aether";
export type PresenceMode = "conversation" | "meditation" | "guided";
export type TrustBreath = "in" | "out" | "hold";

/**
 * Individual utterance - stays local unless explicitly consented
 * Contains full transcript and personal context
 */
export interface PersonalUtterance {
  id: string;
  userId: string;
  ts: number;
  mode: PresenceMode;
  text: string;                                              // Raw transcript (stays local)
  elementBlend: Partial<Record<Element, number>>;           // Detected elements 0-1
  intents: string[];                                        // "reflect", "ask", "process", etc.
  silenceMsBefore: number;                                  // For presence analytics
  emotionalContext?: {
    valence: number;                                         // -1 to 1
    arousal: number;                                         // 0 to 1
  };
}

/**
 * Symbolic signal - privacy-safe for collective
 * No personal content, only archetypal patterns
 */
export interface SymbolicSignal {
  teamId: string;
  anonId: string;                                           // Session ID, not user
  ts: number;
  mode: PresenceMode;
  elements: Array<{
    name: Element;
    intensity: number;                                       // 0-1
  }>;
  motifs: string[];                                         // Controlled vocabulary
  affect: {
    valence: -1 | 0 | 1;                                   // Coarse sentiment
    arousal: 0 | 1 | 2;                                    // Energy level
  };
  trustBreath: TrustBreath;                                // Expansion/contraction
  spiralFlag?: boolean;                                    // Revisiting pattern
}

/**
 * Collective snapshot - group resonance state
 */
export interface CollectiveSnapshot {
  teamId: string;
  window: {
    from: number;
    to: number;
  };
  topMotifs: Array<{
    key: string;
    count: number;
  }>;
  elements: Array<{
    name: Element;
    avg: number;
  }>;
  trustBreath: Record<TrustBreath, number>;
  resonanceField: {
    coherence: number;                                      // 0-1 field harmony
    emergence: boolean;                                     // New pattern detected
    tension?: string;                                       // If opposing forces
  };
}

/**
 * Mic session configuration
 */
export interface MicSessionConfig {
  mode: PresenceMode;
  wakeWord: string;                                        // "Hello Maya" etc.
  alwaysOn: boolean;                                       // True for conversation/meditation
  silenceGraceMs: number;                                  // How long to wait in silence
  vadSensitivity?: number;                                 // 0-1, default 0.5
  noiseSupression?: boolean;                               // Filter background
}

/**
 * Voice activity detection event
 */
export interface VADEvent {
  type: "speech-start" | "speech-end" | "silence";
  timestamp: number;
  confidence: number;
}

/**
 * Wake word detection result
 */
export interface WakeWordResult {
  detected: boolean;
  confidence: number;
  keyword?: string;
  timestamp?: number;
}

/**
 * Orchestrator insight - mythic translation of collective
 */
export interface OrchestratorInsight {
  type: "resonance" | "emergence" | "tension" | "coherence";
  message: string;                                         // Poetic, not analytical
  elements: Element[];                                     // Active elements
  strength: number;                                        // 0-1 intensity
  personalMirror?: string;                                 // Individual reflection
}