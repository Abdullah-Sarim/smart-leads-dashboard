import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../types/index.js';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta,
  message?: string
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
    ...(message && { message }),
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
): void => {
  res.status(statusCode).json({
    success: false,
    data: null,
    message,
    ...(errors && { errors }),
  });
};