import { Router } from 'express';
import { authController } from '../controllers/index.js';
import { authenticate, authorize } from '../middleware/index.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../utils/schemas/auth.schema.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/profile', authenticate, authController.getProfile);
router.get('/users', authenticate, authorize(UserRole.Admin), authController.getAllUsers);

export default router;