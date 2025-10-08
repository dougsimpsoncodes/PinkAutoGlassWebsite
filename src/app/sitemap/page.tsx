import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Wrench, Car, FileText, Briefcase } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Sitemap | Pink Auto Glass Denver',
  description: 'Complete sitemap of Pink Auto Glass website. Find all our pages including services, locations, vehicle information, and company resources.',
  alternates: {
    canonical: 'https://pinkautoglass.com/sitemap',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SitemapPage() {
  const services = [
    { name: 'Windshield Replacement', href: '/services/windshield-replacement' },
    { name: 'Windshield Repair', href: '/services/windshield-repair' },
    { name: 'ADAS Calibration', href: '/services/adas-calibration' },
    { name: 'Mobile Service', href: '/services/mobile-service' },
    { name: 'Insurance Claims', href: '/services/insurance-claims' },
  ];

  const locations = [
    { name: 'Denver', href: '/locations/denver-co' },
    { name: 'Aurora', href: '/locations/aurora-co' },
    { name: 'Lakewood', href: '/locations/lakewood-co' },
    { name: 'Boulder', href: '/locations/boulder-co' },
    { name: 'Thornton', href: '/locations/thornton-co' },
    { name: 'Arvada', href: '/locations/arvada-co' },
    { name: 'Westminster', href: '/locations/westminster-co' },
    { name: 'Centennial', href: '/locations/centennial-co' },
    { name: 'Parker', href: '/locations/parker-co' },
    { name: 'Highlands Ranch', href: '/locations/highlands-ranch-co' },
  ];

  const vehicleBrands = [
    'Chevrolet', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Jeep',
    'Mazda', 'Nissan', 'Ram', 'Subaru', 'Tesla', 'Toyota'
  ];

  const companyPages = [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Careers', href: '/careers' },
    { name: 'Blog', href: '/blog' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ];

  const mainPages = [
    { name: 'Home', href: '/' },
    { name: 'Get Free Quote', href: '/book' },
    { name: 'Track Your Request', href: '/track' },
    { name: 'All Services', href: '/services' },
    { name: 'All Locations', href: '/locations' },
    { name: 'Find Your Vehicle', href: '/vehicles' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="pt-16 md:pt-20">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Sitemap' },
            ]}
          />
        </div>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Site Map
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Navigate our entire website with ease. Find services, locations, vehicle information, and company resources all in one place.
            </p>
          </div>

          {/* Main Pages */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                <FileText className="w-5 h-5 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Main Pages</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {mainPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
                >
                  → {page.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Services</h2>
            </div>
            <div className="mb-4">
              <Link
                href="/services"
                className="text-pink-600 hover:text-pink-700 font-semibold text-lg"
              >
                → View All Services
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-3 pl-4">
              {services.map((service) => (
                <Link
                  key={service.href}
                  href={service.href}
                  className="text-gray-700 hover:text-pink-600 transition-colors"
                >
                  • {service.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Service Areas</h2>
            </div>
            <div className="mb-4">
              <Link
                href="/locations"
                className="text-pink-600 hover:text-pink-700 font-semibold text-lg"
              >
                → View All Locations
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-3 pl-4">
              {locations.map((location) => (
                <Link
                  key={location.href}
                  href={location.href}
                  className="text-gray-700 hover:text-pink-600 transition-colors"
                >
                  • {location.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Vehicles */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <Car className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Vehicles</h2>
            </div>
            <div className="mb-4">
              <Link
                href="/vehicles"
                className="text-pink-600 hover:text-pink-700 font-semibold text-lg"
              >
                → Find Your Vehicle
              </Link>
            </div>
            <div className="mb-4 pl-4">
              <h3 className="font-semibold text-gray-900 mb-3">Browse by Make:</h3>
              <div className="grid md:grid-cols-4 gap-3">
                {vehicleBrands.map((brand) => (
                  <Link
                    key={brand}
                    href={`/vehicles/brands/${brand.toLowerCase()}`}
                    className="text-gray-700 hover:text-pink-600 transition-colors"
                  >
                    • {brand}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Company Pages */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                <Briefcase className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Company</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {companyPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="text-gray-700 hover:text-pink-600 transition-colors"
                >
                  → {page.name}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl shadow-xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 text-pink-50">
              Get a free quote for your windshield repair or replacement in just 2 minutes
            </p>
            <Link
              href="/book"
              className="inline-block bg-white text-pink-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Get Free Quote Now
            </Link>
          </div>

          {/* XML Sitemap Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Looking for our XML sitemap for search engines?{' '}
              <a
                href="/sitemap.xml"
                className="text-pink-600 hover:text-pink-700 font-semibold"
              >
                View sitemap.xml
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
