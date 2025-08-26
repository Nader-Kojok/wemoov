import React, { useState } from 'react';
import Modal from '../shared/Modal';
import type { Driver, Vehicle } from '../../../types/dashboard';

interface VehicleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver | null;
  availableVehicles: Vehicle[];
  onAssign: (vehicleId: string | null) => Promise<void>;
  isLoading?: boolean;
}

const VehicleAssignmentModal: React.FC<VehicleAssignmentModalProps> = ({
  isOpen,
  onClose,
  driver,
  availableVehicles,
  onAssign,
  isLoading = false
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!driver) return null;

  const handleAssign = async () => {
    setIsSubmitting(true);
    try {
      await onAssign(selectedVehicleId || null);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    if (vehicleId) {
      handleAssign();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assigner un véhicule"
      size="md"
    >
      <div className="space-y-4">
        {/* Driver Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Chauffeur sélectionné</h4>
          <div className="text-sm text-gray-600">
            <p><span className="font-medium">Nom:</span> {driver.user.firstName} {driver.user.lastName}</p>
            <p><span className="font-medium">Téléphone:</span> {driver.user.phone}</p>
            <p><span className="font-medium">Permis:</span> {driver.licenseNumber}</p>
            {driver.vehicle && (
              <p><span className="font-medium">Véhicule actuel:</span> {driver.vehicle.brand} {driver.vehicle.model} ({driver.vehicle.licensePlate})</p>
            )}
          </div>
        </div>

        {/* Vehicle Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un véhicule
          </label>
          <select
            value={selectedVehicleId}
            onChange={(e) => handleVehicleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading || isSubmitting}
          >
            <option value="">Sélectionner un véhicule</option>
            <option value="">🚫 Retirer le véhicule actuel</option>
            {availableVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.brand} {vehicle.model} - {vehicle.licensePlate} 
                ({vehicle.type}, {vehicle.capacity} places)
              </option>
            ))}
          </select>
        </div>

        {/* Available Vehicles List */}
        {availableVehicles.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Véhicules disponibles</h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {availableVehicles.map((vehicle) => (
                <div 
                  key={vehicle.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {vehicle.brand} {vehicle.model}
                    </div>
                    <div className="text-sm text-gray-500">
                      {vehicle.licensePlate} • {vehicle.type} • {vehicle.capacity} places
                    </div>
                    {vehicle.features.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        {vehicle.features.slice(0, 3).join(', ')}
                        {vehicle.features.length > 3 && ` +${vehicle.features.length - 3} autres`}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleVehicleChange(vehicle.id)}
                    className="ml-3 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading || isSubmitting}
                  >
                    {isSubmitting ? 'Assignation...' : 'Assigner'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {availableVehicles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun véhicule disponible pour l'assignation</p>
            <p className="text-sm mt-1">Tous les véhicules sont déjà assignés à d'autres chauffeurs</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Fermer
          </button>
          {driver.vehicle && (
            <button
              type="button"
              onClick={() => handleVehicleChange('')}
              className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Suppression...' : 'Retirer le véhicule'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default VehicleAssignmentModal;