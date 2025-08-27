import { Router } from 'express';
import { createBooking, getBookings, getBookingById, updateBooking, cancelBooking, completeBookingWithPayment } from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour les réservations
router.get('/', getBookings);
router.post('/', createBooking);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.patch('/:id/cancel', cancelBooking);
router.post('/:id/complete', authorize('ADMIN'), completeBookingWithPayment);

export default router;