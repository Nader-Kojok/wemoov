import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Menu, X, Phone } from 'lucide-react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { name: 'Accueil', href: '#home' },
    { name: 'À propos', href: '#about' },
    { name: 'Location avec chauffeur', href: '#car-rental' },
    { name: 'Tourisme', href: '#tourism' },
    { name: 'Navette Aéroport', href: '#airport' },
    { name: 'Services Entreprises', href: '#business' },
    { name: 'Contact', href: '#contact' }
  ]

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-[#1E5EFF]">Wemoov</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-[#1E5EFF] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Button */}
          <div className="hidden md:block">
            <Button className="bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 text-white">
              <Phone className="w-4 h-4 mr-2" />
              +221 XX XXX XXXX
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-[#1E5EFF] focus:outline-none focus:text-[#1E5EFF]"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-[#1E5EFF] block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="px-3 py-2">
              <Button className="bg-[#1E5EFF] hover:bg-[#1E5EFF]/90 text-white w-full">
                <Phone className="w-4 h-4 mr-2" />
                +221 XX XXX XXXX
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar