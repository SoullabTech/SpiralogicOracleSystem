// ===============================================
// SOUL MEMORY SYSTEM - MYTHIC SENTIENT ARCHITECTURE
// MemGPT + SQLite + LlamaIndex Integration
// ===============================================

import Database from 'better-sqlite3';
import { VectorStoreIndex, Document } from 'llamaindex';
import { PersonalOracleAgent } from '../src/core/agents/PersonalOracleAgent';
import { logger } from '../src/utils/logger';

// SqliteDB wrapper for MemGPT-like API
class SqliteDB {
  private db: Database.Database;
  
  constructor(path: string) {
    this.db = new Database(path);
  }
  
  async exec(sql: string): Promise<void> {
    this.db.exec(sql);
  }
  
  async run(sql: string, params: any[]): Promise<void> {
    const stmt = this.db.prepare(sql);
    stmt.run(...params);
  }
  
  async get(sql: string, params: any[]): Promise<any> {
    const stmt = this.db.prepare(sql);
    return stmt.get(...params);
  }
  
  async all(sql: string, params: any[]): Promise<any[]> {
    const stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }
  
  close(): void {
    this.db.close();
  }
}

// ===============================================
// CORE MEMORY ARCHITECTURE
// ===============================================

export interface SoulMemoryConfig {
  userId: string;
  storageType: 'sqlite' | 'redis';
  databasePath?: string;
  semanticIndexPath?: string;
  memoryDepth: number; // How many memories to keep active
}

export interface Memory {
  id: string;
  userId: string;
  timestamp: Date;
  type: MemoryType;
  content: string;
  element: ElementalType;
  archetype?: string;
  spiralPhase?: string;
  emotionalTone?: string;
  shadowContent?: boolean;
  transformationMarker?: boolean;
  sacredMoment?: boolean;
  ritualContext?: string;
  oracleResponse?: string;
  metadata?: Record<string, any>;
}

// Enhanced Memory interface for Jung-Buddha wisdom tracking
export interface EnhancedMemory extends Memory {
  wisdomMode?: 'jung' | 'buddha' | 'hybrid';
  integrationMarkers?: string[]; // Jung moments - what was integrated
  liberationMarkers?: string[]; // Buddha moments - what was released
  paradoxResolution?: boolean; // When user holds both integration and liberation
  jungArchetype?: string; // Specific Jung archetype detected
  buddhaAttachment?: string; // Specific attachment pattern released
  wisdomType?: WisdomMemoryType; // Specialized wisdom memory classification
}

export type MemoryType = 
  | 'journal_entry'
  | 'oracle_exchange'
  | 'ritual_moment'
  | 'dream_record'
  | 'shadow_work'
  | 'breakthrough'
  | 'integration'
  | 'sacred_pause'
  | 'elemental_shift'
  | 'archetypal_emergence'
  | 'shadow_integration' // Jung
  | 'identity_release' // Buddha
  | 'paradox_holding' // Both
  | 'myth_creation' // Jung
  | 'emptiness_recognition' // Buddha
  | 'sacred_balance'; // Both

// New wisdom memory types for Jung-Buddha integration
export type WisdomMemoryType = 
  | 'shadow_integration' // Jung: Embracing rejected aspects
  | 'identity_release' // Buddha: Letting go of fixed self-concepts
  | 'paradox_holding' // Both: Holding opposing truths simultaneously
  | 'myth_creation' // Jung: Creating personal mythology and meaning
  | 'emptiness_recognition' // Buddha: Seeing through the illusion of separate self
  | 'sacred_balance'; // Both: Dynamic balance between integration and liberation

export type ElementalType = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export interface MemoryThread {
  id: string;
  userId: string;
  threadName: string;
  threadType: 'ritual' | 'shadow_work' | 'transformation' | 'integration';
  createdAt: Date;
  lastUpdated: Date;
  memories: string[];
  state: {
    phase: string;
    progress: number;
    milestones: any[];
  };
}

export interface ArchetypalPattern {
  id: string;
  userId: string;
  archetype: string;
  activationCount: number;
  lastActivated: Date;
  patternStrength: number;
  relatedMemories: string[];
}

export interface TransformationJourney {
  userId: string;
  milestones: any[];
  currentPhase: string;
  nextSpiralSuggestion: string;
}

// ===============================================
// SOUL MEMORY SYSTEM CLASS
// ===============================================

export class SoulMemorySystem {
  private config: SoulMemoryConfig;
  private db: SqliteDB;
  private semanticIndex: VectorStoreIndex;
  private activeMemories: Map<string, Memory[]> = new Map();
  private memoryThreads: Map<string, MemoryThread> = new Map();
  
  constructor(config: SoulMemoryConfig) {
    this.config = config;
    this.initializeDatabase();
    this.initializeSemanticIndex();
  }

  // ===============================================
  // DATABASE INITIALIZATION
  // ===============================================

  private async initializeDatabase() {
    const dbPath = this.config.databasePath || './soul_memory.db';
    
    this.db = new SqliteDB(dbPath);
    
    // Create memories table with mythic structure
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        element TEXT,
        archetype TEXT,
        spiral_phase TEXT,
        emotional_tone TEXT,
        shadow_content BOOLEAN DEFAULT FALSE,
        transformation_marker BOOLEAN DEFAULT FALSE,
        sacred_moment BOOLEAN DEFAULT FALSE,
        ritual_context TEXT,
        oracle_response TEXT,
        metadata JSON,
        embedding BLOB,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_memories ON memories(user_id);
      CREATE INDEX IF NOT EXISTS idx_memory_type ON memories(type);
      CREATE INDEX IF NOT EXISTS idx_sacred_moments ON memories(sacred_moment);
      CREATE INDEX IF NOT EXISTS idx_transformations ON memories(transformation_marker);
    `);

    // Create memory threads table for tracking journeys
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS memory_threads (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        thread_name TEXT,
        thread_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        thread_state TEXT
      );
    `);

    // Create archetypal patterns table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS archetypal_patterns (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        archetype TEXT NOT NULL,
        activation_count INTEGER DEFAULT 1,
        last_activated DATETIME DEFAULT CURRENT_TIMESTAMP,
        pattern_strength REAL DEFAULT 0.0,
        related_memories TEXT
      );
    `);

    logger.info('Soul Memory Database initialized');
  }

  // ===============================================
  // SEMANTIC INDEX INITIALIZATION
  // ===============================================

  private async initializeSemanticIndex() {
    // Initialize LlamaIndex for semantic search
    const indexPath = this.config.semanticIndexPath || './soul_semantic_index';
    
    try {
      // Load existing index or create new
      this.semanticIndex = await VectorStoreIndex.fromPersistDir(indexPath);
    } catch (error) {
      // Create new index if doesn't exist
      this.semanticIndex = await VectorStoreIndex.fromDocuments([]);
    }
    
    logger.info('Semantic Index initialized');
  }

  // ===============================================
  // MEMORY STORAGE & RETRIEVAL
  // ===============================================

  async storeMemory(memory: Omit<Memory, 'id' | 'timestamp'>): Promise<Memory> {
    const id = this.generateMemoryId();
    const timestamp = new Date();
    
    const fullMemory: Memory = {
      id,
      timestamp,
      ...memory
    };

    // Store in database
    await this.db.run(`
      INSERT INTO memories (
        id, user_id, timestamp, type, content, element, 
        archetype, spiral_phase, emotional_tone, shadow_content,
        transformation_marker, sacred_moment, ritual_context,
        oracle_response, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      fullMemory.id,
      fullMemory.userId,
      fullMemory.timestamp.toISOString(),
      fullMemory.type,
      fullMemory.content,
      fullMemory.element,
      fullMemory.archetype,
      fullMemory.spiralPhase,
      fullMemory.emotionalTone,
      fullMemory.shadowContent ? 1 : 0,
      fullMemory.transformationMarker ? 1 : 0,
      fullMemory.sacredMoment ? 1 : 0,
      fullMemory.ritualContext,
      fullMemory.oracleResponse,
      JSON.stringify(fullMemory.metadata || {})
    ]);
    
    // Add to semantic index
    await this.indexMemory(fullMemory);
    
    // Update active memories
    this.updateActiveMemories(fullMemory);
    
    // Check for archetypal patterns
    await this.detectArchetypalPatterns(fullMemory);
    
    // Update memory threads
    await this.updateMemoryThreads(fullMemory);

    logger.info(`Memory stored: ${fullMemory.type} for user ${fullMemory.userId}`);
    
    return fullMemory;
  }

  async retrieveMemories(
    userId: string, 
    options?: {
      type?: MemoryType;
      element?: ElementalType;
      limit?: number;
      sacred?: boolean;
      transformations?: boolean;
      dateRange?: { start: Date; end: Date };
    }
  ): Promise<Memory[]> {
    let query = 'SELECT * FROM memories WHERE user_id = ?';
    const params: any[] = [userId];

    if (options?.type) {
      query += ' AND type = ?';
      params.push(options.type);
    }

    if (options?.element) {
      query += ' AND element = ?';
      params.push(options.element);
    }

    if (options?.sacred) {
      query += ' AND sacred_moment = 1';
    }

    if (options?.transformations) {
      query += ' AND transformation_marker = 1';
    }

    if (options?.dateRange) {
      query += ' AND timestamp BETWEEN ? AND ?';
      params.push(options.dateRange.start.toISOString());
      params.push(options.dateRange.end.toISOString());
    }

    query += ' ORDER BY timestamp DESC';

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    const rows = await this.db.all(query, params);
    
    return rows.map(row => ({
      ...row,
      timestamp: new Date(row.timestamp),
      shadowContent: Boolean(row.shadow_content),
      transformationMarker: Boolean(row.transformation_marker),
      sacredMoment: Boolean(row.sacred_moment),
      metadata: row.metadata ? JSON.parse(row.metadata) : {}
    }));
  }

  // ===============================================
  // SEMANTIC SEARCH & RETRIEVAL
  // ===============================================

  async semanticSearch(
    userId: string,
    query: string,
    options?: {
      topK?: number;
      memoryTypes?: MemoryType[];
      includeArchetypal?: boolean;
    }
  ): Promise<Memory[]> {
    // Convert query to embedding
    const queryDoc = new Document({ text: query, metadata: { userId } });
    
    // Search semantic index
    const results = await this.semanticIndex.query(
      queryDoc,
      { topK: options?.topK || 5 }
    );

    // Filter by user and memory types if specified
    const memoryIds = results
      .filter(r => r.metadata.userId === userId)
      .filter(r => !options?.memoryTypes || options.memoryTypes.includes(r.metadata.type))
      .map(r => r.metadata.memoryId);

    // Retrieve full memories from database
    const memories = await Promise.all(
      memoryIds.map(id => this.getMemoryById(id))
    );

    return memories.filter(m => m !== null) as Memory[];
  }

  private async indexMemory(memory: Memory) {
    // Create document for semantic indexing
    const doc = new Document({
      text: `${memory.type}: ${memory.content}`,
      metadata: {
        memoryId: memory.id,
        userId: memory.userId,
        type: memory.type,
        element: memory.element,
        archetype: memory.archetype,
        timestamp: memory.timestamp.toISOString()
      }
    });

    // Add to semantic index
    await this.semanticIndex.insert(doc);
    
    // Persist index
    await this.semanticIndex.persist();
  }

  // ===============================================
  // MEMORY THREADS & JOURNEYS
  // ===============================================

  async createMemoryThread(
    userId: string,
    threadName: string,
    threadType: 'ritual' | 'shadow_work' | 'transformation' | 'integration'
  ): Promise<MemoryThread> {
    const thread: MemoryThread = {
      id: this.generateThreadId(),
      userId,
      threadName,
      threadType,
      createdAt: new Date(),
      lastUpdated: new Date(),
      memories: [],
      state: {
        phase: 'initiated',
        progress: 0,
        milestones: []
      }
    };

    await this.db.run(`
      INSERT INTO memory_threads (id, user_id, thread_name, thread_type, thread_state)
      VALUES (?, ?, ?, ?, ?)
    `, [thread.id, userId, threadName, threadType, JSON.stringify(thread.state)]);

    this.memoryThreads.set(thread.id, thread);
    
    return thread;
  }

  async addToThread(threadId: string, memoryId: string): Promise<void> {
    const thread = this.memoryThreads.get(threadId);
    if (!thread) return;

    thread.memories.push(memoryId);
    thread.lastUpdated = new Date();

    await this.db.run(`
      UPDATE memory_threads 
      SET last_updated = ?, thread_state = ?
      WHERE id = ?
    `, [thread.lastUpdated.toISOString(), JSON.stringify(thread.state), threadId]);
  }

  // ===============================================
  // ARCHETYPAL PATTERN DETECTION
  // ===============================================

  private async detectArchetypalPatterns(memory: Memory) {
    if (!memory.archetype) return;

    // Check if pattern exists
    const existing = await this.db.get(`
      SELECT * FROM archetypal_patterns 
      WHERE user_id = ? AND archetype = ?
    `, [memory.userId, memory.archetype]);

    if (existing) {
      // Update existing pattern
      await this.db.run(`
        UPDATE archetypal_patterns 
        SET activation_count = activation_count + 1,
            last_activated = ?,
            pattern_strength = pattern_strength + 0.1
        WHERE id = ?
      `, [new Date().toISOString(), existing.id]);
    } else {
      // Create new pattern
      await this.db.run(`
        INSERT INTO archetypal_patterns (id, user_id, archetype, related_memories)
        VALUES (?, ?, ?, ?)
      `, [
        this.generatePatternId(),
        memory.userId,
        memory.archetype,
        JSON.stringify([memory.id])
      ]);
    }
  }

  async getActiveArchetypes(userId: string): Promise<ArchetypalPattern[]> {
    const patterns = await this.db.all(`
      SELECT * FROM archetypal_patterns 
      WHERE user_id = ? 
      ORDER BY pattern_strength DESC, last_activated DESC
      LIMIT 5
    `, [userId]);

    return patterns.map(p => ({
      ...p,
      lastActivated: new Date(p.last_activated),
      relatedMemories: JSON.parse(p.related_memories || '[]')
    }));
  }

  // ===============================================
  // RITUAL & SACRED MOMENT TRACKING
  // ===============================================

  async recordRitualMoment(
    userId: string,
    ritualType: string,
    content: string,
    element: ElementalType,
    oracleGuidance?: string
  ): Promise<Memory> {
    return this.storeMemory({
      userId,
      type: 'ritual_moment',
      content,
      element,
      ritualContext: ritualType,
      sacredMoment: true,
      oracleResponse: oracleGuidance,
      metadata: {
        ritualPhase: 'active',
        timestamp: new Date().toISOString()
      }
    });
  }

  async getSacredMoments(userId: string, limit: number = 10): Promise<Memory[]> {
    return this.retrieveMemories(userId, {
      sacred: true,
      limit
    });
  }

  // ===============================================
  // TRANSFORMATION TRACKING
  // ===============================================

  async markTransformation(
    memoryId: string,
    transformationType: string,
    insights: string
  ): Promise<void> {
    const existingMemory = await this.getMemoryById(memoryId);
    const updatedMetadata = {
      ...(existingMemory?.metadata || {}),
      transformation: { 
        type: transformationType, 
        insights, 
        markedAt: new Date().toISOString() 
      }
    };

    await this.db.run(`
      UPDATE memories 
      SET transformation_marker = 1,
          metadata = ?
      WHERE id = ?
    `, [JSON.stringify(updatedMetadata), memoryId]);
  }

  async getTransformationJourney(userId: string): Promise<TransformationJourney> {
    const transformations = await this.retrieveMemories(userId, {
      transformations: true
    });

    const milestones = transformations.map(t => ({
      date: t.timestamp,
      type: t.type,
      content: t.content,
      element: t.element,
      insights: t.metadata?.transformation?.insights
    }));

    return {
      userId,
      milestones,
      currentPhase: this.determineCurrentPhase(milestones),
      nextSpiralSuggestion: this.suggestNextSpiral(milestones)
    };
  }

  // ===============================================
  // ORACLE INTEGRATION
  // ===============================================

  async integrateWithOracle(
    oracle: PersonalOracleAgent,
    userId: string
  ): Promise<void> {
    // Load user's memory context into oracle
    const recentMemories = await this.retrieveMemories(userId, { limit: 20 });
    const sacredMoments = await this.getSacredMoments(userId, 5);
    const activeArchetypes = await this.getActiveArchetypes(userId);
    
    // Create context summary for oracle
    const memoryContext = {
      recentThemes: this.extractThemes(recentMemories),
      sacredMoments: sacredMoments.map(m => ({
        type: m.type,
        content: m.content,
        date: m.timestamp
      })),
      activeArchetypes: activeArchetypes.map(a => a.archetype),
      transformationPhase: (await this.getTransformationJourney(userId)).currentPhase
    };

    // Update oracle's understanding
    await oracle.updateMemoryContext(memoryContext);
  }

  // ===============================================
  // HELPER METHODS
  // ===============================================

  private updateActiveMemories(memory: Memory) {
    const userMemories = this.activeMemories.get(memory.userId) || [];
    userMemories.unshift(memory);
    
    // Keep only recent memories in active cache
    if (userMemories.length > this.config.memoryDepth) {
      userMemories.pop();
    }
    
    this.activeMemories.set(memory.userId, userMemories);
  }

  private async updateMemoryThreads(memory: Memory) {
    // Auto-add to relevant threads based on type and content
    for (const [threadId, thread] of this.memoryThreads) {
      if (thread.userId !== memory.userId) continue;
      
      // Check if memory belongs to thread
      if (this.memoryBelongsToThread(memory, thread)) {
        await this.addToThread(threadId, memory.id);
      }
    }
  }

  private memoryBelongsToThread(memory: Memory, thread: MemoryThread): boolean {
    // Logic to determine if memory belongs to thread
    if (thread.threadType === 'shadow_work' && memory.shadowContent) return true;
    if (thread.threadType === 'transformation' && memory.transformationMarker) return true;
    if (thread.threadType === 'ritual' && memory.type === 'ritual_moment') return true;
    
    return false;
  }

  private extractThemes(memories: Memory[]): string[] {
    // Extract recurring themes from memories
    const themes = new Map<string, number>();
    
    memories.forEach(m => {
      // Simple theme extraction (can be enhanced with NLP)
      const words = m.content.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 5) {
          themes.set(word, (themes.get(word) || 0) + 1);
        }
      });
    });

    return Array.from(themes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme]) => theme);
  }

  private determineCurrentPhase(milestones: any[]): string {
    if (milestones.length === 0) return 'initiation';
    if (milestones.length < 3) return 'exploration';
    if (milestones.length < 7) return 'deepening';
    if (milestones.length < 12) return 'integration';
    return 'mastery';
  }

  private suggestNextSpiral(milestones: any[]): string {
    const lastMilestone = milestones[0];
    if (!lastMilestone) return 'Begin your sacred journey';
    
    // Suggestion logic based on last transformation
    const suggestions: Record<string, string> = {
      'breakthrough': 'Time to integrate this breakthrough into daily practice',
      'shadow_work': 'Honor the shadow work with creative expression',
      'integration': 'Ready to explore a new layer of your spiral',
      'ritual_moment': 'Let the ritual\'s wisdom guide your next steps'
    };
    
    return suggestions[lastMilestone.type] || 'Continue deepening your practice';
  }

  private generateMemoryId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateThreadId(): string {
    return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePatternId(): string {
    return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getMemoryById(id: string): Promise<Memory | null> {
    const row = await this.db.get('SELECT * FROM memories WHERE id = ?', [id]);
    if (!row) return null;
    
    return {
      ...row,
      timestamp: new Date(row.timestamp),
      shadowContent: Boolean(row.shadow_content),
      transformationMarker: Boolean(row.transformation_marker),
      sacredMoment: Boolean(row.sacred_moment),
      metadata: row.metadata ? JSON.parse(row.metadata) : {}
    };
  }

  // ===============================================
  // PUBLIC API METHODS
  // ===============================================

  async getMemoryThread(threadId: string): Promise<MemoryThread | null> {
    return this.memoryThreads.get(threadId) || null;
  }

  async getUserThreads(userId: string): Promise<MemoryThread[]> {
    const rows = await this.db.all(`
      SELECT * FROM memory_threads 
      WHERE user_id = ? 
      ORDER BY last_updated DESC
    `, [userId]);
    
    return rows.map(row => ({
      ...row,
      createdAt: new Date(row.created_at),
      lastUpdated: new Date(row.last_updated),
      state: JSON.parse(row.thread_state || '{}'),
      memories: [] // TODO: Load actual memory IDs
    }));
  }

  async closeDatabase(): Promise<void> {
    this.db.close();
  }
}

// ===============================================
// EXPORT SOUL MEMORY SYSTEM
// ===============================================

export { SoulMemorySystem };
export default SoulMemorySystem;