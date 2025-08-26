import { Request, Response } from 'express';
import { prisma } from '../utils/database.js';
import { ApiResponse } from '../types/index.js';

// Interface pour les réservations publiques (anonymes)
interface PublicBookingRequest {
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
  // Informations du client anonyme
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

// Créer une réservation publique (sans authentification)
export const createPublicBooking = async (req: Request, res: Response) => {
  try {
    const bookingData: PublicBookingRequest = req.body;

    // Validation des données requises
    const requiredFields = [
      'serviceType', 'pickupLocation', 'destination', 
      'scheduledDate', 'scheduledTime', 'passengers',
      'firstName', 'lastName', 'phone'
    ];

    const missingFields = requiredFields.filter(field => !bookingData[field as keyof PublicBookingRequest]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Champs requis manquants',
          details: missingFields
        }
      } as ApiResponse);
    }

    // Validation du numéro de téléphone (format sénégalais)
    const phoneRegex = /^(\+221|221)?[0-9]{9}$/;
    if (!phoneRegex.test(bookingData.phone.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Format de numéro de téléphone invalide'
        }
      } as ApiResponse);
    }

    // Validation de l'email si fourni
    if (bookingData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bookingData.email)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Format d\'email invalide'
          }
        } as ApiResponse);
      }
    }

    // Validation de la date (ne peut pas être dans le passé)
    const scheduledDateTime = new Date(`${bookingData.scheduledDate}T${bookingData.scheduledTime}`);
    if (scheduledDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'La date et l\'heure de réservation ne peuvent pas être dans le passé'
        }
      } as ApiResponse);
    }

    // Calculer le prix de base selon le service
    let basePrice = 0;
    switch (bookingData.serviceType) {
      case 'AIRPORT':
        basePrice = 15000;
        break;
      case 'CITY':
        basePrice = 2000;
        break;
      case 'HOURLY':
        basePrice = 8000;
        break;
      case 'INTERCITY':
        basePrice = 10000;
        break;
      case 'EVENT':
        basePrice = 12000;
        break;
      default:
        basePrice = 5000;
    }

    // Appliquer le multiplicateur selon le type de véhicule
    let priceMultiplier = 1.0;
    if (bookingData.vehicleType) {
      switch (bookingData.vehicleType) {
        case 'SUV':
          priceMultiplier = 1.3;
          break;
        case 'VAN':
          priceMultiplier = 1.5;
          break;
        case 'LUXURY':
          priceMultiplier = 2.0;
          break;
        default:
          priceMultiplier = 1.0;
      }
    }

    const totalPrice = Math.round(basePrice * priceMultiplier);

    // Créer ou trouver un utilisateur temporaire
    let user;
    const normalizedPhone = bookingData.phone.replace(/\s/g, '').replace(/^(\+221|221)/, '+221');
    
    // Chercher un utilisateur existant avec ce numéro
    const existingUser = await prisma.user.findFirst({
      where: {
        phone: normalizedPhone
      }
    });

    if (existingUser) {
      user = existingUser;
    } else {
      // Créer un nouvel utilisateur temporaire
      user = await prisma.user.create({
        data: {
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          phone: normalizedPhone,
          email: bookingData.email || `${normalizedPhone.replace('+', '')}@temp.wemoov.sn`,
          password: 'temp_password_' + Date.now(), // Mot de passe temporaire
          role: 'CLIENT'
        }
      });
    }

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
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
        totalPrice,
        specialRequests: bookingData.specialRequests,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Réservation créée avec succès. Vous serez contacté prochainement.'
    } as ApiResponse);

  } catch (error) {
    console.error('Erreur lors de la création de la réservation publique:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Erreur serveur lors de la création de la réservation' 
      }
    } as ApiResponse);
  }
};

// Obtenir le statut d'une réservation publique par numéro de téléphone
export const getPublicBookingStatus = async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: { message: 'Numéro de téléphone requis' }
      } as ApiResponse);
    }

    const normalizedPhone = phone.replace(/\s/g, '').replace(/^(\+221|221)/, '+221');
    
    // Trouver les réservations récentes pour ce numéro
    const bookings = await prisma.booking.findMany({
      where: {
        user: {
          phone: normalizedPhone
        },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
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
        driver: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5 // Limiter à 5 réservations récentes
    });

    res.status(200).json({
      success: true,
      data: bookings
    } as ApiResponse);

  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    } as ApiResponse);
  }
};