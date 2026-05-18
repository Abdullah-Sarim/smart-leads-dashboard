import { authService } from '../services/index.js';
import { AuthRequest } from '../middleware/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const AuthController = {
  register: catchAsync(async (req: AuthRequest, res) => {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    ApiResponse.sendSuccess(res, result, 201, 'Registration successful');
  }),

  login: catchAsync(async (req: AuthRequest, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    ApiResponse.sendSuccess(res, result, 200, 'Login successful');
  }),

  getProfile: catchAsync(async (req: AuthRequest, res) => {
    const user = await authService.getUserById(req.user!.userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    ApiResponse.sendSuccess(res, {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }),

  getAllUsers: catchAsync(async (_req: AuthRequest, res) => {
    const users = await authService.getAllUsers();
    ApiResponse.sendSuccess(res, users);
  }),

  deleteUser: catchAsync(async (req: AuthRequest, res) => {
    const { id } = req.params;
    await authService.deleteUser(id, req.user!.userId);
    ApiResponse.sendSuccess(res, null, 200, 'User deleted successfully');
  }),
};

export const authController = AuthController;
