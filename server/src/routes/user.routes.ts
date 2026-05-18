import { Router } from 'express';
import { userController } from '../controllers/index.js';
import { authenticate, authorize } from '../middleware/index.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateUserStatusSchema, userIdParamSchema } from '../utils/schemas/user.schema.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(UserRole.Admin),
  userController.getAllUsers
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.Admin),
  validate(userIdParamSchema, 'params'),
  validate(updateUserStatusSchema, 'body'),
  userController.updateUserStatus
);

export default router;