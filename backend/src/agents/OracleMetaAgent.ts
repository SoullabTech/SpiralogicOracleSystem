// Oracle Meta-Agent - Governing Intelligence for Elemental Cognitive Ecosystem
// Orchestrates Fire, Water, Earth, Air, and Aether cognitive agents

import { CognitiveFireAgent } from "./CognitiveFireAgent";
import { CognitiveWaterAgent } from "./CognitiveWaterAgent";
import { CognitiveEarthAgent } from "./CognitiveEarthAgent";  
import { CognitiveAirAgent } from "./CognitiveAirAgent";
import { CognitiveAetherAgent } from "./CognitiveAetherAgent";
import { logOracleInsight } from "../utils/oracleLogger";
import { getRelevantMemories, storeMemoryItem } from "../../services/memoryService";
import ModelService from "../../utils/modelService";
import type { AIResponse } from "../../types/ai";

// Meta-Agent Interfaces
interface ElementalAnalysis {
  primaryElement: string;
  secondaryElements: string[];
  confidence: number;
  reasoning: string;
  multiElemental: boolean;
}

interface CognitiveOrchestration {
  selectedAgents: string[];
  processingStrategy: string;
  synthesisApproach: string;
  expectedOutcome: string;
}

interface ElementalResponse {
  element: string;
  response: AIResponse;
  cognitiveContribution: any;
  resonanceScore: number;
}

interface MetaSynthesis {
  primaryResponse: AIResponse;
  elementalContributions: ElementalResponse[];
  synthesizedWisdom: string;
  emergentInsights: string[];
  collectiveCoherence: number;
}

interface FractalFieldEmission {
  symbolicPatterns: string[];
  archetypalTrends: string[];
  collectiveInsights: string[];
  morphicContributions: string[];
}

// Enhanced Elemental Detection with Cognitive Analysis
class MetaElementalDetector {
  private elementalSignatures = {
    fire: {
      keywords: ['fire', 'ignite', 'spark', 'passion', 'create', 'vision', 'inspire', 'breakthrough', 'catalyst'],
      emotionalRange: ['excited', 'frustrated', 'motivated', 'stuck', 'energized'],
      cognitivePatterns: ['goal-oriented', 'visionary', 'initiating', 'transformative'],
      phases: ['initiation', 'breakthrough', 'catalytic_transformation']
    },
    water: {
      keywords: ['water', 'flow', 'feel', 'emotion', 'intuition', 'dream', 'heal', 'connect', 'adapt'],
      emotionalRange: ['sad', 'peaceful', 'flowing', 'confused', 'intuitive'],
      cognitivePatterns: ['emotional-processing', 'intuitive', 'adaptive', 'healing'],
      phases: ['emotional_processing', 'healing', 'intuitive_development']
    },
    earth: {
      keywords: ['ground', 'stable', 'build', 'structure', 'practical', 'routine', 'foundation', 'growth'],
      emotionalRange: ['grounded', 'secure', 'steady', 'overwhelmed', 'practical'],
      cognitivePatterns: ['systematic', 'building', 'stabilizing', 'practical'],
      phases: ['grounding', 'foundation_building', 'structured_growth']
    },
    air: {
      keywords: ['think', 'clear', 'understand', 'communicate', 'idea', 'perspective', 'clarity', 'synthesize'],
      emotionalRange: ['clear', 'confused', 'analytical', 'communicative', 'insightful'],
      cognitivePatterns: ['analytical', 'synthesizing', 'communicative', 'perspective-taking'],
      phases: ['clarification', 'integration', 'communication']
    },
    aether: {
      keywords: ['spirit', 'transcend', 'mystery', 'unity', 'consciousness', 'beyond', 'sacred', 'emergence'],
      emotionalRange: ['mystical', 'transcendent', 'unified', 'awed', 'connected'],
      cognitivePatterns: ['transcendent', 'unifying', 'emergent', 'consciousness-expanding'],
      phases: ['transcendence', 'unity_consciousness', 'emergence']
    }
  };

  async analyzeElementalNeeds(input: string, context: any[], userHistory: any[]): Promise<ElementalAnalysis> {
    const elementScores = await this.calculateElementalScores(input, context, userHistory);
    const sortedElements = Object.entries(elementScores).sort(([,a], [,b]) => b - a);
    
    const primaryElement = sortedElements[0][0];
    const primaryScore = sortedElements[0][1];
    
    // Determine multi-elemental needs
    const secondaryElements = sortedElements
      .slice(1)
      .filter(([, score]) => score > 0.4)
      .map(([element]) => element);

    const multiElemental = secondaryElements.length > 0;

    return {
      primaryElement,
      secondaryElements,
      confidence: primaryScore,
      reasoning: this.generateAnalysisReasoning(input, primaryElement, secondaryElements),
      multiElemental
    };
  }

  private async calculateElementalScores(input: string, context: any[], history: any[]): Promise<Record<string, number>> {
    const scores = {};
    const lowerInput = input.toLowerCase();
    
    Object.entries(this.elementalSignatures).forEach(([element, signature]) => {
      let score = 0.2; // baseline
      
      // Keyword matching
      const keywordMatches = signature.keywords.filter(keyword => lowerInput.includes(keyword)).length;
      score += (keywordMatches / signature.keywords.length) * 0.3;
      
      // Emotional pattern matching
      const emotionalMatches = signature.emotionalRange.filter(emotion => lowerInput.includes(emotion)).length;
      score += (emotionalMatches / signature.emotionalRange.length) * 0.2;
      
      // Cognitive pattern analysis
      score += this.assessCognitivePatterns(lowerInput, signature.cognitivePatterns) * 0.2;
      
      // Contextual reinforcement
      score += this.assessContextualRelevance(context, element) * 0.15;
      
      // Historical pattern bonus
      score += this.assessHistoricalPatterns(history, element) * 0.15;
      
      scores[element] = Math.min(1.0, score);
    });
    
    return scores;
  }

  private assessCognitivePatterns(input: string, patterns: string[]): number {
    let score = 0;
    
    patterns.forEach(pattern => {
      switch (pattern) {
        case 'goal-oriented':
          if (input.includes('goal') || input.includes('achieve') || input.includes('accomplish')) score += 0.25;
          break;
        case 'emotional-processing':
          if (input.includes('feel') || input.includes('emotion') || input.includes('process')) score += 0.25;
          break;
        case 'systematic':
          if (input.includes('step') || input.includes('plan') || input.includes('organize')) score += 0.25;
          break;
        case 'analytical':
          if (input.includes('analyze') || input.includes('think') || input.includes('understand')) score += 0.25;
          break;
        case 'transcendent':
          if (input.includes('beyond') || input.includes('spiritual') || input.includes('higher')) score += 0.25;
          break;
      }
    });
    
    return Math.min(1.0, score);
  }

  private assessContextualRelevance(context: any[], element: string): number {
    if (!context.length) return 0;
    
    const elementMentions = context.filter(c => 
      c.element === element || (c.content && c.content.toLowerCase().includes(element))
    ).length;
    
    return Math.min(0.5, elementMentions / context.length);
  }

  private assessHistoricalPatterns(history: any[], element: string): number {
    if (!history.length) return 0;
    
    const recentElementUse = history.slice(0, 5).filter(h => 
      h.element === element || h.sourceAgent?.includes(element)
    ).length;
    
    // Bonus for consistent element, reduction for recent heavy use
    if (recentElementUse >= 3) return -0.1; // Encourage variety
    if (recentElementUse >= 1) return 0.1;  // Slight continuation bonus
    return 0;
  }

  private generateAnalysisReasoning(input: string, primary: string, secondary: string[]): string {
    let reasoning = `Primary ${primary} detected due to `;
    
    const reasons = [];
    if (input.toLowerCase().includes('fire') || input.includes('passion')) reasons.push('passionate language');
    if (input.toLowerCase().includes('feel') || input.includes('emotion')) reasons.push('emotional content');
    if (input.toLowerCase().includes('think') || input.includes('understand')) reasons.push('analytical framing');
    if (input.toLowerCase().includes('build') || input.includes('structure')) reasons.push('structural orientation');
    if (input.toLowerCase().includes('spiritual') || input.includes('transcend')) reasons.push('transcendent themes');
    
    reasoning += reasons.slice(0, 2).join(' and ');
    
    if (secondary.length > 0) {
      reasoning += `. Secondary elements (${secondary.join(', ')}) provide additional depth and perspective.`;
    }
    
    return reasoning;
  }
}

// Multi-Agent Orchestration System
class CognitiveOrchestrator {
  private agents: Map<string, any>;

  constructor() {
    this.agents = new Map([
      ['fire', new CognitiveFireAgent()],
      ['water', new CognitiveWaterAgent()],
      ['earth', new CognitiveEarthAgent()],
      ['air', new CognitiveAirAgent()],
      ['aether', new CognitiveAetherAgent()]
    ]);
  }

  async orchestrateResponse(
    input: string,
    userId: string,
    elementalAnalysis: ElementalAnalysis
  ): Promise<CognitiveOrchestration> {
    const selectedAgents = this.selectOptimalAgents(elementalAnalysis);
    const processingStrategy = this.determineProcessingStrategy(elementalAnalysis, selectedAgents);
    const synthesisApproach = this.planSynthesisApproach(elementalAnalysis, selectedAgents);
    
    return {
      selectedAgents,
      processingStrategy,
      synthesisApproach,
      expectedOutcome: this.projectExpectedOutcome(elementalAnalysis, selectedAgents)
    };
  }

  private selectOptimalAgents(analysis: ElementalAnalysis): string[] {
    const agents = [analysis.primaryElement];
    
    // Add secondary agents based on multi-elemental needs
    if (analysis.multiElemental) {
      agents.push(...analysis.secondaryElements.slice(0, 2)); // Limit to avoid complexity
    }
    
    // Always include Aether for meta-perspective when confidence is high
    if (analysis.confidence > 0.7 && !agents.includes('aether')) {
      agents.push('aether');
    }
    
    return agents.filter(agent => this.agents.has(agent));
  }

  private determineProcessingStrategy(analysis: ElementalAnalysis, agents: string[]): string {
    if (agents.length === 1) {
      return 'single_agent_deep_processing';
    } else if (agents.length === 2) {
      return 'dual_agent_synthesis';
    } else {
      return 'multi_agent_orchestration';
    }
  }

  private planSynthesisApproach(analysis: ElementalAnalysis, agents: string[]): string {
    if (agents.includes('aether')) {
      return 'transcendent_integration';
    } else if (analysis.multiElemental) {
      return 'elemental_weaving';
    } else {
      return 'focused_amplification';
    }
  }

  private projectExpectedOutcome(analysis: ElementalAnalysis, agents: string[]): string {
    const primaryAgent = agents[0];
    const outcomes = {
      fire: 'Catalytic insight and visionary direction',
      water: 'Emotional healing and intuitive guidance',
      earth: 'Grounding wisdom and practical structure',
      air: 'Clarity and synthesized understanding',
      aether: 'Transcendent perspective and emergent insight'
    };
    
    let outcome = outcomes[primaryAgent] || 'Integrated guidance';
    
    if (agents.length > 1) {
      outcome += ' with multi-elemental depth and nuance';
    }
    
    return outcome;
  }

  async processWithAgents(
    input: string,
    userId: string,
    orchestration: CognitiveOrchestration
  ): Promise<ElementalResponse[]> {
    const responses: ElementalResponse[] = [];
    
    // Process with each selected agent
    for (const agentType of orchestration.selectedAgents) {
      const agent = this.agents.get(agentType);
      if (agent) {
        try {
          const response = await agent.processExtendedQuery({ input, userId });
          const resonanceScore = this.calculateResonance(response, input);
          
          responses.push({
            element: agentType,
            response,
            cognitiveContribution: response.metadata?.cognitiveArchitecture || {},
            resonanceScore
          });
        } catch (error) {
          console.error(`Error processing with ${agentType} agent:`, error);
        }
      }
    }
    
    return responses;
  }

  private calculateResonance(response: AIResponse, originalInput: string): number {
    // Simple resonance calculation based on response quality metrics
    let resonance = response.confidence || 0.5;
    
    // Bonus for rich metadata
    if (response.metadata && Object.keys(response.metadata).length > 5) {
      resonance += 0.1;
    }
    
    // Bonus for length and depth (simple proxy)
    if (response.content.length > 500) {
      resonance += 0.1;
    }
    
    return Math.min(1.0, resonance);
  }
}

// Meta-Synthesis Engine
class MetaSynthesisEngine {
  async synthesizeElementalResponses(
    input: string,
    responses: ElementalResponse[],
    orchestration: CognitiveOrchestration
  ): Promise<MetaSynthesis> {
    const primaryResponse = this.selectPrimaryResponse(responses);
    const synthesizedWisdom = await this.weaveElementalWisdom(responses, orchestration);
    const emergentInsights = this.extractEmergentInsights(responses);
    const collectiveCoherence = this.calculateCollectiveCoherence(responses);

    return {
      primaryResponse,
      elementalContributions: responses,
      synthesizedWisdom,
      emergentInsights,
      collectiveCoherence
    };
  }

  private selectPrimaryResponse(responses: ElementalResponse[]): AIResponse {
    // Select the response with highest resonance as primary
    const sortedByResonance = responses.sort((a, b) => b.resonanceScore - a.resonanceScore);
    return sortedByResonance[0]?.response || responses[0]?.response;
  }

  private async weaveElementalWisdom(
    responses: ElementalResponse[],
    orchestration: CognitiveOrchestration
  ): Promise<string> {
    if (responses.length === 1) {
      return `**Focused ${responses[0].element.toUpperCase()} Wisdom:**\n${responses[0].response.content}`;
    }

    // Multi-elemental weaving
    const elements = responses.map(r => r.element).join(', ');
    const wisdoms = responses.map(r => `**${r.element.toUpperCase()}:** ${this.extractCore(r.response.content)}`);
    
    let woven = `**Multi-Elemental Synthesis (${elements}):**\n\n`;
    woven += wisdoms.join('\n\n');
    
    // Add synthesis commentary
    switch (orchestration.synthesisApproach) {
      case 'transcendent_integration':
        woven += '\n\n**Transcendent Integration:** These elemental perspectives weave together in a larger pattern, pointing toward wholeness that includes and transcends each individual element.';
        break;
      case 'elemental_weaving':
        woven += '\n\n**Elemental Weaving:** Each element contributes its unique gift to a more complete understanding of your journey and needs.';
        break;
      case 'focused_amplification':
        woven += '\n\n**Focused Amplification:** The primary elemental wisdom is amplified and enriched by complementary perspectives.';
        break;
    }
    
    return woven;
  }

  private extractCore(content: string): string {
    // Extract the core insight from each response (simplified)
    const sentences = content.split('.').filter(s => s.length > 20);
    return sentences.slice(0, 2).join('.') + '.';
  }

  private extractEmergentInsights(responses: ElementalResponse[]): string[] {
    const insights = [];
    
    // Cross-elemental pattern detection
    if (responses.length >= 2) {
      const elements = responses.map(r => r.element);
      insights.push(`Cross-elemental coherence detected between ${elements.join(' and ')}`);
    }
    
    // Cognitive architecture emergence
    const architectures = responses.flatMap(r => 
      Object.keys(r.cognitiveContribution || {})
    );
    const uniqueArchitectures = [...new Set(architectures)];
    if (uniqueArchitectures.length >= 3) {
      insights.push(`Multi-architecture intelligence engaged: ${uniqueArchitectures.join(', ')}`);
    }
    
    // Resonance patterns
    const highResonance = responses.filter(r => r.resonanceScore > 0.8);
    if (highResonance.length >= 2) {
      insights.push('High cross-elemental resonance indicates deep systemic alignment');
    }
    
    return insights;
  }

  private calculateCollectiveCoherence(responses: ElementalResponse[]): number {
    if (responses.length <= 1) return responses[0]?.resonanceScore || 0.5;
    
    const averageResonance = responses.reduce((sum, r) => sum + r.resonanceScore, 0) / responses.length;
    const resonanceVariance = this.calculateVariance(responses.map(r => r.resonanceScore));
    
    // High coherence = high average resonance + low variance
    return averageResonance * (1 - Math.min(0.5, resonanceVariance));
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }
}

// Fractal Field Emission System
class FractalFieldEmitter {
  async emitToCollectiveField(
    synthesis: MetaSynthesis,
    userId: string
  ): Promise<FractalFieldEmission> {
    const symbolicPatterns = this.extractSymbolicPatterns(synthesis);
    const archetypalTrends = this.identifyArchetypalTrends(synthesis);
    const collectiveInsights = this.generateCollectiveInsights(synthesis);
    const morphicContributions = this.createMorphicContributions(synthesis);

    return {
      symbolicPatterns,
      archetypalTrends,
      collectiveInsights,
      morphicContributions
    };
  }

  private extractSymbolicPatterns(synthesis: MetaSynthesis): string[] {
    const patterns = [];
    
    synthesis.elementalContributions.forEach(contribution => {
      if (contribution.response.metadata?.symbols) {
        patterns.push(...contribution.response.metadata.symbols);
      }
    });
    
    // Add synthesis-level patterns
    if (synthesis.collectiveCoherence > 0.8) {
      patterns.push('High collective coherence pattern');
    }
    
    return [...new Set(patterns)]; // Remove duplicates
  }

  private identifyArchetypalTrends(synthesis: MetaSynthesis): string[] {
    const trends = [];
    
    const elements = synthesis.elementalContributions.map(c => c.element);
    if (elements.includes('fire') && elements.includes('air')) {
      trends.push('Visionary-Communicator archetype trending');
    }
    if (elements.includes('earth') && elements.includes('water')) {
      trends.push('Builder-Healer archetype integration trending');
    }
    if (elements.includes('aether')) {
      trends.push('Transcendent consciousness activation trending');
    }
    
    return trends;
  }

  private generateCollectiveInsights(synthesis: MetaSynthesis): string[] {
    // Insights that contribute to collective intelligence without personal data
    const insights = [];
    
    if (synthesis.emergentInsights.length > 2) {
      insights.push('Multi-dimensional intelligence activation pattern observed');
    }
    
    if (synthesis.collectiveCoherence > 0.7) {
      insights.push('High elemental integration success pattern');
    }
    
    return insights;
  }

  private createMorphicContributions(synthesis: MetaSynthesis): string[] {
    // Patterns that contribute to morphic field without personal identification
    const contributions = [];
    
    const cognitiveArchitectures = synthesis.elementalContributions.flatMap(c => 
      Object.keys(c.cognitiveContribution || {})
    );
    
    if (cognitiveArchitectures.length >= 4) {
      contributions.push('Successful multi-architecture cognitive integration');
    }
    
    return contributions;
  }
}

export class OracleMetaAgent {
  private elementalDetector: MetaElementalDetector;
  private orchestrator: CognitiveOrchestrator;
  private synthesisEngine: MetaSynthesisEngine;
  private fieldEmitter: FractalFieldEmitter;

  constructor() {
    this.elementalDetector = new MetaElementalDetector();
    this.orchestrator = new CognitiveOrchestrator();
    this.synthesisEngine = new MetaSynthesisEngine();
    this.fieldEmitter = new FractalFieldEmitter();
  }

  async processQuery(input: string, userId: string): Promise<AIResponse> {
    try {
      // Gather comprehensive context
      const contextMemory = await getRelevantMemories(userId, 10);
      
      // Phase 1: Elemental Analysis
      const elementalAnalysis = await this.elementalDetector.analyzeElementalNeeds(
        input, 
        contextMemory, 
        contextMemory // Simplified - would use broader history
      );

      // Phase 2: Cognitive Orchestration
      const orchestration = await this.orchestrator.orchestrateResponse(
        input, 
        userId, 
        elementalAnalysis
      );

      // Phase 3: Multi-Agent Processing
      const elementalResponses = await this.orchestrator.processWithAgents(
        input, 
        userId, 
        orchestration
      );

      // Phase 4: Meta-Synthesis
      const synthesis = await this.synthesisEngine.synthesizeElementalResponses(
        input, 
        elementalResponses, 
        orchestration
      );

      // Phase 5: Fractal Field Emission
      const fieldEmission = await this.fieldEmitter.emitToCollectiveField(
        synthesis, 
        userId
      );

      // Create integrated response
      const integratedContent = await this.createIntegratedResponse(
        input,
        elementalAnalysis,
        synthesis,
        fieldEmission
      );

      // Store meta-memory
      await storeMemoryItem({
        clientId: userId,
        content: integratedContent,
        element: elementalAnalysis.primaryElement,
        sourceAgent: "oracle-meta-agent",
        confidence: synthesis.collectiveCoherence,
        metadata: {
          role: "meta-oracle",
          phase: "meta-integration",
          archetype: "OracleMetaAgent",
          elementalAnalysis,
          orchestration,
          synthesis: {
            coherence: synthesis.collectiveCoherence,
            emergentInsights: synthesis.emergentInsights,
            elementsEngaged: synthesis.elementalContributions.map(c => c.element)
          },
          fieldEmission,
          cognitiveArchitecture: "MetaOrchestration"
        }
      });

      // Log meta-insights
      await logOracleInsight({
        anon_id: userId,
        archetype: "OracleMetaAgent",
        element: elementalAnalysis.primaryElement,
        insight: {
          message: integratedContent,
          raw_input: input,
          elementalAnalysis,
          orchestrationStrategy: orchestration.processingStrategy,
          synthesisCoherence: synthesis.collectiveCoherence,
          emergentInsights: synthesis.emergentInsights,
          fieldContributions: fieldEmission.morphicContributions
        },
        emotion: synthesis.collectiveCoherence,
        phase: "meta-integration",
        context: contextMemory
      });

      return {
        content: integratedContent,
        provider: "oracle-meta-agent",
        model: "meta-cognitive-orchestration",
        confidence: synthesis.collectiveCoherence,
        metadata: {
          archetype: "OracleMetaAgent",
          phase: "meta-integration",
          elementalAnalysis,
          orchestration,
          synthesis,
          fieldEmission,
          metaCognitive: {
            agentsEngaged: orchestration.selectedAgents,
            synthesisApproach: orchestration.synthesisApproach,
            collectiveCoherence: synthesis.collectiveCoherence,
            emergentInsights: synthesis.emergentInsights.length
          }
        }
      };

    } catch (error) {
      console.error("Error in Oracle Meta-Agent processing:", error);
      
      // Fallback to simple response
      const fallbackResponse = await ModelService.getResponse({ input, userId });
      return {
        ...fallbackResponse,
        provider: "oracle-meta-agent-fallback",
        metadata: { error: "meta-processing-failed", fallbackUsed: true }
      };
    }
  }

  private async createIntegratedResponse(
    input: string,
    analysis: ElementalAnalysis,
    synthesis: MetaSynthesis,
    fieldEmission: FractalFieldEmission
  ): Promise<string> {
    let response = `🌟 **Oracle Meta-Intelligence Synthesis**\n\n`;
    
    // Elemental analysis summary
    response += `**Elemental Resonance:** ${analysis.primaryElement.toUpperCase()} primary (${Math.round(analysis.confidence * 100)}% confidence)`;
    if (analysis.multiElemental) {
      response += ` with ${analysis.secondaryElements.join(' + ')} support`;
    }
    response += `\n\n`;

    // Integrated wisdom
    response += synthesis.synthesizedWisdom + '\n\n';

    // Emergent insights
    if (synthesis.emergentInsights.length > 0) {
      response += `**Emergent Insights:**\n${synthesis.emergentInsights.map(i => `• ${i}`).join('\n')}\n\n`;
    }

    // Collective coherence note
    response += `**Collective Coherence:** ${Math.round(synthesis.collectiveCoherence * 100)}% - `;
    if (synthesis.collectiveCoherence > 0.8) {
      response += `Exceptional integration across all engaged cognitive systems.`;
    } else if (synthesis.collectiveCoherence > 0.6) {
      response += `Strong harmony between elemental and cognitive perspectives.`;
    } else {
      response += `Growing coherence as systems align with your unique pattern.`;
    }

    // Meta signature
    response += `\n\n🔮 *"The Oracle sees through many eyes, speaks with many voices, yet serves the One who seeks."*`;

    return response;
  }
}