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
        {/* Mobile Layout: Vertical Stack */}
        <nav className="md:hidden flex flex-col items-center justify-center py-3" role="navigation" aria-label="Main navigation">
          {/* Logo - Smaller on mobile */}
          <Link
            href="/"
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded mb-2"
            aria-label="Pink Auto Glass - Go to homepage"
          >
            <Image
              src="/pink-logo-horizontal.png"
              alt="Pink Auto Glass - Mobile Windshield Repair & Replacement Denver"
              width={972}
              height={292}
              className="w-auto"
              style={{ height: '96px' }}
              priority
            />
          </Link>

          {/* Phone Number - Below logo on mobile */}
          <a
            href="tel:+17209187465"
            className="flex items-center space-x-2 text-gray-700 hover:text-pink-500 transition-colors text-lg"
            aria-label="Call Pink Auto Glass"
          >
            <Phone className="w-5 h-5" />
            <span className="font-medium">(720) 918-7465</span>
          </a>
        </nav>

        {/* Desktop/Tablet Layout: Horizontal */}
        <nav className="hidden md:flex items-center justify-between h-20 lg:h-24" role="navigation" aria-label="Main navigation">
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
          <div className="flex items-center space-x-4">
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
      </div>
    </header>
  )
}
