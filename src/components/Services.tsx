import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Car, Users, Briefcase, Heart, Plane, MapPin, Clock, Shield, Star, CheckCircle, ArrowRight } from 'lucide-react'

const Services = () => {
  const services = [
    {
      icon: Plane,
      title: 'Transfert Aéroport',
      description: 'Service navette entre Dakar et l\'aéroport AIBD',
      features: ['Tarif fixe garanti', 'Suivi de vol en temps réel', 'Accueil personnalisé', 'Véhicule climatisé'],
      price: '15,000 FCFA',
      duration: '45-60 min',
      popular: true
    },
    {
      icon: Briefcase,
      title: 'Transport Professionnel',
      description: 'Déplacements d\'affaires, réunions, rendez-vous clients',
      features: ['Véhicules haut de gamme', 'Chauffeurs en costume', 'Ponctualité garantie', 'Discrétion assurée'],
      price: 'À partir de 8,000 FCFA/heure',
      duration: 'Flexible',
      popular: false
    },
    {
      icon: Users,
      title: 'Transport Familial',
      description: 'Sorties en famille, courses, visites médicales',
      features: ['Véhicules spacieux', 'Sièges enfants disponibles', 'Flexibilité horaire', 'Tarifs préférentiels'],
      price: 'À partir de 6,000 FCFA/heure',
      duration: 'Flexible',
      popular: false
    },
    {
      icon: Heart,
      title: 'Occasions Spéciales',
      description: 'Mariages, anniversaires, événements privés',
      features: ['Véhicules décorés', 'Service personnalisé', 'Photographe disponible', 'Forfaits sur mesure'],
      price: 'À partir de 25,000 FCFA/jour',
      duration: 'Sur mesure',
      popular: false
    },
    {
      icon: MapPin,
      title: 'Navette Inter-régions',
      description: 'Transport vers les principales villes du Sénégal',
      features: ['Destinations multiples', 'Véhicules confortables', 'Arrêts sur demande', 'Bagages inclus'],
      price: 'À partir de 25,000 FCFA',
      duration: 'Variable',
      popular: false
    },
    {
      icon: Clock,
      title: 'Mise à disposition',
      description: 'Chauffeur et véhicule à votre disposition',
      features: ['Disponibilité totale', 'Itinéraire flexible', 'Attente incluse', 'Plusieurs arrêts possibles'],
      price: '8,000 FCFA/heure',
      duration: 'Minimum 2h',
      popular: false
    }
  ]

  const destinations = [
    { city: 'Dakar Centre', price: '15,000 FCFA', time: '45 min' },
    { city: 'Plateau', price: '15,000 FCFA', time: '50 min' },
    { city: 'Almadies', price: '18,000 FCFA', time: '40 min' },
    { city: 'Guédiawaye', price: '12,000 FCFA', time: '30 min' },
    { city: 'Pikine', price: '10,000 FCFA', time: '25 min' },
    { city: 'Rufisque', price: '8,000 FCFA', time: '20 min' },
    { city: 'Thiès', price: '25,000 FCFA', time: '1h 30min' },
    { city: 'Mbour', price: '20,000 FCFA', time: '1h 15min' }
  ]

  const advantages = [
    {
      icon: Shield,
      title: 'Sécurité Maximale',
      description: 'Véhicules assurés et chauffeurs vérifiés et formés'
    },
    {
      icon: Star,
      title: 'Confort Premium',
      description: 'Véhicules récents, climatisés et entretenus régulièrement'
    },
    {
      icon: Clock,
      title: 'Ponctualité Garantie',
      description: 'Suivi des vols et adaptation aux horaires, respect strict des horaires'
    }
  ]

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-white via-[#E8EFFF]/30 to-white relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-40 h-40 bg-[#1E5EFF]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-[#B8C5FF]/10 rounded-full blur-2xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#1E5EFF]/20 shadow-sm mb-6">
            <Car className="h-4 w-4 text-[#1E5EFF] mr-2" />
            <span className="text-sm font-medium text-[#2D2D2D]">Nos Services de Transport</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-[#2D2D2D] mb-6 leading-tight">
            Solutions adaptées
            <span className="block text-[#1E5EFF]">à tous vos besoins</span>
          </h2>
          <p className="text-xl text-[#2D2D2D]/80 max-w-3xl mx-auto leading-relaxed">
            De l'aéroport aux événements spéciaux, en passant par vos déplacements quotidiens, 
            <span className="font-semibold text-[#2D2D2D]">nous avons la solution de transport qui vous convient.</span>
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <Card key={index} className={`bg-white/95 backdrop-blur-sm border border-[#1E5EFF]/10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group ${
                service.popular ? 'ring-2 ring-[#1E5EFF]/50' : ''
              }`}>
                {service.popular && (
                  <div className="absolute -top-3 left-6 z-10">
                    <Badge className="bg-[#1E5EFF] text-white px-3 py-1">
                      Populaire
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#1E5EFF] to-[#B8C5FF] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold text-[#2D2D2D] mb-2">{service.title}</CardTitle>
                      <p className="text-[#2D2D2D]/70 leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center mt-4">
                    <div className="flex items-center space-x-2 bg-[#E8EFFF] px-4 py-2 rounded-full">
                      <Clock className="w-4 h-4 text-[#1E5EFF]" />
                      <span className="text-[#2D2D2D] font-medium">{service.duration}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-[#1E5EFF] flex-shrink-0" />
                        <span className="text-[#2D2D2D]/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-6 border-t border-[#1E5EFF]/10">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#1E5EFF] mb-2">{service.price}</p>
                      <p className="text-sm text-[#2D2D2D]/60">Contactez-nous pour réserver</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>



        {/* CTA Section */}
        <div className="relative">
          <Card className="bg-gradient-to-r from-[#1E5EFF] to-[#2D2D2D] border-0 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E5EFF]/90 to-[#2D2D2D]/90" />
            <CardContent className="relative p-12 md:p-16 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Star className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                Besoin d'un transport ?
              </h3>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                Contactez-nous pour obtenir un devis adapté à vos besoins spécifiques. 
                <span className="font-semibold text-white">Nos conseillers sont à votre disposition pour vous accompagner.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-[#1E5EFF] hover:bg-white/90 px-8 py-4 text-lg font-semibold">
                  Demander un devis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-[#1E5EFF] px-8 py-4 text-lg font-semibold">
                  Nous appeler
                </Button>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-24 h-24 bg-white/5 rounded-full" />
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default Services