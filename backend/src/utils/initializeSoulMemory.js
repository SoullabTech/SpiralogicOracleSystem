"use strict";
// ===============================================
// SOUL MEMORY INITIALIZATION UTILITY
// Tests and initializes the Soul Memory System
// ===============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSoulMemorySystem = initializeSoulMemorySystem;
exports.createUserSoulMemory = createUserSoulMemory;
const SoulMemorySystem_js_1 = require("../../memory/SoulMemorySystem.js");
const logger_js_1 = require("./logger.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function initializeSoulMemorySystem() {
    try {
        logger_js_1.logger.info('🌀 Initializing Soul Memory System...');
        // Ensure database directory exists
        const dbDir = path_1.default.join(process.cwd(), 'soul_memory_dbs');
        if (!fs_1.default.existsSync(dbDir)) {
            fs_1.default.mkdirSync(dbDir, { recursive: true });
            logger_js_1.logger.info(`Created Soul Memory database directory: ${dbDir}`);
        }
        // Test database path
        const testDbPath = path_1.default.join(dbDir, 'soul_memory_test.db');
        // Create test Soul Memory System
        const testSoulMemory = new SoulMemorySystem_js_1.SoulMemorySystem({
            userId: 'test_user',
            storageType: 'sqlite',
            databasePath: testDbPath,
            memoryDepth: 100
        });
        logger_js_1.logger.info('📦 Soul Memory System created, testing functionality...');
        // Test basic operations
        const testResults = await runSoulMemoryTests(testSoulMemory);
        // Clean up test database
        await testSoulMemory.closeDatabase();
        if (fs_1.default.existsSync(testDbPath)) {
            fs_1.default.unlinkSync(testDbPath);
            logger_js_1.logger.info('🧹 Test database cleaned up');
        }
        if (testResults.allTestsPassed) {
            logger_js_1.logger.info('✅ Soul Memory System initialization successful!');
            return {
                success: true,
                message: 'Soul Memory System initialized and tested successfully',
                dbPath: dbDir,
                testResults
            };
        }
        else {
            logger_js_1.logger.error('❌ Soul Memory System tests failed');
            return {
                success: false,
                message: 'Soul Memory System tests failed',
                testResults
            };
        }
    }
    catch (error) {
        logger_js_1.logger.error('💥 Soul Memory System initialization failed:', error);
        return {
            success: false,
            message: `Soul Memory System initialization failed: ${error.message}`
        };
    }
}
async function runSoulMemoryTests(soulMemory) {
    const testResults = {
        memoryStorage: false,
        memoryRetrieval: false,
        sacredMoments: false,
        archetypalPatterns: false,
        memoryThreads: false,
        semanticSearch: false,
        allTestsPassed: false
    };
    try {
        logger_js_1.logger.info('🧪 Running Soul Memory tests...');
        // Test 1: Memory Storage
        logger_js_1.logger.info('Testing memory storage...');
        const testMemory = await soulMemory.storeMemory({
            userId: 'test_user',
            type: 'oracle_exchange',
            content: 'This is a test memory for the Soul Memory System',
            element: 'aether',
            shadowContent: false,
            sacredMoment: true,
            metadata: { test: true }
        });
        testResults.memoryStorage = !!testMemory.id;
        logger_js_1.logger.info(`✓ Memory storage: ${testResults.memoryStorage ? 'PASSED' : 'FAILED'}`);
        // Test 2: Memory Retrieval
        logger_js_1.logger.info('Testing memory retrieval...');
        const memories = await soulMemory.retrieveMemories('test_user');
        testResults.memoryRetrieval = memories.length > 0;
        logger_js_1.logger.info(`✓ Memory retrieval: ${testResults.memoryRetrieval ? 'PASSED' : 'FAILED'}`);
        // Test 3: Sacred Moments
        logger_js_1.logger.info('Testing sacred moments...');
        const sacredMoments = await soulMemory.getSacredMoments('test_user');
        testResults.sacredMoments = sacredMoments.length > 0;
        logger_js_1.logger.info(`✓ Sacred moments: ${testResults.sacredMoments ? 'PASSED' : 'FAILED'}`);
        // Test 4: Memory Threads
        logger_js_1.logger.info('Testing memory threads...');
        const thread = await soulMemory.createMemoryThread('test_user', 'Test Journey', 'transformation');
        testResults.memoryThreads = !!thread.id;
        logger_js_1.logger.info(`✓ Memory threads: ${testResults.memoryThreads ? 'PASSED' : 'FAILED'}`);
        // Test 5: Semantic Search
        logger_js_1.logger.info('Testing semantic search...');
        const searchResults = await soulMemory.semanticSearch('test_user', 'test memory');
        testResults.semanticSearch = searchResults.length > 0;
        logger_js_1.logger.info(`✓ Semantic search: ${testResults.semanticSearch ? 'PASSED' : 'FAILED'}`);
        // Test 6: Archetypal Patterns (requires memory with archetype)
        logger_js_1.logger.info('Testing archetypal patterns...');
        await soulMemory.storeMemory({
            userId: 'test_user',
            type: 'archetypal_emergence',
            content: 'Testing archetypal pattern detection',
            element: 'fire',
            archetype: 'Warrior',
            metadata: { test: true }
        });
        const archetypes = await soulMemory.getActiveArchetypes('test_user');
        testResults.archetypalPatterns = archetypes.length > 0;
        logger_js_1.logger.info(`✓ Archetypal patterns: ${testResults.archetypalPatterns ? 'PASSED' : 'FAILED'}`);
        // Test 7: Transformation Journey
        logger_js_1.logger.info('Testing transformation journey...');
        await soulMemory.markTransformation(testMemory.id, 'test_breakthrough', 'Test insights gained');
        const journey = await soulMemory.getTransformationJourney('test_user');
        const transformationTest = journey.milestones.length > 0;
        logger_js_1.logger.info(`✓ Transformation journey: ${transformationTest ? 'PASSED' : 'FAILED'}`);
        // All tests passed?
        testResults.allTestsPassed = Object.values(testResults).every(result => result === true);
        logger_js_1.logger.info(`🎯 Soul Memory tests completed. Overall: ${testResults.allTestsPassed ? 'PASSED' : 'FAILED'}`);
        return testResults;
    }
    catch (error) {
        logger_js_1.logger.error('💥 Soul Memory tests failed:', error);
        testResults.allTestsPassed = false;
        return testResults;
    }
}
async function createUserSoulMemory(userId) {
    const dbDir = path_1.default.join(process.cwd(), 'soul_memory_dbs');
    // Ensure directory exists
    if (!fs_1.default.existsSync(dbDir)) {
        fs_1.default.mkdirSync(dbDir, { recursive: true });
    }
    const userDbPath = path_1.default.join(dbDir, `soul_memory_${userId}.db`);
    return new SoulMemorySystem_js_1.SoulMemorySystem({
        userId,
        storageType: 'sqlite',
        databasePath: userDbPath,
        memoryDepth: 200 // Higher depth for production
    });
}
exports.default = { initializeSoulMemorySystem, createUserSoulMemory };
