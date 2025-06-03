"use strict";
// src/routes/chat.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = require("../middleware/authenticateToken");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
/**
 * POST /api/chat
 * Secured endpoint to process user chat input.
 */
router.post('/', authenticateToken_1.authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user?.id;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid message' });
        }
        // 🧠 Placeholder for Oracle chat agent processing logic
        const reply = `🧠 Oracle received: "${message}"`;
        res.status(200).json({ reply, userId });
    }
    catch (error) {
        logger_1.default.error('❌ Chat processing error', { error: error.message || error });
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
