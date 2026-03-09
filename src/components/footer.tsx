'use client';

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  const pathname = usePathname();
  const isAZ = pathname ? /\/-[a-z]+-az(\/|$)/.test(pathname) || pathname.includes('-az') : false;
  const phone = isAZ ? '(480) 712-7465' : '(720) 918-7465';
  const phoneHref = isAZ ? 'tel:+14807127465' : 'tel:+17209187465';

  return (
    <footer className="bg-navy-900 text-white" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Company Info & Logo */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                {/* Logo placeholder */}
                <div className="h-6 w-auto mb-4 bg-gradient-primary text-white px-3 py-1 rounded font-display font-bold text-sm inline-block">
                  Pink Auto Glass
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Professional mobile windshield repair and replacement throughout Colorado and Arizona.
                  We come to you with same-day service and lifetime warranty.
                </p>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-pink-400 flex-shrink-0" />
                  <a
                    href={phoneHref}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {phone}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-pink-400 flex-shrink-0" />
                  <a 
                    href="mailto:service@pinkautoglass.com" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    service@pinkautoglass.com
                  </a>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">
                    Mobile Service Throughout<br />
                    Colorado &amp; Arizona
                  </span>
                </div>
              </div>
            </div>
            
            {/* Services */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Services</h3>
              <ul className="space-y-2">
                {[
                  { href: "/services/windshield-replacement", label: "Windshield Replacement" },
                  { href: "/services/windshield-repair", label: "Rock Chip Repair" },
                  { href: "/services/mobile-service", label: "Mobile Service" },
                  { href: "/services/adas-calibration", label: "ADAS Calibration" },
                  { href: "/services/insurance-claims", label: "Insurance Claims" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/services"
                    className="text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    View All Services →
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Service Area */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Service Area</h3>
              <ul className="space-y-2">
                {[
                  { href: "/locations/denver-co", label: "Denver" },
                  { href: "/locations/aurora-co", label: "Aurora" },
                  { href: "/locations/lakewood-co", label: "Lakewood" },
                  { href: "/locations/boulder-co", label: "Boulder" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link 
                    href="/locations"
                    className="text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    View All Locations →
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2 mb-6">
                {[
                  { href: "/about", label: "About Us" },
                  { href: "/contact", label: "Contact" },
                  { href: "/blog", label: "Blog" },
                  { href: "/vehicles", label: "Find Your Vehicle" },
                  { href: "/careers", label: "Careers" },
                  { href: "/privacy", label: "Privacy Policy" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              
              {/* Social Media */}
              <div>
                <h4 className="font-medium mb-3">Follow Us</h4>
                <div className="flex space-x-4">
                  <a 
                    href="https://www.facebook.com/PinkAutoGlassDenver" 
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Follow us on Facebook"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a 
                    href="https://www.instagram.com/pinkautoglassdenver" 
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Follow us on Instagram"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a 
                    href="https://www.linkedin.com/company/pink-auto-glass" 
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Follow us on LinkedIn"
                  >
                    <Linkedin className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Auto Glass Resources */}
        <div className="border-t border-gray-700 py-8">
          <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wider mb-4">Auto Glass Resources</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { href: 'https://aurorawindshield.com', label: 'Aurora Windshield Replacement' },
              { href: 'https://cheapestwindshieldnearme.com', label: 'Cheapest Windshield Near Me' },
              { href: 'https://getawindshieldquote.com', label: 'Get a Windshield Quote' },
              { href: 'https://mobilewindshielddenver.com', label: 'Mobile Windshield Denver' },
              { href: 'https://newwindshieldcost.com', label: 'New Windshield Cost' },
              { href: 'https://newwindshieldnearme.com', label: 'New Windshield Near Me' },
              { href: 'https://windshieldchiprepairboulder.com', label: 'Windshield Chip Repair Boulder' },
              { href: 'https://windshieldchiprepairdenver.com', label: 'Windshield Chip Repair Denver' },
              { href: 'https://windshieldcostcalculator.com', label: 'Windshield Cost Calculator' },
              { href: 'https://windshielddenver.com', label: 'Windshield Denver' },
              { href: 'https://windshieldpricecompare.com', label: 'Windshield Price Compare' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
              <p>&copy; 2026 Pink Auto Glass. All rights reserved.</p>
              <div className="flex space-x-4">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/sitemap" className="hover:text-white transition-colors">
                  Sitemap
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Licensed & Insured</span>
              <span>•</span>
              <span>Lifetime Warranty</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}