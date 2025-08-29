import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Menu, X, Phone } from 'lucide-react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { name: 'Accueil', href: '#home' },
    { name: 'À propos', href: '#about' },
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
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1E5EFF] to-[#B8C5FF] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <h1 className="text-3xl font-black text-[#2D2D2D]">
                We<span className="text-[#1E5EFF]">moov</span>
              </h1>
            </div>
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

          {/* Contact Button */}
          <div className="hidden lg:block">
            <Button className="bg-gradient-to-r from-[#1E5EFF] to-[#2D2D2D] hover:from-[#1E5EFF]/90 hover:to-[#2D2D2D]/90 text-white px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Phone className="w-4 h-4 mr-2" />
              +221 XX XXX XXXX
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
              <Button className="bg-gradient-to-r from-[#1E5EFF] to-[#2D2D2D] hover:from-[#1E5EFF]/90 hover:to-[#2D2D2D]/90 text-white w-full py-3 font-semibold shadow-lg">
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