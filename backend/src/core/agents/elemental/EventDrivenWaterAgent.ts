// 💧 EVENT-DRIVEN WATER AGENT
// Handles emotional healing, intuition, and flow-based guidance

import { EventDrivenAgent, AgentIdentity, AgentRequest, AgentResponse } from '../EventDrivenAgent';
import { IWaterAgent } from '@/lib/shared/interfaces/IElementalAgent';
import { logger } from '../../../utils/logger';

export class EventDrivenWaterAgent extends EventDrivenAgent implements IWaterAgent {
  public readonly element = "water" as const;

  constructor() {
    const identity: AgentIdentity = {
      id: 'water_agent_v2',
      name: 'WaterAgent',
      element: 'water',
      archetype: 'healer',
      version: '2.0.0',
      capabilities: [
        'emotional_healing',
        'intuitive_guidance', 
        'flow_optimization',
        'relationship_harmony',
        'energy_cleansing'
      ]
    };

    super(identity);
  }

  protected matchesAgentType(agentType: string): boolean {
    return agentType === 'water_agent' || 
           agentType === 'WaterAgent' || 
           agentType.toLowerCase().includes('water');
  }

  protected async processRequest(request: AgentRequest): Promise<AgentResponse> {
    const { requestId, input, context, userId } = request;
    
    logger.info(`[WaterAgent] Processing emotion/flow-oriented request: ${input.substring(0, 50)}...`);

    // Analyze water energy needs
    const waterAnalysis = this.analyzeWaterEnergy(input, context);
    
    // Generate water-based guidance
    const guidance = await this.generateWaterGuidance(input, waterAnalysis, context);
    
    // Extract insights
    const insights = this.extractWaterInsights(input, guidance, waterAnalysis);
    
    // Determine voice characteristics
    const voice = this.selectWaterVoice(waterAnalysis);
    
    // Generate wisdom synthesis
    const wisdom = this.synthesizeWaterWisdom(guidance, insights);

    return this.createResponse(requestId, guidance, waterAnalysis.confidence, {
      voice,
      insights,
      wisdom,
      metadata: {
        ...this.createResponse(requestId, guidance).metadata,
        emotionalDepth: waterAnalysis.emotionalDepth,
        intuitionLevel: waterAnalysis.intuitionLevel,
        flowState: waterAnalysis.flowState,
        healingPotential: waterAnalysis.healingPotential
      }
    });
  }

  // Implementation of IWaterAgent interface
  public async process(query: any): Promise<any> {
    const requestId = `water_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const request: AgentRequest = {
      requestId,
      input: query.input || query,
      context: query.context || {},
      userId: query.userId || 'unknown'
    };

    return await this.processRequest(request);
  }

  public async processEmotionalQuery(input: string, context?: any): Promise<any> {
    const emotionalContext = {
      ...context,
      focusArea: 'emotional',
      energyType: 'receptive'
    };

    return await this.process({ input, context: emotionalContext });
  }

  public async getIntuitiveGuidance(context: any): Promise<string> {
    const intuitionRequest = {
      input: 'I need to connect with my inner wisdom and intuition',
      context: { ...context, guidanceType: 'intuitive' }
    };

    const response = await this.process(intuitionRequest);
    return response.response || response.guidance || 'Trust the wisdom that flows from your heart.';
  }

  public async getGuidance(input: string, context?: any): Promise<string> {
    const response = await this.process({ input, context });
    return response.response || response.guidance || 'Allow your emotions to guide you toward healing.';
  }

  // Water-specific analysis methods
  private analyzeWaterEnergy(input: string, context: any): any {
    const lowerInput = input.toLowerCase();
    
    // Emotional indicators
    const emotionalKeywords = ['feel', 'emotion', 'heart', 'love', 'hurt', 'heal', 'pain'];
    const emotionalScore = this.calculateKeywordPresence(lowerInput, emotionalKeywords);
    
    // Intuition indicators
    const intuitionKeywords = ['intuition', 'sense', 'feel like', 'gut', 'instinct', 'inner'];
    const intuitionScore = this.calculateKeywordPresence(lowerInput, intuitionKeywords);
    
    // Flow indicators  
    const flowKeywords = ['flow', 'natural', 'ease', 'smooth', 'rhythm', 'harmonious'];
    const flowScore = this.calculateKeywordPresence(lowerInput, flowKeywords);
    
    // Resistance indicators (water needed)
    const resistanceKeywords = ['stuck', 'rigid', 'forced', 'struggle', 'fight', 'tension'];
    const resistanceScore = this.calculateKeywordPresence(lowerInput, resistanceKeywords);

    const emotionalDepth = Math.max(emotionalScore, resistanceScore * 0.7);
    const intuitionLevel = intuitionScore + (emotionalScore * 0.5);
    const flowState = flowScore - (resistanceScore * 0.8);
    
    return {
      emotionalDepth: Math.min(1.0, emotionalDepth),
      intuitionLevel: Math.min(1.0, intuitionLevel),
      flowState: Math.max(0.0, Math.min(1.0, flowState + 0.5)),
      healingPotential: emotionalScore > 0.3 || resistanceScore > 0.4,
      confidence: Math.min(1.0, (emotionalDepth + intuitionLevel) / 2),
      needs: this.identifyWaterNeeds(emotionalScore, intuitionScore, flowScore, resistanceScore)
    };
  }

  private async generateWaterGuidance(input: string, waterAnalysis: any, context: any): Promise<string> {
    const { emotionalDepth, intuitionLevel, flowState, healingPotential } = waterAnalysis;

    // High emotional depth, needs healing
    if (emotionalDepth > 0.7 && healingPotential) {
      return this.generateHealingGuidance(input, context);
    }
    
    // Strong intuition present
    if (intuitionLevel > 0.6) {
      return this.generateIntuitiveGuidance(input, context);
    }
    
    // Flow state needed
    if (flowState < 0.4) {
      return this.generateFlowGuidance(input, context);
    }
    
    // Default water guidance
    return this.generateBalancedWaterGuidance(input, context);
  }

  private generateHealingGuidance(input: string, context: any): string {
    const healingTemplates = [
      "Your heart is calling for gentle healing. What would it feel like to offer yourself the same compassion you give others?",
      "I sense deep waters stirring within you. This emotional current carries both pain and the seeds of profound healing.",
      "The water element invites you to flow around obstacles rather than through them. Where can you find softness in this situation?",
      "Your tears are sacred waters that cleanse and renew. Honor what your heart is trying to tell you."
    ];
    
    return healingTemplates[Math.floor(Math.random() * healingTemplates.length)];
  }

  private generateIntuitiveGuidance(input: string, context: any): string {
    const intuitiveTemplates = [
      "Your inner wisdom is speaking clearly. Trust the knowing that arises from your depths, even if logic questions it.",
      "I feel the current of your intuition flowing strong. What is your heart trying to tell you beneath the surface thoughts?",
      "The water of your inner knowing runs deep and true. What do you sense when you quiet the mind and listen within?",
      "Your intuitive gifts are awakening. Pay attention to the subtle currents of feeling and knowing that arise."
    ];
    
    return intuitiveTemplates[Math.floor(Math.random() * intuitiveTemplates.length)];
  }

  private generateFlowGuidance(input: string, context: any): string {
    const flowTemplates = [
      "Life is asking you to soften and flow rather than push against the current. Where can you find more ease?",
      "Like water finding its way around rocks, perhaps there's a gentler path that serves your highest good.",
      "I sense resistance where flow wants to happen. What would it look like to move with life rather than against it?",
      "The water element teaches us that persistence and gentleness can overcome the hardest obstacles."
    ];
    
    return flowTemplates[Math.floor(Math.random() * flowTemplates.length)];
  }

  private generateBalancedWaterGuidance(input: string, context: any): string {
    const balancedTemplates = [
      "Your emotional wisdom is a gift. How can you honor both your feelings and your deeper knowing?",
      "I see the interplay of heart and intuition in your situation. Both have guidance to offer.",
      "Like a calm lake reflecting the sky, your inner stillness holds profound wisdom.",
      "Your capacity for empathy and connection is a sacred gift. How can you share it while honoring your own needs?"
    ];
    
    return balancedTemplates[Math.floor(Math.random() * balancedTemplates.length)];
  }

  private extractWaterInsights(input: string, guidance: string, waterAnalysis: any): string[] {
    const insights: string[] = [];
    
    if (waterAnalysis.healingPotential) {
      insights.push('Emotional healing opportunity present - water energy supports transformation');
    }
    
    if (waterAnalysis.intuitionLevel > 0.7) {
      insights.push('Strong intuitive currents detected - trust inner knowing');
    }
    
    if (waterAnalysis.flowState < 0.4) {
      insights.push('Flow resistance detected - seeking gentler approaches');
    }
    
    if (input.includes('relationship') || input.includes('connection')) {
      insights.push('Relationship harmony focus - water element supports connection');
    }
    
    return insights;
  }

  private selectWaterVoice(waterAnalysis: any): string {
    if (waterAnalysis.healingPotential && waterAnalysis.emotionalDepth > 0.7) {
      return 'water_healing';
    } else if (waterAnalysis.intuitionLevel > 0.8) {
      return 'water_intuitive';
    } else if (waterAnalysis.flowState < 0.4) {
      return 'water_gentle_flow';
    } else {
      return 'water_balanced';
    }
  }

  private synthesizeWaterWisdom(guidance: string, insights: string[]): string {
    if (insights.includes('Emotional healing opportunity present')) {
      return 'Your emotional depths hold the keys to profound healing and transformation.';
    }
    
    if (insights.includes('Strong intuitive currents detected')) {
      return 'The wisdom of your heart flows deeper than the surface mind. Trust its guidance.';
    }
    
    if (insights.includes('Flow resistance detected')) {
      return 'Like water, your greatest power lies in your ability to flow around obstacles with grace.';
    }
    
    return 'Your emotional intelligence and intuitive gifts are sacred waters that nourish both yourself and others.';
  }

  private calculateKeywordPresence(text: string, keywords: string[]): number {
    const words = text.split(/\s+/);
    const matches = words.filter(word => 
      keywords.some(keyword => word.includes(keyword))
    );
    return matches.length / words.length;
  }

  private identifyWaterNeeds(emotionalScore: number, intuitionScore: number, flowScore: number, resistanceScore: number): string[] {
    const needs: string[] = [];
    
    if (resistanceScore > 0.3) needs.push('flow_restoration');
    if (emotionalScore > 0.4) needs.push('emotional_healing');
    if (intuitionScore < 0.3) needs.push('intuition_development');
    if (flowScore < 0.3) needs.push('ease_cultivation');
    
    return needs;
  }
}