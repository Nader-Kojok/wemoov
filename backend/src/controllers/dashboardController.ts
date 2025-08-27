import { Request, Response } from 'express';
import { prisma } from '../utils/database.js';
import { ApiResponse } from '../types/index.js';
import { cache, CACHE_KEYS, CACHE_TTL } from '../utils/cache.js';
import { StatisticsService } from '../services/statisticsService.js';
import { UserService } from '../services/userService.js';
import { BookingService } from '../services/bookingService.js';
import { DriverService } from '../services/driverService.js';
import { VehicleService } from '../services/vehicleService.js';
import { createSuccessResponse, createErrorResponse, createPaginatedResponse } from '../utils/responseHelpers.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Statistiques générales du dashboard
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await StatisticsService.getDashboardStats();
    res.json(createSuccessResponse(stats));
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la récupération des statistiques', 'STATS_ERROR'));
  }
};



// CRUD Réservations
export const createBooking = async (req: Request, res: Response) => {
  try {
    const bookingData = req.body;
    const booking = await BookingService.createBooking(bookingData);
    res.status(201).json(createSuccessResponse(booking));
  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la création de la réservation', 'BOOKING_CREATE_ERROR'));
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bookingData = req.body;
    const booking = await BookingService.updateBooking(id, bookingData);
    res.json(createSuccessResponse(booking));
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réservation:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la mise à jour de la réservation', 'BOOKING_UPDATE_ERROR'));
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await BookingService.deleteBooking(id);
    res.json(createSuccessResponse({ deleted: true }));
  } catch (error) {
    console.error('Erreur lors de la suppression de la réservation:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la suppression de la réservation', 'BOOKING_DELETE_ERROR'));
  }
};

// CRUD Chauffeurs
export const getDrivers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters = {
      search: req.query.search as string
    };

    const { drivers, total } = await DriverService.getDrivers(page, limit, filters);
    res.json(createPaginatedResponse(drivers, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des chauffeurs:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la récupération des chauffeurs', 'DRIVERS_FETCH_ERROR'));
  }
};

export const createDriver = async (req: Request, res: Response) => {
  try {
    const driverData = req.body;
    const driver = await DriverService.createDriver(driverData);
    res.status(201).json(createSuccessResponse(driver));
  } catch (error) {
    console.error('Erreur lors de la création du chauffeur:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la création du chauffeur', 'DRIVER_CREATE_ERROR'));
  }
};

export const updateDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const driverData = req.body;
    const driver = await DriverService.updateDriver(id, driverData);
    res.json(createSuccessResponse(driver));
  } catch (error) {
    console.error('Erreur lors de la mise à jour du chauffeur:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la mise à jour du chauffeur', 'DRIVER_UPDATE_ERROR'));
  }
};

export const deleteDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await DriverService.deleteDriver(id);
    res.json(createSuccessResponse({ deleted: true }));
  } catch (error) {
    console.error('Erreur lors de la suppression du chauffeur:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la suppression du chauffeur', 'DRIVER_DELETE_ERROR'));
  }
};

// CRUD Véhicules
export const getVehicles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters = {
      search: req.query.search as string,
      type: req.query.type as string
    };

    const { vehicles, total } = await VehicleService.getVehicles(page, limit, filters);
    res.json(createPaginatedResponse(vehicles, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la récupération des véhicules', 'VEHICLES_FETCH_ERROR'));
  }
};

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleData = req.body;
    const vehicle = await VehicleService.createVehicle(vehicleData);
    res.status(201).json(createSuccessResponse(vehicle));
  } catch (error) {
    console.error('Erreur lors de la création du véhicule:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la création du véhicule', 'VEHICLE_CREATE_ERROR'));
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vehicleData = req.body;
    const vehicle = await VehicleService.updateVehicle(id, vehicleData);
    res.json(createSuccessResponse(vehicle));
  } catch (error) {
    console.error('Erreur lors de la mise à jour du véhicule:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la mise à jour du véhicule', 'VEHICLE_UPDATE_ERROR'));
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await VehicleService.deleteVehicle(id);
    res.json(createSuccessResponse({ deleted: true }));
  } catch (error) {
    console.error('Erreur lors de la suppression du véhicule:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la suppression du véhicule', 'VEHICLE_DELETE_ERROR'));
  }
};

// Liste des utilisateurs avec pagination
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters = {
      role: req.query.role as string,
      search: req.query.search as string
    };

    const { users, total } = await UserService.getUsers(page, limit, filters);
    res.json(createPaginatedResponse(users, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la récupération des utilisateurs', 'USERS_FETCH_ERROR'));
  }
};

// Détails d'un utilisateur
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(id, true);
    res.json(createSuccessResponse(user));
  } catch (error) {
    console.error('Erreur lors de la récupération des détails utilisateur:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la récupération des détails utilisateur', 'USER_DETAILS_ERROR'));
  }
};

// Activer/désactiver un utilisateur
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserService.toggleUserStatus(id);
    res.json(createSuccessResponse(user));
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut utilisateur:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la mise à jour du statut utilisateur', 'USER_STATUS_UPDATE_ERROR'));
  }
};

// Liste des réservations avec filtres
export const getBookings = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters = {
      status: req.query.status as string,
      serviceType: req.query.serviceType as string
    };

    const { bookings, total } = await BookingService.getBookings(page, limit, filters);
    res.json(createPaginatedResponse(bookings, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la récupération des réservations', 'BOOKINGS_FETCH_ERROR'));
  }
};

// Assigner un chauffeur à une réservation
export const assignDriver = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { driverId, vehicleId } = req.body;
    
    // Validation des paramètres
    if (!bookingId) {
      return res.status(400).json(createErrorResponse('ID de réservation manquant', 'MISSING_BOOKING_ID'));
    }
    if (!driverId) {
      return res.status(400).json(createErrorResponse('ID de chauffeur manquant', 'MISSING_DRIVER_ID'));
    }
    
    const booking = await BookingService.assignDriver(bookingId, driverId, vehicleId);
    res.json(createSuccessResponse(booking));
  } catch (error) {
    console.error('Erreur lors de l\'assignation du chauffeur:', error);
    
    // Gestion d'erreurs plus spécifique
    if (error.message === 'Impossible d\'assigner un chauffeur à une réservation terminée ou annulée') {
      return res.status(400).json(createErrorResponse(
        'Impossible d\'assigner un chauffeur à une réservation terminée ou annulée.', 
        'BOOKING_COMPLETED_OR_CANCELLED'
      ));
    }
    if (error.message === 'Chauffeur non trouvé') {
      return res.status(404).json(createErrorResponse('Chauffeur non trouvé', 'DRIVER_NOT_FOUND'));
    }
    // Note: Removed status restrictions to allow flexible manual driver assignment
    // Administrators can now assign/reassign drivers to any active booking
    
    res.status(500).json(createErrorResponse('Erreur lors de l\'assignation du chauffeur', 'DRIVER_ASSIGNMENT_ERROR'));
  }
};

// Désassigner un chauffeur d'une réservation
export const unassignDriver = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    
    // Validation des paramètres
    if (!bookingId) {
      return res.status(400).json(createErrorResponse('ID de réservation manquant', 'MISSING_BOOKING_ID'));
    }
    
    const booking = await BookingService.unassignDriver(bookingId);
    res.json(createSuccessResponse(booking));
  } catch (error) {
    console.error('Erreur lors de la désassignation du chauffeur:', error);
    
    // Gestion d'erreurs plus spécifique
    if (error.message === 'Impossible de désassigner un chauffeur d\'une réservation en cours') {
      return res.status(400).json(createErrorResponse(
        'Impossible de désassigner un chauffeur d\'une réservation en cours', 
        'BOOKING_IN_PROGRESS'
      ));
    }
    if (error.message.includes('Réservation non trouvée')) {
      return res.status(404).json(createErrorResponse('Réservation non trouvée', 'BOOKING_NOT_FOUND'));
    }
    
    res.status(500).json(createErrorResponse('Erreur lors de la désassignation du chauffeur', 'DRIVER_UNASSIGNMENT_ERROR'));
  }
};

// Marquer une réservation comme terminée avec paiement
export const completeBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { method, amount, transactionId } = req.body;

    // Vérifier si la réservation existe et est en cours
    const existingBooking = await prisma.booking.findUnique({ 
      where: { id: bookingId },
      include: {
        user: true
      }
    });
    
    if (!existingBooking) {
      return res.status(404).json(createErrorResponse('Réservation non trouvée', 'BOOKING_NOT_FOUND'));
    }

    if (existingBooking.status !== 'IN_PROGRESS') {
      return res.status(400).json(createErrorResponse('Seules les réservations en cours peuvent être marquées comme terminées', 'INVALID_BOOKING_STATUS'));
    }

    // Utiliser une transaction pour s'assurer de la cohérence des données
    const result = await prisma.$transaction(async (tx) => {
      // Marquer la réservation comme terminée
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'COMPLETED'
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true
            }
          },
          driver: {
            select: {
              id: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true
                }
              }
            }
          },
          vehicle: {
            select: {
              id: true,
              type: true,
              brand: true,
              model: true,
              licensePlate: true
            }
          }
        }
      });

      // Créer l'enregistrement de paiement
      const payment = await tx.payment.create({
        data: {
          bookingId: bookingId,
          userId: existingBooking.userId,
          amount: amount,
          currency: 'XOF',
          method: method,
          status: 'COMPLETED',
          transactionId: transactionId
        }
      });

      return { booking: updatedBooking, payment };
    });

    res.json(createSuccessResponse({
      booking: result.booking,
      payment: result.payment
    }));
  } catch (error) {
    console.error('Erreur lors de la finalisation de la réservation:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la finalisation de la réservation', 'BOOKING_COMPLETION_ERROR'));
  }
};

// Récupérer la liste des paiements
export const getPayments = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10', status, method, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Construire les filtres
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (method) {
      where.method = method;
    }
    
    if (search) {
      where.OR = [
        {
          booking: {
            user: {
              OR: [
                { firstName: { contains: search as string, mode: 'insensitive' } },
                { lastName: { contains: search as string, mode: 'insensitive' } }
              ]
            }
          }
        },
        {
          transactionId: { contains: search as string, mode: 'insensitive' }
        }
      ];
    }

    // Récupérer les paiements avec pagination
    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          booking: {
            select: {
              id: true,
              pickupLocation: true,
              destination: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limitNum
      }),
      prisma.payment.count({ where })
    ]);

    res.json(createPaginatedResponse(payments, totalCount, pageNum, limitNum));
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la récupération des paiements', 'PAYMENTS_FETCH_ERROR'));
  }
};

// Liste des chauffeurs disponibles
export const getAvailableDrivers = async (req: Request, res: Response) => {
  try {
    const drivers = await prisma.driver.findMany({
      where: {
        isAvailable: true,
        user: {
          isActive: true
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        vehicle: {
          select: {
            id: true,
            type: true,
            brand: true,
            model: true,
            licensePlate: true
          }
        }
      }
    });

    res.json(createSuccessResponse(drivers));
  } catch (error) {
    console.error('Erreur lors de la récupération des chauffeurs disponibles:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la récupération des chauffeurs disponibles', 'AVAILABLE_DRIVERS_ERROR'));
  }
};

// Statistiques des revenus par période
export const getRevenueStats = async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || 'month';
    
    // Utiliser le cache avec une clé spécifique à la période
    const cacheKey = `${CACHE_KEYS.REVENUE_STATS}:${period}`;
    const stats = await cache.getOrSet(
      cacheKey,
      async () => {
        return await calculateRevenueStats(period);
      },
      CACHE_TTL.MEDIUM // Cache pendant 5 minutes
    );

    res.json(createSuccessResponse(stats));
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de revenus:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la récupération des statistiques de revenus', 'REVENUE_STATS_ERROR'));
  }
};

// Fonction séparée pour calculer les statistiques de revenus (optimisée)
const calculateRevenueStats = async (period: string) => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'week':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const previousPeriodStart = new Date(startDate);
  previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);

  // Exécuter les deux requêtes en parallèle pour optimiser les performances
  const [revenue, previousRevenue] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate
        }
      },
      _sum: {
        amount: true
      }
    }),
    prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate
        }
      },
      _sum: {
        amount: true
      }
    })
  ]);

  const currentAmount = revenue._sum.amount || 0;
  const previousAmount = previousRevenue._sum.amount || 0;
  const growth = previousAmount > 0 ? ((currentAmount - previousAmount) / previousAmount) * 100 : 0;

  return {
    current: currentAmount,
    previous: previousAmount,
    growth: Math.round(growth * 100) / 100,
    period
  };
};

// CRUD Utilisateurs
export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const user = await UserService.createUser(userData);
    res.status(201).json(createSuccessResponse(user));
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la création de l\'utilisateur', 'USER_CREATE_ERROR'));
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    const user = await UserService.updateUser(id, userData);
    res.json(createSuccessResponse(user));
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la mise à jour de l\'utilisateur', 'USER_UPDATE_ERROR'));
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await UserService.deleteUser(id);
    res.json(createSuccessResponse({ deleted: true }));
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json(createErrorResponse('Erreur lors de la suppression de l\'utilisateur', 'USER_DELETE_ERROR'));
  }
};

// Database Management Functions

// JSON restore functions
const restoreFromJsonBackup = async (req: Request, res: Response, backupPath: string) => {
  try {
    console.log('🔄 Restoring from JSON backup file...');
    
    // Read the JSON backup file
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    const backupData = JSON.parse(backupContent);
    
    return await restoreFromJsonData(req, res, backupData);
    
  } catch (error: any) {
    console.error('❌ JSON backup file restore failed:', error.message);
    res.status(500).json(createErrorResponse(`Erreur lors de la lecture du fichier JSON: ${error.message}`, 'JSON_FILE_READ_ERROR'));
  }
};

const restoreFromJsonData = async (req: Request, res: Response, backupData: any) => {
  try {
    console.log('🔄 Restoring from JSON data...');
    
    // Validate backup data structure
    if (!backupData.data || !backupData.metadata) {
      return res.status(400).json(createErrorResponse('Format de sauvegarde JSON invalide', 'INVALID_JSON_FORMAT'));
    }
    
    const { data } = backupData;
    let restoredCounts = {
      users: 0,
      drivers: 0,
      vehicles: 0,
      bookings: 0,
      payments: 0,
      services: 0
    };
    
    // Start a transaction for data consistency
    await prisma.$transaction(async (tx) => {
      // Clear existing data (be careful!)
      console.log('🗑️ Clearing existing data...');
      await tx.payment.deleteMany();
      await tx.booking.deleteMany();
      await tx.driver.deleteMany();
      await tx.vehicle.deleteMany();
      await tx.service.deleteMany();
      await tx.user.deleteMany();
      
      // Restore services first (no dependencies)
      if (data.services && data.services.length > 0) {
        console.log(`📋 Restoring ${data.services.length} services...`);
        for (const service of data.services) {
          await tx.service.create({
            data: {
              id: service.id,
              name: service.name,
              description: service.description,
              basePrice: service.basePrice,
              icon: service.icon,
              createdAt: new Date(service.createdAt),
              updatedAt: new Date(service.updatedAt)
            }
          });
          restoredCounts.services++;
        }
      }
      
      // Restore users (no dependencies)
      if (data.users && data.users.length > 0) {
        console.log(`👥 Restoring ${data.users.length} users...`);
        for (const user of data.users) {
          await tx.user.create({
            data: {
              id: user.id,
              email: user.email,
              phone: user.phone,
              firstName: user.firstName,
              lastName: user.lastName,
              password: user.password,
              role: user.role,
              isActive: user.isActive,
              createdAt: new Date(user.createdAt),
              updatedAt: new Date(user.updatedAt)
            }
          });
          restoredCounts.users++;
        }
      }
      
      // Restore vehicles (no dependencies)
      if (data.vehicles && data.vehicles.length > 0) {
        console.log(`🚗 Restoring ${data.vehicles.length} vehicles...`);
        for (const vehicle of data.vehicles) {
          await tx.vehicle.create({
            data: {
              id: vehicle.id,
              type: vehicle.type,
              brand: vehicle.brand,
              model: vehicle.model,
              year: vehicle.year,
              licensePlate: vehicle.licensePlate,
              capacity: vehicle.capacity,
              priceMultiplier: vehicle.priceMultiplier,
              isAvailable: vehicle.isAvailable,
              features: vehicle.features,
              createdAt: new Date(vehicle.createdAt),
              updatedAt: new Date(vehicle.updatedAt)
            }
          });
          restoredCounts.vehicles++;
        }
      }
      
      // Restore drivers (depends on users and vehicles)
      if (data.drivers && data.drivers.length > 0) {
        console.log(`🚛 Restoring ${data.drivers.length} drivers...`);
        for (const driver of data.drivers) {
          await tx.driver.create({
            data: {
              id: driver.id,
              userId: driver.userId,
              licenseNumber: driver.licenseNumber,
              vehicleId: driver.vehicleId,
              isAvailable: driver.isAvailable,
              rating: driver.rating,
              totalRides: driver.totalRides,
              createdAt: new Date(driver.createdAt),
              updatedAt: new Date(driver.updatedAt)
            }
          });
          restoredCounts.drivers++;
        }
      }
      
      // Restore bookings (depends on users, drivers, vehicles)
      if (data.bookings && data.bookings.length > 0) {
        console.log(`📅 Restoring ${data.bookings.length} bookings...`);
        for (const booking of data.bookings) {
          await tx.booking.create({
            data: {
              id: booking.id,
              userId: booking.userId,
              driverId: booking.driverId,
              vehicleId: booking.vehicleId,
              serviceType: booking.serviceType,
              pickupLocation: booking.pickupLocation,
              pickupLat: booking.pickupLat,
              pickupLng: booking.pickupLng,
              destination: booking.destination,
              destinationLat: booking.destinationLat,
              destinationLng: booking.destinationLng,
              scheduledDate: new Date(booking.scheduledDate),
              scheduledTime: booking.scheduledTime,
              passengers: booking.passengers,
              status: booking.status,
              totalPrice: booking.totalPrice,
              distance: booking.distance,
              duration: booking.duration,
              specialRequests: booking.specialRequests,
              createdAt: new Date(booking.createdAt),
              updatedAt: new Date(booking.updatedAt)
            }
          });
          restoredCounts.bookings++;
        }
      }
      
      // Restore payments (depends on bookings and users)
      if (data.payments && data.payments.length > 0) {
        console.log(`💳 Restoring ${data.payments.length} payments...`);
        for (const payment of data.payments) {
          await tx.payment.create({
            data: {
              id: payment.id,
              bookingId: payment.bookingId,
              userId: payment.userId,
              amount: payment.amount,
              currency: payment.currency,
              method: payment.method,
              status: payment.status,
              transactionId: payment.transactionId,
              phoneNumber: payment.phoneNumber,
              createdAt: new Date(payment.createdAt),
              updatedAt: new Date(payment.updatedAt)
            }
          });
          restoredCounts.payments++;
        }
      }
    });
    
    console.log('✅ JSON restore completed successfully');
    
    res.json(createSuccessResponse({
      message: 'Base de données restaurée avec succès depuis la sauvegarde JSON',
      restored: {
        filename: backupData.metadata?.created || 'JSON Data',
        restoredAt: new Date().toLocaleString('fr-FR'),
        counts: restoredCounts,
        totalRecords: Object.values(restoredCounts).reduce((a, b) => a + b, 0)
      }
    }));
    
  } catch (error: any) {
    console.error('❌ JSON restore failed:', error.message);
    res.status(500).json(createErrorResponse(`Erreur lors de la restauration JSON: ${error.message}`, 'JSON_RESTORE_ERROR'));
  }
};

// Prisma-based backup for serverless environments
const createPrismaBackup = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Creating Prisma-based backup for serverless environment...');
    
    // Generate timestamp for backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                     new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
    const backupFile = `wemoov-backup-${timestamp}.json`;
    
    // Export all data using Prisma
    const [users, drivers, vehicles, bookings, payments, services] = await Promise.all([
      prisma.user.findMany({
        include: {
          driver: true,
          bookings: true,
          payments: true
        }
      }),
      prisma.driver.findMany({
        include: {
          user: true,
          vehicle: true,
          bookings: true
        }
      }),
      prisma.vehicle.findMany({
        include: {
          drivers: true,
          bookings: true
        }
      }),
      prisma.booking.findMany({
        include: {
          user: true,
          driver: true,
          vehicle: true,
          payments: true
        }
      }),
      prisma.payment.findMany({
        include: {
          booking: true,
          user: true
        }
      }),
      prisma.service.findMany()
    ]);
    
    const backupData = {
      metadata: {
        version: '1.0',
        created: new Date().toISOString(),
        type: 'prisma-json-backup',
        tables: ['users', 'drivers', 'vehicles', 'bookings', 'payments', 'services']
      },
      data: {
        users,
        drivers,
        vehicles,
        bookings,
        payments,
        services
      }
    };
    
    const backupJson = JSON.stringify(backupData, null, 2);
    const fileSizeInMB = (Buffer.byteLength(backupJson, 'utf8') / (1024 * 1024)).toFixed(2);
    
    console.log('✅ Prisma backup completed successfully');
    
    res.json(createSuccessResponse({
      message: 'Sauvegarde créée avec succès (format JSON)',
      backup: {
        filename: backupFile,
        size: fileSizeInMB,
        path: `/tmp/${backupFile}`, // Serverless temp path
        created: new Date().toLocaleString('fr-FR'),
        type: 'json',
        records: {
          users: users.length,
          drivers: drivers.length,
          vehicles: vehicles.length,
          bookings: bookings.length,
          payments: payments.length,
          services: services.length
        }
      },
      downloadUrl: `data:application/json;charset=utf-8,${encodeURIComponent(backupJson)}`
    }));
    
  } catch (error: any) {
    console.error('❌ Prisma backup failed:', error.message);
    res.status(500).json(createErrorResponse(`Erreur lors de la sauvegarde Prisma: ${error.message}`, 'PRISMA_BACKUP_ERROR'));
  }
};

export const createDatabaseBackup = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Starting database backup from dashboard...');
    
    // Check if we're in a serverless environment (Vercel)
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    if (isServerless) {
      // Use Prisma-based backup for serverless environments
      return await createPrismaBackup(req, res);
    }
    
    // Get the direct database URL for local/traditional environments
    const directDbUrl = process.env.DIRECT_DATABASE_URL;
    
    if (!directDbUrl) {
      return res.status(500).json(createErrorResponse('DIRECT_DATABASE_URL not configured', 'DATABASE_CONFIG_ERROR'));
    }
    
    // Create backups directory if it doesn't exist
    const backupsDir = path.join(__dirname, '..', '..', 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    
    // Generate timestamp for backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                     new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
    const backupFile = `wemoov-backup-${timestamp}.bak`;
    const backupPath = path.join(backupsDir, backupFile);
    
    // Add PostgreSQL to PATH for this process
    process.env.PATH = `/opt/homebrew/opt/postgresql@17/bin:${process.env.PATH}`;
    
    // Use pg_dump with custom format for better compression and restore options
    const command = `pg_dump -Fc -v -d "${directDbUrl}" -f "${backupPath}"`;
    
    execSync(command, {
      stdio: 'pipe',
      maxBuffer: 1024 * 1024 * 100 // 100MB buffer for large databases
    });
    
    // Check if backup file was created and get its size
    if (fs.existsSync(backupPath)) {
      const stats = fs.statSync(backupPath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log('✅ Backup completed successfully from dashboard');
      
      res.json(createSuccessResponse({
        message: 'Sauvegarde créée avec succès',
        backup: {
          filename: backupFile,
          size: fileSizeInMB,
          path: backupPath,
          created: new Date().toLocaleString('fr-FR')
        }
      }));
    } else {
      res.status(500).json(createErrorResponse('Le fichier de sauvegarde n\'a pas été créé', 'BACKUP_FILE_ERROR'));
    }
    
  } catch (error: any) {
    console.error('❌ Backup failed from dashboard:', error.message);
    res.status(500).json(createErrorResponse(`Erreur lors de la sauvegarde: ${error.message}`, 'BACKUP_ERROR'));
  }
};

export const restoreDatabase = async (req: Request, res: Response) => {
  try {
    const { backupFile, backupData } = req.body;
    
    // Check if we're in a serverless environment
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    if (isServerless) {
      // In serverless environments, restore is not supported due to limitations
      return res.status(400).json(createErrorResponse('La restauration n\'est pas disponible en environnement serverless. Utilisez les sauvegardes JSON pour migrer les données manuellement.', 'RESTORE_NOT_SUPPORTED_SERVERLESS'));
    }
    
    if (!backupFile) {
      return res.status(400).json(createErrorResponse('Nom du fichier de sauvegarde requis', 'BACKUP_FILE_REQUIRED'));
    }
    
    console.log('🔄 Starting database restore from dashboard...');
    
    // Get the direct database URL
    const directDbUrl = process.env.DIRECT_DATABASE_URL;
    
    if (!directDbUrl) {
      return res.status(500).json(createErrorResponse('DIRECT_DATABASE_URL not configured', 'DATABASE_CONFIG_ERROR'));
    }
    
    // Check if backup file exists
    const backupsDir = path.join(__dirname, '..', '..', 'backups');
    const backupPath = path.join(backupsDir, backupFile);
    
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json(createErrorResponse('Fichier de sauvegarde non trouvé', 'BACKUP_FILE_NOT_FOUND'));
    }
    
    // Check if it's a JSON backup (Prisma format)
    if (backupFile && backupFile.endsWith('.json')) {
      return await restoreFromJsonBackup(req, res, backupPath);
    }
    
    // Handle JSON data directly (for dashboard upload)
    if (backupData) {
      return await restoreFromJsonData(req, res, backupData);
    }
    
    // Add PostgreSQL to PATH for this process
    process.env.PATH = `/opt/homebrew/opt/postgresql@17/bin:${process.env.PATH}`;
    
    // Restore the database
    const command = `pg_restore --clean --if-exists -v -d "${directDbUrl}" "${backupPath}"`;
    
    execSync(command, {
      stdio: 'pipe',
      maxBuffer: 1024 * 1024 * 100 // 100MB buffer
    });
    
    console.log('✅ Database restored successfully from dashboard');
    
    res.json(createSuccessResponse({
      message: 'Base de données restaurée avec succès',
      restored: {
        filename: backupFile,
        restoredAt: new Date().toLocaleString('fr-FR')
      }
    }));
    
  } catch (error: any) {
    console.error('❌ Restore failed from dashboard:', error.message);
    res.status(500).json(createErrorResponse(`Erreur lors de la restauration: ${error.message}`, 'RESTORE_ERROR'));
  }
};

export const getBackupsList = async (req: Request, res: Response) => {
  try {
    // Check if we're in a serverless environment
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    if (isServerless) {
      // In serverless environments, we can't store persistent files
      // Return empty list with information about backup limitations
      return res.json(createSuccessResponse({
        backups: [],
        message: 'Les sauvegardes en environnement serverless sont téléchargées directement',
        info: 'En mode serverless, les sauvegardes sont générées à la demande et téléchargées immédiatement'
      }));
    }
    
    const backupsDir = path.join(__dirname, '..', '..', 'backups');
    
    if (!fs.existsSync(backupsDir)) {
      return res.json(createSuccessResponse({
        backups: [],
        message: 'Aucune sauvegarde disponible'
      }));
    }
    
    const backupFiles = fs.readdirSync(backupsDir)
      .filter(file => file.startsWith('wemoov-backup-') && (file.endsWith('.bak') || file.endsWith('.json')))
      .map(file => {
        const filePath = path.join(backupsDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: (stats.size / (1024 * 1024)).toFixed(2), // Size in MB
          created: stats.birthtime.toLocaleString('fr-FR'),
          path: filePath,
          type: file.endsWith('.json') ? 'json' : 'postgresql'
        };
      })
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()); // Sort by newest first
    
    res.json(createSuccessResponse({
      backups: backupFiles,
      count: backupFiles.length
    }));
    
  } catch (error: any) {
    console.error('❌ Error listing backups:', error.message);
    res.status(500).json(createErrorResponse(`Erreur lors de la récupération des sauvegardes: ${error.message}`, 'BACKUPS_LIST_ERROR'));
  }
};

export const deleteBackup = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json(createErrorResponse('Nom du fichier requis', 'FILENAME_REQUIRED'));
    }
    
    // Security check: ensure filename is a valid backup file
    if (!filename.startsWith('wemoov-backup-') || !filename.endsWith('.bak')) {
      return res.status(400).json(createErrorResponse('Nom de fichier invalide', 'INVALID_FILENAME'));
    }
    
    const backupsDir = path.join(__dirname, '..', '..', 'backups');
    const filePath = path.join(backupsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json(createErrorResponse('Fichier de sauvegarde non trouvé', 'BACKUP_FILE_NOT_FOUND'));
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    
    console.log(`✅ Backup file deleted: ${filename}`);
    
    res.json(createSuccessResponse({
      message: 'Sauvegarde supprimée avec succès',
      deletedFile: filename
    }));
    
  } catch (error: any) {
    console.error('❌ Error deleting backup:', error.message);
    res.status(500).json(createErrorResponse(`Erreur lors de la suppression: ${error.message}`, 'DELETE_BACKUP_ERROR'));
  }
};