/**
 * Shared ContactForm component for booking modals
 * Optimized with React.memo to prevent unnecessary re-renders
 */

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Phone } from 'lucide-react'
import type { BookingFormProps } from '@/types/booking'

interface ContactFormProps extends BookingFormProps {
  className?: string
}

const ContactForm: React.FC<ContactFormProps> = React.memo(({ 
  bookingData, 
  updateBookingData, 
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-lg border border-[#1E5EFF]/20 p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <User className="h-5 w-5 text-[#1E5EFF]" />
        <h3 className="font-medium text-[#2D2D2D] text-lg">Informations de contact</h3>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-[#2D2D2D]">
              Prénom
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-[#2D2D2D]/40" />
              <Input
                id="firstName"
                placeholder="Votre prénom"
                value={bookingData.firstName}
                onChange={(e) => updateBookingData('firstName', e.target.value)}
                className="pl-10 h-12 border-[#1E5EFF]/20 focus:border-[#1E5EFF] focus:ring-[#1E5EFF]/20"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-[#2D2D2D]">
              Nom
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-[#2D2D2D]/40" />
              <Input
                id="lastName"
                placeholder="Votre nom"
                value={bookingData.lastName}
                onChange={(e) => updateBookingData('lastName', e.target.value)}
                className="pl-10 h-12 border-[#1E5EFF]/20 focus:border-[#1E5EFF] focus:ring-[#1E5EFF]/20"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-[#2D2D2D]">
            Téléphone
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-[#2D2D2D]/40" />
            <Input
              id="phone"
              placeholder="+221 33 801 82 82"
              value={bookingData.phone}
              onChange={(e) => updateBookingData('phone', e.target.value)}
              className="pl-10 h-12 border-[#1E5EFF]/20 focus:border-[#1E5EFF] focus:ring-[#1E5EFF]/20"
            />
          </div>
        </div>
        

      </div>
    </div>
  )
})

ContactForm.displayName = 'ContactForm'

export default ContactForm