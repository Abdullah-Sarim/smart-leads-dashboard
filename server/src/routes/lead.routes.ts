import { Router } from 'express';
import { leadController } from '../controllers/index.js';
import { authenticate, authorizeRoles } from '../middleware/index.js';
import { validate } from '../middleware/validate.middleware.js';
import { createLeadSchema, leadQuerySchema, updateLeadSchema, leadIdSchema } from '../utils/schemas/lead.schema.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.post('/', authenticate, validate(createLeadSchema), leadController.create);
router.get('/', authenticate, validate(leadQuerySchema, 'query'), leadController.getAll);
router.get('/export/csv', authenticate, leadController.exportCSV);
router.get('/:id', authenticate, validate(leadIdSchema, 'params'), leadController.getById);
router.put('/:id', authenticate, validate(leadIdSchema, 'params'), validate(updateLeadSchema), leadController.update);
router.delete('/:id', authenticate, authorizeRoles(UserRole.Admin), validate(leadIdSchema, 'params'), leadController.delete);

export default router;