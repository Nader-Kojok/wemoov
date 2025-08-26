import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNotifications } from '../shared/NotificationSystem';
import type { Vehicle, VehicleFormData, VehicleType } from '../../../types/dashboard';

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSubmit: (formData: VehicleFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<VehicleFormData>({
    type: 'SEDAN',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    capacity: 4,
    priceMultiplier: 1.0,
    features: []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof VehicleFormData, string>>>({});
  const [newFeature, setNewFeature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotifications();

  const vehicleTypes: { value: VehicleType; label: string }[] = [
    { value: 'SEDAN', label: 'Berline' },
    { value: 'SUV', label: 'SUV' },
    { value: 'VAN', label: 'Van' },
    { value: 'LUXURY', label: 'Luxe' }
  ];

  const commonFeatures = [
    'Climatisation',
    'GPS',
    'Bluetooth',
    'Sièges en cuir',
    'Toit ouvrant',
    'Caméra de recul',
    'Système audio premium',
    'Chargeur USB',
    'Wi-Fi',
    'Sièges chauffants'
  ];

  useEffect(() => {
    if (vehicle) {
      setFormData({
        type: vehicle.type as VehicleType,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.licensePlate,
        capacity: vehicle.capacity,
        priceMultiplier: 1.0, // This might need to be fetched from API
        features: vehicle.features || []
      });
    }
  }, [vehicle]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof VehicleFormData, string>> = {};

    if (!formData.brand.trim()) {
      newErrors.brand = 'La marque est requise';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Le modèle est requis';
    }

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'La plaque d\'immatriculation est requise';
    } else if (formData.licensePlate.length < 6) {
      newErrors.licensePlate = 'La plaque doit contenir au moins 6 caractères';
    } else if (!/^[A-Z0-9\-\s]+$/i.test(formData.licensePlate)) {
      newErrors.licensePlate = 'La plaque contient des caractères invalides';
    }

    if (formData.year < 1990 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'L\'année doit être entre 1990 et ' + (new Date().getFullYear() + 1);
    }

    if (formData.capacity < 1 || formData.capacity > 50) {
      newErrors.capacity = 'La capacité doit être entre 1 et 50';
    }

    if (formData.priceMultiplier < 0.1 || formData.priceMultiplier > 10) {
      newErrors.priceMultiplier = 'Le multiplicateur de prix doit être entre 0.1 et 10';
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
        vehicle ? 'Véhicule modifié' : 'Véhicule créé',
        vehicle ? 'Les informations du véhicule ont été mises à jour avec succès' : 'Le nouveau véhicule a été créé avec succès'
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

  const handleInputChange = (field: keyof VehicleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addFeature = (feature: string) => {
    if (feature.trim() && !formData.features.includes(feature.trim())) {
      handleInputChange('features', [...formData.features, feature.trim()]);
    }
  };

  const removeFeature = (featureToRemove: string) => {
    handleInputChange('features', formData.features.filter(f => f !== featureToRemove));
  };

  const handleAddNewFeature = () => {
    if (newFeature.trim()) {
      addFeature(newFeature);
      setNewFeature('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de véhicule *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value as VehicleType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || isSubmitting}
          >
            {vehicleTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marque *
          </label>
          <input
            type="text"
            required
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
              errors.brand ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Ex: Toyota, BMW, Mercedes"
            disabled={isLoading || isSubmitting}
          />
          {errors.brand && (
            <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
          )}
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modèle *
          </label>
          <input
            type="text"
            required
            value={formData.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
              errors.model ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Ex: Camry, X5, E-Class"
            disabled={isLoading || isSubmitting}
          />
          {errors.model && (
            <p className="mt-1 text-sm text-red-600">{errors.model}</p>
          )}
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Année *
          </label>
          <input
            type="number"
            required
            min="1990"
            max={new Date().getFullYear() + 1}
            value={formData.year}
            onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.year ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isLoading || isSubmitting}
          />
          {errors.year && (
            <p className="mt-1 text-sm text-red-600">{errors.year}</p>
          )}
        </div>

        {/* License Plate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plaque d'immatriculation *
          </label>
          <input
            type="text"
            required
            value={formData.licensePlate}
            onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
              errors.licensePlate ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Ex: ABC-123"
            disabled={isLoading || isSubmitting}
          />
          {errors.licensePlate && (
            <p className="mt-1 text-sm text-red-600">{errors.licensePlate}</p>
          )}
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacité (passagers) *
          </label>
          <input
            type="number"
            required
            min="1"
            max="50"
            value={formData.capacity}
            onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.capacity ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isLoading || isSubmitting}
          />
          {errors.capacity && (
            <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Équipements et options
        </label>
        
        {/* Common Features */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Équipements courants :</p>
          <div className="flex flex-wrap gap-2">
            {commonFeatures.map(feature => (
              <button
                key={feature}
                type="button"
                onClick={() => addFeature(feature)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  formData.features.includes(feature)
                    ? 'bg-blue-100 text-blue-800 border-blue-300 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
                disabled={formData.features.includes(feature) || isLoading || isSubmitting}
              >
                {feature}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Feature Input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Ajouter un équipement personnalisé"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            disabled={isLoading || isSubmitting}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewFeature())}
          />
          <button
            type="button"
            onClick={handleAddNewFeature}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isLoading || isSubmitting}
          >
            Ajouter
          </button>
        </div>

        {/* Selected Features */}
        {formData.features.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Équipements sélectionnés :</p>
            <div className="flex flex-wrap gap-2">
              {formData.features.map(feature => (
                <span
                  key={feature}
                  className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(feature)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    disabled={isLoading || isSubmitting}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
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
          {(isLoading || isSubmitting) ? 'En cours...' : (vehicle ? 'Modifier' : 'Créer')}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;