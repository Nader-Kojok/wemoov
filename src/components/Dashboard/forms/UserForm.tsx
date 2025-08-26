import React, { useState, useEffect } from 'react';
import { useNotifications } from '../shared/NotificationSystem';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'CLIENT' | 'DRIVER' | 'ADMIN';
  isActive: boolean;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'CLIENT' | 'DRIVER' | 'ADMIN';
}

interface UserFormProps {
  user?: User | null;
  onSubmit: (formData: UserFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    role: user?.role || 'CLIENT'
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotifications();

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        password: '',
        role: user.role
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    // Validation du prénom
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
    } else if (!/^[a-zA-ZÀ-ÿ\s-']+$/.test(formData.firstName)) {
      newErrors.firstName = 'Le prénom contient des caractères invalides';
    }

    // Validation du nom
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Le nom doit contenir au moins 2 caractères';
    } else if (!/^[a-zA-ZÀ-ÿ\s-']+$/.test(formData.lastName)) {
      newErrors.lastName = 'Le nom contient des caractères invalides';
    }

    // Validation de l'email
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation du téléphone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    } else if (!/^[+]?[0-9\s-()]{8,15}$/.test(formData.phone)) {
      newErrors.phone = 'Format de téléphone invalide';
    }

    // Validation du mot de passe (seulement pour la création)
    if (!user) {
      if (!formData.password.trim()) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
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
        user ? 'Utilisateur modifié' : 'Utilisateur créé',
        user ? 'Les informations de l\'utilisateur ont été mises à jour avec succès' : 'Le nouvel utilisateur a été créé avec succès'
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

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Prénom et Nom */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom *
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
              errors.firstName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Prénom"
            disabled={isLoading || isSubmitting}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom *
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
              errors.lastName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Nom"
            disabled={isLoading || isSubmitting}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
            errors.email ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="email@exemple.com"
          disabled={isLoading || isSubmitting}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Téléphone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone *
        </label>
        <input
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
            errors.phone ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="+221 XX XXX XX XX"
          disabled={isLoading || isSubmitting}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Mot de passe */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe {!user && '*'}
        </label>
        <input
          type="password"
          required={!user}
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
            errors.password ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder={user ? "Laisser vide pour ne pas changer" : "Mot de passe"}
          minLength={6}
          disabled={isLoading || isSubmitting}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Rôle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rôle *
        </label>
        <select
          value={formData.role}
          onChange={(e) => handleInputChange('role', e.target.value as 'CLIENT' | 'DRIVER' | 'ADMIN')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || isSubmitting}
        >
          <option value="CLIENT">Client</option>
          <option value="DRIVER">Chauffeur</option>
          <option value="ADMIN">Administrateur</option>
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
          {(isLoading || isSubmitting) ? 'En cours...' : (user ? 'Modifier' : 'Créer')}
        </button>
      </div>
    </form>
  );
};

export default UserForm;