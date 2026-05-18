import { Router } from 'express';
import { authController, authValidation } from '../controllers/index.js';
import { authenticate, authorize } from '../middleware/index.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.post('/register', authValidation.register, authController.register);
router.post('/login', authValidation.login, authController.login);
router.get('/profile', authenticate, authController.getProfile);
router.get('/users', authenticate, authorize(UserRole.Admin), authController.getAllUsers);

export default router;