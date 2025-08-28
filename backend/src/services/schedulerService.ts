import { prisma } from '../utils/database.js';
import { BookingService } from './bookingService.js';

/**
 * Service de planification pour automatiser les changements de statut des réservations
 */
export class SchedulerService {
  /**
   * Vérifie et met à jour automatiquement les statuts des réservations programmées
   */
  static async processScheduledBookings(): Promise<{
    processed: number;
    updated: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processed = 0;
    let updated = 0;

    try {
      console.log('🔄 Démarrage de la vérification des réservations programmées...');
      
      // Obtenir la date et l'heure actuelles
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
      
      console.log(`📅 Vérification pour: ${currentDate} à ${currentTime}`);

      // Trouver les réservations qui doivent démarrer maintenant
      const bookingsToStart = await prisma.booking.findMany({
        where: {
          status: 'ASSIGNED',
          scheduledDate: {
            lte: now // Date programmée <= maintenant
          },
          scheduledTime: {
            lte: currentTime // Heure programmée <= maintenant
          },
          // S'assurer qu'un chauffeur est assigné
          driverId: {
            not: null
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
        }
      });

      console.log(`🎯 ${bookingsToStart.length} réservation(s) à démarrer automatiquement`);

      // Traiter chaque réservation
      for (const booking of bookingsToStart) {
        processed++;
        
        try {
          // Vérifier si la réservation doit vraiment démarrer
          const scheduledDateTime = new Date(`${booking.scheduledDate.toISOString().split('T')[0]}T${booking.scheduledTime}:00`);
          
          // Ajouter une tolérance de 5 minutes pour éviter les démarrages trop précoces
          const toleranceMs = 5 * 60 * 1000; // 5 minutes en millisecondes
          const shouldStart = (now.getTime() - scheduledDateTime.getTime()) >= -toleranceMs;
          
          if (!shouldStart) {
            console.log(`⏰ Réservation ${booking.id} pas encore prête (programmée pour ${scheduledDateTime.toLocaleString()})`);
            continue;
          }

          // Mettre à jour le statut vers IN_PROGRESS
          await prisma.booking.update({
            where: { id: booking.id },
            data: { 
              status: 'IN_PROGRESS',
              updatedAt: now
            }
          });

          updated++;
          
          console.log(`✅ Réservation ${booking.id} démarrée automatiquement (${booking.user.firstName} ${booking.user.lastName})`);
          
          // TODO: Envoyer des notifications aux utilisateurs et chauffeurs
          // await NotificationService.sendTripStartedNotification(booking);
          
        } catch (error) {
          const errorMsg = `Erreur lors du démarrage automatique de la réservation ${booking.id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

      // Vérifier les réservations qui devraient être confirmées automatiquement
      await this.processAutoConfirmations(now, errors);
      
      console.log(`🏁 Traitement terminé: ${updated}/${processed} réservations mises à jour`);
      
      return {
        processed,
        updated,
        errors
      };
      
    } catch (error) {
      const errorMsg = `Erreur générale du scheduler: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
      console.error(`💥 ${errorMsg}`);
      errors.push(errorMsg);
      
      return {
        processed,
        updated,
        errors
      };
    }
  }

  /**
   * Traite les confirmations automatiques des réservations
   * Les réservations PENDING peuvent être confirmées automatiquement 1 heure avant le départ
   */
  private static async processAutoConfirmations(now: Date, errors: string[]): Promise<void> {
    try {
      // Calculer l'heure dans 1 heure
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const targetDate = oneHourFromNow.toISOString().split('T')[0];
      const targetTime = oneHourFromNow.toTimeString().split(' ')[0].substring(0, 5);
      
      // Trouver les réservations à confirmer automatiquement
      const bookingsToConfirm = await prisma.booking.findMany({
        where: {
          status: 'PENDING',
          scheduledDate: {
            lte: oneHourFromNow
          },
          scheduledTime: {
            lte: targetTime
          }
        }
      });

      console.log(`📋 ${bookingsToConfirm.length} réservation(s) à confirmer automatiquement`);

      for (const booking of bookingsToConfirm) {
        try {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { 
              status: 'CONFIRMED',
              updatedAt: now
            }
          });
          
          console.log(`✅ Réservation ${booking.id} confirmée automatiquement`);
          
        } catch (error) {
          const errorMsg = `Erreur lors de la confirmation automatique de la réservation ${booking.id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
        }
      }
      
    } catch (error) {
      const errorMsg = `Erreur lors du traitement des confirmations automatiques: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
      console.error(`❌ ${errorMsg}`);
      errors.push(errorMsg);
    }
  }

  /**
   * Démarre le scheduler avec un intervalle donné
   */
  static startScheduler(intervalMinutes: number = 1): NodeJS.Timeout {
    console.log(`🚀 Démarrage du scheduler avec un intervalle de ${intervalMinutes} minute(s)`);
    
    // Exécuter immédiatement une première fois
    this.processScheduledBookings();
    
    // Puis exécuter à intervalles réguliers
    return setInterval(() => {
      this.processScheduledBookings();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Arrête le scheduler
   */
  static stopScheduler(schedulerInterval: NodeJS.Timeout): void {
    console.log('🛑 Arrêt du scheduler');
    clearInterval(schedulerInterval);
  }

  /**
   * Obtient les statistiques du scheduler
   */
  static async getSchedulerStats(): Promise<{
    pendingBookings: number;
    assignedBookings: number;
    inProgressBookings: number;
    upcomingBookings: number;
  }> {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const [pendingBookings, assignedBookings, inProgressBookings, upcomingBookings] = await Promise.all([
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'ASSIGNED' } }),
      prisma.booking.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.booking.count({
        where: {
          scheduledDate: {
            gte: now,
            lte: tomorrow
          },
          status: {
            in: ['PENDING', 'CONFIRMED', 'ASSIGNED']
          }
        }
      })
    ]);
    
    return {
      pendingBookings,
      assignedBookings,
      inProgressBookings,
      upcomingBookings
    };
  }
}