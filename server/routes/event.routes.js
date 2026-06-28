import { Router } from 'express';
import {
  generatePlan,
  getPlans,
  getPlan,
  deletePlan,
  toggleFavorite,
  updateChecklist,
  generateInvitation,
  generateImagePrompt,
} from '../controllers/event.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect); // All event routes require auth

router.post('/generate', generatePlan);
router.get('/', getPlans);
router.get('/:id', getPlan);
router.delete('/:id', deletePlan);
router.put('/:id/favorite', toggleFavorite);
router.put('/:id/checklist/:itemIndex', updateChecklist);
router.post('/:id/invitation', generateInvitation);
router.post('/:id/image-prompt', generateImagePrompt);

export default router;
