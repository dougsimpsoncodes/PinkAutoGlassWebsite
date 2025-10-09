"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Phone } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

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
        <nav className="flex items-center justify-between h-16 md:h-20 relative" role="navigation" aria-label="Main navigation">

          {/* Left side spacer */}
          <div className="flex-1"></div>

          {/* Centered Logo */}
          <div className="flex items-center justify-center">
            <Link
              href="/"
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded"
              aria-label="Pink Auto Glass - Go to homepage"
            >
              <Image
                src="/pink-logo-horizontal.png"
                alt="Pink Auto Glass - Mobile Windshield Repair & Replacement Denver"
                width={972}
                height={292}
                className="w-auto max-w-[972px]"
                style={{ height: '194px' }}
                priority
              />
            </Link>
          </div>

          {/* CTA Section (Right) */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <a
              href="tel:+17209187465"
              className="flex items-center space-x-2 text-gray-700 hover:text-pink-500 transition-colors"
              aria-label="Call Pink Auto Glass"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">(720) 918-7465</span>
            </a>
          </div>
        </nav>

        {/* Secondary Navigation Bar */}
        <div className="border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 md:space-x-8 py-3">
            <Link
              href="/services"
              className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
            >
              Services
            </Link>
            <Link
              href="/locations"
              className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
            >
              Locations
            </Link>
            <Link
              href="/vehicles"
              className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
            >
              Vehicles
            </Link>
            <Link
              href="/book"
              className="text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors"
            >
              Get Free Quote
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}