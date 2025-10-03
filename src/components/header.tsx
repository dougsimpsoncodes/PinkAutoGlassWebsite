"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
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
          
          {/* Left side spacer */}
          <div className="flex-1"></div>
          
          {/* Centered Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link 
              href="/" 
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded"
              aria-label="Pink Auto Glass - Go to homepage"
            >
              <Image
                src="/pink-logo-horizontal.png"
                alt="Pink Auto Glass"
                width={972}
                height={292}
                className="w-auto max-w-[972px]"
                style={{ height: '194px' }}
                priority
              />
            </Link>
          </div>
          
          {/* CTA Section (Right) */}
          <div className="flex items-center space-x-4">
            <a
              href="tel:+17209817465"
              className="hidden sm:flex items-center space-x-2 text-gray-700 hover:text-pink-500 transition-colors"
              aria-label="Call Pink Auto Glass"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">(720) 981-7465</span>
            </a>
          
          {/* Universal Menu Button */}
            <button 
              className="p-2 text-gray-700 hover:text-pink-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded" 
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
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
          </div>
        </nav>
      </div>
      
      {/* Universal Menu Overlay */}
      <div 
        id="mobile-menu" 
        className={cn(
          "fixed inset-0 top-16 bg-white z-40 transform transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!isMobileMenuOpen}
      >
        <nav className="h-full px-4 py-6 overflow-y-auto" role="navigation" aria-label="Main navigation menu">
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
                href="tel:+17209817465"
                className="flex items-center space-x-3 py-3 text-lg font-medium text-gray-900 hover:text-pink-500 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>(720) 981-7465</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  )
}