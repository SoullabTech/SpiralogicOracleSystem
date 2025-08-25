/**
 * DreamFieldNode.ts
 * Enhanced Distributed Archetypal Memory Layer for Spiralogic Oracle System
 * Integrates with VAE + temporal tagging for emergence prediction
 */

import { SpiralPhase, Archetype, ElementalType } from '../types/index';

export interface SymbolEntry {
  symbol: string;
  archetype: string;
  phase: string;
  timestamp: number;
  userId: string; // Anonymous hash for privacy
  intensity: number; // 0-1 emotional/symbolic intensity
  elementalResonance?: ElementalType;
  context?: string;
  dreamSource?: boolean;
  visionSource?: boolean;
  ritualSource?: boolean;
  synchronicityMarker?: boolean;
  vectorEmbedding?: number[]; // VAE embedding for pattern detection
  semanticTags?: string[];
  emotionalValence?: 'positive' | 'negative' | 'neutral' | 'transcendent';
}

export interface ArchetypalTrend {
  archetype: string;
  trend: 'emerging' | 'stable' | 'declining' | 'transforming';
  intensity: number;
  associatedSymbols: string[];
  timeWindow: string;
  influenceScore: number;
  elementalDistribution: Partial<Record<ElementalType, number>>;
  predictedEvolution?: string;
  collectiveThreshold?: number;
}

export interface CollectiveResonance {
  symbol: string;
  resonanceFrequency: number;
  crossPhaseAppearance: boolean;
  universalRelevance: number;
  emergentPattern?: string;
  elementalAffinity?: ElementalType;
  archetypalCore?: string;
  temporalSignature?: 'cyclical' | 'linear' | 'explosive' | 'spiral';
  mythicResonance?: number; // 0-1 connection to universal myths
}

export interface DreamConvergence {
  convergenceId: string;
  participatingUsers: number;
  sharedSymbols: string[];
  sharedArchetypes: string[];
  convergenceStrength: number;
  timeWindow: [number, number];
  elementalClusters: Partial<Record<ElementalType, number>>;
  emergentMessage?: string;
  guidanceForField?: string;
  predictedOutcome?: string;
  mythicSignificance?: string;
}

export interface EmergencePrediction {
  symbol: string;
  archetype: string;
  probability: number; // 0-1
  timeframe: 'hours' | 'days' | 'weeks';
  triggerConditions: string[];
  potentialImpact: 'personal' | 'collective' | 'universal';
  recommendedActions?: string[];
}

export interface FieldReport {
  fieldState: 'stable' | 'convergence' | 'emergence' | 'transformation' | 'transcendence';
  dominantArchetypes: string[];
  emergentSymbols: string[];
  elementalBalance: Record<ElementalType, number>;
  collectiveGuidance: string;
  convergenceCount: number;
  predictions: EmergencePrediction[];
  mythicActivation?: string;
  practicalActions?: string[];
}

export class DreamFieldNode {
  private symbolLog: SymbolEntry[];
  private archetypeMap: Map<string, Map<string, number>>;
  private phaseClusters: Map<string, Map<string, number>>;
  private elementalClusters: Map<ElementalType, Map<string, number>>;
  private collectivePulse: Map<string, number>;
  private temporalPatterns: Map<string, number[]>;
  private convergenceHistory: DreamConvergence[];
  private trendAnalysis: ArchetypalTrend[];
  private emergencePredictions: EmergencePrediction[];
  private mythicPatternDetector: Map<string, string[]>; // myth -> associated symbols
  
  // VAE integration for pattern recognition
  private patternVector: Map<string, number[]>; // symbol -> embedding
  private temporalDecay: number = 0.95; // Decay factor for temporal relevance

  constructor() {
    this.symbolLog = [];
    this.archetypeMap = new Map();
    this.phaseClusters = new Map();
    this.elementalClusters = new Map();
    this.collectivePulse = new Map();
    this.temporalPatterns = new Map();
    this.convergenceHistory = [];
    this.trendAnalysis = [];
    this.emergencePredictions = [];
    this.mythicPatternDetector = new Map();
    this.patternVector = new Map();

    this.initializeFrameworks();
  }

  private initializeFrameworks(): void {
    // Initialize archetypal categories
    const coreArchetypes = [
      'Hero', 'Sage', 'Innocent', 'Explorer', 'Rebel', 'Magician',
      'Lover', 'Caregiver', 'Ruler', 'Creator', 'Jester', 'Orphan',
      // Spiralogic-specific archetypes
      'Phoenix', 'Serpent', 'Tree', 'Mountain', 'Ocean', 'Star',
      'Veil', 'Mirror', 'Bridge', 'Spiral', 'Seed', 'Crystal',
      // Enhanced mythic archetypes
      'Dragon', 'Thunderbird', 'World Tree', 'Cosmic Egg', 'Rainbow Bridge',
      'Sacred Feminine', 'Wild Man', 'Crone', 'Shaman', 'Oracle'
    ];

    coreArchetypes.forEach(archetype => {
      this.archetypeMap.set(archetype, new Map());
    });

    // Initialize elemental clusters
    const elements: ElementalType[] = ['fire', 'water', 'earth', 'air', 'aether'];
    elements.forEach(element => {
      this.elementalClusters.set(element, new Map());
    });

    // Initialize mythic pattern associations
    this.initializeMythicPatterns();
  }

  private initializeMythicPatterns(): void {
    this.mythicPatternDetector.set('Creation', ['egg', 'birth', 'dawn', 'seed', 'light']);
    this.mythicPatternDetector.set('Journey', ['path', 'bridge', 'crossroads', 'mountain', 'river']);
    this.mythicPatternDetector.set('Death-Rebirth', ['phoenix', 'serpent', 'winter', 'cocoon', 'tomb']);
    this.mythicPatternDetector.set('Sacred Union', ['marriage', 'twin', 'circle', 'heart', 'dance']);
    this.mythicPatternDetector.set('Transcendence', ['ladder', 'spiral', 'eagle', 'crown', 'star']);
    this.mythicPatternDetector.set('Shadow Integration', ['cave', 'mirror', 'wolf', 'mask', 'labyrinth']);
  }

  // Enhanced symbol logging with VAE integration
  logSymbol(entry: Omit<SymbolEntry, 'timestamp' | 'vectorEmbedding'>): void {
    const symbolEntry: SymbolEntry = {
      ...entry,
      timestamp: Date.now(),
      vectorEmbedding: this.generateSymbolEmbedding(entry.symbol, entry.context)
    };

    this.symbolLog.push(symbolEntry);
    this.updateMappings(symbolEntry);
    this.updatePatternRecognition(symbolEntry);
    this.triggerAnalysisUpdate();
  }

  private updateMappings(entry: SymbolEntry): void {
    // Update archetype mapping
    if (!this.archetypeMap.has(entry.archetype)) {
      this.archetypeMap.set(entry.archetype, new Map());
    }
    const archetypeSymbols = this.archetypeMap.get(entry.archetype)!;
    archetypeSymbols.set(entry.symbol, (archetypeSymbols.get(entry.symbol) || 0) + 1);

    // Update phase clustering
    if (!this.phaseClusters.has(entry.phase)) {
      this.phaseClusters.set(entry.phase, new Map());
    }
    const phaseSymbols = this.phaseClusters.get(entry.phase)!;
    phaseSymbols.set(entry.symbol, (phaseSymbols.get(entry.symbol) || 0) + 1);

    // Update elemental clustering
    if (entry.elementalResonance) {
      const elementSymbols = this.elementalClusters.get(entry.elementalResonance)!;
      elementSymbols.set(entry.symbol, (elementSymbols.get(entry.symbol) || 0) + 1);
    }

    // Update collective pulse with temporal decay
    const currentPulse = this.collectivePulse.get(entry.symbol) || 0;
    const decayedPulse = currentPulse * this.temporalDecay;
    this.collectivePulse.set(entry.symbol, decayedPulse + entry.intensity);

    // Update temporal patterns
    if (!this.temporalPatterns.has(entry.symbol)) {
      this.temporalPatterns.set(entry.symbol, []);
    }
    this.temporalPatterns.get(entry.symbol)!.push(entry.timestamp);
  }

  private updatePatternRecognition(entry: SymbolEntry): void {
    if (entry.vectorEmbedding) {
      this.patternVector.set(entry.symbol, entry.vectorEmbedding);
    }
  }

  private triggerAnalysisUpdate(): void {
    this.updateTrendAnalysis();
    this.detectConvergences();
    this.generateEmergencePredictions();
  }

  // Enhanced trend analysis with elemental distribution
  private updateTrendAnalysis(): void {
    const timeWindows = [
      { name: '6h', duration: 21600000 },
      { name: '24h', duration: 86400000 },
      { name: '7d', duration: 604800000 },
      { name: '30d', duration: 2592000000 }
    ];

    this.trendAnalysis = [];

    this.archetypeMap.forEach((symbolMap, archetype) => {
      timeWindows.forEach(window => {
        const cutoff = Date.now() - window.duration;
        const recentEntries = this.symbolLog.filter(entry => 
          entry.archetype === archetype && entry.timestamp > cutoff
        );

        if (recentEntries.length > 0) {
          const intensity = recentEntries.reduce((sum, e) => sum + e.intensity, 0) / recentEntries.length;
          const associatedSymbols = [...new Set(recentEntries.map(e => e.symbol))];
          
          // Calculate elemental distribution
          const elementalDistribution: Partial<Record<ElementalType, number>> = {};
          recentEntries.forEach(entry => {
            if (entry.elementalResonance) {
              elementalDistribution[entry.elementalResonance] = 
                (elementalDistribution[entry.elementalResonance] || 0) + 1;
            }
          });

          // Calculate trend direction with more sophisticated analysis
          const trend = this.calculateTrendDirection(recentEntries, window.duration);
          const influenceScore = Math.min(1, (recentEntries.length / 100) * intensity);
          
          // Predict evolution
          const predictedEvolution = this.predictArchetypalEvolution(archetype, trend, intensity);
          
          // Calculate collective threshold
          const collectiveThreshold = this.calculateCollectiveThreshold(recentEntries);

          this.trendAnalysis.push({
            archetype,
            trend,
            intensity,
            associatedSymbols,
            timeWindow: window.name,
            influenceScore,
            elementalDistribution,
            predictedEvolution,
            collectiveThreshold
          });
        }
      });
    });
  }

  private calculateTrendDirection(entries: SymbolEntry[], windowDuration: number): ArchetypalTrend['trend'] {
    const midpoint = entries[0].timestamp + (windowDuration / 2);
    const firstHalf = entries.filter(e => e.timestamp < midpoint);
    const secondHalf = entries.filter(e => e.timestamp >= midpoint);
    
    const firstIntensity = firstHalf.reduce((sum, e) => sum + e.intensity, 0) / firstHalf.length || 0;
    const secondIntensity = secondHalf.reduce((sum, e) => sum + e.intensity, 0) / secondHalf.length || 0;
    
    const intensityRatio = secondIntensity / (firstIntensity || 0.1);
    const countRatio = secondHalf.length / (firstHalf.length || 1);
    
    if (intensityRatio > 1.5 && countRatio > 1.3) return 'emerging';
    if (intensityRatio < 0.7 && countRatio < 0.8) return 'declining';
    if (secondIntensity > 0.8 && new Set(secondHalf.map(e => e.symbol)).size > 5) return 'transforming';
    return 'stable';
  }

  private predictArchetypalEvolution(archetype: string, trend: string, intensity: number): string {
    if (trend === 'emerging' && intensity > 0.7) {
      return `${archetype} entering phase of collective activation - expect breakthrough insights`;
    } else if (trend === 'transforming') {
      return `${archetype} undergoing metamorphosis - integration of shadow aspects likely`;
    } else if (trend === 'declining' && intensity < 0.3) {
      return `${archetype} energy withdrawing - period of rest and regeneration`;
    }
    return `${archetype} maintaining natural rhythm - steady influence on collective field`;
  }

  private calculateCollectiveThreshold(entries: SymbolEntry[]): number {
    const uniqueUsers = new Set(entries.map(e => e.userId)).size;
    const avgIntensity = entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length;
    const synchronicityMarkers = entries.filter(e => e.synchronicityMarker).length;
    
    return Math.min(1, (uniqueUsers / 20) * avgIntensity * (1 + synchronicityMarkers / entries.length));
  }

  // Enhanced emergence prediction with VAE patterns
  private generateEmergencePredictions(): void {
    const recentWindow = 48 * 60 * 60 * 1000; // 48 hours
    const cutoff = Date.now() - recentWindow;
    const recentEntries = this.symbolLog.filter(e => e.timestamp > cutoff);
    
    this.emergencePredictions = [];
    
    // Analyze symbol velocity and intensity patterns
    const symbolVelocity = new Map<string, number>();
    const symbolIntensityTrend = new Map<string, number[]>();
    
    recentEntries.forEach(entry => {
      // Calculate velocity (frequency over time)
      const velocity = symbolVelocity.get(entry.symbol) || 0;
      symbolVelocity.set(entry.symbol, velocity + 1);
      
      // Track intensity trend
      if (!symbolIntensityTrend.has(entry.symbol)) {
        symbolIntensityTrend.set(entry.symbol, []);
      }
      symbolIntensityTrend.get(entry.symbol)!.push(entry.intensity);
    });
    
    // Generate predictions for high-velocity, high-intensity symbols
    symbolVelocity.forEach((velocity, symbol) => {
      const intensities = symbolIntensityTrend.get(symbol) || [];
      const avgIntensity = intensities.reduce((sum, i) => sum + i, 0) / intensities.length;
      const intensityGrowth = this.calculateIntensityGrowth(intensities);
      
      if (velocity > 3 && avgIntensity > 0.6 && intensityGrowth > 0.1) {
        const relatedEntries = recentEntries.filter(e => e.symbol === symbol);
        const dominantArchetype = this.getDominantArchetype(relatedEntries);
        
        const prediction: EmergencePrediction = {
          symbol,
          archetype: dominantArchetype,
          probability: Math.min(0.95, (velocity / 10) * avgIntensity * (1 + intensityGrowth)),
          timeframe: velocity > 8 ? 'hours' : velocity > 5 ? 'days' : 'weeks',
          triggerConditions: this.identifyTriggerConditions(relatedEntries),
          potentialImpact: this.assessPotentialImpact(symbol, velocity, avgIntensity),
          recommendedActions: this.generateRecommendations(symbol, dominantArchetype)
        };
        
        this.emergencePredictions.push(prediction);
      }
    });
    
    // Sort by probability and keep top predictions
    this.emergencePredictions = this.emergencePredictions
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 10);
  }

  private calculateIntensityGrowth(intensities: number[]): number {
    if (intensities.length < 2) return 0;
    const midpoint = Math.floor(intensities.length / 2);
    const firstHalf = intensities.slice(0, midpoint);
    const secondHalf = intensities.slice(midpoint);
    
    const firstAvg = firstHalf.reduce((sum, i) => sum + i, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, i) => sum + i, 0) / secondHalf.length;
    
    return (secondAvg - firstAvg) / firstAvg;
  }

  private getDominantArchetype(entries: SymbolEntry[]): string {
    const archetypeCounts = new Map<string, number>();
    entries.forEach(entry => {
      archetypeCounts.set(entry.archetype, (archetypeCounts.get(entry.archetype) || 0) + 1);
    });
    
    return [...archetypeCounts.entries()]
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
  }

  private identifyTriggerConditions(entries: SymbolEntry[]): string[] {
    const conditions = [];
    
    if (entries.some(e => e.synchronicityMarker)) {
      conditions.push('Synchronicity activation');
    }
    
    const phases = new Set(entries.map(e => e.phase));
    if (phases.size > 1) {
      conditions.push('Cross-phase resonance');
    }
    
    const elements = new Set(entries.map(e => e.elementalResonance).filter(Boolean));
    if (elements.size > 2) {
      conditions.push('Multi-elemental convergence');
    }
    
    if (entries.filter(e => e.dreamSource).length > entries.length * 0.6) {
      conditions.push('Dream realm activation');
    }
    
    return conditions.length > 0 ? conditions : ['Natural emergence pattern'];
  }

  private assessPotentialImpact(symbol: string, velocity: number, intensity: number): 'personal' | 'collective' | 'universal' {
    const impact = velocity * intensity;
    if (impact > 8) return 'universal';
    if (impact > 5) return 'collective';
    return 'personal';
  }

  private generateRecommendations(symbol: string, archetype: string): string[] {
    const recommendations = [];
    
    // Symbol-specific recommendations
    if (symbol.includes('fire') || symbol.includes('flame')) {
      recommendations.push('Engage in creative practices', 'Take bold action on pending projects');
    } else if (symbol.includes('water') || symbol.includes('ocean')) {
      recommendations.push('Practice emotional release', 'Engage in flow activities');
    } else if (symbol.includes('earth') || symbol.includes('mountain')) {
      recommendations.push('Ground through nature connection', 'Focus on practical manifestation');
    } else if (symbol.includes('air') || symbol.includes('wind')) {
      recommendations.push('Clarify communication', 'Practice mindfulness meditation');
    }
    
    // Archetype-specific recommendations
    if (archetype.includes('Phoenix')) {
      recommendations.push('Embrace transformation', 'Release what no longer serves');
    } else if (archetype.includes('Tree')) {
      recommendations.push('Establish roots', 'Connect with ancestral wisdom');
    } else if (archetype.includes('Bridge')) {
      recommendations.push('Facilitate connections', 'Bridge opposing perspectives');
    }
    
    return recommendations.length > 0 ? recommendations : ['Stay present to emerging patterns'];
  }

  // Generate simple symbol embedding (placeholder for actual VAE)
  private generateSymbolEmbedding(symbol: string, context?: string): number[] {
    // Simplified embedding based on symbol characteristics
    const embedding = new Array(64).fill(0);
    
    // Hash symbol to create consistent embedding
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
      hash = ((hash << 5) - hash + symbol.charCodeAt(i)) & 0xffffffff;
    }
    
    // Fill embedding with pseudo-random values based on hash
    for (let i = 0; i < 64; i++) {
      embedding[i] = (Math.sin(hash + i) + 1) / 2;
    }
    
    // Modify based on context if available
    if (context) {
      let contextHash = 0;
      for (let i = 0; i < context.length; i++) {
        contextHash = ((contextHash << 3) - contextHash + context.charCodeAt(i)) & 0xffffffff;
      }
      
      for (let i = 0; i < 64; i++) {
        embedding[i] = (embedding[i] + (Math.sin(contextHash + i) + 1) / 2) / 2;
      }
    }
    
    return embedding;
  }

  // Enhanced convergence detection with mythic pattern recognition
  private detectConvergences(): void {
    const timeWindow = 604800000; // 7 days
    const cutoff = Date.now() - timeWindow;
    
    const recentEntries = this.symbolLog.filter(entry => entry.timestamp > cutoff);
    
    // Enhanced grouping by symbol, archetype, and mythic pattern
    const convergenceGroups = new Map<string, SymbolEntry[]>();
    
    recentEntries.forEach(entry => {
      const mythicPattern = this.identifyMythicPattern(entry.symbol);
      const key = `${entry.symbol}-${entry.archetype}-${mythicPattern}`;
      
      if (!convergenceGroups.has(key)) {
        convergenceGroups.set(key, []);
      }
      convergenceGroups.get(key)!.push(entry);
    });

    // Process convergences with enhanced criteria
    convergenceGroups.forEach((entries, key) => {
      const uniqueUsers = new Set(entries.map(e => e.userId)).size;
      
      if (uniqueUsers >= 2) { // Lowered threshold for more sensitive detection
        const averageIntensity = entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length;
        const synchronicityCount = entries.filter(e => e.synchronicityMarker).length;
        
        if (averageIntensity > 0.5 || synchronicityCount > 0) {
          const convergenceStrength = this.calculateConvergenceStrength(entries, uniqueUsers);
          const sharedSymbols = [...new Set(entries.map(e => e.symbol))];
          const sharedArchetypes = [...new Set(entries.map(e => e.archetype))];
          
          // Calculate elemental clusters
          const elementalClusters: Partial<Record<ElementalType, number>> = {};
          entries.forEach(entry => {
            if (entry.elementalResonance) {
              elementalClusters[entry.elementalResonance] = 
                (elementalClusters[entry.elementalResonance] || 0) + 1;
            }
          });

          const convergence: DreamConvergence = {
            convergenceId: `conv_${Date.now()}_${key}`,
            participatingUsers: uniqueUsers,
            sharedSymbols,
            sharedArchetypes,
            convergenceStrength,
            timeWindow: [Math.min(...entries.map(e => e.timestamp)), Date.now()],
            elementalClusters,
            emergentMessage: this.generateEnhancedConvergenceMessage(entries, sharedSymbols, sharedArchetypes),
            guidanceForField: this.generateEnhancedFieldGuidance(entries, convergenceStrength),
            predictedOutcome: this.predictConvergenceOutcome(entries, convergenceStrength),
            mythicSignificance: this.assessMythicSignificance(entries)
          };

          this.convergenceHistory.push(convergence);
        }
      }
    });

    // Cleanup and maintain history
    this.convergenceHistory = this.convergenceHistory
      .filter(conv => conv.timeWindow[1] > cutoff)
      .slice(-100); // Keep last 100 convergences
  }

  private calculateConvergenceStrength(entries: SymbolEntry[], uniqueUsers: number): number {
    const averageIntensity = entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length;
    const synchronicityBonus = entries.filter(e => e.synchronicityMarker).length / entries.length;
    const crossElementalBonus = new Set(entries.map(e => e.elementalResonance).filter(Boolean)).size / 5;
    
    return Math.min(1, (uniqueUsers / 15) * averageIntensity * (1 + synchronicityBonus) * (1 + crossElementalBonus));
  }

  private identifyMythicPattern(symbol: string): string {
    for (const [pattern, symbols] of this.mythicPatternDetector.entries()) {
      if (symbols.some(s => symbol.toLowerCase().includes(s.toLowerCase()))) {
        return pattern;
      }
    }
    return 'Universal';
  }

  private generateEnhancedConvergenceMessage(entries: SymbolEntry[], symbols: string[], archetypes: string[]): string {
    const primarySymbol = symbols[0];
    const primaryArchetype = archetypes[0];
    const mythicPattern = this.identifyMythicPattern(primarySymbol);
    const synchronicityCount = entries.filter(e => e.synchronicityMarker).length;
    
    let message = `The ${primarySymbol} emerges across multiple consciousness streams, carrying ${primaryArchetype} energy`;
    
    if (mythicPattern !== 'Universal') {
      message += ` within the ${mythicPattern} mythic pattern`;
    }
    
    if (synchronicityCount > 0) {
      message += `, with ${synchronicityCount} synchronicity markers indicating heightened collective significance`;
    }
    
    message += '. This convergence suggests a threshold moment in the collective journey.';
    
    return message;
  }

  private generateEnhancedFieldGuidance(entries: SymbolEntry[], strength: number): string {
    const elementalDistribution = new Map<ElementalType, number>();
    entries.forEach(entry => {
      if (entry.elementalResonance) {
        elementalDistribution.set(
          entry.elementalResonance,
          (elementalDistribution.get(entry.elementalResonance) || 0) + 1
        );
      }
    });
    
    const dominantElement = [...elementalDistribution.entries()]
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    if (strength > 0.8) {
      return `Powerful collective threshold detected. ${dominantElement ? `${dominantElement} element dominant - ` : ''}This pattern calls for deep attention and may herald significant collective transformation. Prepare for breakthrough insights and integration work.`;
    } else if (strength > 0.6) {
      return `Significant collective resonance emerging. ${dominantElement ? `${dominantElement} energy leads - ` : ''}This convergence offers guidance for those ready to receive it. Consider personal practices aligned with these emerging themes.`;
    } else {
      return `Gentle collective weaving detected. ${dominantElement ? `${dominantElement} influence present - ` : ''}These symbols carry medicine for sensitive souls. Stay open to subtle guidance and synchronicities.`;
    }
  }

  private predictConvergenceOutcome(entries: SymbolEntry[], strength: number): string {
    const phases = new Set(entries.map(e => e.phase));
    const hasTransformation = phases.has('transformation') || phases.has('integration');
    
    if (strength > 0.8 && hasTransformation) {
      return 'Collective breakthrough likely within 7-14 days';
    } else if (strength > 0.6) {
      return 'Gradual collective shift expected over 2-4 weeks';
    } else {
      return 'Subtle influence on collective field over 1-2 months';
    }
  }

  private assessMythicSignificance(entries: SymbolEntry[]): string {
    const mythicPatterns = new Set(entries.map(e => this.identifyMythicPattern(e.symbol)));
    
    if (mythicPatterns.has('Death-Rebirth') && mythicPatterns.has('Creation')) {
      return 'Phoenix cycle - death and rebirth converging with new creation';
    } else if (mythicPatterns.has('Sacred Union') && mythicPatterns.has('Transcendence')) {
      return 'Hieros Gamos - sacred marriage leading to transcendence';
    } else if (mythicPatterns.has('Journey') && mythicPatterns.has('Shadow Integration')) {
      return 'Hero\'s journey - confronting shadow for wholeness';
    } else if (mythicPatterns.size > 2) {
      return `Multi-dimensional mythic activation - ${[...mythicPatterns].join(', ')} patterns converging`;
    }
    
    return 'Universal archetypal activation';
  }

  // Enhanced field report generation
  generateFieldReport(): FieldReport {
    const recentTrends = this.getArchetypalTrends('24h');
    const recentConvergences = this.getRecentConvergences(5);
    const trendingSymbols = this.getTrendingSymbols(8, 86400000);
    const predictions = this.getEmergencePredictions(5);
    
    // Calculate elemental balance
    const elementalBalance = this.calculateElementalBalance();
    
    // Determine field state
    const fieldState = this.determineFieldState(recentTrends, recentConvergences, trendingSymbols);
    
    const dominantArchetypes = recentTrends
      .filter(t => t.influenceScore > 0.3)
      .slice(0, 3)
      .map(t => t.archetype);

    const emergentSymbols = trendingSymbols
      .filter(s => s.universalRelevance > 0.4)
      .slice(0, 6)
      .map(s => s.symbol);

    const collectiveGuidance = this.generateCollectiveGuidance(fieldState, dominantArchetypes, emergentSymbols, elementalBalance);
    const mythicActivation = this.assessCurrentMythicActivation();
    const practicalActions = this.generatePracticalActions(fieldState, dominantArchetypes);

    return {
      fieldState,
      dominantArchetypes,
      emergentSymbols,
      elementalBalance,
      collectiveGuidance,
      convergenceCount: recentConvergences.length,
      predictions,
      mythicActivation,
      practicalActions
    };
  }

  private calculateElementalBalance(): Record<ElementalType, number> {
    const recentEntries = this.symbolLog.filter(e => e.timestamp > Date.now() - 86400000);
    const balance: Record<ElementalType, number> = {
      fire: 0, water: 0, earth: 0, air: 0, aether: 0
    };
    
    const totalEntries = recentEntries.length || 1;
    
    recentEntries.forEach(entry => {
      if (entry.elementalResonance) {
        balance[entry.elementalResonance]++;
      }
    });
    
    // Normalize to percentages
    Object.keys(balance).forEach(key => {
      balance[key as ElementalType] = balance[key as ElementalType] / totalEntries;
    });
    
    return balance;
  }

  private determineFieldState(
    trends: ArchetypalTrend[], 
    convergences: DreamConvergence[], 
    symbols: CollectiveResonance[]
  ): FieldReport['fieldState'] {
    const emergingCount = trends.filter(t => t.trend === 'emerging').length;
    const transformingCount = trends.filter(t => t.trend === 'transforming').length;
    const highResonanceCount = symbols.filter(s => s.universalRelevance > 0.8).length;
    const strongConvergences = convergences.filter(c => c.convergenceStrength > 0.7).length;
    
    if (highResonanceCount >= 2 && emergingCount >= 2) return 'transcendence';
    if (transformingCount >= 2 || strongConvergences >= 2) return 'transformation';
    if (highResonanceCount >= 1 || emergingCount >= 1) return 'emergence';
    if (convergences.length >= 2) return 'convergence';
    return 'stable';
  }

  private generateCollectiveGuidance(
    fieldState: string,
    archetypes: string[],
    symbols: string[],
    elementalBalance: Record<ElementalType, number>
  ): string {
    const dominantElement = Object.entries(elementalBalance)
      .sort(([,a], [,b]) => b - a)[0][0] as ElementalType;
    
    let guidance = '';
    
    switch (fieldState) {
      case 'transcendence':
        guidance = `The collective field pulses with transcendent energy. ${archetypes[0]} and ${archetypes[1]} archetypes converge, suggesting a rare moment of collective awakening. `;
        break;
      case 'transformation':
        guidance = `Deep transformation moves through the collective unconscious. The ${archetypes[0]} archetype leads this metamorphosis. `;
        break;
      case 'emergence':
        guidance = `New patterns emerge from the depths of collective dreaming. The ${symbols[0]} symbol carries particular significance for this creative emergence. `;
        break;
      case 'convergence':
        guidance = `Multiple consciousness streams converge, creating shared learning opportunities. The appearance of ${symbols[0]} suggests collective themes ready for integration. `;
        break;
      default:
        guidance = `The collective field flows in natural rhythm. The ${archetypes[0]} energy provides steady guidance. `;
    }
    
    guidance += `${dominantElement.charAt(0).toUpperCase() + dominantElement.slice(1)} element dominates (${Math.round(elementalBalance[dominantElement] * 100)}%), offering ${this.getElementalGuidance(dominantElement)}.`;
    
    return guidance;
  }

  private getElementalGuidance(element: ElementalType): string {
    switch (element) {
      case 'fire': return 'creative activation and breakthrough catalyst';
      case 'water': return 'emotional depth and intuitive flow';
      case 'earth': return 'grounding stability and practical manifestation';
      case 'air': return 'mental clarity and inspired communication';
      case 'aether': return 'transcendent perspective and unity consciousness';
    }
  }

  private assessCurrentMythicActivation(): string {
    const recentSymbols = this.symbolLog
      .filter(e => e.timestamp > Date.now() - 86400000)
      .map(e => e.symbol);
    
    const activePatterns = new Set<string>();
    
    this.mythicPatternDetector.forEach((symbols, pattern) => {
      const matches = symbols.filter(s => 
        recentSymbols.some(rs => rs.toLowerCase().includes(s.toLowerCase()))
      );
      
      if (matches.length >= 2) {
        activePatterns.add(pattern);
      }
    });
    
    if (activePatterns.size === 0) return 'Universal field maintaining natural rhythm';
    if (activePatterns.size === 1) return `${[...activePatterns][0]} mythic pattern active`;
    return `Multi-dimensional activation: ${[...activePatterns].join(', ')} patterns converging`;
  }

  private generatePracticalActions(fieldState: string, archetypes: string[]): string[] {
    const actions = [];
    
    switch (fieldState) {
      case 'transcendence':
        actions.push('Engage in transcendent practices (meditation, ceremony)', 'Create space for non-ordinary states', 'Document insights and visions');
        break;
      case 'transformation':
        actions.push('Embrace change and release old patterns', 'Seek guidance from mentors or wise teachers', 'Practice integration techniques');
        break;
      case 'emergence':
        actions.push('Pay attention to dreams and synchronicities', 'Express creativity through art or writing', 'Connect with others experiencing similar patterns');
        break;
      case 'convergence':
        actions.push('Share experiences with trusted community', 'Look for patterns in personal experiences', 'Practice grounding techniques');
        break;
      default:
        actions.push('Maintain daily spiritual practices', 'Stay present to subtle guidance', 'Trust natural rhythms');
    }
    
    // Add archetype-specific actions
    if (archetypes.includes('Phoenix')) {
      actions.push('Practice letting go rituals');
    }
    if (archetypes.includes('Bridge')) {
      actions.push('Facilitate healing conversations');
    }
    if (archetypes.includes('Tree')) {
      actions.push('Connect with ancestral wisdom');
    }
    
    return actions.slice(0, 5); // Limit to 5 practical actions
  }

  // Public API methods
  getTrendingSymbols(limit: number = 10, timeWindow?: number): CollectiveResonance[] {
    const cutoff = timeWindow ? Date.now() - timeWindow : 0;
    
    const resonances: CollectiveResonance[] = [];

    this.collectivePulse.forEach((frequency, symbol) => {
      const symbolEntries = this.symbolLog.filter(entry => 
        entry.symbol === symbol && entry.timestamp > cutoff
      );

      if (symbolEntries.length === 0) return;

      const phases = new Set(symbolEntries.map(e => e.phase));
      const crossPhaseAppearance = phases.size > 1;
      
      const averageIntensity = symbolEntries.reduce((sum, e) => sum + e.intensity, 0) / symbolEntries.length;
      const universalRelevance = Math.min(1, (phases.size / 5) * averageIntensity);

      // Enhanced pattern detection
      const emergentPattern = frequency > 5 && crossPhaseAppearance ? 
        this.detectSymbolicPattern(symbol, symbolEntries) : undefined;
      
      const elementalAffinity = this.getElementalAffinity(symbolEntries);
      const archetypalCore = this.getArchetypalCore(symbolEntries);
      const temporalSig = this.analyzeTemporalSignature(symbol);
      const mythicResonance = this.calculateMythicResonance(symbol);

      resonances.push({
        symbol,
        resonanceFrequency: frequency,
        crossPhaseAppearance,
        universalRelevance,
        emergentPattern,
        elementalAffinity,
        archetypalCore,
        temporalSig,
        mythicResonance
      });
    });

    return resonances
      .sort((a, b) => (b.universalRelevance * (b.mythicResonance || 0.5)) - (a.universalRelevance * (a.mythicResonance || 0.5)))
      .slice(0, limit);
  }

  private getElementalAffinity(entries: SymbolEntry[]): ElementalType | undefined {
    const elementCounts = new Map<ElementalType, number>();
    
    entries.forEach(entry => {
      if (entry.elementalResonance) {
        elementCounts.set(entry.elementalResonance, (elementCounts.get(entry.elementalResonance) || 0) + 1);
      }
    });
    
    if (elementCounts.size === 0) return undefined;
    
    return [...elementCounts.entries()]
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  private getArchetypalCore(entries: SymbolEntry[]): string {
    const archetypeCounts = new Map<string, number>();
    
    entries.forEach(entry => {
      archetypeCounts.set(entry.archetype, (archetypeCounts.get(entry.archetype) || 0) + 1);
    });
    
    return [...archetypeCounts.entries()]
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Universal';
  }

  private analyzeTemporalSignature(symbol: string): CollectiveResonance['temporalSig'] {
    const timestamps = this.temporalPatterns.get(symbol) || [];
    if (timestamps.length < 3) return 'linear';
    
    // Analyze distribution patterns
    const intervals = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i-1]);
    }
    
    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    // Classify temporal pattern
    if (stdDev < avgInterval * 0.2) return 'cyclical';
    if (intervals.some(i => i < avgInterval * 0.1)) return 'explosive';
    if (intervals.length > 5 && this.detectSpiralPattern(intervals)) return 'spiral';
    return 'linear';
  }

  private detectSpiralPattern(intervals: number[]): boolean {
    // Simple spiral detection: intervals that increase then decrease in a pattern
    let increasing = 0;
    let decreasing = 0;
    
    for (let i = 1; i < intervals.length; i++) {
      if (intervals[i] > intervals[i-1]) increasing++;
      else if (intervals[i] < intervals[i-1]) decreasing++;
    }
    
    // Spiral if we have both increasing and decreasing trends
    return increasing > 1 && decreasing > 1;
  }

  private calculateMythicResonance(symbol: string): number {
    let resonance = 0;
    let matches = 0;
    
    this.mythicPatternDetector.forEach((symbols, pattern) => {
      const symbolMatches = symbols.filter(s => 
        symbol.toLowerCase().includes(s.toLowerCase())
      ).length;
      
      if (symbolMatches > 0) {
        resonance += symbolMatches / symbols.length;
        matches++;
      }
    });
    
    return matches > 0 ? Math.min(1, resonance / matches) : 0.5;
  }

  private detectSymbolicPattern(symbol: string, entries: SymbolEntry[]): string {
    const contexts = entries.map(e => e.context).filter(Boolean);
    const phases = [...new Set(entries.map(e => e.phase))];
    const avgIntensity = entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length;
    const mythicPattern = this.identifyMythicPattern(symbol);
    
    if (mythicPattern !== 'Universal') {
      return `${symbol} activating ${mythicPattern} mythic pattern across ${phases.length} phases`;
    } else if (phases.includes('initiation') && phases.includes('transformation')) {
      return `${symbol} bridging initiation and transformation - threshold symbol`;
    } else if (avgIntensity > 0.8) {
      return `${symbol} carries high sacred intensity across collective field`;
    } else if (entries.some(e => e.synchronicityMarker)) {
      return `${symbol} manifesting as synchronicity catalyst in collective experience`;
    }

    return `${symbol} showing significant collective resonance pattern`;
  }

  getRecentConvergences(limit: number = 5): DreamConvergence[] {
    return this.convergenceHistory
      .sort((a, b) => b.convergenceStrength - a.convergenceStrength)
      .slice(0, limit);
  }

  getArchetypalTrends(timeWindow: string = '7d'): ArchetypalTrend[] {
    return this.trendAnalysis
      .filter(trend => trend.timeWindow === timeWindow)
      .sort((a, b) => b.influenceScore - a.influenceScore);
  }

  getEmergencePredictions(limit: number = 5): EmergencePrediction[] {
    return this.emergencePredictions.slice(0, limit);
  }

  // Cleanup method with enhanced memory management
  cleanup(maxAge: number = 2592000000): void { // 30 days default
    const cutoff = Date.now() - maxAge;
    
    this.symbolLog = this.symbolLog.filter(entry => entry.timestamp > cutoff);
    this.convergenceHistory = this.convergenceHistory.filter(conv => conv.timeWindow[1] > cutoff);
    
    // Rebuild all mappings from filtered data
    this.rebuildMappings();
  }

  private rebuildMappings(): void {
    this.archetypeMap.clear();
    this.phaseClusters.clear();
    this.elementalClusters.clear();
    this.collectivePulse.clear();
    this.temporalPatterns.clear();
    this.patternVector.clear();
    
    this.initializeFrameworks();
    
    this.symbolLog.forEach(entry => {
      this.updateMappings(entry);
      if (entry.vectorEmbedding) {
        this.patternVector.set(entry.symbol, entry.vectorEmbedding);
      }
    });
  }
}