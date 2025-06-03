"use strict";
// src/routes/oracle/personal.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = require("../../middleware/authenticateToken");
const PersonalOracleAgent_1 = require("../../core/agents/PersonalOracleAgent");
const logger_1 = __importDefault(require("../../utils/logger"));
const router = (0, express_1.Router)();
router.post('/', authenticateToken_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { tone = 'poetic' } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'Missing user ID' });
        }
        const personalAgent = new PersonalOracleAgent_1.PersonalOracleAgent({ userId, tone });
        const intro = await personalAgent.getIntroMessage();
        const reflection = await personalAgent.getDailyReflection();
        const ritual = await personalAgent.suggestRitual();
        res.status(200).json({
            success: true,
            intro,
            reflection,
            ritual,
        });
    }
    catch (error) {
        logger_1.default.error('PersonalOracleAgent route error', { error });
        res.status(500).json({ error: 'Failed to get personal oracle data' });
    }
});
exports.default = router;
