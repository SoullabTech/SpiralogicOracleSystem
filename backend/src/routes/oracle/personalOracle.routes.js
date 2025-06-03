"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = require("../../middleware/authenticateToken");
const personalOracleAgent_1 = require("../../core/agents/personalOracleAgent");
const logger_1 = __importDefault(require("../../utils/logger"));
const voiceService_1 = require("../../utils/voiceService");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
// POST /api/oracle/personal
router.post('/', authenticateToken_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { input, voice = 'default' } = req.body;
        if (!input || !userId) {
            return res.status(400).json({ error: 'Missing input or user ID' });
        }
        // Process the personal oracle query
        const response = await personalOracleAgent_1.personalOracle.process({ userId, input });
        // Resolve voice ID
        let voiceId = 'LcfcDJNUP1GQjkzn1xUU'; // Default to Emily
        if (voice === 'aunt-annie')
            voiceId = 'y2TOWGCXSYEgBanvKsYJ';
        else if (voice !== 'default')
            voiceId = voice;
        const audioUrl = await (0, voiceService_1.synthesizeVoice)({ text: response.content, voiceId });
        // Trigger Prefect flow to process the journal entry (or any other task you want to automate)
        try {
            const prefectResponse = await axios_1.default.post(`${process.env.PREFECT_API_URL}/flows/daily_journal_processing/run`, // Replace with your actual Prefect flow endpoint
            { entry: input });
            logger_1.default.info('Prefect Flow Triggered', { status: prefectResponse.status, data: prefectResponse.data });
        }
        catch (prefectError) {
            logger_1.default.error('❌ Failed to trigger Prefect flow', { error: prefectError });
        }
        // Return the response with synthesized audio URL
        res.status(200).json({ success: true, response, audioUrl });
    }
    catch (error) {
        logger_1.default.error('❌ Personal Oracle error', { error });
        res.status(500).json({ error: 'Failed to process personal oracle query' });
    }
});
exports.default = router;
