"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const supabase_1 = require("../lib/supabase");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Middleware to authenticate the Bearer token from the Authorization header.
 */
async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.slice(7)
            : undefined;
        if (!token) {
            throw new errors_1.AuthenticationError('No authorization token provided');
        }
        const { data: { user }, error, } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            throw new errors_1.AuthenticationError('Invalid or expired token');
        }
        req.user = {
            id: user.id,
            email: user.email ?? null,
            role: user.role ?? null,
        };
        next();
    }
    catch (err) {
        logger_1.default.error('🔐 Authentication failed', { error: err });
        const message = err instanceof errors_1.AuthenticationError
            ? err.message
            : 'Authentication error';
        res.status(401).json({ error: message });
    }
}
