import React from 'react';
import { Edit, Trash2, Eye, Car, Users, Calendar } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import type { Vehicle } from '../../../types/dashboard';

interface VehiclesTableProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: string) => void;
  onView: (vehicle: Vehicle) => void;
  isLoading?: boolean;
}

const VehiclesTable: React.FC<VehiclesTableProps> = ({
  vehicles,
  onEdit,
  onDelete,
  onView,
  isLoading = false
}) => {
  const handleDelete = (vehicle: Vehicle) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le véhicule ${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate}) ?`)) {
      onDelete(vehicle.id);
    }
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'SEDAN':
        return '🚗';
      case 'SUV':
        return '🚙';
      case 'VAN':
        return '🚐';
      case 'LUXURY':
        return '🏎️';
      default:
        return '🚗';
    }
  };

  const getVehicleTypeLabel = (type: string) => {
    switch (type) {
      case 'SEDAN':
        return 'Berline';
      case 'SUV':
        return 'SUV';
      case 'VAN':
        return 'Van';
      case 'LUXURY':
        return 'Luxe';
      default:
        return type;
    }
  };

  const getAssignedDrivers = (vehicle: Vehicle) => {
    if (vehicle.drivers.length === 0) {
      return (
        <span className="text-gray-400 italic">Aucun chauffeur assigné</span>
      );
    }

    return (
      <div className="space-y-1">
        {vehicle.drivers.slice(0, 2).map((driver) => (
          <div key={driver.id} className="flex items-center text-sm">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium mr-2">
              {driver.user.firstName.charAt(0)}{driver.user.lastName.charAt(0)}
            </div>
            <span className="text-gray-900">
              {driver.user.firstName} {driver.user.lastName}
            </span>
            <StatusBadge 
              status={driver.isAvailable ? 'available' : 'unavailable'}
              label={driver.isAvailable ? 'Dispo' : 'Occupé'}
              size="sm"
            />
          </div>
        ))}
        {vehicle.drivers.length > 2 && (
          <div className="text-xs text-gray-500">
            +{vehicle.drivers.length - 2} autre(s) chauffeur(s)
          </div>
        )}
      </div>
    );
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

  if (vehicles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Car className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun véhicule trouvé</h3>
          <p className="text-gray-500">Commencez par ajouter votre premier véhicule.</p>
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
                Véhicule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spécifications
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chauffeurs Assignés
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
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                {/* Vehicle Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-2xl">
                      {getVehicleTypeIcon(vehicle.type)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {vehicle.brand} {vehicle.model}
                      </div>
                      <div className="text-sm text-gray-500">
                        {vehicle.licensePlate} • {getVehicleTypeLabel(vehicle.type)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Specifications */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {vehicle.year}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      {vehicle.capacity} places
                    </div>
                    {vehicle.features.length > 0 && (
                      <div className="text-xs text-gray-400">
                        {vehicle.features.slice(0, 2).join(', ')}
                        {vehicle.features.length > 2 && ` +${vehicle.features.length - 2}`}
                      </div>
                    )}
                  </div>
                </td>

                {/* Assigned Drivers */}
                <td className="px-6 py-4">
                  {getAssignedDrivers(vehicle)}
                </td>

                {/* Statistics */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-900">
                      {vehicle._count.bookings} réservations
                    </div>
                    <div className="text-sm text-gray-500">
                      {vehicle.drivers.length} chauffeur(s)
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge 
                    status={vehicle.isAvailable ? 'available' : 'unavailable'}
                    label={vehicle.isAvailable ? 'Disponible' : 'Indisponible'}
                  />
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(vehicle)}
                      className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50 transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(vehicle)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle)}
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

export default VehiclesTable;