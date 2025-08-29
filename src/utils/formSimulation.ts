/**
 * Form Simulation Utility
 * Provides simulated form validation and submission for frontend testing
 * while backend functionality is unavailable.
 */

export interface FormField {
  name: string;
  value: string | number;
  required?: boolean;
  type?: 'email' | 'phone' | 'text' | 'select' | 'textarea' | 'number';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface SimulationResult {
  success: boolean;
  data?: any;
  errors?: ValidationError[];
  message: string;
}

/**
 * Validates form fields according to their rules
 */
export const validateFormFields = (fields: FormField[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  fields.forEach(field => {
    const value = String(field.value).trim();

    // Required field validation
    if (field.required && !value) {
      errors.push({
        field: field.name,
        message: `Le champ ${field.name} est requis`
      });
      return;
    }

    // Skip other validations if field is empty and not required
    if (!value && !field.required) return;

    // Type-specific validations
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push({
            field: field.name,
            message: 'Format d\'email invalide'
          });
        }
        break;

      case 'phone':
        const phoneRegex = /^[+]?[0-9\s\-()]{8,}$/;
        if (!phoneRegex.test(value)) {
          errors.push({
            field: field.name,
            message: 'Format de téléphone invalide'
          });
        }
        break;

      case 'number':
        if (isNaN(Number(value))) {
          errors.push({
            field: field.name,
            message: 'Doit être un nombre valide'
          });
        }
        break;
    }

    // Length validations
    if (field.minLength && value.length < field.minLength) {
      errors.push({
        field: field.name,
        message: `Minimum ${field.minLength} caractères requis`
      });
    }

    if (field.maxLength && value.length > field.maxLength) {
      errors.push({
        field: field.name,
        message: `Maximum ${field.maxLength} caractères autorisés`
      });
    }

    // Pattern validation
    if (field.pattern && !field.pattern.test(value)) {
      errors.push({
        field: field.name,
        message: 'Format invalide'
      });
    }
  });

  return errors;
};

/**
 * Simulates form submission with validation and delay
 */
export const simulateFormSubmission = async (
  fields: FormField[],
  formType: 'contact' | 'business' | 'booking' = 'contact'
): Promise<SimulationResult> => {
  // Validate fields
  const validationErrors = validateFormFields(fields);
  
  if (validationErrors.length > 0) {
    return {
      success: false,
      errors: validationErrors,
      message: 'Veuillez corriger les erreurs dans le formulaire'
    };
  }

  // Simulate network delay (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulate random success/failure (95% success rate for demo)
  const isSuccess = Math.random() > 0.05;

  if (!isSuccess) {
    return {
      success: false,
      message: 'Erreur de simulation - Veuillez réessayer'
    };
  }

  // Generate mock response based on form type
  const mockResponses = {
    contact: {
      id: `contact_${Date.now()}`,
      status: 'received',
      estimatedResponse: '24 heures',
      referenceNumber: `REF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    },
    business: {
      id: `quote_${Date.now()}`,
      status: 'pending',
      estimatedQuote: '48 heures',
      quoteNumber: `DEVIS-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    },
    booking: {
      id: `booking_${Date.now()}`,
      status: 'confirmed',
      bookingNumber: `WMV-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      estimatedArrival: '15 minutes avant l\'heure prévue'
    }
  };

  return {
    success: true,
    data: mockResponses[formType],
    message: getSuccessMessage(formType)
  };
};

/**
 * Returns appropriate success message based on form type
 */
const getSuccessMessage = (formType: string): string => {
  const messages = {
    contact: '✅ Message envoyé avec succès ! Nous vous répondrons sous 24h.',
    business: '✅ Demande de devis envoyée ! Nous vous contacterons sous 48h.',
    booking: '✅ Réservation confirmée ! Vous recevrez un SMS de confirmation.'
  };
  
  return messages[formType as keyof typeof messages] || '✅ Formulaire soumis avec succès !';
};

/**
 * Hook for managing form simulation state
 */
export const useFormSimulation = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [simulationResult, setSimulationResult] = React.useState<SimulationResult | null>(null);
  const [showSimulationNotice, setShowSimulationNotice] = React.useState(true);

  const submitForm = async (fields: FormField[], formType: 'contact' | 'business' | 'booking' = 'contact') => {
    setIsSubmitting(true);
    setSimulationResult(null);
    
    try {
      const result = await simulateFormSubmission(fields, formType);
      setSimulationResult(result);
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearResult = () => {
    setSimulationResult(null);
  };

  const dismissNotice = () => {
    setShowSimulationNotice(false);
  };

  return {
    isSubmitting,
    simulationResult,
    showSimulationNotice,
    submitForm,
    clearResult,
    dismissNotice
  };
};

// Import React for the hook
import * as React from 'react';

/**
 * Creates simulation notice component props
 */
export const createSimulationNoticeProps = () => ({
  className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6",
  content: {
    title: "Mode Simulation Activé",
    message: "Ce formulaire fonctionne en mode simulation pendant que l'intégration backend est en cours. Toutes les soumissions sont simulées avec validation complète."
  }
});

/**
 * Creates form result display props
 */
export const createFormResultProps = (result: SimulationResult) => {
  const bgColor = result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = result.success ? 'text-green-800' : 'text-red-800';
  const iconColor = result.success ? 'text-green-400' : 'text-red-400';

  return {
    className: `${bgColor} border rounded-lg p-4 mb-6`,
    textColor,
    iconColor,
    message: result.message,
    data: result.data,
    errors: result.errors,
    success: result.success
  };
};