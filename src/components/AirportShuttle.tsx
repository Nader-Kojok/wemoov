import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plane, Clock, MapPin, Shield, CheckCircle, Phone } from 'lucide-react'

const AirportShuttle = () => {
  const shuttleServices = [
    {
      title: 'Dakar ↔ Aéroport AIBD',
      description: 'Service navette entre Dakar et l\'Aéroport International Blaise Diagne',
      price: '15 000 FCFA',
      duration: '45-60 min',
      features: [
        'Tarif fixe garanti',
        'Suivi de vol en temps réel',
        'Accueil personnalisé',
        'Véhicule climatisé',
        'Chauffeur professionnel'
      ],
      popular: true
    },
    {
      title: 'Navette Inter-régions',
      description: 'Transport vers les principales villes du Sénégal',
      price: 'À partir de 25 000 FCFA',
      duration: 'Variable',
      features: [
        'Destinations multiples',
        'Véhicules confortables',
        'Arrêts sur demande',
        'Bagages inclus',
        'Réservation flexible'
      ],
      popular: false
    },
    {
      title: 'Mise à disposition',
      description: 'Chauffeur et véhicule à votre disposition',
      price: '8 000 FCFA/heure',
      duration: 'Minimum 2h',
      features: [
        'Disponibilité totale',
        'Itinéraire flexible',
        'Attente incluse',
        'Plusieurs arrêts possibles',
        'Facturation à l\'heure'
      ],
      popular: false
    }
  ]

  const destinations = [
    { city: 'Dakar Centre', price: '15 000 FCFA', time: '45 min' },
    { city: 'Plateau', price: '15 000 FCFA', time: '50 min' },
    { city: 'Almadies', price: '18 000 FCFA', time: '40 min' },
    { city: 'Guédiawaye', price: '12 000 FCFA', time: '30 min' },
    { city: 'Pikine', price: '10 000 FCFA', time: '25 min' },
    { city: 'Rufisque', price: '8 000 FCFA', time: '20 min' },
    { city: 'Thiès', price: '25 000 FCFA', time: '1h 30min' },
    { city: 'Mbour', price: '20 000 FCFA', time: '1h 15min' }
  ]

  const advantages = [
    {
      icon: Clock,
      title: 'Ponctualité garantie',
      description: 'Suivi des vols et adaptation aux horaires'
    },
    {
      icon: Shield,
      title: 'Sécurité maximale',
      description: 'Véhicules assurés et chauffeurs vérifiés'
    },
    {
      icon: CheckCircle,
      title: 'Tarifs transparents',
      description: 'Prix fixes, pas de mauvaises surprises'
    }
  ]

  return (
    <section id="airport" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#E8EFFF] text-[#1E5EFF] border-[#1E5EFF]">
            Navette Aéroport
          </Badge>
          <h2 className="text-4xl font-bold text-[#2D2D2D] mb-6">
            Transferts aéroport sécurisés
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Service de navette professionnel entre Dakar et l'aéroport AIBD. 
            Tarifs fixes, ponctualité garantie et confort assuré.
          </p>
        </div>

        {/* Services */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {shuttleServices.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-[#E8EFFF] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plane className="w-8 h-8 text-[#1E5EFF]" />
                </div>
                <CardTitle className="text-xl text-[#2D2D2D] mb-2">{service.title}</CardTitle>
                <p className="text-gray-600 text-sm">{service.description}</p>
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-[#1E5EFF]" />
                    <span className="text-sm text-gray-600">{service.duration}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold text-[#1E5EFF]">{service.price}</p>
                  </div>
                  <Button className="bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 text-white">
                    Réserver
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Destinations & Tarifs */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-[#2D2D2D] mb-4">
              Tarifs par destination
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez nos tarifs fixes depuis/vers l'aéroport AIBD pour les principales destinations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {destinations.map((destination, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="w-4 h-4 text-[#1E5EFF] mr-1" />
                    <h4 className="font-semibold text-[#2D2D2D]">{destination.city}</h4>
                  </div>
                  <p className="text-lg font-bold text-[#1E5EFF] mb-1">{destination.price}</p>
                  <p className="text-sm text-gray-500">{destination.time}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Advantages */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-[#2D2D2D] mb-4">
              Nos engagements
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ce qui fait la différence avec notre service de navette aéroport.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => {
              const IconComponent = advantage.icon
              return (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-[#1E5EFF] rounded-full flex items-center justify-center mx-auto">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-[#2D2D2D]">{advantage.title}</h4>
                  <p className="text-gray-600">{advantage.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Booking Section */}
        <div className="bg-[#1E5EFF] rounded-2xl p-8 text-center text-white">
          <Plane className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">
            Réservez votre navette aéroport
          </h3>
          <p className="text-[#B8C5FF] mb-6 max-w-2xl mx-auto">
            Service disponible 24h/24 et 7j/7. Réservation simple et rapide par téléphone ou en ligne.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" className="bg-white text-[#1E5EFF] hover:bg-gray-100">
              <Phone className="w-4 h-4 mr-2" />
              Appeler maintenant
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#1E5EFF]">
              Réserver en ligne
            </Button>
          </div>
          <div className="mt-6 p-4 bg-white/10 rounded-lg">
            <p className="text-sm text-[#B8C5FF] mb-2">Tarif spécial Dakar ↔ AIBD</p>
            <p className="text-3xl font-bold text-white">15 000 FCFA</p>
            <p className="text-sm text-[#B8C5FF]">Prix fixe, aller simple</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AirportShuttle