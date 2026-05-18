import { z } from 'zod';
import mongoose from 'mongoose';

export const updateUserStatusSchema = z.object({
  isActive: z.boolean({
    required_error: 'isActive is required',
    invalid_type_error: 'isActive must be a boolean',
  }),
});

export const userIdParamSchema = z.object({
  id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid user ID',
  }),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().trim().email('Invalid email address').optional(),
}).refine((data) => data.name !== undefined || data.email !== undefined, {
  message: 'At least one field (name or email) is required',
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;