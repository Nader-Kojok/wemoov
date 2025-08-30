/**
 * Shared VehicleSelector component for booking modals
 * Optimized with React.memo and efficient vehicle data processing
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Minus, Plus } from 'lucide-react'
import { useVehicleData } from '@/hooks/useVehicleData'
import type { BookingFormProps } from '@/types/booking'

interface VehicleSelectorProps extends BookingFormProps {
  className?: string
  showPassengerSelector?: boolean
  serviceType?: string
}

// Pricing structure by service type and vehicle category
const VEHICLE_PRICING = {
  course: {
    berline: '15,000 FCFA',
    suv: '25,000 FCFA', 
    van: '35,000 FCFA',
    luxe: '60,000 FCFA'
  },
  hourly: {
    berline: '8,000 FCFA/h',
    suv: '12,000 FCFA/h',
    van: '15,000 FCFA/h', 
    luxe: '25,000 FCFA/h'
  },
  rental: {
    berline: '35,000 FCFA/jour',
    suv: '50,000 FCFA/jour',
    van: '65,000 FCFA/jour',
    luxe: '120,000 FCFA/jour'
  }
} as const

const VehicleSelector: React.FC<VehicleSelectorProps> = React.memo(({ 
  bookingData, 
  updateBookingData, 
  className = '',
  showPassengerSelector = true,
  serviceType = 'course'
}) => {
  const { vehicleCategoriesData, hasAvailableVehicles, recommendedCategory } = useVehicleData({
    passengers: bookingData.passengers,
    selectedCategory: bookingData.selectedCategory,
    selectedVehicleId: bookingData.vehicleId
  })

  // Get pricing for current service type
  const getPriceForCategory = React.useCallback((categoryId: string) => {
    const pricingKey = serviceType as keyof typeof VEHICLE_PRICING
    const categoryKey = categoryId as keyof typeof VEHICLE_PRICING.course
    return VEHICLE_PRICING[pricingKey]?.[categoryKey] || VEHICLE_PRICING.course[categoryKey] || 'Prix sur demande'
  }, [serviceType])

  const handlePassengerChange = React.useCallback((increment: boolean) => {
    const newCount = increment 
      ? Math.min(bookingData.passengers + 1, 25)
      : Math.max(bookingData.passengers - 1, 1)
    
    updateBookingData('passengers', newCount)
    // Reset vehicle selection when passenger count changes
    if (newCount !== bookingData.passengers) {
      updateBookingData('vehicleId', null)
      updateBookingData('selectedCategory', '')
    }
  }, [bookingData.passengers, updateBookingData])

  const handleCategorySelect = React.useCallback((categoryId: string) => {
    updateBookingData('selectedCategory', categoryId)
    // Reset specific vehicle selection when category changes
    updateBookingData('vehicleId', null)
  }, [updateBookingData])

  // Auto-select recommended category if none selected and passengers changed
  React.useEffect(() => {
    if (!bookingData.selectedCategory && hasAvailableVehicles) {
      const recommended = vehicleCategoriesData.find(cat => 
        cat.id === recommendedCategory && !cat.isDisabled
      )
      if (recommended) {
        updateBookingData('selectedCategory', recommended.id)
      }
    }
  }, [bookingData.selectedCategory, hasAvailableVehicles, recommendedCategory, vehicleCategoriesData, updateBookingData])

  return (
    <div className={`bg-white rounded-lg border border-[#1E5EFF]/20 p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Users className="h-5 w-5 text-[#1E5EFF]" />
        <h3 className="font-medium text-[#2D2D2D] text-lg">Détails du voyage</h3>
      </div>
      
      <div className="space-y-4">
        {showPassengerSelector && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#2D2D2D]">
              Nombre de passagers
            </Label>
            <div className="flex items-center justify-center space-x-4 p-4 bg-[#E8EFFF] rounded-lg border border-[#1E5EFF]/20">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePassengerChange(false)}
                className="h-10 w-10 p-0 border-[#1E5EFF]/30 text-[#1E5EFF] hover:bg-[#1E5EFF]/10"
                disabled={bookingData.passengers <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-[#1E5EFF]" />
                <span className="text-2xl font-bold text-[#1E5EFF] min-w-[3rem] text-center">
                  {bookingData.passengers}
                </span>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePassengerChange(true)}
                className="h-10 w-10 p-0 border-[#1E5EFF]/30 text-[#1E5EFF] hover:bg-[#1E5EFF]/10"
                disabled={bookingData.passengers >= 25}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Vehicle Category Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-[#2D2D2D]">
            Type de véhicule
          </Label>
          
          {!hasAvailableVehicles && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Aucun véhicule disponible pour {bookingData.passengers} passager{bookingData.passengers > 1 ? 's' : ''}.
                Veuillez ajuster le nombre de passagers.
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            {vehicleCategoriesData.map((category) => {
              const IconComponent = category.icon
              
              return (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all duration-150 hover:shadow-md border-2 w-full ${
                    category.isDisabled 
                      ? 'opacity-50 cursor-not-allowed border-gray-200' 
                      : category.isSelected 
                        ? 'ring-2 ring-[#1E5EFF]/50 bg-[#E8EFFF] border-[#1E5EFF]' 
                        : 'border-[#1E5EFF]/20 hover:border-[#1E5EFF]/40'
                  }`}
                  onClick={() => {
                    if (!category.isDisabled) {
                      handleCategorySelect(category.id)
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <IconComponent className={`h-8 w-8 ${
                        category.isDisabled 
                          ? 'text-gray-400' 
                          : category.isSelected 
                            ? 'text-[#1E5EFF]' 
                            : 'text-[#2D2D2D]/60'
                      }`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className={`font-semibold text-base ${
                              category.isDisabled 
                                ? 'text-gray-400' 
                                : category.isSelected 
                                  ? 'text-[#1E5EFF]' 
                                  : 'text-[#2D2D2D]'
                            }`}>
                              {category.name}
                            </div>
                            <div className={`text-sm ${
                              category.isDisabled 
                                ? 'text-gray-400' 
                                : category.isSelected 
                                  ? 'text-[#1E5EFF]/70' 
                                  : 'text-[#2D2D2D]/60'
                            }`}>
                              {category.capacityInfo}
                            </div>
                            <div className={`text-sm font-semibold ${
                              category.isDisabled 
                                ? 'text-gray-400' 
                                : category.isSelected 
                                  ? 'text-[#1E5EFF]' 
                                  : 'text-[#2D2D2D]'
                            }`}>
                              {getPriceForCategory(category.id)}
                            </div>
                          </div>
                          
                          {category.isSelected && !category.isDisabled && (
                            <div className="w-4 h-4 bg-[#1E5EFF] rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
})

VehicleSelector.displayName = 'VehicleSelector'

export default VehicleSelector