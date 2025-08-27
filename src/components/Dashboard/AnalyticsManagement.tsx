import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Car,
  Clock,
  MapPin,
  Info
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  bookings: {
    current: number;
    previous: number;
    growth: number;
  };
  users: {
    current: number;
    previous: number;
    growth: number;
  };
  popularRoutes: Array<{
    from: string;
    to: string;
    count: number;
    revenue: number;
  }>;
  monthlyData: Array<{
    month: string;
    bookings: number;
    revenue: number;
    users: number;
  }>;
}

const AnalyticsManagement: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAnalytics({
        revenue: {
          current: 2450000,
          previous: 2100000,
          growth: 16.7
        },
        bookings: {
          current: 156,
          previous: 142,
          growth: 9.9
        },
        users: {
          current: 89,
          previous: 76,
          growth: 17.1
        },
        popularRoutes: [
          { from: 'Aéroport Dakar', to: 'Plateau', count: 45, revenue: 675000 },
          { from: 'Plateau', to: 'Almadies', count: 32, revenue: 480000 },
          { from: 'Parcelles', to: 'Aéroport Dakar', count: 28, revenue: 420000 },
          { from: 'Yoff', to: 'Plateau', count: 24, revenue: 360000 },
          { from: 'Guédiawaye', to: 'Dakar Centre', count: 19, revenue: 285000 }
        ],
        monthlyData: [
          { month: 'Jan', bookings: 120, revenue: 1800000, users: 65 },
          { month: 'Fév', bookings: 135, revenue: 2025000, users: 72 },
          { month: 'Mar', bookings: 142, revenue: 2130000, users: 76 },
          { month: 'Avr', bookings: 156, revenue: 2340000, users: 89 }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const MetricCard: React.FC<{
    title: string;
    current: number;
    previous: number;
    growth: number;
    icon: React.ComponentType<{ className?: string }>;
    format?: 'currency' | 'number';
  }> = ({ title, current, previous, growth, icon: Icon, format = 'number' }) => {
    const isPositive = growth > 0;
    const formattedCurrent = format === 'currency' ? formatCurrency(current) : current.toLocaleString();
    const formattedPrevious = format === 'currency' ? formatCurrency(previous) : previous.toLocaleString();

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{formattedCurrent}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">{Math.abs(growth).toFixed(1)}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs période précédente</p>
            <p className="text-xs text-gray-400">{formattedPrevious}</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Statistiques Avancées</h1>
              <p className="text-gray-600">Analysez les performances et tendances de votre plateforme WeMoov</p>
            </div>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Métriques Clés</h2>
          <p className="text-sm text-gray-600 mt-1">
            Indicateurs de performance principaux avec évolution
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Revenus"
              current={analytics.revenue.current}
              previous={analytics.revenue.previous}
              growth={analytics.revenue.growth}
              icon={DollarSign}
              format="currency"
            />
            <MetricCard
              title="Réservations"
              current={analytics.bookings.current}
              previous={analytics.bookings.previous}
              growth={analytics.bookings.growth}
              icon={Calendar}
            />
            <MetricCard
              title="Nouveaux Utilisateurs"
              current={analytics.users.current}
              previous={analytics.users.previous}
              growth={analytics.users.growth}
              icon={Users}
            />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Tendances Mensuelles</h3>
            <p className="text-sm text-gray-600 mt-1">
              Évolution des métriques sur les derniers mois
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.monthlyData.map((data) => (
                <div key={data.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-blue-600">{data.month}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{data.bookings} réservations</p>
                      <p className="text-xs text-gray-500">{data.users} nouveaux utilisateurs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(data.revenue)}</p>
                    <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-2 bg-blue-600 rounded-full" 
                        style={{ width: `${(data.revenue / Math.max(...analytics.monthlyData.map(d => d.revenue))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Routes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Trajets Populaires</h3>
            <p className="text-sm text-gray-600 mt-1">
              Les itinéraires les plus demandés
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.popularRoutes.map((route, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{route.from} → {route.to}</p>
                      <p className="text-xs text-gray-500">{route.count} courses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(route.revenue)}</p>
                    <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-2 bg-green-600 rounded-full" 
                        style={{ width: `${(route.count / Math.max(...analytics.popularRoutes.map(r => r.count))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Indicateurs de Performance</h2>
          <p className="text-sm text-gray-600 mt-1">
            Métriques opérationnelles et de satisfaction
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Temps d'attente moyen</p>
                  <p className="text-lg font-semibold text-gray-900">8 min</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Car className="h-6 w-6 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Taux d'occupation</p>
                  <p className="text-lg font-semibold text-gray-900">78%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Note moyenne</p>
                  <p className="text-lg font-semibold text-gray-900">4.6/5</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Taux de rétention</p>
                  <p className="text-lg font-semibold text-gray-900">85%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="h-6 w-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Informations sur les Statistiques</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Les données sont mises à jour en temps réel et reflètent l'activité actuelle</li>
              <li>• Les pourcentages de croissance sont calculés par rapport à la période précédente</li>
              <li>• Les trajets populaires sont classés par nombre de courses et revenus générés</li>
              <li>• Les indicateurs de performance incluent les métriques de satisfaction client</li>
              <li>• Vous pouvez exporter ces données pour des analyses plus approfondies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsManagement;