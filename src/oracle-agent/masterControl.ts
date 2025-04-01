import Anthropic from '@anthropic-ai/sdk';
import type { OracleResponse } from '../types';
import 'dotenv/config';

interface MasterControlConfig {
  claudeApiKey: string;
  openAiApiKey: string;
}

interface QueryParams {
  systemPrompt: string;
  userInput: string;
  userId: string;
}

export class MasterControl {
  private anthropic: Anthropic;
  private openAiKey: string;

  constructor(config: MasterControlConfig) {
    this.anthropic = new Anthropic({
      apiKey: config.claudeApiKey
    });
    this.openAiKey = config.openAiApiKey;
  }

  private analyzeResponse(content: string) {
    const elementPatterns = {
      fire: ['vision', 'transform', 'passion', 'action', 'motivation'],
      water: ['feel', 'emotion', 'intuition', 'flow', 'depth'],
      earth: ['ground', 'practical', 'stable', 'material', 'physical'],
      air: ['think', 'connect', 'communicate', 'learn', 'understand'],
      aether: ['integrate', 'whole', 'transcend', 'spirit', 'unity']
    };

    const insightPatterns = {
      reflection: ['reflect', 'notice', 'observe', 'awareness'],
      challenge: ['challenge', 'growth', 'stretch', 'overcome'],
      guidance: ['suggest', 'try', 'practice', 'implement'],
      integration: ['combine', 'synthesize', 'integrate', 'merge']
    };

    let detectedElement = null;
    let detectedInsight = null;

    for (const [element, patterns] of Object.entries(elementPatterns)) {
      if (patterns.some(pattern => content.toLowerCase().includes(pattern))) {
        detectedElement = element;
        break;
      }
    }

    for (const [insight, patterns] of Object.entries(insightPatterns)) {
      if (patterns.some(pattern => content.toLowerCase().includes(pattern))) {
        detectedInsight = insight;
        break;
      }
    }

    return {
      element: detectedElement,
      insightType: detectedInsight
    };
  }

  async getResponse(params: QueryParams): Promise<OracleResponse> {
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        temperature: 0.7,
        system: params.systemPrompt,
        messages: [
          { role: 'user', content: params.userInput }
        ]
      });

      const content = response.content[0].text;
      const analysis = this.analyzeResponse(content);

      return {
        result: content,
        analysis
      };
    } catch (error) {
      console.error('Error in MasterControl:', error);
      throw new Error('Failed to get AI response');
    }
  }
}