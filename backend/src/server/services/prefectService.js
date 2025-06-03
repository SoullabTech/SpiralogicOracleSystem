"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerDailyJournalFlow = triggerDailyJournalFlow;
// src/services/prefectService.ts
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../../utils/logger");
const PREFECT_API_URL = process.env.PREFECT_API_URL || 'https://api.prefect.io'; // Prefect Cloud API
const PREFECT_API_KEY = process.env.PREFECT_API_KEY; // Your Prefect API key
async function triggerDailyJournalFlow(userId, journalEntry) {
    try {
        const response = await axios_1.default.post(`${PREFECT_API_URL}/flows/daily_journal_processing`, {
            headers: {
                Authorization: `Bearer ${PREFECT_API_KEY}`,
            },
            data: {
                userId,
                journalEntry,
            },
        });
        logger_1.logger.info('Triggered Prefect Flow: daily_journal_processing', { userId });
        return response.data;
    }
    catch (error) {
        logger_1.logger.error('Error triggering Prefect flow', { error });
        throw new Error('Failed to trigger Prefect flow');
    }
}
