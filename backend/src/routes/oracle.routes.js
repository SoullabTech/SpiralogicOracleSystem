"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mainOracleAgent_1 = require("@/core/agents/mainOracleAgent");
const router = (0, express_1.Router)();
// POST /api/oracle/respond
router.post('/respond', async (req, res) => {
    const { input, userId, context, preferredElement, requestShadowWork, collectiveInsight, harmonicResonance } = req.body;
    if (!input || !userId) {
        return res.status(400).json({ error: 'Missing required fields: input and userId' });
    }
    try {
        const response = await mainOracleAgent_1.oracle.processQuery({
            input,
            userId,
            context,
            preferredElement,
            requestShadowWork,
            collectiveInsight,
            harmonicResonance
        });
        res.status(200).json(response);
    }
    catch (error) {
        console.error('AIN Respond Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
