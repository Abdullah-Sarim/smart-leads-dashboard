import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  success: false;
  data: null;
  message: string;
  errors?: string[];
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: string[];

  constructor(message: string, statusCode: number = 500, errors: string[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }

  static fromAxiosError(error: AxiosError<ApiErrorResponse>): ApiError {
    const statusCode = error.response?.status || 500;
    const data = error.response?.data;
    const message = data?.message || error.message || 'Something went wrong';
    const errors = data?.errors || [];
    return new ApiError(message, statusCode, errors);
  }
}

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};