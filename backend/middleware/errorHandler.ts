import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ErrorCode } from '../utils/AppError';
import { logger } from '../config/logger';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction): void => {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      code: ErrorCode.VALIDATION_ERROR,
      details: err.flatten(),
    });
    return;
  }

  // Operational AppErrors — expected, safe to expose message
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('app_error', { code: err.code, message: err.message, path: req.path, stack: err.stack });
    } else {
      logger.warn('app_error', { code: err.code, message: err.message, path: req.path });
    }
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    res.status(409).json({
      error: `Duplicate value for ${field}`,
      code: ErrorCode.DUPLICATE,
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      error: `Invalid value for field: ${err.path}`,
      code: ErrorCode.VALIDATION_ERROR,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e: any) => e.message).join(', ');
    res.status(400).json({
      error: messages,
      code: ErrorCode.VALIDATION_ERROR,
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ error: 'Invalid token', code: ErrorCode.UNAUTHORIZED });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'Token expired', code: ErrorCode.UNAUTHORIZED });
    return;
  }

  // Unknown error — log full details, never expose stack to client
  logger.error('unhandled_error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    code: ErrorCode.INTERNAL,
  });
};
