/**
 * Shared constants for booking components
 * Eliminates duplication of service types, vehicle types, and rental options
 */

import { Car, Clock, Timer } from 'lucide-react'
import type { ServiceType, VehicleType, RentalType } from '@/types/booking'

export const SERVICE_TYPES: ServiceType[] = [
  {
    id: "course",
    title: "Commander une course",
    description: "",
    icon: Car,
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "hourly",
    title: "Location à l'heure",
    description: "",
    icon: Clock,
    color: "from-green-500 to-green-600"
  },
  {
    id: "rental",
    title: "Location longue durée",
    description: "",
    icon: Timer,
    color: "from-purple-500 to-purple-600"
  }
]

export const VEHICLE_TYPES: VehicleType[] = [
  { value: "sedan", label: "Berline (1-3 passagers)", icon: Car },
  { value: "suv", label: "SUV (1-6 passagers)", icon: Car },
  { value: "van", label: "Van (1-8 passagers)", icon: Car },
  { value: "luxury", label: "Véhicule de luxe", icon: Car }
]

export const RENTAL_TYPES: RentalType[] = [
  { value: "hourly", label: "Location à l'heure", price: "8 000 FCFA/h" },
  { value: "daily", label: "Location à la journée", price: "45 000 FCFA/jour" },
  { value: "weekly", label: "Location à la semaine", price: "280 000 FCFA/semaine" }
]

// Vehicle category capacity mappings
export const VEHICLE_CAPACITY_INFO = {
  berline: { min: 1, max: 5, description: 'Capacité: 4-5 passagers' },
  suv: { min: 1, max: 7, description: 'Capacité: 5-7 passagers' },
  van: { min: 8, max: 25, description: 'Capacité: 12-25 passagers' },
  luxe: { min: 1, max: 7, description: 'Capacité: 4-7 passagers' }
} as const

// Step configurations for different service types
export const STEP_CONFIGURATIONS = {
  course: [
    { id: 0, title: "Détails", component: "details" },
    { id: 1, title: "Contact", component: "contact" },
    { id: 2, title: "Aperçu", component: "preview" }
  ],
  hourly: [
    { id: 0, title: "Détails", component: "details" },
    { id: 1, title: "Contact", component: "contact" },
    { id: 2, title: "Aperçu", component: "preview" }
  ],
  rental: [
    { id: 0, title: "Détails", component: "details" },
    { id: 1, title: "Contact", component: "contact" },
    { id: 2, title: "Aperçu", component: "preview" }
  ],
  standard: [
    { id: 0, title: "Service", component: "service" },
    { id: 1, title: "Localisation", component: "location" },
    { id: 2, title: "Détails", component: "details" },
    { id: 3, title: "Contact", component: "contact" },
    { id: 4, title: "Aperçu", component: "preview" }
  ]
} as const

// Pricing constants
export const PRICING = {
  hourly: 8000, // FCFA per hour
  daily: 45000, // FCFA per day
  weekly: 280000 // FCFA per week
} as const

// Form validation constants
export const VALIDATION_RULES = {
  pickupLocation: { minLength: 5, required: true },
  destination: { minLength: 5, required: true },
  firstName: { minLength: 2, required: true },
  lastName: { minLength: 2, required: true },
  phone: { required: true, pattern: /^\+?[0-9\s\-\(\)]{8,}$/ },
  email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  passengers: { min: 1, max: 25 },
  hourlyDuration: { min: 1, max: 24 },
  dailyDuration: { min: 1, max: 365 },
  weeklyDuration: { min: 1, max: 52 }
} as const