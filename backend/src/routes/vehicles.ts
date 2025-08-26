import { Router } from 'express';

const router = Router();

// Routes pour les véhicules
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'sedan',
        name: 'Berline',
        description: 'Véhicule confortable pour 1-3 passagers',
        capacity: 3,
        priceMultiplier: 1.0,
        icon: '🚗',
        features: ['Climatisation', 'Confort standard', 'Bagages limités']
      },
      {
        id: 'suv',
        name: 'SUV',
        description: 'Véhicule spacieux pour 1-6 passagers',
        capacity: 6,
        priceMultiplier: 1.3,
        icon: '🚙',
        features: ['Climatisation', 'Espace bagages', 'Confort supérieur']
      },
      {
        id: 'van',
        name: 'Van',
        description: 'Véhicule familial pour 1-8 passagers',
        capacity: 8,
        priceMultiplier: 1.5,
        icon: '🚐',
        features: ['Grand espace', 'Idéal familles', 'Nombreux bagages']
      },
      {
        id: 'luxury',
        name: 'Véhicule de luxe',
        description: 'Véhicule haut de gamme pour occasions spéciales',
        capacity: 4,
        priceMultiplier: 2.0,
        icon: '🏎️',
        features: ['Luxe premium', 'Chauffeur en costume', 'Service VIP']
      }
    ]
  });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Détails du véhicule ${req.params.id} - À implémenter` });
});

export default router;