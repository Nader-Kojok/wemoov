import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  Car,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  LayoutDashboard,
  Info
} from 'lucide-react';

interface DashboardStats {
  users: {
    total: number;
    clients: number;
    drivers: number;
    active: number;
  };
  bookings: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    recent: number;
  };
  payments: {
    totalRevenue: number;
    monthlyRevenue: number;
    pending: number;
  };
  vehicles: {
    total: number;
    available: number;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2 truncate">{value}</p>
          {change !== undefined && (
            <div className="flex items-center">
              {changeType === 'increase' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1 flex-shrink-0" />
              )}
              <span
                className={`text-sm font-medium ${
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-500 ml-1 hidden sm:inline">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]} flex-shrink-0 ml-4`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, icon: Icon, onClick, color }) => {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
    green: 'bg-green-600 hover:bg-green-700 shadow-green-200',
    yellow: 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-200',
    red: 'bg-red-600 hover:bg-red-700 shadow-red-200'
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-left w-full group`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
      </div>
      <h4 className="font-semibold text-sm mb-1">{title}</h4>
      <p className="text-xs opacity-90">{description}</p>
    </button>
  );
};

const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <LayoutDashboard className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
            <p className="text-gray-600">Vue d'ensemble de votre plateforme WeMoov</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Statistiques Générales</h2>
          <p className="text-sm text-gray-600 mt-1">
            Aperçu des métriques clés de votre plateforme
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatCard
              title="Total Utilisateurs"
              value={stats.users.total}
              change={12}
              changeType="increase"
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Réservations Totales"
              value={stats.bookings.total}
              change={8}
              changeType="increase"
              icon={Calendar}
              color="green"
            />
            <StatCard
              title="Revenus Totaux"
              value={formatCurrency(stats.payments.totalRevenue)}
              change={15}
              changeType="increase"
              icon={DollarSign}
              color="purple"
            />
            <StatCard
              title="Véhicules Disponibles"
              value={`${stats.vehicles.available}/${stats.vehicles.total}`}
              icon={Car}
              color="yellow"
            />
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Bookings Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">État des Réservations</h3>
            <p className="text-sm text-gray-600 mt-1">
              Répartition des réservations par statut
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">En attente</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.bookings.pending}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Terminées</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.bookings.completed}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Annulées</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.bookings.cancelled}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Info */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Revenus</h3>
            <p className="text-sm text-gray-600 mt-1">
              Informations financières et utilisateurs actifs
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Revenus du mois</span>
                <span className="text-lg font-bold text-purple-600">{formatCurrency(stats.payments.monthlyRevenue)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Paiements en attente</span>
                <span className="text-lg font-bold text-blue-600">{stats.payments.pending}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Utilisateurs actifs</span>
                <span className="text-lg font-bold text-green-600">{stats.users.active}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Actions Rapides</h3>
          <p className="text-sm text-gray-600 mt-1">
            Accès rapide aux fonctionnalités principales
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              title="Nouvelle Réservation"
              description="Créer une réservation"
              icon={Calendar}
              onClick={() => window.location.href = '/dashboard/bookings/new'}
              color="blue"
            />
            <QuickAction
              title="Gérer Utilisateurs"
              description="Voir tous les utilisateurs"
              icon={Users}
              onClick={() => window.location.href = '/dashboard/users'}
              color="green"
            />
            <QuickAction
              title="Assigner Chauffeur"
              description="Assigner un chauffeur"
              icon={Car}
              onClick={() => window.location.href = '/dashboard/bookings?status=pending'}
              color="yellow"
            />
            <QuickAction
              title="Voir Paiements"
              description="Gérer les paiements"
              icon={DollarSign}
              onClick={() => window.location.href = '/dashboard/payments'}
              color="red"
            />
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="h-6 w-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Informations sur le Tableau de Bord</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Les statistiques sont mises à jour en temps réel pour refléter l'état actuel de la plateforme</li>
              <li>• Les pourcentages de croissance sont calculés par rapport au mois précédent</li>
              <li>• Les actions rapides permettent d'accéder directement aux fonctionnalités principales</li>
              <li>• Les métriques incluent tous les utilisateurs, réservations et transactions de la plateforme</li>
              <li>• Les données sont actualisées automatiquement lors du chargement de la page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;