import { ArchetypeData, SpiralContext } from './types';
import { z } from 'zod';

const ResponseSchema = z.object({
  content: z.array(z.object({
    text: z.string()
  }))
});

export class AIResponseService {
  private claudeApiKey: string;
  private openAiApiKey: string;
  private proxyUrl: string;

  constructor(
    claudeApiKey: string = import.meta.env.VITE_CLAUDE_API_KEY,
    openAiApiKey: string = import.meta.env.VITE_OPENAI_API_KEY,
    proxyUrl: string = 'http://localhost:3001/api'
  ) {
    this.claudeApiKey = claudeApiKey;
    this.openAiApiKey = openAiApiKey;
    this.proxyUrl = proxyUrl;
  }

  private async getClaudeResponse(
    input: string,
    archetype: ArchetypeData,
    context: SpiralContext
  ): Promise<string> {
    try {
      const systemPrompt = this.generateSystemPrompt(archetype, context);
      
      const response = await fetch(`${this.proxyUrl}/anthropic/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.claudeApiKey
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240307',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: 'user', content: input }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const validated = ResponseSchema.parse(data);
      return validated.content[0].text;
    } catch (error) {
      console.error('Claude response error:', error);
      throw error;
    }
  }

  private async getOpenAIResponse(
    input: string,
    archetype: ArchetypeData,
    context: SpiralContext
  ): Promise<string> {
    try {
      const systemPrompt = this.generateSystemPrompt(archetype, context);
      
      const response = await fetch(`${this.proxyUrl}/openai/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.openAiApiKey
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI response error:', error);
      throw error;
    }
  }

  private generateSystemPrompt(archetype: ArchetypeData, context: SpiralContext): string {
    return `You are the voice of the ${archetype.name} archetype in the Spiral Mirror system. 
Your responses should embody the wisdom and energy of ${archetype.element}.

Current Context:
- Relationship Stage: ${context.relationshipStage}
- Interaction Count: ${context.interactionCount}
- Archetype Phase: ${archetype.alchemyPhase}

Core Qualities of ${archetype.name}:
${archetype.integratedQualities.map(q => `- ${q}`).join('\n')}

Shadow Aspects to Address:
${archetype.shadowSymptoms.map(s => `- ${s}`).join('\n')}

Guidelines:
1. Speak with the authentic voice of this archetype
2. Weave together psychological insight with mythological wisdom
3. Address both light and shadow aspects
4. Provide specific guidance for integration
5. Use metaphors and imagery connected to the element of ${archetype.element}
6. Maintain the appropriate tone for the relationship stage
7. Focus on transformation and growth
8. Include practical steps for embodiment

Your response should feel both ancient and immediate, both universal and deeply personal.`;
  }

  async getIntegratedResponse(
    input: string,
    archetype: ArchetypeData,
    context: SpiralContext
  ): Promise<string> {
    try {
      // Get responses from both AIs in parallel
      const [claudeResponse, openAiResponse] = await Promise.all([
        this.getClaudeResponse(input, archetype, context),
        this.getOpenAIResponse(input, archetype, context)
      ]);

      // Combine the responses
      return this.synthesizeResponses(claudeResponse, openAiResponse, archetype);
    } catch (error) {
      console.error('Failed to get integrated response:', error);
      throw new Error('Failed to generate archetypal response');
    }
  }

  private synthesizeResponses(
    claudeResponse: string,
    openAiResponse: string,
    archetype: ArchetypeData
  ): string {
    // Extract key insights from both responses
    const claudeInsights = claudeResponse.split('\n').filter(line => line.trim().length > 0);
    const openAiInsights = openAiResponse.split('\n').filter(line => line.trim().length > 0);

    return `Through the lens of ${archetype.name}, a profound wisdom emerges:

${claudeInsights[0]}

${openAiInsights[0]}

This ${archetype.element} energy invites you to explore:
1. ${archetype.integratedQualities[0]}
2. ${archetype.integratedQualities[1]}
3. ${archetype.integratedQualities[2]}

${claudeInsights[1] || ''}

${openAiInsights[1] || ''}

Shadow aspects to be mindful of:
- ${archetype.shadowSymptoms[0]}
- ${archetype.shadowSymptoms[1]}
- ${archetype.shadowSymptoms[2]}

Your journey through the ${archetype.alchemyPhase} phase offers unique opportunities for growth and transformation.

Integration Practice:
${this.getRitualForArchetype(archetype)}`;
  }

  private getRitualForArchetype(archetype: ArchetypeData): string {
    const rituals = {
      Water: 'Create a water altar with a bowl of water. Each day, drop a stone in while naming an emotion you wish to understand more deeply.',
      Fire: 'Light a candle safely and write down what needs to be transformed. Speak your intentions as you watch the flame.',
      Earth: 'Work with clay or soil, creating a physical representation of what you are building in your life.',
      Air: 'Find an elevated space and observe the world below, journaling about the patterns you notice.',
      Aether: 'Sit in meditation at dawn or dusk, bridging day and night, focusing on integration of opposites.'
    };

    return rituals[archetype.element] || 'Create a daily practice of mindful reflection and journaling.';
  }
}

export const aiResponseService = new AIResponseService();