import { CreateUserRequest, CreateBookingRequest, LoginRequest } from '../types/index';

// Validation des emails
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation des numéros de téléphone sénégalais
export const isValidSenegalPhone = (phone: string): boolean => {
  // Format: +221XXXXXXXXX ou 221XXXXXXXXX ou 7XXXXXXXX ou 3XXXXXXXX
  const phoneRegex = /^(\+221|221)?[73][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Normaliser le numéro de téléphone
export const normalizePhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.startsWith('+221')) {
    return cleaned;
  }
  if (cleaned.startsWith('221')) {
    return '+' + cleaned;
  }
  if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('3'))) {
    return '+221' + cleaned;
  }
  return phone; // Retourner tel quel si format non reconnu
};

// Validation du mot de passe
export const isValidPassword = (password: string): boolean => {
  // Au moins 8 caractères, une majuscule, une minuscule, un chiffre
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Validation des coordonnées GPS
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

// Validation des données utilisateur
export const validateUserData = (data: CreateUserRequest): string[] => {
  const errors: string[] = [];

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Email invalide');
  }

  if (!data.phone || !isValidSenegalPhone(data.phone)) {
    errors.push('Numéro de téléphone invalide (format sénégalais requis)');
  }

  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.push('Le prénom doit contenir au moins 2 caractères');
  }

  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }

  if (!data.password || !isValidPassword(data.password)) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre');
  }

  if (data.role && !['CLIENT', 'DRIVER', 'ADMIN'].includes(data.role)) {
    errors.push('Rôle invalide');
  }

  return errors;
};

// Validation des données de connexion
export const validateLoginData = (data: LoginRequest): string[] => {
  const errors: string[] = [];

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Email invalide');
  }

  if (!data.password || data.password.length < 1) {
    errors.push('Mot de passe requis');
  }

  return errors;
};

// Validation des données de réservation
export const validateBookingData = (data: CreateBookingRequest): string[] => {
  const errors: string[] = [];

  if (!data.serviceType || !['AIRPORT', 'CITY', 'INTERCITY', 'HOURLY', 'EVENT'].includes(data.serviceType)) {
    errors.push('Type de service invalide');
  }

  if (!data.pickupLocation || data.pickupLocation.trim().length < 3) {
    errors.push('Lieu de prise en charge requis (minimum 3 caractères)');
  }

  if (!data.destination || data.destination.trim().length < 3) {
    errors.push('Destination requise (minimum 3 caractères)');
  }

  if (!data.scheduledDate) {
    errors.push('Date de réservation requise');
  } else {
    const bookingDate = new Date(data.scheduledDate);
    const now = new Date();
    if (bookingDate < now) {
      errors.push('La date de réservation ne peut pas être dans le passé');
    }
  }

  if (!data.scheduledTime) {
    errors.push('Heure de réservation requise');
  }

  if (!data.passengers || data.passengers < 1 || data.passengers > 8) {
    errors.push('Nombre de passagers invalide (1-8)');
  }

  if (data.vehicleType && !['SEDAN', 'SUV', 'VAN', 'LUXURY'].includes(data.vehicleType)) {
    errors.push('Type de véhicule invalide');
  }

  if (data.pickupLat !== undefined && data.pickupLng !== undefined) {
    if (!isValidCoordinates(data.pickupLat, data.pickupLng)) {
      errors.push('Coordonnées de prise en charge invalides');
    }
  }

  if (data.destinationLat !== undefined && data.destinationLng !== undefined) {
    if (!isValidCoordinates(data.destinationLat, data.destinationLng)) {
      errors.push('Coordonnées de destination invalides');
    }
  }

  return errors;
};

// Sanitisation des données
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>"'&]/g, '');
};

// Validation des montants
export const isValidAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 1000000; // Maximum 1 million FCFA
};

// Validation des IDs
export const isValidId = (id: string): boolean => {
  // Validation pour les IDs Prisma (cuid)
  const cuidRegex = /^c[a-z0-9]{24}$/;
  return cuidRegex.test(id);
};