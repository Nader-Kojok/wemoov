/**
 * Shared RentalOptions component for booking modals
 * Handles hourly and long-term rental configurations
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Timer } from 'lucide-react'
import { RENTAL_TYPES, PRICING } from '@/constants/booking'
import type { BookingFormProps } from '@/types/booking'

interface RentalOptionsProps extends BookingFormProps {
  className?: string
  mode: 'hourly' | 'rental'
}

const RentalOptions: React.FC<RentalOptionsProps> = React.memo(({ 
  bookingData, 
  updateBookingData, 
  className = '',
  mode
}) => {
  const isHourlyMode = mode === 'hourly'
  const IconComponent = isHourlyMode ? Clock : Timer
  const title = isHourlyMode ? 'Durée de location' : 'Options de location'

  const handleDurationChange = React.useCallback((field: 'hourlyDuration' | 'dailyDuration', increment: boolean) => {
    const currentValue = parseInt(bookingData[field]) || 1
    const maxValue = field === 'hourlyDuration' ? 24 : (bookingData.rentalType === 'daily' ? 365 : 52)
    
    const newValue = increment 
      ? Math.min(currentValue + 1, maxValue)
      : Math.max(currentValue - 1, 1)
    
    updateBookingData(field, newValue.toString())
  }, [bookingData, updateBookingData])

  const calculatePrice = React.useCallback((type: string, duration: number): number => {
    switch (type) {
      case 'hourly':
        return duration * PRICING.hourly
      case 'daily':
        return duration * PRICING.daily
      case 'weekly':
        return duration * PRICING.weekly
      default:
        return 0
    }
  }, [])

  const renderHourlyOptions = () => (
    <div className="space-y-4">
      <div className="space-y-2 p-4 bg-[#E8EFFF] rounded-lg border border-[#1E5EFF]/20">
        <Label htmlFor="duration" className="text-sm font-medium text-[#1E5EFF]">
          Nombre d'heures
        </Label>
        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDurationChange('hourlyDuration', false)}
            className="h-10 w-10 p-0 border-[#1E5EFF]/30 text-[#1E5EFF] hover:bg-[#1E5EFF]/10"
            disabled={parseInt(bookingData.hourlyDuration) <= 1}
          >
            -
          </Button>
          
          <Input
            id="duration"
            type="number"
            min="1"
            max="24"
            value={bookingData.hourlyDuration}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1
              if (value >= 1 && value <= 24) {
                updateBookingData('hourlyDuration', value.toString())
              }
            }}
            className="h-10 text-center border-[#1E5EFF]/30 focus:border-[#1E5EFF] focus:ring-[#1E5EFF]/20 bg-white text-sm w-20"
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDurationChange('hourlyDuration', true)}
            className="h-10 w-10 p-0 border-[#1E5EFF]/30 text-[#1E5EFF] hover:bg-[#1E5EFF]/10"
            disabled={parseInt(bookingData.hourlyDuration) >= 24}
          >
            +
          </Button>
          
          <span className="text-sm text-[#1E5EFF] font-medium">heure(s)</span>
        </div>
        
        <p className="text-sm text-[#1E5EFF] mt-2">
          Prix estimé: {calculatePrice('hourly', parseInt(bookingData.hourlyDuration)).toLocaleString()} FCFA
        </p>
      </div>
    </div>
  )

  const renderRentalOptions = () => (
    <div className="space-y-4">
      {/* Rental Type Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-[#2D2D2D]">Type de location</Label>
        <div className="grid grid-cols-1 gap-3">
          {RENTAL_TYPES.filter(rental => rental.value !== 'hourly').map((rental) => {
            const isSelected = bookingData.rentalType === rental.value
            return (
              <Card 
                key={rental.value} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                  isSelected 
                    ? 'ring-2 ring-[#1E5EFF]/50 bg-[#E8EFFF] border-[#1E5EFF]' 
                    : 'border-[#1E5EFF]/20 hover:border-[#1E5EFF]/40'
                }`}
                onClick={() => updateBookingData('rentalType', rental.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Timer className={`h-5 w-5 ${
                        isSelected ? 'text-[#1E5EFF]' : 'text-[#2D2D2D]/60'
                      }`} />
                      <div>
                        <span className={`font-medium text-sm block ${
                          isSelected ? 'text-[#1E5EFF]' : 'text-[#2D2D2D]'
                        }`}>
                          {rental.label}
                        </span>
                        <p className={`text-sm ${
                          isSelected ? 'text-[#1E5EFF]/80' : 'text-[#2D2D2D]/60'
                        }`}>
                          {rental.price}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 bg-[#1E5EFF] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
      
      {/* Duration Selection */}
      {(bookingData.rentalType === 'daily' || bookingData.rentalType === 'weekly') && (
        <div className="space-y-4">
          <div className="space-y-2 p-4 bg-[#E8EFFF] rounded-lg border border-[#1E5EFF]/20">
            <Label htmlFor="dailyDuration" className="text-sm font-medium text-[#1E5EFF]">
              {bookingData.rentalType === 'daily' ? 'Nombre de jours' : 'Nombre de semaines'}
            </Label>
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDurationChange('dailyDuration', false)}
                className="h-10 w-10 p-0 border-[#1E5EFF]/30 text-[#1E5EFF] hover:bg-[#1E5EFF]/10"
                disabled={parseInt(bookingData.dailyDuration) <= 1}
              >
                -
              </Button>
              
              <Input
                id="dailyDuration"
                type="number"
                min="1"
                max={bookingData.rentalType === 'daily' ? "365" : "52"}
                value={bookingData.dailyDuration}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1
                  const maxValue = bookingData.rentalType === 'daily' ? 365 : 52
                  if (value >= 1 && value <= maxValue) {
                    updateBookingData('dailyDuration', value.toString())
                  }
                }}
                className="h-10 text-center border-[#1E5EFF]/30 focus:border-[#1E5EFF] focus:ring-[#1E5EFF]/20 bg-white text-sm w-20"
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDurationChange('dailyDuration', true)}
                className="h-10 w-10 p-0 border-[#1E5EFF]/30 text-[#1E5EFF] hover:bg-[#1E5EFF]/10"
                disabled={parseInt(bookingData.dailyDuration) >= (bookingData.rentalType === 'daily' ? 365 : 52)}
              >
                +
              </Button>
              
              <span className="text-sm text-[#1E5EFF] font-medium">
                {bookingData.rentalType === 'daily' ? 'jour(s)' : 'semaine(s)'}
              </span>
            </div>
            
            <p className="text-sm text-[#1E5EFF] mt-2">
              Prix estimé: {calculatePrice(
                bookingData.rentalType, 
                parseInt(bookingData.dailyDuration)
              ).toLocaleString()} FCFA
            </p>
          </div>
          
          {/* Driver Option */}
          <div className="space-y-3 p-4 bg-[#E8EFFF] rounded-lg border border-[#1E5EFF]/20">
            <Label className="text-sm font-medium text-[#1E5EFF]">Options supplémentaires</Label>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="withDriver"
                checked={bookingData.withDriver}
                onChange={(e) => updateBookingData('withDriver', e.target.checked)}
                className="rounded border-[#1E5EFF]/30 text-[#1E5EFF] focus:ring-[#1E5EFF]/20"
              />
              <Label htmlFor="withDriver" className="text-sm text-[#1E5EFF] cursor-pointer font-medium">
                Avec chauffeur
              </Label>
            </div>
            <p className="text-sm text-[#1E5EFF]/80">
              {bookingData.withDriver 
                ? "Un chauffeur professionnel sera assigné à votre véhicule."
                : "Vous conduirez le véhicule vous-même."}
            </p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className={`bg-white rounded-lg border border-[#1E5EFF]/20 p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <IconComponent className="h-5 w-5 text-[#1E5EFF]" />
        <h3 className="font-medium text-[#2D2D2D] text-lg">{title}</h3>
      </div>
      
      {isHourlyMode ? renderHourlyOptions() : renderRentalOptions()}
    </div>
  )
})

RentalOptions.displayName = 'RentalOptions'

export default RentalOptions