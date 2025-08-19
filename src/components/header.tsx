"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-white shadow-md" 
          : "bg-white/95 backdrop-blur-sm border-b border-gray-100"
      )}
    >
      {/* Skip to content for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16 md:h-20" role="navigation" aria-label="Main navigation">
          
          {/* Logo Lockup (Left) */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded"
              aria-label="Pink Auto Glass - Go to homepage"
            >
              {/* Logo placeholder - would use actual logo image */}
              <div className="h-7 sm:h-8 md:h-9 w-auto bg-gradient-primary text-white px-4 py-1 rounded font-display font-bold text-lg flex items-center">
                Pink Auto Glass
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation (Center) */}
          <ul className="hidden md:flex items-center space-x-6 lg:space-x-8" role="menubar">
            {[
              { href: "/services", label: "Services" },
              { href: "/locations", label: "Locations" },
              { href: "/vehicles", label: "Vehicles" },
              { href: "/about", label: "About" },
            ].map((item) => (
              <li key={item.href} role="none">
                <Link 
                  href={item.href}
                  className="text-gray-700 hover:text-pink-500 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-pink-500 after:transition-all hover:after:w-full"
                  role="menuitem"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* CTA Section (Right) */}
          <div className="flex items-center space-x-4">
            <a 
              href="tel:+13035557465" 
              className="hidden sm:flex items-center space-x-2 text-gray-700 hover:text-pink-500 transition-colors"
              aria-label="Call Pink Auto Glass"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">(303) 555-PINK</span>
            </a>
            
            <Link
              href="/book?utm_source=header&utm_medium=cta&utm_campaign=header_primary"
              className="btn-primary"
            >
              Schedule Now
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-700 hover:text-pink-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded" 
            aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </nav>
      </div>
      
      {/* Mobile Menu Overlay */}
      <div 
        id="mobile-menu" 
        className={cn(
          "md:hidden fixed inset-0 top-16 bg-white z-40 transform transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!isMobileMenuOpen}
      >
        <nav className="h-full px-4 py-6 overflow-y-auto" role="navigation" aria-label="Mobile navigation">
          <ul className="space-y-4" role="menu">
            {[
              { href: "/services", label: "Services" },
              { href: "/locations", label: "Locations" },
              { href: "/vehicles", label: "Vehicles" },
              { href: "/about", label: "About" },
            ].map((item) => (
              <li key={item.href} role="none">
                <Link
                  href={item.href}
                  className="block py-3 text-lg font-medium text-gray-900 hover:text-pink-500 transition-colors border-b border-gray-100"
                  role="menuitem"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li role="none" className="pt-4">
              <a 
                href="tel:+13035557465" 
                className="flex items-center space-x-3 py-3 text-lg font-medium text-gray-900 hover:text-pink-500 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>(303) 555-PINK</span>
              </a>
            </li>
            <li role="none" className="pt-2">
              <Link
                href="/book?utm_source=mobile_menu&utm_medium=cta&utm_campaign=mobile_primary"
                className="block w-full btn-primary text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Schedule Now
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  )
}