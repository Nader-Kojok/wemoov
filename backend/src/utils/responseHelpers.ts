import { ApiResponse } from '../types/index.js';

/**
 * Creates a standardized success response
 * @param data - The data to include in the response
 * @param pagination - Optional pagination information
 * @returns Formatted success response
 */
export const createSuccessResponse = <T>(data: T, pagination?: any): ApiResponse => ({
  success: true,
  data,
  ...(pagination && { pagination })
});

/**
 * Creates a standardized error response
 * @param message - Error message
 * @param code - Error code
 * @returns Formatted error response
 */
export const createErrorResponse = (message: string, code: string): ApiResponse => ({
  success: false,
  error: { message, code }
});

/**
 * Creates a paginated success response
 * @param items - Array of items
 * @param total - Total count of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Formatted paginated response
 */
export const createPaginatedResponse = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): ApiResponse => {
  const totalPages = Math.ceil(total / limit);
  
  return createSuccessResponse(items, {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  });
};

/**
 * Creates a response for created resources
 * @param data - The created resource data
 * @param message - Optional success message
 * @returns Formatted creation response
 */
export const createCreatedResponse = <T>(data: T, message?: string): ApiResponse => ({
  success: true,
  data,
  ...(message && { message })
});

/**
 * Creates a response for updated resources
 * @param data - The updated resource data
 * @returns Formatted update response
 */
export const createUpdatedResponse = <T>(data: T): ApiResponse => ({
  success: true,
  data
});

/**
 * Creates a response for deleted resources
 * @returns Formatted deletion response
 */
export const createDeletedResponse = (): ApiResponse => ({
  success: true,
  data: { message: 'Ressource supprimée avec succès' }
});

/**
 * Common error responses
 */
export const ErrorResponses = {
  NOT_FOUND: (entity: string) => createErrorResponse(`${entity} non trouvé`, `${entity.toUpperCase()}_NOT_FOUND`),
  ALREADY_EXISTS: (field: string) => createErrorResponse(`${field} déjà utilisé`, `${field.toUpperCase()}_ALREADY_EXISTS`),
  VALIDATION_ERROR: (message: string) => createErrorResponse(message, 'VALIDATION_ERROR'),
  UNAUTHORIZED: () => createErrorResponse('Non autorisé', 'UNAUTHORIZED'),
  FORBIDDEN: () => createErrorResponse('Accès interdit', 'FORBIDDEN'),
  INTERNAL_ERROR: () => createErrorResponse('Erreur interne du serveur', 'INTERNAL_ERROR'),
  DATABASE_ERROR: () => createErrorResponse('Erreur de base de données', 'DATABASE_ERROR')
};