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
  completeBooking,
  getAvailableDrivers,
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getPayments,
  getRevenueStats,
  createDatabaseBackup,
  restoreDatabase,
  getBackupsList,
  deleteBackup
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

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
router.patch('/bookings/:bookingId/complete', completeBooking);

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

// Gestion des paiements
router.get('/payments', getPayments);

// Statistiques des revenus
router.get('/revenue', getRevenueStats);

// Gestion de la base de données
router.post('/database/backup', createDatabaseBackup);
router.post('/database/restore', restoreDatabase);
router.get('/database/backups', getBackupsList);
router.delete('/database/backups/:filename', deleteBackup);

export default router;