// ===============================================
// SOUL MEMORY SYSTEM - MYTHIC SENTIENT ARCHITECTURE
// MemGPT + SQLite + LlamaIndex Integration
// ===============================================
import Database from 'better-sqlite3';
import { VectorStoreIndex, Document } from 'llamaindex';
import { logger } from '../src/utils/logger';
// SqliteDB wrapper for MemGPT-like API
class SqliteDB {
    constructor(path) {
        this.db = new Database(path);
    }
    async exec(sql) {
        this.db.exec(sql);
    }
    async run(sql, params) {
        const stmt = this.db.prepare(sql);
        stmt.run(...params);
    }
    async get(sql, params) {
        const stmt = this.db.prepare(sql);
        return stmt.get(...params);
    }
    async all(sql, params) {
        const stmt = this.db.prepare(sql);
        return stmt.all(...params);
    }
    close() {
        this.db.close();
    }
}
// ===============================================
// SOUL MEMORY SYSTEM CLASS
// ===============================================
export class SoulMemorySystem {
    constructor(config) {
        this.activeMemories = new Map();
        this.memoryThreads = new Map();
        this.config = config;
        this.initializeDatabase();
        this.initializeSemanticIndex();
    }
    // ===============================================
    // DATABASE INITIALIZATION
    // ===============================================
    async initializeDatabase() {
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
    async initializeSemanticIndex() {
        // Initialize LlamaIndex for semantic search
        const indexPath = this.config.semanticIndexPath || './soul_semantic_index';
        try {
            // Load existing index or create new
            this.semanticIndex = await VectorStoreIndex.fromPersistDir(indexPath);
        }
        catch (error) {
            // Create new index if doesn't exist
            this.semanticIndex = await VectorStoreIndex.fromDocuments([]);
        }
        logger.info('Semantic Index initialized');
    }
    // ===============================================
    // MEMORY STORAGE & RETRIEVAL
    // ===============================================
    async storeMemory(memory) {
        const id = this.generateMemoryId();
        const timestamp = new Date();
        const fullMemory = {
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
    async retrieveMemories(userId, options) {
        let query = 'SELECT * FROM memories WHERE user_id = ?';
        const params = [userId];
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
    async semanticSearch(userId, query, options) {
        // Convert query to embedding
        const queryDoc = new Document({ text: query, metadata: { userId } });
        // Search semantic index
        const results = await this.semanticIndex.query(queryDoc, { topK: options?.topK || 5 });
        // Filter by user and memory types if specified
        const memoryIds = results
            .filter(r => r.metadata.userId === userId)
            .filter(r => !options?.memoryTypes || options.memoryTypes.includes(r.metadata.type))
            .map(r => r.metadata.memoryId);
        // Retrieve full memories from database
        const memories = await Promise.all(memoryIds.map(id => this.getMemoryById(id)));
        return memories.filter(m => m !== null);
    }
    async indexMemory(memory) {
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
    async createMemoryThread(userId, threadName, threadType) {
        const thread = {
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
    async addToThread(threadId, memoryId) {
        const thread = this.memoryThreads.get(threadId);
        if (!thread)
            return;
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
    async detectArchetypalPatterns(memory) {
        if (!memory.archetype)
            return;
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
        }
        else {
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
    async getActiveArchetypes(userId) {
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
    async recordRitualMoment(userId, ritualType, content, element, oracleGuidance) {
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
    async getSacredMoments(userId, limit = 10) {
        return this.retrieveMemories(userId, {
            sacred: true,
            limit
        });
    }
    // ===============================================
    // TRANSFORMATION TRACKING
    // ===============================================
    async markTransformation(memoryId, transformationType, insights) {
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
    async getTransformationJourney(userId) {
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
    async integrateWithOracle(oracle, userId) {
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
    updateActiveMemories(memory) {
        const userMemories = this.activeMemories.get(memory.userId) || [];
        userMemories.unshift(memory);
        // Keep only recent memories in active cache
        if (userMemories.length > this.config.memoryDepth) {
            userMemories.pop();
        }
        this.activeMemories.set(memory.userId, userMemories);
    }
    async updateMemoryThreads(memory) {
        // Auto-add to relevant threads based on type and content
        for (const [threadId, thread] of this.memoryThreads) {
            if (thread.userId !== memory.userId)
                continue;
            // Check if memory belongs to thread
            if (this.memoryBelongsToThread(memory, thread)) {
                await this.addToThread(threadId, memory.id);
            }
        }
    }
    memoryBelongsToThread(memory, thread) {
        // Logic to determine if memory belongs to thread
        if (thread.threadType === 'shadow_work' && memory.shadowContent)
            return true;
        if (thread.threadType === 'transformation' && memory.transformationMarker)
            return true;
        if (thread.threadType === 'ritual' && memory.type === 'ritual_moment')
            return true;
        return false;
    }
    extractThemes(memories) {
        // Extract recurring themes from memories
        const themes = new Map();
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
    determineCurrentPhase(milestones) {
        if (milestones.length === 0)
            return 'initiation';
        if (milestones.length < 3)
            return 'exploration';
        if (milestones.length < 7)
            return 'deepening';
        if (milestones.length < 12)
            return 'integration';
        return 'mastery';
    }
    suggestNextSpiral(milestones) {
        const lastMilestone = milestones[0];
        if (!lastMilestone)
            return 'Begin your sacred journey';
        // Suggestion logic based on last transformation
        const suggestions = {
            'breakthrough': 'Time to integrate this breakthrough into daily practice',
            'shadow_work': 'Honor the shadow work with creative expression',
            'integration': 'Ready to explore a new layer of your spiral',
            'ritual_moment': 'Let the ritual\'s wisdom guide your next steps'
        };
        return suggestions[lastMilestone.type] || 'Continue deepening your practice';
    }
    generateMemoryId() {
        return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateThreadId() {
        return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generatePatternId() {
        return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async getMemoryById(id) {
        const row = await this.db.get('SELECT * FROM memories WHERE id = ?', [id]);
        if (!row)
            return null;
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
    async getMemoryThread(threadId) {
        return this.memoryThreads.get(threadId) || null;
    }
    async getUserThreads(userId) {
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
    async closeDatabase() {
        this.db.close();
    }
}
export default SoulMemorySystem;
