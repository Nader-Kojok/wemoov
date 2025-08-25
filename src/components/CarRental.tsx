import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Car, Users, Briefcase, Heart, Clock, Shield, Star } from 'lucide-react'

const CarRental = () => {
  const services = [
    {
      icon: Briefcase,
      title: 'Transport Professionnel',
      description: 'Déplacements d\'affaires, réunions, rendez-vous clients',
      features: ['Véhicules haut de gamme', 'Chauffeurs en costume', 'Ponctualité garantie', 'Discrétion assurée'],
      price: 'À partir de 8 000 FCFA/heure',
      popular: false
    },
    {
      icon: Car,
      title: 'Transfert Aéroport',
      description: 'Service navette entre Dakar et l\'aéroport AIBD',
      features: ['Tarif fixe transparent', 'Suivi de vol', 'Accueil personnalisé', 'Véhicules climatisés'],
      price: '15 000 FCFA (tarif fixe)',
      popular: true
    },
    {
      icon: Heart,
      title: 'Occasions Spéciales',
      description: 'Mariages, anniversaires, événements privés',
      features: ['Véhicules décorés', 'Service personnalisé', 'Photographe disponible', 'Forfaits sur mesure'],
      price: 'À partir de 25 000 FCFA/jour',
      popular: false
    },
    {
      icon: Users,
      title: 'Transport Familial',
      description: 'Sorties en famille, courses, visites médicales',
      features: ['Véhicules spacieux', 'Sièges enfants disponibles', 'Flexibilité horaire', 'Tarifs préférentiels'],
      price: 'À partir de 6 000 FCFA/heure',
      popular: false
    }
  ]

  const advantages = [
    {
      icon: Shield,
      title: 'Sécurité Maximale',
      description: 'Véhicules assurés, chauffeurs vérifiés et formés'
    },
    {
      icon: Star,
      title: 'Confort Premium',
      description: 'Véhicules récents, climatisés et entretenus régulièrement'
    },
    {
      icon: Clock,
      title: 'Ponctualité',
      description: 'Respect des horaires et suivi en temps réel'
    }
  ]

  return (
    <section id="car-rental" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#E8EFFF] text-[#1E5EFF] border-[#1E5EFF]">
            Location avec chauffeur
          </Badge>
          <h2 className="text-4xl font-bold text-[#2D2D2D] mb-6">
            Services de location adaptés à vos besoins
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Que ce soit pour vos déplacements professionnels, vos transferts aéroport ou vos occasions spéciales, 
            nous avons la solution de transport qui vous convient.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <Card key={index} className="relative hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#E8EFFF] rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-[#1E5EFF]" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-[#2D2D2D]">{service.title}</CardTitle>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-[#1E5EFF] rounded-full"></div>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-lg font-bold text-[#1E5EFF]">{service.price}</p>
                    </div>
                    <Button className="bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 text-white">
                      Réserver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Advantages */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-[#2D2D2D] mb-4">
              Pourquoi choisir Wemoov ?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nos engagements pour vous garantir une expérience de transport exceptionnelle.
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

        {/* CTA Section */}
        <div className="bg-[#1E5EFF] rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            Besoin d'un devis personnalisé ?
          </h3>
          <p className="text-[#B8C5FF] mb-6 max-w-2xl mx-auto">
            Contactez-nous pour obtenir un devis adapté à vos besoins spécifiques. 
            Nos conseillers sont à votre disposition pour vous accompagner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" className="bg-white text-[#1E5EFF] hover:bg-gray-100">
              Demander un devis
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#1E5EFF]">
              Nous appeler
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CarRental