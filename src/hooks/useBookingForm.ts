/**
 * Custom hook for managing booking form state and logic
 * Reduces code duplication between BookingModal and HeroBookingModal
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import type { BookingData, BookingInitialData, BookingMode } from '@/types/booking'
import { VALIDATION_RULES } from '@/constants/booking'
import { useFormSimulation } from '@/utils/formSimulation'
import type { FormField } from '@/utils/formSimulation'

interface UseBookingFormProps {
  serviceType?: string
  initialData?: BookingInitialData
  mode?: BookingMode
}

const createInitialBookingData = (
  serviceType: string = '',
  initialData: BookingInitialData = {}
): BookingData => ({
  serviceType,
  pickupLocation: initialData.pickupLocation || '',
  destination: initialData.destination || '',
  date: initialData.date || '',
  time: initialData.time || '',
  passengers: typeof initialData.passengers === 'number' 
    ? initialData.passengers 
    : parseInt(String(initialData.passengers)) || 1,
  selectedCategory: '',
  vehicleId: null,
  vehicleType: '', // For backward compatibility
  firstName: '',
  lastName: '',
  phone: '',
  specialRequests: '',
  rentalType: initialData.rentalType || (serviceType === 'hourly' ? 'hourly' : 'daily'),
  withDriver: true,
  hourlyDuration: initialData.hourlyDuration || (serviceType === 'hourly' ? '2' : '1'),
  dailyDuration: initialData.dailyDuration || '1'
})

export const useBookingForm = ({ 
  serviceType = '', 
  initialData = {} 
}: UseBookingFormProps = {}) => {
  // Mémoriser initialData pour éviter les re-rendus infinis
  const initialDataRef = useRef(initialData)
  const prevServiceTypeRef = useRef(serviceType)
  
  const [bookingData, setBookingData] = useState<BookingData>(() => 
    createInitialBookingData(serviceType, initialData)
  )

  const { isSubmitting, simulationResult, submitForm, clearResult } = useFormSimulation()

  // Réinitialiser les données quand le serviceType change (mais pas initialData)
  useEffect(() => {
    // Ne déclencher que si le serviceType a vraiment changé
    if (prevServiceTypeRef.current !== serviceType) {
      setBookingData(prev => {
        // Créer les nouvelles données avec les valeurs par défaut pour le nouveau service
        const newData = createInitialBookingData(serviceType, initialDataRef.current)
        
        // Conserver UNIQUEMENT les données de base (localisation, date/heure, contact)
        // Réinitialiser complètement selectedCategory, vehicleId, etc.
        return {
          ...newData,
          // Conserver la localisation si elle existe
          pickupLocation: prev.pickupLocation || newData.pickupLocation,
          destination: serviceType === 'course' ? (prev.destination || newData.destination) : '',
          // Conserver date/heure si elles existent
          date: prev.date || newData.date,
          time: prev.time || newData.time,
          passengers: prev.passengers || newData.passengers,
          // Conserver les infos de contact si elles existent
           firstName: prev.firstName || newData.firstName,
           lastName: prev.lastName || newData.lastName,
           phone: prev.phone || newData.phone,
           specialRequests: prev.specialRequests || newData.specialRequests,
          // S'assurer que le serviceType est mis à jour
          serviceType
        }
      })
      
      prevServiceTypeRef.current = serviceType
    }
  }, [serviceType])

  const updateBookingData = useCallback((field: keyof BookingData, value: string | boolean | number | null) => {
    setBookingData(prev => ({ ...prev, [field]: value }))
  }, [])

  const resetForm = useCallback(() => {
    setBookingData(createInitialBookingData(serviceType, initialData))
  }, [serviceType, initialData])

  // Memoized validation fields
  const validationFields = useMemo((): FormField[] => {
    const fields: FormField[] = [
      {
        name: 'pickupLocation',
        value: bookingData.pickupLocation,
        required: VALIDATION_RULES.pickupLocation.required,
        type: 'text',
        minLength: VALIDATION_RULES.pickupLocation.minLength
      },
      {
        name: 'date',
        value: bookingData.date,
        required: true,
        type: 'text'
      },
      {
        name: 'time',
        value: bookingData.time,
        required: true,
        type: 'text'
      },
      {
        name: 'passengers',
        value: bookingData.passengers.toString(),
        required: true,
        type: 'number'
      },
      {
        name: 'firstName',
        value: bookingData.firstName,
        required: VALIDATION_RULES.firstName.required,
        type: 'text',
        minLength: VALIDATION_RULES.firstName.minLength
      },
      {
        name: 'lastName',
        value: bookingData.lastName,
        required: VALIDATION_RULES.lastName.required,
        type: 'text',
        minLength: VALIDATION_RULES.lastName.minLength
      },
      {
        name: 'phone',
        value: bookingData.phone,
        required: VALIDATION_RULES.phone.required,
        type: 'phone'
      }
    ]

    // Add destination field if required for course service
    if (serviceType === "course") {
      fields.push({
        name: 'destination',
        value: bookingData.destination,
        required: VALIDATION_RULES.destination.required,
        type: 'text',
        minLength: VALIDATION_RULES.destination.minLength
      })
    }



    return fields
  }, [bookingData, serviceType])

  // Validation for rental-specific fields
  const validateRentalFields = useCallback((): string | null => {
    if (serviceType === "hourly" || serviceType === "rental") {
      if (!bookingData.rentalType) {
        return 'Veuillez sélectionner un type de location'
      }
      
      if (bookingData.rentalType === 'hourly') {
        const hours = parseInt(bookingData.hourlyDuration)
        if (!hours || hours < VALIDATION_RULES.hourlyDuration.min || hours > VALIDATION_RULES.hourlyDuration.max) {
          return `Veuillez saisir un nombre d'heures valide (${VALIDATION_RULES.hourlyDuration.min}-${VALIDATION_RULES.hourlyDuration.max})`
        }
      }
      
      if (bookingData.rentalType === 'daily' || bookingData.rentalType === 'weekly') {
        const duration = parseInt(bookingData.dailyDuration)
        const maxValue = bookingData.rentalType === 'daily' 
          ? VALIDATION_RULES.dailyDuration.max 
          : VALIDATION_RULES.weeklyDuration.max
        const unit = bookingData.rentalType === 'daily' ? 'jours' : 'semaines'
        
        if (!duration || duration < 1 || duration > maxValue) {
          return `Veuillez saisir un nombre de ${unit} valide (1-${maxValue})`
        }
      }
    }
    return null
  }, [bookingData, serviceType])

  // Validation par étape
  const validateCurrentStep = useCallback((stepComponent: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    switch (stepComponent) {
      case 'details':
         // Validation pour l'étape de sélection de véhicule
         if (!bookingData.selectedCategory) {
           errors.push('Veuillez sélectionner une catégorie de véhicule')
         }
         break
        
      case 'contact':
        // Validation pour l'étape de contact
        if (!bookingData.firstName.trim()) {
          errors.push('Le prénom est requis')
        } else if (bookingData.firstName.length < VALIDATION_RULES.firstName.minLength) {
          errors.push(`Le prénom doit contenir au moins ${VALIDATION_RULES.firstName.minLength} caractères`)
        }
        
        if (!bookingData.lastName.trim()) {
          errors.push('Le nom est requis')
        } else if (bookingData.lastName.length < VALIDATION_RULES.lastName.minLength) {
          errors.push(`Le nom doit contenir au moins ${VALIDATION_RULES.lastName.minLength} caractères`)
        }
        
        if (!bookingData.phone.trim()) {
          errors.push('Le numéro de téléphone est requis')
        } else if (!VALIDATION_RULES.phone.pattern.test(bookingData.phone)) {
          errors.push('Veuillez saisir un numéro de téléphone valide')
        }
        
        
        break
        
      case 'location':
        // Validation pour l'étape de localisation
        if (!bookingData.pickupLocation.trim()) {
          errors.push('Le point de départ est requis')
        } else if (bookingData.pickupLocation.length < VALIDATION_RULES.pickupLocation.minLength) {
          errors.push(`Le point de départ doit contenir au moins ${VALIDATION_RULES.pickupLocation.minLength} caractères`)
        }
        
        if (serviceType === 'course') {
          if (!bookingData.destination.trim()) {
            errors.push('La destination est requise')
          } else if (bookingData.destination.length < VALIDATION_RULES.destination.minLength) {
            errors.push(`La destination doit contenir au moins ${VALIDATION_RULES.destination.minLength} caractères`)
          }
        }
        
        if (!bookingData.date) {
          errors.push('La date est requise')
        }
        
        if (!bookingData.time) {
          errors.push('L\'heure est requise')
        }
        break
        
      default:
        // Pas de validation spécifique pour les autres étapes
        break
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }, [bookingData, serviceType])

  const handleSubmit = useCallback(async () => {
    // Clear any previous results
    if (simulationResult) {
      clearResult()
    }

    // Validate rental-specific fields
    const rentalError = validateRentalFields()
    if (rentalError) {
      alert(rentalError)
      return
    }

    // Submit form with validation
    const result = await submitForm(validationFields, 'booking')
    
    if (result.success) {
      resetForm()
      return result
    }
    
    return result
  }, [simulationResult, clearResult, validateRentalFields, submitForm, validationFields, resetForm])

  return {
    bookingData,
    updateBookingData,
    resetForm,
    handleSubmit,
    isSubmitting,
    simulationResult,
    clearResult,
    validationFields,
    validateCurrentStep
  }
}