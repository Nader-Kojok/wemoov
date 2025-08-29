import * as React from 'react'
import { Car, Users, Shield, Star, CheckCircle, ArrowRight, Truck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Fleet = () => {
  const [selectedCategory, setSelectedCategory] = React.useState('berline')

  const vehicleCategories = [
    { id: 'berline', name: 'Berlines', count: 2, icon: Car },
    { id: 'suv', name: 'SUV', count: 4, icon: Truck },
    { id: 'van', name: 'Vans', count: 3, icon: Users },
    { id: 'luxe', name: 'Luxe', count: 2, icon: Zap }
  ]

  const vehicles = [
    {
      id: 1,
      category: 'berline',
      name: 'Citroen C-Elysee',
      year: 2023,
      image: '/hero_image.png',
      capacity: 4,
      features: ['Climatisation', 'Bluetooth', 'Direction assistée', 'Sécurité'],
      priceRange: '12,000 - 18,000 FCFA',
      rating: 4.6,
      description: 'Économique et fiable pour vos trajets quotidiens'
    },
    {
      id: 2,
      category: 'berline',
      name: 'Peugeot 3008',
      year: 2023,
      image: '/hero_image.png',
      capacity: 5,
      features: ['SUV Compact', 'Climatisation', 'GPS', 'Bluetooth'],
      priceRange: '18,000 - 25,000 FCFA',
      rating: 4.7,
      description: 'SUV compact français alliant style et praticité'
    },
    {
      id: 3,
      category: 'suv',
      name: 'Hyundai TUCSON',
      year: 2023,
      image: '/hero_image.png',
      capacity: 5,
      features: ['4x4', 'Climatisation', 'Sièges cuir', 'Système multimédia'],
      priceRange: '22,000 - 30,000 FCFA',
      rating: 4.8,
      description: 'SUV moderne avec technologie avancée'
    },
    {
      id: 4,
      category: 'suv',
      name: 'Pajero Sport',
      year: 2023,
      image: '/hero_image.png',
      capacity: 7,
      features: ['4x4', 'Robustesse', '7 places', 'Climatisation'],
      priceRange: '25,000 - 35,000 FCFA',
      rating: 4.7,
      description: 'SUV robuste pour tous terrains et familles'
    },
    {
      id: 5,
      category: 'luxe',
      name: 'BMW Série 5',
      year: 2022,
      image: '/hero_image.png',
      capacity: 4,
      features: ['Cuir premium', 'Système audio', 'GPS avancé', 'Confort luxe'],
      priceRange: '45,000 - 65,000 FCFA',
      rating: 4.9,
      description: 'Berline de luxe allemande pour un confort exceptionnel'
    },
    {
      id: 6,
      category: 'luxe',
      name: 'Mercedes Classe V',
      year: 2023,
      image: '/hero_image.png',
      capacity: 7,
      features: ['Luxe', 'Espace VIP', 'Climatisation zones', 'Cuir premium'],
      priceRange: '50,000 - 75,000 FCFA',
      rating: 5.0,
      description: 'Van de luxe pour voyages VIP et groupes premium'
    },
    {
      id: 7,
      category: 'van',
      name: 'Mercedes Sprinter',
      year: 2020,
      image: '/hero_image.png',
      capacity: 12,
      features: ['Grand espace', 'Climatisation', 'USB', 'Bagages'],
      priceRange: '25,000 - 40,000 FCFA',
      rating: 4.6,
      description: 'Van spacieux idéal pour les groupes et événements'
    },
    {
      id: 8,
      category: 'van',
      name: 'Toyota HiAce',
      image: '/hero_image.png',
      capacity: 14,
      features: ['Grande capacité', 'Fiabilité', 'Climatisation', 'Confort'],
      priceRange: '20,000 - 35,000 FCFA',
      rating: 4.5,
      description: 'Minibus fiable pour transport de groupes'
    },
    {
      id: 9,
      category: 'van',
      name: 'Toyota Coaster',
      image: '/hero_image.png',
      capacity: 25,
      features: ['Bus', 'Climatisation', 'Confort groupe', 'Sécurité'],
      priceRange: '30,000 - 50,000 FCFA',
      rating: 4.4,
      description: 'Bus confortable pour grands groupes et excursions'
    },
    {
      id: 10,
      category: 'suv',
      name: 'Toyota RAV4',
      image: '/hero_image.png',
      capacity: 5,
      features: ['4x4', 'Fiabilité Toyota', 'Climatisation', 'Sécurité'],
      priceRange: '20,000 - 28,000 FCFA',
      rating: 4.7,
      description: 'SUV compact fiable et polyvalent'
    }
  ]

  const filteredVehicles = vehicles.filter(vehicle => vehicle.category === selectedCategory)

  return (
    <section id="fleet" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-[#1E5EFF]/10 rounded-full mb-6">
            <Car className="h-5 w-5 text-[#1E5EFF] mr-2" />
            <span className="text-sm font-semibold text-[#1E5EFF]">Notre Flotte</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-[#2D2D2D] mb-6">
            Des Véhicules
            <span className="block text-[#1E5EFF]">Premium</span>
          </h2>
          
          <p className="text-xl text-[#2D2D2D]/70 max-w-3xl mx-auto leading-relaxed">
            Découvrez notre gamme complète de véhicules haut de gamme, 
            entretenus avec soin et conduits par des chauffeurs professionnels.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {vehicleCategories.map((category) => {
            const IconComponent = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`group flex items-center px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-[#1E5EFF] text-white shadow-lg scale-105'
                    : 'bg-white text-[#2D2D2D] hover:bg-[#1E5EFF]/10 hover:text-[#1E5EFF] border border-gray-200'
                }`}
              >
                <IconComponent className="h-5 w-5 mr-2" />
                <span>{category.name}</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  selectedCategory === category.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-[#1E5EFF]/20 group-hover:text-[#1E5EFF]'
                }`}>
                  {category.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredVehicles.map((vehicle) => (
            <div 
              key={vehicle.id} 
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-[#1E5EFF]/20 transform hover:-translate-y-2"
            >
              {/* Vehicle Image */}
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-semibold text-[#2D2D2D]">{vehicle.rating}</span>
                </div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-[#1E5EFF]/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-xs font-semibold text-white capitalize">
                    {vehicle.category}
                  </span>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-[#2D2D2D] group-hover:text-[#1E5EFF] transition-colors">
                    {vehicle.name}
                  </h3>
                  <div className="flex items-center text-[#2D2D2D]/60">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{vehicle.capacity}</span>
                  </div>
                </div>
                
                <p className="text-[#2D2D2D]/70 text-sm mb-4 leading-relaxed">
                  {vehicle.description}
                </p>
                
                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {vehicle.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center bg-gray-50 rounded-full px-3 py-1">
                      <CheckCircle className="h-3 w-3 text-[#1E5EFF] mr-1" />
                      <span className="text-xs font-medium text-[#2D2D2D]">{feature}</span>
                    </div>
                  ))}
                  {vehicle.features.length > 3 && (
                    <div className="flex items-center bg-[#1E5EFF]/10 rounded-full px-3 py-1">
                      <span className="text-xs font-medium text-[#1E5EFF]">+{vehicle.features.length - 3}</span>
                    </div>
                  )}
                </div>
                
                {/* Price and CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-[#2D2D2D]/60 mb-1">À partir de</div>
                    <div className="text-lg font-bold text-[#1E5EFF]">{vehicle.priceRange}</div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="group bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Réserver
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fleet Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1E5EFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-[#1E5EFF]" />
              </div>
              <div className="text-3xl font-bold text-[#2D2D2D] mb-2">10+</div>
              <div className="text-[#2D2D2D]/70 font-medium">Véhicules disponibles</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1E5EFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-[#1E5EFF]" />
              </div>
              <div className="text-3xl font-bold text-[#2D2D2D] mb-2">100%</div>
              <div className="text-[#2D2D2D]/70 font-medium">Véhicules assurés</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1E5EFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-[#1E5EFF]" />
              </div>
              <div className="text-3xl font-bold text-[#2D2D2D] mb-2">4.7</div>
              <div className="text-[#2D2D2D]/70 font-medium">Note moyenne</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1E5EFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-[#1E5EFF]" />
              </div>
              <div className="text-3xl font-bold text-[#2D2D2D] mb-2">4-25</div>
              <div className="text-[#2D2D2D]/70 font-medium">Places disponibles</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-[#1E5EFF] to-[#B8C5FF] rounded-2xl p-8 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Besoin d'un véhicule spécifique ?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Contactez-nous pour des demandes personnalisées ou des réservations de groupe
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white text-[#1E5EFF] hover:bg-gray-50 border-white px-8 py-3 text-lg font-semibold"
            >
              Nous contacter
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Fleet