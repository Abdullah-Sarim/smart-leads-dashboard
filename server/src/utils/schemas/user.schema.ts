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

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;