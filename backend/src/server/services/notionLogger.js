"use strict";
// src/services/notionLogger.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.notionLogger = void 0;
function formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${level.toUpperCase()}] [${timestamp}] ${message}`;
}
exports.notionLogger = {
    info: (message) => {
        console.log(formatMessage('info', message));
    },
    warn: (message) => {
        console.warn(formatMessage('warn', message));
    },
    error: (message) => {
        console.error(formatMessage('error', message));
    },
};
