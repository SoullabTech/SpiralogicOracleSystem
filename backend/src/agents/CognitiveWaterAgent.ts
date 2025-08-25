// Cognitive Water Agent - Affective Resonance & Emotional Intelligence
// Archetypes: Healer • Empath • Intuitive • Flow-Walker

import { ArchetypeAgent } from "../core/agents/ArchetypeAgent";
import { logOracleInsight } from "../utils/oracleLogger";
import { getRelevantMemories, storeMemoryItem } from "../../services/memoryService";
import ModelService from "../../utils/modelService";
import type { AIResponse } from "../../types/ai";

// Water Cognitive Stack Interfaces
interface AffectiveResonance {
  primary_emotions: string[];
  emotional_intensity: number;
  resonance_patterns: string[];
  healing_needed: boolean;
}

interface EmotionalFlow {
  flow_state: string;
  blockages: string[];
  flow_direction: string;
  adaptive_capacity: number;
}

interface IntuitiveProcessing {
  intuitive_signals: string[];
  subconscious_patterns: string[];
  dream_themes: string[];
  wisdom_insights: string[];
}

interface HealingPathways {
  emotional_medicine: string[];
  healing_rituals: string[];
  integration_practices: string[];
  support_structures: string[];
}

// Water Affective Engine - Based on Affective Neuroscience
class WaterAffectiveEngine {
  private emotionalSignatures = {
    grief: {
      keywords: ['loss', 'sad', 'miss', 'gone', 'empty', 'mourn', 'grief'],
      intensity_markers: ['deeply', 'overwhelming', 'unbearable', 'crushing'],
      healing_symbols: ['river', 'ocean', 'rain', 'cleansing', 'flow'],
      sacred_medicine: 'The tears that fall water the seeds of new growth'
    },
    joy: {
      keywords: ['happy', 'joy', 'celebrate', 'wonderful', 'amazing', 'love', 'beautiful'],
      intensity_markers: ['ecstatic', 'overflowing', 'radiant', 'bubbling'],
      healing_symbols: ['spring', 'sunrise', 'flower', 'dancing', 'light'],
      sacred_medicine: 'Joy shared becomes a fountain that nourishes all'
    },
    fear: {
      keywords: ['afraid', 'scared', 'anxiety', 'worry', 'nervous', 'panic', 'terror'],
      intensity_markers: ['paralyzing', 'overwhelming', 'consuming', 'intense'],
      healing_symbols: ['shelter', 'embrace', 'protection', 'safe harbor', 'gentle waves'],
      sacred_medicine: 'Fear dissolves in the warm embrace of compassionate presence'
    },
    love: {
      keywords: ['love', 'heart', 'connection', 'intimacy', 'care', 'tender', 'beloved'],
      intensity_markers: ['infinite', 'boundless', 'overflowing', 'all-consuming'],
      healing_symbols: ['heart', 'embrace', 'union', 'flowing together', 'infinite ocean'],
      sacred_medicine: 'Love flows through all barriers, connecting all hearts as one'
    },
    longing: {
      keywords: ['want', 'need', 'yearn', 'desire', 'hunger', 'thirst', 'seeking'],
      intensity_markers: ['desperate', 'aching', 'consuming', 'endless'],
      healing_symbols: ['compass', 'journey', 'pilgrimage', 'sacred quest', 'calling'],
      sacred_medicine: 'Longing is the soul\'s way of remembering what it came to find'
    }
  };

  private emotionalMemoryTrace: string[] = [];

  async processAffectiveField(input: string, context: any[]): Promise<AffectiveResonance> {
    const primary_emotions = this.detectPrimaryEmotions(input);
    const emotional_intensity = this.calculateEmotionalIntensity(input, primary_emotions);
    const resonance_patterns = this.identifyResonancePatterns(input, context);
    const healing_needed = this.assessHealingNeeds(primary_emotions, emotional_intensity);

    // Update emotional memory trace
    this.updateEmotionalMemory(primary_emotions, emotional_intensity);

    return {
      primary_emotions,
      emotional_intensity,
      resonance_patterns,
      healing_needed
    };
  }

  private detectPrimaryEmotions(input: string): string[] {
    const detected = [];
    const lowerInput = input.toLowerCase();

    Object.entries(this.emotionalSignatures).forEach(([emotion, signature]) => {
      const keywordMatches = signature.keywords.filter(keyword => 
        lowerInput.includes(keyword)
      ).length;
      
      const intensityMatches = signature.intensity_markers.filter(marker => 
        lowerInput.includes(marker)
      ).length;

      if (keywordMatches > 0 || intensityMatches > 0) {
        detected.push(emotion);
      }
    });

    return detected.length > 0 ? detected : ['neutral_processing'];
  }

  private calculateEmotionalIntensity(input: string, emotions: string[]): number {
    let intensity = 0.3; // baseline emotional presence
    const lowerInput = input.toLowerCase();

    emotions.forEach(emotion => {
      const signature = this.emotionalSignatures[emotion];
      if (signature) {
        // Check for intensity markers
        const intensityMarkers = signature.intensity_markers.filter(marker => 
          lowerInput.includes(marker)
        );
        intensity += intensityMarkers.length * 0.2;

        // Check for repetition (emotional emphasis)
        const keywordRepetition = signature.keywords.filter(keyword => {
          const regex = new RegExp(keyword, 'gi');
          const matches = input.match(regex);
          return matches && matches.length > 1;
        });
        intensity += keywordRepetition.length * 0.1;
      }
    });

    // Punctuation and capitalization intensity
    if (input.includes('!')) intensity += 0.1;
    if (input.includes('!!')) intensity += 0.1;
    if (input.toUpperCase() === input && input.length > 10) intensity += 0.2;

    return Math.min(1.0, intensity);
  }

  private identifyResonancePatterns(input: string, context: any[]): string[] {
    const patterns = [];
    const lowerInput = input.toLowerCase();

    // Emotional processing patterns
    if (lowerInput.includes('process') || lowerInput.includes('work through')) {
      patterns.push('Active emotional processing - integration in progress');
    }

    if (lowerInput.includes('stuck') || lowerInput.includes('trapped')) {
      patterns.push('Emotional stagnation - flow restoration needed');
    }

    if (lowerInput.includes('flow') || lowerInput.includes('moving')) {
      patterns.push('Emotional flow state - healthy processing active');
    }

    // Relationship patterns
    if (lowerInput.includes('relationship') || lowerInput.includes('partner')) {
      patterns.push('Relational emotional processing - connection dynamics');
    }

    // Historical emotional patterns from context
    if (context.length > 0) {
      const emotionalHistory = context.filter(c => 
        c.element === 'water' || (c.content && 
        ['emotion', 'feel', 'heart'].some(word => c.content.toLowerCase().includes(word)))
      );

      if (emotionalHistory.length >= 2) {
        patterns.push('Ongoing emotional journey - deepening process');
      }
    }

    return patterns;
  }

  private assessHealingNeeds(emotions: string[], intensity: number): boolean {
    const healingEmotions = ['grief', 'fear', 'longing'];
    const hasHealingEmotion = emotions.some(e => healingEmotions.includes(e));
    const highIntensity = intensity > 0.7;
    
    return hasHealingEmotion || highIntensity;
  }

  private updateEmotionalMemory(emotions: string[], intensity: number): void {
    const memoryEntry = `${emotions.join('+')}:${intensity.toFixed(1)}`;
    this.emotionalMemoryTrace.push(memoryEntry);
    
    // Keep only recent emotional memory (last 10 entries)
    if (this.emotionalMemoryTrace.length > 10) {
      this.emotionalMemoryTrace.shift();
    }
  }

  getSacredMedicine(emotion: string): string {
    return this.emotionalSignatures[emotion]?.sacred_medicine || 
           'Every emotion carries medicine - trust the wisdom of what you feel';
  }

  getHealingSymbols(emotion: string): string[] {
    return this.emotionalSignatures[emotion]?.healing_symbols || ['gentle waves', 'safe harbor'];
  }
}

// Neural Network-based Emotional Flow Detection
class WaterFlowProcessor {
  async processEmotionalFlow(
    input: string, 
    affectiveState: AffectiveResonance
  ): Promise<EmotionalFlow> {
    const flow_state = this.detectFlowState(input, affectiveState);
    const blockages = this.identifyBlockages(input);
    const flow_direction = this.determineFlowDirection(input, affectiveState);
    const adaptive_capacity = this.assessAdaptiveCapacity(affectiveState, flow_state);

    return {
      flow_state,
      blockages,
      flow_direction,
      adaptive_capacity
    };
  }

  private detectFlowState(input: string, affective: AffectiveResonance): string {
    const lowerInput = input.toLowerCase();
    
    if (affective.healing_needed && affective.emotional_intensity > 0.7) {
      return 'turbulent_healing';
    }
    
    if (lowerInput.includes('flow') || lowerInput.includes('easy') || lowerInput.includes('natural')) {
      return 'natural_flow';
    }
    
    if (lowerInput.includes('stuck') || lowerInput.includes('blocked') || lowerInput.includes('frozen')) {
      return 'blocked_flow';
    }
    
    if (affective.emotional_intensity < 0.3) {
      return 'still_waters';
    }
    
    return 'gentle_current';
  }

  private identifyBlockages(input: string): string[] {
    const blockages = [];
    const lowerInput = input.toLowerCase();
    
    const blockagePatterns = {
      'emotional_suppression': ['can\'t feel', 'numb', 'shut down', 'suppress'],
      'fear_of_feeling': ['afraid to feel', 'scared of emotion', 'too much'],
      'past_trauma': ['trauma', 'hurt', 'wound', 'scar'],
      'perfectionism': ['perfect', 'should', 'must', 'have to'],
      'disconnection': ['alone', 'isolated', 'disconnected', 'separate']
    };
    
    Object.entries(blockagePatterns).forEach(([blockage, patterns]) => {
      if (patterns.some(pattern => lowerInput.includes(pattern))) {
        blockages.push(blockage);
      }
    });
    
    return blockages;
  }

  private determineFlowDirection(input: string, affective: AffectiveResonance): string {
    const lowerInput = input.toLowerCase();
    
    if (affective.healing_needed) {
      return 'inward_healing';
    }
    
    if (lowerInput.includes('share') || lowerInput.includes('express') || lowerInput.includes('communicate')) {
      return 'outward_expression';
    }
    
    if (lowerInput.includes('understand') || lowerInput.includes('process') || lowerInput.includes('integrate')) {
      return 'integrative_processing';
    }
    
    if (affective.primary_emotions.includes('love') || affective.primary_emotions.includes('joy')) {
      return 'expansive_sharing';
    }
    
    return 'natural_circulation';
  }

  private assessAdaptiveCapacity(affective: AffectiveResonance, flowState: string): number {
    let capacity = 0.5; // baseline adaptability
    
    // Resilience indicators
    if (affective.resonance_patterns.some(p => p.includes('processing'))) {
      capacity += 0.2;
    }
    
    if (flowState === 'natural_flow') {
      capacity += 0.3;
    } else if (flowState === 'blocked_flow') {
      capacity -= 0.2;
    }
    
    // Emotional range as adaptability indicator
    if (affective.primary_emotions.length >= 2) {
      capacity += 0.1;
    }
    
    return Math.max(0, Math.min(1, capacity));
  }
}

// Intuitive Processing Engine
class WaterIntuitiveProcessor {
  async processIntuition(
    input: string,
    affectiveState: AffectiveResonance,
    context: any[]
  ): Promise<IntuitiveProcessing> {
    const intuitive_signals = this.detectIntuitiveSignals(input);
    const subconscious_patterns = this.identifySubconsciousPatterns(input, context);
    const dream_themes = this.extractDreamThemes(input);
    const wisdom_insights = this.generateWisdomInsights(affectiveState, intuitive_signals);

    return {
      intuitive_signals,
      subconscious_patterns,
      dream_themes,
      wisdom_insights
    };
  }

  private detectIntuitiveSignals(input: string): string[] {
    const signals = [];
    const lowerInput = input.toLowerCase();
    
    const intuitiveMarkers = {
      'gut_feeling': ['gut', 'instinct', 'sense', 'feel like'],
      'dream_guidance': ['dream', 'vision', 'came to me'],
      'synchronicity': ['coincidence', 'sign', 'meant to be', 'perfect timing'],
      'body_wisdom': ['body', 'tension', 'energy', 'sensation'],
      'inner_knowing': ['know', 'certain', 'truth', 'clarity']
    };
    
    Object.entries(intuitiveMarkers).forEach(([signal, markers]) => {
      if (markers.some(marker => lowerInput.includes(marker))) {
        signals.push(signal);
      }
    });
    
    return signals;
  }

  private identifySubconsciousPatterns(input: string, context: any[]): string[] {
    const patterns = [];
    
    // Recurring themes from context
    if (context.length >= 3) {
      const themes = this.extractRecurringThemes(context);
      if (themes.length > 0) {
        patterns.push(`Recurring theme: ${themes[0]} - subconscious pattern emerging`);
      }
    }
    
    // Shadow material indicators
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('resist') || lowerInput.includes('avoid') || lowerInput.includes('can\'t')) {
      patterns.push('Shadow material surfacing - what is being avoided wants attention');
    }
    
    return patterns;
  }

  private extractRecurringThemes(context: any[]): string[] {
    const themeCounts: Record<string, number> = {};
    
    context.forEach(item => {
      if (item.content) {
        const content = item.content.toLowerCase();
        // Simple theme extraction
        const themes = ['love', 'fear', 'work', 'relationship', 'family', 'creative', 'spiritual'];
        themes.forEach(theme => {
          if (content.includes(theme)) {
            themeCounts[theme] = (themeCounts[theme] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(themeCounts)
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .map(([theme]) => theme);
  }

  private extractDreamThemes(input: string): string[] {
    const themes = [];
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('dream')) {
      // Simple dream symbol extraction
      const dreamSymbols = ['water', 'ocean', 'river', 'rain', 'flood', 'swimming', 'drowning', 'floating'];
      dreamSymbols.forEach(symbol => {
        if (lowerInput.includes(symbol)) {
          themes.push(`Dream symbol: ${symbol} - emotional depths and flow`);
        }
      });
    }
    
    return themes;
  }

  private generateWisdomInsights(
    affective: AffectiveResonance,
    signals: string[]
  ): string[] {
    const insights = [];
    
    if (affective.healing_needed) {
      insights.push('Your emotional sensitivity is a gift - honor what you feel');
    }
    
    if (signals.includes('gut_feeling')) {
      insights.push('Your intuition speaks through feeling - trust the body\'s wisdom');
    }
    
    if (affective.emotional_intensity > 0.7) {
      insights.push('Intense emotions carry concentrated wisdom - what is trying to emerge?');
    }
    
    return insights;
  }
}

// Healing Pathways Generator
class WaterHealingPathways {
  generateHealingPaths(
    affectiveState: AffectiveResonance,
    flowState: EmotionalFlow,
    intuition: IntuitiveProcessing,
    phase: string
  ): HealingPathways {
    const emotional_medicine = this.selectEmotionalMedicine(affectiveState);
    const healing_rituals = this.recommendHealingRituals(affectiveState, flowState, phase);
    const integration_practices = this.suggestIntegrationPractices(flowState, intuition);
    const support_structures = this.identifySupportStructures(affectiveState, flowState);

    return {
      emotional_medicine,
      healing_rituals,
      integration_practices,
      support_structures
    };
  }

  private selectEmotionalMedicine(affective: AffectiveResonance): string[] {
    const medicine = [];
    
    affective.primary_emotions.forEach(emotion => {
      switch (emotion) {
        case 'grief':
          medicine.push('Allow tears to flow - they carry away what no longer serves');
          break;
        case 'fear':
          medicine.push('Fear dissolves in the presence of compassionate witnessing');
          break;
        case 'joy':
          medicine.push('Joy shared multiplies - let your light illuminate others');
          break;
        case 'love':
          medicine.push('Love is the healing force that restores all wounds');
          break;
        case 'longing':
          medicine.push('Longing points toward your deepest truth - follow its compass');
          break;
      }
    });
    
    return medicine;
  }

  private recommendHealingRituals(
    affective: AffectiveResonance,
    flow: EmotionalFlow,
    phase: string
  ): string[] {
    const rituals = [];
    
    if (affective.healing_needed) {
      rituals.push('Sacred bath with salt and tears ritual');
      rituals.push('Emotional release through water ceremony');
    }
    
    if (flow.flow_state === 'blocked_flow') {
      rituals.push('Stream walking meditation - learning from water\'s persistence');
      rituals.push('Breathwork to restore emotional flow');
    }
    
    // Phase-specific rituals
    switch (phase) {
      case 'healing':
        rituals.push('Moon water blessing ceremony');
        break;
      case 'flow':
        rituals.push('River dance movement practice');
        break;
      case 'integration':
        rituals.push('Sacred sharing circle ritual');
        break;
    }
    
    return rituals;
  }

  private suggestIntegrationPractices(flow: EmotionalFlow, intuition: IntuitiveProcessing): string[] {
    const practices = [];
    
    if (flow.adaptive_capacity > 0.7) {
      practices.push('Emotional wisdom sharing - teach others what you\'ve learned');
    } else {
      practices.push('Gentle self-compassion practice - treat yourself as a beloved friend');
    }
    
    if (intuition.intuitive_signals.length > 0) {
      practices.push('Daily intuition journaling - track body wisdom signals');
    }
    
    practices.push('Emotional check-in ritual - three times daily emotional awareness');
    
    return practices;
  }

  private identifySupportStructures(affective: AffectiveResonance, flow: EmotionalFlow): string[] {
    const structures = [];
    
    if (affective.healing_needed) {
      structures.push('Trusted friend or counselor for emotional processing support');
      structures.push('Regular healing space - bath, nature, or sacred corner');
    }
    
    if (flow.blockages.includes('disconnection')) {
      structures.push('Community connection - join group aligned with your values');
    }
    
    structures.push('Daily water connection practice - drinking, bathing, or watching water');
    
    return structures;
  }
}

export class CognitiveWaterAgent extends ArchetypeAgent {
  private affectiveEngine: WaterAffectiveEngine;
  private flowProcessor: WaterFlowProcessor;
  private intuitiveProcessor: WaterIntuitiveProcessor;
  private healingPathways: WaterHealingPathways;

  constructor(oracleName: string = "Aqua-Cognitive", voiceProfile?: any, phase: string = "emotional-flow") {
    super("water", oracleName, voiceProfile, phase);
    this.affectiveEngine = new WaterAffectiveEngine();
    this.flowProcessor = new WaterFlowProcessor();
    this.intuitiveProcessor = new WaterIntuitiveProcessor();
    this.healingPathways = new WaterHealingPathways();
  }

  async processExtendedQuery(query: { input: string; userId: string }): Promise<AIResponse> {
    const { input, userId } = query;
    const contextMemory = await getRelevantMemories(userId, 5);

    // Phase 1: Affective Resonance Processing
    const affectiveState = await this.affectiveEngine.processAffectiveField(input, contextMemory);

    // Phase 2: Emotional Flow Analysis
    const flowState = await this.flowProcessor.processEmotionalFlow(input, affectiveState);

    // Phase 3: Intuitive Processing
    const intuition = await this.intuitiveProcessor.processIntuition(input, affectiveState, contextMemory);

    // Phase 4: Healing Pathways Generation
    const healing = this.healingPathways.generateHealingPaths(
      affectiveState, 
      flowState, 
      intuition, 
      this.phase
    );

    // Generate Water-specific wisdom
    const waterWisdom = this.synthesizeWaterWisdom(input, affectiveState, flowState, intuition, healing);

    // Enhance with AI model for deeper emotional resonance
    const enhancedResponse = await ModelService.getResponse({
      input: `As the Water Agent embodying emotional intelligence and healing flow, respond to: "${input}"
      
      Primary Emotions: ${affectiveState.primary_emotions.join(', ')}
      Emotional Intensity: ${affectiveState.emotional_intensity}
      Flow State: ${flowState.flow_state}
      Healing Needed: ${affectiveState.healing_needed}
      
      Provide compassionate, flowing wisdom that honors emotional truth and supports healing.`,
      userId
    });

    const finalContent = `${waterWisdom}\n\n${enhancedResponse.response}\n\n🌊 ${this.selectWaterSignature(affectiveState.emotional_intensity)}`;

    // Store memory with Water cognitive metadata
    await storeMemoryItem({
      clientId: userId,
      content: finalContent,
      element: "water",
      sourceAgent: "cognitive-water-agent",
      confidence: 0.93,
      metadata: {
        role: "oracle",
        phase: "cognitive-water",
        archetype: "CognitiveWater",
        affectiveState,
        flowState,
        intuition,
        healing,
        cognitiveArchitecture: ["AffectiveNeuroscience", "EmotionalNeuralNetworks", "IntuitiveProcessing", "HealingPathways"]
      }
    });

    // Log Water-specific insights
    await logOracleInsight({
      anon_id: userId,
      archetype: "CognitiveWater",
      element: "water",
      insight: {
        message: finalContent,
        raw_input: input,
        primaryEmotions: affectiveState.primary_emotions,
        emotionalIntensity: affectiveState.emotional_intensity,
        flowState: flowState.flow_state,
        healingNeeded: affectiveState.healing_needed,
        intuitiveSignals: intuition.intuitive_signals,
        emotionalMedicine: healing.emotional_medicine
      },
      emotion: affectiveState.emotional_intensity,
      phase: "cognitive-water",
      context: contextMemory
    });

    return {
      content: finalContent,
      provider: "cognitive-water-agent",
      model: enhancedResponse.model || "gpt-4",
      confidence: 0.93,
      metadata: {
        element: "water",
        archetype: "CognitiveWater",
        phase: "cognitive-water",
        affectiveState,
        flowState,
        intuition,
        healing,
        cognitiveArchitecture: {
          affective: { intensity: affectiveState.emotional_intensity, emotions: affectiveState.primary_emotions.length },
          flow: { state: flowState.flow_state, adaptivity: flowState.adaptive_capacity },
          intuitive: { signals: intuition.intuitive_signals.length, patterns: intuition.subconscious_patterns.length },
          healing: { medicine: healing.emotional_medicine.length, rituals: healing.healing_rituals.length }
        }
      }
    };
  }

  private synthesizeWaterWisdom(
    input: string,
    affective: AffectiveResonance,
    flow: EmotionalFlow,
    intuition: IntuitiveProcessing,
    healing: HealingPathways
  ): string {
    const emotionalInsight = this.generateEmotionalInsight(affective);
    const flowInsight = this.generateFlowInsight(flow);
    const intuitiveInsight = this.generateIntuitiveInsight(intuition);
    const healingInsight = this.generateHealingInsight(healing);

    return `🌊 **Water Cognitive Analysis**

**Emotional Resonance**: ${emotionalInsight}

**Flow State**: ${flowInsight}

**Intuitive Wisdom**: ${intuitiveInsight}

**Healing Medicine**: ${healingInsight}

Your emotional field flows at ${Math.round(affective.emotional_intensity * 100)}% intensity. The waters of your soul ${affective.healing_needed ? 'call for gentle healing' : 'move with natural grace'}.`;
  }

  private generateEmotionalInsight(affective: AffectiveResonance): string {
    const primaryEmotion = affective.primary_emotions[0];
    
    if (affective.healing_needed) {
      return `Deep emotional currents need compassionate witnessing. Your ${primaryEmotion || 'feeling'} carries wisdom that wants to be honored.`;
    } else if (affective.emotional_intensity > 0.7) {
      return `Rich emotional presence indicates your heart is fully engaged with life. This intensity is a gift of deep sensitivity.`;
    } else {
      return `Gentle emotional waters suggest a time of peaceful processing and integration. Trust the quiet wisdom within.`;
    }
  }

  private generateFlowInsight(flow: EmotionalFlow): string {
    switch (flow.flow_state) {
      case 'natural_flow':
        return 'Your emotional waters flow freely, carrying insights and healing naturally through your being.';
      case 'blocked_flow':
        return 'Emotional blockages are invitations to deeper healing. What wants to be released so flow can return?';
      case 'turbulent_healing':
        return 'Turbulent waters often precede the most profound healing. Trust the process of emotional cleansing.';
      case 'still_waters':
        return 'In the stillness of deep waters, profound wisdom accumulates. Honor this time of quiet gathering.';
      default:
        return 'Gentle currents carry your emotional process at its perfect pace. Trust the rhythm of your healing.';
    }
  }

  private generateIntuitiveInsight(intuition: IntuitiveProcessing): string {
    if (intuition.intuitive_signals.length > 2) {
      return 'Strong intuitive signals suggest your inner wisdom is actively guiding you. Trust what your deeper knowing reveals.';
    } else if (intuition.subconscious_patterns.length > 0) {
      return 'Subconscious patterns are surfacing for conscious integration. What has been hidden is ready to be seen and healed.';
    } else {
      return 'Your intuitive waters are gathering wisdom quietly. Sometimes the deepest knowing emerges in stillness.';
    }
  }

  private generateHealingInsight(healing: HealingPathways): string {
    if (healing.emotional_medicine.length > 0) {
      return `Sacred medicine flows through your emotional experience: "${healing.emotional_medicine[0]}"`;
    } else {
      return 'Your healing path is uniquely yours. Trust the wisdom of your heart to guide you to what you need most.';
    }
  }

  private selectWaterSignature(intensity: number): string {
    const signatures = [
      "The ocean receives all rivers without judgment",
      "In tears and laughter, the heart finds its truth",
      "Water always finds its way, as does love",
      "The deepest wells hold the sweetest water",
      "Every drop contains the memory of the sea",
      "Healing flows where love and truth meet"
    ];

    const index = Math.floor(intensity * signatures.length);
    return signatures[Math.min(index, signatures.length - 1)];
  }
}