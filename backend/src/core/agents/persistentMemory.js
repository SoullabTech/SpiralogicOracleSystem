"use strict";
// src/core/agents/persistentMemory.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistentMemoryAgent = void 0;
const oracleAgent_1 = require("./oracleAgent");
const memoryService_1 = require("../services/memoryService");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * PersistentMemoryAgent extends OracleAgent to incorporate user memory context into queries
 */
class PersistentMemoryAgent extends oracleAgent_1.OracleAgent {
    /**
     * Processes a query by retrieving relevant memories, running the base OracleAgent, and storing the result
     */
    async processWithMemory(params) {
        const { input, userId } = params;
        // Retrieve relevant past memories
        let memories = [];
        try {
            memories = await (0, memoryService_1.getRelevantMemories)(userId);
            logger_1.default.info(`Retrieved ${memories.length} memories for user ${userId}`);
        }
        catch (err) {
            logger_1.default.error('Failed to retrieve memories:', err);
        }
        // Augment input with memory context
        const augmentedInput = `${input}\n
Relevant Memories:\n${memories.map(m => `- ${m.content}`).join('\n')}`;
        // Run the OracleAgent with augmented input
        const response = await this.processQuery({ input: augmentedInput, userId, context: {} });
        // Store the new memory item
        try {
            const memoryItem = {
                userId,
                content: input,
                timestamp: new Date().toISOString()
            };
            await (0, memoryService_1.storeMemoryItem)(memoryItem);
            logger_1.default.info('Stored new memory item for user', userId);
        }
        catch (err) {
            logger_1.default.error('Failed to store memory item:', err);
        }
        return response;
    }
}
exports.PersistentMemoryAgent = PersistentMemoryAgent;
