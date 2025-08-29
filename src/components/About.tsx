import { Card, CardContent } from '@/components/ui/card'
import { Users, Car, Star, Clock, Shield, Headphones, DollarSign, CheckCircle } from 'lucide-react'

const About = () => {
  const stats = [
    {
      icon: <Users className="h-6 w-6" />,
      number: '500+',
      label: 'Clients satisfaits',
      color: 'bg-[#1E5EFF]'
    },
    {
      icon: <Car className="h-6 w-6" />,
      number: '50+',
      label: 'Véhicules disponibles',
      color: 'bg-[#2D2D2D]'
    },
    {
      icon: <Star className="h-6 w-6" />,
      number: '4.9/5',
      label: 'Note moyenne',
      color: 'bg-[#1E5EFF]'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      number: '24/7',
      label: 'Service disponible',
      color: 'bg-[#B8C5FF]'
    }
  ]

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Sécurité Garantie',
      description: 'Véhicules assurés et chauffeurs professionnels certifiés pour votre tranquillité d\'esprit.'
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: 'Tarifs Transparents',
      description: 'Prix fixes annoncés à l\'avance, sans frais cachés ni mauvaises surprises.'
    },
    {
      icon: <Headphones className="h-8 w-8" />,
      title: 'Support 24/7',
      description: 'Équipe d\'assistance disponible à tout moment pour répondre à vos besoins.'
    }
  ]

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-[#E8EFFF] via-white to-[#B8C5FF]/20 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-40 h-40 bg-[#1E5EFF]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-[#B8C5FF]/10 rounded-full blur-2xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#1E5EFF]/20 shadow-sm mb-6">
            <CheckCircle className="h-4 w-4 text-[#1E5EFF] mr-2" />
            <span className="text-sm font-medium text-[#2D2D2D]">À propos de WeMoov</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-[#2D2D2D] mb-6 leading-tight">
            Votre partenaire
            <span className="block text-[#1E5EFF]">mobilité</span>
            <span className="block text-3xl md:text-4xl font-light text-[#2D2D2D]/70 mt-2">au Sénégal</span>
          </h2>
          <p className="text-xl text-[#2D2D2D]/80 max-w-3xl mx-auto leading-relaxed">
            Service VTC premium avec des chauffeurs professionnels et des véhicules de qualité 
            <span className="font-semibold text-[#2D2D2D]">pour tous vos déplacements.</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/90 backdrop-blur-sm border border-[#1E5EFF]/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-6 text-center">
                <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-[#2D2D2D] mb-2">{stat.number}</div>
                <div className="text-sm text-[#2D2D2D]/70 font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/95 backdrop-blur-sm border border-[#1E5EFF]/10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1E5EFF] to-[#B8C5FF] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#2D2D2D] mb-4">{feature.title}</h3>
                <p className="text-[#2D2D2D]/80 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="relative">
          <Card className="bg-gradient-to-r from-[#1E5EFF] to-[#2D2D2D] border-0 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E5EFF]/90 to-[#2D2D2D]/90" />
            <CardContent className="relative p-12 md:p-16 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Star className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-6">Notre Mission</h3>
              <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
                Faciliter vos déplacements au Sénégal en vous proposant des solutions de transport 
                <span className="font-semibold text-white">sûres, confortables et professionnelles.</span> 
                Votre satisfaction est notre priorité absolue.
              </p>
              
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

export default About