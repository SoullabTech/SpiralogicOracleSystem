"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const memoryModule_1 = __importDefault(require("../utils/memoryModule"));
const authenticateToken_1 = require("../middleware/authenticateToken");
const router = (0, express_1.Router)();
// POST /symbolic-tags
router.post('/', authenticateToken_1.authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { symbol, agent, metadata } = req.body;
    if (!symbol || !agent) {
        return res.status(400).json({ error: 'Missing symbol or agent' });
    }
    try {
        await memoryModule_1.default.storeTag({ userId, symbol, agent, metadata });
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.error('❌ Error storing tag:', err);
        res.status(500).json({ error: 'Failed to store tag' });
    }
});
// GET /symbolic-tags
router.get('/', authenticateToken_1.authenticateToken, async (req, res) => {
    try {
        const tags = await memoryModule_1.default.getAllSymbolicTags(req.user.id);
        res.json({ tags });
    }
    catch (err) {
        console.error('❌ Error fetching tags:', err);
        res.status(500).json({ error: 'Failed to retrieve symbolic tags' });
    }
});
exports.default = router;
