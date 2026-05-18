import { z } from 'zod';
import { UserRole } from '../types/index.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().trim().email('Invalid email format').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([UserRole.Admin, UserRole.Sales], { errorMap: () => ({ message: 'Invalid role. Must be admin or sales' }) }).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;