import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { ApiResponse } from '../types';

// Statistiques générales du dashboard
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Statistiques des utilisateurs
    const totalUsers = await prisma.user.count();
    const totalClients = await prisma.user.count({ where: { role: 'CLIENT' } });
    const totalDrivers = await prisma.user.count({ where: { role: 'DRIVER' } });
    const activeUsers = await prisma.user.count({ where: { isActive: true } });

    // Statistiques des réservations
    const totalBookings = await prisma.booking.count();
    const pendingBookings = await prisma.booking.count({ where: { status: 'PENDING' } });
    const completedBookings = await prisma.booking.count({ where: { status: 'COMPLETED' } });
    const cancelledBookings = await prisma.booking.count({ where: { status: 'CANCELLED' } });

    // Statistiques des paiements
    const totalRevenue = await prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    });
    const pendingPayments = await prisma.payment.count({ where: { status: 'PENDING' } });

    // Statistiques des véhicules
    const totalVehicles = await prisma.vehicle.count();
    const availableVehicles = await prisma.vehicle.count({ where: { isAvailable: true } });

    // Réservations récentes (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    // Revenus du mois en cours
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyRevenue = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: { amount: true }
    });

    const stats = {
      users: {
        total: totalUsers,
        clients: totalClients,
        drivers: totalDrivers,
        active: activeUsers
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        recent: recentBookings
      },
      payments: {
        totalRevenue: totalRevenue._sum.amount || 0,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
        pending: pendingPayments
      },
      vehicles: {
        total: totalVehicles,
        available: availableVehicles
      }
    };

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

    const revenue = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate
        }
      },
      _sum: {
        amount: true
      }
    });

    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
    
    const previousRevenue = await prisma.payment.aggregate({
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
    });

    const currentAmount = revenue._sum.amount || 0;
    const previousAmount = previousRevenue._sum.amount || 0;
    const growth = previousAmount > 0 ? ((currentAmount - previousAmount) / previousAmount) * 100 : 0;

    const response: ApiResponse = {
      success: true,
      data: {
        current: currentAmount,
        previous: previousAmount,
        growth: Math.round(growth * 100) / 100,
        period
      }
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