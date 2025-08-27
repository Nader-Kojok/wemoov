import { User, Driver, Vehicle, Booking, Payment, Service } from '@prisma/client';

// Types de base exportés depuis Prisma
export {
  User,
  Driver,
  Vehicle,
  Booking,
  Payment,
  Service,
  UserRole,
  VehicleType,
  ServiceType,
  BookingStatus,
  PaymentMethod,
  PaymentStatus
} from '@prisma/client';

// Types étendus avec relations
export interface UserWithRelations extends User {
  bookings?: Booking[];
  driver?: Driver;
  payments?: Payment[];
}

export interface DriverWithRelations extends Driver {
  user: User;
  vehicle?: Vehicle;
  bookings?: Booking[];
}

export interface VehicleWithRelations extends Vehicle {
  drivers?: Driver[];
  bookings?: Booking[];
}

export interface BookingWithRelations extends Booking {
  user: User;
  driver?: Driver;
  vehicle?: Vehicle;
  payments?: Payment[];
}

export interface PaymentWithRelations extends Payment {
  booking: Booking;
  user: User;
}

// Types pour les requêtes API
export interface CreateUserRequest {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: 'CLIENT' | 'DRIVER' | 'ADMIN';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateBookingRequest {
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
  vehicleType?: 'SEDAN' | 'SUV' | 'VAN' | 'LUXURY';
  specialRequests?: string;
}

export interface UpdateBookingRequest {
  status?: 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  driverId?: string;
  vehicleId?: string;
  totalPrice?: number;
  distance?: number;
  duration?: number;
}

export interface CreatePaymentRequest {
  bookingId: string;
  amount: number;
  method: 'WAVE' | 'ORANGE_MONEY' | 'CASH' | 'CARD';
  phoneNumber?: string;
}

export interface CompleteBookingWithPaymentRequest {
  amount: number;
  method: 'WAVE' | 'ORANGE_MONEY' | 'CASH' | 'CARD';
  phoneNumber?: string;
  transactionId?: string;
  notes?: string;
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  expiresIn: string;
}

// Types pour la géolocalisation
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  address: string;
  coordinates: Coordinates;
  placeId?: string;
  components?: {
    street?: string;
    city?: string;
    district?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface DirectionsResult {
  distance: number; // en kilomètres
  duration: number; // en minutes
  route: Coordinates[];
  instructions?: string[];
}

// Types pour les paiements mobiles
export interface WavePaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  description?: string;
  callbackUrl?: string;
}

export interface OrangeMoneyPaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  description?: string;
  callbackUrl?: string;
}

// Types pour les notifications
export interface SMSNotification {
  to: string;
  message: string;
  bookingId?: string;
}

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  bookingId?: string;
}

// Types utilitaires
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterOptions {
  status?: string;
  serviceType?: string;
  vehicleType?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  driverId?: string;
}