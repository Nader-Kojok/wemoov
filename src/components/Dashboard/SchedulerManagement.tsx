import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Calendar,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface SchedulerStats {
  pendingBookings: number;
  assignedBookings: number;
  inProgressBookings: number;
  upcomingBookings: number;
  schedulerActive: boolean;
  lastCheck: string;
  intervalMinutes: number;
}

interface ScheduledBooking {
  id: string;
  status: string;
  scheduledDateTime: string;
  timeLeftMinutes: number;
  canAutoStart: boolean;
  user: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  driver?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  pickupLocation: string;
  destination: string;
}

interface ScheduledBookingsStatus {
  currentDateTime: string;
  upcomingBookings: ScheduledBooking[];
  summary: {
    totalUpcoming: number;
    readyToStart: number;
    needingDriver: number;
    pending: number;
  };
}

const SchedulerManagement: React.FC = () => {
  const [stats, setStats] = useState<SchedulerStats | null>(null);
  const [status, setStatus] = useState<ScheduledBookingsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [lastTriggerResult, setLastTriggerResult] = useState<any>(null);

  useEffect(() => {
    fetchSchedulerData();
    // Actualiser les données toutes les 30 secondes
    const interval = setInterval(fetchSchedulerData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSchedulerData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [statsResponse, statusResponse] = await Promise.all([
        fetch('/api/scheduler/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/scheduler/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsResponse.ok && statusResponse.ok) {
        const statsData = await statsResponse.json();
        const statusData = await statusResponse.json();
        
        setStats(statsData.data);
        setStatus(statusData.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données du scheduler:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerScheduler = async () => {
    try {
      setTriggering(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/scheduler/trigger', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setLastTriggerResult(result);
        // Actualiser les données après le déclenchement
        await fetchSchedulerData();
      }
    } catch (error) {
      console.error('Erreur lors du déclenchement du scheduler:', error);
    } finally {
      setTriggering(false);
    }
  };

  const formatTimeLeft = (minutes: number): string => {
    if (minutes < 0) {
      return 'En retard';
    } else if (minutes < 60) {
      return `${minutes} min`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}min`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} jour(s)`;
    }
  };

  const getStatusColor = (booking: ScheduledBooking): string => {
    if (booking.timeLeftMinutes < 0) return 'text-red-600 bg-red-50';
    if (booking.timeLeftMinutes <= 5 && booking.canAutoStart) return 'text-green-600 bg-green-50';
    if (booking.timeLeftMinutes <= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-blue-600 bg-blue-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scheduler Automatique</h1>
              <p className="text-gray-600">Gestion automatisée des statuts de réservation</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchSchedulerData}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </button>
            <button
              onClick={triggerScheduler}
              disabled={triggering}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {triggering ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Déclencher maintenant
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assignées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.assignedBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgressBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prochaines 24h</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingBookings}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statut du scheduler */}
      {stats && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statut du Scheduler</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${stats.schedulerActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                Statut: <span className={`font-medium ${stats.schedulerActive ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.schedulerActive ? 'Actif' : 'Inactif'}
                </span>
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Intervalle: <span className="font-medium">{stats.intervalMinutes} minute(s)</span>
            </div>
            <div className="text-sm text-gray-600">
              Dernière vérification: <span className="font-medium">
                {new Date(stats.lastCheck).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Résultat du dernier déclenchement */}
      {lastTriggerResult && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dernier déclenchement manuel</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">{lastTriggerResult.message}</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Traitées:</span>
                <span className="ml-2 font-medium">{lastTriggerResult.data.processed}</span>
              </div>
              <div>
                <span className="text-gray-500">Mises à jour:</span>
                <span className="ml-2 font-medium text-green-600">{lastTriggerResult.data.updated}</span>
              </div>
              <div>
                <span className="text-gray-500">Erreurs:</span>
                <span className="ml-2 font-medium text-red-600">{lastTriggerResult.data.errors.length}</span>
              </div>
            </div>
            {lastTriggerResult.data.errors.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-red-600 mb-1">Erreurs:</p>
                <ul className="text-xs text-red-500 space-y-1">
                  {lastTriggerResult.data.errors.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prochaines réservations */}
      {status && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Prochaines Réservations</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Prêtes: <span className="font-medium text-green-600">{status.summary.readyToStart}</span></span>
                <span>Sans chauffeur: <span className="font-medium text-yellow-600">{status.summary.needingDriver}</span></span>
                <span>En attente: <span className="font-medium text-blue-600">{status.summary.pending}</span></span>
              </div>
            </div>
          </div>
          <div className="p-6">
            {status.upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune réservation programmée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {status.upcomingBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking)}`}>
                            {booking.status}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {booking.user.firstName} {booking.user.lastName}
                          </span>
                          {booking.driver && (
                            <span className="text-xs text-gray-500">
                              → {booking.driver.user.firstName} {booking.driver.user.lastName}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          {booking.pickupLocation} → {booking.destination}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Programmée: {new Date(booking.scheduledDateTime).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          booking.timeLeftMinutes < 0 ? 'text-red-600' :
                          booking.timeLeftMinutes <= 5 ? 'text-green-600' :
                          booking.timeLeftMinutes <= 30 ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          {formatTimeLeft(booking.timeLeftMinutes)}
                        </div>
                        {booking.canAutoStart && booking.timeLeftMinutes <= 5 && (
                          <div className="text-xs text-green-600 font-medium">Démarrage auto</div>
                        )}
                        {!booking.driver && (
                          <div className="text-xs text-yellow-600">Sans chauffeur</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulerManagement;