"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logJournalEntry = exports.logAdjusterInsight = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("@/config");
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define log colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
// Register color scheme with winston
winston_1.default.addColors(colors);
// Define log format
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Ensure logs directory exists
const logsDir = path_1.default.join(process.cwd(), 'logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
// Define log transports
const transports = [
    new winston_1.default.transports.Console(),
    new winston_1.default.transports.File({ filename: path_1.default.join(logsDir, 'error.log'), level: 'error' }),
    new winston_1.default.transports.File({ filename: path_1.default.join(logsDir, 'all.log') }),
];
// Create the logger
exports.logger = winston_1.default.createLogger({
    level: config_1.config.logging.level,
    levels,
    format,
    transports,
    exceptionHandlers: [
        new winston_1.default.transports.File({ filename: path_1.default.join(logsDir, 'exceptions.log') }),
    ],
    rejectionHandlers: [
        new winston_1.default.transports.File({ filename: path_1.default.join(logsDir, 'rejections.log') }),
    ],
});
// Export specific logging functions for backwards compatibility
const logAdjusterInsight = (data) => exports.logger.info('Adjuster Insight', data);
exports.logAdjusterInsight = logAdjusterInsight;
const logJournalEntry = (data) => exports.logger.info('Journal Entry', data);
exports.logJournalEntry = logJournalEntry;
// Export default logger
exports.default = exports.logger;
