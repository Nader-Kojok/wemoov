import * as React from 'react'
import { Button } from '@/components/ui/button'
import HeroBookingTabs from '@/components/HeroBookingTabs'
import HeroBookingModal from '@/components/HeroBookingModal'
import { Car, Shield, Clock, Star, Play, Users, MapPin } from 'lucide-react'

const Hero = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false)
  const [bookingData, setBookingData] = React.useState<any>(null)
  const [serviceType, setServiceType] = React.useState('')
  const [currentFeature, setCurrentFeature] = React.useState(0)

  const features = [
    {
      title: "Réservation Instantanée",
      description: "Réservez votre course en quelques clics",
      icon: <Car className="h-8 w-8 text-white" />
    },
    {
      title: "Chauffeurs Professionnels",
      description: "Équipe expérimentée et certifiée",
      icon: <Users className="h-8 w-8 text-white" />
    },
    {
      title: "Service 24/7",
      description: "Disponible à tout moment",
      icon: <Clock className="h-8 w-8 text-white" />
    }
  ]

  const handleContinueBooking = (selectedServiceType: string, formData: any) => {
    setServiceType(selectedServiceType)
    setBookingData(formData)
    setIsBookingModalOpen(true)
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <section id="home" className="relative min-h-screen bg-gradient-to-br from-white via-[#E8EFFF] to-[#B8C5FF]/30 overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#1E5EFF]/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#B8C5FF]/20 rounded-full blur-xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-[#1E5EFF]/15 rounded-full blur-xl animate-pulse delay-500" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 sm:pt-36 lg:pt-32 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-[calc(100vh-6rem)] sm:min-h-[calc(100vh-7rem)] lg:min-h-screen">
            {/* Left Side - Hero Text and Visual */}
            <div className="lg:col-span-5 order-2 lg:order-1 space-y-6">
              {/* Hero Text with Compact Typography */}
               <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-black leading-[0.85] text-[#2D2D2D]">
                    <span className="block">Transport <span className="text-[#1E5EFF]">Premium</span></span>
                    <span className="block text-2xl md:text-3xl font-light text-[#2D2D2D]/70">
                      au Sénégal
                    </span>
                  </h1>
                </div>
              
              <div className="relative max-w-lg mx-auto">
                {/* Main Hero Image */}
                <div className="relative">
                  <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#E8EFFF] to-[#B8C5FF]/50 p-8">
                    <img 
                      src="/hero_image.png" 
                      alt="Luxury VTC Car" 
                      className="w-full h-full object-cover rounded-2xl shadow-2xl"
                    />
                  </div>
                  
                  {/* Floating Feature Cards */}
                  <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-[#1E5EFF]/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#1E5EFF] rounded-full flex items-center justify-center">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-[#2D2D2D]">4.9★</div>
                        <div className="text-xs text-[#2D2D2D]/70">500+ avis</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-[#1E5EFF]/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#2D2D2D] rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#2D2D2D]">Dakar</div>
                        <div className="text-xs text-[#2D2D2D]/70">Couverture complète</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Animated Feature Showcase */}
                <div className="mt-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#1E5EFF]/10">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#1E5EFF] rounded-full flex items-center justify-center transition-all duration-500">
                      {features[currentFeature].icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#2D2D2D] transition-all duration-500">
                        {features[currentFeature].title}
                      </h3>
                      <p className="text-sm text-[#2D2D2D]/70 transition-all duration-500">
                        {features[currentFeature].description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Indicators */}
                  <div className="flex space-x-2 mt-4">
                    {features.map((_, index) => (
                      <div 
                        key={index}
                        className={`h-1 rounded-full transition-all duration-500 ${
                          index === currentFeature ? 'bg-[#1E5EFF] w-8' : 'bg-[#1E5EFF]/20 w-2'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Form */}
            <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">
              {/* Hero Booking Tabs */}
              <div className="mt-8">
                <HeroBookingTabs onContinue={handleContinueBooking} />
              </div>
              
              {/* Secondary CTA */}
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="group border-2 border-[#1E5EFF]/30 text-[#2D2D2D] hover:bg-[#1E5EFF] hover:text-white hover:border-[#1E5EFF] px-8 py-4 text-lg font-semibold backdrop-blur-sm bg-white/90 transition-all duration-300"
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Voir la démo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                 <div className="flex items-center space-x-2">
                   <Shield className="h-5 w-5 text-[#1E5EFF]" />
                   <span className="text-sm font-medium text-[#2D2D2D]/70">100% Sécurisé</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <Clock className="h-5 w-5 text-[#1E5EFF]" />
                   <span className="text-sm font-medium text-[#2D2D2D]/70">Service 24/7</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Booking Modal */}
      {bookingData && (
        <HeroBookingModal 
          open={isBookingModalOpen} 
          onOpenChange={setIsBookingModalOpen}
          serviceType={serviceType}
          initialData={bookingData}
        />
      )}
    </>
  )
}

export default Hero