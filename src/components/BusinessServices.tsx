import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building, Users, Calendar, Clock, Star, CheckCircle, Mail, Phone } from 'lucide-react'
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
    <section id="business" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#E8EFFF] text-[#1E5EFF] border-[#1E5EFF]">
            Services aux entreprises
          </Badge>
          <h2 className="text-4xl font-bold text-[#2D2D2D] mb-6">
            Solutions transport pour entreprises
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Optimisez la mobilité de votre entreprise avec nos solutions sur mesure. 
            Transport du personnel, chauffeurs dédiés et services VIP.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
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
                      Devis gratuit
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
              Pourquoi nous choisir ?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Les avantages de faire confiance à Wemoov pour vos besoins de transport d'entreprise.
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

        {/* Quote Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <Card className="p-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl text-[#2D2D2D] mb-2">
                Demande de devis gratuit
              </CardTitle>
              <p className="text-gray-600">
                Remplissez ce formulaire et nous vous contacterons sous 24h avec une proposition personnalisée.
              </p>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-transparent"
                      placeholder="Votre entreprise"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personne de contact *
                    </label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-transparent"
                      placeholder="Nom et prénom"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-transparent"
                      placeholder="contact@entreprise.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-transparent"
                      placeholder="+221 XX XXX XXXX"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service souhaité *
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-transparent"
                  >
                    <option value="">Sélectionnez un service</option>
                    <option value="transport-personnel">Transport du personnel</option>
                    <option value="placement-chauffeurs">Placement de chauffeurs</option>
                    <option value="navettes-vip">Navettes VIP</option>
                    <option value="location-flexible">Location flexible</option>
                    <option value="autre">Autre (préciser dans les détails)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Détails de votre besoin
                  </label>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-transparent"
                    placeholder="Décrivez vos besoins spécifiques, fréquence, nombre de personnes, etc."
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 text-white py-3"
                >
                  Envoyer ma demande de devis
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            <Card className="p-6 bg-[#E8EFFF]">
              <CardContent className="p-0">
                <h3 className="text-xl font-bold text-[#2D2D2D] mb-4">
                  Besoin d'aide ?
                </h3>
                <p className="text-gray-600 mb-6">
                  Notre équipe commerciale est à votre disposition pour vous accompagner 
                  dans le choix de la solution la plus adaptée à vos besoins.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-[#1E5EFF]" />
                    <div>
                      <p className="font-semibold text-[#2D2D2D]">Téléphone</p>
                      <p className="text-gray-600">+221 XX XXX XXXX</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-[#1E5EFF]" />
                    <div>
                      <p className="font-semibold text-[#2D2D2D]">Email</p>
                      <p className="text-gray-600">entreprises@wemoov.sn</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-xl font-bold text-[#2D2D2D] mb-4">
                  Nos références
                </h3>
                <p className="text-gray-600 mb-4">
                  Nous accompagnons déjà de nombreuses entreprises sénégalaises :
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Banques et institutions financières</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Entreprises de télécommunications</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Organisations internationales</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Hôtels et groupes hôteliers</span>
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