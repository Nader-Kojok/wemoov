/**
 * Shared types and interfaces for booking components
 * Eliminates duplication between BookingModal and HeroBookingModal
 */

import type { LucideIcon } from 'lucide-react'

export interface BaseBookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface HeroBookingModalProps extends BaseBookingModalProps {
  serviceType: string
  initialData: BookingInitialData
}

export interface BookingModalProps extends BaseBookingModalProps {
  // Standard booking modal doesn't need additional props
}

export interface BookingInitialData {
  pickupLocation?: string
  destination?: string
  date?: string
  time?: string
  passengers?: string | number
  rentalType?: string
  hourlyDuration?: string
  dailyDuration?: string
}

export interface BookingData {
  serviceType: string
  pickupLocation: string
  destination: string
  date: string
  time: string
  passengers: number
  selectedCategory: string
  vehicleId: number | null
  vehicleType: string // For backward compatibility
  firstName: string
  lastName: string
  phone: string
  specialRequests: string
  rentalType: string
  withDriver: boolean
  hourlyDuration: string
  dailyDuration: string
}

export interface BookingStep {
  id: number
  title: string
  component: string
}

export interface ServiceType {
  id: string
  title: string
  description: string
  icon: LucideIcon
  color: string
}

export interface VehicleType {
  value: string
  label: string
  icon: LucideIcon
}

export interface RentalType {
  value: string
  label: string
  price: string
}

export interface BookingFormProps {
  bookingData: BookingData
  updateBookingData: (field: keyof BookingData, value: string | boolean | number | null) => void
  serviceType?: string
}

export interface StepNavigationProps {
  currentStep: number
  maxSteps: number
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
  isSubmitting: boolean
  canGoNext: boolean
}

export type BookingMode = 'standard' | 'hero'

export interface BookingContextValue {
  bookingData: BookingData
  updateBookingData: (field: keyof BookingData, value: string | boolean | number | null) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  serviceType: string
  mode: BookingMode
}