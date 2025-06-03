"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const oracleLogger_1 = require("../utils/oracleLogger");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
// 🔒 All insight-history routes require authentication
router.use(authenticate_1.authenticate);
/**
 * GET /api/oracle/insight-history
 * Optional query params: type, limit, offset
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, limit = '50', offset = '0' } = req.query;
        const insights = await oracleLogger_1.oracleLogger.getInsightHistory(userId, {
            type: type,
            limit: Number(limit),
            offset: Number(offset),
        });
        return res.status(200).json({ success: true, count: insights.length, insights });
    }
    catch (err) {
        console.error('❌ Error retrieving insight history:', err.message || err);
        return res.status(500).json({ success: false, error: 'Failed to retrieve insight history' });
    }
});
/**
 * GET /api/oracle/insight-history/stats
 * Returns aggregate stats for insights
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await oracleLogger_1.oracleLogger.getInsightStats(req.user.id);
        return res.status(200).json({ success: true, stats });
    }
    catch (err) {
        console.error('❌ Error retrieving insight statistics:', err.message || err);
        return res.status(500).json({ success: false, error: 'Failed to retrieve insight statistics' });
    }
});
exports.default = router;
