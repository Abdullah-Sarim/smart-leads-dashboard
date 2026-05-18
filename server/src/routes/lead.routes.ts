import { Router } from 'express';
import { leadController, leadValidation } from '../controllers/index.js';
import { authenticate, authorize } from '../middleware/index.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.use(authenticate);

router.get('/', leadValidation.query, leadController.getAll);
router.post('/', authorize(UserRole.Admin, UserRole.SalesUser), leadValidation.create, leadController.create);
router.get('/export', leadController.exportCSV);
router.get('/:id', leadController.getById);
router.put('/:id', leadValidation.update, leadController.update);
router.delete('/:id', leadController.delete);

export default router;