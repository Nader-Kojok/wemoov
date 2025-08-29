import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Footer = () => {
  const services = [
    'Transport familial',
    'Transfert aéroport',
    'Transport professionnel',
    'Occasions spéciales',
    'Services entreprises'
  ]

  const quickLinks = [
    { name: 'À propos', href: '#about' },
    { name: 'Nos services', href: '#services' },
    { name: 'Tourisme', href: '#tourism' },
    { name: 'Services Entreprises', href: '#business' },
    { name: 'Contact', href: '#contact' }
  ]

  return (
    <footer className="bg-gradient-to-b from-[#2D2D2D] to-[#1E5EFF] text-white relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#B8C5FF]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <img 
                src="/logo.png" 
                alt="Wemoov Logo" 
                className="h-12 w-auto filter brightness-0 invert"
              />
            </div>
            <p className="text-white/90 leading-relaxed">
              Votre partenaire de confiance pour tous vos déplacements au Sénégal. 
              <span className="font-semibold text-white">Service VTC professionnel, sécurisé et disponible 24h/24.</span>
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white hover:text-[#B8C5FF] rounded-xl transition-all duration-300 hover:scale-110">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white hover:text-[#B8C5FF] rounded-xl transition-all duration-300 hover:scale-110">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white hover:text-[#B8C5FF] rounded-xl transition-all duration-300 hover:scale-110">
                <Twitter className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h4 className="text-2xl font-bold text-white">Nos Services</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <a href="#" className="text-white/80 hover:text-[#B8C5FF] flex items-center space-x-2 transition-all duration-300 hover:translate-x-2 group">
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{service}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-2xl font-bold text-white">Liens Rapides</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-white/80 hover:text-[#B8C5FF] flex items-center space-x-2 transition-all duration-300 hover:translate-x-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-2xl font-bold text-white">Contact</h4>
            <div className="space-y-3">
              <a href="tel:+221338018282" className="flex items-center space-x-3 hover:text-[#B8C5FF] transition-all duration-300 cursor-pointer group">
                <div className="w-8 h-8 bg-[#B8C5FF]/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#B8C5FF]/30">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium text-sm">+221 33 801 82 82</span>
              </a>
              <a href="mailto:contact@wemoovsenegal.com" className="flex items-center space-x-3 hover:text-[#B8C5FF] transition-all duration-300 cursor-pointer group">
                <div className="w-8 h-8 bg-[#B8C5FF]/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#B8C5FF]/30">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div className="text-white font-medium text-sm break-words">contact@wemoovsenegal.com</div>
              </a>
              <a href="https://maps.google.com/?q=Ouest+Foire+cité+khanat+n.107,+Dakar,+Sénégal" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 hover:text-[#B8C5FF] transition-all duration-300 cursor-pointer group">
                <div className="w-8 h-8 bg-[#B8C5FF]/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#B8C5FF]/30">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="text-white font-medium text-sm">Ouest Foire cité khanat n.107, Dakar – Sénégal</div>
              </a>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#B8C5FF]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium text-sm">24h/24 - 7j/7</span>
              </div>
            </div>


          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <p className="text-white/80 font-medium">
              © 2024 Wemoov. Tous droits réservés.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8">
              <a href="#" className="text-white/80 hover:text-[#B8C5FF] font-medium transition-all duration-300 hover:scale-105">
                Conditions d'utilisation
              </a>
              <a href="#" className="text-white/80 hover:text-[#B8C5FF] font-medium transition-all duration-300 hover:scale-105">
                Politique de confidentialité
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer