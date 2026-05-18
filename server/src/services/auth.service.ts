import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/index.js';
import { config } from '../config/index.js';
import { IUserWithoutPassword, UserRole, AuthPayload } from '../types/index.js';

export interface AuthResponse {
  user: IUserWithoutPassword;
  token: string;
}

export class AuthService {
  async register(
    name: string,
    email: string,
    password: string,
    role?: UserRole
  ): Promise<AuthResponse> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, config.bcrypt.salt);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || UserRole.Sales,
    });

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
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

  private generateToken(user: IUserDocument): string {
    const payload: AuthPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
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