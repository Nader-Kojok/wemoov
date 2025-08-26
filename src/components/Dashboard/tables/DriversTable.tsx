import React from 'react';
import { Edit, Trash2, Settings, Phone, Mail, Star } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import type { Driver } from '../../../types/dashboard';

interface DriversTableProps {
  drivers: Driver[];
  onEdit: (driver: Driver) => void;
  onDelete: (driverId: string) => void;
  onAssignVehicle: (driver: Driver) => void;
  isLoading?: boolean;
}

const DriversTable: React.FC<DriversTableProps> = ({
  drivers,
  onEdit,
  onDelete,
  onAssignVehicle,
  isLoading = false
}) => {
  const handleDelete = (driver: Driver) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le chauffeur ${driver.user.firstName} ${driver.user.lastName} ?`)) {
      onDelete(driver.id);
    }
  };

  const getVehicleInfo = (driver: Driver) => {
    if (!driver.vehicle) {
      return (
        <span className="text-gray-400 italic">Aucun véhicule assigné</span>
      );
    }

    return (
      <div>
        <div className="font-medium text-gray-900">
          {driver.vehicle.brand} {driver.vehicle.model}
        </div>
        <div className="text-sm text-gray-500">
          {driver.vehicle.licensePlate} • {driver.vehicle.capacity} places
        </div>
      </div>
    );
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Settings className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun chauffeur trouvé</h3>
          <p className="text-gray-500">Commencez par créer votre premier chauffeur.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chauffeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Véhicule Assigné
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statistiques
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {drivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                {/* Driver Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {driver.user.firstName.charAt(0)}{driver.user.lastName.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {driver.user.firstName} {driver.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Permis: {driver.licenseNumber}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {driver.user.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {driver.user.email}
                    </div>
                  </div>
                </td>

                {/* Vehicle Assignment */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getVehicleInfo(driver)}
                </td>

                {/* Statistics */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="flex items-center mr-2">
                        {getRatingStars(driver.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {driver.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {driver.totalRides} courses • {driver._count.bookings} réservations
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <StatusBadge 
                      status={driver.isAvailable ? 'available' : 'unavailable'}
                      label={driver.isAvailable ? 'Disponible' : 'Indisponible'}
                    />
                    <StatusBadge 
                      status={driver.user.isActive ? 'available' : 'unavailable'}
                      label={driver.user.isActive ? 'Actif' : 'Inactif'}
                      size="sm"
                    />
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onAssignVehicle(driver)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                      title="Assigner un véhicule"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(driver)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(driver)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriversTable;