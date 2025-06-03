"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestLocalKb = exports.ingestNotion = void 0;
// src/services/ingestionService.ts
exports.ingestNotion = notionIngestService.ingestFromNotion;
exports.ingestLocalKb = notionIngestService.ingestFromLocalJson;
