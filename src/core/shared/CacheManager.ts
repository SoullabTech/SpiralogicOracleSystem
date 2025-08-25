/**
 * CacheManager.ts
 * High-performance caching system with TTL support and memory optimization
 */

interface CacheEntry<T> {
  value: T;
  expiry: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  size: number;
  hitRate: number;
  missRate: number;
  totalRequests: number;
  hits: number;
  misses: number;
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    size: 0,
    hitRate: 0,
    missRate: 0,
    totalRequests: 0,
    hits: 0,
    misses: 0
  };
  
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout;
  private defaultTTL: number;

  constructor(options: {
    maxSize?: number;
    defaultTTL?: number;
    cleanupIntervalMs?: number;
  } = {}) {
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.defaultTTL || 3600000; // 1 hour
    
    // Auto-cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => this.cleanup(),
      options.cleanupIntervalMs || 300000
    );
  }

  /**
   * Get value from cache or compute it
   */
  get<T>(key: string, computer: () => T, ttl?: number): T {
    this.stats.totalRequests++;
    
    const entry = this.cache.get(key);
    const now = Date.now();
    
    // Cache hit - return cached value if not expired
    if (entry && entry.expiry > now) {
      entry.accessCount++;
      entry.lastAccessed = now;
      this.stats.hits++;
      this.updateHitRate();
      return entry.value as T;
    }
    
    // Cache miss - compute new value
    this.stats.misses++;
    const value = computer();
    
    // Store in cache with TTL
    const expiryTime = now + (ttl || this.defaultTTL);
    this.cache.set(key, {
      value,
      expiry: expiryTime,
      accessCount: 1,
      lastAccessed: now
    });
    
    // Ensure cache doesn't exceed max size
    this.evictIfNecessary();
    this.updateHitRate();
    
    return value;
  }

  /**
   * Set value in cache with optional TTL
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const expiryTime = now + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      value,
      expiry: expiryTime,
      accessCount: 0,
      lastAccessed: now
    });
    
    this.evictIfNecessary();
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && entry.expiry > Date.now();
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear entries matching pattern (supports wildcards)
   */
  clearByPattern(pattern: string): number {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let cleared = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    return cleared;
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
    this.stats = {
      size: 0,
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      hits: 0,
      misses: 0
    };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      ...this.stats,
      size: this.cache.size
    };
  }

  /**
   * Get detailed cache info for monitoring
   */
  getDetailedStats(): {
    stats: CacheStats;
    topKeys: Array<{ key: string; accessCount: number; age: number }>;
    memoryUsage: number;
  } {
    const now = Date.now();
    const topKeys = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key: key.substring(0, 50) + (key.length > 50 ? '...' : ''),
        accessCount: entry.accessCount,
        age: now - (entry.expiry - this.defaultTTL)
      }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);

    // Rough memory usage estimate
    const memoryUsage = this.cache.size * 200; // Approximate bytes per entry
    
    return {
      stats: this.getStats(),
      topKeys,
      memoryUsage
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry <= now) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.debug(`CacheManager cleaned up ${cleaned} expired entries`);
    }
  }

  /**
   * Evict entries if cache exceeds max size
   * Uses LRU (Least Recently Used) strategy
   */
  private evictIfNecessary(): void {
    if (this.cache.size <= this.maxSize) return;
    
    // Sort by last accessed time (ascending) and access count
    const entries = Array.from(this.cache.entries())
      .sort(([,a], [,b]) => {
        // Primary sort: last accessed time
        if (a.lastAccessed !== b.lastAccessed) {
          return a.lastAccessed - b.lastAccessed;
        }
        // Secondary sort: access count (ascending)
        return a.accessCount - b.accessCount;
      });
    
    // Remove oldest 20% of entries
    const toRemove = Math.ceil(this.cache.size * 0.2);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    console.debug(`CacheManager evicted ${toRemove} entries (LRU strategy)`);
  }

  /**
   * Update hit rate statistics
   */
  private updateHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = this.stats.hits / this.stats.totalRequests;
      this.stats.missRate = this.stats.misses / this.stats.totalRequests;
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}