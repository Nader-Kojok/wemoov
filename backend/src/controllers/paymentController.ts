import { Request, Response } from 'express';
import { prisma } from '../utils/database.js';
import { isValidId } from '../utils/validation.js';
import { PaginationOptions, FilterOptions } from '../types/index.js';
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  ErrorResponses
} from '../utils/responseHelpers.js';

// Récupérer tous les paiements avec pagination et filtres
export const getPayments = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ErrorResponses.UNAUTHORIZED());
    }

    // Seuls les admins peuvent voir tous les paiements
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json(ErrorResponses.FORBIDDEN());
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      method,
      dateFrom,
      dateTo,
      userId,
      bookingId
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construction des filtres
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (method) {
      where.method = method;
    }

    if (userId && isValidId(userId as string)) {
      where.userId = userId;
    }

    if (bookingId && isValidId(bookingId as string)) {
      where.bookingId = bookingId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo as string);
      }
    }

    // Récupérer les paiements avec pagination
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          [sortBy as string]: sortOrder
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
          booking: {
            select: {
              id: true,
              serviceType: true,
              pickupLocation: true,
              destination: true,
              scheduledDate: true,
              scheduledTime: true,
              status: true
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json(
      createPaginatedResponse(
        payments,
        total,
        pageNum,
        limitNum
      )
    );

  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json(ErrorResponses.INTERNAL_ERROR());
  }
};

// Récupérer un paiement par ID
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ErrorResponses.UNAUTHORIZED());
    }

    const { id } = req.params;

    if (!id || !isValidId(id)) {
      return res.status(400).json(
        createErrorResponse('ID de paiement invalide', 'INVALID_ID')
      );
    }

    const payment = await prisma.payment.findUnique({
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
        booking: {
          select: {
            id: true,
            serviceType: true,
            pickupLocation: true,
            destination: true,
            scheduledDate: true,
            scheduledTime: true,
            status: true,
            totalPrice: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json(ErrorResponses.NOT_FOUND('Paiement'));
    }

    // Vérifier les permissions
    const canView = req.user.role === 'ADMIN' || payment.userId === req.user.id;

    if (!canView) {
      return res.status(403).json(ErrorResponses.FORBIDDEN());
    }

    res.status(200).json(createSuccessResponse(payment));

  } catch (error) {
    console.error('Erreur lors de la récupération du paiement:', error);
    res.status(500).json(ErrorResponses.INTERNAL_ERROR());
  }
};

// Récupérer les statistiques des paiements (pour les admins)
export const getPaymentStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ErrorResponses.UNAUTHORIZED());
    }

    // Seuls les admins peuvent voir les statistiques
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json(ErrorResponses.FORBIDDEN());
    }

    const { dateFrom, dateTo } = req.query;

    // Construction des filtres de date
    const dateFilter: any = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) {
        dateFilter.createdAt.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        dateFilter.createdAt.lte = new Date(dateTo as string);
      }
    }

    // Récupérer les statistiques
    const [totalPayments, completedPayments, totalAmount, paymentsByMethod, recentPayments] = await Promise.all([
      // Total des paiements
      prisma.payment.count({ where: dateFilter }),
      
      // Paiements terminés
      prisma.payment.count({ 
        where: { 
          ...dateFilter, 
          status: 'COMPLETED' 
        } 
      }),
      
      // Montant total
      prisma.payment.aggregate({
        where: { 
          ...dateFilter, 
          status: 'COMPLETED' 
        },
        _sum: {
          amount: true
        }
      }),
      
      // Répartition par méthode de paiement
      prisma.payment.groupBy({
        by: ['method'],
        where: { 
          ...dateFilter, 
          status: 'COMPLETED' 
        },
        _count: {
          _all: true
        },
        _sum: {
          amount: true
        }
      }),
      
      // Paiements récents
      prisma.payment.findMany({
        where: { 
          ...dateFilter, 
          status: 'COMPLETED' 
        },
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          booking: {
            select: {
              serviceType: true,
              pickupLocation: true,
              destination: true
            }
          }
        }
      })
    ]);

    const stats = {
      totalPayments,
      completedPayments,
      pendingPayments: totalPayments - completedPayments,
      totalAmount: totalAmount._sum.amount || 0,
      paymentsByMethod: paymentsByMethod.map((item: any) => ({
        method: item.method,
        count: item._count._all,
        amount: item._sum.amount || 0
      })),
      recentPayments
    };

    res.status(200).json(createSuccessResponse(stats));

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json(ErrorResponses.INTERNAL_ERROR());
  }
};