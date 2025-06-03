"use strict";
// ===============================================
// ENHANCED MEMORY ROUTES - SOUL MEMORY INTEGRATED
// Backwards compatible with existing routes + new Soul Memory features
// ===============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const memoryService_js_1 = require("../services/memoryService.js");
const memoryIntegrationService_js_1 = require("../services/memoryIntegrationService.js");
const soulMemoryService_js_1 = require("../services/soulMemoryService.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const logger_js_1 = require("../utils/logger.js");
const router = express_1.default.Router();
// ─────────────────────────────────────────
// 📑 Enhanced Zod Schemas
const MemorySchema = zod_1.z.object({
    content: zod_1.z.string().min(1),
    element: zod_1.z.string().optional(),
    sourceAgent: zod_1.z.string().optional(),
    confidence: zod_1.z.number().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    // Soul Memory specific fields
    type: zod_1.z.enum(['journal_entry', 'oracle_exchange', 'ritual_moment', 'dream_record', 'shadow_work', 'breakthrough', 'integration', 'sacred_pause', 'elemental_shift', 'archetypal_emergence']).optional(),
    sacredMoment: zod_1.z.boolean().optional(),
    shadowContent: zod_1.z.boolean().optional(),
    transformationMarker: zod_1.z.boolean().optional()
});
const JournalEntrySchema = zod_1.z.object({
    content: zod_1.z.string().min(1),
    symbols: zod_1.z.array(zod_1.z.string()).optional(),
    element: zod_1.z.string().optional(),
    spiralPhase: zod_1.z.string().optional(),
    shadowContent: zod_1.z.boolean().optional()
});
const UnifiedSearchSchema = zod_1.z.object({
    query: zod_1.z.string().min(1),
    includeJournals: zod_1.z.boolean().optional(),
    includeOracleExchanges: zod_1.z.boolean().optional(),
    includeSacredMoments: zod_1.z.boolean().optional(),
    limit: zod_1.z.number().optional()
});
// ─────────────────────────────────────────
// 🔧 INITIALIZATION ENDPOINT
// ─────────────────────────────────────────
/**
 * POST /api/oracle/memory/initialize
 * Initialize Soul Memory System for user (auto-migration)
 */
router.post('/initialize', (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    try {
        const result = await memoryIntegrationService_js_1.memoryIntegrationService.initialize(userId);
        res.json({
            success: true,
            ...result,
            message: result.migrationPerformed ? 'Soul Memory initialized with migration' : 'Soul Memory initialized'
        });
    }
    catch (error) {
        logger_js_1.logger.error('Error initializing Soul Memory:', error);
        res.status(500).json({ error: 'Failed to initialize Soul Memory System' });
    }
}));
// ─────────────────────────────────────────
// 📥 ENHANCED MEMORY STORAGE
// ─────────────────────────────────────────
/**
 * POST /api/oracle/memory → Store memory (backwards compatible + enhanced)
 */
router.post('/', (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const parse = MemorySchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.format() });
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    try {
        // Store in both traditional memory service and Soul Memory
        const [traditionalMemory, soulMemory] = await Promise.all([
            memoryService_js_1.memoryService.store(userId, parse.data.content, parse.data.element, parse.data.sourceAgent, parse.data.confidence, parse.data.metadata),
            parse.data.type ?
                soulMemoryService_js_1.soulMemoryService.storeMemory(userId, {
                    type: parse.data.type,
                    content: parse.data.content,
                    element: parse.data.element,
                    sacredMoment: parse.data.sacredMoment,
                    shadowContent: parse.data.shadowContent,
                    transformationMarker: parse.data.transformationMarker,
                    metadata: parse.data.metadata
                }) : null
        ]);
        res.json({
            success: true,
            traditionalMemory,
            soulMemory,
            unified: !!soulMemory
        });
    }
    catch (error) {
        logger_js_1.logger.error('Error storing enhanced memory:', error);
        res.status(500).json({ error: 'Failed to store memory' });
    }
}));
/**
 * POST /api/oracle/memory/journal → Store journal entry (integrated)
 */
router.post('/journal', (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const parse = JournalEntrySchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.format() });
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    try {
        const result = await memoryIntegrationService_js_1.memoryIntegrationService.storeJournalEntryIntegrated(userId, parse.data.content, parse.data.symbols || [], {
            element: parse.data.element,
            spiralPhase: parse.data.spiralPhase,
            shadowContent: parse.data.shadowContent
        });
        res.json({
            success: true,
            ...result
        });
    }
    catch (error) {
        logger_js_1.logger.error('Error storing integrated journal entry:', error);
        res.status(500).json({ error: 'Failed to store journal entry' });
    }
}));
// ─────────────────────────────────────────
// 📤 ENHANCED MEMORY RETRIEVAL
// ─────────────────────────────────────────
/**
 * GET /api/oracle/memory → Get memories (backwards compatible + enhanced)
 */
router.get('/', (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    const { enhanced = 'true' } = req.query;
    try {
        if (enhanced === 'true') {
            // Get unified memories from both systems
            const [traditionalMemories, soulMemories, insights] = await Promise.all([
                memoryService_js_1.memoryService.recall(userId),
                soulMemoryService_js_1.soulMemoryService.getUserMemories(userId, { limit: 50 }),
                soulMemoryService_js_1.soulMemoryService.getUserInsights(userId)
            ]);
            res.json({
                success: true,
                memories: {
                    traditional: traditionalMemories,
                    soul: soulMemories,
                    insights
                },
                unified: true
            });
        }
        else {
            // Backwards compatible: traditional memories only
            const memories = await memoryService_js_1.memoryService.recall(userId);
            res.json({ memories });
        }
    }
    catch (error) {
        logger_js_1.logger.error('Error retrieving enhanced memories:', error);
        res.status(500).json({ error: 'Failed to retrieve memories' });
    }
}));
/**
 * GET /api/oracle/memory/journal → Get journal entries (integrated)
 */
router.get('/journal', (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    try {
        const result = await memoryIntegrationService_js_1.memoryIntegrationService.retrieveJournalEntriesIntegrated(userId);
        res.json({
            success: true,
            ...result
        });
    }
    catch (error) {
        logger_js_1.logger.error('Error retrieving integrated journal entries:', error);
        res.status(500).json({ error: 'Failed to retrieve journal entries' });
    }
}));
/**
 * GET /api/oracle/memory/sacred-moments → Get sacred moments
 */
router.get('/sacred-moments', (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    const { limit = '10' } = req.query;
    try {
        const sacredMoments = await soulMemoryService_js_1.soulMemoryService.getSacredMoments(userId, parseInt(limit));
        res.json({
            success: true,
            sacredMoments,
            count: sacredMoments.length
        });
    }
    catch (error) {
        logger_js_1.logger.error('Error retrieving sacred moments:', error);
        res.status(500).json({ error: 'Failed to retrieve sacred moments' });
    }
}));
/**
 * GET /api/oracle/memory/transformation-journey → Get transformation journey
 */
router.get('/transformation-journey', (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    try {
        const journey = await soulMemoryService_js_1.soulMemoryService.getTransformationJourney(userId);
        res.json({
            success: true,
            journey
        });
    }
    catch (error) {
        logger_js_1.logger.error('Error retrieving transformation journey:', error);
        res.status(500).json({ error: 'Failed to retrieve transformation journey' });
    }
}));
// ─────────────────────────────────────────
// 🔍 UNIFIED SEARCH
// ─────────────────────────────────────────
/**
 * POST /api/oracle/memory/search → Unified memory search
 */
router.post('/search', (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const parse = UnifiedSearchSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.format() });
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    try {
        const results = await memoryIntegrationService_js_1.memoryIntegrationService.searchUnifiedMemory(userId, parse.data.query, {
            includeJournals: parse.data.includeJournals,
            includeOracleExchanges: parse.data.includeOracleExchanges,
            includeSacredMoments: parse.data.includeSacredMoments,
            limit: parse.data.limit
        });
        res.json({
            success: true,
            ...results
        });
    }
    catch (error) {
        logger_js_1.logger.error('Error in unified memory search:', error);
        res.status(500).json({ error: 'Failed to search memories' });
    }
}));
/**
 * POST /api/oracle/memory/oracle-query → Oracle memory query (enhanced)
 */
router.post('/oracle-query', (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const { query } = req.body;
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    if (!query)
        return res.status(400).json({ error: 'Query is required' });
    try {
        const results = await memoryIntegrationService_js_1.memoryIntegrationService.processOracleMemoryQuery(query, userId);
        res.json({
            success: true,
            ...results
        });
    }
    catch (error) {
        logger_js_1.logger.error('Error processing oracle memory query:', error);
        res.status(500).json({ error: 'Failed to process oracle memory query' });
    }
}));
// ─────────────────────────────────────────
// 📊 ENHANCED INSIGHTS
// ─────────────────────────────────────────
/**
 * GET /api/oracle/memory/insights → Enhanced memory insights
 */
router.get('/insights', (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    try {
        const [traditionalInsights, soulInsights] = await Promise.all([
            memoryService_js_1.memoryService.getMemoryInsights(userId),
            soulMemoryService_js_1.soulMemoryService.getUserInsights(userId)
        ]);
        res.json({
            success: true,
            insights: {
                traditional: traditionalInsights,
                soul: soulInsights,
                unified: true
            }
        });
    }
    catch (error) {
        logger_js_1.logger.error('Error retrieving enhanced insights:', error);
        res.status(500).json({ error: 'Failed to retrieve insights' });
    }
}));
/**
 * GET /api/oracle/memory/archetypes → Get archetypal patterns
 */
router.get('/archetypes', (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    try {
        const archetypes = await soulMemoryService_js_1.soulMemoryService.getActiveArchetypes(userId);
        res.json({
            success: true,
            archetypes,
            count: archetypes.length
        });
    }
    catch (error) {
        logger_js_1.logger.error('Error retrieving archetypes:', error);
        res.status(500).json({ error: 'Failed to retrieve archetypes' });
    }
}));
// ─────────────────────────────────────────
// 🔄 MIGRATION & MAINTENANCE
// ─────────────────────────────────────────
/**
 * POST /api/oracle/memory/migrate → Migrate existing data to Soul Memory
 */
router.post('/migrate', (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    try {
        const result = await memoryIntegrationService_js_1.memoryIntegrationService.migrateExistingJournalsToSoulMemory(userId);
        res.json({
            success: true,
            ...result,
            message: `Successfully migrated ${result.migrated} journal entries`
        });
    }
    catch (error) {
        logger_js_1.logger.error('Error during migration:', error);
        res.status(500).json({ error: 'Failed to migrate data' });
    }
}));
// ─────────────────────────────────────────
// 📝 BACKWARDS COMPATIBLE ENDPOINTS
// ─────────────────────────────────────────
// Keep original endpoints for backwards compatibility
router.put('/', (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const { id, content } = req.body;
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    try {
        const updated = await memoryService_js_1.memoryService.update(id, content, userId);
        res.json({ updated });
    }
    catch (error) {
        logger_js_1.logger.error('Error updating memory:', error);
        res.status(500).json({ error: 'Failed to update memory' });
    }
}));
router.delete('/', (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
    const { id } = req.body;
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    try {
        const success = await memoryService_js_1.memoryService.delete(id, userId);
        res.status(success ? 200 : 404).json({ success });
    }
    catch (error) {
        logger_js_1.logger.error('Error deleting memory:', error);
        res.status(500).json({ error: 'Failed to delete memory' });
    }
}));
exports.default = router;
