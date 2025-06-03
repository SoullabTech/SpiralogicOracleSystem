"use strict";
// src/controllers/journal.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalHandler = journalHandler;
const logger_1 = require("../utils/logger");
async function journalHandler(req, res) {
    const { userId, content, phase } = req.body;
    if (!userId || !content) {
        return res.status(400).json({ error: 'Missing required fields: userId or content' });
    }
    try {
        // Step 1: Log the journal entry
        await (0, logger_1.logJournalEntry)({ userId, content });
        // Step 2: Check for trigger keywords
        const triggerKeywords = ['rupture', 'fragmented', 'betrayed', 'confused', 'grief'];
        const triggered = triggerKeywords.some(word => content.toLowerCase().includes(word));
        if (triggered) {
            const reflection = 'A resonance shift has been detected. What part of your story feels out of phase right now?';
            await (0, logger_1.logAdjusterInsight)({
                userId,
                content: reflection,
                phase,
            });
        }
        return res.status(200).json({ success: true });
    }
    catch (err) {
        console.error('[Journal Handler] Error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
