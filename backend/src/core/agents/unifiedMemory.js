"use strict";
// src/core/agents/unifiedMemory.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedMemoryAgent = void 0;
const oracleAgent_1 = require("./oracleAgent");
const memoryService_1 = require("../services/memoryService");
const memoryService_2 = require("../services/memoryService");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * UnifiedMemoryAgent extends OracleAgent to both read and write from memory,
 * providing a combined view of individual and aggregated insights.
 */
class UnifiedMemoryAgent extends oracleAgent_1.OracleAgent {
    /**
     * Processes a query with both individual memories and aggregated wisdom,
     * then stores the query as new memory.
     */
    async processWithUnifiedMemory(params) {
        const { input, userId, context } = params;
        // Fetch individual memories
        let memories = [];
        try {
            memories = await (0, memoryService_1.getRelevantMemories)(userId);
            logger_1.default.info(`Fetched ${memories.length} personal memories for user ${userId}`);
        }
        catch (err) {
            logger_1.default.error('Error fetching personal memories:', err);
        }
        // Fetch aggregated wisdom
        let aggregatedWisdom = '';
        try {
            aggregatedWisdom = await (0, memoryService_2.getAggregatedWisdom)(userId);
            logger_1.default.info('Fetched aggregated wisdom');
        }
        catch (err) {
            logger_1.default.error('Error fetching aggregated wisdom:', err);
        }
        // Compose augmented prompt
        const augmentedPrompt = `Input: ${input}\n\nPersonal Memories:\n${memories.map(m => `- ${m.content}`).join('\n')}\n\nAggregated Wisdom:\n${aggregatedWisdom}`;
        // Call base OracleAgent
        const response = await this.processQuery({ input: augmentedPrompt, userId, context });
        // Store the conversation as new memory
        try {
            const newMemory = { userId, content: input, timestamp: new Date().toISOString() };
            await (0, memoryService_1.storeMemoryItem)(newMemory);
            logger_1.default.info('New memory stored for user', userId);
        }
        catch (err) {
            logger_1.default.error('Error storing new memory:', err);
        }
        return response;
    }
}
exports.UnifiedMemoryAgent = UnifiedMemoryAgent;
