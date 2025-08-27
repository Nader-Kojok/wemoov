import { validatePaginationParams } from './validationHelpers.js';

/**
 * Interface for pagination query options
 */
export interface PaginationQuery {
  skip: number;
  take: number;
}

/**
 * Interface for search query options
 */
export interface SearchQuery {
  OR?: any[];
}

/**
 * Interface for date range query options
 */
export interface DateRangeQuery {
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
}

/**
 * Query builder utility class
 */
export class QueryBuilder {
  /**
   * Build pagination query for Prisma
   * @param page - Page number
   * @param limit - Items per page
   * @returns Pagination query object
   */
  static buildPaginationQuery(page?: string | number, limit?: string | number): PaginationQuery {
    const { page: validatedPage, limit: validatedLimit } = validatePaginationParams(page, limit);
    
    return {
      skip: (validatedPage - 1) * validatedLimit,
      take: validatedLimit
    };
  }

  /**
   * Build search query for multiple fields
   * @param fields - Array of field names to search in
   * @param search - Search term
   * @returns Search query object
   */
  static buildSearchQuery(fields: string[], search?: string): SearchQuery {
    if (!search || search.trim() === '') {
      return {};
    }

    const searchTerm = search.trim();
    return {
      OR: fields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive' as const
        }
      }))
    };
  }

  /**
   * Build date range query
   * @param dateFrom - Start date
   * @param dateTo - End date
   * @returns Date range query object
   */
  static buildDateRangeQuery(dateFrom?: string, dateTo?: string): DateRangeQuery {
    const query: DateRangeQuery = {};

    if (dateFrom || dateTo) {
      query.createdAt = {};
      
      if (dateFrom) {
        query.createdAt.gte = new Date(dateFrom);
      }
      
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999); // End of day
        query.createdAt.lte = endDate;
      }
    }

    return query;
  }

  /**
   * Build status filter query
   * @param status - Status value
   * @returns Status query object
   */
  static buildStatusQuery(status?: string) {
    return status ? { status } : {};
  }

  /**
   * Build role filter query
   * @param role - Role value
   * @returns Role query object
   */
  static buildRoleQuery(role?: string) {
    return role ? { role } : {};
  }

  /**
   * Build active status query
   * @param isActive - Active status
   * @returns Active status query object
   */
  static buildActiveQuery(isActive?: boolean | string) {
    if (isActive === undefined || isActive === null || isActive === '') {
      return {};
    }
    
    const active = typeof isActive === 'string' ? isActive === 'true' : isActive;
    return { isActive: active };
  }

  /**
   * Combine multiple query conditions
   * @param conditions - Array of query conditions
   * @returns Combined query object
   */
  static combineQueries(...conditions: any[]) {
    return conditions.reduce((combined, condition) => {
      return { ...combined, ...condition };
    }, {});
  }

  /**
   * Build user search query
   * @param search - Search term
   * @returns User search query
   */
  static buildUserSearchQuery(search?: string) {
    return this.buildSearchQuery(['firstName', 'lastName', 'email', 'phone'], search);
  }

  /**
   * Build driver search query
   * @param search - Search term
   * @returns Driver search query
   */
  static buildDriverSearchQuery(search?: string) {
    return this.buildSearchQuery(['licenseNumber'], search);
  }

  /**
   * Build vehicle search query
   * @param search - Search term
   * @returns Vehicle search query
   */
  static buildVehicleSearchQuery(search?: string) {
    return this.buildSearchQuery(['brand', 'model', 'licensePlate'], search);
  }

  /**
   * Build booking search query
   * @param search - Search term
   * @returns Booking search query
   */
  static buildBookingSearchQuery(search?: string) {
    return this.buildSearchQuery(['pickupLocation', 'destination'], search);
  }

  /**
   * Build complete user filter query
   * @param filters - Filter options
   * @returns Complete user query
   */
  static buildUserFilterQuery(filters: {
    search?: string;
    role?: string;
    isActive?: boolean | string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return this.combineQueries(
      this.buildUserSearchQuery(filters.search),
      this.buildRoleQuery(filters.role),
      this.buildActiveQuery(filters.isActive),
      this.buildDateRangeQuery(filters.dateFrom, filters.dateTo)
    );
  }

  /**
   * Build complete booking filter query
   * @param filters - Filter options
   * @returns Complete booking query
   */
  static buildBookingFilterQuery(filters: {
    search?: string;
    status?: string;
    serviceType?: string;
    userId?: string;
    driverId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const baseQuery = this.combineQueries(
      this.buildBookingSearchQuery(filters.search),
      this.buildStatusQuery(filters.status),
      filters.serviceType ? { serviceType: filters.serviceType } : {},
      filters.userId ? { userId: filters.userId } : {},
      filters.driverId ? { driverId: filters.driverId } : {},
      this.buildDateRangeQuery(filters.dateFrom, filters.dateTo)
    );

    return baseQuery;
  }

  /**
   * Build complete vehicle filter query
   * @param filters - Filter options
   * @returns Complete vehicle query
   */
  static buildVehicleFilterQuery(filters: {
    search?: string;
    type?: string;
    isAvailable?: boolean | string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return this.combineQueries(
      this.buildVehicleSearchQuery(filters.search),
      filters.type ? { type: filters.type } : {},
      filters.isAvailable !== undefined ? { isAvailable: filters.isAvailable === 'true' || filters.isAvailable === true } : {},
      this.buildDateRangeQuery(filters.dateFrom, filters.dateTo)
    );
  }

  /**
   * Build complete driver filter query
   * @param filters - Filter options
   * @returns Complete driver query
   */
  static buildDriverFilterQuery(filters: {
    search?: string;
    isAvailable?: boolean | string;
    vehicleId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return this.combineQueries(
      this.buildDriverSearchQuery(filters.search),
      filters.isAvailable !== undefined ? { isAvailable: filters.isAvailable === 'true' || filters.isAvailable === true } : {},
      filters.vehicleId ? { vehicleId: filters.vehicleId } : {},
      this.buildDateRangeQuery(filters.dateFrom, filters.dateTo)
    );
  }

  /**
   * Build order by query
   * @param sortBy - Field to sort by
   * @param sortOrder - Sort order (asc/desc)
   * @returns Order by query
   */
  static buildOrderByQuery(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc') {
    if (!sortBy) {
      return { createdAt: 'desc' as const };
    }

    return { [sortBy]: sortOrder };
  }

  /**
   * Build include relations query for users
   * @param includeRelations - Whether to include relations
   * @returns Include query
   */
  static buildUserIncludeQuery(includeRelations: boolean = false) {
    if (!includeRelations) return undefined;
    
    return {
      driver: {
        include: {
          vehicle: true
        }
      },
      _count: {
        bookings: true,
        payments: true
      }
    };
  }

  /**
   * Build include relations query for bookings
   * @param includeRelations - Whether to include relations
   * @returns Include query
   */
  static buildBookingIncludeQuery(includeRelations: boolean = true) {
    if (!includeRelations) return undefined;
    
    return {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
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
      vehicle: true,
      payments: true
    };
  }
}