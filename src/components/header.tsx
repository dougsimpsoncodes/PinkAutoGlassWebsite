"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { resolveMarket, getPhoneForMarket } from "@/lib/market"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (pathname?.startsWith('/admin')) return null

  const market = resolveMarket(pathname)
  const { displayPhone, phoneE164 } = getPhoneForMarket(market)
  const tel = `tel:${phoneE164}`

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
        {/* Mobile Layout: Horizontal — logo left, phone right */}
        <nav className="md:hidden flex items-center justify-between py-2" role="navigation" aria-label="Main navigation">
          <Link
            href="/"
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded"
            aria-label="Pink Auto Glass - Go to homepage"
          >
            <Image
              src="/pink-logo-horizontal.png"
              alt="Pink Auto Glass - Mobile Windshield Repair & Replacement Denver"
              width={500}
              height={500}
              className="w-auto"
              style={{ height: '56px' }}
              priority
            />
          </Link>

          <a
            href={tel}
            className="flex items-center space-x-1.5 text-gray-700 hover:text-pink-600 transition-colors text-base font-medium min-h-[44px] px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded"
            aria-label="Call Pink Auto Glass"
          >
            <Phone className="w-5 h-5" />
            <span>{displayPhone}</span>
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
                width={500}
                height={500}
                className="w-auto"
                style={{ height: '120px' }}
                priority
              />
            </Link>
          </div>

          {/* CTA Section (Right) */}
          <div className="flex items-center space-x-4">
            <a
              href={tel}
              className="flex items-center space-x-2 text-gray-700 hover:text-pink-500 transition-colors"
              aria-label="Call Pink Auto Glass"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">{displayPhone}</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
