/**
 * Session Persistence for Maya Beta
 * Bulletproof session storage to maintain continuity across conversations
 */

import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => Math.min(times * 50, 2000)
});

interface SessionData {
  userId: string;
  mayaInstance: string;
  sessionId: string;
  messages: Message[];
  evolutionLevel: number;
  protectionPatterns: string[];
  breakthroughMoments: string[]; // Timestamps only
  lastActive: Date;
  trustScore: number;
}

interface Message {
  role: 'user' | 'maya';
  content: string;
  timestamp: Date;
  mode: 'voice' | 'text';
  metadata?: {
    emotionalTone?: string;
    protectionDetected?: string;
    responseTime?: number;
  };
}

export class SessionPersistence {
  private sessionId: string;
  private userId: string;
  private cache: SessionData | null = null;

  constructor(sessionId: string, userId: string) {
    this.sessionId = sessionId;
    this.userId = userId;
  }

  /**
   * Load session with multi-layer fallback
   */
  async loadSession(): Promise<SessionData> {
    // Try Redis first (fastest)
    try {
      const cached = await redis.get(`session:${this.sessionId}`);
      if (cached) {
        this.cache = JSON.parse(cached);
        return this.cache!;
      }
    } catch (error) {
      console.warn('Redis load failed, falling back to PostgreSQL:', error);
    }

    // Fallback to PostgreSQL
    const { data, error } = await supabase
      .from('maya_sessions')
      .select('*')
      .eq('session_id', this.sessionId)
      .single();

    if (error) {
      // Create new session if none exists
      return await this.createNewSession();
    }

    // Restore to Redis for next time
    try {
      await redis.setex(
        `session:${this.sessionId}`,
        3600, // 1 hour cache
        JSON.stringify(data)
      );
    } catch (redisError) {
      console.warn('Redis restore failed:', redisError);
    }

    this.cache = data;
    return data;
  }

  /**
   * Save session with dual persistence
   */
  async saveSession(data: Partial<SessionData>): Promise<void> {
    const updated = { ...this.cache, ...data, lastActive: new Date() };

    // Write to Redis immediately (fast)
    try {
      await redis.setex(
        `session:${this.sessionId}`,
        3600,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('Redis save failed:', error);
    }

    // Write to PostgreSQL async (durable)
    this.persistToDB(updated);

    this.cache = updated;
  }

  /**
   * Add message with continuity protection
   */
  async addMessage(message: Message): Promise<void> {
    const session = await this.loadSession();

    const updatedMessages = [...session.messages, message];

    // Pattern detection (privacy-preserved)
    const patterns = this.detectPatterns(message.content);

    // Check for breakthrough moments
    const isBreakthrough = this.checkBreakthrough(message, session.messages);

    await this.saveSession({
      messages: updatedMessages,
      protectionPatterns: patterns.length > 0 ? patterns : session.protectionPatterns,
      breakthroughMoments: isBreakthrough
        ? [...session.breakthroughMoments, new Date().toISOString()]
        : session.breakthroughMoments
    });

    // Backup critical moments
    if (isBreakthrough) {
      await this.backupBreakthrough(message);
    }
  }

  /**
   * Detect protection patterns without storing content
   */
  private detectPatterns(content: string): string[] {
    const patterns: string[] = [];

    // Speed pattern
    if (content.split(' ').length > 50 && content.length < 500) {
      patterns.push('speed');
    }

    // Intellectualization
    if (/\b(think|analyze|understand|logic|reason)\b/gi.test(content)) {
      patterns.push('intellectual');
    }

    // Deflection
    if (/\b(anyway|but actually|changing subject|different topic)\b/gi.test(content)) {
      patterns.push('deflection');
    }

    return patterns;
  }

  /**
   * Check for breakthrough moments
   */
  private checkBreakthrough(current: Message, history: Message[]): boolean {
    // Simple heuristic - would be more sophisticated in production
    const indicators = [
      /\b(realize|see now|never thought|breakthrough|shift)\b/i,
      /\b(feel different|something changed|new perspective)\b/i,
      /\b(ready to|want to try|willing to explore)\b/i
    ];

    return indicators.some(pattern => pattern.test(current.content));
  }

  /**
   * Backup breakthrough moments separately
   */
  private async backupBreakthrough(message: Message): Promise<void> {
    await supabase.from('breakthrough_markers').insert({
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      user_id_hash: Buffer.from(this.userId).toString('base64').substring(0, 8),
      pattern_category: 'breakthrough',
      // Never store actual content
      metadata: {
        word_count: message.content.split(' ').length,
        emotion_shift: true
      }
    });
  }

  /**
   * Async persist to database
   */
  private async persistToDB(data: SessionData): Promise<void> {
    const { error } = await supabase
      .from('maya_sessions')
      .upsert({
        session_id: this.sessionId,
        user_id: this.userId,
        maya_instance: data.mayaInstance,
        message_count: data.messages.length,
        evolution_level: data.evolutionLevel,
        protection_patterns: data.protectionPatterns,
        breakthrough_count: data.breakthroughMoments.length,
        last_active: data.lastActive,
        trust_score: data.trustScore,
        // Store messages in JSONB column
        messages: data.messages
      });

    if (error) {
      console.error('Database persist failed:', error);
      // Queue for retry
      await this.queueForRetry(data);
    }
  }

  /**
   * Queue failed saves for retry
   */
  private async queueForRetry(data: SessionData): Promise<void> {
    try {
      await redis.lpush(
        'persist_queue',
        JSON.stringify({ sessionId: this.sessionId, data, timestamp: new Date() })
      );
    } catch (error) {
      console.error('Failed to queue for retry:', error);
      // Last resort: local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`maya_backup_${this.sessionId}`, JSON.stringify(data));
      }
    }
  }

  /**
   * Create new session
   */
  private async createNewSession(): Promise<SessionData> {
    const newSession: SessionData = {
      userId: this.userId,
      mayaInstance: `maya_${this.userId}`,
      sessionId: this.sessionId,
      messages: [],
      evolutionLevel: 1.0,
      protectionPatterns: [],
      breakthroughMoments: [],
      lastActive: new Date(),
      trustScore: 0.1
    };

    await this.saveSession(newSession);
    return newSession;
  }

  /**
   * Get conversation context for Maya
   */
  async getContext(limit: number = 10): Promise<Message[]> {
    const session = await this.loadSession();
    return session.messages.slice(-limit);
  }

  /**
   * Session health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check Redis
      await redis.ping();

      // Check PostgreSQL
      const { error } = await supabase
        .from('maya_sessions')
        .select('session_id')
        .eq('session_id', this.sessionId)
        .single();

      return !error;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Session recovery worker
export class SessionRecovery {
  static async processRetryQueue(): Promise<void> {
    try {
      const item = await redis.rpop('persist_queue');
      if (!item) return;

      const { sessionId, data } = JSON.parse(item);
      const session = new SessionPersistence(sessionId, data.userId);
      await session.saveSession(data);
    } catch (error) {
      console.error('Retry processing failed:', error);
    }
  }

  static async recoverFromLocalStorage(sessionId: string): Promise<SessionData | null> {
    if (typeof window === 'undefined') return null;

    const backup = localStorage.getItem(`maya_backup_${sessionId}`);
    if (!backup) return null;

    try {
      const data = JSON.parse(backup);
      localStorage.removeItem(`maya_backup_${sessionId}`);
      return data;
    } catch (error) {
      console.error('Local storage recovery failed:', error);
      return null;
    }
  }
}

// Start recovery worker
if (typeof window === 'undefined') {
  setInterval(() => {
    SessionRecovery.processRetryQueue();
  }, 30000); // Every 30 seconds
}