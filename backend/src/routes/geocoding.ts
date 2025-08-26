import { Router } from 'express';

const router = Router();

// Routes pour la géolocalisation
router.post('/search', (req, res) => {
  res.json({ message: 'Recherche d\'adresses - À implémenter' });
});

router.post('/reverse', (req, res) => {
  res.json({ message: 'Géocodage inverse - À implémenter' });
});

router.post('/directions', (req, res) => {
  res.json({ message: 'Calcul d\'itinéraires - À implémenter' });
});

router.get('/zones', (req, res) => {
  res.json({
    success: true,
    data: {
      dakar: {
        name: 'Dakar',
        bounds: {
          north: 14.7645,
          south: 14.6037,
          east: -17.3515,
          west: -17.5757
        },
        zones: [
          'Plateau', 'Médina', 'Gueule Tapée', 'Fass', 'Colobane',
          'HLM', 'Grand Dakar', 'Sicap', 'Mermoz', 'Ouakam',
          'Ngor', 'Yoff', 'Almadies', 'Point E', 'Fann'
        ]
      },
      banlieue: {
        name: 'Banlieue de Dakar',
        zones: [
          'Pikine', 'Guédiawaye', 'Parcelles Assainies',
          'Keur Massar', 'Malika', 'Yeumbeul', 'Thiaroye',
          'Rufisque', 'Bargny', 'Sébikotane'
        ]
      },
      airport: {
        name: 'Aéroport International Blaise Diagne',
        location: {
          lat: 14.6700,
          lng: -17.0732
        },
        address: 'Diass, Sénégal'
      }
    }
  });
});

export default router;