/**
 * Optimized booking components with code splitting
 * Implements React.lazy for better performance
 */

import { lazy } from 'react'
import type { 
  BookingModalProps, 
  HeroBookingModalProps 
} from '@/types/booking'

// Lazy load the unified booking modal for better code splitting
const UnifiedBookingModal = lazy(() => import('./UnifiedBookingModal'))

// Lazy load individual form components
export const ContactForm = lazy(() => import('./ContactForm'))
export const VehicleSelector = lazy(() => import('./VehicleSelector'))
export const RentalOptions = lazy(() => import('./RentalOptions'))

// Export the unified modal as default
export default UnifiedBookingModal

// Export compatibility wrappers with lazy loading
export const BookingModal = lazy(() => 
  import('./UnifiedBookingModal').then(module => ({
    default: (props: BookingModalProps) => module.BookingModal(props)
  }))
)

export const HeroBookingModal = lazy(() => 
  import('./UnifiedBookingModal').then(module => ({
    default: (props: HeroBookingModalProps) => module.HeroBookingModal(props)
  }))
)

// Export types for external use
export type {
  BookingModalProps,
  HeroBookingModalProps,
  BookingData,
  BookingFormProps,
  BookingStep,
  ServiceType,
  VehicleType,
  RentalType
} from '@/types/booking'

// Export hooks for external use
export { useBookingForm } from '@/hooks/useBookingForm'
export { useBookingSteps } from '@/hooks/useBookingSteps'
export { useVehicleData } from '@/hooks/useVehicleData'

// Export constants for external use
export {
  SERVICE_TYPES,
  VEHICLE_TYPES,
  RENTAL_TYPES,
  PRICING,
  VALIDATION_RULES
} from '@/constants/booking'