import * as React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Clock, Users, Phone, Mail, User, Target, Car, Plane, Timer } from "lucide-react"
import BookingMapSelector from './BookingMapSelector'

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

export const BookingModal: React.FC<BookingModalProps> = ({ open, onOpenChange }) => {
  const [activeTab, setActiveTab] = React.useState("course")
  const [currentStep, setCurrentStep] = React.useState(1)
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
    rentalType: ""
  })

  const getStepsForTab = (tab: string) => {
    switch (tab) {
      case "course":
        return [
          { id: 1, title: "Itinéraire", component: "location" },
          { id: 2, title: "Détails", component: "details" },
          { id: 3, title: "Contact", component: "contact" }
        ]
      case "hourly":
      case "rental":
        return [
          { id: 1, title: "Itinéraire", component: "location" },
          { id: 2, title: "Options", component: "rental" },
          { id: 3, title: "Détails", component: "details" },
          { id: 4, title: "Contact", component: "contact" }
        ]
      default:
        return []
    }
  }

  const steps = getStepsForTab(activeTab)
  const maxSteps = steps.length

  const nextStep = () => {
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleTabChange = (newTab: string) => {
     setActiveTab(newTab)
     setCurrentStep(1)
   }
 
   const renderCurrentStepContent = () => {
     const currentStepInfo = steps[currentStep - 1]
     if (!currentStepInfo) return null
 
     switch (currentStepInfo.component) {
       case "location":
         return renderLocationAndDateTime()
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
 
   const updateBookingData = (field: keyof BookingData, value: string) => {
     setBookingData(prev => ({ ...prev, [field]: value }))
   }

  const handleSubmit = async () => {
    try {
      const requiredFields = {
        pickupLocation: bookingData.pickupLocation,
        destination: activeTab === "course" ? bookingData.destination : "",
        date: bookingData.date,
        time: bookingData.time,
        passengers: bookingData.passengers,
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        phone: bookingData.phone
      }

      const missingFields = Object.entries(requiredFields)
        .filter(([, value]) => !value || value.toString().trim() === '')
        .map(([key]) => key)

      if (missingFields.length > 0) {
        alert(`Veuillez remplir tous les champs requis: ${missingFields.join(', ')}`)
        return
      }

      let serviceType = activeTab
      if (activeTab === "course" && bookingData.destination.toLowerCase().includes("aéroport")) {
        serviceType = "airport"
      }

      const bookingPayload = {
        serviceType,
        pickupLocation: bookingData.pickupLocation,
        destination: bookingData.destination,
        scheduledDate: bookingData.date,
        scheduledTime: bookingData.time,
        passengers: parseInt(bookingData.passengers),
        vehicleType: bookingData.vehicleType || 'SEDAN',
        specialRequests: bookingData.specialRequests,
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        phone: bookingData.phone,
        email: bookingData.email,
        rentalDuration: bookingData.rentalDuration,
        rentalType: bookingData.rentalType
      }

      const response = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingPayload)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert('Réservation créée avec succès! Vous serez contacté prochainement.')
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
          rentalType: ''
        })
        onOpenChange(false)
      } else {
        throw new Error(result.error?.message || 'Erreur lors de la création de la réservation')
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      alert(`Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`)
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
              destination={bookingData.destination}
              onPickupChange={(location) => updateBookingData('pickupLocation', location)}
              onDestinationChange={(location) => updateBookingData('destination', location)}
              height="200px"
            />
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

            {activeTab === "course" && renderDestinationInput()}
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
            {RENTAL_TYPES.map((rental) => {
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
             <Select value={bookingData.rentalDuration} onValueChange={(value) => updateBookingData('rentalDuration', value)}>
               <SelectTrigger className="h-8 border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-white text-xs">
                 <Clock className="h-3 w-3 mr-1 text-purple-600" />
                 <SelectValue placeholder="Sélectionnez" />
               </SelectTrigger>
               <SelectContent>
                 {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((hours) => (
                   <SelectItem key={hours} value={hours.toString()}>
                     {hours}h
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
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
              placeholder="+221 XX XXX XX XX"
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
      <DialogContent className="max-w-md mx-auto h-[95vh] max-h-[800px] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Compact Header with Tabs */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-4 pt-4 pb-2">
              <h2 className="text-lg font-semibold text-gray-900 text-center mb-3">Réserver votre transport</h2>
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-gray-50">
                  <TabsTrigger value="course" className="flex flex-col items-center py-2 px-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600">
                    <Car className="h-4 w-4 mb-1" />
                    <span className="font-medium leading-tight">Commander</span>
                  </TabsTrigger>
                  <TabsTrigger value="hourly" className="flex flex-col items-center py-2 px-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600">
                    <Clock className="h-4 w-4 mb-1" />
                    <span className="font-medium leading-tight">Par heure</span>
                  </TabsTrigger>
                  <TabsTrigger value="rental" className="flex flex-col items-center py-2 px-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600">
                    <Timer className="h-4 w-4 mb-1" />
                    <span className="font-medium leading-tight">Location</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Step Progress */}
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">{steps[currentStep - 1]?.title}</span>
                <span className="text-xs text-gray-500">{currentStep} / {maxSteps}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${(currentStep / maxSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 bg-gray-50">
            <div className="h-full flex flex-col justify-center">
              {renderCurrentStepContent()}
            </div>
          </div>

          {/* Footer with Navigation */}
          <div className="p-4 border-t bg-white shadow-lg">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button 
                  onClick={prevStep}
                  variant="outline"
                  className="flex-1 h-12 text-base font-medium"
                >
                  Précédent
                </Button>
              )}
              
              {currentStep < maxSteps ? (
                <Button 
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-[#1E5EFF] to-[#4A90E2] hover:from-[#1E5EFF]/90 hover:to-[#4A90E2]/90 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Suivant
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-[#1E5EFF] to-[#4A90E2] hover:from-[#1E5EFF]/90 hover:to-[#4A90E2]/90 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Confirmer la réservation
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}