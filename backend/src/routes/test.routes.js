"use strict";
// ===============================================
// TEST ROUTES FOR SOUL MEMORY INTEGRATION
// Development only - remove in production
// ===============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PersonalOracleAgent_1 = require("../core/agents/PersonalOracleAgent");
const SoulMemorySystem_1 = require("../../memory/SoulMemorySystem");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
// Test endpoint for Soul Memory integration
router.post('/test-integration', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { message = "I'm feeling overwhelmed by all these changes in my life" } = req.body;
    // Create test instances
    const userId = 'test_user_' + Date.now();
    const soulMemory = new SoulMemorySystem_1.SoulMemorySystem({
        userId,
        storageType: 'sqlite',
        databasePath: './test_soul_memory.db',
        memoryDepth: 100
    });
    const oracle = new PersonalOracleAgent_1.PersonalOracleAgent({
        userId,
        oracleName: 'Aria',
        elementalResonance: 'water'
    });
    // Connect Oracle to Soul Memory
    await oracle.connectToSoulMemory(soulMemory);
    // Process message
    const oracleResponse = await oracle.respondToPrompt(message);
    // Wait for async storage
    await new Promise(resolve => setTimeout(resolve, 500));
    // Retrieve stored memory
    const memories = await soulMemory.retrieveMemories(userId, { limit: 1 });
    // Clean up
    await soulMemory.closeDatabase();
    res.json({
        success: true,
        test: {
            userId,
            message,
            oracleResponse,
            memoryStored: memories.length > 0,
            memory: memories[0] || null
        }
    });
}));
// Test semantic search
router.post('/test-search', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId = 'test_user_123', query } = req.body;
    const soulMemory = new SoulMemorySystem_1.SoulMemorySystem({
        userId,
        storageType: 'sqlite',
        databasePath: './test_soul_memory.db',
        memoryDepth: 100
    });
    const results = await soulMemory.semanticSearch(userId, query, { topK: 5 });
    await soulMemory.closeDatabase();
    res.json({
        success: true,
        query,
        results: results.length,
        memories: results
    });
}));
exports.default = router;
