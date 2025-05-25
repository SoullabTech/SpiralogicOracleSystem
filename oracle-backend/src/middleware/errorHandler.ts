import { Request, Response, NextFunction } from 'express';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from '../utils/errors';
import logger from '../utils/logger';
import { config } from '../config';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('Error:', {
    name: error.name,
    message: error.message,
    stack: config.server.env === 'development' ? error.stack : undefined,
  });

  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }

  if (error instanceof AuthenticationError) {
    return res.status(401).json({ error: error.message });
  }

  if (error instanceof AuthorizationError) {
    return res.status(403).json({ error: error.message });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: error.message });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  // Default fallback error handler
  res.status(500).json({
    error:
      config.server.env === 'production'
        ? 'Internal Server Error'
        : error.message,
  });
};
