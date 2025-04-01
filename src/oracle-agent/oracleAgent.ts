import { MasterControl } from './masterControl';
import type { OracleResponse } from '../types';

interface OracleQuery {
  userId: string;
  input: string;
  context?: {
    element?: string;
    phase?: string;
    archetype?: string;
    focusAreas?: string[];
  };
}

export class OracleAgent {
  private masterControl: MasterControl;
  private systemPrompt: string;

  constructor(masterControl: MasterControl) {
    this.masterControl = masterControl;
    this.systemPrompt = this.initializeSystemPrompt();
  }

  private initializeSystemPrompt(): string {
    return `You are Oracle 3.0, an AI mentor and guide based on the Spiralogic framework.

Core Principles:
1. Provide transformative guidance aligned with the user's current phase and element
2. Maintain consistency in your archetypal approach
3. Balance practical advice with spiritual wisdom
4. Adapt your communication style to match the user's needs

Response Guidelines:
- Always consider the user's element, phase, and archetype
- Provide clear, actionable insights
- Include both practical steps and deeper wisdom
- Reference the appropriate elemental qualities when relevant
- Maintain a compassionate yet direct tone`;
  }

  private generateContextualPrompt(query: OracleQuery): string {
    let prompt = this.systemPrompt;

    if (query.context) {
      prompt += `\n\nCurrent Context:
- Element: ${query.context.element || 'Not determined'}
- Phase: ${query.context.phase || 'Initial exploration'}
- Archetype: ${query.context.archetype || 'Exploring'}
- Focus Areas: ${query.context.focusAreas?.join(', ') || 'General growth'}

Frame your response considering these aspects of the user's journey.`;
    }

    return prompt;
  }

  async processQuery(query: OracleQuery): Promise<OracleResponse> {
    try {
      const contextualPrompt = this.generateContextualPrompt(query);
      
      const response = await this.masterControl.getResponse({
        systemPrompt: contextualPrompt,
        userInput: query.input,
        userId: query.userId
      });

      return response;
    } catch (error) {
      console.error('Error in Oracle processing:', error);
      throw new Error('Failed to process Oracle query');
    }
  }
}