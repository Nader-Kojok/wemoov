import { Router } from 'express';

const router = Router();

// Routes pour les services
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'airport',
        name: 'Navette Aéroport',
        description: 'Service navette entre Dakar et l\'aéroport AIBD',
        basePrice: 15000,
        currency: 'FCFA',
        icon: '✈️'
      },
      {
        id: 'city',
        name: 'Course en ville',
        description: 'Déplacements dans Dakar et sa banlieue',
        basePrice: 2000,
        currency: 'FCFA',
        icon: '🏙️'
      },
      {
        id: 'intercity',
        name: 'Voyage inter-ville',
        description: 'Voyages entre différentes villes du Sénégal',
        basePrice: null,
        currency: 'FCFA',
        icon: '🛣️'
      },
      {
        id: 'hourly',
        name: 'Location à l\'heure',
        description: 'Location de véhicule avec chauffeur à l\'heure',
        basePrice: 8000,
        currency: 'FCFA',
        icon: '⏰'
      },
      {
        id: 'event',
        name: 'Événement',
        description: 'Transport pour événements spéciaux',
        basePrice: null,
        currency: 'FCFA',
        icon: '🎉'
      }
    ]
  });
});

router.post('/quote', (req, res) => {
  res.json({ message: 'Calculer un devis - À implémenter' });
});

export default router;