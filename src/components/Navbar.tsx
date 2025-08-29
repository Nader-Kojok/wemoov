import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Menu, X, Car, ArrowRight } from 'lucide-react'
import { BookingModal } from '@/components/BookingModal'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  const navItems = [
    { name: 'Accueil', href: '#home' },
    { name: 'À propos', href: '#about' },
    { name: 'Notre Flotte', href: '#fleet' },
    { name: 'Nos Services', href: '#services' },
    { name: 'Tourisme', href: '#tourism' },
    { name: 'Services Entreprises', href: '#business' },
    { name: 'Contact', href: '#contact' }
  ]

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-xl border-b border-[#1E5EFF]/10 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="#home" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200">
              <img 
                src="/logo.png" 
                alt="Wemoov Logo" 
                className="h-12 w-auto"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-[#2D2D2D]/80 hover:text-[#1E5EFF] hover:bg-[#E8EFFF]/50 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button 
              size="lg" 
              onClick={() => setIsBookingModalOpen(true)}
              className="group bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Car className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Réserver maintenant
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 bg-[#E8EFFF] hover:bg-[#1E5EFF] text-[#1E5EFF] hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="px-4 pt-4 pb-6 space-y-2 bg-white/95 backdrop-blur-md shadow-2xl border-t border-[#1E5EFF]/10">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-[#2D2D2D]/80 hover:text-[#1E5EFF] hover:bg-[#E8EFFF]/50 block px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-4">
              <Button 
                size="lg" 
                onClick={() => setIsBookingModalOpen(true)}
                className="group bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 text-white w-full px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Car className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Réserver maintenant
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Booking Modal */}
      <BookingModal 
        open={isBookingModalOpen} 
        onOpenChange={setIsBookingModalOpen} 
      />
    </nav>
  )
}

export default Navbar