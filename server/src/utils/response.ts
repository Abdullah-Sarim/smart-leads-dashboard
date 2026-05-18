import { Response } from 'express';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  errors?: unknown[];
  meta?: PaginationMeta;
}

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
    message,
    meta,
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
): void => {
  const payload: Record<string, unknown> = {
    success: false,
    data: null,
    message,
  };
  if (errors) payload.errors = errors as unknown[];
  res.status(statusCode).json(payload);
};