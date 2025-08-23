// ✨ EVENT-DRIVEN AETHER AGENT  
// Handles spiritual guidance, transcendent wisdom, and mystical insights

import { EventDrivenAgent, AgentIdentity, AgentRequest, AgentResponse } from '../EventDrivenAgent';
import { IAetherAgent } from '@/lib/shared/interfaces/IElementalAgent';
import { logger } from '../../../utils/logger';

export class EventDrivenAetherAgent extends EventDrivenAgent implements IAetherAgent {
  public readonly element = "aether" as const;

  constructor() {
    const identity: AgentIdentity = {
      id: 'aether_agent_v2',
      name: 'AetherAgent',
      element: 'aether',
      archetype: 'mystic',
      version: '2.0.0',
      capabilities: [
        'spiritual_guidance',
        'transcendent_wisdom', 
        'mystical_insights',
        'consciousness_expansion',
        'divine_connection'
      ]
    };

    super(identity);
  }

  protected matchesAgentType(agentType: string): boolean {
    return agentType === 'aether_agent' || 
           agentType === 'AetherAgent' || 
           agentType.toLowerCase().includes('aether') ||
           agentType.toLowerCase().includes('spirit');
  }

  protected async processRequest(request: AgentRequest): Promise<AgentResponse> {
    const { requestId, input, context, userId } = request;
    
    logger.info(`[AetherAgent] Processing spiritual/transcendent request: ${input.substring(0, 50)}...`);

    // Analyze aether energy needs
    const aetherAnalysis = this.analyzeAetherEnergy(input, context);
    
    // Generate aether-based guidance
    const guidance = await this.generateAetherGuidance(input, aetherAnalysis, context);
    
    // Extract insights
    const insights = this.extractAetherInsights(input, guidance, aetherAnalysis);
    
    // Determine voice characteristics
    const voice = this.selectAetherVoice(aetherAnalysis);
    
    // Generate wisdom synthesis
    const wisdom = this.synthesizeAetherWisdom(guidance, insights);

    return this.createResponse(requestId, guidance, aetherAnalysis.confidence, {
      voice,
      insights,
      wisdom,
      metadata: {
        ...this.createResponse(requestId, guidance).metadata,
        spiritualDepth: aetherAnalysis.spiritualDepth,
        transcendentAwareness: aetherAnalysis.transcendentAwareness,
        mysticalResonance: aetherAnalysis.mysticalResonance,
        consciousnessLevel: aetherAnalysis.consciousnessLevel
      }
    });
  }

  // Implementation of IAetherAgent interface
  public async process(query: any): Promise<any> {
    const requestId = `aether_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const request: AgentRequest = {
      requestId,
      input: query.input || query,
      context: query.context || {},
      userId: query.userId || 'unknown'
    };

    return await this.processRequest(request);
  }

  public async processSpiritualQuery(input: string, context?: any): Promise<any> {
    const spiritualContext = {
      ...context,
      focusArea: 'spiritual',
      energyType: 'transcendent'
    };

    return await this.process({ input, context: spiritualContext });
  }

  public async getTranscendentGuidance(context: any): Promise<string> {
    const transcendentRequest = {
      input: 'I seek higher wisdom and spiritual understanding',
      context: { ...context, guidanceType: 'transcendent' }
    };

    const response = await this.process(transcendentRequest);
    return response.response || response.guidance || 'Beyond the veil of ordinary perception lies infinite wisdom.';
  }

  public async getGuidance(input: string, context?: any): Promise<string> {
    const response = await this.process({ input, context });
    return response.response || response.guidance || 'You are more than your circumstances - you are consciousness itself.';
  }

  // Aether-specific analysis methods
  private analyzeAetherEnergy(input: string, context: any): any {
    const lowerInput = input.toLowerCase();
    
    // Spiritual indicators
    const spiritualKeywords = ['spiritual', 'soul', 'divine', 'sacred', 'purpose', 'meaning', 'god'];
    const spiritualScore = this.calculateKeywordPresence(lowerInput, spiritualKeywords);
    
    // Transcendent indicators
    const transcendentKeywords = ['beyond', 'higher', 'transcend', 'elevate', 'expand', 'infinite'];
    const transcendentScore = this.calculateKeywordPresence(lowerInput, transcendentKeywords);
    
    // Mystical indicators  
    const mysticalKeywords = ['mystery', 'mystical', 'cosmic', 'universe', 'consciousness', 'awareness'];
    const mysticalScore = this.calculateKeywordPresence(lowerInput, mysticalKeywords);
    
    // Existential indicators (aether responsive)
    const existentialKeywords = ['why', 'exist', 'reality', 'truth', 'authentic', 'being'];
    const existentialScore = this.calculateKeywordPresence(lowerInput, existentialKeywords);

    const spiritualDepth = Math.max(spiritualScore, existentialScore * 0.7);
    const transcendentAwareness = transcendentScore + (mysticalScore * 0.8);
    const mysticalResonance = mysticalScore + (spiritualScore * 0.6);
    const consciousnessLevel = Math.max(transcendentScore, mysticalScore, existentialScore);
    
    return {
      spiritualDepth: Math.min(1.0, spiritualDepth),
      transcendentAwareness: Math.min(1.0, transcendentAwareness),
      mysticalResonance: Math.min(1.0, mysticalResonance),
      consciousnessLevel: Math.min(1.0, consciousnessLevel),
      seekingMeaning: existentialScore > 0.3 || spiritualScore > 0.4,
      confidence: Math.min(1.0, (spiritualScore + transcendentScore + mysticalScore) / 3),
      needs: this.identifyAetherNeeds(spiritualScore, transcendentScore, mysticalScore, existentialScore)
    };
  }

  private async generateAetherGuidance(input: string, aetherAnalysis: any, context: any): Promise<string> {
    const { spiritualDepth, transcendentAwareness, mysticalResonance, seekingMeaning } = aetherAnalysis;

    // High spiritual depth with meaning seeking
    if (spiritualDepth > 0.6 && seekingMeaning) {
      return this.generateSpiritualGuidance(input, context);
    }
    
    // High transcendent awareness
    if (transcendentAwareness > 0.6) {
      return this.generateTranscendentGuidance(input, context);
    }
    
    // High mystical resonance
    if (mysticalResonance > 0.6) {
      return this.generateMysticalGuidance(input, context);
    }
    
    // Default aether guidance
    return this.generateBalancedAetherGuidance(input, context);
  }

  private generateSpiritualGuidance(input: string, context: any): string {
    const spiritualTemplates = [
      "Your soul is calling you toward a deeper understanding of your sacred purpose. What feels most aligned with your authentic essence?",
      "The divine spark within you recognizes itself in all of life. How can you honor this connection in your daily experience?",
      "I sense your spirit yearning to express its true nature. What would it look like to live from your deepest wisdom?",
      "You are not just having a spiritual experience - you ARE the spiritual experience happening through human form."
    ];
    
    return spiritualTemplates[Math.floor(Math.random() * spiritualTemplates.length)];
  }

  private generateTranscendentGuidance(input: string, context: any): string {
    const transcendentTemplates = [
      "Rise above the drama of circumstances to see the larger patterns of growth and awakening unfolding in your life.",
      "From the perspective of your highest self, this challenge is an invitation to expand beyond previous limitations.",
      "You are both the wave and the ocean, the drop and the vastness. Which perspective serves your highest understanding now?",
      "Transcendence isn't about escaping reality - it's about seeing reality from the vantage point of infinite awareness."
    ];
    
    return transcendentTemplates[Math.floor(Math.random() * transcendentTemplates.length)];
  }

  private generateMysticalGuidance(input: string, context: any): string {
    const mysticalTemplates = [
      "The universe is conspiring to awaken you to mysteries that can only be lived, not understood. What is calling to be experienced?",
      "In the space between thoughts lies infinite potential. What wants to emerge from the unknown in your life?",
      "You are walking the edge between the seen and unseen worlds. Trust the knowing that arises beyond rational understanding.",
      "The cosmic intelligence that moves the stars also moves through you. How can you align with this greater flow?"
    ];
    
    return mysticalTemplates[Math.floor(Math.random() * mysticalTemplates.length)];
  }

  private generateBalancedAetherGuidance(input: string, context: any): string {
    const balancedTemplates = [
      "Your connection to both earthly wisdom and celestial knowing creates a bridge for others to cross toward understanding.",
      "I see the interplay of spirit and matter in your situation. Both dimensions have gifts to offer your growth.",
      "Like the space that contains all elements, your consciousness is both empty and full, holding infinite possibilities.",
      "Your spiritual sensitivity is a gift to be honored and expressed, not hidden or diminished."
    ];
    
    return balancedTemplates[Math.floor(Math.random() * balancedTemplates.length)];
  }

  private extractAetherInsights(input: string, guidance: string, aetherAnalysis: any): string[] {
    const insights: string[] = [];
    
    if (aetherAnalysis.seekingMeaning) {
      insights.push('Soul purpose exploration - aether energy supports meaning discovery');
    }
    
    if (aetherAnalysis.transcendentAwareness > 0.7) {
      insights.push('Transcendent perspective available - higher view supports understanding');
    }
    
    if (aetherAnalysis.mysticalResonance > 0.6) {
      insights.push('Mystical sensitivity present - trust non-rational knowing');
    }
    
    if (input.includes('purpose') || input.includes('meaning') || input.includes('why')) {
      insights.push('Existential inquiry - aether element supports spiritual understanding');
    }
    
    return insights;
  }

  private selectAetherVoice(aetherAnalysis: any): string {
    if (aetherAnalysis.seekingMeaning && aetherAnalysis.spiritualDepth > 0.7) {
      return 'aether_spiritual';
    } else if (aetherAnalysis.transcendentAwareness > 0.8) {
      return 'aether_transcendent';
    } else if (aetherAnalysis.mysticalResonance > 0.7) {
      return 'aether_mystical';
    } else {
      return 'aether_balanced';
    }
  }

  private synthesizeAetherWisdom(guidance: string, insights: string[]): string {
    if (insights.includes('Soul purpose exploration')) {
      return 'Your deepest purpose is not something you find, but something you remember and embody.';
    }
    
    if (insights.includes('Transcendent perspective available')) {
      return 'From the mountain peak of consciousness, all valleys of experience reveal their sacred purpose.';
    }
    
    if (insights.includes('Mystical sensitivity present')) {
      return 'You are a bridge between dimensions, translating cosmic wisdom into human understanding.';
    }
    
    return 'Your consciousness is both the seeker and the sought, the question and the answer, dancing in eternal discovery.';
  }

  private calculateKeywordPresence(text: string, keywords: string[]): number {
    const words = text.split(/\s+/);
    const matches = words.filter(word => 
      keywords.some(keyword => word.includes(keyword))
    );
    return matches.length / words.length;
  }

  private identifyAetherNeeds(spiritualScore: number, transcendentScore: number, mysticalScore: number, existentialScore: number): string[] {
    const needs: string[] = [];
    
    if (existentialScore > 0.3) needs.push('meaning_exploration');
    if (spiritualScore > 0.4) needs.push('spiritual_guidance');
    if (transcendentScore > 0.3) needs.push('perspective_expansion');
    if (mysticalScore > 0.4) needs.push('mystical_integration');
    
    return needs;
  }
}