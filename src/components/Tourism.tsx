import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Users, Camera, Star, Calendar } from 'lucide-react'

const Tourism = () => {
  const circuits = [
    {
      title: 'Découverte de Dakar',
      duration: 'Demi-journée (4h)',
      price: '25 000 FCFA',
      maxPersons: 4,
      rating: 4.8,
      image: '🏛️',
      description: 'Explorez les sites emblématiques de la capitale sénégalaise',
      highlights: [
        'Île de Gorée et Maison des Esclaves',
        'Monument de la Renaissance',
        'Marché Sandaga',
        'Plateau et quartier des affaires'
      ],
      included: ['Transport climatisé', 'Guide francophone', 'Entrées monuments'],
      popular: true
    },
    {
      title: 'Lac Rose et Désert de Lompoul',
      duration: 'Journée complète (8h)',
      price: '45 000 FCFA',
      maxPersons: 6,
      rating: 4.9,
      image: '🌸',
      description: 'Découvrez les merveilles naturelles du Sénégal',
      highlights: [
        'Lac Rose (Lac Retba)',
        'Récolte de sel traditionnel',
        'Désert de Lompoul',
        'Balade à dos de chameau'
      ],
      included: ['Transport 4x4', 'Déjeuner traditionnel', 'Guide spécialisé', 'Activités incluses'],
      popular: false
    },
    {
      title: 'Saint-Louis et Fleuve Sénégal',
      duration: '2 jours / 1 nuit',
      price: '85 000 FCFA',
      maxPersons: 4,
      rating: 4.7,
      image: '🏰',
      description: 'Plongez dans l\'histoire coloniale et la culture sénégalaise',
      highlights: [
        'Centre historique de Saint-Louis',
        'Île de Saint-Louis (UNESCO)',
        'Parc National des Oiseaux du Djoudj',
        'Navigation sur le fleuve Sénégal'
      ],
      included: ['Transport aller-retour', 'Hébergement', 'Tous les repas', 'Excursions guidées'],
      popular: false
    },
    {
      title: 'Casamance Authentique',
      duration: '3 jours / 2 nuits',
      price: '120 000 FCFA',
      maxPersons: 6,
      rating: 4.9,
      image: '🌴',
      description: 'Immersion totale dans la culture casamançaise',
      highlights: [
        'Ziguinchor et ses marchés',
        'Villages traditionnels Diola',
        'Forêt de Basse Casamance',
        'Artisanat local et gastronomie'
      ],
      included: ['Transport climatisé', 'Hébergement en campement', 'Tous les repas', 'Activités culturelles'],
      popular: false
    },
    {
      title: 'Saloum et Sine',
      duration: 'Journée complète (10h)',
      price: '55 000 FCFA',
      maxPersons: 8,
      rating: 4.6,
      image: '🐦',
      description: 'Découverte du delta du Saloum et de ses îles',
      highlights: [
        'Delta du Saloum (Réserve de biosphère)',
        'Îles aux coquillages',
        'Observation des oiseaux',
        'Pêche traditionnelle'
      ],
      included: ['Transport et pirogue', 'Déjeuner sur l\'île', 'Guide naturaliste', 'Matériel d\'observation'],
      popular: false
    },
    {
      title: 'Circuit Personnalisé',
      duration: 'Sur mesure',
      price: 'Sur devis',
      maxPersons: 12,
      rating: 5.0,
      image: '✨',
      description: 'Créez votre circuit sur mesure selon vos envies',
      highlights: [
        'Itinéraire personnalisé',
        'Durée flexible',
        'Activités à la carte',
        'Accompagnement dédié'
      ],
      included: ['Consultation gratuite', 'Devis détaillé', 'Modifications incluses', 'Support 24/7'],
      popular: false
    }
  ]

  const services = [
    {
      icon: Camera,
      title: 'Photographie',
      description: 'Service photo professionnel disponible'
    },
    {
      icon: Users,
      title: 'Guides experts',
      description: 'Guides locaux francophones expérimentés'
    },
    {
      icon: MapPin,
      title: 'Sites authentiques',
      description: 'Accès à des lieux hors des sentiers battus'
    }
  ]

  return (
    <section id="tourism" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#E8EFFF] text-[#1E5EFF] border-[#1E5EFF]">
            Tourisme & Circuits
          </Badge>
          <h2 className="text-4xl font-bold text-[#2D2D2D] mb-6">
            Découvrez les merveilles du Sénégal
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explorez le Sénégal avec nos circuits touristiques soigneusement conçus. 
            De Dakar à la Casamance, vivez des expériences authentiques et inoubliables.
          </p>
        </div>

        {/* Circuits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {circuits.map((circuit, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">{circuit.image}</div>
                <CardTitle className="text-xl text-[#2D2D2D] mb-2">{circuit.title}</CardTitle>
                <p className="text-gray-600 text-sm">{circuit.description}</p>
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-[#1E5EFF]" />
                    <span className="text-sm text-gray-600">{circuit.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-[#1E5EFF]" />
                    <span className="text-sm text-gray-600">Max {circuit.maxPersons}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{circuit.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-[#2D2D2D] mb-2">Points forts :</h4>
                  <ul className="space-y-1">
                    {circuit.highlights.map((highlight, highlightIndex) => (
                      <li key={highlightIndex} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-[#1E5EFF] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-[#2D2D2D] mb-2">Inclus :</h4>
                  <div className="flex flex-wrap gap-1">
                    {circuit.included.map((item, itemIndex) => (
                      <Badge key={itemIndex} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold text-[#1E5EFF]">{circuit.price}</p>
                    <p className="text-xs text-gray-500">par personne</p>
                  </div>
                  <Button className="bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 text-white">
                    Réserver
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Services */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-[#2D2D2D] mb-4">
              Services inclus
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Profitez de services complémentaires pour enrichir votre expérience touristique.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon
              return (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-[#E8EFFF] rounded-full flex items-center justify-center mx-auto">
                    <IconComponent className="w-8 h-8 text-[#1E5EFF]" />
                  </div>
                  <h4 className="text-xl font-semibold text-[#2D2D2D]">{service.title}</h4>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#1E5EFF] to-[#B8C5FF] rounded-2xl p-8 text-center text-white">
          <Calendar className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">
            Prêt pour l'aventure ?
          </h3>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Réservez dès maintenant votre circuit touristique et découvrez les trésors cachés du Sénégal 
            avec nos guides experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" className="bg-white text-[#1E5EFF] hover:bg-gray-100">
              Voir tous les circuits
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#1E5EFF]">
              Circuit personnalisé
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Tourism