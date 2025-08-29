import * as React from 'react'
import { Dialog, DialogContent } from '@/components/ui/enhanced-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Users, Phone, Mail, User, Car, Timer, X, AlertTriangle, CheckCircle } from 'lucide-react'
import { useFormSimulation } from '@/utils/formSimulation'
import type { FormField } from '@/utils/formSimulation'

interface HeroBookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceType: string
  initialData: any
}

interface BookingData {
  serviceType: string
  pickupLocation: string
  destination: string
  date: string
  time: string
  passengers: string
  vehicleType: string
  firstName: string
  lastName: string
  phone: string
  email: string
  specialRequests: string
  rentalType: string
  withDriver: boolean
  hourlyDuration: string
  dailyDuration: string
}

const VEHICLE_TYPES = [
  { value: "sedan", label: "Berline (1-3 passagers)", icon: Car },
  { value: "suv", label: "SUV (1-6 passagers)", icon: Car },
  { value: "van", label: "Van (1-8 passagers)", icon: Car },
  { value: "luxury", label: "Véhicule de luxe", icon: Car }
]

const RENTAL_TYPES = [
  { value: "hourly", label: "Location à l'heure", price: "8 000 FCFA/h" },
  { value: "daily", label: "Location à la journée", price: "45 000 FCFA/jour" },
  { value: "weekly", label: "Location à la semaine", price: "280 000 FCFA/semaine" }
]

const HeroBookingModal: React.FC<HeroBookingModalProps> = ({ open, onOpenChange, serviceType, initialData }) => {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [bookingData, setBookingData] = React.useState<BookingData>({
    serviceType,
    pickupLocation: initialData.pickupLocation || '',
    destination: initialData.destination || '',
    date: initialData.date || '',
    time: initialData.time || '',
    passengers: initialData.passengers || '1',
    vehicleType: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    specialRequests: '',
    rentalType: initialData.rentalType || 'daily',
    withDriver: true,
    hourlyDuration: initialData.hourlyDuration || '2',
    dailyDuration: initialData.dailyDuration || '1'
  })

  const { isSubmitting, simulationResult, submitForm, clearResult } = useFormSimulation()

  const getStepsForService = (serviceId: string) => {
    switch (serviceId) {
      case "course":
        return [
          { id: 0, title: "Détails", component: "details" },
          { id: 1, title: "Contact", component: "contact" }
        ]
      case "hourly":
        return [
          { id: 0, title: "Durée", component: "hourly" },
          { id: 1, title: "Détails", component: "details" },
          { id: 2, title: "Contact", component: "contact" }
        ]
      case "rental":
        return [
          { id: 0, title: "Options", component: "rental" },
          { id: 1, title: "Détails", component: "details" },
          { id: 2, title: "Contact", component: "contact" }
        ]
      default:
        return [{ id: 0, title: "Détails", component: "details" }]
    }
  }

  const steps = getStepsForService(serviceType)
  const maxSteps = steps.length

  const nextStep = () => {
    if (currentStep < maxSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateBookingData = (field: keyof BookingData, value: string | boolean) => {
    setBookingData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (simulationResult) {
      clearResult()
    }

    const fields: FormField[] = [
      {
        name: 'pickupLocation',
        value: bookingData.pickupLocation,
        required: true,
        type: 'text',
        minLength: 5
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
        value: bookingData.passengers,
        required: true,
        type: 'number'
      },
      {
        name: 'firstName',
        value: bookingData.firstName,
        required: true,
        type: 'text',
        minLength: 2
      },
      {
        name: 'lastName',
        value: bookingData.lastName,
        required: true,
        type: 'text',
        minLength: 2
      },
      {
        name: 'phone',
        value: bookingData.phone,
        required: true,
        type: 'phone'
      }
    ]

    if (serviceType === "course") {
      fields.push({
        name: 'destination',
        value: bookingData.destination,
        required: true,
        type: 'text',
        minLength: 5
      })
    }

    if (bookingData.email) {
      fields.push({
        name: 'email',
        value: bookingData.email,
        required: false,
        type: 'email'
      })
    }

    const result = await submitForm(fields, 'booking')
    
    if (result.success) {
      setBookingData({
        serviceType: '',
        pickupLocation: '',
        destination: '',
        date: '',
        time: '',
        passengers: '1',
        vehicleType: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        specialRequests: '',
        rentalType: '',
        withDriver: true,
        hourlyDuration: '1',
        dailyDuration: '1'
      })
      setTimeout(() => {
        onOpenChange(false)
      }, 3000)
    }
  }

  const renderHourlyOptions = () => (
    <div className="bg-white rounded-lg border border-[#1E5EFF]/20 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="h-5 w-5 text-[#1E5EFF]" />
        <h3 className="font-medium text-[#2D2D2D] text-lg">Durée de location</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2 p-4 bg-[#E8EFFF] rounded-lg border border-[#1E5EFF]/20">
          <Label htmlFor="duration" className="text-sm font-medium text-[#1E5EFF]">Nombre d'heures</Label>
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const current = parseInt(bookingData.hourlyDuration) || 1
                if (current > 1) updateBookingData('hourlyDuration', (current - 1).toString())
              }}
              className="h-10 w-10 p-0 border-[#1E5EFF]/30 text-[#1E5EFF] hover:bg-[#1E5EFF]/10"
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
              onClick={() => {
                const current = parseInt(bookingData.hourlyDuration) || 1
                if (current < 24) updateBookingData('hourlyDuration', (current + 1).toString())
              }}
              className="h-10 w-10 p-0 border-[#1E5EFF]/30 text-[#1E5EFF] hover:bg-[#1E5EFF]/10"
            >
              +
            </Button>
            <span className="text-sm text-[#1E5EFF] font-medium">heure(s)</span>
          </div>
          <p className="text-sm text-[#1E5EFF] mt-2">
            Prix estimé: {parseInt(bookingData.hourlyDuration) * 8000} FCFA
          </p>
        </div>
      </div>
    </div>
  )

  const renderRentalOptions = () => (
    <div className="bg-white rounded-lg border border-[#1E5EFF]/20 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Timer className="h-5 w-5 text-[#1E5EFF]" />
        <h3 className="font-medium text-[#2D2D2D] text-lg">Options de location</h3>
      </div>
      
      <div className="space-y-4">
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
                          }`}>{rental.label}</span>
                          <p className={`text-sm ${
                            isSelected ? 'text-[#1E5EFF]/80' : 'text-[#2D2D2D]/60'
                          }`}>{rental.price}</p>
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
                  onClick={() => {
                    const current = parseInt(bookingData.dailyDuration) || 1
                    if (current > 1) updateBookingData('dailyDuration', (current - 1).toString())
                  }}
                  className="h-10 w-10 p-0 border-[#1E5EFF]/30 text-[#1E5EFF] hover:bg-[#1E5EFF]/10"
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
                  onClick={() => {
                    const current = parseInt(bookingData.dailyDuration) || 1
                    const maxValue = bookingData.rentalType === 'daily' ? 365 : 52
                    if (current < maxValue) updateBookingData('dailyDuration', (current + 1).toString())
                  }}
                  className="h-10 w-10 p-0 border-[#1E5EFF]/30 text-[#1E5EFF] hover:bg-[#1E5EFF]/10"
                >
                  +
                </Button>
                <span className="text-sm text-[#1E5EFF] font-medium">
                  {bookingData.rentalType === 'daily' ? 'jour(s)' : 'semaine(s)'}
                </span>
              </div>
              <p className="text-sm text-[#1E5EFF] mt-2">
                Prix estimé: {parseInt(bookingData.dailyDuration) * (bookingData.rentalType === 'daily' ? 45000 : 280000)} FCFA
              </p>
            </div>
            
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
    </div>
  )

  const renderPassengersAndVehicle = () => (
    <div className="bg-white rounded-lg border border-[#1E5EFF]/20 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="h-5 w-5 text-[#1E5EFF]" />
        <h3 className="font-medium text-[#2D2D2D] text-lg">Détails du voyage</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#2D2D2D]">Type de véhicule</Label>
          <div className="grid grid-cols-2 gap-3">
            {VEHICLE_TYPES.map((vehicle) => {
              const IconComponent = vehicle.icon
              const isSelected = bookingData.vehicleType === vehicle.value
              return (
                <Card 
                  key={vehicle.value} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                    isSelected 
                      ? 'ring-2 ring-[#1E5EFF]/50 bg-[#E8EFFF] border-[#1E5EFF]' 
                      : 'border-[#1E5EFF]/20 hover:border-[#1E5EFF]/40'
                  }`}
                  onClick={() => updateBookingData('vehicleType', vehicle.value)}
                >
                  <CardContent className="p-3">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <IconComponent className={`h-6 w-6 ${
                        isSelected ? 'text-[#1E5EFF]' : 'text-[#2D2D2D]/60'
                      }`} />
                      <span className={`font-medium text-xs leading-tight ${
                        isSelected ? 'text-[#1E5EFF]' : 'text-[#2D2D2D]'
                      }`}>{vehicle.label}</span>
                      {isSelected && (
                        <div className="w-3 h-3 bg-[#1E5EFF] rounded-full flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="specialRequests" className="text-sm font-medium text-[#2D2D2D]">Demandes spéciales (optionnel)</Label>
          <textarea
            id="specialRequests"
            placeholder="Siège enfant, assistance PMR, arrêts supplémentaires..."
            value={bookingData.specialRequests}
            onChange={(e) => updateBookingData('specialRequests', e.target.value)}
            className="w-full h-20 px-3 py-2 text-sm border border-[#1E5EFF]/20 rounded-md focus:border-[#1E5EFF] focus:ring-[#1E5EFF]/20 resize-none"
          />
        </div>
      </div>
    </div>
  )

  const renderContactForm = () => (
    <div className="bg-white rounded-lg border border-[#1E5EFF]/20 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <User className="h-5 w-5 text-[#1E5EFF]" />
        <h3 className="font-medium text-[#2D2D2D] text-lg">Informations de contact</h3>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-[#2D2D2D]">Prénom</Label>
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
            <Label htmlFor="lastName" className="text-sm font-medium text-[#2D2D2D]">Nom</Label>
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
          <Label htmlFor="phone" className="text-sm font-medium text-[#2D2D2D]">Téléphone</Label>
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
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-[#2D2D2D]">Email (optionnel)</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-[#2D2D2D]/40" />
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={bookingData.email}
              onChange={(e) => updateBookingData('email', e.target.value)}
              className="pl-10 h-12 border-[#1E5EFF]/20 focus:border-[#1E5EFF] focus:ring-[#1E5EFF]/20"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderCurrentStepContent = () => {
    const currentStepInfo = steps[currentStep]
    if (!currentStepInfo) return null
 
    switch (currentStepInfo.component) {
      case "hourly":
        return renderHourlyOptions()
      case "rental":
        return renderRentalOptions()
      case "details":
        return renderPassengersAndVehicle()
      case "contact":
        return renderContactForm()
      default:
        return null
    }
  }

  const getServiceTitle = () => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        animationVariant="elegant"
        className="max-w-2xl mx-auto h-screen md:h-[95vh] md:max-h-[900px] p-0 overflow-hidden md:rounded-xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm"
      >
        <div className="flex flex-col h-full">
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
              <h2 className="text-xl font-bold text-[#2D2D2D] text-center mb-4 pr-12 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                {getServiceTitle()}
              </h2>
            </div>
            
            {/* Step Progress */}
            <div className="px-6 pb-4 animate-in fade-in-0 slide-in-from-top-1 duration-300 delay-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#2D2D2D]">{steps[currentStep]?.title}</span>
                <span className="text-sm text-[#2D2D2D]/60 bg-[#E8EFFF] px-3 py-1 rounded-full">{currentStep + 1} / {maxSteps}</span>
              </div>
              <div className="w-full bg-[#E8EFFF] rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#1E5EFF] to-[#4A90E2] h-2 rounded-full transition-all duration-500 ease-out shadow-sm" 
                  style={{ width: `${((currentStep + 1) / maxSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 bg-gradient-to-b from-[#E8EFFF]/20 to-[#B8C5FF]/10 overflow-y-auto">
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-400 delay-200">
              {renderCurrentStepContent()}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#1E5EFF]/10 bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="flex gap-4">
              {currentStep > 0 && (
                <Button 
                  onClick={prevStep}
                  variant="outline"
                  className="flex-1 h-12 text-base font-medium border-[#1E5EFF]/20 text-[#1E5EFF] hover:bg-[#1E5EFF]/10"
                >
                  Précédent
                </Button>
              )}
              
              {currentStep < maxSteps - 1 ? (
                <Button 
                  onClick={nextStep}
                  className="flex-1 bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Suivant
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
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
}

export default HeroBookingModal