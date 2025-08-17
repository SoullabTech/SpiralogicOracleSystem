"use strict";
// oracle-backend/server/tasks/prefect.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerDailyJournalProcessing = triggerDailyJournalProcessing;
const axios_1 = __importDefault(require("axios"));
const PREFECT_API_URL = process.env.PREFECT_API_URL;
const PREFECT_API_KEY = process.env.PREFECT_API_KEY;
async function triggerDailyJournalProcessing({ user_id, entry_text, }) {
    try {
        const response = await axios_1.default.post(PREFECT_API_URL, {
            parameters: {
                user_id,
                entry_text,
            },
        }, {
            headers: {
                Authorization: `Bearer ${PREFECT_API_KEY}`,
                "Content-Type": "application/json",
            },
        });
        if (response.status === 200 || response.status === 201) {
            return {
                status: "success",
                run_id: response.data.id,
            };
        }
        return {
            status: "error",
        };
    }
    catch (err) {
        console.error("Error triggering Prefect flow:", err);
        return {
            status: "error",
        };
    }
}
