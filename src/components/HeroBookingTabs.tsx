import * as React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Target, Calendar, Clock, Car, Timer, ArrowRight, Plane } from 'lucide-react'
import BookingMapSelector from './BookingMapSelector'

interface HeroBookingTabsProps {
  onContinue: (serviceType: string, formData: any) => void
}

interface FormData {
  pickupLocation: string
  destination: string
  date: string
  time: string
  passengers: string
  hourlyDuration: string
  rentalType: string
  dailyDuration: string
}

const HeroBookingTabs: React.FC<HeroBookingTabsProps> = ({ onContinue }) => {
  const [activeTab, setActiveTab] = React.useState('course')
  const [useMapView, setUseMapView] = React.useState(true)
  const [formData, setFormData] = React.useState<FormData>({
    pickupLocation: '',
    destination: '',
    date: '',
    time: '',
    passengers: '1',
    hourlyDuration: '2',
    rentalType: 'daily',
    dailyDuration: '1'
  })

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleContinue = () => {
    // Validation basique
    if (!formData.pickupLocation.trim()) {
      alert('Veuillez saisir un point de départ')
      return
    }
    
    if (activeTab === 'course' && !formData.destination.trim()) {
      alert('Veuillez saisir une destination')
      return
    }
    
    if (!formData.date || !formData.time) {
      alert('Veuillez sélectionner une date et une heure')
      return
    }

    onContinue(activeTab, formData)
  }

  const renderLocationForm = (showDestination: boolean = true) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-[#1E5EFF]" />
          <h3 className="font-medium text-[#2D2D2D] text-sm">Itinéraire</h3>
        </div>
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
        <BookingMapSelector
          pickupLocation={formData.pickupLocation}
          destination={showDestination ? formData.destination : ""}
          onPickupChange={(location) => updateFormData('pickupLocation', location)}
          onDestinationChange={showDestination ? (location) => updateFormData('destination', location) : undefined}
          height="180px"
          showDestination={showDestination}
          showAirportButtons={activeTab === 'course'}
        />
      ) : (
        <div className="space-y-3">
          <div className="space-y-1">
              <Label htmlFor="pickup" className="text-xs font-medium text-[#2D2D2D]/70">Point de départ</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-[#2D2D2D]/40" />
                <Input
                  id="pickup"
                  placeholder="Adresse de départ"
                  value={formData.pickupLocation}
                  onChange={(e) => updateFormData('pickupLocation', e.target.value)}
                  className="pl-10 h-10 text-sm border-[#1E5EFF]/20 focus:border-[#1E5EFF] focus:ring-[#1E5EFF]/20"
                />
              </div>
              {/* Airport Shuttle Button for Pickup */}
              {activeTab === 'course' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateFormData('pickupLocation', 'Aéroport International Blaise Diagne (AIBD)')}
                  className="w-full justify-start h-8 text-xs text-[#1E5EFF] border-[#1E5EFF]/20 hover:bg-[#1E5EFF]/10 mt-1"
                >
                  <Plane className="h-3 w-3 mr-2" />
                  Navette aéroport (départ)
                </Button>
              )}
            </div>

          {showDestination && (
              <div className="space-y-1">
                <Label htmlFor="destination" className="text-xs font-medium text-[#2D2D2D]/70">Destination</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 h-4 w-4 text-[#2D2D2D]/40" />
                  <Input
                    id="destination"
                    placeholder="Entrez votre destination"
                    value={formData.destination}
                    onChange={(e) => updateFormData('destination', e.target.value)}
                    className="pl-10 h-10 text-sm border-[#1E5EFF]/20 focus:border-[#1E5EFF] focus:ring-[#1E5EFF]/20"
                  />
                </div>
                {/* Airport Shuttle Button for Destination */}
                {activeTab === 'course' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateFormData('destination', 'Aéroport International Blaise Diagne (AIBD)')}
                    className="w-full justify-start h-8 text-xs text-[#1E5EFF] border-[#1E5EFF]/20 hover:bg-[#1E5EFF]/10 mt-1"
                  >
                    <Plane className="h-3 w-3 mr-2" />
                    Navette aéroport (arrivée)
                  </Button>
                )}
              </div>
            )}
        </div>
      )}
      
      {/* Date et heure */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="date" className="text-xs font-medium text-[#2D2D2D]/70">Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-[#2D2D2D]/40" />
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => updateFormData('date', e.target.value)}
              className="pl-10 h-10 text-sm border-[#1E5EFF]/20 focus:border-[#1E5EFF] focus:ring-[#1E5EFF]/20"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="time" className="text-xs font-medium text-[#2D2D2D]/70">Heure</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-[#2D2D2D]/40" />
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => updateFormData('time', e.target.value)}
              className="pl-10 h-10 text-sm border-[#1E5EFF]/20 focus:border-[#1E5EFF] focus:ring-[#1E5EFF]/20"
            />
          </div>
        </div>
      </div>
      

    </div>
  )

  const renderHourlyOptions = () => (
    <div className="space-y-3">
      <div className="bg-[#E8EFFF] border border-[#1E5EFF]/20 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Clock className="h-4 w-4 text-[#1E5EFF] mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-[#1E5EFF] mb-1">Location à l'heure</h4>
            <p className="text-xs text-[#1E5EFF]/80">
              Le chauffeur vous accompagnera selon vos besoins. Seul le point de départ est requis.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs font-medium text-[#2D2D2D]/70">Durée (heures)</Label>
        <Select value={formData.hourlyDuration} onValueChange={(value) => updateFormData('hourlyDuration', value)}>
          <SelectTrigger className="h-10 border-[#1E5EFF]/20 focus:border-[#1E5EFF] focus:ring-[#1E5EFF]/20">
            <Timer className="h-4 w-4 mr-2 text-[#2D2D2D]/40" />
            <SelectValue placeholder="Sélectionnez" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((hours) => (
              <SelectItem key={hours} value={hours.toString()}>
                {hours} heure{hours > 1 ? 's' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderRentalOptions = () => (
    <div className="space-y-3">
      <div className="bg-[#E8EFFF] border border-[#1E5EFF]/20 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Timer className="h-4 w-4 text-[#1E5EFF] mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-[#1E5EFF] mb-1">Location longue durée</h4>
            <p className="text-xs text-[#1E5EFF]/80">
              Véhicule avec chauffeur pour une durée prolongée. Le chauffeur gère tous les déplacements.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs font-medium text-[#2D2D2D]/70">Type de location</Label>
        <Select value={formData.rentalType} onValueChange={(value) => updateFormData('rentalType', value)}>
          <SelectTrigger className="h-10 border-[#1E5EFF]/20 focus:border-[#1E5EFF] focus:ring-[#1E5EFF]/20">
            <SelectValue placeholder="Sélectionnez" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">À la journée</SelectItem>
            <SelectItem value="weekly">À la semaine</SelectItem>
            <SelectItem value="monthly">Au mois</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs font-medium text-[#2D2D2D]/70">
          Durée ({formData.rentalType === 'daily' ? 'jours' : formData.rentalType === 'weekly' ? 'semaines' : 'mois'})
        </Label>
        <Select value={formData.dailyDuration} onValueChange={(value) => updateFormData('dailyDuration', value)}>
          <SelectTrigger className="h-10 border-[#1E5EFF]/20 focus:border-[#1E5EFF] focus:ring-[#1E5EFF]/20">
            <Timer className="h-4 w-4 mr-2 text-[#2D2D2D]/40" />
            <SelectValue placeholder="Sélectionnez" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: formData.rentalType === 'monthly' ? 12 : 30 }, (_, i) => i + 1).map((duration) => (
              <SelectItem key={duration} value={duration.toString()}>
                {duration} {formData.rentalType === 'daily' ? (duration > 1 ? 'jours' : 'jour') : 
                          formData.rentalType === 'weekly' ? (duration > 1 ? 'semaines' : 'semaine') : 
                          (duration > 1 ? 'mois' : 'mois')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  return (
    <Card className="bg-white/95 backdrop-blur-sm border border-[#1E5EFF]/20 shadow-xl">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#E8EFFF]/50 border border-[#1E5EFF]/10">
            <TabsTrigger 
              value="course" 
              className="data-[state=active]:bg-[#1E5EFF] data-[state=active]:text-white text-[#2D2D2D] font-medium"
            >
              <Car className="h-4 w-4 mr-2" />
              Course
            </TabsTrigger>
            <TabsTrigger 
              value="hourly" 
              className="data-[state=active]:bg-[#1E5EFF] data-[state=active]:text-white text-[#2D2D2D] font-medium"
            >
              <Clock className="h-4 w-4 mr-2" />
              À l'heure
            </TabsTrigger>
            <TabsTrigger 
              value="rental" 
              className="data-[state=active]:bg-[#1E5EFF] data-[state=active]:text-white text-[#2D2D2D] font-medium"
            >
              <Timer className="h-4 w-4 mr-2" />
              Longue durée
            </TabsTrigger>
          </TabsList>

          <TabsContent value="course" className="mt-6">
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-[#2D2D2D] mb-1">Commander une course</h3>
                <p className="text-sm text-[#2D2D2D]/70">Transport ponctuel d'un point A à un point B</p>
              </div>
              {renderLocationForm(true)}
            </div>
          </TabsContent>

          <TabsContent value="hourly" className="mt-6">
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-[#2D2D2D] mb-1">Location à l'heure</h3>
                <p className="text-sm text-[#2D2D2D]/70">Réservez un chauffeur pour plusieurs heures</p>
              </div>
              {renderLocationForm(false)}
              {renderHourlyOptions()}
            </div>
          </TabsContent>

          <TabsContent value="rental" className="mt-6">
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-[#2D2D2D] mb-1">Location longue durée</h3>
                <p className="text-sm text-[#2D2D2D]/70">Location à la journée, semaine ou plus</p>
              </div>
              {renderLocationForm(false)}
              {renderRentalOptions()}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 pt-4 border-t border-[#1E5EFF]/10">
          <Button 
            onClick={handleContinue}
            className="w-full bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Continuer
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default HeroBookingTabs