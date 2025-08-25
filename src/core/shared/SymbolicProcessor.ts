/**
 * SymbolicProcessor.ts
 * Centralized symbol processing and pattern recognition
 * Eliminates duplication across DreamFieldNode and MemoryPayloadInterface
 */

import { ElementalType, Archetype, UserEmotionalState } from '../../types/index';
import { CacheManager } from './CacheManager';

export interface SymbolicAnalysis {
  symbols: string[];
  dominantThemes: string[];
  mythicPatterns: string[];
  elementalResonance: ElementalType[];
  archetypalConnections: Archetype[];
  emotionalSignature: UserEmotionalState[];
  emergentMeaning: string;
  significance: number; // 0-1
}

export interface SymbolEvolution {
  symbol: string;
  frequency: number;
  personalMeaning: string;
  collectiveMeaning: string;
  lastSeen: number;
  evolutionTracker: Array<{
    timestamp: number;
    context: string;
    meaningShift: string;
    intensity: number;
  }>;
}

export interface MythicPattern {
  pattern: string;
  associatedSymbols: string[];
  description: string;
  universalTheme: string;
}

export class SymbolicProcessor {
  private static cache = new CacheManager({ maxSize: 500, defaultTTL: 1800000 }); // 30 min TTL
  
  // Mythic pattern definitions
  private static readonly MYTHIC_PATTERNS: Record<string, MythicPattern> = {
    'Hero\'s Journey': {
      pattern: 'Hero\'s Journey',
      associatedSymbols: ['sword', 'path', 'mountain', 'treasure', 'dragon', 'guide', 'threshold'],
      description: 'The classic hero\'s transformation through trials',
      universalTheme: 'courage and transformation through challenge'
    },
    'Death-Rebirth': {
      pattern: 'Death-Rebirth',
      associatedSymbols: ['phoenix', 'cocoon', 'winter', 'tomb', 'seed', 'fire', 'ash'],
      description: 'Transformation through symbolic death and renewal',
      universalTheme: 'renewal through release'
    },
    'Sacred Union': {
      pattern: 'Sacred Union',
      associatedSymbols: ['wedding', 'twin', 'circle', 'heart', 'dance', 'merge', 'balance'],
      description: 'Integration of complementary opposites',
      universalTheme: 'wholeness through unity'
    },
    'Mother/Child': {
      pattern: 'Mother/Child',
      associatedSymbols: ['nest', 'womb', 'nurture', 'protection', 'growth', 'birth', 'milk'],
      description: 'Nurturing, protection, and growth themes',
      universalTheme: 'unconditional love and care'
    },
    'Wise Elder': {
      pattern: 'Wise Elder',
      associatedSymbols: ['tree', 'book', 'staff', 'cave', 'mountain', 'owl', 'moon'],
      description: 'Ancient wisdom and guidance',
      universalTheme: 'wisdom through experience'
    },
    'Shadow Integration': {
      pattern: 'Shadow Integration',
      associatedSymbols: ['mirror', 'cave', 'wolf', 'mask', 'labyrinth', 'dark', 'hidden'],
      description: 'Confronting and integrating rejected aspects',
      universalTheme: 'wholeness through shadow work'
    },
    'Transcendence': {
      pattern: 'Transcendence',
      associatedSymbols: ['ladder', 'spiral', 'eagle', 'crown', 'star', 'light', 'wings'],
      description: 'Rising above ordinary consciousness',
      universalTheme: 'liberation from limitation'
    }
  };

  // Symbol-to-element associations
  private static readonly ELEMENTAL_SYMBOLS: Record<ElementalType, string[]> = {
    fire: ['flame', 'spark', 'torch', 'sun', 'lightning', 'volcano', 'forge', 'phoenix', 'dragon'],
    water: ['ocean', 'river', 'rain', 'tears', 'flow', 'wave', 'spring', 'mist', 'ice'],
    earth: ['mountain', 'tree', 'stone', 'seed', 'cave', 'crystal', 'root', 'soil', 'rock'],
    air: ['wind', 'breath', 'cloud', 'feather', 'bird', 'sky', 'storm', 'whisper', 'flight'],
    aether: ['star', 'void', 'light', 'spiral', 'infinity', 'cosmos', 'unity', 'transcendence', 'divine']
  };

  // Symbol-to-archetype associations
  private static readonly ARCHETYPAL_SYMBOLS: Record<string, Archetype[]> = {
    'sword': ['Hero', 'Rebel'],
    'crown': ['Ruler', 'Sage'],
    'heart': ['Lover', 'Caregiver'],
    'mirror': ['Sage', 'Magician'],
    'phoenix': ['Phoenix', 'Magician'],
    'tree': ['Tree', 'Sage'],
    'ocean': ['Ocean', 'Caregiver'],
    'mountain': ['Mountain', 'Sage'],
    'bridge': ['Bridge', 'Magician'],
    'spiral': ['Spiral', 'Magician'],
    'star': ['Star', 'Sage'],
    'serpent': ['Serpent', 'Magician'],
    'seed': ['Seed', 'Creator'],
    'crystal': ['Crystal', 'Sage']
  };

  /**
   * Extract symbols from text content using NLP and pattern matching
   */
  static extractSymbols(content: string, maxSymbols: number = 10): string[] {
    const cacheKey = `extract_symbols_${this.hashString(content)}`;
    
    return this.cache.get(cacheKey, () => {
      const symbols: string[] = [];
      const normalizedContent = content.toLowerCase();
      
      // Extract known symbolic terms
      const allSymbols = new Set<string>();
      
      // Add elemental symbols
      Object.values(this.ELEMENTAL_SYMBOLS).flat().forEach(symbol => {
        if (normalizedContent.includes(symbol)) {
          allSymbols.add(symbol);
        }
      });
      
      // Add archetypal symbols
      Object.keys(this.ARCHETYPAL_SYMBOLS).forEach(symbol => {
        if (normalizedContent.includes(symbol)) {
          allSymbols.add(symbol);
        }
      });
      
      // Extract mythic pattern symbols
      Object.values(this.MYTHIC_PATTERNS).forEach(pattern => {
        pattern.associatedSymbols.forEach(symbol => {
          if (normalizedContent.includes(symbol)) {
            allSymbols.add(symbol);
          }
        });
      });
      
      // Basic NLP: extract noun phrases that might be symbolic
      const words = normalizedContent.split(/\s+/);
      const potentialSymbols = words.filter(word => {
        return word.length > 3 && 
               !['the', 'and', 'but', 'for', 'with', 'from', 'this', 'that', 'they', 'them', 'were', 'been', 'have', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other', 'after', 'first', 'well', 'many', 'some', 'very', 'when', 'much', 'where', 'being', 'these', 'only', 'through', 'before', 'such', 'into', 'under', 'over'].includes(word);
      });
      
      potentialSymbols.forEach(word => {
        if (this.isSymbolicWord(word)) {
          allSymbols.add(word);
        }
      });
      
      // Return top symbols by frequency and symbolic weight
      return Array.from(allSymbols)
        .sort((a, b) => this.getSymbolicWeight(b) - this.getSymbolicWeight(a))
        .slice(0, maxSymbols);
    }, 600000); // Cache for 10 minutes
  }

  /**
   * Analyze symbolic content for patterns, themes, and meaning
   */
  static analyzeSymbolicContent(
    content: string,
    context?: string,
    userHistory?: SymbolEvolution[]
  ): SymbolicAnalysis {
    const cacheKey = `analyze_symbolic_${this.hashString(content + (context || ''))}`;
    
    return this.cache.get(cacheKey, () => {
      const symbols = this.extractSymbols(content);
      const dominantThemes = this.identifyDominantThemes(symbols);
      const mythicPatterns = this.identifyMythicPatterns(symbols);
      const elementalResonance = this.getElementalResonance(symbols);
      const archetypalConnections = this.getArchetypalConnections(symbols);
      const emotionalSignature = this.inferEmotionalSignature(content, symbols);
      const emergentMeaning = this.generateEmergentMeaning(symbols, dominantThemes, mythicPatterns);
      const significance = this.calculateSignificance(symbols, mythicPatterns, userHistory);

      return {
        symbols,
        dominantThemes,
        mythicPatterns,
        elementalResonance,
        archetypalConnections,
        emotionalSignature,
        emergentMeaning,
        significance
      };
    }, 900000); // Cache for 15 minutes
  }

  /**
   * Track symbol evolution over time for a user
   */
  static trackSymbolEvolution(
    symbol: string,
    content: string,
    meaning: string,
    userHistory: SymbolEvolution[]
  ): SymbolEvolution {
    const existing = userHistory.find(s => s.symbol === symbol);
    
    if (existing) {
      existing.frequency++;
      existing.lastSeen = Date.now();
      
      // Track meaning evolution
      if (meaning !== existing.personalMeaning) {
        existing.evolutionTracker.push({
          timestamp: Date.now(),
          context: content.substring(0, 200),
          meaningShift: meaning,
          intensity: this.calculateIntensityShift(existing.personalMeaning, meaning)
        });
        existing.personalMeaning = meaning;
      }
      
      return existing;
    } else {
      return {
        symbol,
        frequency: 1,
        personalMeaning: meaning,
        collectiveMeaning: this.getCollectiveMeaning(symbol),
        lastSeen: Date.now(),
        evolutionTracker: []
      };
    }
  }

  /**
   * Identify mythic patterns present in symbols
   */
  static identifyMythicPatterns(symbols: string[]): string[] {
    const patterns: string[] = [];
    
    Object.entries(this.MYTHIC_PATTERNS).forEach(([patternName, pattern]) => {
      const matches = symbols.filter(symbol => 
        pattern.associatedSymbols.includes(symbol)
      );
      
      if (matches.length >= 2) {
        patterns.push(patternName);
      }
    });
    
    return patterns;
  }

  /**
   * Get elemental resonance from symbols
   */
  static getElementalResonance(symbols: string[]): ElementalType[] {
    const elementCounts: Record<ElementalType, number> = {
      fire: 0, water: 0, earth: 0, air: 0, aether: 0
    };
    
    symbols.forEach(symbol => {
      Object.entries(this.ELEMENTAL_SYMBOLS).forEach(([element, elementSymbols]) => {
        if (elementSymbols.includes(symbol)) {
          elementCounts[element as ElementalType]++;
        }
      });
    });
    
    return Object.entries(elementCounts)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([element]) => element as ElementalType);
  }

  /**
   * Get archetypal connections from symbols
   */
  static getArchetypalConnections(symbols: string[]): Archetype[] {
    const archetypeSet = new Set<Archetype>();
    
    symbols.forEach(symbol => {
      const archetypes = this.ARCHETYPAL_SYMBOLS[symbol];
      if (archetypes) {
        archetypes.forEach(archetype => archetypeSet.add(archetype));
      }
    });
    
    return Array.from(archetypeSet);
  }

  /**
   * Generate collective meaning for a symbol
   */
  static getCollectiveMeaning(symbol: string): string {
    const mythicPatterns = Object.values(this.MYTHIC_PATTERNS);
    const relatedPattern = mythicPatterns.find(pattern => 
      pattern.associatedSymbols.includes(symbol)
    );
    
    if (relatedPattern) {
      return `Symbol of ${relatedPattern.universalTheme} within the ${relatedPattern.pattern} pattern`;
    }
    
    // Default collective meanings for common symbols
    const defaultMeanings: Record<string, string> = {
      'tree': 'Growth, stability, connection between earth and heaven',
      'water': 'Emotional flow, purification, life force',
      'fire': 'Transformation, passion, creative energy',
      'mountain': 'Spiritual elevation, challenge, permanence',
      'bridge': 'Connection, transition, overcoming division',
      'mirror': 'Self-reflection, truth, inner awareness',
      'spiral': 'Evolution, cycles, infinite growth',
      'seed': 'Potential, new beginnings, hidden power'
    };
    
    return defaultMeanings[symbol] || `Universal symbol carrying archetypal significance`;
  }

  // Private helper methods

  private static identifyDominantThemes(symbols: string[]): string[] {
    const themes: Record<string, number> = {};
    
    // Map symbols to themes
    symbols.forEach(symbol => {
      const symbolThemes = this.getSymbolThemes(symbol);
      symbolThemes.forEach(theme => {
        themes[theme] = (themes[theme] || 0) + 1;
      });
    });
    
    return Object.entries(themes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);
  }

  private static getSymbolThemes(symbol: string): string[] {
    const themeMap: Record<string, string[]> = {
      'tree': ['growth', 'nature', 'stability'],
      'water': ['emotion', 'flow', 'cleansing'],
      'fire': ['transformation', 'energy', 'destruction'],
      'mountain': ['challenge', 'achievement', 'spirituality'],
      'bridge': ['connection', 'transition', 'unity'],
      'mirror': ['reflection', 'truth', 'self-awareness'],
      'cave': ['depth', 'mystery', 'inner journey'],
      'phoenix': ['rebirth', 'transformation', 'renewal'],
      'serpent': ['wisdom', 'transformation', 'kundalini'],
      'crown': ['authority', 'achievement', 'recognition']
    };
    
    return themeMap[symbol] || ['universal', 'archetypal'];
  }

  private static inferEmotionalSignature(content: string, symbols: string[]): UserEmotionalState[] {
    const emotionalWords = {
      'anxious': ['worry', 'fear', 'stress', 'panic'],
      'peaceful': ['calm', 'serene', 'quiet', 'still'],
      'excited': ['energy', 'vibrant', 'alive', 'dynamic'],
      'confused': ['lost', 'unclear', 'mixed', 'uncertain'],
      'hopeful': ['light', 'dawn', 'seed', 'spring'],
      'transforming': ['change', 'shift', 'metamorphosis', 'becoming']
    };
    
    const emotions: UserEmotionalState[] = [];
    const lowerContent = content.toLowerCase();
    
    Object.entries(emotionalWords).forEach(([emotion, words]) => {
      if (words.some(word => lowerContent.includes(word))) {
        emotions.push(emotion as UserEmotionalState);
      }
    });
    
    return emotions;
  }

  private static generateEmergentMeaning(
    symbols: string[], 
    themes: string[], 
    patterns: string[]
  ): string {
    if (patterns.length > 0) {
      const primaryPattern = patterns[0];
      const patternData = this.MYTHIC_PATTERNS[primaryPattern];
      
      if (patternData) {
        return `The symbols suggest a ${primaryPattern} theme: ${patternData.universalTheme}. ${themes.slice(0, 2).join(' and ')} energies are prominent.`;
      }
    }
    
    if (themes.length > 0) {
      return `The symbolic constellation points toward ${themes[0]} with secondary themes of ${themes.slice(1, 3).join(' and ')}.`;
    }
    
    return `The symbols carry archetypal significance related to personal and collective transformation.`;
  }

  private static calculateSignificance(
    symbols: string[], 
    patterns: string[], 
    userHistory?: SymbolEvolution[]
  ): number {
    let significance = 0;
    
    // Base significance from symbol count and quality
    significance += Math.min(0.3, symbols.length * 0.03);
    
    // Mythic pattern bonus
    significance += patterns.length * 0.15;
    
    // Personal history bonus
    if (userHistory) {
      symbols.forEach(symbol => {
        const history = userHistory.find(h => h.symbol === symbol);
        if (history) {
          significance += Math.min(0.1, history.frequency * 0.01);
        }
      });
    }
    
    // Archetypal symbol bonus
    symbols.forEach(symbol => {
      if (this.ARCHETYPAL_SYMBOLS[symbol]) {
        significance += 0.05;
      }
    });
    
    return Math.min(1, significance);
  }

  private static isSymbolicWord(word: string): boolean {
    // Check if word has symbolic potential based on various criteria
    const symbolicIndicators = [
      word.length >= 4,
      /^[a-z]+$/.test(word), // Only letters
      !word.includes('ing'), // Not present participle
      !word.includes('ed'), // Not past tense
      Object.values(this.ELEMENTAL_SYMBOLS).flat().includes(word),
      Object.keys(this.ARCHETYPAL_SYMBOLS).includes(word)
    ];
    
    return symbolicIndicators.filter(Boolean).length >= 2;
  }

  private static getSymbolicWeight(symbol: string): number {
    let weight = 1;
    
    // Higher weight for archetypal symbols
    if (this.ARCHETYPAL_SYMBOLS[symbol]) weight += 3;
    
    // Higher weight for elemental symbols
    Object.values(this.ELEMENTAL_SYMBOLS).forEach(symbols => {
      if (symbols.includes(symbol)) weight += 2;
    });
    
    // Higher weight for mythic pattern symbols
    Object.values(this.MYTHIC_PATTERNS).forEach(pattern => {
      if (pattern.associatedSymbols.includes(symbol)) weight += 2;
    });
    
    return weight;
  }

  private static calculateIntensityShift(oldMeaning: string, newMeaning: string): number {
    // Simple algorithm to calculate how much meaning has shifted
    const oldWords = oldMeaning.toLowerCase().split(/\s+/);
    const newWords = newMeaning.toLowerCase().split(/\s+/);
    
    const commonWords = oldWords.filter(word => newWords.includes(word));
    const similarity = commonWords.length / Math.max(oldWords.length, newWords.length);
    
    return 1 - similarity; // Higher value = more shift
  }

  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Clear symbol processing cache
   */
  static clearCache(): void {
    this.cache.clearAll();
  }

  /**
   * Get processing statistics
   */
  static getStats(): { cacheStats: any; totalPatterns: number; totalSymbols: number } {
    return {
      cacheStats: this.cache.getStats(),
      totalPatterns: Object.keys(this.MYTHIC_PATTERNS).length,
      totalSymbols: Object.keys(this.ARCHETYPAL_SYMBOLS).length + 
                   Object.values(this.ELEMENTAL_SYMBOLS).flat().length
    };
  }
}