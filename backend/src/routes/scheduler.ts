import { Router } from 'express';
import { 
  triggerScheduler, 
  getSchedulerStats, 
  getScheduledBookingsStatus 
} from '../controllers/schedulerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Toutes les routes nécessitent une authentification admin
router.use(protect);
router.use(authorize('ADMIN'));

// Routes du scheduler
router.post('/trigger', triggerScheduler);
router.get('/stats', getSchedulerStats);
router.get('/status', getScheduledBookingsStatus);

export default router;