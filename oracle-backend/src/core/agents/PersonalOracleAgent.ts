import { logOracleMemory } from '@/lib/logOracleMemory';

export class PersonalOracleAgent {
  constructor(
    private config: { userId: string; oracleName: string; tone: string }
  ) {}

  async getIntroMessage(): Promise<string> {
    return `Welcome, I am ${this.config.oracleName}. I will walk with you into the sacred unknown.`;
  }

  async getDailyReflection(): Promise<string> {
    const reflection =
      'Today invites you to return to breath and remember the subtle beauty in your ordinary steps.';

    await logOracleMemory({
      userId: this.config.userId,
      type: 'reflection',
      content: reflection,
      element: 'aether',
      source: this.config.oracleName,
    });

    return reflection;
  }

  async suggestRitual(): Promise<string> {
    const ritual =
      'Offer a cup of tea to the dawn. Drink slowly. Listen to the silence.';

    await logOracleMemory({
      userId: this.config.userId,
      type: 'ritual',
      content: ritual,
      element: 'water',
      source: this.config.oracleName,
    });

    return ritual;
  }

  async getArchetypalInsight(element: string): Promise<any> {
    const message = `Today your ${element} archetype is the Mystic — a guide through realms within and beyond.`;

    await logOracleMemory({
      userId: this.config.userId,
      type: 'insight',
      content: message,
      element,
      source: this.config.oracleName,
    });

    return {
      message,
      archetype: 'Mystic',
      tone: this.config.tone,
      card: 'The High Priestess',
      symbol: '🜔',
      ritualId: 'ritual-water-001',
    };
  }

  async getRecommendations(): Promise<string[]> {
    const recs = [
      'Return tomorrow for a breath ritual',
      `Reflect on the name "${this.config.oracleName}" and why it chose you`,
      'Invite the Aether Oracle for your first dream transmission tonight',
    ];

    await Promise.all(
      recs.map((text) =>
        logOracleMemory({
          userId: this.config.userId,
          type: 'recommendation',
          content: text,
          element: 'aether',
          source: this.config.oracleName,
        })
      )
    );

    return recs;
  }
}
