"use strict";
// src/routes/notionIngest.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = __importDefault(require("../utils/logger"));
const notionIngestService_1 = require("../services/notionIngestService");
const router = (0, express_1.Router)();
/**
 * POST /api/notion/ingest/notion
 * Trigger an ingestion process from Notion pages.
 */
router.post('/notion', async (_req, res) => {
    try {
        const { pages, results } = await notionIngestService_1.notionIngestService.ingestFromNotion();
        res.status(200).json({
            importedPages: pages.length,
            successes: results.filter(r => r.status === 'fulfilled').length,
            failures: results.filter(r => r.status === 'rejected').length,
            details: results,
        });
    }
    catch (err) {
        logger_1.default.error('❌ Notion ingestion failed', err);
        res.status(500).json({
            error: err.message || 'Unknown error during Notion ingestion.',
        });
    }
});
/**
 * POST /api/notion/ingest/local
 * Trigger ingestion of local knowledge base JSON files.
 */
router.post('/local', async (_req, res) => {
    try {
        const { files, results } = await notionIngestService_1.notionIngestService.ingestFromLocalJson();
        res.status(200).json({
            loadedFiles: files.length,
            successes: results.filter(r => r.status === 'fulfilled').length,
            failures: results.filter(r => r.status === 'rejected').length,
            details: results,
        });
    }
    catch (err) {
        logger_1.default.error('❌ Local JSON ingestion failed', err);
        res.status(500).json({
            error: err.message || 'Unknown error during local ingestion.',
        });
    }
});
exports.default = router;
