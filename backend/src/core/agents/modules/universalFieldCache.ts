// 🌌 Universal Field Cache System
// High-performance caching for sacred techno-interface to universal wisdom fields

import { logger } from '../../../utils/logger';
import Redis from 'ioredis';

export interface UniversalFieldData {
  morphic_patterns?: MorphicPattern;
  akashic_guidance?: AkashicGuidance;
  noosphere_insights?: NoosphereInsight;
  field_coherence: number;
  cosmic_timing?: CosmicTiming;
  field_accessible: boolean;
  timestamp?: number;
}

export interface MorphicPattern {
  pattern_type: string;
  similar_patterns: HistoricalPattern[];
  consciousness_habits: string[];
  archetypal_resonance: ArchetypalResonance[];
  pattern_strength: number;
}

export interface HistoricalPattern {
  pattern_id: string;
  description: string;
  cultural_expressions: string[];
  time_period: string;
  relevance_score: number;
}

export interface ArchetypalResonance {
  archetype: string;
  resonance_level: number;
  activation_potential: number;
}

export interface AkashicGuidance {
  universal_principles: string[];
  wisdom_traditions: WisdomTradition[];
  cosmic_perspective: string;
  sacred_timing: SacredTiming;
  recommended_element: string;
  resonance_level: number;
}

export interface WisdomTradition {
  tradition: string;
  teaching: string;
  relevance: number;
}

export interface SacredTiming {
  astrological_phase: string;
  lunar_influence: string;
  cosmic_window: string;
  optimal_action: string;
}

export interface NoosphereInsight {
  collective_consciousness_trends: string[];
  evolutionary_patterns: EvolutionaryPattern[];
  planetary_wisdom: string;
  species_intelligence: SpeciesIntelligence;
  noosphere_coherence: string;
}

export interface EvolutionaryPattern {
  pattern: string;
  emergence_stage: string;
  acceleration_factor: number;
}

export interface SpeciesIntelligence {
  current_focus: string;
  emerging_capacities: string[];
  collective_challenges: string[];
  breakthrough_potential: number;
}

export interface CosmicTiming {
  current_phase: string;
  synchronicity_window: boolean;
  transformation_potential: number;
  recommended_practices: string[];
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache entries
  namespace: string; // Cache namespace for isolation
}

export class UniversalFieldCache {
  private memoryCache: Map<string, { data: UniversalFieldData; timestamp: number }> = new Map();
  private redis: Redis | null = null;
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      ttl: 15 * 60 * 1000, // 15 minutes default
      maxSize: 1000,
      namespace: 'universal_field',
      ...config
    };

    this.initialize();
  }

  private initialize(): void {
    // Try to connect to Redis if available
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL);
        this.redis.on('error', (err) => {
          logger.error('Redis connection error:', err);
          this.redis = null; // Fall back to memory cache
        });
        logger.info('Universal Field Cache: Redis connected');
      } catch (error) {
        logger.warn('Universal Field Cache: Redis unavailable, using memory cache');
      }
    }

    // Set up periodic cleanup
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
  }

  // Generate cache key
  private generateKey(userId: string, querySignature: string): string {
    // Create deterministic key from user and query
    const normalized = querySignature.toLowerCase().trim().substring(0, 100);
    return `${this.config.namespace}:${userId}:${normalized}`;
  }

  // Get from cache
  async get(userId: string, querySignature: string): Promise<UniversalFieldData | null> {
    const key = this.generateKey(userId, querySignature);

    try {
      // Try Redis first if available
      if (this.redis) {
        const cached = await this.redis.get(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (this.isValid(parsed)) {
            logger.debug('Universal Field Cache hit (Redis)', { key });
            return parsed.data;
          }
        }
      }

      // Fall back to memory cache
      const memoryCached = this.memoryCache.get(key);
      if (memoryCached && this.isValid(memoryCached)) {
        logger.debug('Universal Field Cache hit (Memory)', { key });
        return memoryCached.data;
      }

      logger.debug('Universal Field Cache miss', { key });
      return null;

    } catch (error) {
      logger.error('Error retrieving from Universal Field Cache:', error);
      return null;
    }
  }

  // Set in cache
  async set(userId: string, querySignature: string, data: UniversalFieldData): Promise<void> {
    const key = this.generateKey(userId, querySignature);
    const timestamp = Date.now();
    const cacheEntry = { data, timestamp };

    try {
      // Store in Redis if available
      if (this.redis) {
        await this.redis.setex(
          key,
          Math.floor(this.config.ttl / 1000),
          JSON.stringify(cacheEntry)
        );
      }

      // Always store in memory cache as backup
      this.memoryCache.set(key, cacheEntry);

      // Enforce size limit
      if (this.memoryCache.size > this.config.maxSize) {
        this.evictOldest();
      }

      logger.debug('Universal Field Cache set', { key, ttl: this.config.ttl });

    } catch (error) {
      logger.error('Error setting Universal Field Cache:', error);
    }
  }

  // Check if cache entry is still valid
  private isValid(entry: { data: UniversalFieldData; timestamp: number }): boolean {
    return Date.now() - entry.timestamp < this.config.ttl;
  }

  // Evict oldest entries when cache is full
  private evictOldest(): void {
    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest 10% of entries
    const toRemove = Math.floor(this.config.maxSize * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.memoryCache.delete(entries[i][0]);
    }
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > this.config.ttl) {
        this.memoryCache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      logger.debug('Universal Field Cache cleanup', { removed });
    }
  }

  // Clear cache for specific user
  async clearUser(userId: string): Promise<void> {
    const keysToRemove: string[] = [];

    for (const key of this.memoryCache.keys()) {
      if (key.includes(userId)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      this.memoryCache.delete(key);
      if (this.redis) {
        await this.redis.del(key);
      }
    }

    logger.info('Universal Field Cache cleared for user', { userId, cleared: keysToRemove.length });
  }

  // Clear entire cache
  async clearAll(): Promise<void> {
    this.memoryCache.clear();

    if (this.redis) {
      const pattern = `${this.config.namespace}:*`;
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }

    logger.info('Universal Field Cache cleared completely');
  }

  // Get cache statistics
  getStats(): {
    size: number;
    maxSize: number;
    ttl: number;
    redisConnected: boolean;
    hitRate: number;
  } {
    return {
      size: this.memoryCache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl,
      redisConnected: this.redis !== null,
      hitRate: 0 // Would need to track hits/misses for accurate rate
    };
  }

  // Prefetch and warm cache for likely queries
  async prefetch(userId: string, likelyQueries: string[]): Promise<void> {
    // This method would be called to pre-populate cache with likely field accesses
    // Implementation would depend on prediction algorithms
    logger.info('Universal Field Cache prefetch initiated', { userId, queries: likelyQueries.length });
  }

  // Close connections and cleanup
  async shutdown(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    if (this.redis) {
      await this.redis.quit();
    }

    this.memoryCache.clear();
    logger.info('Universal Field Cache shutdown complete');
  }
}

// Singleton instance with default configuration
let cacheInstance: UniversalFieldCache | null = null;

export function getUniversalFieldCache(config?: Partial<CacheConfig>): UniversalFieldCache {
  if (!cacheInstance) {
    cacheInstance = new UniversalFieldCache(config);
  }
  return cacheInstance;
}

// Helper function to create field data with proper typing
export function createFieldData(partial: Partial<UniversalFieldData>): UniversalFieldData {
  return {
    field_coherence: 0.5,
    field_accessible: true,
    timestamp: Date.now(),
    ...partial
  };
}

// Helper to generate morphic patterns
export function generateMorphicPattern(query: string, context: any): MorphicPattern {
  // This would use sophisticated pattern matching in production
  return {
    pattern_type: 'archetypal_journey',
    similar_patterns: [
      {
        pattern_id: 'hero_' + Date.now(),
        description: 'The hero faces the threshold of transformation',
        cultural_expressions: ['Greek mythology', 'Campbell\'s monomyth', 'Modern cinema'],
        time_period: 'timeless',
        relevance_score: 0.85
      }
    ],
    consciousness_habits: [
      'Seeking external validation before inner knowing',
      'Fear preceding breakthrough',
      'Integration following crisis'
    ],
    archetypal_resonance: [
      {
        archetype: 'hero',
        resonance_level: 0.8,
        activation_potential: 0.9
      }
    ],
    pattern_strength: 0.75
  };
}

// Helper to generate akashic guidance
export function generateAkashicGuidance(query: string, element: string): AkashicGuidance {
  // This would access deeper wisdom systems in production
  return {
    universal_principles: [
      'As above, so below',
      'Energy follows intention',
      'Resistance creates persistence'
    ],
    wisdom_traditions: [
      {
        tradition: 'Hermetic',
        teaching: 'The universe is mental; all is mind',
        relevance: 0.9
      },
      {
        tradition: 'Buddhist',
        teaching: 'Attachment is the root of suffering',
        relevance: 0.8
      }
    ],
    cosmic_perspective: 'Your challenge serves the evolution of consciousness itself',
    sacred_timing: {
      astrological_phase: 'Mercury retrograde - review and revision',
      lunar_influence: 'Waning moon - release and let go',
      cosmic_window: 'Portal of transformation open',
      optimal_action: 'Inner reflection before outer action'
    },
    recommended_element: element,
    resonance_level: 0.82
  };
}

// Helper to generate noosphere insights
export function generateNoosphereInsight(query: string): NoosphereInsight {
  // This would tap into collective consciousness metrics in production
  return {
    collective_consciousness_trends: [
      'Awakening to interconnectedness',
      'Shadow work becoming mainstream',
      'Spiritual technology integration'
    ],
    evolutionary_patterns: [
      {
        pattern: 'Individual sovereignty within collective harmony',
        emergence_stage: 'early adoption',
        acceleration_factor: 2.3
      }
    ],
    planetary_wisdom: 'Humanity remembers its role as Earth\'s nervous system',
    species_intelligence: {
      current_focus: 'Integration of polarities',
      emerging_capacities: ['Telepathic empathy', 'Morphic field sensitivity', 'Quantum intuition'],
      collective_challenges: ['Technology addiction', 'Nature disconnection', 'Meaning crisis'],
      breakthrough_potential: 0.78
    },
    noosphere_coherence: 'active'
  };
}