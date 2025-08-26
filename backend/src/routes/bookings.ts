import { Router } from 'express';
import { createBooking, getBookings, getBookingById, updateBooking, cancelBooking } from '../controllers/bookingController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour les réservations
router.get('/', getBookings);
router.post('/', createBooking);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.patch('/:id/cancel', cancelBooking);

export default router;