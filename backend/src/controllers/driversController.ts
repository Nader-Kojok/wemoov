import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { ApiResponse } from '../types';

// Liste des chauffeurs avec pagination et filtres
export const getDrivers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const isAvailable = req.query.isAvailable as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true';
    }
    
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search } } },
        { licenseNumber: { contains: search, mode: 'insensitive' } }
      ];
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
              year: true,
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

// Détails d'un chauffeur
export const getDriverDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            isActive: true,
            createdAt: true
          }
        },
        vehicle: {
          select: {
            id: true,
            type: true,
            brand: true,
            model: true,
            year: true,
            licensePlate: true,
            capacity: true,
            features: true,
            isAvailable: true
          }
        },
        bookings: {
          select: {
            id: true,
            serviceType: true,
            status: true,
            scheduledDate: true,
            totalPrice: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!driver) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Chauffeur non trouvé',
          code: 'DRIVER_NOT_FOUND'
        }
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: driver
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du chauffeur:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la récupération des détails du chauffeur',
        code: 'DRIVER_DETAILS_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

// Mettre à jour la disponibilité d'un chauffeur
export const updateDriverAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const driver = await prisma.driver.update({
      where: { id },
      data: { isAvailable },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
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
    console.error('Erreur lors de la mise à jour de la disponibilité:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour de la disponibilité',
        code: 'DRIVER_AVAILABILITY_UPDATE_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

// Assigner un véhicule à un chauffeur
export const assignVehicleToDriver = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const { vehicleId } = req.body;

    // Vérifier que le véhicule n'est pas déjà assigné
    if (vehicleId) {
      const existingAssignment = await prisma.driver.findFirst({
        where: {
          vehicleId,
          id: { not: driverId }
        }
      });

      if (existingAssignment) {
        const response: ApiResponse = {
          success: false,
          error: {
            message: 'Ce véhicule est déjà assigné à un autre chauffeur',
            code: 'VEHICLE_ALREADY_ASSIGNED'
          }
        };
        return res.status(400).json(response);
      }
    }

    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: { vehicleId: vehicleId || null },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
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
    console.error('Erreur lors de l\'assignation du véhicule:', error);
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Erreur lors de l\'assignation du véhicule',
        code: 'VEHICLE_ASSIGNMENT_ERROR'
      }
    };
    res.status(500).json(response);
  }
};

// Liste des véhicules avec pagination et filtres
export const getVehicles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const type = req.query.type as string;
    const isAvailable = req.query.isAvailable as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (type) where.type = type;
    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true';
    }
    
    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } }
      ];
    }

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

// Créer un nouveau véhicule
export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { type, brand, model, year, licensePlate, capacity, features } = req.body;

    // Vérifier que la plaque d'immatriculation n'existe pas déjà
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { licensePlate }
    });

    if (existingVehicle) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Un véhicule avec cette plaque d\'immatriculation existe déjà',
          code: 'LICENSE_PLATE_EXISTS'
        }
      };
      return res.status(400).json(response);
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        type,
        brand,
        model,
        year: parseInt(year),
        licensePlate,
        capacity: parseInt(capacity),
        features: features || [],
        isAvailable: true
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

// Mettre à jour un véhicule
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, brand, model, year, licensePlate, capacity, features, isAvailable } = req.body;

    // Vérifier que la plaque d'immatriculation n'existe pas déjà (sauf pour ce véhicule)
    if (licensePlate) {
      const existingVehicle = await prisma.vehicle.findFirst({
        where: {
          licensePlate,
          id: { not: id }
        }
      });

      if (existingVehicle) {
        const response: ApiResponse = {
          success: false,
          error: {
            message: 'Un autre véhicule avec cette plaque d\'immatriculation existe déjà',
            code: 'LICENSE_PLATE_EXISTS'
          }
        };
        return res.status(400).json(response);
      }
    }

    const updateData: any = {};
    if (type) updateData.type = type;
    if (brand) updateData.brand = brand;
    if (model) updateData.model = model;
    if (year) updateData.year = parseInt(year);
    if (licensePlate) updateData.licensePlate = licensePlate;
    if (capacity) updateData.capacity = parseInt(capacity);
    if (features !== undefined) updateData.features = features;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData
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

// Supprimer un véhicule
export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier que le véhicule n'est pas assigné à un chauffeur
    const assignedDriver = await prisma.driver.findFirst({
      where: { vehicleId: id }
    });

    if (assignedDriver) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Impossible de supprimer un véhicule assigné à un chauffeur',
          code: 'VEHICLE_ASSIGNED'
        }
      };
      return res.status(400).json(response);
    }

    // Vérifier qu'il n'y a pas de réservations actives
    const activeBookings = await prisma.booking.findFirst({
      where: {
        vehicleId: id,
        status: {
          in: ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS']
        }
      }
    });

    if (activeBookings) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Impossible de supprimer un véhicule avec des réservations actives',
          code: 'VEHICLE_HAS_ACTIVE_BOOKINGS'
        }
      };
      return res.status(400).json(response);
    }

    await prisma.vehicle.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      data: { message: 'Véhicule supprimé avec succès' }
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