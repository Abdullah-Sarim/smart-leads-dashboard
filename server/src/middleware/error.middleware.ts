import { Request, Response, NextFunction } from 'express';
import { MongoServerError } from 'mongodb';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    ApiResponse.sendError(res, err.statusCode, err.message, err.errors);
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    ApiResponse.sendError(res, 400, 'Validation failed', errors);
    return;
  }

  if ((err as MongoServerError).code === 11000) {
    const field = Object.keys((err as MongoServerError).keyValue || {})[0] || 'field';
    ApiResponse.sendError(res, 409, `Duplicate field: ${field} already exists`, [`${field} must be unique`]);
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    ApiResponse.sendError(res, 400, `Invalid ${err.path}: ${err.value}`);
    return;
  }

  if (err instanceof SyntaxError && 'body' in (err as { body?: unknown })) {
    ApiResponse.sendError(res, 400, 'Invalid JSON payload');
    return;
  }

  const statusCode = 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err instanceof Error
      ? err.message
      : 'Internal server error';

  ApiResponse.sendError(res, statusCode, message);
};