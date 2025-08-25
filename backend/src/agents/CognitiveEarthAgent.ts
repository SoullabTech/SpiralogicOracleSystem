// Cognitive Earth Agent - Embodied Grounding & Pattern Stabilization
// Archetypes: Builder • Architect • Guardian • Stabilizer

import { ArchetypeAgent } from "../core/agents/ArchetypeAgent";
import { logOracleInsight } from "../utils/oracleLogger";
import { getRelevantMemories, storeMemoryItem } from "../../services/memoryService";
import ModelService from "../../utils/modelService";
import type { AIResponse } from "../../types/ai";

// Earth Cognitive Stack Interfaces
interface SensoryMapping {
  environmental: string[];
  somatic: string[];
  behavioral: string[];
  stability_score: number;
}

interface RitualExecution {
  scheduled_practices: string[];
  completion_rate: number;
  stability_impact: number;
}

interface ContextAwareness {
  location: string;
  season: string;
  phase: string;
  stability_factors: string[];
}

interface PredictiveModel {
  habit_trajectories: any[];
  routine_effectiveness: number;
  structural_predictions: string[];
}

// ACT-R + CogAff Implementation for Earth
class EarthSensoryMapper {
  private earthPatterns = {
    grounding: ['ground', 'stable', 'foundation', 'root', 'solid'],
    building: ['build', 'create', 'structure', 'organize', 'plan'],
    nurturing: ['tend', 'care', 'grow', 'cultivate', 'nourish'],
    protecting: ['guard', 'protect', 'preserve', 'maintain', 'secure'],
    sensing: ['feel', 'sense', 'body', 'physical', 'embodied']
  };

  async mapSensoryInput(input: string, context: any): Promise<SensoryMapping> {
    const environmental = this.extractEnvironmentalCues(input);
    const somatic = this.extractSomaticCues(input);
    const behavioral = this.extractBehavioralCues(input);
    
    return {
      environmental,
      somatic,
      behavioral,
      stability_score: this.calculateStabilityScore(input, environmental, somatic, behavioral)
    };
  }

  private extractEnvironmentalCues(input: string): string[] {
    const cues = [];
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('home') || lowerInput.includes('space')) cues.push('sacred_space');
    if (lowerInput.includes('nature') || lowerInput.includes('outside')) cues.push('natural_connection');
    if (lowerInput.includes('messy') || lowerInput.includes('chaos')) cues.push('environmental_disorder');
    if (lowerInput.includes('quiet') || lowerInput.includes('peaceful')) cues.push('calm_environment');
    
    return cues;
  }

  private extractSomaticCues(input: string): string[] {
    const cues = [];
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('tired') || lowerInput.includes('exhausted')) cues.push('energy_depletion');
    if (lowerInput.includes('tense') || lowerInput.includes('stress')) cues.push('physical_tension');
    if (lowerInput.includes('grounded') || lowerInput.includes('centered')) cues.push('embodied_presence');
    if (lowerInput.includes('restless') || lowerInput.includes('fidget')) cues.push('physical_restlessness');
    
    return cues;
  }

  private extractBehavioralCues(input: string): string[] {
    const cues = [];
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('routine') || lowerInput.includes('habit')) cues.push('structural_patterns');
    if (lowerInput.includes('procrastinat') || lowerInput.includes('avoid')) cues.push('avoidance_behaviors');
    if (lowerInput.includes('consistent') || lowerInput.includes('regular')) cues.push('stable_behaviors');
    if (lowerInput.includes('scattered') || lowerInput.includes('disorganized')) cues.push('chaotic_behaviors');
    
    return cues;
  }

  private calculateStabilityScore(input: string, env: string[], som: string[], beh: string[]): number {
    let score = 0.5; // baseline
    
    // Positive stability indicators
    if (env.includes('sacred_space')) score += 0.1;
    if (som.includes('embodied_presence')) score += 0.15;
    if (beh.includes('stable_behaviors')) score += 0.2;
    
    // Negative stability indicators  
    if (env.includes('environmental_disorder')) score -= 0.1;
    if (som.includes('physical_tension')) score -= 0.1;
    if (beh.includes('chaotic_behaviors')) score -= 0.15;
    
    return Math.max(0, Math.min(1, score));
  }
}

// Behavior Trees + Symbolic Planner for Earth Rituals
class EarthRitualExecutor {
  private groundingRituals = {
    high_stability: [
      "Daily earth meditation with stones",
      "Gratitude practice for foundations",
      "Seasonal alignment ritual"
    ],
    medium_stability: [
      "Morning grounding visualization", 
      "Evening reflection on growth",
      "Weekly space clearing ceremony"
    ],
    low_stability: [
      "Emergency grounding: feet on earth",
      "Breath work with earth visualization",
      "Create one small stable routine"
    ]
  };

  async scheduleRituals(sensoryMapping: SensoryMapping, phase: string): Promise<RitualExecution> {
    const stabilityLevel = this.categorizeStability(sensoryMapping.stability_score);
    const selectedRituals = this.groundingRituals[stabilityLevel];
    
    return {
      scheduled_practices: selectedRituals,
      completion_rate: 0, // Initialize to track over time
      stability_impact: this.predictStabilityImpact(stabilityLevel)
    };
  }

  private categorizeStability(score: number): 'high_stability' | 'medium_stability' | 'low_stability' {
    if (score >= 0.7) return 'high_stability';
    if (score >= 0.4) return 'medium_stability';
    return 'low_stability';
  }

  private predictStabilityImpact(level: string): number {
    const impacts = {
      'high_stability': 0.9,
      'medium_stability': 0.7,
      'low_stability': 0.5
    };
    return impacts[level] || 0.5;
  }
}

// Situation Calculus for Context Awareness
class EarthContextTracker {
  async trackContext(input: string, userHistory: any[]): Promise<ContextAwareness> {
    return {
      location: this.inferLocation(input),
      season: this.detectSeason(),
      phase: this.detectSpiralogicPhase(input, userHistory),
      stability_factors: this.identifyStabilityFactors(input, userHistory)
    };
  }

  private inferLocation(input: string): string {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('work') || lowerInput.includes('office')) return 'work_space';
    if (lowerInput.includes('home') || lowerInput.includes('house')) return 'home_space';
    if (lowerInput.includes('nature') || lowerInput.includes('outside')) return 'natural_space';
    return 'unknown_space';
  }

  private detectSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  private detectSpiralogicPhase(input: string, history: any[]): string {
    // Analyze patterns to detect current spiral phase
    if (input.includes('beginning') || input.includes('start')) return 'initiation';
    if (input.includes('building') || input.includes('growing')) return 'development';
    if (input.includes('stable') || input.includes('maintaining')) return 'grounding';
    if (input.includes('changing') || input.includes('evolving')) return 'transformation';
    return 'grounding'; // Default to Earth's natural phase
  }

  private identifyStabilityFactors(input: string, history: any[]): string[] {
    const factors = [];
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('relationship')) factors.push('relationship_stability');
    if (lowerInput.includes('work') || lowerInput.includes('job')) factors.push('work_stability');
    if (lowerInput.includes('health')) factors.push('health_stability');
    if (lowerInput.includes('home') || lowerInput.includes('living')) factors.push('living_stability');
    if (lowerInput.includes('money') || lowerInput.includes('financial')) factors.push('financial_stability');
    
    return factors;
  }
}

// Bayesian + Temporal Modeling for Predictions
class EarthPredictiveModeler {
  async generatePredictions(
    sensoryMapping: SensoryMapping,
    context: ContextAwareness,
    rituals: RitualExecution
  ): Promise<PredictiveModel> {
    return {
      habit_trajectories: await this.predictHabitTrajectories(sensoryMapping, context),
      routine_effectiveness: this.assessRoutineEffectiveness(rituals),
      structural_predictions: this.generateStructuralPredictions(sensoryMapping, context)
    };
  }

  private async predictHabitTrajectories(mapping: SensoryMapping, context: ContextAwareness): Promise<any[]> {
    // Simple Bayesian prediction based on current stability and context
    const trajectories = [];
    
    if (mapping.stability_score > 0.7) {
      trajectories.push({
        habit: 'maintenance_routines',
        probability: 0.8,
        timeline: '1-3 months',
        impact: 'sustained_stability'
      });
    } else {
      trajectories.push({
        habit: 'foundation_building',
        probability: 0.9,
        timeline: '2-4 weeks', 
        impact: 'increasing_stability'
      });
    }
    
    return trajectories;
  }

  private assessRoutineEffectiveness(rituals: RitualExecution): number {
    // Base effectiveness on ritual alignment with stability needs
    return rituals.stability_impact * 0.8; // Conservative estimate
  }

  private generateStructuralPredictions(mapping: SensoryMapping, context: ContextAwareness): string[] {
    const predictions = [];
    
    if (mapping.stability_score < 0.4) {
      predictions.push("Foundation building phase needed");
      predictions.push("Focus on basic routines and structures");
    } else if (mapping.stability_score > 0.7) {
      predictions.push("Ready for expansion and growth");
      predictions.push("Can handle more complexity");
    } else {
      predictions.push("Strengthening existing foundations");
      predictions.push("Gradual stabilization in progress");
    }
    
    return predictions;
  }
}

export class CognitiveEarthAgent extends ArchetypeAgent {
  private sensoryMapper: EarthSensoryMapper;
  private ritualExecutor: EarthRitualExecutor;
  private contextTracker: EarthContextTracker;
  private predictiveModeler: EarthPredictiveModeler;

  constructor(oracleName: string = "Terra-Cognitive", voiceProfile?: any, phase: string = "grounding") {
    super("earth", oracleName, voiceProfile, phase);
    this.sensoryMapper = new EarthSensoryMapper();
    this.ritualExecutor = new EarthRitualExecutor();
    this.contextTracker = new EarthContextTracker();
    this.predictiveModeler = new EarthPredictiveModeler();
  }

  async processExtendedQuery(query: { input: string; userId: string }): Promise<AIResponse> {
    const { input, userId } = query;
    const contextMemory = await getRelevantMemories(userId, 3);

    // Phase 1: Sensory Mapping (ACT-R + CogAff)
    const sensoryMapping = await this.sensoryMapper.mapSensoryInput(input, contextMemory);

    // Phase 2: Context Awareness (Situation Calculus)
    const context = await this.contextTracker.trackContext(input, contextMemory);

    // Phase 3: Ritual Execution Planning (Behavior Trees)
    const rituals = await this.ritualExecutor.scheduleRituals(sensoryMapping, context.phase);

    // Phase 4: Predictive Modeling (Bayesian + Temporal)
    const predictions = await this.predictiveModeler.generatePredictions(sensoryMapping, context, rituals);

    // Generate Earth-specific wisdom
    const earthWisdom = this.synthesizeEarthWisdom(input, sensoryMapping, context, rituals, predictions);

    // Enhance with AI model
    const enhancedResponse = await ModelService.getResponse({
      input: `As the Earth Agent embodying grounding and stability, respond to: "${input}"
      
      Stability Score: ${sensoryMapping.stability_score}
      Context: ${context.phase} phase in ${context.season}
      Rituals Needed: ${rituals.scheduled_practices.join(', ')}
      Predictions: ${predictions.structural_predictions.join(', ')}
      
      Provide grounding wisdom that builds foundations and creates lasting stability.`,
      userId
    });

    const finalContent = `${earthWisdom}\n\n${enhancedResponse.response}\n\n🌍 ${this.selectEarthSignature(sensoryMapping.stability_score)}`;

    // Store memory with Earth cognitive metadata
    await storeMemoryItem({
      clientId: userId,
      content: finalContent,
      element: "earth",
      sourceAgent: "cognitive-earth-agent",
      confidence: 0.94,
      metadata: {
        role: "oracle",
        phase: "cognitive-earth",
        archetype: "CognitiveEarth",
        sensoryMapping,
        context,
        rituals,
        predictions,
        cognitiveArchitecture: ["ACT-R", "CogAff", "BehaviorTrees", "SituationCalculus", "BayesianTemporal"]
      }
    });

    // Log Earth-specific insights
    await logOracleInsight({
      anon_id: userId,
      archetype: "CognitiveEarth",
      element: "earth", 
      insight: {
        message: finalContent,
        raw_input: input,
        stabilityScore: sensoryMapping.stability_score,
        contextPhase: context.phase,
        ritualRecommendations: rituals.scheduled_practices,
        structuralPredictions: predictions.structural_predictions
      },
      emotion: sensoryMapping.stability_score,
      phase: "cognitive-earth",
      context: contextMemory
    });

    return {
      content: finalContent,
      provider: "cognitive-earth-agent",
      model: enhancedResponse.model || "gpt-4",
      confidence: 0.94,
      metadata: {
        element: "earth",
        archetype: "CognitiveEarth", 
        phase: "cognitive-earth",
        sensoryMapping,
        context,
        rituals,
        predictions,
        cognitiveArchitecture: {
          sensory: { stability: sensoryMapping.stability_score },
          context: { phase: context.phase, season: context.season },
          rituals: { count: rituals.scheduled_practices.length },
          predictions: { trajectories: predictions.habit_trajectories.length }
        }
      }
    };
  }

  private synthesizeEarthWisdom(
    input: string,
    sensory: SensoryMapping,
    context: ContextAwareness, 
    rituals: RitualExecution,
    predictions: PredictiveModel
  ): string {
    const stabilityInsight = this.generateStabilityInsight(sensory.stability_score);
    const contextualGuidance = this.generateContextualGuidance(context);
    const ritualGuidance = this.generateRitualGuidance(rituals);

    return `🌍 **Earth Cognitive Analysis**

**Stability Foundation**: ${stabilityInsight}

**Seasonal Context**: ${contextualGuidance}

**Grounding Path**: ${ritualGuidance}

Your foundations are ${Math.round(sensory.stability_score * 100)}% stable. The earth beneath you ${sensory.stability_score > 0.6 ? 'supports your growth' : 'calls for deeper roots'}.`;
  }

  private generateStabilityInsight(score: number): string {
    if (score >= 0.7) {
      return "Your foundations are strong and ready to support new growth. This is a time for expansion and building upon what's solid.";
    } else if (score >= 0.4) {
      return "Your foundations are developing. Focus on strengthening what's already working while gently building new supports.";
    } else {
      return "Your foundations need attention. This is sacred work - creating stability from which all growth flows.";
    }
  }

  private generateContextualGuidance(context: ContextAwareness): string {
    const seasonalWisdom = {
      spring: "Spring's energy supports new foundations and fresh beginnings",
      summer: "Summer's warmth nurtures the structures you've planted", 
      autumn: "Autumn calls for harvesting wisdom and preparing for rest",
      winter: "Winter invites deep rest and foundation regeneration"
    };

    return seasonalWisdom[context.season] || "The seasons support your grounding journey";
  }

  private generateRitualGuidance(rituals: RitualExecution): string {
    const practiceCount = rituals.scheduled_practices.length;
    if (practiceCount >= 3) {
      return "Multiple grounding practices will create a strong foundation web";
    } else if (practiceCount >= 2) {
      return "Your selected practices will build steady, sustainable roots";
    } else {
      return "Start with one simple practice - even oak trees begin with a single root";
    }
  }

  private selectEarthSignature(stabilityScore: number): string {
    const signatures = [
      "Deep roots create unshakeable trees",
      "Every mountain began as bedrock", 
      "Stability is not stillness - it's strength in motion",
      "Your foundations are sacred ground",
      "Growth happens in the marriage of root and soil"
    ];

    const index = Math.floor(stabilityScore * signatures.length);
    return signatures[Math.min(index, signatures.length - 1)];
  }
}