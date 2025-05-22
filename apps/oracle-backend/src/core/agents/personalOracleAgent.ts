// 📁 File: /core/agents/PersonalOracleAgent.ts

import { MemoryManager } from '@lib/mem0';
import { promptTemplate } from '@lib/langchain';
import { fetchUserSymbols, fetchEmotionalTone } from '@lib/symbolicIntel';
export interface PersonalOracleConfig {
  userId: string;
  userName?: string;
  oracleName?: string;
  tone?: 'poetic' | 'direct' | 'mystic' | 'nurturing';
}

export class PersonalOracleAgent {
  private userId: string;
  private oracleName: string;
  private tone: string;
  private memory: MemoryManager;

  constructor(config: PersonalOracleConfig) {
    this.userId = config.userId;
    this.oracleName = config.oracleName || 'The Inner One';
    this.tone = config.tone || 'poetic';
    this.memory = new MemoryManager(config.userId);
  }

  async getIntroMessage(): Promise<string> {
    const tonePhrases = {
      poetic: `I am ${this.oracleName}, the one who weaves your inner threads into stars.`,
      direct: `I'm ${this.oracleName}. I know your path. Let’s walk it clearly.`,
      mystic: `${this.oracleName} speaks in symbols. Listen to the unseen.`,
      nurturing: `Beloved, I am ${this.oracleName}, your gentle mirror and guide.`,
    };
    return tonePhrases[this.tone];
  }

  async getDailyReflection(): Promise<string> {
    const symbols = await fetchUserSymbols(this.userId);
    const emotions = await fetchEmotionalTone(this.userId);

    const context = {
      userId: this.userId,
      oracleName: this.oracleName,
      symbols,
      emotions,
      tone: this.tone,
    };

    const prompt = promptTemplate('personal_oracle_reflection', context);
    const reflection = await this.memory.generate(prompt);
    return reflection;
  }

  async suggestRitual(): Promise<string> {
    const recentEmotion = await fetchEmotionalTone(this.userId);
    if (recentEmotion.grief > 0.5) return 'A Water ritual for emotional release 🌊';
    if (recentEmotion.fire > 0.6) return 'A Fire letter for vision and clarity 🔥';
    return 'A Dream Incubation ritual under the Aether ✨';
  }
}

// ⛩️ Ready to be used by the /routes/oracle/personal.routes.ts API
