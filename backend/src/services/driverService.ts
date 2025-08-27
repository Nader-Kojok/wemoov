import { prisma } from '../utils/database.js';
import { DriverWithRelations } from '../types/index.js';
import { 
  validateUserExists, 
  validateDriverExists,
  validateVehicleExists,
  validateUniqueness,
  validateRequiredFields
} from '../utils/validationHelpers.js';
import { QueryBuilder } from '../utils/queryBuilders.js';

/**
 * Interface for driver filters
 */
export interface DriverFilters {
  search?: string;
  isAvailable?: boolean | string;
  vehicleId?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Interface for driver creation data
 */
export interface CreateDriverData {
  userId: string;
  licenseNumber: string;
  vehicleId?: string;
}

/**
 * Interface for driver update data
 */
export interface UpdateDriverData {
  licenseNumber?: string;
  vehicleId?: string;
  isAvailable?: boolean;
  rating?: number;
}

/**
 * Driver service class
 */
export class DriverService {
  /**
   * Driver include query for relations
   */
  private static readonly DRIVER_INCLUDE_QUERY = {
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
  };

  /**
   * Get paginated list of drivers with filters
   * @param page - Page number
   * @param limit - Items per page
   * @param filters - Filter options
   * @returns Paginated drivers list
   */
  static async getDrivers(
    page: number = 1, 
    limit: number = 10, 
    filters: DriverFilters = {}
  ) {
    const paginationQuery = QueryBuilder.buildPaginationQuery(page, limit);
    const whereQuery = QueryBuilder.buildDriverFilterQuery(filters);
    
    // Add user search to the where query if search is provided
    if (filters.search) {
      whereQuery.user = {
        OR: [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search } }
        ]
      };
    }
    
    const orderByQuery = QueryBuilder.buildOrderByQuery('createdAt', 'desc');

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where: whereQuery,
        ...paginationQuery,
        include: this.DRIVER_INCLUDE_QUERY,
        orderBy: orderByQuery
      }),
      prisma.driver.count({ where: whereQuery })
    ]);

    return {
      drivers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get driver details by ID
   * @param driverId - Driver ID
   * @param includeBookings - Whether to include recent bookings
   * @returns Driver details
   */
  static async getDriverById(driverId: string, includeBookings: boolean = false) {
    await validateDriverExists(driverId);

    const includeQuery = {
      ...this.DRIVER_INCLUDE_QUERY,
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
            vehicle: true
          }
        }
      })
    };

    return await prisma.driver.findUnique({
      where: { id: driverId },
      include: includeQuery
    });
  }

  /**
   * Create a new driver
   * @param driverData - Driver creation data
   * @returns Created driver
   */
  static async createDriver(driverData: CreateDriverData) {
    // Validate required fields
    validateRequiredFields(driverData, ['userId', 'licenseNumber']);
    
    // Validate user exists and is not already a driver
    const user = await prisma.user.findUnique({
      where: { id: driverData.userId },
      include: { driver: true }
    });
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    if (user.driver) {
      throw new Error('Cet utilisateur est déjà un chauffeur');
    }
    
    // Validate license number uniqueness
    await validateUniqueness(prisma.driver, 'licenseNumber', driverData.licenseNumber);
    
    // Validate vehicle if provided
    if (driverData.vehicleId) {
      await validateVehicleExists(driverData.vehicleId);
    }
    
    // Update user role to DRIVER
    await prisma.user.update({
      where: { id: driverData.userId },
      data: { role: 'DRIVER' }
    });
    
    // Create driver
    return await prisma.driver.create({
      data: {
        userId: driverData.userId,
        licenseNumber: driverData.licenseNumber,
        vehicleId: driverData.vehicleId,
        isAvailable: true,
        rating: 0,
        totalRides: 0
      },
      include: this.DRIVER_INCLUDE_QUERY
    });
  }

  /**
   * Update driver by ID
   * @param driverId - Driver ID
   * @param driverData - Driver update data
   * @returns Updated driver
   */
  static async updateDriver(driverId: string, driverData: UpdateDriverData) {
    // Validate driver exists
    const existingDriver = await validateDriverExists(driverId);
    
    // Validate license number uniqueness if being updated
    if (driverData.licenseNumber && driverData.licenseNumber !== existingDriver.licenseNumber) {
      await validateUniqueness(prisma.driver, 'licenseNumber', driverData.licenseNumber, driverId);
    }
    
    // Validate vehicle if being updated
    if (driverData.vehicleId) {
      await validateVehicleExists(driverData.vehicleId);
    }
    
    // Validate rating if provided
    if (driverData.rating !== undefined && (driverData.rating < 0 || driverData.rating > 5)) {
      throw new Error('La note doit être entre 0 et 5');
    }
    
    // Update driver
    return await prisma.driver.update({
      where: { id: driverId },
      data: driverData,
      include: this.DRIVER_INCLUDE_QUERY
    });
  }

  /**
   * Delete driver by ID
   * @param driverId - Driver ID
   * @returns Success status
   */
  static async deleteDriver(driverId: string) {
    const driver = await validateDriverExists(driverId);
    
    // Check if driver has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        driverId,
        status: {
          in: ['CONFIRMED', 'ASSIGNED', 'IN_PROGRESS']
        }
      }
    });
    
    if (activeBookings > 0) {
      throw new Error('Impossible de supprimer un chauffeur avec des réservations actives');
    }
    
    // Update user role back to CLIENT
    await prisma.user.update({
      where: { id: driver.userId },
      data: { role: 'CLIENT' }
    });
    
    // Delete driver
    await prisma.driver.delete({
      where: { id: driverId }
    });
    
    return { success: true };
  }

  /**
   * Toggle driver availability
   * @param driverId - Driver ID
   * @returns Updated driver
   */
  static async toggleDriverAvailability(driverId: string) {
    const driver = await validateDriverExists(driverId);
    
    return await prisma.driver.update({
      where: { id: driverId },
      data: { isAvailable: !driver.isAvailable },
      include: this.DRIVER_INCLUDE_QUERY
    });
  }

  /**
   * Get available drivers
   * @param vehicleType - Optional vehicle type filter
   * @returns Available drivers
   */
  static async getAvailableDrivers(vehicleType?: string) {
    const whereQuery: any = {
      isAvailable: true,
      user: {
        isActive: true
      },
      bookings: {
        none: {
          status: {
            in: ['CONFIRMED', 'ASSIGNED', 'IN_PROGRESS']
          }
        }
      }
    };
    
    if (vehicleType) {
      whereQuery.vehicle = {
        type: vehicleType,
        isAvailable: true
      };
    }

    return await prisma.driver.findMany({
      where: whereQuery,
      include: this.DRIVER_INCLUDE_QUERY,
      orderBy: {
        rating: 'desc'
      }
    });
  }

  /**
   * Assign vehicle to driver
   * @param driverId - Driver ID
   * @param vehicleId - Vehicle ID
   * @returns Updated driver
   */
  static async assignVehicle(driverId: string, vehicleId: string) {
    await validateDriverExists(driverId);
    await validateVehicleExists(vehicleId);
    
    // Check if vehicle is available
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });
    
    if (!vehicle?.isAvailable) {
      throw new Error('Ce véhicule n\'est pas disponible');
    }
    
    return await prisma.driver.update({
      where: { id: driverId },
      data: { vehicleId },
      include: this.DRIVER_INCLUDE_QUERY
    });
  }

  /**
   * Unassign vehicle from driver
   * @param driverId - Driver ID
   * @returns Updated driver
   */
  static async unassignVehicle(driverId: string) {
    await validateDriverExists(driverId);
    
    return await prisma.driver.update({
      where: { id: driverId },
      data: { vehicleId: null },
      include: this.DRIVER_INCLUDE_QUERY
    });
  }

  /**
   * Update driver rating
   * @param driverId - Driver ID
   * @param rating - New rating
   * @returns Updated driver
   */
  static async updateDriverRating(driverId: string, rating: number) {
    if (rating < 0 || rating > 5) {
      throw new Error('La note doit être entre 0 et 5');
    }
    
    await validateDriverExists(driverId);
    
    return await prisma.driver.update({
      where: { id: driverId },
      data: { rating },
      include: this.DRIVER_INCLUDE_QUERY
    });
  }

  /**
   * Get driver statistics
   * @returns Driver statistics
   */
  static async getDriverStatistics() {
    const [totalDrivers, availableDrivers, activeDrivers, recentDrivers] = await Promise.all([
      prisma.driver.count(),
      prisma.driver.count({ where: { isAvailable: true } }),
      prisma.driver.count({ 
        where: { 
          user: { isActive: true },
          isAvailable: true
        } 
      }),
      prisma.driver.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    return {
      total: totalDrivers,
      available: availableDrivers,
      active: activeDrivers,
      recent: recentDrivers,
      unavailable: totalDrivers - availableDrivers
    };
  }

  /**
   * Search drivers by query
   * @param query - Search query
   * @param limit - Maximum results
   * @returns Matching drivers
   */
  static async searchDrivers(query: string, limit: number = 10) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    return await prisma.driver.findMany({
      where: {
        OR: [
          { licenseNumber: { contains: query, mode: 'insensitive' } },
          {
            user: {
              OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query } }
              ]
            }
          }
        ]
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
            type: true,
            brand: true,
            model: true,
            licensePlate: true
          }
        }
      },
      take: limit,
      orderBy: {
        rating: 'desc'
      }
    });
  }

  /**
   * Get driver's booking history
   * @param driverId - Driver ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns Driver's bookings
   */
  static async getDriverBookings(driverId: string, page: number = 1, limit: number = 10) {
    await validateDriverExists(driverId);
    
    const paginationQuery = QueryBuilder.buildPaginationQuery(page, limit);
    
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { driverId },
        ...paginationQuery,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          vehicle: true,
          payments: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where: { driverId } })
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
   * Get driver performance metrics
   * @param driverId - Driver ID
   * @returns Performance metrics
   */
  static async getDriverPerformance(driverId: string) {
    await validateDriverExists(driverId);
    
    const [bookingStats, revenueStats, recentBookings] = await Promise.all([
      prisma.booking.groupBy({
        by: ['status'],
        where: { driverId },
        _count: { id: true }
      }),
      prisma.payment.aggregate({
        where: { 
          booking: { driverId },
          status: 'COMPLETED'
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.booking.findMany({
        where: { driverId },
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
      totalEarnings: revenueStats._sum.amount || 0,
      totalTrips: revenueStats._count || 0,
      recentBookings
    };
  }

  /**
   * Bulk update drivers
   * @param driverIds - Array of driver IDs
   * @param updateData - Data to update
   * @returns Update result
   */
  static async bulkUpdateDrivers(driverIds: string[], updateData: Partial<UpdateDriverData>) {
    const result = await prisma.driver.updateMany({
      where: {
        id: {
          in: driverIds
        }
      },
      data: updateData
    });

    return {
      updated: result.count,
      total: driverIds.length
    };
  }

  /**
   * Get top rated drivers
   * @param limit - Maximum results
   * @returns Top rated drivers
   */
  static async getTopRatedDrivers(limit: number = 10) {
    return await prisma.driver.findMany({
      where: {
        rating: {
          gt: 0
        },
        totalRides: {
          gt: 0
        }
      },
      include: this.DRIVER_INCLUDE_QUERY,
      orderBy: [
        { rating: 'desc' },
        { totalRides: 'desc' }
      ],
      take: limit
    });
  }
}