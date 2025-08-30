/**
 * Order Preview component for booking confirmation
 * Shows complete order details and allows downloading as image
 */

import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, MapPin, Target, Users, Car, Phone, User } from 'lucide-react'
import type { BookingFormProps } from '@/types/booking'
import { useVehicleData } from '@/hooks/useVehicleData'
import html2canvas from 'html2canvas'
import { toPng } from 'html-to-image'

interface OrderPreviewProps extends BookingFormProps {
  serviceType: string
  className?: string
}

// Pricing structure (should match VehicleSelector)
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

const OrderPreview: React.FC<OrderPreviewProps> = ({ 
  bookingData, 
  serviceType,
  className = '' 
}) => {
  const previewRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const { selectedCategoryInfo } = useVehicleData({
    passengers: bookingData.passengers,
    selectedCategory: bookingData.selectedCategory,
    selectedVehicleId: bookingData.vehicleId
  })

  // Get service title
  const getServiceTitle = () => {
    switch (serviceType) {
      case 'course':
        return 'Course'
      case 'hourly':
        return 'Location à l\'heure'
      case 'rental':
        return 'Location longue durée'
      default:
        return 'Service'
    }
  }

  // Get pricing for current service and vehicle
  const getPrice = () => {
    const pricingKey = serviceType as keyof typeof VEHICLE_PRICING
    const categoryKey = bookingData.selectedCategory as keyof typeof VEHICLE_PRICING.course
    return VEHICLE_PRICING[pricingKey]?.[categoryKey] || 'Prix sur demande'
  }

  // Calculate total for hourly/rental services
  const calculateTotal = () => {
    if (serviceType === 'hourly' && bookingData.hourlyDuration) {
      const basePrice = parseInt(getPrice().replace(/[^0-9]/g, ''))
      return `${(basePrice * parseInt(bookingData.hourlyDuration)).toLocaleString()} FCFA`
    }
    if (serviceType === 'rental' && bookingData.dailyDuration) {
      const basePrice = parseInt(getPrice().replace(/[^0-9]/g, ''))
      return `${(basePrice * parseInt(bookingData.dailyDuration)).toLocaleString()} FCFA`
    }
    return getPrice()
  }

  // Download as image with fallback strategy
  const downloadAsImage = async () => {
    if (!previewRef.current) {
      console.error('Preview reference not found')
      alert('Erreur: Élément non trouvé pour la capture.')
      return
    }

    setIsDownloading(true)
    
    // Try html-to-image first (more modern and reliable)
    try {
      console.log('Attempting image generation with html-to-image...')
      
      const dataUrl = await toPng(previewRef.current, {
        backgroundColor: '#ffffff',
        width: previewRef.current.scrollWidth,
        height: previewRef.current.scrollHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        },
        pixelRatio: 2,
        cacheBust: true
      })
      
      console.log('Image generated successfully with html-to-image')
      
      // Create download link
      const link = document.createElement('a')
      link.download = `commande-wemoov-${Date.now()}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('Download completed successfully')
      return // Success, exit function
      
    } catch (htmlToImageError) {
      console.warn('html-to-image failed, trying html2canvas fallback:', htmlToImageError)
      
      // Fallback to html2canvas
      try {
        console.log('Attempting fallback with html2canvas...')
        
        const canvas = await html2canvas(previewRef.current, {
           background: '#ffffff',
           useCORS: true,
           allowTaint: false,
           logging: false,
           width: previewRef.current.scrollWidth,
           height: previewRef.current.scrollHeight
         })
        
        console.log('Fallback canvas generated successfully')
        
        const link = document.createElement('a')
        link.download = `commande-wemoov-${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        console.log('Fallback download completed successfully')
        return // Success with fallback
        
      } catch (html2canvasError) {
        console.error('Both html-to-image and html2canvas failed:', {
          htmlToImageError,
          html2canvasError
        })
        
        // Provide specific error messages
        let errorMessage = 'Erreur lors de la génération de l\'image avec les deux méthodes.'
        
        if (html2canvasError instanceof Error) {
          if (html2canvasError.message.includes('CORS')) {
            errorMessage = 'Erreur CORS: Les images externes ne peuvent pas être capturées. Essayez de rafraîchir la page.'
          } else if (html2canvasError.message.includes('canvas')) {
            errorMessage = 'Erreur de rendu: Votre navigateur ne supporte pas cette fonctionnalité.'
          }
        }
        
        alert(`${errorMessage} Contactez le support si le problème persiste.`)
      }
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Download Button */}
      <div className="flex justify-end">
        <Button
          onClick={downloadAsImage}
          disabled={isDownloading}
          variant="outline"
          className="flex items-center space-x-2 border-[#1E5EFF] text-[#1E5EFF] hover:bg-[#1E5EFF] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className={`h-4 w-4 ${isDownloading ? 'animate-spin' : ''}`} />
          <span>{isDownloading ? 'Génération...' : 'Télécharger'}</span>
        </Button>
      </div>

      {/* Order Preview Card */}
      <Card ref={previewRef} className="bg-white border-[#1E5EFF]/20">
        <CardHeader className="bg-gradient-to-r from-[#1E5EFF] to-[#4A90E2] text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Aperçu de la commande</CardTitle>
              <p className="text-blue-100 mt-1">WeMoov - Transport Premium</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Référence</p>
              <p className="font-mono text-lg">#WM{Date.now().toString().slice(-6)}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Service Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-[#2D2D2D] text-lg flex items-center">
                <Car className="h-5 w-5 text-[#1E5EFF] mr-2" />
                Service
              </h3>
              <div className="bg-[#E8EFFF] p-4 rounded-lg">
                <p className="font-medium text-[#1E5EFF]">{getServiceTitle()}</p>
                <p className="text-sm text-[#2D2D2D]/70 mt-1">
                  {selectedCategoryInfo?.name} - {selectedCategoryInfo?.capacityInfo}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-[#2D2D2D] text-lg flex items-center">
                <Users className="h-5 w-5 text-[#1E5EFF] mr-2" />
                Détails
              </h3>
              <div className="bg-[#E8EFFF] p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Passagers:</span> {bookingData.passengers}
                </p>
                {serviceType === 'hourly' && bookingData.hourlyDuration && (
                  <p className="text-sm">
                    <span className="font-medium">Durée:</span> {bookingData.hourlyDuration} heure{parseInt(bookingData.hourlyDuration) > 1 ? 's' : ''}
                  </p>
                )}
                {serviceType === 'rental' && bookingData.dailyDuration && (
                  <p className="text-sm">
                    <span className="font-medium">Durée:</span> {bookingData.dailyDuration} jour{parseInt(bookingData.dailyDuration) > 1 ? 's' : ''}
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-medium">Date:</span> {bookingData.date || 'Non spécifiée'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Heure:</span> {bookingData.time || 'Non spécifiée'}
                </p>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#2D2D2D] text-lg flex items-center">
              <MapPin className="h-5 w-5 text-[#1E5EFF] mr-2" />
              Itinéraire
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#E8EFFF] p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#2D2D2D]">Point de départ</p>
                    <p className="text-sm text-[#2D2D2D]/70 mt-1">
                      {bookingData.pickupLocation || 'Non spécifié'}
                    </p>
                  </div>
                </div>
              </div>
              {serviceType === 'course' && (
                <div className="bg-[#E8EFFF] p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Target className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#2D2D2D]">Destination</p>
                      <p className="text-sm text-[#2D2D2D]/70 mt-1">
                        {bookingData.destination || 'Non spécifiée'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#2D2D2D] text-lg flex items-center">
              <User className="h-5 w-5 text-[#1E5EFF] mr-2" />
              Informations client
            </h3>
            <div className="bg-[#E8EFFF] p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p className="text-sm">
                  <span className="font-medium">Nom:</span> {bookingData.firstName} {bookingData.lastName}
                </p>
                <p className="text-sm flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-[#1E5EFF]" />
                  {bookingData.phone || 'Non spécifié'}
                </p>
              </div>
              {bookingData.specialRequests && (
                <div>
                  <p className="font-medium text-sm mb-1">Demandes spéciales:</p>
                  <p className="text-sm text-[#2D2D2D]/70 bg-white p-2 rounded border">
                    {bookingData.specialRequests}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t border-[#1E5EFF]/20 pt-6">
            <div className="bg-gradient-to-r from-[#E8EFFF] to-[#B8C5FF]/30 p-6 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-[#2D2D2D]">Total estimé</p>
                  <p className="text-sm text-[#2D2D2D]/70">Prix final confirmé par le chauffeur</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#1E5EFF]">{calculateTotal()}</p>
                  {serviceType !== 'course' && (
                    <p className="text-sm text-[#2D2D2D]/70">Prix unitaire: {getPrice()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-[#1E5EFF]/10">
            <p className="text-sm text-[#2D2D2D]/60">
              Merci de choisir WeMoov pour vos déplacements au Sénégal
            </p>
            <p className="text-xs text-[#2D2D2D]/40 mt-1">
              Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OrderPreview