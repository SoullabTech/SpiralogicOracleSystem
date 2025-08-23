import { BaseAgent } from "../baseAgent.js";
import { logger } from "../../../utils/logger.js";
import type { IPersonalOracleAgent } from "@/lib/shared/interfaces/IPersonalOracleAgent";
import type { IMemoryService } from "@/lib/shared/interfaces/IMemoryService";
import type { SoulMemorySystem } from "../../../memory/SoulMemorySystem";

export interface PersonalOracleConfig {
  userId: string;
  oracleName: string;
  mode?: "daily" | "retreat";
  retreatPhase?: "pre-retreat" | "retreat-active" | "post-retreat";
  elementalResonance?: ElementalType;
  voiceProfile?: VoiceProfile;
  oracleMode?: string;
}

type ElementalType = "fire" | "water" | "earth" | "air" | "aether";

interface VoiceProfile {
  tone: ElementalType;
  style: "direct" | "nurturing" | "mystical" | "analytical" | "playful";
  intimacyLevel: "gentle" | "deep" | "profound";
}

export abstract class BaseOracleAgent extends BaseAgent implements IPersonalOracleAgent {
  protected userId: string;
  protected oracleName: string;
  protected mode: "daily" | "retreat";
  protected retreatPhase?: "pre-retreat" | "retreat-active" | "post-retreat";
  protected currentElement: ElementalType;
  protected voiceProfile: VoiceProfile;
  protected soulMemory?: SoulMemorySystem;
  protected memoryService?: IMemoryService;

  constructor(config: PersonalOracleConfig) {
    super();
    this.userId = config.userId;
    this.oracleName = config.oracleName;
    this.mode = config.mode || "daily";
    this.retreatPhase = config.retreatPhase;
    this.currentElement = config.elementalResonance || "aether";
    this.voiceProfile = config.voiceProfile || {
      tone: "aether",
      style: "mystical",
      intimacyLevel: "gentle"
    };
  }

  abstract generateResponse(input: {
    text: string;
    userId: string;
    conversationId: string;
    context?: any;
  }): Promise<{
    response: string;
    confidence: number;
    shouldRemember: boolean;
  }>;

  protected logOracleActivity(activity: string, metadata?: any): void {
    logger.info("Oracle activity", {
      userId: this.userId,
      oracleName: this.oracleName,
      activity,
      element: this.currentElement,
      ...metadata
    });
  }
}
