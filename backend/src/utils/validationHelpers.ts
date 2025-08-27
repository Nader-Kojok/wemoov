import { prisma } from './database.js';

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  public code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
  }
}

/**
 * Validates that an entity exists in the database
 * @param model - Prisma model to query
 * @param id - Entity ID to check
 * @param entityName - Name of the entity for error messages
 * @returns The found entity
 * @throws ValidationError if entity not found
 */
export const validateEntityExists = async (model: any, id: string, entityName: string) => {
  const entity = await model.findUnique({ where: { id } });
  if (!entity) {
    throw new ValidationError(`${entityName} non trouvé`, `${entityName.toUpperCase()}_NOT_FOUND`);
  }
  return entity;
};

/**
 * Validates that a field value is unique in the database
 * @param model - Prisma model to query
 * @param field - Field name to check
 * @param value - Value to check for uniqueness
 * @param excludeId - Optional ID to exclude from the check (for updates)
 * @throws ValidationError if value already exists
 */
export const validateUniqueness = async (
  model: any, 
  field: string, 
  value: string, 
  excludeId?: string
) => {
  const existing = await model.findUnique({ where: { [field]: value } });
  if (existing && existing.id !== excludeId) {
    throw new ValidationError(
      `${field} déjà utilisé`, 
      `${field.toUpperCase()}_ALREADY_EXISTS`
    );
  }
};

/**
 * Validates that a user exists and returns it
 * @param userId - User ID to validate
 * @returns The user entity
 * @throws ValidationError if user not found
 */
export const validateUserExists = async (userId: string) => {
  return validateEntityExists(prisma.user, userId, 'Utilisateur');
};

/**
 * Validates that a driver exists and returns it
 * @param driverId - Driver ID to validate
 * @returns The driver entity
 * @throws ValidationError if driver not found
 */
export const validateDriverExists = async (driverId: string) => {
  return validateEntityExists(prisma.driver, driverId, 'Chauffeur');
};

/**
 * Validates that a vehicle exists and returns it
 * @param vehicleId - Vehicle ID to validate
 * @returns The vehicle entity
 * @throws ValidationError if vehicle not found
 */
export const validateVehicleExists = async (vehicleId: string) => {
  return validateEntityExists(prisma.vehicle, vehicleId, 'Véhicule');
};

/**
 * Validates that a booking exists and returns it
 * @param bookingId - Booking ID to validate
 * @returns The booking entity
 * @throws ValidationError if booking not found
 */
export const validateBookingExists = async (bookingId: string) => {
  return validateEntityExists(prisma.booking, bookingId, 'Réservation');
};

/**
 * Validates email uniqueness
 * @param email - Email to check
 * @param excludeId - Optional user ID to exclude
 * @throws ValidationError if email already exists
 */
export const validateEmailUniqueness = async (email: string, excludeId?: string) => {
  await validateUniqueness(prisma.user, 'email', email, excludeId);
};

/**
 * Validates phone uniqueness
 * @param phone - Phone number to check
 * @param excludeId - Optional user ID to exclude
 * @throws ValidationError if phone already exists
 */
export const validatePhoneUniqueness = async (phone: string, excludeId?: string) => {
  await validateUniqueness(prisma.user, 'phone', phone, excludeId);
};

/**
 * Validates vehicle license plate uniqueness
 * @param licensePlate - License plate to check
 * @param excludeId - Optional vehicle ID to exclude
 * @throws ValidationError if license plate already exists
 */
export const validateLicensePlateUniqueness = async (licensePlate: string, excludeId?: string) => {
  await validateUniqueness(prisma.vehicle, 'licensePlate', licensePlate, excludeId);
};

/**
 * Validates that required fields are present
 * @param data - Object containing the data
 * @param requiredFields - Array of required field names
 * @throws ValidationError if any required field is missing
 */
export const validateRequiredFields = (data: any, requiredFields: string[]) => {
  const missingFields = requiredFields.filter(field => 
    data[field] === undefined || data[field] === null || data[field] === ''
  );
  
  if (missingFields.length > 0) {
    throw new ValidationError(
      `Champs requis manquants: ${missingFields.join(', ')}`,
      'MISSING_REQUIRED_FIELDS'
    );
  }
};

/**
 * Validates email format
 * @param email - Email to validate
 * @throws ValidationError if email format is invalid
 */
export const validateEmailFormat = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Format d\'email invalide', 'INVALID_EMAIL_FORMAT');
  }
};

/**
 * Validates phone format (Senegalese format)
 * @param phone - Phone number to validate
 * @throws ValidationError if phone format is invalid
 */
export const validatePhoneFormat = (phone: string) => {
  const phoneRegex = /^(\+221|221)?[0-9]{9}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    throw new ValidationError('Format de téléphone invalide', 'INVALID_PHONE_FORMAT');
  }
};

/**
 * Validates that a driver exists and can be assigned
 * @param driverId - Driver ID to check
 * @throws ValidationError if driver is not found
 * @returns Driver object if valid
 */
export const validateDriverAvailability = async (driverId: string) => {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId }
  });
  
  if (!driver) {
    throw new ValidationError('Chauffeur non trouvé', 'DRIVER_NOT_FOUND');
  }
  
  // Note: Removed isAvailable check and active bookings check
  // to allow manual assignment flexibility for administrators
  // Drivers can be assigned to multiple bookings as needed
  
  return driver;
};

/**
 * Gets driver assignment information (for informational purposes)
 * @param driverId - Driver ID to check
 * @returns Driver with current assignment info
 */
export const getDriverAssignmentInfo = async (driverId: string) => {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: {
      bookings: {
        where: {
          status: {
            in: ['CONFIRMED', 'ASSIGNED', 'IN_PROGRESS']
          }
        },
        select: {
          id: true,
          status: true,
          scheduledDate: true,
          pickupLocation: true,
          destination: true
        }
      }
    }
  });
  
  return driver;
};

/**
 * Validates pagination parameters
 * @param page - Page number
 * @param limit - Items per page
 * @returns Validated pagination parameters
 */
export const validatePaginationParams = (page?: string | number, limit?: string | number) => {
  const validatedPage = Math.max(1, parseInt(String(page || 1)));
  const validatedLimit = Math.min(100, Math.max(1, parseInt(String(limit || 10))));
  
  return {
    page: validatedPage,
    limit: validatedLimit
  };
};