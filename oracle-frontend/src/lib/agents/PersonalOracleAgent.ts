import { logOracleMemory } from '@/lib/logOracleMemory';

export class PersonalOracleAgent {
  constructor(
    private config: { userId: string; oracleName: string; tone: string; archetype?: string }
  ) {
    // Log selection upon creation
    logOracleMemory({
      userId: this.config.userId,
      type: 'oracle_init',
      content: `Initialized with tone "${this.config.tone}" and archetype "${this.config.archetype}"`,
      element: 'aether',
      source: this.config.oracleName,
    });
  }

  async getIntroMessage(): Promise<string> {
    return `Welcome, I am ${this.config.oracleName}. I will walk with you into the sacred unknown.`;
  }

  // ... all other methods unchanged
}
