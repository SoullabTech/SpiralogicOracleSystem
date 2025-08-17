"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MainOracleAgent_1 = require("../../services/MainOracleAgent"); // Adjust path if needed
const router = (0, express_1.Router)();
/**
 * POST /api/oracle
 * Handles Oracle query requests with optional contextual metadata.
 */
router.post("/", async (req, res) => {
    try {
        const { query, userId, context } = req.body;
        if (!query || !userId) {
            return res.status(400).json({
                error: "Missing required fields: query and userId are required.",
            });
        }
        const input = {
            input: query,
            userId,
            context: context || {},
        };
        const response = await MainOracleAgent_1.oracle.processQuery(input);
        res.status(200).json(response);
    }
    catch (error) {
        console.error("❌ Oracle processing failed:", error);
        res.status(500).json({
            error: "Oracle failed to process the query.",
            detail: error?.message || "Unknown error",
        });
    }
});
exports.default = router;
