import React, { useState, useEffect } from 'react';
import { useNotifications } from '../shared/NotificationSystem';
import type { Driver, DriverFormData, User, Vehicle } from '../../../types/dashboard';

interface DriverFormProps {
  driver?: Driver | null;
  users: User[];
  vehicles: Vehicle[];
  onSubmit: (formData: DriverFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const DriverForm: React.FC<DriverFormProps> = ({
  driver,
  users,
  vehicles,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<DriverFormData>({
    userId: driver?.user.id || '',
    licenseNumber: driver?.licenseNumber || '',
    vehicleId: driver?.vehicle?.id || ''
  });

  const [errors, setErrors] = useState<Partial<DriverFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotifications();

  useEffect(() => {
    if (driver) {
      setFormData({
        userId: driver.user.id,
        licenseNumber: driver.licenseNumber,
        vehicleId: driver.vehicle?.id || ''
      });
    }
  }, [driver]);

  const validateForm = (): boolean => {
    const newErrors: Partial<DriverFormData> = {};

    if (!formData.userId.trim()) {
      newErrors.userId = 'L\'utilisateur est requis';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'Le numéro de permis est requis';
    } else if (formData.licenseNumber.length < 5) {
      newErrors.licenseNumber = 'Le numéro de permis doit contenir au moins 5 caractères';
    } else if (!/^[A-Z0-9\-\s]+$/i.test(formData.licenseNumber)) {
      newErrors.licenseNumber = 'Le numéro de permis contient des caractères invalides';
    }

    // Check if user is already a driver (for new drivers only)
    if (!driver && formData.userId) {
      const selectedUser = users.find(u => u.id === formData.userId);
      if (selectedUser?.driver) {
        newErrors.userId = 'Cet utilisateur est déjà un chauffeur';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      showSuccess(
        driver ? 'Chauffeur modifié' : 'Chauffeur créé',
        driver ? 'Les informations du chauffeur ont été mises à jour avec succès' : 'Le nouveau chauffeur a été créé avec succès'
      );
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      showError(
        'Erreur de sauvegarde',
        error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof DriverFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const availableUsers = users.filter(user => 
    (user.role === 'CLIENT' || user.role === 'DRIVER') && 
    (!user.driver || (driver && user.id === driver.user.id))
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* User Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Utilisateur *
        </label>
        <select
          required
          value={formData.userId}
          onChange={(e) => handleInputChange('userId', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.userId ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={!!driver || isLoading || isSubmitting}
        >
          <option value="">Sélectionner un utilisateur</option>
          {availableUsers.map(user => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName} - {user.phone}
            </option>
          ))}
        </select>
        {errors.userId && (
          <p className="mt-1 text-sm text-red-600">{errors.userId}</p>
        )}
      </div>

      {/* License Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Numéro de permis *
        </label>
        <input
          type="text"
          required
          value={formData.licenseNumber}
          onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
            errors.licenseNumber ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Numéro de permis de conduire"
          disabled={isLoading || isSubmitting}
        />
        {errors.licenseNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
        )}
      </div>

      {/* Vehicle Assignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Véhicule (optionnel)
        </label>
        <select
          value={formData.vehicleId}
          onChange={(e) => handleInputChange('vehicleId', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || isSubmitting}
        >
          <option value="">Aucun véhicule assigné</option>
          {vehicles.map(vehicle => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
            </option>
          ))}
        </select>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading || isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || isSubmitting}
        >
          {(isLoading || isSubmitting) ? 'En cours...' : (driver ? 'Modifier' : 'Créer')}
        </button>
      </div>
    </form>
  );
};

export default DriverForm;