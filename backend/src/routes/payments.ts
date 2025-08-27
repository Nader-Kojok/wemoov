import { Router } from 'express';
import { getPayments, getPaymentById, getPaymentStats } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour les paiements
router.get('/', authorize('ADMIN'), getPayments);
router.get('/stats', authorize('ADMIN'), getPaymentStats);
router.get('/:id', getPaymentById);

// Routes pour les paiements en ligne (à implémenter plus tard)
router.post('/initiate', (req, res) => {
  res.json({ message: 'Initier un paiement - À implémenter' });
});

router.post('/callback/wave', (req, res) => {
  res.json({ message: 'Callback Wave Money - À implémenter' });
});

router.post('/callback/orange', (req, res) => {
  res.json({ message: 'Callback Orange Money - À implémenter' });
});

router.get('/:id/status', (req, res) => {
  res.json({ message: `Statut du paiement ${req.params.id} - À implémenter` });
});

export default router;