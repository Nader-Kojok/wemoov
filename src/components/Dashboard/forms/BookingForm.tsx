import React, { useState, useEffect } from 'react';
import { useNotifications } from '../shared/NotificationSystem';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
}

interface Booking {
  id: string;
  serviceType: string;
  pickupLocation: string;
  destination: string;
  scheduledDate: string;
  scheduledTime: string;
  passengers: number;
  totalPrice: number;
  specialRequests?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

interface BookingFormData {
  userId: string;
  serviceType: 'CITY' | 'AIRPORT' | 'INTERCITY' | 'HOURLY' | 'EVENT';
  pickupLocation: string;
  destination: string;
  scheduledDate: string;
  scheduledTime: string;
  passengers: number | string;
  totalPrice: number | string;
  specialRequests: string;
}

interface BookingFormProps {
  booking?: Booking | null;
  users: User[];
  onSubmit: (formData: BookingFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({
  booking,
  users,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    userId: booking?.user.id || '',
    serviceType: (booking?.serviceType as any) || 'CITY',
    pickupLocation: booking?.pickupLocation || '',
    destination: booking?.destination || '',
    scheduledDate: booking?.scheduledDate ? booking.scheduledDate.split('T')[0] : '',
    scheduledTime: booking?.scheduledTime || '',
    passengers: booking?.passengers || 1,
    totalPrice: booking?.totalPrice || 0,
    specialRequests: booking?.specialRequests || ''
  });

  const [errors, setErrors] = useState<Partial<BookingFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotifications();

  useEffect(() => {
    if (booking) {
      setFormData({
        userId: booking.user.id,
        serviceType: booking.serviceType as any,
        pickupLocation: booking.pickupLocation,
        destination: booking.destination,
        scheduledDate: booking.scheduledDate.split('T')[0],
        scheduledTime: booking.scheduledTime,
        passengers: booking.passengers,
        totalPrice: booking.totalPrice,
        specialRequests: booking.specialRequests || ''
      });
    }
  }, [booking]);

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};

    // Validation de l'utilisateur
    if (!formData.userId.trim()) {
      newErrors.userId = 'Le client est requis';
    }

    // Validation du lieu de prise en charge
    if (!formData.pickupLocation.trim()) {
      newErrors.pickupLocation = 'Le lieu de prise en charge est requis';
    } else if (formData.pickupLocation.length < 5) {
      newErrors.pickupLocation = 'Le lieu de prise en charge doit contenir au moins 5 caractères';
    }

    // Validation de la destination (optionnelle pour les services HOURLY)
    const requiresDestination = formData.serviceType !== 'HOURLY';
    if (requiresDestination) {
      if (!formData.destination.trim()) {
        newErrors.destination = 'La destination est requise';
      } else if (formData.destination.length < 5) {
        newErrors.destination = 'La destination doit contenir au moins 5 caractères';
      }
    }

    // Validation de la date
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'La date est requise';
    } else {
      const selectedDate = new Date(formData.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.scheduledDate = 'La date ne peut pas être dans le passé';
      }
    }

    // Validation de l'heure
    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'L\'heure est requise';
    }

    // Validation du nombre de passagers
    const passengers = Number(formData.passengers);
    if (!passengers || passengers < 1) {
      newErrors.passengers = 'Le nombre de passagers doit être au moins 1';
    } else if (passengers > 8) {
      newErrors.passengers = 'Le nombre de passagers ne peut pas dépasser 8';
    }

    // Validation du prix
    const totalPrice = Number(formData.totalPrice);
    if (!totalPrice || totalPrice <= 0) {
      newErrors.totalPrice = 'Le prix doit être supérieur à 0';
    } else if (totalPrice > 1000000) {
      newErrors.totalPrice = 'Le prix semble trop élevé';
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
        booking ? 'Réservation modifiée' : 'Réservation créée',
        booking ? 'La réservation a été mise à jour avec succès' : 'La nouvelle réservation a été créée avec succès'
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

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const clientUsers = users.filter(user => user.role === 'CLIENT');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Client et Type de service */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client *
          </label>
          <select
            required
            value={formData.userId}
            onChange={(e) => handleInputChange('userId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.userId ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isLoading || isSubmitting}
          >
            <option value="">Sélectionner un client</option>
            {clientUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} - {user.phone}
              </option>
            ))}
          </select>
          {errors.userId && (
            <p className="mt-1 text-sm text-red-600">{errors.userId}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de service *
          </label>
          <select
            value={formData.serviceType}
            onChange={(e) => handleInputChange('serviceType', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || isSubmitting}
          >
            <option value="CITY">Transport en ville</option>
            <option value="AIRPORT">Navette aéroport</option>
            <option value="INTERCITY">Transport inter-villes</option>
            <option value="HOURLY">Location à l'heure</option>
            <option value="EVENT">Événement</option>
          </select>
        </div>
      </div>
      
      {/* Lieux */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lieu de prise en charge *
          </label>
          <input
            type="text"
            required
            value={formData.pickupLocation}
            onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
              errors.pickupLocation ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Adresse de départ"
            disabled={isLoading || isSubmitting}
          />
          {errors.pickupLocation && (
            <p className="mt-1 text-sm text-red-600">{errors.pickupLocation}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination {formData.serviceType !== 'HOURLY' ? '*' : '(optionnel)'}
          </label>
          <input
            type="text"
            required={formData.serviceType !== 'HOURLY'}
            value={formData.destination}
            onChange={(e) => handleInputChange('destination', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
              errors.destination ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={formData.serviceType === 'HOURLY' ? 'Le chauffeur gère les déplacements' : 'Adresse de destination'}
            disabled={isLoading || isSubmitting}
          />
          {formData.serviceType === 'HOURLY' && (
            <p className="mt-1 text-xs text-blue-600">Pour la location à l'heure, le chauffeur vous accompagne selon vos besoins</p>
          )}
          {errors.destination && (
            <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
          )}
        </div>
      </div>
      
      {/* Date, Heure et Passagers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            required
            value={formData.scheduledDate}
            onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.scheduledDate ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isLoading || isSubmitting}
          />
          {errors.scheduledDate && (
            <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heure *
          </label>
          <input
            type="time"
            required
            value={formData.scheduledTime}
            onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.scheduledTime ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isLoading || isSubmitting}
          />
          {errors.scheduledTime && (
            <p className="mt-1 text-sm text-red-600">{errors.scheduledTime}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passagers *
          </label>
          <input
            type="number"
            required
            min="1"
            max="8"
            value={formData.passengers}
            onChange={(e) => handleInputChange('passengers', parseInt(e.target.value) || 1)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.passengers ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isLoading || isSubmitting}
          />
          {errors.passengers && (
            <p className="mt-1 text-sm text-red-600">{errors.passengers}</p>
          )}
        </div>
      </div>
      
      {/* Prix et Demandes spéciales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prix total (FCFA) *
          </label>
          <input
            type="number"
            required
            min="0"
            value={formData.totalPrice}
            onChange={(e) => handleInputChange('totalPrice', parseFloat(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.totalPrice ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isLoading || isSubmitting}
          />
          {errors.totalPrice && (
            <p className="mt-1 text-sm text-red-600">{errors.totalPrice}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Demandes spéciales
          </label>
          <input
            type="text"
            value={formData.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            placeholder="Demandes particulières..."
            disabled={isLoading || isSubmitting}
          />
        </div>
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
          {(isLoading || isSubmitting) ? 'En cours...' : (booking ? 'Modifier' : 'Créer')}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;