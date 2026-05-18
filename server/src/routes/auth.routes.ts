import { Router } from 'express';
import { authController } from '../controllers/index.js';
import { authenticate, validate } from '../middleware/index.js';
import { registerSchema, loginSchema } from '../utils/schemas/auth.schema.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.getProfile);

export default router;