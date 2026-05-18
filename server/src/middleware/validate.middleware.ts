import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const data = target === 'body' ? req.body : target === 'query' ? req.query : req.params;

    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message);
      throw new ApiError(400, 'Validation failed', errors);
    }

    if (target === 'body') {
      req.body = result.data;
    } else if (target === 'query') {
      req.query = result.data;
    } else {
      req.params = result.data;
    }

    next();
  };
};