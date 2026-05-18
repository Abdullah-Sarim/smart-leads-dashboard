import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';
import { AuthPayload, UserRole } from '../types/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access denied. No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(ApiError.unauthorized('Invalid token'));
    } else {
      next(error);
    }
  }
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(ApiError.forbidden('Access denied. Insufficient permissions'));
      return;
    }

    next();
  };
};

// Example usage:
// router.get('/admin-only', authenticate, authorizeRoles(UserRole.Admin), handler);
// router.get('/admin-or-sales', authenticate, authorizeRoles(UserRole.Admin, UserRole.Sales), handler);