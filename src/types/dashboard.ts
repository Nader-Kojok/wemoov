export interface Driver {
  id: string;
  licenseNumber: string;
  isAvailable: boolean;
  rating: number;
  totalRides: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    isActive: boolean;
  };
  vehicle?: {
    id: string;
    type: string;
    brand: string;
    model: string;
    licensePlate: string;
    capacity: number;
    isAvailable: boolean;
  };
  _count: {
    bookings: number;
  };
}

export interface Vehicle {
  id: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  capacity: number;
  features: string[];
  isAvailable: boolean;
  drivers: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      phone: string;
    };
    isAvailable: boolean;
  }[];
  _count: {
    bookings: number;
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: string;
  isActive: boolean;
  driver?: Driver;
}

export interface DriverFormData {
  userId: string;
  licenseNumber: string;
  vehicleId: string;
}

export interface VehicleFormData {
  type: 'SEDAN' | 'SUV' | 'VAN' | 'LUXURY';
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  capacity: number;
  priceMultiplier: number;
  features: string[];
}

export type VehicleType = 'SEDAN' | 'SUV' | 'VAN' | 'LUXURY';

export interface FilterState {
  searchTerm: string;
  availabilityFilter: string;
  typeFilter: string;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
}