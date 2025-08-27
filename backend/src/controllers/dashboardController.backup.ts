import { Request, Response } from 'express';
import { prisma } from '../utils/database.js';
import { ApiResponse } from '../types/index.js';
import { cache, CACHE_KEYS, CACHE_TTL } from '../utils/cache.js';
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
    // Utiliser le cache pour éviter les requêtes répétées
    const stats = await cache.getOrSet(
      CACHE_KEYS.DASHBOARD_STATS,
      async () => {
        return await calculateDashboardStats();
      },
      CACHE_TTL.MEDIUM // Cache pendant 5 minutes
    );

    const response: ApiResponse = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques',
        code: 'STATS_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

// Fonction séparée pour calculer les statistiques (pour faciliter la mise en cache)
const calculateDashboardStats = async () => {
    // Dates pour les calculs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Requête optimisée avec Promise.all pour exécuter toutes les requêtes en parallèle
    const [
      // Statistiques des utilisateurs groupées
      userStats,
      // Statistiques des réservations groupées
      bookingStats,
      recentBookingsCount,
      // Statistiques des paiements groupées
      paymentStats,
      monthlyRevenueStats,
      // Statistiques des véhicules groupées
      vehicleStats
    ] = await Promise.all([
      // Une seule requête pour toutes les statistiques utilisateurs
      prisma.user.groupBy({
        by: ['role', 'isActive'],
        _count: { id: true }
      }),
      
      // Une seule requête pour toutes les statistiques de réservations
      prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      
      // Réservations récentes (7 derniers jours)
      prisma.booking.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      
      // Statistiques des paiements (revenus totaux et paiements en attente)
      prisma.payment.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { amount: true }
      }),
      
      // Revenus du mois en cours
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startOfMonth
          }
        },
        _sum: { amount: true }
      }),
      
      // Une seule requête pour toutes les statistiques de véhicules
      prisma.vehicle.groupBy({
        by: ['isAvailable'],
        _count: { id: true }
      })
    ]);

    // Traitement des résultats groupés pour les utilisateurs
    const processedUserStats = {
      total: 0,
      clients: 0,
      drivers: 0,
      active: 0
    };
    
    userStats.forEach((stat: any) => {
      processedUserStats.total += stat._count.id;
      if (stat.role === 'CLIENT') processedUserStats.clients += stat._count.id;
      if (stat.role === 'DRIVER') processedUserStats.drivers += stat._count.id;
      if (stat.isActive) processedUserStats.active += stat._count.id;
    });

    // Traitement des résultats groupés pour les réservations
    const processedBookingStats = {
      total: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
      recent: recentBookingsCount
    };
    
    bookingStats.forEach((stat: any) => {
      processedBookingStats.total += stat._count.id;
      if (stat.status === 'PENDING') processedBookingStats.pending = stat._count.id;
      if (stat.status === 'COMPLETED') processedBookingStats.completed = stat._count.id;
      if (stat.status === 'CANCELLED') processedBookingStats.cancelled = stat._count.id;
    });

    // Traitement des résultats groupés pour les paiements
    let totalRevenue = 0;
    let pendingPayments = 0;
    
    paymentStats.forEach((stat: any) => {
      if (stat.status === 'COMPLETED') {
        totalRevenue = stat._sum.amount || 0;
      }
      if (stat.status === 'PENDING') {
        pendingPayments = stat._count.id;
      }
    });

    // Traitement des résultats groupés pour les véhicules
    const processedVehicleStats = {
      total: 0,
      available: 0
    };
    
    vehicleStats.forEach((stat: any) => {
      processedVehicleStats.total += stat._count.id;
      if (stat.isAvailable) processedVehicleStats.available += stat._count.id;
    });

    const stats = {
      users: {
        total: processedUserStats.total,
        clients: processedUserStats.clients,
        drivers: processedUserStats.drivers,
        active: processedUserStats.active
      },
      bookings: {
        total: processedBookingStats.total,
        pending: processedBookingStats.pending,
        completed: processedBookingStats.completed,
        cancelled: processedBookingStats.cancelled,
        recent: processedBookingStats.recent
      },
      payments: {
        totalRevenue: totalRevenue,
        monthlyRevenue: monthlyRevenueStats._sum.amount || 0,
        pending: pendingPayments
      },
      vehicles: {
        total: processedVehicleStats.total,
        available: processedVehicleStats.available
      }
    };

    return stats;
};

// CRUD Réservations
export const createBooking = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      serviceType,
      pickupLocation,
      pickupLat,
      pickupLng,
      destination,
      destinationLat,
      destinationLng,
      scheduledDate,
      scheduledTime,
      passengers,
      totalPrice,
      specialRequests
    } = req.body;

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceType,
        pickupLocation,
        pickupLat,
        pickupLng,
        destination,
        destinationLat,
        destinationLng,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        passengers,
        totalPrice,
        specialRequests,
        status: 'PENDING'
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
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: booking
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la création de la réservation',
        code: 'BOOKING_CREATE_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      serviceType,
      pickupLocation,
      pickupLat,
      pickupLng,
      destination,
      destinationLat,
      destinationLng,
      scheduledDate,
      scheduledTime,
      passengers,
      totalPrice,
      status,
      specialRequests
    } = req.body;

    // Vérifier si la réservation existe
    const existingBooking = await prisma.booking.findUnique({ where: { id } });
    if (!existingBooking) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Réservation non trouvée',
          code: 'BOOKING_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        serviceType,
        pickupLocation,
        pickupLat,
        pickupLng,
        destination,
        destinationLat,
        destinationLng,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        scheduledTime,
        passengers,
        totalPrice,
        status,
        specialRequests
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

    const response: ApiResponse = {
      success: true,
      data: booking
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réservation:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour de la réservation',
        code: 'BOOKING_UPDATE_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si la réservation existe
    const existingBooking = await prisma.booking.findUnique({ where: { id } });
    if (!existingBooking) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Réservation non trouvée',
          code: 'BOOKING_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    // Vérifier si la réservation peut être supprimée
    if (existingBooking.status === 'IN_PROGRESS') {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Impossible de supprimer une réservation en cours',
          code: 'BOOKING_IN_PROGRESS'
        }
      };
      return res.status(400).json(response);
    }

    await prisma.booking.delete({ where: { id } });

    const response: ApiResponse = {
      success: true,
      data: { deleted: true }
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la suppression de la réservation:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la suppression de la réservation',
        code: 'BOOKING_DELETE_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

// CRUD Chauffeurs
export const getDrivers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } }
        ]
      };
    }

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              isActive: true
            }
          },
          vehicle: {
            select: {
              id: true,
              type: true,
              brand: true,
              model: true,
              licensePlate: true,
              capacity: true,
              isAvailable: true
            }
          },
          _count: {
            select: {
              bookings: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.driver.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      data: drivers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des chauffeurs:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la récupération des chauffeurs',
        code: 'DRIVERS_FETCH_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

export const createDriver = async (req: Request, res: Response) => {
  try {
    const { userId, licenseNumber, vehicleId } = req.body;

    // Vérifier que l'utilisateur existe et n'est pas déjà chauffeur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { driver: true }
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    if (user.driver) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Cet utilisateur est déjà un chauffeur',
          code: 'USER_ALREADY_DRIVER'
        }
      };
      return res.status(400).json(response);
    }

    // Vérifier l'unicité du numéro de permis
    const existingDriver = await prisma.driver.findUnique({
      where: { licenseNumber }
    });

    if (existingDriver) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Un chauffeur avec ce numéro de permis existe déjà',
          code: 'LICENSE_ALREADY_EXISTS'
        }
      };
      return res.status(400).json(response);
    }

    // Vérifier que le véhicule existe s'il est spécifié
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) {
        const response: ApiResponse = {
          success: false,
          error: {
            message: 'Véhicule non trouvé',
            code: 'VEHICLE_NOT_FOUND'
          }
        };
        return res.status(404).json(response);
      }
    }

    // Mettre à jour le rôle de l'utilisateur et créer le chauffeur
    const [updatedUser, driver] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role: 'DRIVER' }
      }),
      prisma.driver.create({
        data: {
          userId,
          licenseNumber,
          vehicleId
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              isActive: true
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
      })
    ]);

    const response: ApiResponse = {
      success: true,
      data: driver
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Erreur lors de la création du chauffeur:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la création du chauffeur',
        code: 'DRIVER_CREATE_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

export const updateDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { licenseNumber, vehicleId, isAvailable } = req.body;

    // Vérifier si le chauffeur existe
    const existingDriver = await prisma.driver.findUnique({ where: { id } });
    if (!existingDriver) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Chauffeur non trouvé',
          code: 'DRIVER_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    // Vérifier l'unicité du numéro de permis si modifié
    if (licenseNumber && licenseNumber !== existingDriver.licenseNumber) {
      const duplicate = await prisma.driver.findUnique({
        where: { licenseNumber }
      });

      if (duplicate) {
        const response: ApiResponse = {
          success: false,
          error: {
            message: 'Un autre chauffeur avec ce numéro de permis existe déjà',
            code: 'LICENSE_DUPLICATE_ERROR'
          }
        };
        return res.status(400).json(response);
      }
    }

    // Vérifier que le véhicule existe s'il est spécifié
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) {
        const response: ApiResponse = {
          success: false,
          error: {
            message: 'Véhicule non trouvé',
            code: 'VEHICLE_NOT_FOUND'
          }
        };
        return res.status(404).json(response);
      }
    }

    const driver = await prisma.driver.update({
      where: { id },
      data: {
        licenseNumber,
        vehicleId,
        isAvailable
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            isActive: true
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

    const response: ApiResponse = {
      success: true,
      data: driver
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du chauffeur:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour du chauffeur',
        code: 'DRIVER_UPDATE_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

export const deleteDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si le chauffeur existe
    const existingDriver = await prisma.driver.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingDriver) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Chauffeur non trouvé',
          code: 'DRIVER_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    // Vérifier s'il y a des réservations actives
    const activeBookings = await prisma.booking.count({
      where: {
        driverId: id,
        status: {
          in: ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS']
        }
      }
    });

    if (activeBookings > 0) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Impossible de supprimer un chauffeur avec des réservations actives',
          code: 'DRIVER_HAS_ACTIVE_BOOKINGS'
        }
      };
      return res.status(400).json(response);
    }

    // Supprimer le chauffeur et remettre l'utilisateur en CLIENT
    await prisma.$transaction([
      prisma.driver.delete({ where: { id } }),
      prisma.user.update({
        where: { id: existingDriver.userId },
        data: { role: 'CLIENT' }
      })
    ]);

    const response: ApiResponse = {
      success: true,
      data: { deleted: true }
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la suppression du chauffeur:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la suppression du chauffeur',
        code: 'DRIVER_DELETE_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

// CRUD Véhicules
export const getVehicles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const type = req.query.type as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (type) where.type = type;

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        include: {
          drivers: {
            select: {
              id: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true
                }
              },
              isAvailable: true
            }
          },
          _count: {
            select: {
              bookings: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.vehicle.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la récupération des véhicules',
        code: 'VEHICLES_FETCH_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const {
      type,
      brand,
      model,
      year,
      licensePlate,
      capacity,
      priceMultiplier,
      features
    } = req.body;

    // Vérifier l'unicité de la plaque d'immatriculation
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { licensePlate }
    });

    if (existingVehicle) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Un véhicule avec cette plaque d\'immatriculation existe déjà',
          code: 'LICENSE_PLATE_ALREADY_EXISTS'
        }
      };
      return res.status(400).json(response);
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        type,
        brand,
        model,
        year,
        licensePlate,
        capacity,
        priceMultiplier: priceMultiplier || 1.0,
        features: features || []
      },
      include: {
        drivers: {
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
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: vehicle
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Erreur lors de la création du véhicule:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la création du véhicule',
        code: 'VEHICLE_CREATE_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      type,
      brand,
      model,
      year,
      licensePlate,
      capacity,
      priceMultiplier,
      features,
      isAvailable
    } = req.body;

    // Vérifier si le véhicule existe
    const existingVehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!existingVehicle) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Véhicule non trouvé',
          code: 'VEHICLE_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    // Vérifier l'unicité de la plaque si modifiée
    if (licensePlate && licensePlate !== existingVehicle.licensePlate) {
      const duplicate = await prisma.vehicle.findUnique({
        where: { licensePlate }
      });

      if (duplicate) {
        const response: ApiResponse = {
          success: false,
          error: {
            message: 'Un autre véhicule avec cette plaque d\'immatriculation existe déjà',
            code: 'LICENSE_PLATE_DUPLICATE_ERROR'
          }
        };
        return res.status(400).json(response);
      }
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        type,
        brand,
        model,
        year,
        licensePlate,
        capacity,
        priceMultiplier,
        features,
        isAvailable
      },
      include: {
        drivers: {
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
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: vehicle
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du véhicule:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour du véhicule',
        code: 'VEHICLE_UPDATE_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si le véhicule existe
    const existingVehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!existingVehicle) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Véhicule non trouvé',
          code: 'VEHICLE_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    // Vérifier s'il y a des réservations actives
    const activeBookings = await prisma.booking.count({
      where: {
        vehicleId: id,
        status: {
          in: ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS']
        }
      }
    });

    if (activeBookings > 0) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Impossible de supprimer un véhicule avec des réservations actives',
          code: 'VEHICLE_HAS_ACTIVE_BOOKINGS'
        }
      };
      return res.status(400).json(response);
    }

    // Vérifier s'il y a des chauffeurs assignés
    const assignedDrivers = await prisma.driver.count({
      where: { vehicleId: id }
    });

    if (assignedDrivers > 0) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Impossible de supprimer un véhicule avec des chauffeurs assignés',
          code: 'VEHICLE_HAS_ASSIGNED_DRIVERS'
        }
      };
      return res.status(400).json(response);
    }

    await prisma.vehicle.delete({ where: { id } });

    const response: ApiResponse = {
      success: true,
      data: { deleted: true }
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la suppression du véhicule:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la suppression du véhicule',
        code: 'VEHICLE_DELETE_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

// Liste des utilisateurs avec pagination
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              bookings: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la récupération des utilisateurs',
        code: 'USERS_FETCH_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

// Détails d'un utilisateur
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        bookings: {
          select: {
            id: true,
            serviceType: true,
            status: true,
            totalPrice: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        driver: {
          select: {
            id: true,
            licenseNumber: true,
            isAvailable: true,
            rating: true,
            totalRides: true,
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
        }
      }
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: user
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails utilisateur:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la récupération des détails utilisateur',
        code: 'USER_DETAILS_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

// Activer/désactiver un utilisateur
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: user
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut utilisateur:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour du statut utilisateur',
        code: 'USER_STATUS_UPDATE_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

// Liste des réservations avec filtres
export const getBookings = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const serviceType = req.query.serviceType as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (serviceType) where.serviceType = serviceType;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true
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
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la récupération des réservations',
        code: 'BOOKINGS_FETCH_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

// Assigner un chauffeur à une réservation
export const assignDriver = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { driverId, vehicleId } = req.body;

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        driverId,
        vehicleId,
        status: 'ASSIGNED'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        driver: {
          select: {
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
            type: true,
            brand: true,
            model: true,
            licensePlate: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: booking
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de l\'assignation du chauffeur:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de l\'assignation du chauffeur',
        code: 'DRIVER_ASSIGNMENT_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

// Désassigner un chauffeur d'une réservation
export const unassignDriver = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        driverId: null,
        vehicleId: null,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: booking
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la désassignation du chauffeur:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la désassignation du chauffeur',
        code: 'DRIVER_UNASSIGNMENT_ERROR'
      }
    };
    res.status(500).json(response);
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

    const response: ApiResponse = {
      success: true,
      data: drivers
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des chauffeurs disponibles:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la récupération des chauffeurs disponibles',
        code: 'AVAILABLE_DRIVERS_ERROR'
      }
    };
    res.status(500).json(response);
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

    const response: ApiResponse = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de revenus:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques de revenus',
        code: 'REVENUE_STATS_ERROR'
      }
    };
    res.status(500).json(response);
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
    const { email, phone, firstName, lastName, password, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });

    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Un utilisateur avec cet email ou ce téléphone existe déjà',
          code: 'USER_ALREADY_EXISTS'
        }
      };
      return res.status(400).json(response);
    }

    // Hasher le mot de passe
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        firstName,
        lastName,
        password: hashedPassword,
        role: role || 'CLIENT'
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: user
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la création de l\'utilisateur',
        code: 'USER_CREATE_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, phone, firstName, lastName, role, isActive } = req.body;

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    // Vérifier les doublons email/phone si modifiés
    if (email !== existingUser.email || phone !== existingUser.phone) {
      const duplicate = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                { email },
                { phone }
              ]
            }
          ]
        }
      });

      if (duplicate) {
        const response: ApiResponse = {
          success: false,
          error: {
            message: 'Un autre utilisateur avec cet email ou ce téléphone existe déjà',
            code: 'USER_DUPLICATE_ERROR'
          }
        };
        return res.status(400).json(response);
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        phone,
        firstName,
        lastName,
        role,
        isActive
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: user
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour de l\'utilisateur',
        code: 'USER_UPDATE_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    // Vérifier s'il y a des réservations actives
    const activeBookings = await prisma.booking.count({
      where: {
        userId: id,
        status: {
          in: ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS']
        }
      }
    });

    if (activeBookings > 0) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Impossible de supprimer un utilisateur avec des réservations actives',
          code: 'USER_HAS_ACTIVE_BOOKINGS'
        }
      };
      return res.status(400).json(response);
    }

    await prisma.user.delete({ where: { id } });

    const response: ApiResponse = {
      success: true,
      data: { deleted: true }
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la suppression de l\'utilisateur',
        code: 'USER_DELETE_ERROR'
      }
    };
    res.status(500).json(response);
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
    const response: ApiResponse = {
      success: false,
      error: {
        message: `Erreur lors de la lecture du fichier JSON: ${error.message}`,
        code: 'JSON_FILE_READ_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

const restoreFromJsonData = async (req: Request, res: Response, backupData: any) => {
  try {
    console.log('🔄 Restoring from JSON data...');
    
    // Validate backup data structure
    if (!backupData.data || !backupData.metadata) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Format de sauvegarde JSON invalide',
          code: 'INVALID_JSON_FORMAT'
        }
      };
      return res.status(400).json(response);
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
    
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Base de données restaurée avec succès depuis la sauvegarde JSON',
        restored: {
          filename: backupData.metadata?.created || 'JSON Data',
          restoredAt: new Date().toLocaleString('fr-FR'),
          counts: restoredCounts,
          totalRecords: Object.values(restoredCounts).reduce((a, b) => a + b, 0)
        }
      }
    };
    res.json(response);
    
  } catch (error: any) {
    console.error('❌ JSON restore failed:', error.message);
    const response: ApiResponse = {
      success: false,
      error: {
        message: `Erreur lors de la restauration JSON: ${error.message}`,
        code: 'JSON_RESTORE_ERROR'
      }
    };
    res.status(500).json(response);
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
    
    const response: ApiResponse = {
      success: true,
      data: {
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
      }
    };
    
    res.json(response);
    
  } catch (error: any) {
    console.error('❌ Prisma backup failed:', error.message);
    const response: ApiResponse = {
      success: false,
      error: {
        message: `Erreur lors de la sauvegarde Prisma: ${error.message}`,
        code: 'PRISMA_BACKUP_ERROR'
      }
    };
    res.status(500).json(response);
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
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'DIRECT_DATABASE_URL not configured',
          code: 'DATABASE_CONFIG_ERROR'
        }
      };
      return res.status(500).json(response);
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
      
      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Sauvegarde créée avec succès',
          backup: {
            filename: backupFile,
            size: fileSizeInMB,
            path: backupPath,
            created: new Date().toLocaleString('fr-FR')
          }
        }
      };
      res.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Le fichier de sauvegarde n\'a pas été créé',
          code: 'BACKUP_FILE_ERROR'
        }
      };
      res.status(500).json(response);
    }
    
  } catch (error: any) {
    console.error('❌ Backup failed from dashboard:', error.message);
    const response: ApiResponse = {
      success: false,
      error: {
        message: `Erreur lors de la sauvegarde: ${error.message}`,
        code: 'BACKUP_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

export const restoreDatabase = async (req: Request, res: Response) => {
  try {
    const { backupFile, backupData } = req.body;
    
    // Check if we're in a serverless environment
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    if (isServerless) {
      // In serverless environments, restore is not supported due to limitations
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'La restauration n\'est pas disponible en environnement serverless. Utilisez les sauvegardes JSON pour migrer les données manuellement.',
          code: 'RESTORE_NOT_SUPPORTED_SERVERLESS'
        }
      };
      return res.status(400).json(response);
    }
    
    if (!backupFile) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Nom du fichier de sauvegarde requis',
          code: 'BACKUP_FILE_REQUIRED'
        }
      };
      return res.status(400).json(response);
    }
    
    console.log('🔄 Starting database restore from dashboard...');
    
    // Get the direct database URL
    const directDbUrl = process.env.DIRECT_DATABASE_URL;
    
    if (!directDbUrl) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'DIRECT_DATABASE_URL not configured',
          code: 'DATABASE_CONFIG_ERROR'
        }
      };
      return res.status(500).json(response);
    }
    
    // Check if backup file exists
    const backupsDir = path.join(__dirname, '..', '..', 'backups');
    const backupPath = path.join(backupsDir, backupFile);
    
    if (!fs.existsSync(backupPath)) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Fichier de sauvegarde non trouvé',
          code: 'BACKUP_FILE_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
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
    
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Base de données restaurée avec succès',
        restored: {
          filename: backupFile,
          restoredAt: new Date().toLocaleString('fr-FR')
        }
      }
    };
    res.json(response);
    
  } catch (error: any) {
    console.error('❌ Restore failed from dashboard:', error.message);
    const response: ApiResponse = {
      success: false,
      error: {
        message: `Erreur lors de la restauration: ${error.message}`,
        code: 'RESTORE_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

export const getBackupsList = async (req: Request, res: Response) => {
  try {
    // Check if we're in a serverless environment
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    if (isServerless) {
      // In serverless environments, we can't store persistent files
      // Return empty list with information about backup limitations
      const response: ApiResponse = {
        success: true,
        data: {
          backups: [],
          message: 'Les sauvegardes en environnement serverless sont téléchargées directement',
          info: 'En mode serverless, les sauvegardes sont générées à la demande et téléchargées immédiatement'
        }
      };
      return res.json(response);
    }
    
    const backupsDir = path.join(__dirname, '..', '..', 'backups');
    
    if (!fs.existsSync(backupsDir)) {
      const response: ApiResponse = {
        success: true,
        data: {
          backups: [],
          message: 'Aucune sauvegarde disponible'
        }
      };
      return res.json(response);
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
    
    const response: ApiResponse = {
      success: true,
      data: {
        backups: backupFiles,
        count: backupFiles.length
      }
    };
    res.json(response);
    
  } catch (error: any) {
    console.error('❌ Error listing backups:', error.message);
    const response: ApiResponse = {
      success: false,
      error: {
        message: `Erreur lors de la récupération des sauvegardes: ${error.message}`,
        code: 'BACKUPS_LIST_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

export const deleteBackup = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Nom du fichier requis',
          code: 'FILENAME_REQUIRED'
        }
      };
      return res.status(400).json(response);
    }
    
    // Security check: ensure filename is a valid backup file
    if (!filename.startsWith('wemoov-backup-') || !filename.endsWith('.bak')) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Nom de fichier invalide',
          code: 'INVALID_FILENAME'
        }
      };
      return res.status(400).json(response);
    }
    
    const backupsDir = path.join(__dirname, '..', '..', 'backups');
    const filePath = path.join(backupsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Fichier de sauvegarde non trouvé',
          code: 'BACKUP_FILE_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    
    console.log(`✅ Backup file deleted: ${filename}`);
    
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Sauvegarde supprimée avec succès',
        deletedFile: filename
      }
    };
    res.json(response);
    
  } catch (error: any) {
    console.error('❌ Error deleting backup:', error.message);
    const response: ApiResponse = {
      success: false,
      error: {
        message: `Erreur lors de la suppression: ${error.message}`,
        code: 'DELETE_BACKUP_ERROR'
      }
    };
    res.status(500).json(response);
  }
};