import { Router } from 'express';
import { leadController } from '../controllers/index.js';
import { authenticate } from '../middleware/index.js';
import { validate } from '../middleware/validate.middleware.js';
import { createLeadSchema, leadQuerySchema } from '../utils/schemas/lead.schema.js';

const router = Router();

router.post('/', authenticate, validate(createLeadSchema), leadController.create);
router.get('/', authenticate, validate(leadQuerySchema, 'query'), leadController.getAll);

export default router;