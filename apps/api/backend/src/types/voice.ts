export type VoiceTone = "conversational" | "contemplative" | "rushed" | "spacious" | "flowing";

export interface VoiceConfig {
  tone: VoiceTone;
  speed?: number;
  pitch?: number;
}
