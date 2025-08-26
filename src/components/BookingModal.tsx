import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, Clock, Users, Phone, Mail, User, Navigation, ArrowUpDown, Target, Map } from "lucide-react"
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
}

const STEPS = [
  { id: 1, title: "Type de service", description: "Choisissez votre service" },
  { id: 2, title: "Itinéraire", description: "Définissez votre trajet" },
  { id: 3, title: "Date & Heure", description: "Planifiez votre voyage" },
  { id: 4, title: "Détails", description: "Informations du voyage" },
  { id: 5, title: "Contact", description: "Vos coordonnées" },
  { id: 6, title: "Confirmation", description: "Récapitulatif" }
]

const SERVICE_TYPES = [
  { value: "airport", label: "Navette Aéroport", icon: "✈️", price: "15 000 FCFA" },
  { value: "city", label: "Course en ville", icon: "🏙️", price: "À partir de 2 000 FCFA" },
  { value: "intercity", label: "Voyage inter-ville", icon: "🛣️", price: "Sur devis" },
  { value: "hourly", label: "Location à l'heure", icon: "⏰", price: "8 000 FCFA/h" },
  { value: "event", label: "Événement", icon: "🎉", price: "Sur devis" }
]

const VEHICLE_TYPES = [
  { value: "sedan", label: "Berline (1-3 passagers)", icon: "🚗" },
  { value: "suv", label: "SUV (1-6 passagers)", icon: "🚙" },
  { value: "van", label: "Van (1-8 passagers)", icon: "🚐" },
  { value: "luxury", label: "Véhicule de luxe", icon: "🏎️" }
]

export const BookingModal: React.FC<BookingModalProps> = ({ open, onOpenChange }) => {
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
    specialRequests: ""
  })

  // Géolocalisation automatique
  React.useEffect(() => {
    if (open && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          // Ici vous pourriez utiliser une API de géocodage inverse
          setBookingData(prev => ({
            ...prev,
            pickupLocation: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }))
        },
        (error) => {
          console.log("Géolocalisation non disponible:", error)
        }
      )
    }
  }, [open])

  // Fonction pour obtenir la position actuelle
  const getCurrentLocation = (field: 'pickupLocation' | 'destination') => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          updateBookingData(field, `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        },
        () => {
          alert("Impossible d'obtenir votre position. Veuillez vérifier vos paramètres de géolocalisation.")
        }
      )
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.")
    }
  }

  // Fonction pour échanger les positions
  const swapLocations = () => {
    const pickup = bookingData.pickupLocation
    const destination = bookingData.destination
    setBookingData(prev => ({
      ...prev,
      pickupLocation: destination,
      destination: pickup
    }))
  }

  const updateBookingData = (field: keyof BookingData, value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      // Validation des données requises
      const requiredFields = {
        serviceType: bookingData.serviceType,
        pickupLocation: bookingData.pickupLocation,
        destination: bookingData.destination,
        date: bookingData.date,
        time: bookingData.time,
        passengers: bookingData.passengers,
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        phone: bookingData.phone
      }

      // Vérifier que tous les champs requis sont remplis
      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value || value.toString().trim() === '')
        .map(([key]) => key)

      if (missingFields.length > 0) {
        alert(`Veuillez remplir tous les champs requis: ${missingFields.join(', ')}`)
        return
      }

      // Préparer les données pour l'API
      const bookingPayload = {
        serviceType: bookingData.serviceType,
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
        email: bookingData.email
      }

      console.log("Envoi de la réservation:", bookingPayload)

      // Envoyer la réservation à l'API publique
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
        // Réinitialiser le formulaire
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
          specialRequests: ''
        })
        onOpenChange(false)
        setCurrentStep(1)
      } else {
        throw new Error(result.error?.message || 'Erreur lors de la création de la réservation')
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      alert(`Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {SERVICE_TYPES.map((service) => (
                <Card 
                  key={service.value} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    bookingData.serviceType === service.value ? 'ring-2 ring-[#1E5EFF] bg-[#E8EFFF]' : ''
                  }`}
                  onClick={() => updateBookingData('serviceType', service.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{service.icon}</span>
                        <div>
                          <h3 className="font-semibold">{service.label}</h3>
                          <p className="text-sm text-gray-600">{service.price}</p>
                        </div>
                      </div>
                      {bookingData.serviceType === service.value && (
                        <div className="w-4 h-4 bg-[#1E5EFF] rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            {useMapView ? (
              /* Map View - Default */
              <div className="space-y-4">
                <BookingMapSelector
                  pickupLocation={bookingData.pickupLocation}
                  destination={bookingData.destination}
                  onPickupChange={(location) => updateBookingData('pickupLocation', location)}
                  onDestinationChange={(location) => updateBookingData('destination', location)}
                  height="350px"
                />
                
                {/* Option to switch to manual input */}
                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setUseMapView(false)}
                    className="text-gray-600 hover:text-[#1E5EFF] text-xs"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Préférez saisir manuellement ?
                  </Button>
                </div>
              </div>
            ) : (
              /* Manual Input View - Secondary */
              <div className="space-y-4">
                {/* Back to map option */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Saisie manuelle</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUseMapView(true)}
                    className="text-[#1E5EFF] border-[#1E5EFF] hover:bg-[#E8EFFF]"
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Retour à la carte
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pickup">Point de départ</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="pickup"
                        placeholder="Adresse de départ ou coordonnées (lat, lng)"
                        value={bookingData.pickupLocation}
                        onChange={(e) => updateBookingData('pickupLocation', e.target.value)}
                        className="pl-10 pr-4"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => getCurrentLocation('pickupLocation')}
                      className="shrink-0"
                      title="Utiliser ma position actuelle"
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Bouton d'échange */}
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={swapLocations}
                    className="text-[#1E5EFF] hover:text-[#1E5EFF]/80 hover:bg-[#E8EFFF]"
                    disabled={!bookingData.pickupLocation && !bookingData.destination}
                    title="Échanger départ et destination"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Échanger
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="destination"
                        placeholder="Adresse de destination ou coordonnées (lat, lng)"
                        value={bookingData.destination}
                        onChange={(e) => updateBookingData('destination', e.target.value)}
                        className="pl-10 pr-4"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => getCurrentLocation('destination')}
                      className="shrink-0"
                      title="Utiliser ma position actuelle"
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Suggestions rapides */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Destinations populaires</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateBookingData('destination', 'Aéroport International Blaise Diagne (AIBD)')}
                      className="text-xs h-8"
                    >
                      ✈️ Aéroport AIBD
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateBookingData('destination', 'Plateau, Dakar')}
                      className="text-xs h-8"
                    >
                      🏢 Plateau
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateBookingData('destination', 'Almadies, Dakar')}
                      className="text-xs h-8"
                    >
                      🏖️ Almadies
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateBookingData('destination', 'Gare routière Pompiers, Dakar')}
                      className="text-xs h-8"
                    >
                      🚌 Gare Pompiers
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="date"
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => updateBookingData('date', e.target.value)}
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Heure</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="time"
                    type="time"
                    value={bookingData.time}
                    onChange={(e) => updateBookingData('time', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passengers">Nombre de passagers</Label>
              <Select value={bookingData.passengers} onValueChange={(value) => updateBookingData('passengers', value)}>
                <SelectTrigger>
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
              <Label>Type de véhicule</Label>
              <div className="grid grid-cols-1 gap-2">
                {VEHICLE_TYPES.map((vehicle) => (
                  <Card 
                    key={vehicle.value} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      bookingData.vehicleType === vehicle.value ? 'ring-2 ring-[#1E5EFF] bg-[#E8EFFF]' : ''
                    }`}
                    onClick={() => updateBookingData('vehicleType', vehicle.value)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{vehicle.icon}</span>
                          <span className="font-medium">{vehicle.label}</span>
                        </div>
                        {bookingData.vehicleType === vehicle.value && (
                          <div className="w-4 h-4 bg-[#1E5EFF] rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    placeholder="Votre prénom"
                    value={bookingData.firstName}
                    onChange={(e) => updateBookingData('firstName', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="lastName"
                    placeholder="Votre nom"
                    value={bookingData.lastName}
                    onChange={(e) => updateBookingData('lastName', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  placeholder="+221 XX XXX XX XX"
                  value={bookingData.phone}
                  onChange={(e) => updateBookingData('phone', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (optionnel)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={bookingData.email}
                  onChange={(e) => updateBookingData('email', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        )

      case 6:
        const selectedService = SERVICE_TYPES.find(s => s.value === bookingData.serviceType)
        const selectedVehicle = VEHICLE_TYPES.find(v => v.value === bookingData.vehicleType)
        
        return (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-lg">Récapitulatif de votre réservation</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{selectedService?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Départ:</span>
                    <span className="font-medium">{bookingData.pickupLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Destination:</span>
                    <span className="font-medium">{bookingData.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Heure:</span>
                    <span className="font-medium">{bookingData.date} à {bookingData.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passagers:</span>
                    <span className="font-medium">{bookingData.passengers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Véhicule:</span>
                    <span className="font-medium">{selectedVehicle?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-medium">{bookingData.firstName} {bookingData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Téléphone:</span>
                    <span className="font-medium">{bookingData.phone}</span>
                  </div>
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Prix estimé:</span>
                    <span className="font-bold text-[#1E5EFF] text-lg">{selectedService?.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Réserver votre transport</DialogTitle>
          <DialogDescription>
            {STEPS[currentStep - 1]?.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex items-center space-x-2 mb-6">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= step.id 
                  ? 'bg-[#1E5EFF] text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step.id}
              </div>
              {index < STEPS.length - 1 && (
                <div className={`flex-1 h-1 rounded ${
                  currentStep > step.id ? 'bg-[#1E5EFF]' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 1}
          >
            Précédent
          </Button>
          
          {currentStep === STEPS.length ? (
            <Button 
              onClick={handleSubmit}
              className="bg-[#1E5EFF] hover:bg-[#1E5EFF]/90"
            >
              Confirmer la réservation
            </Button>
          ) : (
            <Button 
              onClick={nextStep}
              className="bg-[#1E5EFF] hover:bg-[#1E5EFF]/90"
            >
              Suivant
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}