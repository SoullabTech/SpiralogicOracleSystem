import {
  OracleModeType,
  OracleMode,
  ModeSwitchMemory,
  ConversationContext,
  ContextualModeRecommendation,
} from "../../../types/oracleMode.js";
import {
  getContextualModeRecommendation,
  ORACLE_MODES as ENHANCED_ORACLE_MODES,
  MODE_RESPONSES,
} from "../modules/oracleModes.js";
import { logger } from "../../../utils/logger.js";
import type { SoulMemorySystem } from "../../../memory/SoulMemorySystem";

export class OracleModeHandler {
  private currentMode: OracleModeType;
  private modeHistory: ModeSwitchMemory[];
  private userId: string;
  private soulMemory?: SoulMemorySystem;

  constructor(userId: string, initialMode: OracleModeType = "balanced") {
    this.userId = userId;
    this.currentMode = initialMode;
    this.modeHistory = [];
  }

  setSoulMemory(soulMemory: SoulMemorySystem): void {
    this.soulMemory = soulMemory;
  }

  getCurrentMode(): OracleModeType {
    return this.currentMode;
  }

  getModeHistory(): ModeSwitchMemory[] {
    return [...this.modeHistory];
  }

  async switchMode(
    newMode: OracleModeType,
    context?: ConversationContext,
    userInitiated: boolean = false
  ): Promise<string> {
    const previousMode = this.currentMode;
    
    if (previousMode === newMode) {
      return `Already in ${newMode} mode.`;
    }

    this.currentMode = newMode;

    // Record mode switch in history
    const modeSwitch: ModeSwitchMemory = {
      fromMode: previousMode,
      toMode: newMode,
      timestamp: new Date(),
      trigger: userInitiated ? "user_request" : "contextual_adaptation",
      context: context ? {
        conversationTurn: context.conversationTurn,
        emotionalState: context.emotionalState,
        topicDepth: context.topicDepth,
      } : undefined,
    };

    this.modeHistory.push(modeSwitch);
    if (this.modeHistory.length > 50) {
      this.modeHistory.shift();
    }

    // Store in Soul Memory if available
    if (this.soulMemory) {
      await this.soulMemory.storeMemory({
        userId: this.userId,
        type: "mode_switch",
        content: `Oracle mode switched from ${previousMode} to ${newMode}`,
        metadata: { modeSwitch },
      });
    }

    logger.info("Oracle mode switched", {
      userId: this.userId,
      previousMode,
      newMode,
      userInitiated,
      context: context?.emotionalState
    });

    const modeConfig = ENHANCED_ORACLE_MODES[newMode];
    return `Mode shifted to ${newMode}: ${modeConfig.description}`;
  }

  async getContextualRecommendation(
    context: ConversationContext
  ): Promise<ContextualModeRecommendation> {
    return getContextualModeRecommendation(context, this.currentMode, this.modeHistory);
  }

  async adaptToContext(
    context: ConversationContext,
    autoSwitch: boolean = true
  ): Promise<{ recommendation: ContextualModeRecommendation; switched: boolean }> {
    const recommendation = await this.getContextualRecommendation(context);
    
    let switched = false;
    if (autoSwitch && recommendation.confidence > 0.7 && recommendation.recommendedMode !== this.currentMode) {
      await this.switchMode(recommendation.recommendedMode, context, false);
      switched = true;
    }

    return { recommendation, switched };
  }

  getModeResponse(mode: OracleModeType): string {
    return MODE_RESPONSES[mode] || "I'm here to support your journey.";
  }

  getAnalytics(): {
    currentMode: OracleModeType;
    totalSwitches: number;
    modeFrequency: Record<OracleModeType, number>;
    averageSwitchesPerDay: number;
  } {
    const modeFrequency = {} as Record<OracleModeType, number>;
    const modes: OracleModeType[] = ["balanced", "deep_inquiry", "shadow_work", "compassionate_witness", "sacred_play", "integration"];
    
    modes.forEach(mode => {
      modeFrequency[mode] = this.modeHistory.filter(h => h.toMode === mode).length;
    });

    const daysSinceFirstSwitch = this.modeHistory.length > 0 
      ? (Date.now() - this.modeHistory[0].timestamp.getTime()) / (1000 * 60 * 60 * 24)
      : 1;

    return {
      currentMode: this.currentMode,
      totalSwitches: this.modeHistory.length,
      modeFrequency,
      averageSwitchesPerDay: this.modeHistory.length / daysSinceFirstSwitch,
    };
  }
}
