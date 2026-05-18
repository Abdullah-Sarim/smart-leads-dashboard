import { AuthRequest } from '../middleware/index.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { IUserWithoutPassword } from '../types/index.js';

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

    const sanitizedUsers: IUserWithoutPassword[] = users.map((user) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    ApiResponse.sendSuccess(res, sanitizedUsers, 200, 'Users retrieved successfully', {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
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

    const sanitizedUser: IUserWithoutPassword = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    ApiResponse.sendSuccess(res, sanitizedUser, 200, 'User status updated successfully');
  }),
};

export const userController = UserController;