import React from 'react'
import { Button } from './ui/button'
import { Leaf, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-emerald-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">ESCE Du Lịch</h1>
                <p className="text-xs text-slate-600">Sinh thái Đà Nẵng</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
            <Link to="/" className="text-slate-700 hover:text-emerald-600 transition-colors" aria-label="Go to home page">
              Trang chủ
            </Link>
            <Link to="/tours" className="text-slate-700 hover:text-emerald-600 transition-colors" aria-label="Go to tours page">
              Tour du lịch
            </Link>
            <a href="#about" className="text-slate-700 hover:text-emerald-600 transition-colors" aria-label="Go to about section">
              Về chúng tôi
            </a>
            <a href="#contact" className="text-slate-700 hover:text-emerald-600 transition-colors" aria-label="Go to contact section">
              Liên hệ
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm" aria-label="Login to your account">
              Đăng nhập
            </Button>
            <Button size="sm" aria-label="Create new account">
              Đăng ký
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                to="/"
                className="block px-3 py-2 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link
                to="/tours"
                className="block px-3 py-2 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Tour du lịch
              </Link>
              <a
                href="#about"
                className="block px-3 py-2 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Về chúng tôi
              </a>
              <a
                href="#contact"
                className="block px-3 py-2 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Liên hệ
              </a>
              <div className="pt-4 space-y-2">
                <Button variant="outline" size="sm" className="w-full" aria-label="Login to your account">
                  Đăng nhập
                </Button>
                <Button size="sm" className="w-full" aria-label="Create new account">
                  Đăng ký
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
