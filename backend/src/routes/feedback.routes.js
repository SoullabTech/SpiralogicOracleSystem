"use strict";
// src/routes/feedback.routes.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const memoryModule = __importStar(require("../utils/memoryModule"));
const memoryService_1 = require("../services/memoryService");
const router = (0, express_1.Router)();
/**
 * POST /api/feedback
 * Body: { userId: string; messageId: string; rating: number; comments?: string }
 * Records user feedback and logs it into memory for adaptive routing.
 */
router.post('/', async (req, res) => {
    try {
        const { userId, messageId, rating, comments } = req.body;
        // Create a feedback memory item
        const feedbackItem = {
            id: `${userId}-${Date.now()}-feedback`,
            content: comments || `Rating: ${rating}`,
            timestamp: Date.now(),
            clientId: userId,
            metadata: {
                role: 'feedback',
                originalMessageId: messageId,
                rating,
                comments,
            }
        };
        // Log in in-memory store
        memoryModule.addEntry(feedbackItem);
        // Persist via memoryService
        await (0, memoryService_1.storeMemoryItem)({
            content: feedbackItem.content,
            element: 'feedback',
            sourceAgent: 'feedback-endpoint',
            clientId: userId,
            confidence: 1,
            metadata: feedbackItem.metadata
        });
        res.json({ success: true });
    }
    catch (err) {
        console.error('❌ /api/feedback', err);
        res.status(500).json({ success: false, error: 'Failed to record feedback' });
    }
});
exports.default = router;
