"use strict";
// 📄 FILE: oracle-backend/src/middleware/authenticate.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
exports.authenticateToken = authenticateToken;
const supabase_js_1 = require("@supabase/supabase-js");
const index_1 = require("../config/index");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const supabase = (0, supabase_js_1.createClient)(index_1.config.supabase.url, index_1.config.supabase.anonKey);
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
        const { data: { user }, error, } = await supabase.auth.getUser(token);
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
        logger_1.logger.error('🔐 Authentication failed', { error: err });
        const message = err instanceof errors_1.AuthenticationError
            ? err.message
            : 'Authentication error';
        res.status(401).json({ error: message });
    }
}
exports.authenticate = authenticateToken;
