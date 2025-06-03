"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const memoryModule_1 = __importDefault(require("../utils/memoryModule"));
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
/**
 * GET /api/symbolic-trends
 * Optional Query Params:
 *   - symbol (string): filter by symbol tag
 *   - agent (string): filter by agent source
 *   - since (ISO date string): filter by timestamp cutoff
 */
router.get('/', (req, res) => {
    try {
        const { symbol, agent, since } = req.query;
        let tags = memoryModule_1.default.getAllSymbolicTags();
        if (symbol) {
            tags = tags.filter(t => t.symbol === symbol);
        }
        if (agent) {
            tags = tags.filter(t => t.agent === agent);
        }
        if (since) {
            const cutoff = new Date(since).toISOString();
            tags = tags.filter(t => (t.timestamp ?? '') >= cutoff);
        }
        // Aggregate by day
        const countsByDate = {};
        tags.forEach(tag => {
            const day = tag.timestamp?.slice(0, 10) ?? 'unknown';
            countsByDate[day] = (countsByDate[day] || 0) + 1;
        });
        res.json({
            meta: {
                totalTags: tags.length,
                days: Object.keys(countsByDate).length
            },
            countsByDate,
            tags,
        });
    }
    catch (err) {
        logger_1.default.error('❌ Failed to fetch symbolic trends', { error: err });
        res.status(500).json({ error: 'Failed to fetch symbolic trends' });
    }
});
exports.default = router;
