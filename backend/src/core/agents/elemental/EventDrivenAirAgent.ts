// 🌬️ EVENT-DRIVEN AIR AGENT
// Handles mental clarity, communication, and intellectual guidance

import { EventDrivenAgent, AgentIdentity, AgentRequest, AgentResponse } from '../EventDrivenAgent';
import { IAirAgent } from '@/lib/shared/interfaces/IElementalAgent';
import { logger } from '../../../utils/logger';

export class EventDrivenAirAgent extends EventDrivenAgent implements IAirAgent {
  public readonly element = "air" as const;

  constructor() {
    const identity: AgentIdentity = {
      id: 'air_agent_v2',
      name: 'AirAgent',
      element: 'air',
      archetype: 'messenger',
      version: '2.0.0',
      capabilities: [
        'mental_clarity',
        'communication_enhancement', 
        'perspective_shift',
        'intellectual_analysis',
        'idea_synthesis'
      ]
    };

    super(identity);
  }

  protected matchesAgentType(agentType: string): boolean {
    return agentType === 'air_agent' || 
           agentType === 'AirAgent' || 
           agentType.toLowerCase().includes('air');
  }

  protected async processRequest(request: AgentRequest): Promise<AgentResponse> {
    const { requestId, input, context, userId } = request;
    
    logger.info(`[AirAgent] Processing mental/communication request: ${input.substring(0, 50)}...`);

    // Analyze air energy needs
    const airAnalysis = this.analyzeAirEnergy(input, context);
    
    // Generate air-based guidance
    const guidance = await this.generateAirGuidance(input, airAnalysis, context);
    
    // Extract insights
    const insights = this.extractAirInsights(input, guidance, airAnalysis);
    
    // Determine voice characteristics
    const voice = this.selectAirVoice(airAnalysis);
    
    // Generate wisdom synthesis
    const wisdom = this.synthesizeAirWisdom(guidance, insights);

    return this.createResponse(requestId, guidance, airAnalysis.confidence, {
      voice,
      insights,
      wisdom,
      metadata: {
        ...this.createResponse(requestId, guidance).metadata,
        mentalClarity: airAnalysis.mentalClarity,
        communicationNeed: airAnalysis.communicationNeed,
        perspectiveShift: airAnalysis.perspectiveShift,
        intellectualEngagement: airAnalysis.intellectualEngagement
      }
    });
  }

  // Implementation of IAirAgent interface
  public async process(query: any): Promise<any> {
    const requestId = `air_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const request: AgentRequest = {
      requestId,
      input: query.input || query,
      context: query.context || {},
      userId: query.userId || 'unknown'
    };

    return await this.processRequest(request);
  }

  public async processIntellectualQuery(input: string, context?: any): Promise<any> {
    const intellectualContext = {
      ...context,
      focusArea: 'intellectual',
      energyType: 'expansive'
    };

    return await this.process({ input, context: intellectualContext });
  }

  public async getClarityGuidance(context: any): Promise<string> {
    const clarityRequest = {
      input: 'I need mental clarity and fresh perspective on my situation',
      context: { ...context, guidanceType: 'clarity' }
    };

    const response = await this.process(clarityRequest);
    return response.response || response.guidance || 'Let the winds of insight clear the fog from your mind.';
  }

  public async getGuidance(input: string, context?: any): Promise<string> {
    const response = await this.process({ input, context });
    return response.response || response.guidance || 'Rise above the details to see the broader patterns.';
  }

  // Air-specific analysis methods
  private analyzeAirEnergy(input: string, context: any): any {
    const lowerInput = input.toLowerCase();
    
    // Mental clarity indicators
    const clarityKeywords = ['think', 'understand', 'clear', 'confused', 'perspective', 'see'];
    const clarityScore = this.calculateKeywordPresence(lowerInput, clarityKeywords);
    
    // Communication indicators
    const communicationKeywords = ['say', 'tell', 'communicate', 'express', 'share', 'speak'];
    const communicationScore = this.calculateKeywordPresence(lowerInput, communicationKeywords);
    
    // Analysis indicators  
    const analysisKeywords = ['analyze', 'reason', 'logic', 'figure out', 'understand', 'why'];
    const analysisScore = this.calculateKeywordPresence(lowerInput, analysisKeywords);
    
    // Mental fog indicators (air needed)
    const fogKeywords = ['confused', 'overwhelmed', 'stuck', 'unclear', 'scattered', 'lost'];
    const fogScore = this.calculateKeywordPresence(lowerInput, fogKeywords);

    const mentalClarity = Math.max(clarityScore, analysisScore) - (fogScore * 0.5);
    const communicationNeed = communicationScore + (fogScore * 0.3);
    const perspectiveShift = fogScore > 0.3 || clarityScore < 0.3;
    const intellectualEngagement = analysisScore + (clarityScore * 0.6);
    
    return {
      mentalClarity: Math.max(0.0, Math.min(1.0, mentalClarity + 0.5)),
      communicationNeed: Math.min(1.0, communicationNeed),
      perspectiveShift,
      intellectualEngagement: Math.min(1.0, intellectualEngagement),
      fogPresent: fogScore > 0.3,
      confidence: Math.min(1.0, (clarityScore + analysisScore + communicationScore) / 3),
      needs: this.identifyAirNeeds(clarityScore, communicationScore, analysisScore, fogScore)
    };
  }

  private async generateAirGuidance(input: string, airAnalysis: any, context: any): Promise<string> {
    const { mentalClarity, communicationNeed, perspectiveShift, intellectualEngagement } = airAnalysis;

    // Mental fog present, needs clarity
    if (airAnalysis.fogPresent || perspectiveShift) {
      return this.generateClarityGuidance(input, context);
    }
    
    // High communication need
    if (communicationNeed > 0.6) {
      return this.generateCommunicationGuidance(input, context);
    }
    
    // High intellectual engagement
    if (intellectualEngagement > 0.6) {
      return this.generateAnalyticalGuidance(input, context);
    }
    
    // Default air guidance
    return this.generateBalancedAirGuidance(input, context);
  }

  private generateClarityGuidance(input: string, context: any): string {
    const clarityTemplates = [
      "Step back and see the bigger picture. Sometimes clarity comes when we rise above the details to observe the patterns.",
      "Your mind is like the sky - vast and clear beneath the passing clouds of confusion. What truth remains when the noise settles?",
      "The air element invites you to detach from emotional investment and see with fresh eyes. What perspective have you not considered?",
      "Like wind clearing away cobwebs, new understanding is ready to sweep through your awareness."
    ];
    
    return clarityTemplates[Math.floor(Math.random() * clarityTemplates.length)];
  }

  private generateCommunicationGuidance(input: string, context: any): string {
    const communicationTemplates = [
      "Your words have the power to create bridges of understanding. How can you express your truth with both clarity and compassion?",
      "The air element governs communication and connection. What conversation are you avoiding that could bring breakthrough?",
      "Like a gentle breeze carrying seeds to new ground, your authentic expression can plant positive change.",
      "I sense important words wanting to be spoken. Trust your ability to communicate what matters most."
    ];
    
    return communicationTemplates[Math.floor(Math.random() * communicationTemplates.length)];
  }

  private generateAnalyticalGuidance(input: string, context: any): string {
    const analyticalTemplates = [
      "Your intellectual gifts are calling to be used. What patterns or connections are becoming visible to you now?",
      "Like wind revealing the landscape by moving through it, your analysis can uncover hidden structures and relationships.",
      "The air element supports both rational thinking and intuitive leaps. Where might logic and inspiration meet in this situation?",
      "Your mental agility is a tool for understanding complexity. What would happen if you synthesized multiple viewpoints?"
    ];
    
    return analyticalTemplates[Math.floor(Math.random() * analyticalTemplates.length)];
  }

  private generateBalancedAirGuidance(input: string, context: any): string {
    const balancedTemplates = [
      "Your capacity for both logical analysis and creative thinking serves you well. How can you engage both modes?",
      "Like air filling lungs with life-giving breath, new ideas and perspectives want to energize your approach.",
      "I see the interplay of mind and communication in your situation. Both offer pathways forward.",
      "Your intellectual clarity and gift for connection create possibilities for understanding and breakthrough."
    ];
    
    return balancedTemplates[Math.floor(Math.random() * balancedTemplates.length)];
  }

  private extractAirInsights(input: string, guidance: string, airAnalysis: any): string[] {
    const insights: string[] = [];
    
    if (airAnalysis.fogPresent) {
      insights.push('Mental clarity needed - air energy supports perspective shift');
    }
    
    if (airAnalysis.communicationNeed > 0.7) {
      insights.push('Communication breakthrough opportunity - air element supports expression');
    }
    
    if (airAnalysis.intellectualEngagement > 0.6) {
      insights.push('Intellectual analysis strength - air energy supports synthesis');
    }
    
    if (input.includes('relationship') || input.includes('conversation')) {
      insights.push('Communication focus - air element supports connection through understanding');
    }
    
    return insights;
  }

  private selectAirVoice(airAnalysis: any): string {
    if (airAnalysis.fogPresent) {
      return 'air_clarity';
    } else if (airAnalysis.communicationNeed > 0.8) {
      return 'air_communicative';
    } else if (airAnalysis.intellectualEngagement > 0.7) {
      return 'air_analytical';
    } else {
      return 'air_balanced';
    }
  }

  private synthesizeAirWisdom(guidance: string, insights: string[]): string {
    if (insights.includes('Mental clarity needed')) {
      return 'Like the clearing sky after storms, your mind holds the capacity for crystal-clear perception.';
    }
    
    if (insights.includes('Communication breakthrough opportunity')) {
      return 'Your words are bridges between minds and hearts. Use this gift to create understanding.';
    }
    
    if (insights.includes('Intellectual analysis strength')) {
      return 'Your mind is a powerful instrument for understanding complexity and revealing hidden connections.';
    }
    
    return 'Your gifts of clarity, communication, and intellectual insight serve both your growth and others\' understanding.';
  }

  private calculateKeywordPresence(text: string, keywords: string[]): number {
    const words = text.split(/\s+/);
    const matches = words.filter(word => 
      keywords.some(keyword => word.includes(keyword))
    );
    return matches.length / words.length;
  }

  private identifyAirNeeds(clarityScore: number, communicationScore: number, analysisScore: number, fogScore: number): string[] {
    const needs: string[] = [];
    
    if (fogScore > 0.3) needs.push('clarity_support');
    if (communicationScore > 0.4) needs.push('communication_guidance');
    if (analysisScore < 0.3) needs.push('analytical_support');
    if (clarityScore < 0.3) needs.push('perspective_shift');
    
    return needs;
  }
}