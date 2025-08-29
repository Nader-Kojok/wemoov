import * as React from "react"
import { Dialog, DialogContent } from "@/components/ui/enhanced-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
// Removed Tabs import as we're using service selection cards instead
import { MapPin, Calendar, Clock, Users, Phone, Mail, User, Target, Car, Plane, Timer, X, AlertTriangle, CheckCircle } from "lucide-react"
import BookingMapSelector from './BookingMapSelector'
import { useFormSimulation } from '@/utils/formSimulation'
import type { FormField } from '@/utils/formSimulation'

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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
  rentalDuration: string
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

const SERVICE_TYPES = [
  {
    id: "course",
    title: "Commander une course",
    description: "Transport ponctuel d'un point A à un point B",
    icon: Car,
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "hourly",
    title: "Location à l'heure",
    description: "Réservez un chauffeur pour plusieurs heures",
    icon: Clock,
    color: "from-green-500 to-green-600"
  },
  {
    id: "rental",
    title: "Location longue durée",
    description: "Location à la journée, semaine ou plus",
    icon: Timer,
    color: "from-purple-500 to-purple-600"
  }
]

export const BookingModal: React.FC<BookingModalProps> = ({ open, onOpenChange }) => {
  const [selectedService, setSelectedService] = React.useState<string | null>(null)
  const [currentStep, setCurrentStep] = React.useState(0) // Start at 0 for service selection
  const [useMapView, setUseMapView] = React.useState(true)
  const [bookingData, setBookingData] = React.useState<BookingData>({
    serviceType: "",
    pickupLocation: "",
    destination: "",
    date: "",
    time: "",
    passengers: "1",
    vehicleType: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    specialRequests: "",
    rentalDuration: "",
    rentalType: "",
    withDriver: true,
    hourlyDuration: "1",
    dailyDuration: "1"
  })

  const { isSubmitting, simulationResult, submitForm, clearResult } = useFormSimulation()

  const getStepsForService = (serviceId: string | null) => {
    if (!serviceId) return [{ id: 0, title: "Service", component: "service" }]
    
    const baseSteps = [{ id: 0, title: "Service", component: "service" }]
    
    switch (serviceId) {
      case "course":
        return [
          ...baseSteps,
          { id: 1, title: "Itinéraire", component: "location" },
          { id: 2, title: "Détails", component: "details" },
          { id: 3, title: "Contact", component: "contact" }
        ]
      case "hourly":
        return [
          ...baseSteps,
          { id: 1, title: "Itinéraire", component: "location" },
          { id: 2, title: "Durée", component: "hourly" },
          { id: 3, title: "Détails", component: "details" },
          { id: 4, title: "Contact", component: "contact" }
        ]
      case "rental":
        return [
          ...baseSteps,
          { id: 1, title: "Itinéraire", component: "location" },
          { id: 2, title: "Options", component: "rental" },
          { id: 3, title: "Détails", component: "details" },
          { id: 4, title: "Contact", component: "contact" }
        ]
      default:
        return baseSteps
    }
  }

  const steps = getStepsForService(selectedService)
  const maxSteps = steps.length

  const nextStep = () => {
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      if (currentStep === 1) {
        // Going back to service selection
        setSelectedService(null)
        setCurrentStep(0)
      } else {
        setCurrentStep(currentStep - 1)
      }
    }
  }

  const handleServiceSelection = (serviceId: string) => {
    setSelectedService(serviceId)
    const updatedData: Partial<BookingData> = { serviceType: serviceId }
    
    // Auto-set rentalType for hourly service
    if (serviceId === "hourly") {
      updatedData.rentalType = "hourly"
    }
    
    setBookingData(prev => ({ ...prev, ...updatedData }))
    setCurrentStep(1)
  }

  const renderServiceSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quel service souhaitez-vous ?</h3>
        <p className="text-sm text-gray-600">Choisissez le type de transport qui correspond à vos besoins</p>
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
  )
 
  const renderCurrentStepContent = () => {
    const currentStepInfo = steps[currentStep]
    if (!currentStepInfo) return null
 
    switch (currentStepInfo.component) {
      case "service":
        return renderServiceSelection()
      case "location":
        return renderLocationAndDateTime()
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
 
   const updateBookingData = (field: keyof BookingData, value: string | boolean) => {
     setBookingData(prev => ({ ...prev, [field]: value }))
   }

  const handleSubmit = async () => {
    // Clear any previous results
    if (simulationResult) {
      clearResult()
    }

    // Build form fields for validation
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

    // Add destination field if required for course service
    if (selectedService === "course") {
      fields.push({
        name: 'destination',
        value: bookingData.destination,
        required: true,
        type: 'text',
        minLength: 5
      })
    }

    // Add email if provided
    if (bookingData.email) {
      fields.push({
        name: 'email',
        value: bookingData.email,
        required: false,
        type: 'email'
      })
    }

    // Validate rental-specific fields
    if (selectedService === "hourly" || selectedService === "rental") {
      if (!bookingData.rentalType) {
        alert('Veuillez sélectionner un type de location')
        return
      }
      
      if (bookingData.rentalType === 'hourly') {
        const hours = parseInt(bookingData.hourlyDuration)
        if (!hours || hours < 1 || hours > 24) {
          alert('Veuillez saisir un nombre d\'heures valide (1-24)')
          return
        }
      }
      
      if (bookingData.rentalType === 'daily' || bookingData.rentalType === 'weekly') {
        const duration = parseInt(bookingData.dailyDuration)
        const maxValue = bookingData.rentalType === 'daily' ? 365 : 52
        const unit = bookingData.rentalType === 'daily' ? 'jours' : 'semaines'
        if (!duration || duration < 1 || duration > maxValue) {
          alert(`Veuillez saisir un nombre de ${unit} valide (1-${maxValue})`)
          return
        }
      }
    }

    // Submit form with simulation
    const result = await submitForm(fields, 'booking')
    
    if (result.success) {
      // Reset form data on success
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
        rentalDuration: '',
        rentalType: '',
        withDriver: true,
        hourlyDuration: '1',
        dailyDuration: '1'
      })
      // Don't close modal immediately, let user see the success message
      setTimeout(() => {
        onOpenChange(false)
      }, 3000)
    }
  }

  const renderDestinationInput = () => (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label htmlFor="destination" className="text-xs font-medium text-gray-700">Destination</Label>
        <div className="relative">
          <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="destination"
            placeholder="Entrez votre destination"
            value={bookingData.destination}
            onChange={(e) => updateBookingData('destination', e.target.value)}
            className="pl-10 h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Airport Shuttle Option */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => updateBookingData('destination', 'Aéroport International Blaise Diagne (AIBD)')}
        className="w-full justify-start h-8 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <Plane className="h-3 w-3 mr-2" />
        Navette aéroport
      </Button>
    </div>
  )

  const renderLocationAndDateTime = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <h3 className="font-medium text-gray-900 text-sm">Itinéraire</h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setUseMapView(!useMapView)}
          className="text-xs text-blue-600 hover:text-blue-800 h-6 px-2"
        >
          {useMapView ? 'Saisie manuelle' : 'Voir la carte'}
        </Button>
      </div>
      
      <div className="space-y-3">
        {useMapView ? (
          /* Map View */
          <div className="space-y-3">
            <BookingMapSelector
              pickupLocation={bookingData.pickupLocation}
              destination={selectedService === "course" ? bookingData.destination : ""}
              onPickupChange={(location) => updateBookingData('pickupLocation', location)}
              onDestinationChange={selectedService === "course" ? (location) => updateBookingData('destination', location) : undefined}
              height="200px"
              showDestination={selectedService === "course"}
            />
            {/* Show service-specific information for hourly and rental services in map view */}
            {(selectedService === "hourly" || selectedService === "rental") && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    {selectedService === "hourly" ? (
                      <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                    ) : (
                      <Timer className="h-4 w-4 text-blue-600 mt-0.5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                      {selectedService === "hourly" ? "Location à l'heure" : "Location longue durée"}
                    </h4>
                    <p className="text-xs text-blue-700">
                      {selectedService === "hourly" 
                        ? "Le chauffeur vous accompagnera selon vos besoins. Seul le point de départ est requis."
                        : "Véhicule avec chauffeur pour une durée prolongée. Le chauffeur gère tous les déplacements."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Manual Input View */
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="pickup" className="text-xs font-medium text-gray-700">Point de départ</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="pickup"
                  placeholder="Adresse de départ"
                  value={bookingData.pickupLocation}
                  onChange={(e) => updateBookingData('pickupLocation', e.target.value)}
                  className="pl-10 h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Show destination input only for "course" service */}
            {selectedService === "course" && renderDestinationInput()}
            
            {/* Show service-specific information for hourly and rental services */}
            {(selectedService === "hourly" || selectedService === "rental") && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    {selectedService === "hourly" ? (
                      <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                    ) : (
                      <Timer className="h-4 w-4 text-blue-600 mt-0.5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                      {selectedService === "hourly" ? "Location à l'heure" : "Location longue durée"}
                    </h4>
                    <p className="text-xs text-blue-700">
                      {selectedService === "hourly" 
                        ? "Le chauffeur vous accompagnera selon vos besoins. Seul le point de départ est requis."
                        : "Véhicule avec chauffeur pour une durée prolongée. Le chauffeur gère tous les déplacements."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  )

  const renderDateAndTime = () => (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-900 text-sm mb-2">Date et heure</h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="date" className="text-xs font-medium text-gray-700">Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="date"
              type="date"
              value={bookingData.date}
              onChange={(e) => updateBookingData('date', e.target.value)}
              className="pl-10 h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="time" className="text-xs font-medium text-gray-700">Heure</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="time"
              type="time"
              value={bookingData.time}
              onChange={(e) => updateBookingData('time', e.target.value)}
              className="pl-10 h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderPassengersAndVehicle = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Users className="h-4 w-4 text-green-600" />
        <h3 className="font-medium text-gray-900 text-sm">Détails du voyage</h3>
      </div>
      
      <div className="space-y-4">
        {renderDateAndTime()}
        <div className="space-y-2">
          <Label htmlFor="passengers" className="text-sm font-medium text-gray-700">Nombre de passagers</Label>
          <Select value={bookingData.passengers} onValueChange={(value) => updateBookingData('passengers', value)}>
            <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <Users className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sélectionnez" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} passager{num > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-700">Type de véhicule</Label>
          <div className="grid grid-cols-2 gap-2">
            {VEHICLE_TYPES.map((vehicle) => {
              const IconComponent = vehicle.icon
              const isSelected = bookingData.vehicleType === vehicle.value
              return (
                <Card 
                  key={vehicle.value} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-sm border ${
                    isSelected 
                      ? 'ring-1 ring-blue-500 bg-blue-50 border-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateBookingData('vehicleType', vehicle.value)}
                >
                  <CardContent className="p-2">
                    <div className="flex flex-col items-center text-center space-y-1">
                      <IconComponent className={`h-4 w-4 ${
                        isSelected ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                      <span className={`font-medium text-xs leading-tight ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>{vehicle.label}</span>
                      {isSelected && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
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
      </div>
    </div>
  )

  const renderHourlyOptions = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Clock className="h-4 w-4 text-green-600" />
        <h3 className="font-medium text-gray-900 text-sm">Durée de location</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-1 p-2 bg-green-50 rounded border border-green-200">
          <Label htmlFor="duration" className="text-xs font-medium text-green-900">Nombre d'heures</Label>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const current = parseInt(bookingData.hourlyDuration) || 1
                if (current > 1) updateBookingData('hourlyDuration', (current - 1).toString())
              }}
              className="h-8 w-8 p-0 border-green-300 text-green-600 hover:bg-green-100"
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
              className="h-8 text-center border-green-300 focus:border-green-500 focus:ring-green-500 bg-white text-xs w-16"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const current = parseInt(bookingData.hourlyDuration) || 1
                if (current < 24) updateBookingData('hourlyDuration', (current + 1).toString())
              }}
              className="h-8 w-8 p-0 border-green-300 text-green-600 hover:bg-green-100"
            >
              +
            </Button>
            <span className="text-xs text-green-700">heure(s)</span>
          </div>
          <p className="text-xs text-green-700 mt-2">
            Prix: {parseInt(bookingData.hourlyDuration) * 8000} FCFA
          </p>
        </div>
      </div>
    </div>
  )

  const renderRentalOptions = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Timer className="h-4 w-4 text-purple-600" />
        <h3 className="font-medium text-gray-900 text-sm">Options de location</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-700">Type de location</Label>
          <div className="grid grid-cols-1 gap-2">
            {RENTAL_TYPES.filter(rental => rental.value !== 'hourly').map((rental) => {
              const isSelected = bookingData.rentalType === rental.value
              return (
                <Card 
                  key={rental.value} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-sm border ${
                    isSelected 
                      ? 'ring-1 ring-purple-500 bg-purple-50 border-purple-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateBookingData('rentalType', rental.value)}
                >
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Timer className={`h-4 w-4 ${
                          isSelected ? 'text-purple-600' : 'text-gray-600'
                        }`} />
                        <div>
                          <span className={`font-medium text-xs block ${
                            isSelected ? 'text-purple-900' : 'text-gray-900'
                          }`}>{rental.label}</span>
                          <p className={`text-xs ${
                            isSelected ? 'text-purple-700' : 'text-gray-600'
                          }`}>{rental.price}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-3 h-3 bg-purple-600 rounded-full flex items-center justify-center">
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
        
        {bookingData.rentalType === 'hourly' && (
           <div className="space-y-1 p-2 bg-purple-50 rounded border border-purple-200">
             <Label htmlFor="duration" className="text-xs font-medium text-purple-900">Durée (en heures)</Label>
             <div className="flex items-center space-x-2">
               <Button
                 type="button"
                 variant="outline"
                 size="sm"
                 onClick={() => {
                   const current = parseInt(bookingData.hourlyDuration) || 1
                   if (current > 1) updateBookingData('hourlyDuration', (current - 1).toString())
                 }}
                 className="h-8 w-8 p-0 border-purple-300 text-purple-600 hover:bg-purple-100"
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
                 className="h-8 text-center border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-white text-xs w-16"
               />
               <Button
                 type="button"
                 variant="outline"
                 size="sm"
                 onClick={() => {
                   const current = parseInt(bookingData.hourlyDuration) || 1
                   if (current < 24) updateBookingData('hourlyDuration', (current + 1).toString())
                 }}
                 className="h-8 w-8 p-0 border-purple-300 text-purple-600 hover:bg-purple-100"
               >
                 +
               </Button>
               <span className="text-xs text-purple-700">heure(s)</span>
             </div>
           </div>
         )}
         
         {(bookingData.rentalType === 'daily' || bookingData.rentalType === 'weekly') && (
           <div className="space-y-3">
             <div className="space-y-1 p-2 bg-purple-50 rounded border border-purple-200">
               <Label htmlFor="dailyDuration" className="text-xs font-medium text-purple-900">
                 {bookingData.rentalType === 'daily' ? 'Nombre de jours' : 'Nombre de semaines'}
               </Label>
               <div className="flex items-center space-x-2">
                 <Button
                   type="button"
                   variant="outline"
                   size="sm"
                   onClick={() => {
                     const current = parseInt(bookingData.dailyDuration) || 1
                     if (current > 1) updateBookingData('dailyDuration', (current - 1).toString())
                   }}
                   className="h-8 w-8 p-0 border-purple-300 text-purple-600 hover:bg-purple-100"
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
                   className="h-8 text-center border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-white text-xs w-16"
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
                   className="h-8 w-8 p-0 border-purple-300 text-purple-600 hover:bg-purple-100"
                 >
                   +
                 </Button>
                 <span className="text-xs text-purple-700">
                   {bookingData.rentalType === 'daily' ? 'jour(s)' : 'semaine(s)'}
                 </span>
               </div>
               <p className="text-xs text-purple-700 mt-2">
                 Prix: {parseInt(bookingData.dailyDuration) * (bookingData.rentalType === 'daily' ? 45000 : 280000)} FCFA
               </p>
             </div>
             
             <div className="space-y-2 p-2 bg-purple-50 rounded border border-purple-200">
               <Label className="text-xs font-medium text-purple-900">Options supplémentaires</Label>
             <div className="flex items-center space-x-2">
               <input
                  type="checkbox"
                  id="withDriver"
                  checked={bookingData.withDriver}
                  onChange={(e) => updateBookingData('withDriver', e.target.checked)}
                  className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                />
               <Label htmlFor="withDriver" className="text-xs text-purple-900 cursor-pointer">
                 Avec chauffeur
               </Label>
             </div>
             <p className="text-xs text-purple-700">
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

  const renderContactForm = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <User className="h-4 w-4 text-orange-600" />
        <h3 className="font-medium text-gray-900 text-sm">Informations de contact</h3>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">Prénom</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="firstName"
                placeholder="Votre prénom"
                value={bookingData.firstName}
                onChange={(e) => updateBookingData('firstName', e.target.value)}
                className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Nom</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="lastName"
                placeholder="Votre nom"
                value={bookingData.lastName}
                onChange={(e) => updateBookingData('lastName', e.target.value)}
                className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Téléphone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              placeholder="+221 33 801 82 82"
              value={bookingData.phone}
              onChange={(e) => updateBookingData('phone', e.target.value)}
              className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email (optionnel)</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={bookingData.email}
              onChange={(e) => updateBookingData('email', e.target.value)}
              className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        animationVariant="elegant"
        className="max-w-md mx-auto h-screen md:h-[95vh] md:max-h-[800px] p-0 overflow-hidden md:rounded-xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm"
      >
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
            <div className="px-4 pt-4 pb-2 relative">
              <button
                onClick={() => onOpenChange(false)}
                className="absolute left-4 top-4 p-2 hover:bg-gray-100/80 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Fermer"
              >
                <X className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 text-center mb-3 pr-12 animate-in fade-in-0 slide-in-from-top-2 duration-300">Réserver votre transport</h2>
            </div>
            
            {/* Enhanced Step Progress - only show if service is selected */}
            {selectedService && (
              <div className="px-4 pb-3 animate-in fade-in-0 slide-in-from-top-1 duration-300 delay-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">{steps[currentStep]?.title}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{currentStep + 1} / {maxSteps}</span>
                </div>
                <div className="w-full bg-gray-200/70 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out shadow-sm" 
                    style={{ width: `${((currentStep + 1) / maxSteps) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Content */}
          <div className="flex-1 p-4 bg-gradient-to-b from-gray-50/50 to-gray-100/30">
            <div className="h-full flex flex-col justify-center animate-in fade-in-0 slide-in-from-bottom-2 duration-400 delay-200">
              {renderCurrentStepContent()}
            </div>
          </div>

          {/* Enhanced Footer with Navigation */}
          <div className="p-4 border-t border-gray-200/50 bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button 
                  onClick={prevStep}
                  variant="outline"
                  className="flex-1 h-12 text-base font-medium"
                >
                  Précédent
                </Button>
              )}
              
              {currentStep === 0 ? (
                // Service selection step - no next button needed as selection triggers next step
                null
              ) : currentStep < maxSteps - 1 ? (
                <Button 
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-[#1E5EFF] to-[#4A90E2] hover:from-[#1E5EFF]/90 hover:to-[#4A90E2]/90 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Suivant
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-[#1E5EFF] to-[#4A90E2] hover:from-[#1E5EFF]/90 hover:to-[#4A90E2]/90 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Form Result - Displayed after form submission */}
            {simulationResult && (
              <div className={`${simulationResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4 mt-6 mx-6`}>
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