import { AuthRequest } from '../middleware/index.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { IUserWithoutPassword, UserRole } from '../types/index.js';

const sanitizeUser = (user: InstanceType<typeof User>): IUserWithoutPassword => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role as UserRole,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const UserController = {
  getAllUsers: catchAsync(async (req: AuthRequest, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    ApiResponse.sendSuccess(res, users.map(sanitizeUser), 200, 'Users retrieved successfully', {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }),

  getProfile: catchAsync(async (req: AuthRequest, res) => {
    const user = await User.findById(req.user!.userId).select('-password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    ApiResponse.sendSuccess(res, sanitizeUser(user));
  }),

  updateProfile: catchAsync(async (req: AuthRequest, res) => {
    const { name, email } = req.body;
    const userId = req.user!.userId;

    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        throw ApiError.conflict('Email already in use by another account');
      }
    }

    const updateData: Record<string, string> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    ApiResponse.sendSuccess(res, sanitizeUser(user), 200, 'Profile updated successfully');
  }),

  deleteProfile: catchAsync(async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      throw ApiError.notFound('User not found');
    }

    if (currentUser.role === UserRole.Admin) {
      throw ApiError.forbidden('Admin account cannot be deleted from profile section');
    }

    await User.findByIdAndUpdate(userId, { isActive: false });

    ApiResponse.sendSuccess(res, null, 200, 'Account deleted successfully');
  }),

  updateUserStatus: catchAsync(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (id === req.user?.userId) {
      throw ApiError.badRequest('You cannot deactivate your own account');
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    ApiResponse.sendSuccess(res, sanitizeUser(user), 200, 'User status updated successfully');
  }),
};

export const userController = UserController;