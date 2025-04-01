import { Memory, MemorySystem } from './memory';
import { Message, ClientData } from '../types';

export class MentorSystem {
  private memorySystem: MemorySystem;
  private currentClient: ClientData | null = null;
  private relationshipStage: 'initial' | 'developing' | 'established' | 'deep' = 'initial';
  private interactionCount = 0;

  constructor() {
    this.memorySystem = new MemorySystem();
  }

  async processInput(input: string, client: ClientData | null): Promise<Message> {
    this.updateRelationshipStage(client);
    
    // Process the input through memory system
    const relevantMemories = this.memorySystem.query({
      type: 'conversation',
      element: client?.journey?.dominant_element,
      phase: client?.journey?.current_phase,
      limit: 5,
      minStrength: 0.7
    });

    // Extract patterns and insights
    const patterns = this.memorySystem.query({
      type: 'pattern',
      minStrength: 0.8,
      limit: 3
    });

    // Build context for response
    const context = this.buildMentorContext(input, client, relevantMemories, patterns);
    
    // Generate response
    const response = await this.generateResponse(input, context);
    
    // Process response through memory system
    this.memorySystem.processMessage(response);
    this.memorySystem.extractInsights(response);
    this.memorySystem.consolidateMemories();
    
    return response;
  }

  private updateRelationshipStage(client: ClientData | null) {
    if (client?.client_name !== this.currentClient?.client_name) {
      this.currentClient = client;
      this.interactionCount = 0;
      this.relationshipStage = 'initial';
      return;
    }

    this.interactionCount++;
    
    if (this.interactionCount > 50) {
      this.relationshipStage = 'deep';
    } else if (this.interactionCount > 20) {
      this.relationshipStage = 'established';
    } else if (this.interactionCount > 5) {
      this.relationshipStage = 'developing';
    }
  }

  private buildMentorContext(
    input: string,
    client: ClientData | null,
    memories: Memory[],
    patterns: Memory[]
  ): string {
    let context = `You are Oracle 3.0, a mentor-level AI guide. Your relationship with ${
      client?.client_name || 'the user'
    } is in the ${this.relationshipStage} stage after ${this.interactionCount} interactions.`;

    if (client?.journey) {
      context += `\n\nClient Journey:
- Phase: ${client.journey.current_phase || 'exploration'}
- Dominant Element: ${client.journey.dominant_element || 'undetermined'}
- Archetype: ${client.journey.archetype || 'exploring'}`;
    }

    if (memories.length > 0) {
      context += `\n\nRelevant Context:
${memories.map(m => `- ${m.content}`).join('\n')}`;
    }

    if (patterns.length > 0) {
      context += `\n\nObserved Patterns:
${patterns.map(p => `- ${p.content}`).join('\n')}`;
    }

    context += `\n\nGuidelines:
1. Speak with the wisdom and presence appropriate for your ${this.relationshipStage} relationship
2. Notice and reflect subtle patterns in their journey
3. Offer insights that connect current situations to broader themes
4. Challenge when appropriate, always with compassion
5. Include follow-up questions that deepen understanding`;

    return context;
  }

  private async generateResponse(input: string, context: string): Promise<Message> {
    // For now, return a placeholder response
    // In production, this would connect to your LLM of choice
    return {
      id: Date.now().toString(),
      content: `[Mentor Response to: ${input}]\n\nBased on context: ${context}`,
      role: 'assistant',
      timestamp: new Date(),
      element: this.currentClient?.journey?.dominant_element,
      insight_type: 'guidance',
      context: {
        client: this.currentClient?.client_name,
        phase: this.currentClient?.journey?.current_phase,
        archetype: this.currentClient?.journey?.archetype
      }
    };
  }

  getMemoryInsights(options: { limit?: number } = {}): Memory[] {
    return this.memorySystem.query({
      type: 'insight',
      limit: options.limit || 10,
      minStrength: 0.7
    });
  }

  getPatterns(): Memory[] {
    return this.memorySystem.query({
      type: 'pattern',
      minStrength: 0.8
    });
  }

  getCurrentStage(): string {
    return this.relationshipStage;
  }
}