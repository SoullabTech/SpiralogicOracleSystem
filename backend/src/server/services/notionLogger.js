// src/services/notionLogger.ts
function formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${level.toUpperCase()}] [${timestamp}] ${message}`;
}
export const notionLogger = {
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
