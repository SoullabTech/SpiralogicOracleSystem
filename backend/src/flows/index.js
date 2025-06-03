"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowManager = void 0;
const sessionService_1 = require("../services/sessionService");
const memoryService_1 = require("../services/memoryService");
const metaService_1 = require("../services/metaService");
class FlowManager {
    constructor() {
        this.sessionService = new sessionService_1.SessionService();
        this.memoryService = new memoryService_1.MemoryService();
    }
    async startLearningFlow(clientId) {
        try {
            // Create a new session
            const session = await this.sessionService.createSession(clientId);
            // Initialize with a starting memory
            const initialMemory = await this.memoryService.storeMemory({
                id: Math.random().toString(36).substring(7),
                content: 'Learning flow initiated',
                clientId,
                metadata: metaService_1.MetaService.createMeta()
            });
            return {
                session,
                initialMemory
            };
        }
        catch (error) {
            console.error('Error in learning flow:', error);
            throw new Error('Failed to start learning flow');
        }
    }
    async processInteractionFlow(clientId, sessionId, content) {
        try {
            // Store the interaction memory
            const memory = await this.memoryService.storeMemory({
                id: Math.random().toString(36).substring(7),
                content,
                clientId,
                metadata: metaService_1.MetaService.createMeta()
            });
            // Generate insights based on stored memories
            const insights = await this.memoryService.getMemoryInsights(clientId);
            return {
                memory,
                insights
            };
        }
        catch (error) {
            console.error('Error in interaction flow:', error);
            throw new Error('Failed to process interaction');
        }
    }
    async completeLearningFlow(clientId, sessionId) {
        try {
            // End the session
            await this.sessionService.endSession(sessionId);
            // Get final statistics and insights
            const [sessionStats, finalInsights] = await Promise.all([
                this.sessionService.getSessionStats(clientId),
                this.memoryService.getMemoryInsights(clientId)
            ]);
            return {
                sessionStats,
                finalInsights
            };
        }
        catch (error) {
            console.error('Error completing learning flow:', error);
            throw new Error('Failed to complete learning flow');
        }
    }
}
exports.FlowManager = FlowManager;
