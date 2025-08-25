import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Footer = () => {
  const services = [
    'Location avec chauffeur',
    'Navette aéroport',
    'Circuits touristiques',
    'Services entreprises',
    'Transport VIP'
  ]

  const quickLinks = [
    { name: 'À propos', href: '#about' },
    { name: 'Nos services', href: '#services' },
    { name: 'Tourisme', href: '#tourism' },
    { name: 'Contact', href: '#contact' },
    { name: 'Devis gratuit', href: '#quote' }
  ]

  return (
    <footer className="bg-[#2D2D2D] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#1E5EFF]">Wemoov</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Votre partenaire de confiance pour tous vos déplacements au Sénégal. 
              Service VTC professionnel, sécurisé et disponible 24h/24.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-[#1E5EFF]">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-[#1E5EFF]">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-[#1E5EFF]">
                <Twitter className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Nos Services</h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-300 hover:text-[#1E5EFF] text-sm transition-colors duration-200">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Liens Rapides</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-[#1E5EFF] text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#1E5EFF]" />
                <span className="text-gray-300 text-sm">+221 XX XXX XXXX</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#1E5EFF]" />
                <span className="text-gray-300 text-sm">contact@wemoov.sn</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-[#1E5EFF]" />
                <span className="text-gray-300 text-sm">Dakar, Sénégal</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-[#1E5EFF]" />
                <span className="text-gray-300 text-sm">24h/24 - 7j/7</span>
              </div>
            </div>

            {/* Special Offer */}
            <div className="bg-[#1E5EFF] rounded-lg p-4 mt-6">
              <h5 className="font-semibold text-white mb-2">Tarif Fixe Aéroport</h5>
              <p className="text-[#B8C5FF] text-sm mb-2">Dakar ↔ AIBD</p>
              <p className="text-white font-bold">15 000 FCFA</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Wemoov. Tous droits réservés.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-[#1E5EFF] text-sm transition-colors duration-200">
                Conditions d'utilisation
              </a>
              <a href="#" className="text-gray-400 hover:text-[#1E5EFF] text-sm transition-colors duration-200">
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