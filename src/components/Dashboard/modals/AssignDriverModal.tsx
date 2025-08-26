import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { useNotifications } from '../shared/NotificationSystem';

interface Driver {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  vehicle?: {
    id: string;
    type: string;
    brand: string;
    model: string;
    licensePlate: string;
  };
}

interface Booking {
  id: string;
  pickupLocation: string;
  destination: string;
  status: string;
  user: {
    firstName: string;
    lastName: string;
  };
  driver?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  vehicle?: {
    id: string;
    brand: string;
    model: string;
    licensePlate: string;
  };
}

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  availableDrivers: Driver[];
  onAssign: (driverId: string) => Promise<void>;
  isLoading?: boolean;
}

const AssignDriverModal: React.FC<AssignDriverModalProps> = ({
  isOpen,
  onClose,
  booking,
  availableDrivers,
  onAssign,
  isLoading = false
}) => {
  const [selectedDriver, setSelectedDriver] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDriver) {
      showError('Erreur de validation', 'Veuillez faire un choix');
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedDriver === 'UNASSIGN') {
        // Logique pour désassigner (sera implémentée côté parent)
        await onAssign('UNASSIGN');
        showSuccess(
          'Chauffeur désassigné',
          'Le chauffeur a été retiré de la réservation avec succès'
        );
      } else {
        await onAssign(selectedDriver);
        const isReassignment = booking?.driver;
        showSuccess(
          isReassignment ? 'Chauffeur réassigné' : 'Chauffeur assigné',
          isReassignment 
            ? 'Le nouveau chauffeur a été assigné à la réservation avec succès'
            : 'Le chauffeur a été assigné à la réservation avec succès'
        );
      }
      setSelectedDriver('');
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      showError(
        'Erreur d\'assignation',
        error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedDriver('');
    onClose();
  };

  if (!booking) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={booking?.driver ? "Réassigner un chauffeur" : "Assigner un chauffeur"}
      size="md"
    >
      <div className="space-y-4">
        {/* Informations de la réservation */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Détails de la réservation</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Trajet:</span> {booking.pickupLocation} → {booking.destination}
            </p>
            <p>
              <span className="font-medium">Client:</span> {booking.user.firstName} {booking.user.lastName}
            </p>
            {booking.driver && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-xs font-medium mb-1">Chauffeur actuellement assigné:</p>
                <p className="text-yellow-700 text-sm">
                  {booking.driver.user.firstName} {booking.driver.user.lastName}
                  {booking.vehicle && ` - ${booking.vehicle.brand} ${booking.vehicle.model}`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Formulaire d'assignation */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {booking?.driver ? "Nouveau chauffeur" : "Chauffeur disponible"} *
            </label>
            {availableDrivers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>Aucun chauffeur disponible pour le moment</p>
              </div>
            ) : (
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || isSubmitting}
                required
              >
                <option value="">{booking?.driver ? "Choisir un nouveau chauffeur" : "Sélectionner un chauffeur"}</option>
                {booking?.driver && (
                  <option value="UNASSIGN" className="text-red-600">
                    🚫 Retirer l'assignation (désassigner)
                  </option>
                )}
                {availableDrivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.user.firstName} {driver.user.lastName}
                    {driver.vehicle && ` - ${driver.vehicle.brand} ${driver.vehicle.model} (${driver.vehicle.licensePlate})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading || isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || isSubmitting || !selectedDriver || availableDrivers.length === 0}
            >
              {(isLoading || isSubmitting) ? 'En cours...' : (booking?.driver ? 'Réassigner' : 'Assigner')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AssignDriverModal;