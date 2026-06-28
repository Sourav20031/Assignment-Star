import { Router } from 'express';
import { getAnalytics } from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/', getAnalytics);

export default router;
