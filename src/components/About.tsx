import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const About = () => {
  const stats = [
    {
      icon: 'fas fa-users',
      number: '500+',
      label: 'Clients satisfaits'
    },
    {
      icon: 'fas fa-car',
      number: '50+',
      label: 'Véhicules disponibles'
    },
    {
      icon: 'fas fa-star',
      number: '4.9/5',
      label: 'Note moyenne'
    },
    {
      icon: 'fas fa-clock',
      number: '24/7',
      label: 'Service disponible'
    }
  ]

  const features = [
    {
      icon: 'fas fa-shield-alt',
      title: 'Sécurité',
      description: 'Véhicules assurés et chauffeurs professionnels'
    },
    {
      icon: 'fas fa-money-bill-wave',
      title: 'Tarifs transparents',
      description: 'Prix fixes sans surprise'
    },
    {
      icon: 'fas fa-headset',
      title: 'Support 24/7',
      description: 'Assistance disponible à tout moment'
    }
  ]

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80)'
        }}
      />
      <div className="absolute inset-0 bg-white/90" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#1E5EFF]/10 text-[#1E5EFF] border-[#1E5EFF]/20">
            À propos
          </Badge>
          <h2 className="text-4xl font-bold text-[#2D2D2D] mb-6">
            Votre partenaire mobilité au Sénégal
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Service VTC premium avec des chauffeurs professionnels et des véhicules de qualité pour tous vos déplacements.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#1E5EFF] rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className={`${stat.icon} text-white text-lg`}></i>
                </div>
                <div className="text-2xl font-bold text-[#1E5EFF] mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#1E5EFF] rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`${feature.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-[#2D2D2D] mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Statement */}
        <Card className="bg-[#1E5EFF] border-0 shadow-xl">
          <CardContent className="p-12 text-center text-white">
            <i className="fas fa-quote-left text-3xl mb-6 opacity-50"></i>
            <h3 className="text-2xl font-bold mb-4">Notre Mission</h3>
            <p className="text-lg text-[#B8C5FF] max-w-3xl mx-auto leading-relaxed">
              Faciliter vos déplacements au Sénégal en vous proposant des solutions de transport 
              sûres, confortables et professionnelles. Votre satisfaction est notre priorité.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default About