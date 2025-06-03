"use strict";
// src/utils/prefectClient.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerPrefectFlow = triggerPrefectFlow;
const axios_1 = __importDefault(require("axios"));
const API_URL = process.env.PREFECT_API_URL;
const API_KEY = process.env.PREFECT_API_KEY;
if (!API_URL || !API_KEY) {
    throw new Error('Prefect API credentials are missing from environment');
}
/**
 * Triggers a Prefect flow with parameters.
 * @param flowSlug Deployment slug or ID from Prefect
 * @param parameters Key-value payload
 */
async function triggerPrefectFlow(flowSlug, parameters) {
    try {
        const response = await axios_1.default.post(`${API_URL}/deployments/${flowSlug}/create_flow_run`, { parameters }, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    catch (err) {
        console.error('[Prefect] Flow trigger failed:', err);
        throw err;
    }
}
