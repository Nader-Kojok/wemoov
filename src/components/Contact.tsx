import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Message envoyé:', formData)
    alert('Votre message a été envoyé avec succès !')
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <section id="contact" className="py-20 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)'
        }}
      />
      <div className="absolute inset-0 bg-black/60" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            Contact
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-4">
            Contactez-nous
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Notre équipe est disponible 24h/24 pour vous accompagner
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contact Info - Simplified */}
          <div className="space-y-8">
            {/* Quick Contact */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-[#2D2D2D] mb-6 text-center">
                  Contactez-nous rapidement
                </h3>
                
                <div className="space-y-6">
                  {/* Phone */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#1E5EFF] rounded-full flex items-center justify-center">
                      <i className="fas fa-phone text-white text-lg"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D2D2D]">Téléphone</p>
                      <p className="text-gray-600">+221 XX XXX XXXX</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#1E5EFF] rounded-full flex items-center justify-center">
                      <i className="fas fa-envelope text-white text-lg"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D2D2D]">Email</p>
                      <p className="text-gray-600">contact@wemoov.sn</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#1E5EFF] rounded-full flex items-center justify-center">
                      <i className="fas fa-map-marker-alt text-white text-lg"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D2D2D]">Localisation</p>
                      <p className="text-gray-600">Dakar, Sénégal</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 space-y-3">
                  <Button className="w-full bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 text-white">
                    <i className="fas fa-phone mr-2"></i>
                    Appeler maintenant
                  </Button>
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                    <i className="fab fa-whatsapp mr-2"></i>
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Special Offer - Simplified */}
            <Card className="bg-[#1E5EFF] border-0 shadow-xl">
              <CardContent className="p-6 text-center text-white">
                <i className="fas fa-plane text-3xl mb-3"></i>
                <h3 className="text-xl font-bold mb-2">Navette Aéroport</h3>
                <div className="text-2xl font-bold mb-3">15 000 FCFA</div>
                <p className="text-[#B8C5FF] text-sm">Dakar ↔ AIBD • 24h/24</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form - Simplified */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-[#2D2D2D] mb-6 text-center">
                Envoyez-nous un message
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-transparent"
                    placeholder="Votre nom complet"
                  />
                </div>
                
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-transparent"
                    placeholder="Votre email"
                  />
                </div>
                
                <div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E5EFF] focus:border-transparent resize-none"
                    placeholder="Votre message..."
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 text-white py-3"
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  Envoyer le message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Social Media - Simplified */}
        <div className="text-center mt-12">
          <p className="text-white/90 mb-4">Suivez-nous sur nos réseaux sociaux</p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="icon" className="border-white/30 text-white hover:bg-white hover:text-[#1E5EFF]">
              <i className="fab fa-facebook-f"></i>
            </Button>
            <Button variant="outline" size="icon" className="border-white/30 text-white hover:bg-white hover:text-[#1E5EFF]">
              <i className="fab fa-instagram"></i>
            </Button>
            <Button variant="outline" size="icon" className="border-white/30 text-white hover:bg-white hover:text-[#1E5EFF]">
              <i className="fab fa-twitter"></i>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact