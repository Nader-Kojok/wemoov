import { prisma } from '../utils/database.js';
import { CreateUserRequest, UserWithRelations } from '../types/index.js';
import { 
  validateEmailUniqueness, 
  validatePhoneUniqueness, 
  validateUserExists,
  validateRequiredFields,
  validateEmailFormat,
  validatePhoneFormat
} from '../utils/validationHelpers.js';
import { QueryBuilder } from '../utils/queryBuilders.js';
import { hashPassword } from '../utils/auth.js';

/**
 * Interface for user filters
 */
export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean | string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Interface for user creation data
 */
export interface CreateUserData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: 'CLIENT' | 'DRIVER' | 'ADMIN';
}

/**
 * Interface for user update data
 */
export interface UpdateUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role?: 'CLIENT' | 'DRIVER' | 'ADMIN';
  isActive?: boolean;
}

/**
 * User service class
 */
export class UserService {
  /**
   * User select fields for security (excluding password)
   */
  private static readonly USER_SELECT_FIELDS = {
    id: true,
    email: true,
    phone: true,
    firstName: true,
    lastName: true,
    role: true,
    isActive: true,
    createdAt: true,
    updatedAt: true
  };

  /**
   * Get paginated list of users with filters
   * @param page - Page number
   * @param limit - Items per page
   * @param filters - Filter options
   * @returns Paginated users list
   */
  static async getUsers(
    page: number = 1, 
    limit: number = 10, 
    filters: UserFilters = {}
  ) {
    const paginationQuery = QueryBuilder.buildPaginationQuery(page, limit);
    const whereQuery = QueryBuilder.buildUserFilterQuery(filters);
    const orderByQuery = QueryBuilder.buildOrderByQuery('createdAt', 'desc');

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereQuery,
        ...paginationQuery,
        select: {
          ...this.USER_SELECT_FIELDS,
          _count: {
            select: {
              bookings: true
            }
          }
        },
        orderBy: orderByQuery
      }),
      prisma.user.count({ where: whereQuery })
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get user details by ID
   * @param userId - User ID
   * @param includeRelations - Whether to include related data
   * @returns User details
   */
  static async getUserById(userId: string, includeRelations: boolean = false) {
    await validateUserExists(userId);

    const includeQuery = includeRelations ? {
      driver: {
        include: {
          vehicle: true
        }
      },
      bookings: {
        take: 10,
        orderBy: { createdAt: 'desc' as const },
        include: {
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
          vehicle: true
        }
      },
      payments: {
        take: 10,
        orderBy: { createdAt: 'desc' as const }
      },
      _count: {
        select: {
          bookings: true,
          payments: true
        }
      }
    } : undefined;

    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...this.USER_SELECT_FIELDS,
        ...(includeRelations && { 
          driver: includeQuery?.driver,
          bookings: includeQuery?.bookings,
          payments: includeQuery?.payments,
          _count: includeQuery?._count
        })
      }
    });
  }

  /**
   * Create a new user
   * @param userData - User creation data
   * @returns Created user
   */
  static async createUser(userData: CreateUserData) {
    // Validate required fields
    validateRequiredFields(userData, ['email', 'phone', 'firstName', 'lastName', 'password']);
    
    // Validate formats
    validateEmailFormat(userData.email);
    validatePhoneFormat(userData.phone);
    
    // Validate uniqueness
    await validateEmailUniqueness(userData.email);
    await validatePhoneUniqueness(userData.phone);
    
    // Hash password
    const hashedPassword = await hashPassword(userData.password);
    
    // Create user
    return await prisma.user.create({
      data: {
        email: userData.email,
        phone: userData.phone,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: hashedPassword,
        role: userData.role || 'CLIENT'
      },
      select: this.USER_SELECT_FIELDS
    });
  }

  /**
   * Update user by ID
   * @param userId - User ID
   * @param userData - User update data
   * @returns Updated user
   */
  static async updateUser(userId: string, userData: UpdateUserData) {
    // Validate user exists
    const existingUser = await validateUserExists(userId);
    
    // Validate formats if provided
    if (userData.email) {
      validateEmailFormat(userData.email);
    }
    if (userData.phone) {
      validatePhoneFormat(userData.phone);
    }
    
    // Validate uniqueness if email or phone changed
    if (userData.email && userData.email !== existingUser.email) {
      await validateEmailUniqueness(userData.email, userId);
    }
    if (userData.phone && userData.phone !== existingUser.phone) {
      await validatePhoneUniqueness(userData.phone, userId);
    }
    
    // Update user
    return await prisma.user.update({
      where: { id: userId },
      data: userData,
      select: this.USER_SELECT_FIELDS
    });
  }

  /**
   * Toggle user active status
   * @param userId - User ID
   * @returns Updated user
   */
  static async toggleUserStatus(userId: string) {
    const user = await validateUserExists(userId);
    
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: this.USER_SELECT_FIELDS
    });
  }

  /**
   * Delete user by ID
   * @param userId - User ID
   * @returns Success status
   */
  static async deleteUser(userId: string) {
    await validateUserExists(userId);
    
    // Check if user has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        userId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS']
        }
      }
    });
    
    if (activeBookings > 0) {
      throw new Error('Impossible de supprimer un utilisateur avec des réservations actives');
    }
    
    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    });
    
    return { success: true };
  }

  /**
   * Get user statistics
   * @returns User statistics
   */
  static async getUserStatistics() {
    const [totalUsers, activeUsers, roleStats, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
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
      recent: recentUsers,
      byRole: roleBreakdown
    };
  }

  /**
   * Search users by query
   * @param query - Search query
   * @param limit - Maximum results
   * @returns Matching users
   */
  static async searchUsers(query: string, limit: number = 10) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchQuery = QueryBuilder.buildUserSearchQuery(query);
    
    return await prisma.user.findMany({
      where: searchQuery,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true
      },
      take: limit,
      orderBy: {
        firstName: 'asc'
      }
    });
  }

  /**
   * Get users by role
   * @param role - User role
   * @param isActive - Filter by active status
   * @returns Users with specified role
   */
  static async getUsersByRole(role: string, isActive?: boolean) {
    const where: any = { role };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return await prisma.user.findMany({
      where,
      select: this.USER_SELECT_FIELDS,
      orderBy: {
        firstName: 'asc'
      }
    });
  }

  /**
   * Get user's booking history
   * @param userId - User ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns User's bookings
   */
  static async getUserBookings(userId: string, page: number = 1, limit: number = 10) {
    await validateUserExists(userId);
    
    const paginationQuery = QueryBuilder.buildPaginationQuery(page, limit);
    
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId },
        ...paginationQuery,
        include: {
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
          vehicle: true,
          payments: true
        },
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
   * Bulk update users
   * @param userIds - Array of user IDs
   * @param updateData - Data to update
   * @returns Update result
   */
  static async bulkUpdateUsers(userIds: string[], updateData: Partial<UpdateUserData>) {
    const result = await prisma.user.updateMany({
      where: {
        id: {
          in: userIds
        }
      },
      data: updateData
    });

    return {
      updated: result.count,
      total: userIds.length
    };
  }

  /**
   * Get user activity summary
   * @param userId - User ID
   * @returns Activity summary
   */
  static async getUserActivity(userId: string) {
    await validateUserExists(userId);
    
    const [bookingStats, paymentStats, recentActivity] = await Promise.all([
      prisma.booking.groupBy({
        by: ['status'],
        where: { userId },
        _count: { id: true }
      }),
      prisma.payment.aggregate({
        where: { 
          userId,
          status: 'COMPLETED'
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.booking.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          serviceType: true,
          pickupLocation: true,
          destination: true,
          createdAt: true
        }
      })
    ]);

    const bookingBreakdown = bookingStats.reduce((acc: any, stat: any) => {
      acc[stat.status.toLowerCase()] = stat._count.id;
      return acc;
    }, {});

    return {
      bookings: bookingBreakdown,
      totalSpent: paymentStats._sum.amount || 0,
      totalPayments: paymentStats._count || 0,
      recentActivity
    };
  }
}