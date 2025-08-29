import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Users, Camera, Star, Calendar, CheckCircle, ArrowRight, Compass } from 'lucide-react'

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
    <section id="tourism" className="py-20 bg-gradient-to-br from-[#E8EFFF]/20 via-white to-[#B8C5FF]/10 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-40 h-40 bg-[#1E5EFF]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#B8C5FF]/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-[#1E5EFF]/5 rounded-full blur-xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#1E5EFF]/20 shadow-sm mb-6">
            <Compass className="h-4 w-4 text-[#1E5EFF] mr-2" />
            <span className="text-sm font-medium text-[#2D2D2D]">Tourisme & Circuits</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-[#2D2D2D] mb-6 leading-tight">
            Découvrez les merveilles
            <span className="block text-[#1E5EFF]">du Sénégal</span>
          </h2>
          <p className="text-xl text-[#2D2D2D]/80 max-w-3xl mx-auto leading-relaxed">
            Explorez le Sénégal avec nos circuits touristiques soigneusement conçus. 
            <span className="font-semibold text-[#2D2D2D]">De Dakar à la Casamance, vivez des expériences authentiques et inoubliables.</span>
          </p>
        </div>

        {/* Circuits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {circuits.map((circuit, index) => (
            <Card key={index} className={`bg-white/95 backdrop-blur-sm border border-[#1E5EFF]/10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group ${
              circuit.popular ? 'ring-2 ring-[#1E5EFF]/50' : ''
            }`}>
              {circuit.popular && (
                <div className="absolute -top-3 left-6 z-10">
                  <Badge className="bg-[#1E5EFF] text-white px-3 py-1">
                    Populaire
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{circuit.image}</div>
                <CardTitle className="text-2xl font-bold text-[#2D2D2D] mb-3">{circuit.title}</CardTitle>
                <p className="text-[#2D2D2D]/70 leading-relaxed">{circuit.description}</p>
                <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
                  <div className="flex items-center space-x-1 bg-[#E8EFFF] px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 text-[#1E5EFF]" />
                    <span className="text-[#2D2D2D] font-medium">{circuit.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-[#E8EFFF] px-3 py-1 rounded-full">
                    <Users className="w-4 h-4 text-[#1E5EFF]" />
                    <span className="text-[#2D2D2D] font-medium">Max {circuit.maxPersons}</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-[#E8EFFF] px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-[#1E5EFF] text-[#1E5EFF]" />
                    <span className="text-[#2D2D2D] font-medium">{circuit.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-bold text-[#2D2D2D] mb-3">Points forts :</h4>
                  <ul className="space-y-2">
                    {circuit.highlights.map((highlight, highlightIndex) => (
                      <li key={highlightIndex} className="flex items-start space-x-3">
                        <CheckCircle className="w-4 h-4 text-[#1E5EFF] mt-0.5 flex-shrink-0" />
                        <span className="text-[#2D2D2D]/80 text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-[#2D2D2D] mb-3">Inclus :</h4>
                  <div className="flex flex-wrap gap-2">
                    {circuit.included.map((item, itemIndex) => (
                      <Badge key={itemIndex} className="bg-[#B8C5FF]/20 text-[#2D2D2D] border-[#1E5EFF]/20 text-xs px-2 py-1">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-[#1E5EFF]/10">
                  <div>
                    <p className="text-2xl font-bold text-[#1E5EFF]">{circuit.price}</p>
                    <p className="text-xs text-[#2D2D2D]/60">par personne</p>
                  </div>
                  <Button className="bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 text-white px-6 py-3 font-semibold group">
                    Réserver
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Services */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-black text-[#2D2D2D] mb-6">
              Services
              <span className="block text-[#1E5EFF]">inclus</span>
            </h3>
            <p className="text-xl text-[#2D2D2D]/80 max-w-3xl mx-auto leading-relaxed">
              Profitez de services complémentaires pour enrichir votre expérience touristique.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon
              return (
                <Card key={index} className="bg-white/95 backdrop-blur-sm border border-[#1E5EFF]/10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group text-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#1E5EFF] to-[#B8C5FF] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-[#2D2D2D] mb-4">{service.title}</h4>
                  <p className="text-[#2D2D2D]/80 leading-relaxed">{service.description}</p>
                </Card>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative">
          <Card className="bg-gradient-to-r from-[#1E5EFF] to-[#2D2D2D] border-0 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E5EFF]/90 to-[#2D2D2D]/90" />
            <CardContent className="relative p-12 md:p-16 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                Prêt pour l'aventure ?
              </h3>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                Réservez dès maintenant votre circuit touristique et découvrez les trésors cachés du Sénégal 
                <span className="font-semibold text-white">avec nos guides experts.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-[#1E5EFF] hover:bg-white/90 px-8 py-4 text-lg font-semibold">
                  Voir tous les circuits
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-[#1E5EFF] px-8 py-4 text-lg font-semibold">
                  Circuit personnalisé
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

export default Tourism