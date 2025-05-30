// src/core/agents/unifiedMemory.ts
import { OracleAgent } from './oracleAgent';
import { getRelevantMemories, storeMemoryItem } from '../services/memoryService';
import { getAggregatedWisdom } from '../services/memoryService';
import logger from '../utils/logger';
/**
 * UnifiedMemoryAgent extends OracleAgent to both read and write from memory,
 * providing a combined view of individual and aggregated insights.
 */
export class UnifiedMemoryAgent extends OracleAgent {
    /**
     * Processes a query with both individual memories and aggregated wisdom,
     * then stores the query as new memory.
     */
    async processWithUnifiedMemory(params) {
        const { input, userId, context } = params;
        // Fetch individual memories
        let memories = [];
        try {
            memories = await getRelevantMemories(userId);
            logger.info(`Fetched ${memories.length} personal memories for user ${userId}`);
        }
        catch (err) {
            logger.error('Error fetching personal memories:', err);
        }
        // Fetch aggregated wisdom
        let aggregatedWisdom = '';
        try {
            aggregatedWisdom = await getAggregatedWisdom(userId);
            logger.info('Fetched aggregated wisdom');
        }
        catch (err) {
            logger.error('Error fetching aggregated wisdom:', err);
        }
        // Compose augmented prompt
        const augmentedPrompt = `Input: ${input}\n\nPersonal Memories:\n${memories.map(m => `- ${m.content}`).join('\n')}\n\nAggregated Wisdom:\n${aggregatedWisdom}`;
        // Call base OracleAgent
        const response = await this.processQuery({ input: augmentedPrompt, userId, context });
        // Store the conversation as new memory
        try {
            const newMemory = { userId, content: input, timestamp: new Date().toISOString() };
            await storeMemoryItem(newMemory);
            logger.info('New memory stored for user', userId);
        }
        catch (err) {
            logger.error('Error storing new memory:', err);
        }
        return response;
    }
}
