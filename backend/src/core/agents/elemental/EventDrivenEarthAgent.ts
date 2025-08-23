// 🌍 EVENT-DRIVEN EARTH AGENT
// Handles practical guidance, stability, and grounding energy

import { EventDrivenAgent, AgentIdentity, AgentRequest, AgentResponse } from '../EventDrivenAgent';
import { IEarthAgent } from '@/lib/shared/interfaces/IElementalAgent';
import { logger } from '../../../utils/logger';

export class EventDrivenEarthAgent extends EventDrivenAgent implements IEarthAgent {
  public readonly element = "earth" as const;

  constructor() {
    const identity: AgentIdentity = {
      id: 'earth_agent_v2',
      name: 'EarthAgent',
      element: 'earth',
      archetype: 'builder',
      version: '2.0.0',
      capabilities: [
        'practical_guidance',
        'stability_cultivation', 
        'grounding_support',
        'material_manifestation',
        'structured_planning'
      ]
    };

    super(identity);
  }

  protected matchesAgentType(agentType: string): boolean {
    return agentType === 'earth_agent' || 
           agentType === 'EarthAgent' || 
           agentType.toLowerCase().includes('earth');
  }

  protected async processRequest(request: AgentRequest): Promise<AgentResponse> {
    const { requestId, input, context, userId } = request;
    
    logger.info(`[EarthAgent] Processing practical/grounding request: ${input.substring(0, 50)}...`);

    // Analyze earth energy needs
    const earthAnalysis = this.analyzeEarthEnergy(input, context);
    
    // Generate earth-based guidance
    const guidance = await this.generateEarthGuidance(input, earthAnalysis, context);
    
    // Extract insights
    const insights = this.extractEarthInsights(input, guidance, earthAnalysis);
    
    // Determine voice characteristics
    const voice = this.selectEarthVoice(earthAnalysis);
    
    // Generate wisdom synthesis
    const wisdom = this.synthesizeEarthWisdom(guidance, insights);

    return this.createResponse(requestId, guidance, earthAnalysis.confidence, {
      voice,
      insights,
      wisdom,
      metadata: {
        ...this.createResponse(requestId, guidance).metadata,
        practicalityScore: earthAnalysis.practicalityScore,
        stabilityNeed: earthAnalysis.stabilityNeed,
        groundingLevel: earthAnalysis.groundingLevel,
        manifestationPotential: earthAnalysis.manifestationPotential
      }
    });
  }

  // Implementation of IEarthAgent interface
  public async process(query: any): Promise<any> {
    const requestId = `earth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const request: AgentRequest = {
      requestId,
      input: query.input || query,
      context: query.context || {},
      userId: query.userId || 'unknown'
    };

    return await this.processRequest(request);
  }

  public async processPracticalQuery(input: string, context?: any): Promise<any> {
    const practicalContext = {
      ...context,
      focusArea: 'practical',
      energyType: 'stabilizing'
    };

    return await this.process({ input, context: practicalContext });
  }

  public async getGroundingGuidance(context: any): Promise<string> {
    const groundingRequest = {
      input: 'I need stability and grounding in my life',
      context: { ...context, guidanceType: 'grounding' }
    };

    const response = await this.process(groundingRequest);
    return response.response || response.guidance || 'Find your roots in the steady rhythm of earth energy.';
  }

  public async getGuidance(input: string, context?: any): Promise<string> {
    const response = await this.process({ input, context });
    return response.response || response.guidance || 'Build your dreams with patience and practical wisdom.';
  }

  // Earth-specific analysis methods
  private analyzeEarthEnergy(input: string, context: any): any {
    const lowerInput = input.toLowerCase();
    
    // Practicality indicators
    const practicalKeywords = ['practical', 'plan', 'step', 'how', 'work', 'money', 'job', 'build'];
    const practicalityScore = this.calculateKeywordPresence(lowerInput, practicalKeywords);
    
    // Stability indicators
    const stabilityKeywords = ['stable', 'secure', 'safe', 'ground', 'foundation', 'routine'];
    const stabilityScore = this.calculateKeywordPresence(lowerInput, stabilityKeywords);
    
    // Manifestation indicators  
    const manifestationKeywords = ['create', 'build', 'achieve', 'goal', 'result', 'tangible'];
    const manifestationScore = this.calculateKeywordPresence(lowerInput, manifestationKeywords);
    
    // Chaos/instability indicators (earth needed)
    const chaosKeywords = ['chaos', 'unstable', 'scattered', 'overwhelmed', 'lost', 'scattered'];
    const chaosScore = this.calculateKeywordPresence(lowerInput, chaosKeywords);

    const stabilityNeed = Math.max(stabilityScore, chaosScore * 0.8);
    const groundingLevel = stabilityScore + (practicalityScore * 0.6);
    const manifestationPotential = manifestationScore + (practicalityScore * 0.7);
    
    return {
      practicalityScore: Math.min(1.0, practicalityScore),
      stabilityNeed: Math.min(1.0, stabilityNeed),
      groundingLevel: Math.min(1.0, groundingLevel),
      manifestationPotential: Math.min(1.0, manifestationPotential),
      chaosPresent: chaosScore > 0.3,
      confidence: Math.min(1.0, (practicalityScore + stabilityScore + manifestationScore) / 3),
      needs: this.identifyEarthNeeds(practicalityScore, stabilityScore, manifestationScore, chaosScore)
    };
  }

  private async generateEarthGuidance(input: string, earthAnalysis: any, context: any): Promise<string> {
    const { practicalityScore, stabilityNeed, manifestationPotential, chaosPresent } = earthAnalysis;

    // High chaos, needs grounding
    if (chaosPresent || stabilityNeed > 0.7) {
      return this.generateGroundingGuidance(input, context);
    }
    
    // High manifestation potential
    if (manifestationPotential > 0.6) {
      return this.generateManifestationGuidance(input, context);
    }
    
    // High practicality needs
    if (practicalityScore > 0.6) {
      return this.generatePracticalGuidance(input, context);
    }
    
    // Default earth guidance
    return this.generateBalancedEarthGuidance(input, context);
  }

  private generateGroundingGuidance(input: string, context: any): string {
    const groundingTemplates = [
      "Your roots need deepening right now. What daily practice could anchor you in steady, nurturing earth energy?",
      "I sense you need the mountain's stability within you. How can you create more structure and routine in your days?",
      "The earth element calls you to slow down and find your center. Where can you cultivate more patience with the process?",
      "Like a tree weathering storms, your strength comes from how deep your roots go. What foundations need tending?"
    ];
    
    return groundingTemplates[Math.floor(Math.random() * groundingTemplates.length)];
  }

  private generateManifestationGuidance(input: string, context: any): string {
    const manifestationTemplates = [
      "Your vision is ready to take form in the physical world. What concrete steps will bridge the gap between dream and reality?",
      "I see the builder energy stirring in you. This is fertile ground for bringing your intentions into tangible form.",
      "The earth element supports steady, methodical creation. What daily actions would compound into your desired outcome?",
      "Like a gardener tending seeds, your patient cultivation is ready to bear fruit. What needs your consistent attention now?"
    ];
    
    return manifestationTemplates[Math.floor(Math.random() * manifestationTemplates.length)];
  }

  private generatePracticalGuidance(input: string, context: any): string {
    const practicalTemplates = [
      "Let's break this down into manageable, actionable steps. What's the next practical thing you can do to move forward?",
      "Your earth wisdom knows the value of simple, consistent action. What small step would create the most positive momentum?",
      "I sense you need concrete strategies more than abstract ideas right now. What practical approach feels most realistic?",
      "Like a master craftsperson, you can build something lasting with patience and skill. What tools do you already have available?"
    ];
    
    return practicalTemplates[Math.floor(Math.random() * practicalTemplates.length)];
  }

  private generateBalancedEarthGuidance(input: string, context: any): string {
    const balancedTemplates = [
      "Your connection to earth energy brings both stability and the power to create lasting change. How can you honor both?",
      "I see the balance between your practical wisdom and your deeper vision. Both serve your highest good.",
      "Like rich soil supporting growth, your grounded nature is the foundation for others' flourishing too.",
      "Your capacity for steady, nurturing progress is a gift to yourself and your community."
    ];
    
    return balancedTemplates[Math.floor(Math.random() * balancedTemplates.length)];
  }

  private extractEarthInsights(input: string, guidance: string, earthAnalysis: any): string[] {
    const insights: string[] = [];
    
    if (earthAnalysis.chaosPresent) {
      insights.push('Grounding and stability needed - earth energy supports centering');
    }
    
    if (earthAnalysis.manifestationPotential > 0.7) {
      insights.push('High manifestation potential - earth energy supports concrete creation');
    }
    
    if (earthAnalysis.practicalityScore > 0.6) {
      insights.push('Practical approach needed - step-by-step guidance optimal');
    }
    
    if (input.includes('money') || input.includes('career') || input.includes('work')) {
      insights.push('Material world focus - earth element supports tangible results');
    }
    
    return insights;
  }

  private selectEarthVoice(earthAnalysis: any): string {
    if (earthAnalysis.chaosPresent) {
      return 'earth_grounding';
    } else if (earthAnalysis.manifestationPotential > 0.8) {
      return 'earth_manifestation';
    } else if (earthAnalysis.practicalityScore > 0.7) {
      return 'earth_practical';
    } else {
      return 'earth_balanced';
    }
  }

  private synthesizeEarthWisdom(guidance: string, insights: string[]): string {
    if (insights.includes('Grounding and stability needed')) {
      return 'Your roots in the earth provide the stability from which all growth emerges.';
    }
    
    if (insights.includes('High manifestation potential')) {
      return 'The earth element supports your ability to give form to your deepest visions.';
    }
    
    if (insights.includes('Practical approach needed')) {
      return 'Wisdom without action is merely philosophy. Your earth energy bridges knowing and doing.';
    }
    
    return 'Your grounded presence and practical wisdom create the fertile conditions for lasting growth.';
  }

  private calculateKeywordPresence(text: string, keywords: string[]): number {
    const words = text.split(/\s+/);
    const matches = words.filter(word => 
      keywords.some(keyword => word.includes(keyword))
    );
    return matches.length / words.length;
  }

  private identifyEarthNeeds(practicalityScore: number, stabilityScore: number, manifestationScore: number, chaosScore: number): string[] {
    const needs: string[] = [];
    
    if (chaosScore > 0.3) needs.push('grounding');
    if (practicalityScore < 0.3) needs.push('practical_guidance');
    if (stabilityScore < 0.3) needs.push('stability_support');
    if (manifestationScore > 0.4) needs.push('manifestation_support');
    
    return needs;
  }
}