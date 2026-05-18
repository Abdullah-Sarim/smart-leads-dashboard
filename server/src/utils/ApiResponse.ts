import { Response } from 'express';
import { ApiError } from './ApiError.js';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ApiResponse<T> {
  public readonly success: boolean;
  public readonly data: T | null;
  public readonly message?: string;
  public readonly meta?: PaginationMeta;
  public readonly errors: string[];

  private constructor(data: T | null, message?: string, meta?: PaginationMeta, errors: string[] = []) {
    this.success = true;
    this.data = data;
    this.message = message;
    this.meta = meta;
    this.errors = errors;
  }

  static success<T>(data: T, message?: string, meta?: PaginationMeta): ApiResponse<T> {
    return new ApiResponse(data, message, meta);
  }

  static error(message: string, errors: string[] = []): ApiResponse<null> {
    return new ApiResponse(null, undefined, undefined, errors.length ? errors : [message]);
  }

  send(res: Response, statusCode = 200): void {
    res.status(statusCode).json({
      success: this.success,
      data: this.data,
      ...(this.message && { message: this.message }),
      ...(this.meta && { meta: this.meta }),
      ...(this.errors.length && { errors: this.errors }),
    });
  }

  static sendSuccess<T>(res: Response, data: T, statusCode = 200, message?: string, meta?: PaginationMeta): void {
    res.status(statusCode).json({
      success: true,
      data,
      ...(message && { message }),
      ...(meta && { meta }),
    });
  }

  static sendError(res: Response, statusCode: number, message: string, errors: string[] = []): void {
    res.status(statusCode).json({
      success: false,
      data: null,
      message,
      ...(errors.length && { errors }),
    });
  }
}