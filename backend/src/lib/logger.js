"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAgentInteraction = logAgentInteraction;
exports.logJournalEntry = logJournalEntry;
exports.logAdjusterInsight = logAdjusterInsight;
const supabase_js_1 = require("@supabase/supabase-js");
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// -- Supabase Client (Server Role) --
const supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
// -- Winston Logger Config --
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(colors);
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
const transports = [
    new winston_1.default.transports.Console(),
    new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
    }),
    new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'all.log'),
    }),
];
// -- Exported Logger --
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    levels,
    format,
    transports,
});
exports.default = logger;
//
// 🧠 SUPABASE LOGGING HELPERS
//
/**
 * Logs a message from any intelligent agent (e.g., GuideAgent, ShadowAgent).
 */
async function logAgentInteraction({ userId, agent, content, phase, }) {
    const { error } = await supabase.from('adjuster_logs').insert({
        user_id: userId,
        agent,
        message: content,
        spiral_phase: phase || null,
    });
    if (error)
        logger.error(`Supabase Agent log failed: ${error.message}`);
}
/**
 * Logs a journal entry with optional emotion tagging and symbolic extraction.
 */
async function logJournalEntry({ userId, content, emotionTag, symbols, }) {
    const { error } = await supabase.from('memory_items').insert({
        user_id: userId,
        content,
        emotion_tag: emotionTag || null,
        symbols: symbols || [],
    });
    if (error)
        logger.error(`Supabase Journal log failed: ${error.message}`);
}
/**
 * Logs a system-generated insight or reflection from the Adjuster Agent.
 */
async function logAdjusterInsight({ userId, content, phase, }) {
    const { error } = await supabase.from('adjuster_logs').insert({
        user_id: userId,
        agent: 'AdjusterAgent',
        message: content,
        spiral_phase: phase || null,
    });
    if (error)
        logger.error(`Supabase Insight log failed: ${error.message}`);
}
