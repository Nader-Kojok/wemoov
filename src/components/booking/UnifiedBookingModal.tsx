/**
 * Unified BookingModal component
 * Replaces both BookingModal and HeroBookingModal with optimized performance
 * Handles both standard and hero booking flows
 */

import React, { Suspense } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/enhanced-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, AlertTriangle, CheckCircle } from 'lucide-react'
import { useBookingForm } from '@/hooks/useBookingForm'
import { useBookingSteps } from '@/hooks/useBookingSteps'
import { SERVICE_TYPES } from '@/constants/booking'
import type { 
  BaseBookingModalProps, 
  HeroBookingModalProps, 
  BookingModalProps,
  BookingMode 
} from '@/types/booking'

// Lazy load heavy components
const ContactForm = React.lazy(() => import('./ContactForm'))
const VehicleSelector = React.lazy(() => import('./VehicleSelector'))
const RentalOptions = React.lazy(() => import('./RentalOptions'))
const BookingMapSelector = React.lazy(() => import('../BookingMapSelector'))
const OrderPreview = React.lazy(() => import('./OrderPreview'))

// Component loading fallback
const ComponentLoader: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E5EFF]"></div>
  </div>
)

interface UnifiedBookingModalProps extends BaseBookingModalProps {
  mode?: BookingMode
  serviceType?: string
  initialData?: any
}

const UnifiedBookingModal: React.FC<UnifiedBookingModalProps> = React.memo(({
  open,
  onOpenChange,
  mode = 'standard',
  serviceType = '',
  initialData = {}
}) => {
  const [selectedService, setSelectedService] = React.useState<string | null>(
    mode === 'hero' ? serviceType : null
  )
  const [useMapView, setUseMapView] = React.useState(true)

  // Réinitialiser le service sélectionné quand le modal se ferme
  React.useEffect(() => {
    if (!open) {
      setSelectedService(mode === 'hero' ? serviceType : null)
      setUseMapView(true)
    }
  }, [open, mode, serviceType])

  const {
    bookingData,
    updateBookingData,
    handleSubmit,
    isSubmitting,
    simulationResult,
    clearResult,
    validateCurrentStep
  } = useBookingForm({
    serviceType: selectedService || serviceType,
    initialData,
    mode
  })

  const {
    currentStep,
    maxSteps,
    nextStep,
    prevStep,
    setCurrentStep,
    getCurrentStepInfo,
    getProgressPercentage
  } = useBookingSteps({
    serviceType: selectedService || serviceType,
    mode,
    selectedService
  })

  // Handle service selection for standard mode
  const handleServiceSelection = React.useCallback((serviceId: string) => {
    setSelectedService(serviceId)
    updateBookingData('serviceType', serviceId)
    
    // Auto-set rentalType for hourly service
    if (serviceId === "hourly") {
      updateBookingData('rentalType', 'hourly')
    }
    
    setCurrentStep(1)
  }, [updateBookingData, setCurrentStep])

  // Handle step navigation with service selection logic
  const handlePrevStep = React.useCallback(() => {
    if (currentStep === 1 && mode === 'standard' && selectedService) {
      // Going back to service selection
      setSelectedService(null)
      setCurrentStep(0)
    } else {
      prevStep()
    }
  }, [currentStep, mode, selectedService, prevStep, setCurrentStep])

  // State for validation errors
  const [validationErrors, setValidationErrors] = React.useState<string[]>([])

  // Handle next step with validation
  const handleNextStep = React.useCallback(() => {
    const stepInfo = getCurrentStepInfo()
    if (!stepInfo) return
    
    const validation = validateCurrentStep(stepInfo.component)
    if (!validation.isValid) {
      // Afficher les erreurs de validation dans l'interface
      setValidationErrors(validation.errors)
      return
    }
    
    // Effacer les erreurs et aller à l'étape suivante
    setValidationErrors([])
    nextStep()
  }, [getCurrentStepInfo, validateCurrentStep, nextStep])

  // Clear validation errors when step changes
  React.useEffect(() => {
    setValidationErrors([])
  }, [currentStep])

  // Handle form submission with auto-close
  const handleFormSubmit = React.useCallback(async () => {
    const result = await handleSubmit()
    if (result?.success) {
      setTimeout(() => {
        onOpenChange(false)
      }, 3000)
    }
  }, [handleSubmit, onOpenChange])

  // Service selection component
  const ServiceSelection = React.memo(() => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Quel service souhaitez-vous ?
        </h3>
        <p className="text-sm text-gray-600">
          Choisissez le type de transport qui correspond à vos besoins
        </p>
      </div>
      <div className="space-y-3">
        {SERVICE_TYPES.map((service) => {
          const IconComponent = service.icon
          return (
            <Card 
              key={service.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-md border-2 hover:border-blue-200"
              onClick={() => handleServiceSelection(service.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{service.title}</h4>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  ))

  // Location and DateTime component (simplified for now)
  const LocationAndDateTime = React.memo(() => (
    <div className="bg-white rounded-lg border border-[#1E5EFF]/20 p-6">
      <div className="flex justify-end mb-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setUseMapView(!useMapView)}
          className="text-xs text-[#1E5EFF] hover:text-[#1E5EFF]/80 h-6 px-2"
        >
          {useMapView ? 'Saisie manuelle' : 'Voir la carte'}
        </Button>
      </div>
      
      {useMapView ? (
        <Suspense fallback={<ComponentLoader />}>
          <BookingMapSelector
            pickupLocation={bookingData.pickupLocation}
            destination={selectedService === "course" ? bookingData.destination : ""}
            onPickupChange={(location) => updateBookingData('pickupLocation', location)}
            onDestinationChange={selectedService === "course" ? 
              (location) => updateBookingData('destination', location) : undefined}
            height="200px"
            showDestination={selectedService === "course"}
          />
        </Suspense>
      ) : (
        <div className="text-center p-8 text-gray-500">
          Manual input form would go here
        </div>
      )}
    </div>
  ))

  // Render current step content
  const renderStepContent = React.useCallback(() => {
    const stepInfo = getCurrentStepInfo()
    if (!stepInfo) return null

    switch (stepInfo.component) {
      case 'service':
        return <ServiceSelection />
      
      case 'location':
        return <LocationAndDateTime />
      
      case 'hourly':
        return (
          <Suspense fallback={<ComponentLoader />}>
            <RentalOptions 
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              mode="hourly"
            />
          </Suspense>
        )
      
      case 'rental':
        return (
          <Suspense fallback={<ComponentLoader />}>
            <RentalOptions 
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              mode="rental"
            />
          </Suspense>
        )
      
      case 'details':
        return (
          <Suspense fallback={<ComponentLoader />}>
            <VehicleSelector 
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              serviceType={selectedService || serviceType}
            />
          </Suspense>
        )
      
      case 'contact':
        return (
          <Suspense fallback={<ComponentLoader />}>
            <ContactForm 
              bookingData={bookingData}
              updateBookingData={updateBookingData}
            />
          </Suspense>
        )
      
      case 'preview':
        return (
          <Suspense fallback={<ComponentLoader />}>
            <OrderPreview 
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              serviceType={selectedService || serviceType}
            />
          </Suspense>
        )
      
      default:
        return null
    }
  }, [getCurrentStepInfo, bookingData, updateBookingData, selectedService, serviceType, useMapView])

  // Get service title for header
  const getServiceTitle = React.useCallback(() => {
    if (mode === 'hero') {
      switch (serviceType) {
        case 'course':
          return 'Commander une course'
        case 'hourly':
          return 'Location à l\'heure'
        case 'rental':
          return 'Location longue durée'
        default:
          return 'Réservation'
      }
    }
    return 'Réserver votre transport'
  }, [mode, serviceType])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        animationVariant={mode === 'hero' ? 'fade' : 'elegant'}
        className="max-w-2xl w-full max-h-[90vh] p-0 md:rounded-xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden"
      >
        <DialogTitle className="sr-only">{getServiceTitle()}</DialogTitle>
        
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="bg-white/90 backdrop-blur-sm border-b border-[#1E5EFF]/10 sticky top-0 z-10">
            <div className="px-6 pt-6 pb-4 relative">
              <button
                onClick={() => onOpenChange(false)}
                className="absolute left-6 top-6 p-2 hover:bg-[#1E5EFF]/10 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Fermer"
              >
                <X className="h-5 w-5 text-[#2D2D2D]/60 hover:text-[#1E5EFF] transition-colors" />
              </button>
              
              <h2 className="text-xl font-bold text-[#2D2D2D] text-center mb-4 pr-12">
                {getServiceTitle()}
              </h2>
            </div>
            
            {/* Step Progress - only show if service is selected */}
            {(selectedService || mode === 'hero') && (
              <div className="px-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#2D2D2D]">
                    {getCurrentStepInfo()?.title}
                  </span>
                  <span className="text-sm text-[#2D2D2D]/60 bg-[#E8EFFF] px-3 py-1 rounded-full">
                    {currentStep + 1} / {maxSteps}
                  </span>
                </div>
                <div className="w-full bg-[#E8EFFF] rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#1E5EFF] to-[#4A90E2] h-2 rounded-full transition-all duration-300 ease-out shadow-sm" 
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 bg-gradient-to-b from-[#E8EFFF]/20 to-[#B8C5FF]/10 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-[#1E5EFF]/30 scrollbar-track-transparent">
            {renderStepContent()}
            
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 mb-2">
                      Veuillez corriger les erreurs suivantes :
                    </h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-1 h-1 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#1E5EFF]/10 bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="flex gap-4">
              {currentStep > 0 && (
                <Button 
                  onClick={handlePrevStep}
                  variant="outline"
                  className="flex-1 h-12 text-base font-medium border-[#1E5EFF]/20 text-[#1E5EFF] hover:bg-[#1E5EFF]/10"
                >
                  Précédent
                </Button>
              )}
              
              {currentStep === 0 && mode === 'standard' ? (
                // Service selection step - no next button needed
                null
              ) : currentStep < maxSteps - 1 ? (
                <Button 
                  onClick={handleNextStep}
                  className="flex-1 bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-150"
                >
                  Suivant
                </Button>
              ) : (
                <Button 
                  onClick={handleFormSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Traitement en cours...
                    </>
                  ) : (
                    'Confirmer la réservation'
                  )}
                </Button>
              )}
            </div>

            {/* Form Result */}
            {simulationResult && (
              <div className={`${simulationResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4 mt-4`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {simulationResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${simulationResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {simulationResult.message}
                    </p>
                    {simulationResult.data && (
                      <div className={`mt-2 text-xs ${simulationResult.success ? 'text-green-800' : 'text-red-800'}`}>
                        <p>Référence: {simulationResult.data.bookingNumber}</p>
                        <p>Arrivée estimée: {simulationResult.data.estimatedArrival}</p>
                      </div>
                    )}
                    {simulationResult.errors && (
                      <ul className={`mt-2 text-xs ${simulationResult.success ? 'text-green-800' : 'text-red-800'} list-disc list-inside`}>
                        {simulationResult.errors.map((error, index) => (
                          <li key={index}>{error.message}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      type="button"
                      onClick={clearResult}
                      className={`inline-flex ${simulationResult.success ? 'text-green-400' : 'text-red-400'} hover:opacity-75 focus:outline-none`}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})

UnifiedBookingModal.displayName = 'UnifiedBookingModal'

// Export both the unified component and compatibility wrappers
export default UnifiedBookingModal

// Compatibility wrapper for BookingModal
export const BookingModal: React.FC<BookingModalProps> = (props) => (
  <UnifiedBookingModal {...props} mode="standard" />
)

// Compatibility wrapper for HeroBookingModal
export const HeroBookingModal: React.FC<HeroBookingModalProps> = ({ 
  serviceType, 
  initialData, 
  ...props 
}) => (
  <UnifiedBookingModal 
    {...props} 
    mode="hero" 
    serviceType={serviceType} 
    initialData={initialData} 
  />
)