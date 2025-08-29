import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, Star, Calendar, CheckCircle, ArrowRight, Compass } from 'lucide-react'

const Tourism = () => {
  const circuits = [
    {
      title: 'Pack Découverte Dakar Intra-Muros (4H)',
      duration: 'Demi-journée (4h)',
      price: '65 000 FCFA',
      maxPersons: 4,
      rating: 4.9,
      image: '/renaissance.jpg',
      description: 'Découvrez les trésors historiques et culturels de Dakar intra-muros',
      highlights: [
        'Monument de la Renaissance',
        'Corniche Ouest',
        'Mosquée de la Divinité',
        'Plateau : Musée des Civilisations Noires, marché artisanal (Soumbédioune ou Kermel), Place de l\'Indépendance'
      ],
      included: ['Transport climatisé', 'Guide francophone', 'Entrées monuments', 'Rafraîchissement offert'],
      popular: true,
      options: [
        {
          name: 'Activités dans les ateliers d\'art (samedi uniquement)',
          price: '20 000 FCFA / personne'
        }
      ]
    },
    {
      title: 'Pack Évasion Lac Rose (4H)',
      duration: 'Demi-journée (4h)',
      price: '84 000 FCFA',
      maxPersons: 6,
      rating: 4.9,
      image: '/lac_rose.jpg',
      description: 'Évadez-vous vers les paysages uniques du Lac Rose et ses environs',
      highlights: [
        'Quad',
        'Balade en pirogue',
        'Promenade à dos de chameau',
        'Visite du Village des Tortues'
      ],
      included: ['Transport climatisé', 'Guide francophone', 'Activités incluses', 'Rafraîchissement offert'],
      popular: false,
      options: [
        {
          name: 'Île de Gorée : Visite historique',
          price: '20 000 FCFA / personne'
        },
        {
          name: 'Réserve de Bandia : Safari',
          price: '80 000 FCFA / personne'
        },
        {
          name: 'Ranch de Bandia : Rencontre avec les lions',
          price: '+23 000 FCFA / personne'
        }
      ]
    },
    {
      title: 'Pack Horizon Île de Gorée (4H)',
      duration: 'Demi-journée (4h)',
      price: '60 000 FCFA',
      maxPersons: 8,
      rating: 4.8,
      image: '/goree_island.jpeg',
      description: 'Transfert en ferry + visite guidée de l\'île historique de Gorée',
      highlights: [
        'Église Saint-Charles Borromée',
        'Maison des Esclaves',
        'Mémorial de Gorée'
      ],
      included: ['Transport climatisé', 'Ferry aller-retour', 'Guide francophone', 'Rafraîchissement offert'],
      popular: false
    },
    {
      title: 'Pack Aventure Parc Accro Baobab (5H)',
      duration: 'Demi-journée (5h)',
      price: '95 000 FCFA',
      maxPersons: 6,
      rating: 4.9,
      image: '/accrobaobab.jpg',
      description: 'Adrénaline garantie dans le parc d\'aventure au cœur des baobabs',
      highlights: [
        'Parcours accrobranche (20 ateliers - 3 niveaux)',
        'Escalade sur baobab'
      ],
      included: ['Transport climatisé', 'Équipement de sécurité', 'Guide spécialisé', 'Rafraîchissement offert'],
      popular: false,
      options: [
        {
          name: 'Baptême de l\'air 10 min',
          price: '45 000 FCFA / personne'
        },
        {
          name: 'Baptême de l\'air 20 min (Forêt de Baobab & Lagune de la Somone)',
          price: '70 000 FCFA / personne'
        },
        {
          name: 'Baptême de l\'air 30 min (avec falaise de Popenguine)',
          price: '85 000 FCFA / personne'
        }
      ]
    },
    {
      title: 'Pack Globetrotter Journée Complète (7H)',
      duration: 'Journée complète (7h)',
      price: '185 000 FCFA',
      maxPersons: 4,
      rating: 5.0,
      image: '/fathala.webp',
      description: 'Immersion unique entre faune et nature dans les réserves du Sénégal',
      highlights: [
        'Fathala : Marche avec les lions',
        'Sine Saloum : Pirogue en mangrove & observatoire d\'oiseaux'
      ],
      included: ['Transport 4x4', 'Déjeuner inclus', 'Guide spécialisé faune', 'Entrées réserves', 'Rafraîchissement offert'],
      popular: true,
      options: [
        {
          name: 'Initiation au tir (2h)',
          price: '20 000 FCFA / personne'
        }
      ]
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
          <div className="inline-flex items-center px-4 py-2 bg-white/80 rounded-full border border-[#1E5EFF]/20 shadow-sm mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {circuits.map((circuit, index) => (
            <Card key={index} className={`relative bg-white/95 border border-[#1E5EFF]/10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group flex flex-col ${
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
                <div className="mb-4">
                  {circuit.image.startsWith('/') ? (
                    <img 
                      src={circuit.image} 
                      alt={circuit.title}
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="text-6xl">{circuit.image}</div>
                  )}
                </div>
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
              <CardContent className="space-y-6 flex-grow flex flex-col">
                <div className="space-y-6 flex-grow">
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
                  {circuit.options && circuit.options.length > 0 && (
                    <div>
                      <h4 className="font-bold text-[#2D2D2D] mb-3">Options supplémentaires :</h4>
                      <div className="space-y-2">
                        {circuit.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center justify-between p-3 bg-[#E8EFFF]/50 rounded-lg border border-[#1E5EFF]/10">
                            <span className="text-[#2D2D2D] text-sm font-medium">{option.name}</span>
                            <Badge className="bg-[#1E5EFF] text-white text-xs px-2 py-1">
                              +{option.price}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-[#1E5EFF]/10 mt-auto">
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