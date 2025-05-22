import { Request, Response, NextFunction } from 'express';
import { createClient, User } from '@supabase/supabase-js';
import { config } from '../config/index'; // Ensure the config has the Supabase URL and anonKey
import { AuthenticationError } from '../utils/errors';
import logger from '../utils/logger';

// Supabase client setup
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

// Augmented Request interface to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Middleware to authenticate token and attach user to request
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Extract the token from the Authorization header

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      throw new AuthenticationError('Invalid or expired token');
    }

    // Attach the authenticated user to the request object
    req.user = data.user;
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    logger.error('❌ Authentication failed', { error: err });
    // Forward error to next middleware
    next(err instanceof AuthenticationError ? err : new AuthenticationError());
  }
}
