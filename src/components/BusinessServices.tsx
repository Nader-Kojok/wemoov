import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building, Users, Calendar, Clock, Star, CheckCircle, Mail, Phone, Send } from 'lucide-react'
import { useState } from 'react'

const BusinessServices = () => {
  const [formData, setFormData] = useState({
    company: '',
    contact: '',
    email: '',
    phone: '',
    service: '',
    details: ''
  })

  const services = [
    {
      icon: Building,
      title: 'Transport du personnel',
      description: 'Solutions de transport pour vos équipes',
      features: [
        'Navettes régulières',
        'Horaires flexibles',
        'Véhicules adaptés',
        'Suivi en temps réel'
      ],
      price: 'À partir de 150 000 FCFA/mois'
    },
    {
      icon: Users,
      title: 'Placement de chauffeurs',
      description: 'Chauffeurs dédiés pour vos dirigeants',
      features: [
        'Chauffeurs expérimentés',
        'Formation protocole',
        'Disponibilité totale',
        'Véhicules de prestige'
      ],
      price: 'À partir de 200 000 FCFA/mois'
    },
    {
      icon: Star,
      title: 'Navettes VIP',
      description: 'Service premium pour événements d\'entreprise',
      features: [
        'Véhicules haut de gamme',
        'Service personnalisé',
        'Accueil protocolaire',
        'Coordination événements'
      ],
      price: 'Sur devis personnalisé'
    },
    {
      icon: Calendar,
      title: 'Location flexible',
      description: 'Solutions adaptées à vos besoins ponctuels',
      features: [
        'Réservation à la demande',
        'Facturation mensuelle',
        'Contrats sur mesure',
        'Support dédié'
      ],
      price: 'Tarifs préférentiels'
    }
  ]

  const advantages = [
    {
      icon: CheckCircle,
      title: 'Fiabilité',
      description: 'Service garanti 365 jours par an'
    },
    {
      icon: Clock,
      title: 'Ponctualité',
      description: 'Respect strict des horaires convenus'
    },
    {
      icon: Star,
      title: 'Qualité',
      description: 'Véhicules entretenus et chauffeurs formés'
    }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Logique de soumission du formulaire
    console.log('Formulaire soumis:', formData)
    alert('Votre demande de devis a été envoyée avec succès !')
  }

  return (
    <section id="business" className="py-20 bg-gradient-to-br from-[#E8EFFF]/10 via-white to-[#B8C5FF]/5 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-40 h-40 bg-[#1E5EFF]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-[#B8C5FF]/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-[#1E5EFF]/5 rounded-full blur-xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#1E5EFF]/20 shadow-sm mb-6">
            <Building className="h-4 w-4 text-[#1E5EFF] mr-2" />
            <span className="text-sm font-medium text-[#2D2D2D]">Services aux entreprises</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-[#2D2D2D] mb-6 leading-tight">
            Solutions transport
            <span className="block text-[#1E5EFF]">pour entreprises</span>
          </h2>
          <p className="text-xl text-[#2D2D2D]/80 max-w-3xl mx-auto leading-relaxed">
            Optimisez la mobilité de votre entreprise avec nos solutions sur mesure. 
            <span className="font-semibold text-[#2D2D2D]">Transport du personnel, chauffeurs dédiés et services VIP.</span>
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <Card key={index} className="bg-white/95 backdrop-blur-sm border border-[#1E5EFF]/10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
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
                      <p className="text-xl font-bold text-[#1E5EFF] mb-2">{service.price}</p>
                      <p className="text-sm text-[#2D2D2D]/60">Demandez un devis personnalisé</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Advantages */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-black text-[#2D2D2D] mb-6">
              Pourquoi nous
              <span className="block text-[#1E5EFF]">choisir ?</span>
            </h3>
            <p className="text-xl text-[#2D2D2D]/80 max-w-3xl mx-auto leading-relaxed">
              Les avantages de faire confiance à Wemoov pour vos besoins de transport d'entreprise.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => {
              const IconComponent = advantage.icon
              return (
                <Card key={index} className="bg-white/95 backdrop-blur-sm border border-[#1E5EFF]/10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group text-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#1E5EFF] to-[#B8C5FF] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-[#2D2D2D] mb-4">{advantage.title}</h4>
                  <p className="text-[#2D2D2D]/80 leading-relaxed">{advantage.description}</p>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Quote Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <Card className="bg-white/95 backdrop-blur-sm border border-[#1E5EFF]/10 shadow-xl p-8">
            <CardHeader className="px-0 pt-0 text-center">
              <div className="w-16 h-16 bg-[#1E5EFF] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Send className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-[#2D2D2D] mb-4">
                Demande de devis gratuit
              </CardTitle>
              <p className="text-[#2D2D2D]/70 leading-relaxed">
                Remplissez ce formulaire et nous vous contacterons sous 24h avec une proposition personnalisée.
              </p>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#2D2D2D]">
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-[#1E5EFF]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-[#1E5EFF] transition-all duration-300 bg-white/80"
                      placeholder="Votre entreprise"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#2D2D2D]">
                      Personne de contact *
                    </label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-[#1E5EFF]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-[#1E5EFF] transition-all duration-300 bg-white/80"
                      placeholder="Nom et prénom"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#2D2D2D]">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-[#1E5EFF]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-[#1E5EFF] transition-all duration-300 bg-white/80"
                      placeholder="contact@entreprise.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#2D2D2D]">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-[#1E5EFF]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-[#1E5EFF] transition-all duration-300 bg-white/80"
                      placeholder="+221 33 801 82 82"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#2D2D2D]">
                    Service souhaité *
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-[#1E5EFF]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-[#1E5EFF] transition-all duration-300 bg-white/80"
                  >
                    <option value="">Sélectionnez un service</option>
                    <option value="transport-personnel">Transport du personnel</option>
                    <option value="placement-chauffeurs">Placement de chauffeurs</option>
                    <option value="navettes-vip">Navettes VIP</option>
                    <option value="location-flexible">Location flexible</option>
                    <option value="autre">Autre (préciser dans les détails)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#2D2D2D]">
                    Détails de votre besoin
                  </label>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-[#1E5EFF]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-[#1E5EFF] transition-all duration-300 resize-none bg-white/80"
                    placeholder="Décrivez vos besoins spécifiques, fréquence, nombre de personnes, etc."
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#1E5EFF] to-[#2D2D2D] hover:from-[#1E5EFF]/90 hover:to-[#2D2D2D]/90 text-white py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <Send className="mr-2 h-5 w-5" />
                  Envoyer ma demande de devis
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-[#1E5EFF] to-[#B8C5FF] border-0 shadow-xl p-8 text-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Besoin d'aide ?
                </h3>
                <p className="text-white/90 mb-6 leading-relaxed">
                  Notre équipe commerciale est à votre disposition pour vous accompagner 
                  dans le choix de la solution la plus adaptée à vos besoins.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 bg-white/10 rounded-xl p-4">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Téléphone</p>
                      <p className="text-white/80">+221 33 801 82 82</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 bg-white/10 rounded-xl p-4">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Email</p>
                      <p className="text-white/80">entreprises@wemoov.sn</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border border-[#1E5EFF]/10 shadow-xl p-8">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-[#1E5EFF] rounded-2xl flex items-center justify-center mb-6">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#2D2D2D] mb-4">
                  Nos références
                </h3>
                <p className="text-[#2D2D2D]/80 mb-6 leading-relaxed">
                  Nous accompagnons déjà de nombreuses entreprises sénégalaises :
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#1E5EFF]" />
                    <span className="text-[#2D2D2D]/80">Banques et institutions financières</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#1E5EFF]" />
                    <span className="text-[#2D2D2D]/80">Entreprises de télécommunications</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#1E5EFF]" />
                    <span className="text-[#2D2D2D]/80">Organisations internationales</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#1E5EFF]" />
                    <span className="text-[#2D2D2D]/80">Hôtels et groupes hôteliers</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BusinessServices