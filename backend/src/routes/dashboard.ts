import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  getUserDetails,
  toggleUserStatus,
  createUser,
  updateUser,
  deleteUser,
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  assignDriver,
  unassignDriver,
  getAvailableDrivers,
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getRevenueStats
} from '../controllers/dashboardController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Toutes les routes du dashboard nécessitent une authentification admin
router.use(protect);
router.use(authorize('ADMIN'));

// Statistiques générales
router.get('/stats', getDashboardStats);

// Gestion des utilisateurs
router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserDetails);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', toggleUserStatus);

// Gestion des réservations
router.get('/bookings', getBookings);
router.post('/bookings', createBooking);
router.put('/bookings/:id', updateBooking);
router.delete('/bookings/:id', deleteBooking);
router.patch('/bookings/:bookingId/assign', assignDriver);
router.patch('/bookings/:bookingId/unassign', unassignDriver);

// Gestion des chauffeurs
router.get('/drivers', getDrivers);
router.post('/drivers', createDriver);
router.put('/drivers/:id', updateDriver);
router.delete('/drivers/:id', deleteDriver);
router.get('/drivers/available', getAvailableDrivers);

// Gestion des véhicules
router.get('/vehicles', getVehicles);
router.post('/vehicles', createVehicle);
router.put('/vehicles/:id', updateVehicle);
router.delete('/vehicles/:id', deleteVehicle);

// Statistiques des revenus
router.get('/revenue', getRevenueStats);

export default router;