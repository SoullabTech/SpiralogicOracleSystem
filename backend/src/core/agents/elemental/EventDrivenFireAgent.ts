// 🔥 EVENT-DRIVEN FIRE AGENT
// Example of how to refactor an existing agent to use event-driven communication

import { EventDrivenAgent, AgentIdentity, AgentRequest, AgentResponse } from '../EventDrivenAgent';
import { IFireAgent } from '@/lib/shared/interfaces/IElementalAgent';
import { logger } from '../../../utils/logger';

export class EventDrivenFireAgent extends EventDrivenAgent implements IFireAgent {
  public readonly element = "fire" as const;

  constructor() {
    const identity: AgentIdentity = {
      id: 'fire_agent_v2',
      name: 'FireAgent',
      element: 'fire',
      archetype: 'warrior',
      version: '2.0.0',
      capabilities: [
        'action_guidance',
        'motivation_enhancement', 
        'passion_activation',
        'transformation_catalysis',
        'courage_building'
      ]
    };

    super(identity);
  }

  protected matchesAgentType(agentType: string): boolean {
    return agentType === 'fire_agent' || 
           agentType === 'FireAgent' || 
           agentType.toLowerCase().includes('fire');
  }

  protected async processRequest(request: AgentRequest): Promise<AgentResponse> {
    const { requestId, input, context, userId } = request;
    
    logger.info(`[FireAgent] Processing fire-oriented request: ${input.substring(0, 50)}...`);

    // Analyze fire energy needs
    const fireAnalysis = this.analyzeFireEnergy(input, context);
    
    // Generate fire-based guidance
    const guidance = await this.generateFireGuidance(input, fireAnalysis, context);
    
    // Extract insights
    const insights = this.extractFireInsights(input, guidance, fireAnalysis);
    
    // Determine voice characteristics
    const voice = this.selectFireVoice(fireAnalysis);
    
    // Generate wisdom synthesis
    const wisdom = this.synthesizeFireWisdom(guidance, insights);

    return this.createResponse(requestId, guidance, fireAnalysis.confidence, {
      voice,
      insights,
      wisdom,
      metadata: {
        ...this.createResponse(requestId, guidance).metadata,
        fireEnergyLevel: fireAnalysis.energyLevel,
        actionPotential: fireAnalysis.actionPotential,
        transformationReady: fireAnalysis.transformationReady,
        motivationalVector: fireAnalysis.motivationalVector
      }
    });
  }

  // Implementation of IFireAgent interface
  public async process(query: any): Promise<any> {
    // This method bridges the interface with event-driven processing
    // In practice, this would publish an event and return a promise that resolves
    // when the processing is complete via events
    
    const requestId = `fire_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // For backwards compatibility, we'll process directly here
    // but in a full event-driven system, this would be async via events
    const request: AgentRequest = {
      requestId,
      input: query.input || query,
      context: query.context || {},
      userId: query.userId || 'unknown'
    };

    return await this.processRequest(request);
  }

  public async processActionQuery(input: string, context?: any): Promise<any> {
    const actionContext = {
      ...context,
      focusArea: 'action',
      energyType: 'kinetic'
    };

    return await this.process({ input, context: actionContext });
  }

  public async getMotivationalGuidance(context: any): Promise<string> {
    const motivationRequest = {
      input: 'I need motivation and energy to take action',
      context: { ...context, guidanceType: 'motivational' }
    };

    const response = await this.process(motivationRequest);
    return response.response || response.guidance || 'Trust your inner fire to guide you forward.';
  }

  public async getGuidance(input: string, context?: any): Promise<string> {
    const response = await this.process({ input, context });
    return response.response || response.guidance || 'Let your fire energy illuminate the path ahead.';
  }

  // Fire-specific analysis methods
  private analyzeFireEnergy(input: string, context: any): any {
    const lowerInput = input.toLowerCase();
    
    // Action indicators
    const actionKeywords = ['do', 'act', 'start', 'begin', 'create', 'make', 'build'];
    const actionScore = this.calculateKeywordPresence(lowerInput, actionKeywords);
    
    // Energy indicators
    const energyKeywords = ['energy', 'power', 'strength', 'force', 'drive', 'passion'];
    const energyScore = this.calculateKeywordPresence(lowerInput, energyKeywords);
    
    // Transformation indicators  
    const transformKeywords = ['change', 'transform', 'breakthrough', 'breakthrough', 'revolution'];
    const transformScore = this.calculateKeywordPresence(lowerInput, transformKeywords);
    
    // Stagnation indicators (fire needed)
    const stagnationKeywords = ['stuck', 'blocked', 'procrastinate', 'lazy', 'unmotivated'];
    const stagnationScore = this.calculateKeywordPresence(lowerInput, stagnationKeywords);

    const energyLevel = Math.max(actionScore, energyScore, transformScore) + (stagnationScore * 0.5);
    const actionPotential = actionScore + (transformScore * 0.8);
    const transformationReady = transformScore > 0.3 || stagnationScore > 0.4;
    
    return {
      energyLevel: Math.min(1.0, energyLevel),
      actionPotential: Math.min(1.0, actionPotential),
      transformationReady,
      confidence: Math.min(1.0, energyLevel + actionPotential) / 2,
      motivationalVector: this.determineMotivationalVector(actionScore, energyScore, transformScore, stagnationScore),
      needs: this.identifyFireNeeds(actionScore, energyScore, transformScore, stagnationScore)
    };
  }

  private async generateFireGuidance(input: string, fireAnalysis: any, context: any): Promise<string> {
    const { energyLevel, actionPotential, transformationReady, motivationalVector } = fireAnalysis;

    // High energy, ready for action
    if (energyLevel > 0.7 && actionPotential > 0.6) {
      return this.generateActionGuidance(input, context);
    }
    
    // Low energy, needs activation
    if (energyLevel < 0.4) {
      return this.generateActivationGuidance(input, context);
    }
    
    // Transformation potential
    if (transformationReady) {
      return this.generateTransformationGuidance(input, context);
    }
    
    // Default fire guidance
    return this.generateBalancedFireGuidance(input, context, motivationalVector);
  }

  private generateActionGuidance(input: string, context: any): string {
    const actionTemplates = [
      "Your fire burns bright and ready. Channel this energy into concrete action - what single step can you take right now?",
      "I feel the warrior energy stirring within you. This is your moment to move from vision to manifestation.",
      "Your inner flame is calling for expression. Trust this surge of creative power and let it guide your next bold move.",
      "The fire of inspiration is alive in you. Strike while this energy peaks - what has been waiting for your courage?"
    ];
    
    return actionTemplates[Math.floor(Math.random() * actionTemplates.length)];
  }

  private generateActivationGuidance(input: string, context: any): string {
    const activationTemplates = [
      "I sense your fire is dimmed but not extinguished. What small spark of passion still glows within you?",
      "Your warrior spirit is calling to awaken. What vision or dream still makes your heart quicken?",
      "Even embers can reignite into flame. What would restore your sense of purpose and creative power?",
      "The fire element seeks to serve your highest expression. What would it feel like to move with confidence again?"
    ];
    
    return activationTemplates[Math.floor(Math.random() * activationTemplates.length)];
  }

  private generateTransformationGuidance(input: string, context: any): string {
    const transformationTemplates = [
      "A profound transformation is stirring within you. Your fire is ready to burn away what no longer serves.",
      "I see the phoenix energy awakening in you. This fire will forge you anew - are you ready to embrace the change?",
      "Your spiritual fire is calling for a breakthrough. What old patterns are ready to be transformed by this sacred flame?",
      "The alchemical fire of change is active in your life. Trust this process of renewal and regeneration."
    ];
    
    return transformationTemplates[Math.floor(Math.random() * transformationTemplates.length)];
  }

  private generateBalancedFireGuidance(input: string, context: any, motivationalVector: string): string {
    const balancedTemplates = [
      "Your fire energy seeks purposeful expression. How can you honor both your vision and your need for grounded action?",
      "The flame of your authentic self wants to shine. What would it look like to express your true nature more fully?",
      "I see the balance between your passionate nature and your wise restraint. Both serve your highest good.",
      "Your fire burns with steady warmth rather than wild flame. This sustainable energy will serve you well."
    ];
    
    return balancedTemplates[Math.floor(Math.random() * balancedTemplates.length)];
  }

  private extractFireInsights(input: string, guidance: string, fireAnalysis: any): string[] {
    const insights: string[] = [];
    
    if (fireAnalysis.transformationReady) {
      insights.push('Transformation potential detected - fire energy ready for breakthrough');
    }
    
    if (fireAnalysis.actionPotential > 0.7) {
      insights.push('High action potential - optimal time for manifestation');
    }
    
    if (fireAnalysis.energyLevel < 0.4) {
      insights.push('Fire energy activation needed - seek inspiration sources');
    }
    
    if (input.includes('passion') || input.includes('purpose')) {
      insights.push('Purpose and passion alignment opportunity');
    }
    
    return insights;
  }

  private selectFireVoice(fireAnalysis: any): string {
    if (fireAnalysis.energyLevel > 0.8) {
      return 'fire_passionate';
    } else if (fireAnalysis.transformationReady) {
      return 'fire_transformational';  
    } else if (fireAnalysis.energyLevel < 0.4) {
      return 'fire_gentle_activation';
    } else {
      return 'fire_balanced';
    }
  }

  private synthesizeFireWisdom(guidance: string, insights: string[]): string {
    if (insights.includes('Transformation potential detected')) {
      return 'The fire of transformation burns within you. Trust the process of renewal.';
    }
    
    if (insights.includes('High action potential')) {
      return 'Your fire energy is primed for manifestation. Channel this power wisely.';
    }
    
    if (insights.includes('Fire energy activation needed')) {
      return 'Even the smallest spark can reignite your inner flame. Seek what inspires you.';
    }
    
    return 'Your fire energy is a sacred gift. Use it to illuminate both your path and serve others.';
  }

  private calculateKeywordPresence(text: string, keywords: string[]): number {
    const words = text.split(/\s+/);
    const matches = words.filter(word => 
      keywords.some(keyword => word.includes(keyword))
    );
    return matches.length / words.length;
  }

  private determineMotivationalVector(actionScore: number, energyScore: number, transformScore: number, stagnationScore: number): string {
    if (stagnationScore > 0.4) return 'activation';
    if (transformScore > 0.3) return 'transformation';
    if (actionScore > energyScore) return 'manifestation';
    if (energyScore > actionScore) return 'empowerment';
    return 'balanced_expression';
  }

  private identifyFireNeeds(actionScore: number, energyScore: number, transformScore: number, stagnationScore: number): string[] {
    const needs: string[] = [];
    
    if (stagnationScore > 0.3) needs.push('activation');
    if (actionScore < 0.3) needs.push('action_guidance');
    if (energyScore < 0.3) needs.push('energy_building');
    if (transformScore > 0.4) needs.push('transformation_support');
    
    return needs;
  }
}