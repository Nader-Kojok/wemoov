import { Router } from 'express';

const router = Router();

// Routes pour les paiements
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