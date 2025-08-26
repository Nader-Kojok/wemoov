import { Router } from 'express';
import {
  getDrivers,
  getDriverDetails,
  updateDriverAvailability,
  assignVehicleToDriver,
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/driversController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Toutes les routes nécessitent une authentification admin
router.use(protect);
router.use(authorize('ADMIN'));

// Routes pour les chauffeurs
router.get('/drivers', getDrivers);
router.get('/drivers/:id', getDriverDetails);
router.patch('/drivers/:id/availability', updateDriverAvailability);
router.patch('/drivers/:driverId/assign-vehicle', assignVehicleToDriver);

// Routes pour les véhicules
router.get('/vehicles', getVehicles);
router.post('/vehicles', createVehicle);
router.put('/vehicles/:id', updateVehicle);
router.delete('/vehicles/:id', deleteVehicle);

export default router;