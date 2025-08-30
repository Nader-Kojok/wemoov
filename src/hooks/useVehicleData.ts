/**
 * Custom hook for optimized vehicle data processing
 * Implements memoization strategies to prevent unnecessary re-renders
 */

import { useMemo, useRef, useEffect } from 'react'
import { vehicleCategories, getVehiclesByCategory } from '@/data/vehicles'
import { VEHICLE_CAPACITY_INFO } from '@/constants/booking'
import type { Vehicle } from '@/data/vehicles'

interface VehicleCategoryData {
  id: string
  name: string
  count: number
  icon: any
  availableVehicles: Vehicle[]
  isDisabled: boolean
  isSelected: boolean
  capacityInfo: string
}

interface VehicleData extends Vehicle {
  isSelected: boolean
}

interface UseVehicleDataProps {
  passengers: number
  selectedCategory: string
  selectedVehicleId: number | null
}

export const useVehicleData = ({ 
  passengers, 
  selectedCategory, 
  selectedVehicleId 
}: UseVehicleDataProps) => {
  
  // Stabiliser les valeurs pour éviter les re-calculs inutiles
  const prevPassengersRef = useRef(passengers)
  const prevSelectedCategoryRef = useRef(selectedCategory)
  const prevSelectedVehicleIdRef = useRef(selectedVehicleId)
  
  // Vérifier si les valeurs ont vraiment changé
  const hasPassengersChanged = prevPassengersRef.current !== passengers
  const hasSelectedCategoryChanged = prevSelectedCategoryRef.current !== selectedCategory
  const hasSelectedVehicleIdChanged = prevSelectedVehicleIdRef.current !== selectedVehicleId
  
  // Mettre à jour les refs
  useEffect(() => {
    prevPassengersRef.current = passengers
    prevSelectedCategoryRef.current = selectedCategory
    prevSelectedVehicleIdRef.current = selectedVehicleId
  })
  
  // Memoized vehicle categories with availability and selection state
  const vehicleCategoriesData = useMemo((): VehicleCategoryData[] => {
    try {
      if (!vehicleCategories || !Array.isArray(vehicleCategories)) {
        console.warn('Vehicle categories not available or not an array')
        return []
      }
      
      return vehicleCategories
        .map((category) => {
          if (!category?.id || !category?.name || !category?.icon) {
            console.warn('Invalid category:', category)
            return null
          }
          
          const categoryVehicles = getVehiclesByCategory(category.id) || []
          const availableVehicles = categoryVehicles.filter(v => 
            v && v.capacity >= passengers
          )
          const isDisabled = availableVehicles.length === 0
          const isSelected = selectedCategory === category.id
          
          // Get capacity info from constants
          const capacityInfo = VEHICLE_CAPACITY_INFO[category.id as keyof typeof VEHICLE_CAPACITY_INFO]?.description || 
                              `Capacité: ${category.id}`
          
          return {
            ...category,
            availableVehicles,
            isDisabled,
            isSelected,
            capacityInfo
          }
        })
        .filter((category): category is NonNullable<typeof category> => category !== null)
    } catch (error) {
      console.error('Error processing vehicle categories:', error)
      return []
    }
  }, [passengers, selectedCategory, hasPassengersChanged, hasSelectedCategoryChanged])

  // Memoized available vehicles for selected category
  const availableVehiclesData = useMemo((): VehicleData[] => {
    try {
      if (!selectedCategory) {
        return []
      }
      
      const categoryVehicles = getVehiclesByCategory(selectedCategory) || []
      if (!Array.isArray(categoryVehicles)) {
        console.warn('Category vehicles is not an array:', categoryVehicles)
        return []
      }
      
      return categoryVehicles
        .filter(vehicle => vehicle && vehicle.capacity >= passengers)
        .map((vehicle) => {
          if (!vehicle?.id || !vehicle?.name) {
            console.warn('Invalid vehicle:', vehicle)
            return null
          }
          
          const isSelected = selectedVehicleId === vehicle.id
          return {
            ...vehicle,
            isSelected
          }
        })
        .filter((vehicle): vehicle is VehicleData => vehicle !== null)
    } catch (error) {
      console.error('Error processing available vehicles:', error)
      return []
    }
  }, [selectedCategory, passengers, selectedVehicleId, hasSelectedCategoryChanged, hasPassengersChanged, hasSelectedVehicleIdChanged])

  // Get selected category info
  const selectedCategoryInfo = useMemo(() => {
    return vehicleCategoriesData.find(cat => cat.id === selectedCategory) || null
  }, [vehicleCategoriesData, selectedCategory])

  // Get selected vehicle info
  const selectedVehicleInfo = useMemo(() => {
    return availableVehiclesData.find(vehicle => vehicle.id === selectedVehicleId) || null
  }, [availableVehiclesData, selectedVehicleId])

  // Check if any vehicles are available for the passenger count
  const hasAvailableVehicles = useMemo(() => {
    return vehicleCategoriesData.some(category => !category.isDisabled)
  }, [vehicleCategoriesData])

  // Get recommended category based on passenger count
  const recommendedCategory = useMemo(() => {
    if (passengers <= 4) return 'berline'
    if (passengers <= 7) return 'suv'
    if (passengers <= 25) return 'van'
    return 'luxe'
  }, [passengers])

  return {
    vehicleCategoriesData,
    availableVehiclesData,
    selectedCategoryInfo,
    selectedVehicleInfo,
    hasAvailableVehicles,
    recommendedCategory
  }
}