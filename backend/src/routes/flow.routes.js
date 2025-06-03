"use strict";
// src/routes/learningFlow.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = require("../middleware/authenticateToken");
const learningFlow_1 = require("../flows/learningFlow");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
/**
 * POST /api/flow/learning/start
 * Initiates a new learning flow session
 */
router.post('/learning/start', authenticateToken_1.authenticateToken, async (req, res) => {
    try {
        const clientId = req.user?.id;
        if (!clientId) {
            return res.status(400).json({ error: 'Client ID is required.' });
        }
        const flow = new learningFlow_1.LearningFlow(clientId);
        const result = await flow.start();
        return res.status(200).json(result);
    }
    catch (error) {
        logger_1.default.error('❌ Failed to start learning flow', { error });
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to start learning flow',
        });
    }
});
/**
 * POST /api/flow/learning/interact
 * Sends a message to the learning agent during an active session
 */
router.post('/learning/interact', authenticateToken_1.authenticateToken, async (req, res) => {
    try {
        const clientId = req.user?.id;
        const { content, sessionId } = req.body;
        if (!clientId || !content || !sessionId) {
            return res.status(400).json({
                error: 'Client ID, content, and session ID are required.',
            });
        }
        const flow = new learningFlow_1.LearningFlow(clientId, sessionId);
        const result = await flow.processInteraction(content);
        return res.status(200).json(result);
    }
    catch (error) {
        logger_1.default.error('❌ Failed to process interaction', { error });
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to process interaction',
        });
    }
});
/**
 * POST /api/flow/learning/complete
 * Completes the current learning session
 */
router.post('/learning/complete', authenticateToken_1.authenticateToken, async (req, res) => {
    try {
        const clientId = req.user?.id;
        const { sessionId } = req.body;
        if (!clientId || !sessionId) {
            return res.status(400).json({
                error: 'Client ID and session ID are required.',
            });
        }
        const flow = new learningFlow_1.LearningFlow(clientId, sessionId);
        const result = await flow.complete();
        return res.status(200).json(result);
    }
    catch (error) {
        logger_1.default.error('❌ Failed to complete learning flow', { error });
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to complete learning flow',
        });
    }
});
exports.default = router;
