import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/index.js';
import { config } from '../config/index.js';
import { IUserWithoutPassword, UserRole, AuthPayload } from '../types/index.js';
import { ApiError } from '../utils/ApiError.js';

export interface AuthResponse {
  user: IUserWithoutPassword;
  token: string;
}

export class AuthService {
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, config.bcrypt.salt);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.Sales,
    });

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async getUserById(userId: string): Promise<IUserDocument | null> {
    return User.findById(userId);
  }

  async getAllUsers(): Promise<IUserWithoutPassword[]> {
    const users = await User.find().sort({ createdAt: -1 });
    return users.map(this.sanitizeUser);
  }

  async deleteUser(userId: string, currentUserId: string): Promise<void> {
    if (userId === currentUserId) {
      throw ApiError.badRequest('You cannot delete yourself');
    }
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
  }

  private generateToken(user: IUserDocument): string {
    const payload: AuthPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as string,
    } as jwt.SignOptions);
  }

  private sanitizeUser(user: IUserDocument): IUserWithoutPassword {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const authService = new AuthService();
