import { Response } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest, validate } from '../middleware/index.js';
import { UserRole } from '../types/index.js';

export const authValidation = {
  register: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(Object.values(UserRole)).withMessage('Invalid role'),
    validate,
  ],
  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required'),
    validate,
  ],
};

export class AuthController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body;
      const result = await authService.register(name, email, password, role);
      sendSuccess(res, result, 201, undefined, 'Registration successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      sendError(res, 400, message);
    }
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result, 200, undefined, 'Login successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      sendError(res, 401, message);
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await authService.getUserById(req.user!.userId);
      if (!user) {
        sendError(res, 404, 'User not found');
        return;
      }
      sendSuccess(res, {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      sendError(res, 500, 'Failed to fetch profile');
    }
  }

  async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await authService.getAllUsers();
      sendSuccess(res, users);
    } catch (error) {
      sendError(res, 500, 'Failed to fetch users');
    }
  }
}

export const authController = new AuthController();