import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Carousel } from '@/components/ui/carousel'
import { BookingModal } from '@/components/BookingModal'
import { Car, Shield, Clock, Star, Phone } from 'lucide-react'

const Hero = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false)

  const stats = [
    {
      number: '500+',
      label: 'Clients satisfaits',
      icon: <Star className="h-6 w-6" />
    },
    {
      number: '24/7',
      label: 'Service disponible',
      icon: <Clock className="h-6 w-6" />
    },
    {
      number: '4.9★',
      label: 'Note moyenne',
      icon: <Shield className="h-6 w-6" />
    }
  ]

  // Images pour le carousel (vous pouvez remplacer par de vraies URLs d'images)
  const carouselImages = [
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Voiture de luxe
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Aéroport
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Ville de Dakar
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'  // Route
  ]

  return (
    <>
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Carousel */}
        <div className="absolute inset-0 z-0">
          <Carousel 
            images={carouselImages}
            autoPlay={true}
            interval={6000}
            showControls={false}
            className="w-full h-full"
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 z-10" />

        {/* Content */}
        <div className="relative z-20 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex justify-center items-center">
              {/* Main Content */}
              <div className="space-y-8 text-white text-center max-w-4xl">
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                    VTC Dakar
                    <span className="block text-[#FFD700]">Service Premium</span>
                  </h1>
                  <p className="text-xl text-gray-200 leading-relaxed">
                    Transport avec chauffeur professionnel au Sénégal. 
                    Sécurisé, confortable et disponible 24h/24.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => setIsBookingModalOpen(true)}
                    className="bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Car className="mr-2 h-5 w-5" />
                    Réserver maintenant
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-2 border-white text-white hover:bg-white hover:text-[#1E5EFF] px-8 py-4 text-lg font-semibold backdrop-blur-sm bg-white/10 transition-all duration-300"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    +221 XX XXX XX XX
                  </Button>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-4">
                      <div className="flex justify-center mb-2 text-[#FFD700]">
                        {stat.icon}
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                      <div className="text-sm text-gray-200">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal 
        open={isBookingModalOpen} 
        onOpenChange={setIsBookingModalOpen} 
      />
    </>
  )
}

export default Hero