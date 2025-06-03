"use strict";
// src/routes/sessionRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = require("../middleware/authenticateToken");
const validate_1 = require("../middleware/validate");
const sessionService_1 = require("../services/sessionService");
const session_1 = require("../schemas/session");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
const sessionService = new sessionService_1.SessionService();
/**
 * POST /api/session/start
 * Starts a new user session with optional metadata
 */
router.post('/start', authenticateToken_1.authenticateToken, (0, validate_1.validate)(session_1.createSessionSchema), async (req, res) => {
    try {
        const { metadata } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }
        const session = await sessionService.createSession(userId, metadata);
        res.json(session);
    }
    catch (error) {
        logger_1.default.error('❌ Failed to start session', { error });
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to start session',
        });
    }
});
/**
 * POST /api/session/end/:id
 * Ends a specific session by ID
 */
router.post('/end/:id', authenticateToken_1.authenticateToken, (0, validate_1.validate)(session_1.updateSessionSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }
        const success = await sessionService.endSession(id, userId);
        if (success) {
            res.json({ message: 'Session ended successfully' });
        }
        else {
            res.status(404).json({ error: 'Session not found' });
        }
    }
    catch (error) {
        logger_1.default.error('❌ Failed to end session', { error });
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to end session',
        });
    }
});
/**
 * GET /api/session/stats
 * Returns session usage statistics for the current user
 */
router.get('/stats', authenticateToken_1.authenticateToken, (0, validate_1.validate)(session_1.getSessionStatsSchema), async (req, res) => {
    try {
        const userId = req.user?.id;
        const { startDate, endDate } = req.query;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }
        const stats = await sessionService.getSessionStats(userId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
        res.json(stats);
    }
    catch (error) {
        logger_1.default.error('❌ Failed to get session stats', { error });
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to get session stats',
        });
    }
});
exports.default = router;
