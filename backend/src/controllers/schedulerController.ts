import { Request, Response } from 'express';
import { SchedulerService } from '../services/schedulerService.js';
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorResponses
} from '../utils/responseHelpers.js';

/**
 * Déclenche manuellement le traitement des réservations programmées
 */
export const triggerScheduler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ErrorResponses.UNAUTHORIZED());
    }

    // Seuls les admins peuvent déclencher le scheduler manuellement
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json(ErrorResponses.FORBIDDEN());
    }

    console.log(`🔧 Déclenchement manuel du scheduler par l'admin ${req.user.firstName} ${req.user.lastName}`);
    
    const result = await SchedulerService.processScheduledBookings();
    
    res.status(200).json({
      ...createSuccessResponse(result),
      message: `Scheduler exécuté avec succès: ${result.updated}/${result.processed} réservations mises à jour`
    });

  } catch (error) {
    console.error('Erreur lors du déclenchement manuel du scheduler:', error);
    res.status(500).json(ErrorResponses.INTERNAL_ERROR());
  }
};

/**
 * Obtient les statistiques du scheduler
 */
export const getSchedulerStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ErrorResponses.UNAUTHORIZED());
    }

    // Seuls les admins peuvent voir les statistiques du scheduler
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json(ErrorResponses.FORBIDDEN());
    }

    const stats = await SchedulerService.getSchedulerStats();
    
    // Ajouter des informations sur le statut du scheduler
    const schedulerInfo = {
      ...stats,
      schedulerActive: true, // Le scheduler est toujours actif une fois démarré
      lastCheck: new Date().toISOString(),
      intervalMinutes: parseInt(process.env.SCHEDULER_INTERVAL_MINUTES || '1')
    };
    
    res.status(200).json(createSuccessResponse(schedulerInfo));

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques du scheduler:', error);
    res.status(500).json(ErrorResponses.INTERNAL_ERROR());
  }
};

/**
 * Obtient le statut détaillé des réservations programmées
 */
export const getScheduledBookingsStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ErrorResponses.UNAUTHORIZED());
    }

    // Seuls les admins peuvent voir le statut détaillé
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json(ErrorResponses.FORBIDDEN());
    }

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
    
    // Obtenir les réservations qui devraient démarrer bientôt
    const { prisma } = await import('../utils/database.js');
    
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED', 'ASSIGNED']
        },
        scheduledDate: {
          gte: now
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
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      },
      take: 20 // Limiter à 20 prochaines réservations
    });
    
    // Calculer le temps restant pour chaque réservation
    const bookingsWithTimeLeft = upcomingBookings.map(booking => {
      const scheduledDateTime = new Date(`${booking.scheduledDate.toISOString().split('T')[0]}T${booking.scheduledTime}:00`);
      const timeLeftMs = scheduledDateTime.getTime() - now.getTime();
      const timeLeftMinutes = Math.floor(timeLeftMs / (1000 * 60));
      
      return {
        ...booking,
        timeLeftMinutes,
        scheduledDateTime: scheduledDateTime.toISOString(),
        canAutoStart: booking.status === 'ASSIGNED' && booking.driverId !== null
      };
    });
    
    const statusInfo = {
      currentDateTime: now.toISOString(),
      upcomingBookings: bookingsWithTimeLeft,
      summary: {
        totalUpcoming: upcomingBookings.length,
        readyToStart: bookingsWithTimeLeft.filter(b => b.canAutoStart && b.timeLeftMinutes <= 5).length,
        needingDriver: bookingsWithTimeLeft.filter(b => b.status === 'CONFIRMED' && !b.driverId).length,
        pending: bookingsWithTimeLeft.filter(b => b.status === 'PENDING').length
      }
    };
    
    res.status(200).json(createSuccessResponse(statusInfo));

  } catch (error) {
    console.error('Erreur lors de la récupération du statut des réservations programmées:', error);
    res.status(500).json(ErrorResponses.INTERNAL_ERROR());
  }
};