import { Router } from 'express';
import { createPublicBooking, getPublicBookingStatus } from '../controllers/publicBookingController.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Appliquer un rate limiting plus strict pour les endpoints publics
router.use(rateLimiter);

// Routes publiques pour les réservations (sans authentification)
router.post('/', createPublicBooking);
router.get('/status/:phone', getPublicBookingStatus);

export default router;