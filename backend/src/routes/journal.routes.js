"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/journal.routes.ts
const express_1 = require("express");
const authenticateToken_1 = require("../middleware/authenticateToken");
const prefectService_1 = require("../services/prefectService"); // Import Prefect Service
const router = (0, express_1.Router)();
// POST /api/journal
router.post('/', authenticateToken_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { journalEntry } = req.body; // User journal entry
        if (!journalEntry || !userId) {
            return res.status(400).json({ error: 'Missing journal entry or user ID' });
        }
        // Trigger the Prefect flow to process the journal entry
        const prefectResponse = await (0, prefectService_1.triggerDailyJournalFlow)(userId, journalEntry);
        res.status(200).json({ success: true, prefectResponse });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to process journal entry' });
    }
});
exports.default = router;
