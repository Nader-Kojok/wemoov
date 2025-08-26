import { Router } from 'express';

const router = Router();

// Routes pour les utilisateurs
router.get('/', (req, res) => {
  res.json({ message: 'Liste des utilisateurs - À implémenter' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Profil utilisateur ${req.params.id} - À implémenter` });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Modifier utilisateur ${req.params.id} - À implémenter` });
});

export default router;