import { prisma } from '../utils/database.js';
import { cache, CACHE_KEYS, CACHE_TTL } from '../utils/cache.js';

/**
 * Interface for dashboard statistics
 */
export interface DashboardStats {
  users: {
    total: number;
    clients: number;
    drivers: number;
    active: number;
  };
  bookings: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    recent: number;
  };
  payments: {
    totalRevenue: number;
    monthlyRevenue: number;
    pending: number;
  };
  vehicles: {
    total: number;
    available: number;
  };
}

/**
 * Interface for revenue statistics
 */
export interface RevenueStats {
  totalRevenue: number;
  periodRevenue: number;
  averagePerBooking: number;
  growth: number;
  bookingsCount: number;
}

/**
 * Statistics service class
 */
export class StatisticsService {
  /**
   * Get cached dashboard statistics
   * @returns Dashboard statistics with caching
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    return await cache.getOrSet(
      CACHE_KEYS.DASHBOARD_STATS,
      async () => {
        return await this.calculateDashboardStats();
      },
      CACHE_TTL.MEDIUM // Cache for 5 minutes
    );
  }

  /**
   * Calculate dashboard statistics
   * @returns Complete dashboard statistics
   */
  static async calculateDashboardStats(): Promise<DashboardStats> {
    // Date calculations
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Parallel execution of all statistics queries
    const [
      userStats,
      bookingStats,
      recentBookingsCount,
      paymentStats,
      monthlyRevenueStats,
      vehicleStats
    ] = await Promise.all([
      // User statistics grouped by role and active status
      prisma.user.groupBy({
        by: ['role', 'isActive'],
        _count: { id: true }
      }),
      
      // Booking statistics grouped by status
      prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      
      // Recent bookings count (last 7 days)
      prisma.booking.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      
      // Payment statistics (total revenue and pending payments)
      prisma.payment.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { amount: true }
      }),
      
      // Monthly revenue
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startOfMonth
          }
        },
        _sum: { amount: true }
      }),
      
      // Vehicle statistics grouped by availability
      prisma.vehicle.groupBy({
        by: ['isAvailable'],
        _count: { id: true }
      })
    ]);

    // Process user statistics
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

    // Process booking statistics
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

    // Process payment statistics
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

    // Process vehicle statistics
    const processedVehicleStats = {
      total: 0,
      available: 0
    };
    
    vehicleStats.forEach((stat: any) => {
      processedVehicleStats.total += stat._count.id;
      if (stat.isAvailable) processedVehicleStats.available += stat._count.id;
    });

    return {
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
  }

  /**
   * Get revenue statistics for a specific period
   * @param period - Time period ('week', 'month', 'year')
   * @returns Revenue statistics
   */
  static async getRevenueStats(period: string = 'month'): Promise<RevenueStats> {
    const cacheKey = `${CACHE_KEYS.REVENUE_STATS}_${period}`;
    
    return await cache.getOrSet(
      cacheKey,
      async () => {
        return await this.calculateRevenueStats(period);
      },
      CACHE_TTL.MEDIUM
    );
  }

  /**
   * Calculate revenue statistics for a specific period
   * @param period - Time period
   * @returns Revenue statistics
   */
  static async calculateRevenueStats(period: string): Promise<RevenueStats> {
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    // Calculate date ranges based on period
    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        previousStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
    }

    const [
      currentPeriodStats,
      previousPeriodStats,
      totalRevenueStats
    ] = await Promise.all([
      // Current period revenue and bookings
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startDate
          }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      
      // Previous period for growth calculation
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        },
        _sum: { amount: true }
      }),
      
      // Total revenue (all time)
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      })
    ]);

    const currentRevenue = currentPeriodStats._sum.amount || 0;
    const previousRevenue = previousPeriodStats._sum.amount || 0;
    const totalRevenue = totalRevenueStats._sum.amount || 0;
    const bookingsCount = currentPeriodStats._count || 0;

    // Calculate growth percentage
    const growth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    // Calculate average per booking
    const bookingCount = typeof currentPeriodStats._count === 'number' ? currentPeriodStats._count : currentPeriodStats._count.id;
    const averagePerBooking = bookingCount > 0 ? currentRevenue / bookingCount : 0;

    return {
      totalRevenue,
      periodRevenue: currentRevenue,
      averagePerBooking,
      growth,
      bookingsCount: bookingCount
    };
  }

  /**
   * Get user statistics
   * @returns User statistics
   */
  static async getUserStats() {
    return await cache.getOrSet(
      'users:stats',
      async () => {
        const [totalUsers, activeUsers, roleStats] = await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { isActive: true } }),
          prisma.user.groupBy({
            by: ['role'],
            _count: { id: true }
          })
        ]);

        const roleBreakdown = roleStats.reduce((acc: any, stat: any) => {
          acc[stat.role.toLowerCase()] = stat._count.id;
          return acc;
        }, {});

        return {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          ...roleBreakdown
        };
      },
      CACHE_TTL.MEDIUM
    );
  }

  /**
   * Get booking statistics
   * @returns Booking statistics
   */
  static async getBookingStats() {
    return await cache.getOrSet(
      'bookings:stats',
      async () => {
        const [totalBookings, statusStats, serviceTypeStats] = await Promise.all([
          prisma.booking.count(),
          prisma.booking.groupBy({
            by: ['status'],
            _count: { id: true }
          }),
          prisma.booking.groupBy({
            by: ['serviceType'],
            _count: { id: true }
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
          byStatus: statusBreakdown,
          byService: serviceBreakdown
        };
      },
      CACHE_TTL.MEDIUM
    );
  }

  /**
   * Get vehicle statistics
   * @returns Vehicle statistics
   */
  static async getVehicleStats() {
    return await cache.getOrSet(
      'vehicles:stats',
      async () => {
        const [totalVehicles, availableVehicles, typeStats] = await Promise.all([
          prisma.vehicle.count(),
          prisma.vehicle.count({ where: { isAvailable: true } }),
          prisma.vehicle.groupBy({
            by: ['type'],
            _count: { id: true }
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
          byType: typeBreakdown
        };
      },
      CACHE_TTL.MEDIUM
    );
  }

  /**
   * Clear all statistics cache
   */
  static async clearCache() {
    await Promise.all([
      cache.delete(CACHE_KEYS.DASHBOARD_STATS),
      cache.delete('users:stats'),
      cache.delete('bookings:stats'),
      cache.delete('vehicles:stats'),
      cache.delete(`${CACHE_KEYS.REVENUE_STATS}_week`),
      cache.delete(`${CACHE_KEYS.REVENUE_STATS}_month`),
      cache.delete(`${CACHE_KEYS.REVENUE_STATS}_year`)
    ]);
  }

  /**
   * Refresh all statistics cache
   */
  static async refreshCache() {
    await this.clearCache();
    
    // Pre-populate cache with fresh data
    await Promise.all([
      this.getDashboardStats(),
      this.getUserStats(),
      this.getBookingStats(),
      this.getVehicleStats(),
      this.getRevenueStats('week'),
      this.getRevenueStats('month'),
      this.getRevenueStats('year')
    ]);
  }
}