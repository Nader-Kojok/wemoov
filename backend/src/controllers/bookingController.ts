import { Request, Response } from 'express';
import { prisma } from '../utils/database.js';
import { validateBookingData, isValidId } from '../utils/validation.js';
import { CreateBookingRequest, UpdateBookingRequest, ApiResponse, PaginationOptions, FilterOptions } from '../types/index.js';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createPaginatedResponse, 
  createCreatedResponse, 
  createUpdatedResponse, 
  ErrorResponses 
} from '../utils/responseHelpers.js';

// Créer une nouvelle réservation
export const createBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ErrorResponses.UNAUTHORIZED());
    }

    const bookingData: CreateBookingRequest = req.body;

    // Validation des données
    const validationErrors = validateBookingData(bookingData);
    if (validationErrors.length > 0) {
      return res.status(400).json(
        createErrorResponse('Données invalides', 'VALIDATION_ERROR')
      );
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
      default:
        basePrice = 5000; // Prix par défaut
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
      }
    }

    const totalPrice = Math.round(basePrice * priceMultiplier);

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
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
        specialRequests: bookingData.specialRequests
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

    res.status(201).json(createCreatedResponse(booking));

  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error);
    res.status(500).json(ErrorResponses.INTERNAL_ERROR());
  }
};

// Obtenir toutes les réservations (avec pagination et filtres)
export const getBookings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ErrorResponses.UNAUTHORIZED());
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      serviceType,
      dateFrom,
      dateTo
    } = req.query as any;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construire les filtres
    const where: any = {};
    
    // Si l'utilisateur n'est pas admin, ne voir que ses réservations
    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (serviceType) {
      where.serviceType = serviceType;
    }

    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) {
        where.scheduledDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.scheduledDate.lte = new Date(dateTo);
      }
    }

    // Récupérer les réservations
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder
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
          }
        }
      }),
      prisma.booking.count({ where })
    ]);

    res.status(200).json(createPaginatedResponse(bookings, total, parseInt(page), take));

  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    res.status(500).json(ErrorResponses.INTERNAL_ERROR());
  }
};

// Obtenir une réservation par ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ErrorResponses.UNAUTHORIZED());
    }

    const { id } = req.params;

    if (!id || !isValidId(id)) {
      return res.status(400).json(
        createErrorResponse('ID de réservation invalide', 'INVALID_ID')
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
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
            },
            vehicle: {
              select: {
                type: true,
                brand: true,
                model: true,
                licensePlate: true
              }
            }
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json(ErrorResponses.NOT_FOUND('Réservation'));
    }

    // Vérifier les permissions
    if (req.user.role !== 'ADMIN' && booking.userId !== req.user.id) {
      return res.status(403).json(ErrorResponses.FORBIDDEN());
    }

    res.status(200).json(createSuccessResponse(booking));

  } catch (error) {
    console.error('Erreur lors de la récupération de la réservation:', error);
    res.status(500).json(ErrorResponses.INTERNAL_ERROR());
  }
};

// Mettre à jour une réservation
export const updateBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ErrorResponses.UNAUTHORIZED());
    }

    const { id } = req.params;
    const updateData: UpdateBookingRequest = req.body;

    if (!id || !isValidId(id)) {
      return res.status(400).json(
        createErrorResponse('ID de réservation invalide', 'INVALID_ID')
      );
    }

    // Vérifier que la réservation existe
    const existingBooking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!existingBooking) {
      return res.status(404).json(ErrorResponses.NOT_FOUND('Réservation'));
    }

    // Vérifier les permissions
    const canUpdate = req.user.role === 'ADMIN' || 
                     req.user.role === 'DRIVER' || 
                     existingBooking.userId === req.user.id;

    if (!canUpdate) {
      return res.status(403).json(ErrorResponses.FORBIDDEN());
    }

    // Les clients ne peuvent modifier que certains champs et seulement si le statut est PENDING
    if (req.user.role === 'CLIENT') {
      if (existingBooking.status !== 'PENDING') {
        return res.status(400).json(
          createErrorResponse('Impossible de modifier une réservation confirmée', 'BOOKING_NOT_MODIFIABLE')
        );
      }
      // Limiter les champs modifiables pour les clients
      const allowedFields = ['specialRequests'];
      const requestedFields = Object.keys(updateData);
      const invalidFields = requestedFields.filter(field => !allowedFields.includes(field));
      
      if (invalidFields.length > 0) {
        return res.status(400).json(
          createErrorResponse(`Champs non modifiables: ${invalidFields.join(', ')}`, 'INVALID_FIELDS')
        );
      }
    }

    // Mettre à jour la réservation
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
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
        }
      }
    });

    res.status(200).json(createUpdatedResponse(updatedBooking));

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réservation:', error);
    res.status(500).json(ErrorResponses.INTERNAL_ERROR());
  }
};

// Annuler une réservation
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ErrorResponses.UNAUTHORIZED());
    }

    const { id } = req.params;

    if (!id || !isValidId(id)) {
      return res.status(400).json(
        createErrorResponse('ID de réservation invalide', 'INVALID_ID')
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      return res.status(404).json(ErrorResponses.NOT_FOUND('Réservation'));
    }

    // Vérifier les permissions
    if (req.user.role !== 'ADMIN' && booking.userId !== req.user.id) {
      return res.status(403).json(ErrorResponses.FORBIDDEN());
    }

    // Vérifier si la réservation peut être annulée
    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
      return res.status(400).json(
        createErrorResponse('Cette réservation ne peut pas être annulée', 'BOOKING_NOT_CANCELLABLE')
      );
    }

    // Annuler la réservation
    const cancelledBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      ...createSuccessResponse(cancelledBooking),
      message: 'Réservation annulée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'annulation de la réservation:', error);
    res.status(500).json(ErrorResponses.INTERNAL_ERROR());
  }
};