import { prisma } from '../utils/database.js';
import { VehicleWithRelations } from '../types/index.js';
import { 
  validateVehicleExists,
  validateLicensePlateUniqueness,
  validateRequiredFields
} from '../utils/validationHelpers.js';
import { QueryBuilder } from '../utils/queryBuilders.js';

/**
 * Interface for vehicle filters
 */
export interface VehicleFilters {
  search?: string;
  type?: string;
  isAvailable?: boolean | string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Interface for vehicle creation data
 */
export interface CreateVehicleData {
  type: 'SEDAN' | 'SUV' | 'VAN' | 'LUXURY';
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  capacity: number;
  priceMultiplier?: number;
  features?: string[];
}

/**
 * Interface for vehicle update data
 */
export interface UpdateVehicleData {
  type?: 'SEDAN' | 'SUV' | 'VAN' | 'LUXURY';
  brand?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  capacity?: number;
  priceMultiplier?: number;
  isAvailable?: boolean;
  features?: string[];
}

/**
 * Vehicle service class
 */
export class VehicleService {
  /**
   * Vehicle include query for relations
   */
  private static readonly VEHICLE_INCLUDE_QUERY = {
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
  };

  /**
   * Get paginated list of vehicles with filters
   * @param page - Page number
   * @param limit - Items per page
   * @param filters - Filter options
   * @returns Paginated vehicles list
   */
  static async getVehicles(
    page: number = 1, 
    limit: number = 10, 
    filters: VehicleFilters = {}
  ) {
    const paginationQuery = QueryBuilder.buildPaginationQuery(page, limit);
    const whereQuery = QueryBuilder.buildVehicleFilterQuery(filters);
    const orderByQuery = QueryBuilder.buildOrderByQuery('createdAt', 'desc');

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where: whereQuery,
        ...paginationQuery,
        include: this.VEHICLE_INCLUDE_QUERY,
        orderBy: orderByQuery
      }),
      prisma.vehicle.count({ where: whereQuery })
    ]);

    return {
      vehicles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get vehicle details by ID
   * @param vehicleId - Vehicle ID
   * @param includeBookings - Whether to include recent bookings
   * @returns Vehicle details
   */
  static async getVehicleById(vehicleId: string, includeBookings: boolean = false) {
    await validateVehicleExists(vehicleId);

    const includeQuery = {
      ...this.VEHICLE_INCLUDE_QUERY,
      ...(includeBookings && {
        bookings: {
          take: 10,
          orderBy: { createdAt: 'desc' as const },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true
              }
            },
            driver: {
              include: {
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
        }
      })
    };

    return await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: includeQuery
    });
  }

  /**
   * Create a new vehicle
   * @param vehicleData - Vehicle creation data
   * @returns Created vehicle
   */
  static async createVehicle(vehicleData: CreateVehicleData) {
    // Validate required fields
    validateRequiredFields(vehicleData, [
      'type', 'brand', 'model', 'year', 'licensePlate', 'capacity'
    ]);
    
    // Validate license plate uniqueness
    await validateLicensePlateUniqueness(vehicleData.licensePlate);
    
    // Validate year
    const currentYear = new Date().getFullYear();
    if (vehicleData.year < 1990 || vehicleData.year > currentYear + 1) {
      throw new Error(`L'année doit être entre 1990 et ${currentYear + 1}`);
    }
    
    // Validate capacity
    if (vehicleData.capacity < 1 || vehicleData.capacity > 50) {
      throw new Error('La capacité doit être entre 1 et 50 passagers');
    }
    
    // Validate price multiplier
    if (vehicleData.priceMultiplier && (vehicleData.priceMultiplier < 0.1 || vehicleData.priceMultiplier > 10)) {
      throw new Error('Le multiplicateur de prix doit être entre 0.1 et 10');
    }
    
    // Create vehicle
    return await prisma.vehicle.create({
      data: {
        type: vehicleData.type,
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        licensePlate: vehicleData.licensePlate,
        capacity: vehicleData.capacity,
        priceMultiplier: vehicleData.priceMultiplier || 1.0,
        features: vehicleData.features || [],
        isAvailable: true
      },
      include: this.VEHICLE_INCLUDE_QUERY
    });
  }

  /**
   * Update vehicle by ID
   * @param vehicleId - Vehicle ID
   * @param vehicleData - Vehicle update data
   * @returns Updated vehicle
   */
  static async updateVehicle(vehicleId: string, vehicleData: UpdateVehicleData) {
    // Validate vehicle exists
    const existingVehicle = await validateVehicleExists(vehicleId);
    
    // Validate license plate uniqueness if being updated
    if (vehicleData.licensePlate && vehicleData.licensePlate !== existingVehicle.licensePlate) {
      await validateLicensePlateUniqueness(vehicleData.licensePlate, vehicleId);
    }
    
    // Validate year if provided
    if (vehicleData.year) {
      const currentYear = new Date().getFullYear();
      if (vehicleData.year < 1990 || vehicleData.year > currentYear + 1) {
        throw new Error(`L'année doit être entre 1990 et ${currentYear + 1}`);
      }
    }
    
    // Validate capacity if provided
    if (vehicleData.capacity && (vehicleData.capacity < 1 || vehicleData.capacity > 50)) {
      throw new Error('La capacité doit être entre 1 et 50 passagers');
    }
    
    // Validate price multiplier if provided
    if (vehicleData.priceMultiplier && (vehicleData.priceMultiplier < 0.1 || vehicleData.priceMultiplier > 10)) {
      throw new Error('Le multiplicateur de prix doit être entre 0.1 et 10');
    }
    
    // Update vehicle
    return await prisma.vehicle.update({
      where: { id: vehicleId },
      data: vehicleData,
      include: this.VEHICLE_INCLUDE_QUERY
    });
  }

  /**
   * Delete vehicle by ID
   * @param vehicleId - Vehicle ID
   * @returns Success status
   */
  static async deleteVehicle(vehicleId: string) {
    await validateVehicleExists(vehicleId);
    
    // Check if vehicle has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        vehicleId,
        status: {
          in: ['CONFIRMED', 'ASSIGNED', 'IN_PROGRESS']
        }
      }
    });
    
    if (activeBookings > 0) {
      throw new Error('Impossible de supprimer un véhicule avec des réservations actives');
    }
    
    // Check if vehicle has assigned drivers
    const assignedDrivers = await prisma.driver.count({
      where: { vehicleId }
    });
    
    if (assignedDrivers > 0) {
      throw new Error('Impossible de supprimer un véhicule assigné à des chauffeurs');
    }
    
    // Delete vehicle
    await prisma.vehicle.delete({
      where: { id: vehicleId }
    });
    
    return { success: true };
  }

  /**
   * Toggle vehicle availability
   * @param vehicleId - Vehicle ID
   * @returns Updated vehicle
   */
  static async toggleVehicleAvailability(vehicleId: string) {
    const vehicle = await validateVehicleExists(vehicleId);
    
    return await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { isAvailable: !vehicle.isAvailable },
      include: this.VEHICLE_INCLUDE_QUERY
    });
  }

  /**
   * Get available vehicles
   * @param vehicleType - Optional vehicle type filter
   * @param capacity - Minimum capacity required
   * @returns Available vehicles
   */
  static async getAvailableVehicles(vehicleType?: string, capacity?: number) {
    const whereQuery: any = {
      isAvailable: true
    };
    
    if (vehicleType) {
      whereQuery.type = vehicleType;
    }
    
    if (capacity) {
      whereQuery.capacity = {
        gte: capacity
      };
    }

    return await prisma.vehicle.findMany({
      where: whereQuery,
      include: this.VEHICLE_INCLUDE_QUERY,
      orderBy: [
        { capacity: 'asc' },
        { priceMultiplier: 'asc' }
      ]
    });
  }

  /**
   * Get vehicles by type
   * @param type - Vehicle type
   * @param isAvailable - Filter by availability
   * @returns Vehicles of specified type
   */
  static async getVehiclesByType(type: string, isAvailable?: boolean) {
    const where: any = { type };
    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }

    return await prisma.vehicle.findMany({
      where,
      include: this.VEHICLE_INCLUDE_QUERY,
      orderBy: {
        capacity: 'asc'
      }
    });
  }

  /**
   * Get vehicle statistics
   * @returns Vehicle statistics
   */
  static async getVehicleStatistics() {
    const [totalVehicles, availableVehicles, typeStats, recentVehicles] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { isAvailable: true } }),
      prisma.vehicle.groupBy({
        by: ['type'],
        _count: { id: true }
      }),
      prisma.vehicle.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    const typeBreakdown = typeStats.reduce((acc: any, stat: any) => {
      acc[stat.type.toLowerCase()] = stat._count.id;
      return acc;
    }, {});

    return {
      total: totalVehicles,
      available: availableVehicles,
      unavailable: totalVehicles - availableVehicles,
      recent: recentVehicles,
      byType: typeBreakdown
    };
  }

  /**
   * Search vehicles by query
   * @param query - Search query
   * @param limit - Maximum results
   * @returns Matching vehicles
   */
  static async searchVehicles(query: string, limit: number = 10) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchQuery = QueryBuilder.buildVehicleSearchQuery(query);
    
    return await prisma.vehicle.findMany({
      where: searchQuery,
      include: {
        drivers: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      take: limit,
      orderBy: {
        brand: 'asc'
      }
    });
  }

  /**
   * Get vehicle's booking history
   * @param vehicleId - Vehicle ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns Vehicle's bookings
   */
  static async getVehicleBookings(vehicleId: string, page: number = 1, limit: number = 10) {
    await validateVehicleExists(vehicleId);
    
    const paginationQuery = QueryBuilder.buildPaginationQuery(page, limit);
    
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { vehicleId },
        ...paginationQuery,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          driver: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true
                }
              }
            }
          },
          payments: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where: { vehicleId } })
    ]);

    return {
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get vehicle utilization metrics
   * @param vehicleId - Vehicle ID
   * @returns Utilization metrics
   */
  static async getVehicleUtilization(vehicleId: string) {
    await validateVehicleExists(vehicleId);
    
    const [bookingStats, revenueStats, recentBookings] = await Promise.all([
      prisma.booking.groupBy({
        by: ['status'],
        where: { vehicleId },
        _count: { id: true }
      }),
      prisma.payment.aggregate({
        where: { 
          booking: { vehicleId },
          status: 'COMPLETED'
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.booking.findMany({
        where: { vehicleId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          serviceType: true,
          pickupLocation: true,
          destination: true,
          createdAt: true,
          totalPrice: true
        }
      })
    ]);

    const bookingBreakdown = bookingStats.reduce((acc: any, stat: any) => {
      acc[stat.status.toLowerCase()] = stat._count.id;
      return acc;
    }, {});

    return {
      bookings: bookingBreakdown,
      totalRevenue: revenueStats._sum.amount || 0,
      totalTrips: revenueStats._count || 0,
      recentBookings
    };
  }

  /**
   * Bulk update vehicles
   * @param vehicleIds - Array of vehicle IDs
   * @param updateData - Data to update
   * @returns Update result
   */
  static async bulkUpdateVehicles(vehicleIds: string[], updateData: Partial<UpdateVehicleData>) {
    const result = await prisma.vehicle.updateMany({
      where: {
        id: {
          in: vehicleIds
        }
      },
      data: updateData
    });

    return {
      updated: result.count,
      total: vehicleIds.length
    };
  }

  /**
   * Get vehicles with maintenance due
   * @param threshold - Mileage or time threshold
   * @returns Vehicles needing maintenance
   */
  static async getVehiclesNeedingMaintenance(threshold: number = 10000) {
    // This would require additional fields in the vehicle model
    // For now, return vehicles with high booking counts as a proxy
    return await prisma.vehicle.findMany({
      where: {
        bookings: {
          some: {
            status: 'COMPLETED'
          }
        }
      },
      include: {
        ...this.VEHICLE_INCLUDE_QUERY,
        _count: {
          select: {
            bookings: {
              where: {
                status: 'COMPLETED'
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  /**
   * Get most popular vehicles
   * @param limit - Maximum results
   * @returns Most booked vehicles
   */
  static async getMostPopularVehicles(limit: number = 10) {
    return await prisma.vehicle.findMany({
      include: {
        ...this.VEHICLE_INCLUDE_QUERY,
        _count: {
          select: {
            bookings: {
              where: {
                status: 'COMPLETED'
              }
            }
          }
        }
      },
      orderBy: {
        bookings: {
          _count: 'desc'
        }
      },
      take: limit
    });
  }

  /**
   * Add feature to vehicle
   * @param vehicleId - Vehicle ID
   * @param feature - Feature to add
   * @returns Updated vehicle
   */
  static async addVehicleFeature(vehicleId: string, feature: string) {
    const vehicle = await validateVehicleExists(vehicleId);
    
    if (vehicle.features.includes(feature)) {
      throw new Error('Cette fonctionnalité existe déjà');
    }
    
    return await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        features: {
          push: feature
        }
      },
      include: this.VEHICLE_INCLUDE_QUERY
    });
  }

  /**
   * Remove feature from vehicle
   * @param vehicleId - Vehicle ID
   * @param feature - Feature to remove
   * @returns Updated vehicle
   */
  static async removeVehicleFeature(vehicleId: string, feature: string) {
    const vehicle = await validateVehicleExists(vehicleId);
    
    const updatedFeatures = vehicle.features.filter(f => f !== feature);
    
    return await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        features: updatedFeatures
      },
      include: this.VEHICLE_INCLUDE_QUERY
    });
  }
}