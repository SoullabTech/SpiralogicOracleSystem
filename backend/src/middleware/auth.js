// oracle-backend/src/middleware/auth.ts
import { supabase } from '../server';
import { logger } from '../utils/logger';
import { createError } from './errorHandler';
/**
 * Middleware to check if the request is authenticated via Supabase JWT
 */
export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(createError('Missing or invalid authorization header', 401));
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error, } = await supabase.auth.getUser(token);
    if (error || !user) {
        logger.warn('Unauthorized access attempt', error);
        return next(createError('Invalid or expired token', 401));
    }
    // Attach user to request for downstream access
    req.user = {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
    };
    next();
};
