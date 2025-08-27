import { prisma } from '../utils/database.js';
import { CreateBookingRequest, UpdateBookingRequest, BookingWithRelations } from '../types/index.js';
import { 
  validateUserExists, 
  validateBookingExists,
  validateDriverExists,
  validateVehicleExists,
  validateDriverAvailability,
  validateRequiredFields
} from '../utils/validationHelpers.js';
import { QueryBuilder } from '../utils/queryBuilders.js';

/**
 * Interface for booking filters
 */
export interface BookingFilters {
  search?: string;
  status?: string;
  serviceType?: string;
  userId?: string;
  driverId?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Interface for booking creation data
 */
export interface CreateBookingData {
  userId: string;
  serviceType: 'AIRPORT' | 'CITY' | 'INTERCITY' | 'HOURLY' | 'EVENT';
  pickupLocation: string;
  pickupLat?: number;
  pickupLng?: number;
  destination: string;
  destinationLat?: number;
  destinationLng?: number;
  scheduledDate: string;
  scheduledTime: string;
  passengers: number;
  totalPrice?: number;
  specialRequests?: string;
}

/**
 * Interface for booking update data
 */
export interface UpdateBookingData {
  serviceType?: 'AIRPORT' | 'CITY' | 'INTERCITY' | 'HOURLY' | 'EVENT';
  pickupLocation?: string;
  pickupLat?: number;
  pickupLng?: number;
  destination?: string;
  destinationLat?: number;
  destinationLng?: number;
  scheduledDate?: string;
  scheduledTime?: string;
  passengers?: number;
  totalPrice?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  specialRequests?: string;
  driverId?: string;
  vehicleId?: string;
}

/**
 * Booking service class
 */
export class BookingService {
  /**
   * Booking include query for relations
   */
  private static readonly BOOKING_INCLUDE_QUERY = {
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
    },
    payments: true
  };

  /**
   * Get paginated list of bookings with filters
   * @param page - Page number
   * @param limit - Items per page
   * @param filters - Filter options
   * @returns Paginated bookings list
   */
  static async getBookings(
    page: number = 1, 
    limit: number = 10, 
    filters: BookingFilters = {}
  ) {
    const paginationQuery = QueryBuilder.buildPaginationQuery(page, limit);
    const whereQuery = QueryBuilder.buildBookingFilterQuery(filters);
    const orderByQuery = QueryBuilder.buildOrderByQuery('createdAt', 'desc');

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: whereQuery,
        ...paginationQuery,
        include: this.BOOKING_INCLUDE_QUERY,
        orderBy: orderByQuery
      }),
      prisma.booking.count({ where: whereQuery })
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
   * Get booking details by ID
   * @param bookingId - Booking ID
   * @returns Booking details
   */
  static async getBookingById(bookingId: string) {
    await validateBookingExists(bookingId);

    return await prisma.booking.findUnique({
      where: { id: bookingId },
      include: this.BOOKING_INCLUDE_QUERY
    });
  }

  /**
   * Create a new booking
   * @param bookingData - Booking creation data
   * @returns Created booking
   */
  static async createBooking(bookingData: CreateBookingData) {
    // Validate required fields
    validateRequiredFields(bookingData, [
      'userId', 'serviceType', 'pickupLocation', 'destination', 
      'scheduledDate', 'scheduledTime', 'passengers'
    ]);
    
    // Validate user exists
    await validateUserExists(bookingData.userId);
    
    // Validate date is in the future
    const scheduledDateTime = new Date(`${bookingData.scheduledDate}T${bookingData.scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      throw new Error('La date et l\'heure de réservation doivent être dans le futur');
    }
    
    // Validate passengers count
    if (bookingData.passengers < 1 || bookingData.passengers > 8) {
      throw new Error('Le nombre de passagers doit être entre 1 et 8');
    }
    
    // Create booking
    return await prisma.booking.create({
      data: {
        userId: bookingData.userId,
        serviceType: bookingData.serviceType,
        pickupLocation: bookingData.pickupLocation,
        pickupLat: bookingData.pickupLat,
        pickupLng: bookingData.pickupLng,
        destination: bookingData.destination,
        destinationLat: bookingData.destinationLat,
        destinationLng: bookingData.destinationLng,
        scheduledDate: new Date(bookingData.scheduledDate),
        scheduledTime: bookingData.scheduledTime,
        passengers: bookingData.passengers,
        totalPrice: bookingData.totalPrice,
        specialRequests: bookingData.specialRequests,
        status: 'PENDING'
      },
      include: this.BOOKING_INCLUDE_QUERY
    });
  }

  /**
   * Update booking by ID
   * @param bookingId - Booking ID
   * @param bookingData - Booking update data
   * @returns Updated booking
   */
  static async updateBooking(bookingId: string, bookingData: UpdateBookingData) {
    // Validate booking exists
    const existingBooking = await validateBookingExists(bookingId);
    
    // Validate status transition if status is being updated
    if (bookingData.status) {
      this.validateStatusTransition(existingBooking.status, bookingData.status);
    }
    
    // Validate date is in the future if being updated
    if (bookingData.scheduledDate && bookingData.scheduledTime) {
      const scheduledDateTime = new Date(`${bookingData.scheduledDate}T${bookingData.scheduledTime}`);
      if (scheduledDateTime <= new Date()) {
        throw new Error('La date et l\'heure de réservation doivent être dans le futur');
      }
    }
    
    // Validate passengers count if being updated
    if (bookingData.passengers && (bookingData.passengers < 1 || bookingData.passengers > 8)) {
      throw new Error('Le nombre de passagers doit être entre 1 et 8');
    }
    
    // Update booking
    return await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...bookingData,
        ...(bookingData.scheduledDate && { scheduledDate: new Date(bookingData.scheduledDate) })
      },
      include: this.BOOKING_INCLUDE_QUERY
    });
  }

  /**
   * Delete booking by ID
   * @param bookingId - Booking ID
   * @returns Success status
   */
  static async deleteBooking(bookingId: string) {
    const booking = await validateBookingExists(bookingId);
    
    // Check if booking can be deleted
    if (['IN_PROGRESS', 'COMPLETED'].includes(booking.status)) {
      throw new Error('Impossible de supprimer une réservation en cours ou terminée');
    }
    
    // Delete booking (cascade will handle related records)
    await prisma.booking.delete({
      where: { id: bookingId }
    });
    
    return { success: true };
  }

  /**
   * Assign driver and vehicle to booking
   * @param bookingId - Booking ID
   * @param driverId - Driver ID
   * @param vehicleId - Vehicle ID (optional)
   * @returns Updated booking
   */
  static async assignDriver(bookingId: string, driverId: string, vehicleId?: string) {
    // Validate booking exists and is assignable
    const booking = await validateBookingExists(bookingId);
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new Error('Cette réservation ne peut pas être assignée');
    }
    
    // Validate driver availability
    const driver = await validateDriverAvailability(driverId);
    
    // Validate vehicle if provided
    if (vehicleId) {
      await validateVehicleExists(vehicleId);
    } else {
      // Use driver's default vehicle if available
      vehicleId = driver.vehicleId || undefined;
    }
    
    // Update booking
    return await prisma.booking.update({
      where: { id: bookingId },
      data: {
        driverId,
        vehicleId,
        status: 'ASSIGNED'
      },
      include: this.BOOKING_INCLUDE_QUERY
    });
  }

  /**
   * Unassign driver from booking
   * @param bookingId - Booking ID
   * @returns Updated booking
   */
  static async unassignDriver(bookingId: string) {
    const booking = await validateBookingExists(bookingId);
    
    if (booking.status === 'IN_PROGRESS') {
      throw new Error('Impossible de désassigner un chauffeur d\'une réservation en cours');
    }
    
    return await prisma.booking.update({
      where: { id: bookingId },
      data: {
        driverId: null,
        vehicleId: null,
        status: 'CONFIRMED'
      },
      include: this.BOOKING_INCLUDE_QUERY
    });
  }

  /**
   * Update booking status
   * @param bookingId - Booking ID
   * @param status - New status
   * @returns Updated booking
   */
  static async updateBookingStatus(
    bookingId: string, 
    status: 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  ) {
    const booking = await validateBookingExists(bookingId);
    
    // Validate status transition
    this.validateStatusTransition(booking.status, status);
    
    return await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: this.BOOKING_INCLUDE_QUERY
    });
  }

  /**
   * Get available drivers for a booking
   * @param bookingId - Booking ID (optional, for context)
   * @returns Available drivers
   */
  static async getAvailableDrivers(bookingId?: string) {
    // Get drivers who are available and not assigned to active bookings
    return await prisma.driver.findMany({
      where: {
        isAvailable: true,
        bookings: {
          none: {
            status: {
              in: ['CONFIRMED', 'ASSIGNED', 'IN_PROGRESS']
            }
          }
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
            type: true,
            brand: true,
            model: true,
            licensePlate: true
          }
        }
      },
      orderBy: {
        rating: 'desc'
      }
    });
  }

  /**
   * Get booking statistics
   * @returns Booking statistics
   */
  static async getBookingStatistics() {
    const [totalBookings, statusStats, serviceTypeStats, recentBookings] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.booking.groupBy({
        by: ['serviceType'],
        _count: { id: true }
      }),
      prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    const statusBreakdown = statusStats.reduce((acc: any, stat: any) => {
      acc[stat.status.toLowerCase()] = stat._count.id;
      return acc;
    }, {});

    const serviceBreakdown = serviceTypeStats.reduce((acc: any, stat: any) => {
      acc[stat.serviceType.toLowerCase()] = stat._count.id;
      return acc;
    }, {});

    return {
      total: totalBookings,
      recent: recentBookings,
      byStatus: statusBreakdown,
      byService: serviceBreakdown
    };
  }

  /**
   * Search bookings by query
   * @param query - Search query
   * @param limit - Maximum results
   * @returns Matching bookings
   */
  static async searchBookings(query: string, limit: number = 10) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchQuery = QueryBuilder.buildBookingSearchQuery(query);
    
    return await prisma.booking.findMany({
      where: searchQuery,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Get bookings by user
   * @param userId - User ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns User's bookings
   */
  static async getBookingsByUser(userId: string, page: number = 1, limit: number = 10) {
    await validateUserExists(userId);
    
    const paginationQuery = QueryBuilder.buildPaginationQuery(page, limit);
    
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId },
        ...paginationQuery,
        include: this.BOOKING_INCLUDE_QUERY,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where: { userId } })
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
   * Get bookings by driver
   * @param driverId - Driver ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns Driver's bookings
   */
  static async getBookingsByDriver(driverId: string, page: number = 1, limit: number = 10) {
    await validateDriverExists(driverId);
    
    const paginationQuery = QueryBuilder.buildPaginationQuery(page, limit);
    
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { driverId },
        ...paginationQuery,
        include: this.BOOKING_INCLUDE_QUERY,
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
   * Validate status transition
   * @param currentStatus - Current booking status
   * @param newStatus - New booking status
   */
  private static validateStatusTransition(
    currentStatus: string, 
    newStatus: string
  ) {
    const validTransitions: { [key: string]: string[] } = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['ASSIGNED', 'CANCELLED'],
      'ASSIGNED': ['IN_PROGRESS', 'CONFIRMED', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [], // No transitions from completed
      'CANCELLED': [] // No transitions from cancelled
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Transition de statut invalide: ${currentStatus} -> ${newStatus}`);
    }
  }

  /**
   * Bulk update bookings
   * @param bookingIds - Array of booking IDs
   * @param updateData - Data to update
   * @returns Update result
   */
  static async bulkUpdateBookings(bookingIds: string[], updateData: Partial<UpdateBookingData>) {
    const result = await prisma.booking.updateMany({
      where: {
        id: {
          in: bookingIds
        }
      },
      data: updateData
    });

    return {
      updated: result.count,
      total: bookingIds.length
    };
  }

  /**
   * Cancel booking
   * @param bookingId - Booking ID
   * @param reason - Cancellation reason
   * @returns Updated booking
   */
  static async cancelBooking(bookingId: string, reason?: string) {
    const booking = await validateBookingExists(bookingId);
    
    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
      throw new Error('Cette réservation ne peut pas être annulée');
    }
    
    return await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        specialRequests: reason ? `${booking.specialRequests || ''} [Annulé: ${reason}]` : booking.specialRequests
      },
      include: this.BOOKING_INCLUDE_QUERY
    });
  }
}