"use strict";
// oracle-backend/src/middleware/auth.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const server_1 = require("../server");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("./errorHandler");
/**
 * Middleware to check if the request is authenticated via Supabase JWT
 */
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next((0, errorHandler_1.createError)('Missing or invalid authorization header', 401));
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error, } = await server_1.supabase.auth.getUser(token);
    if (error || !user) {
        logger_1.logger.warn('Unauthorized access attempt', error);
        return next((0, errorHandler_1.createError)('Invalid or expired token', 401));
    }
    // Attach user to request for downstream access
    req.user = {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
    };
    next();
};
exports.authMiddleware = authMiddleware;
