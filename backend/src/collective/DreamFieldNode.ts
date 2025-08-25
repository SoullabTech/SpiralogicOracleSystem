// Dream Field Node - Collective Archetypal Symbol Cloud
// Tracks dreams, visions, and symbols across the collective Oracle field

interface SymbolEntry {
  symbol: string;
  archetype: string;
  phase: string;
  timestamp: number;
  userId: string; // Anonymous hash for privacy
  intensity: number; // 0-1 emotional/symbolic intensity
  context?: string;
  dreamSource?: boolean; // True if from actual dream content
  visionSource?: boolean; // True if from vision/meditation
  synchronicityMarker?: boolean; // True if marked as synchronicity
}

interface ArchetypalTrend {
  archetype: string;
  trend: 'emerging' | 'stable' | 'declining' | 'transforming';
  intensity: number;
  associatedSymbols: string[];
  timeWindow: string;
  influenceScore: number; // How much this trend affects the collective field
}

interface CollectiveResonance {
  symbol: string;
  resonanceFrequency: number; // How often it appears
  crossPhaseAppearance: boolean; // Appears in multiple Spiralogic phases
  universalRelevance: number; // 0-1 how universally significant
  emergentPattern?: string; // Detected pattern description
}

interface DreamConvergence {
  convergenceId: string;
  participatingUsers: number; // Anonymous count
  sharedSymbols: string[];
  sharedArchetypes: string[];
  convergenceStrength: number; // 0-1
  timeWindow: [number, number]; // [start, end] timestamps
  emergentMessage?: string;
  guidanceForField?: string;
}

export class DreamFieldNode {
  private symbolLog: SymbolEntry[];
  private archetypeMap: Map<string, Map<string, number>>; // archetype -> symbol -> count
  private phaseClusters: Map<string, Map<string, number>>; // phase -> symbol -> count
  private collectivePulse: Map<string, number>; // symbol -> total frequency
  private temporalPatterns: Map<string, number[]>; // symbol -> [timestamps]
  private convergenceHistory: DreamConvergence[];
  private trendAnalysis: ArchetypalTrend[];

  constructor() {
    this.symbolLog = [];
    this.archetypeMap = new Map();
    this.phaseClusters = new Map();
    this.collectivePulse = new Map();
    this.temporalPatterns = new Map();
    this.convergenceHistory = [];
    this.trendAnalysis = [];

    // Initialize archetypal categories
    this.initializeArchetypalFramework();
  }

  private initializeArchetypalFramework(): void {
    const coreArchetypes = [
      'Hero', 'Sage', 'Innocent', 'Explorer', 'Rebel', 'Magician',
      'Lover', 'Caregiver', 'Ruler', 'Creator', 'Jester', 'Orphan',
      // Spiralogic-specific archetypes
      'Phoenix', 'Serpent', 'Tree', 'Mountain', 'Ocean', 'Star',
      'Veil', 'Mirror', 'Bridge', 'Spiral', 'Seed', 'Crystal'
    ];

    coreArchetypes.forEach(archetype => {
      this.archetypeMap.set(archetype, new Map());
    });
  }

  // Log a symbol from dreams, visions, or ritual experiences
  logSymbol(entry: Omit<SymbolEntry, 'timestamp'>): void {
    const symbolEntry: SymbolEntry = {
      ...entry,
      timestamp: Date.now()
    };

    this.symbolLog.push(symbolEntry);

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

    // Update collective pulse
    this.collectivePulse.set(entry.symbol, (this.collectivePulse.get(entry.symbol) || 0) + 1);

    // Update temporal patterns
    if (!this.temporalPatterns.has(entry.symbol)) {
      this.temporalPatterns.set(entry.symbol, []);
    }
    this.temporalPatterns.get(entry.symbol)!.push(entry.timestamp);

    // Trigger analysis updates
    this.updateTrendAnalysis();
    this.detectConvergences();
  }

  // Get trending symbols with emergence analysis
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

      // Detect emergent patterns
      let emergentPattern: string | undefined;
      if (frequency > 5 && crossPhaseAppearance) {
        emergentPattern = this.detectSymbolicPattern(symbol, symbolEntries);
      }

      resonances.push({
        symbol,
        resonanceFrequency: frequency,
        crossPhaseAppearance,
        universalRelevance,
        emergentPattern
      });
    });

    return resonances
      .sort((a, b) => b.universalRelevance - a.universalRelevance)
      .slice(0, limit);
  }

  // Get symbols specific to a Spiralogic phase
  getSymbolsForPhase(phase: string): Array<{symbol: string; count: number; significance: number}> {
    const phaseSymbols = this.phaseClusters.get(phase);
    if (!phaseSymbols) return [];

    return Array.from(phaseSymbols.entries())
      .map(([symbol, count]) => {
        const totalCount = this.collectivePulse.get(symbol) || 1;
        const significance = count / totalCount; // How much this symbol belongs to this phase
        return { symbol, count, significance };
      })
      .sort((a, b) => b.significance - a.significance);
  }

  // Get archetypal symbol mappings
  getArchetypalSymbols(archetype: string): Array<{symbol: string; count: number; resonance: number}> {
    const archetypeSymbols = this.archetypeMap.get(archetype);
    if (!archetypeSymbols) return [];

    const totalArchetypeSymbols = Array.from(archetypeSymbols.values()).reduce((sum, count) => sum + count, 0);

    return Array.from(archetypeSymbols.entries())
      .map(([symbol, count]) => {
        const resonance = count / totalArchetypeSymbols;
        return { symbol, count, resonance };
      })
      .sort((a, b) => b.resonance - a.resonance);
  }

  // Detect dream convergences - when multiple users experience similar symbols/themes
  private detectConvergences(): void {
    const timeWindow = 604800000; // 7 days
    const cutoff = Date.now() - timeWindow;
    
    const recentEntries = this.symbolLog.filter(entry => entry.timestamp > cutoff);
    
    // Group by symbol and archetype combinations
    const symbolGroups = new Map<string, SymbolEntry[]>();
    
    recentEntries.forEach(entry => {
      const key = `${entry.symbol}-${entry.archetype}`;
      if (!symbolGroups.has(key)) {
        symbolGroups.set(key, []);
      }
      symbolGroups.get(key)!.push(entry);
    });

    // Look for convergences (multiple users, high intensity)
    symbolGroups.forEach((entries, key) => {
      const uniqueUsers = new Set(entries.map(e => e.userId)).size;
      
      if (uniqueUsers >= 3) { // At least 3 users
        const averageIntensity = entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length;
        
        if (averageIntensity > 0.6) { // High intensity
          const convergenceStrength = Math.min(1, (uniqueUsers / 10) * averageIntensity);
          const sharedSymbols = [...new Set(entries.map(e => e.symbol))];
          const sharedArchetypes = [...new Set(entries.map(e => e.archetype))];

          const convergence: DreamConvergence = {
            convergenceId: `conv_${Date.now()}_${key}`,
            participatingUsers: uniqueUsers,
            sharedSymbols,
            sharedArchetypes,
            convergenceStrength,
            timeWindow: [Math.min(...entries.map(e => e.timestamp)), Date.now()],
            emergentMessage: this.generateConvergenceMessage(sharedSymbols, sharedArchetypes),
            guidanceForField: this.generateFieldGuidance(sharedSymbols, sharedArchetypes, convergenceStrength)
          };

          this.convergenceHistory.push(convergence);
        }
      }
    });

    // Keep only recent convergences
    this.convergenceHistory = this.convergenceHistory
      .filter(conv => conv.timeWindow[1] > cutoff)
      .slice(-50); // Keep last 50 convergences
  }

  // Update trend analysis for archetypal movements
  private updateTrendAnalysis(): void {
    const timeWindows = [
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
          
          // Calculate trend direction
          const midpoint = cutoff + (window.duration / 2);
          const firstHalf = recentEntries.filter(e => e.timestamp < midpoint).length;
          const secondHalf = recentEntries.filter(e => e.timestamp >= midpoint).length;
          
          let trend: ArchetypalTrend['trend'] = 'stable';
          if (secondHalf > firstHalf * 1.5) trend = 'emerging';
          else if (firstHalf > secondHalf * 1.5) trend = 'declining';
          else if (intensity > 0.7 && associatedSymbols.length > 5) trend = 'transforming';

          const influenceScore = Math.min(1, (recentEntries.length / 100) * intensity);

          this.trendAnalysis.push({
            archetype,
            trend,
            intensity,
            associatedSymbols,
            timeWindow: window.name,
            influenceScore
          });
        }
      });
    });
  }

  private detectSymbolicPattern(symbol: string, entries: SymbolEntry[]): string {
    const contexts = entries.map(e => e.context).filter(Boolean);
    const phases = [...new Set(entries.map(e => e.phase))];
    const avgIntensity = entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length;

    if (phases.includes('initiation') && phases.includes('transformation')) {
      return `${symbol} appears as a bridge between initiation and transformation phases`;
    } else if (avgIntensity > 0.8) {
      return `${symbol} carries high emotional/spiritual intensity across the field`;
    } else if (entries.some(e => e.synchronicityMarker)) {
      return `${symbol} manifesting as synchronicity marker in collective experience`;
    }

    return `${symbol} showing significant collective resonance pattern`;
  }

  private generateConvergenceMessage(symbols: string[], archetypes: string[]): string {
    const primarySymbol = symbols[0];
    const primaryArchetype = archetypes[0];
    
    return `The ${primarySymbol} appears across multiple dreamers, carrying the energy of ${primaryArchetype}. This convergence suggests a collective threshold or shared spiritual teaching emerging.`;
  }

  private generateFieldGuidance(symbols: string[], archetypes: string[], strength: number): string {
    if (strength > 0.8) {
      return `Strong collective resonance detected. This pattern may indicate a significant collective initiation or transformation. Pay attention to these symbols in personal practice.`;
    } else if (strength > 0.6) {
      return `Moderate collective convergence suggests shared learning themes. Consider exploring these archetypal energies in personal work.`;
    } else {
      return `Gentle collective resonance emerging. These symbols carry medicine for those who encounter them.`;
    }
  }

  // Get recent convergences for Oracle guidance
  getRecentConvergences(limit: number = 5): DreamConvergence[] {
    return this.convergenceHistory
      .sort((a, b) => b.convergenceStrength - a.convergenceStrength)
      .slice(0, limit);
  }

  // Get archetypal trends for collective field awareness
  getArchetypalTrends(timeWindow: string = '7d'): ArchetypalTrend[] {
    return this.trendAnalysis
      .filter(trend => trend.timeWindow === timeWindow)
      .sort((a, b) => b.influenceScore - a.influenceScore);
  }

  // Generate field report for Oracle agents
  generateFieldReport(): {
    fieldState: string;
    dominantArchetypes: string[];
    emergentSymbols: string[];
    collectiveGuidance: string;
    convergenceCount: number;
  } {
    const recentTrends = this.getArchetypalTrends('24h');
    const recentConvergences = this.getRecentConvergences(3);
    const trendingSymbols = this.getTrendingSymbols(5, 86400000);

    const emergingArchetypes = recentTrends
      .filter(t => t.trend === 'emerging')
      .map(t => t.archetype);
    
    const dominantArchetypes = recentTrends
      .slice(0, 3)
      .map(t => t.archetype);

    const emergentSymbols = trendingSymbols
      .slice(0, 5)
      .map(s => s.symbol);

    let fieldState = 'stable';
    if (emergingArchetypes.length >= 2) fieldState = 'transformation';
    else if (recentConvergences.length >= 2) fieldState = 'convergence';
    else if (trendingSymbols.some(s => s.universalRelevance > 0.8)) fieldState = 'emergence';

    const collectiveGuidance = this.generateCollectiveGuidance(fieldState, dominantArchetypes, emergentSymbols);

    return {
      fieldState,
      dominantArchetypes,
      emergentSymbols,
      collectiveGuidance,
      convergenceCount: recentConvergences.length
    };
  }

  private generateCollectiveGuidance(
    fieldState: string, 
    archetypes: string[], 
    symbols: string[]
  ): string {
    switch (fieldState) {
      case 'transformation':
        return `The collective field pulses with transformational energy. The ${archetypes[0]} archetype leads this change. Symbols of ${symbols.slice(0, 2).join(' and ')} offer guidance for navigating this shift.`;
      
      case 'convergence':
        return `Multiple streams of consciousness converge, suggesting shared learning or initiation themes. The appearance of ${symbols[0]} across many experiences points to collective wisdom emerging.`;
        
      case 'emergence':
        return `New patterns emerge from the depths of collective dreaming. The ${symbols[0]} symbol carries particular significance for this time of creative emergence.`;
        
      default:
        return `The collective field flows in natural rhythm. The ${archetypes[0]} energy provides steady guidance, while ${symbols[0]} offers symbolic medicine for those who seek it.`;
    }
  }

  // Cleanup old entries to manage memory
  cleanup(maxAge: number = 2592000000): void { // 30 days default
    const cutoff = Date.now() - maxAge;
    
    this.symbolLog = this.symbolLog.filter(entry => entry.timestamp > cutoff);
    this.convergenceHistory = this.convergenceHistory.filter(conv => conv.timeWindow[1] > cutoff);
    
    // Rebuild maps from filtered data
    this.archetypeMap.clear();
    this.phaseClusters.clear();
    this.collectivePulse.clear();
    this.temporalPatterns.clear();
    
    this.initializeArchetypalFramework();
    
    this.symbolLog.forEach(entry => {
      // Rebuild archetype mapping
      if (!this.archetypeMap.has(entry.archetype)) {
        this.archetypeMap.set(entry.archetype, new Map());
      }
      const archetypeSymbols = this.archetypeMap.get(entry.archetype)!;
      archetypeSymbols.set(entry.symbol, (archetypeSymbols.get(entry.symbol) || 0) + 1);

      // Rebuild phase clustering  
      if (!this.phaseClusters.has(entry.phase)) {
        this.phaseClusters.set(entry.phase, new Map());
      }
      const phaseSymbols = this.phaseClusters.get(entry.phase)!;
      phaseSymbols.set(entry.symbol, (phaseSymbols.get(entry.symbol) || 0) + 1);

      // Rebuild collective pulse
      this.collectivePulse.set(entry.symbol, (this.collectivePulse.get(entry.symbol) || 0) + 1);

      // Rebuild temporal patterns
      if (!this.temporalPatterns.has(entry.symbol)) {
        this.temporalPatterns.set(entry.symbol, []);
      }
      this.temporalPatterns.get(entry.symbol)!.push(entry.timestamp);
    });
  }
}