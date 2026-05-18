import { Router } from 'express';
import authRoutes from './auth.routes.js';
import leadRoutes from './lead.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);

export default router;