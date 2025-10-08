import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MessageSquare, CheckCircle, Clock, DollarSign, Shield, Wrench, Car, ArrowRight } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateFAQSchema, getBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Auto Glass Services Denver | Windshield Repair & Replacement | Pink Auto Glass',
  description: 'Complete auto glass services in Denver metro. Windshield repair from $89, replacement from $299. ADAS calibration included free. Mobile service, same-day appointments, lifetime warranty.',
  keywords: 'auto glass services denver, windshield services, windshield repair, windshield replacement, mobile auto glass, adas calibration denver',
  openGraph: {
    title: 'Auto Glass Services Denver | Pink Auto Glass',
    description: 'Expert windshield repair, replacement, and ADAS calibration throughout Colorado.',
    url: 'https://pinkautoglass.com/services',
    type: 'website',
  },
};

export default function ServicesPage() {
  const faqs = [
    {
      question: 'How do I know if I need repair or replacement?',
      answer: 'If the damage is smaller than a quarter and not in your direct line of sight, repair is usually possible and costs much less. Anything larger than a dollar bill, in the driver\'s view, or extending to the edge of the glass requires replacement. When in doubt, call us for a free assessment—we\'ll give you an honest recommendation.'
    },
    {
      question: 'Does insurance cover windshield repair and replacement in Colorado?',
      answer: 'Yes. Most comprehensive insurance policies in Colorado cover windshield claims with zero or reduced deductibles. Repairs are almost always 100% covered with no deductible. Replacements are often covered at $0 out of pocket as well. We verify your coverage and handle all the paperwork.'
    },
    {
      question: 'How long does each service take?',
      answer: 'Windshield repair typically takes 30-45 minutes. Full replacement takes 60-90 minutes, plus an additional 30-60 minutes if ADAS calibration is required (2018+ vehicles). We recommend waiting at least 1 hour after replacement before driving to allow proper adhesive cure time.'
    },
    {
      question: 'Do you really include ADAS calibration for free?',
      answer: 'Absolutely. ADAS calibration is required after windshield replacement on vehicles equipped with forward-facing cameras or sensors (typically 2018 and newer). This service costs $150-$300 at other shops. We include it free with every replacement because proper calibration is essential for your safety systems to work correctly.'
    },
    {
      question: 'What if I don\'t have insurance?',
      answer: 'No problem. We offer competitive cash pricing for all services. Windshield repair starts at $89, and replacement starts at $299 depending on your vehicle. We can discuss payment options when you call.'
    },
    {
      question: 'Can you really come to my location?',
      answer: 'Yes! Mobile service is our specialty. We serve the entire Denver metro area including Denver, Aurora, Lakewood, Boulder, Arvada, Thornton, Westminster, Highlands Ranch, Parker, Centennial, and surrounding cities. We come to your home, office, or any safe location. There\'s no extra charge for mobile service.'
    },
    {
      question: 'Will filing a glass claim increase my insurance rates?',
      answer: 'Typically no. Glass claims are considered "comprehensive" claims (not at-fault), which usually don\'t affect your premiums. However, every insurance policy is different. We recommend checking with your specific insurer if you have concerns.'
    },
    {
      question: 'What\'s your warranty?',
      answer: 'All our work—both repair and replacement—is backed by a lifetime warranty for as long as you own the vehicle. This covers defects in materials and workmanship, including leaks. If you experience any issues, we\'ll fix it free.'
    }
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Services', url: 'https://pinkautoglass.com/services' }
  ]);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Service",
          "name": "Windshield Replacement",
          "url": "https://pinkautoglass.com/services/windshield-replacement",
          "description": "Professional windshield replacement with OEM glass and ADAS calibration included",
          "offers": {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": "299",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "minPrice": "299"
            }
          }
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "Service",
          "name": "Windshield Repair",
          "url": "https://pinkautoglass.com/services/windshield-repair",
          "description": "Fast windshield chip and crack repair, often covered 100% by insurance",
          "offers": {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": "89"
          }
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "item": {
          "@type": "Service",
          "name": "ADAS Calibration",
          "url": "https://pinkautoglass.com/services/adas-calibration",
          "description": "Advanced Driver Assistance Systems calibration included free with windshield replacement"
        }
      },
      {
        "@type": "ListItem",
        "position": 4,
        "item": {
          "@type": "Service",
          "name": "Mobile Auto Glass Service",
          "url": "https://pinkautoglass.com/services/mobile-service",
          "description": "We come to you anywhere in Denver metro - no extra charge"
        }
      },
      {
        "@type": "ListItem",
        "position": 5,
        "item": {
          "@type": "Service",
          "name": "Insurance Claims Assistance",
          "url": "https://pinkautoglass.com/services/insurance-claims",
          "description": "We handle all insurance paperwork and billing - most claims $0 out of pocket"
        }
      }
    ]
  };

  const combinedSchema = combineSchemas(serviceSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Complete Auto Glass Services in Denver
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Expert windshield repair, replacement, and ADAS calibration • Mobile service • Same-day appointments • Lifetime warranty
              </p>
              <CTAButtons source="services-hub-hero" />
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Services', href: '/services' }]} />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Quick Decision Tool */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Which Service Do I Need?</h2>
              <p className="text-lg text-gray-700 mb-6 text-center">Not sure whether you need repair or replacement? Here's a quick guide:</p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-5 border-l-4 border-green-500 shadow-sm">
                  <div className="flex items-start mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Small chip (quarter-sized or smaller)</div>
                      <div className="text-pink-600 font-bold">Windshield Repair - $89</div>
                      <div className="text-sm text-gray-600">Often $0 with insurance</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 border-l-4 border-orange-500 shadow-sm">
                  <div className="flex items-start mb-2">
                    <CheckCircle className="w-5 h-5 text-orange-600 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Large crack (longer than 6 inches)</div>
                      <div className="text-pink-600 font-bold">Windshield Replacement - From $299</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 border-l-4 border-orange-500 shadow-sm">
                  <div className="flex items-start mb-2">
                    <CheckCircle className="w-5 h-5 text-orange-600 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Damage in driver's view</div>
                      <div className="text-pink-600 font-bold">Windshield Replacement - From $299</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 border-l-4 border-orange-500 shadow-sm">
                  <div className="flex items-start mb-2">
                    <CheckCircle className="w-5 h-5 text-orange-600 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Multiple chips or cracks</div>
                      <div className="text-pink-600 font-bold">Windshield Replacement - From $299</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 border-l-4 border-orange-500 shadow-sm">
                  <div className="flex items-start mb-2">
                    <CheckCircle className="w-5 h-5 text-orange-600 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Edge damage (crack reaches edge)</div>
                      <div className="text-pink-600 font-bold">Windshield Replacement - From $299</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 border-l-4 border-blue-500 shadow-sm">
                  <div className="flex items-start mb-2">
                    <Phone className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Not sure?</div>
                      <a href="tel:+17209187465" className="text-blue-600 font-bold hover:underline">Call (720) 918-7465</a>
                      <div className="text-sm text-gray-600">Free assessment</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Service Cards */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Our Complete Service Menu</h2>
            <p className="text-lg text-gray-700 mb-12 text-center max-w-4xl mx-auto">
              Pink Auto Glass provides comprehensive auto glass services throughout the Denver metro area. Whether you need a quick chip repair or complete windshield replacement with ADAS calibration, our certified technicians deliver exceptional results with a lifetime warranty. We come to you with our fully equipped mobile units—no shop visit required.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {/* Windshield Replacement Card */}
              <div className="bg-white rounded-xl shadow-lg border-2 border-pink-200 hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-6 rounded-t-xl">
                  <Wrench className="w-12 h-12 mb-3" />
                  <h3 className="text-2xl font-bold mb-2">Windshield Replacement</h3>
                  <div className="text-3xl font-bold">From $299</div>
                  <div className="text-pink-100 flex items-center mt-2">
                    <Clock className="w-4 h-4 mr-2" />
                    60-90 minutes
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>OEM-quality glass for your specific vehicle</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Complete removal and professional installation</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>ADAS calibration included free</strong> (2018+ vehicles)</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Lifetime warranty on materials and workmanship</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Mobile service to your location</span>
                    </li>
                  </ul>
                  <h4 className="font-semibold text-gray-900 mb-2">When You Need This:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 mb-6">
                    <li>• Cracks longer than 6 inches</li>
                    <li>• Damage in your line of sight</li>
                    <li>• Edge-to-edge cracks</li>
                    <li>• Multiple chips or previous repairs</li>
                  </ul>
                  <Link
                    href="/services/windshield-replacement"
                    className="block text-center bg-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-700 transition-colors mb-2"
                  >
                    Learn More
                  </Link>
                  <Link
                    href="/book"
                    className="block text-center bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Get Free Quote
                  </Link>
                </div>
              </div>

              {/* Windshield Repair Card */}
              <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
                  <Shield className="w-12 h-12 mb-3" />
                  <h3 className="text-2xl font-bold mb-2">Windshield Repair</h3>
                  <div className="text-3xl font-bold">From $89</div>
                  <div className="text-green-100 flex items-center mt-2">
                    <Clock className="w-4 h-4 mr-2" />
                    30-45 minutes
                  </div>
                </div>
                <div className="p-6">
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 mb-4 rounded">
                    <p className="text-sm font-semibold text-green-900">Often $0 with insurance!</p>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Professional resin injection repair</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Optical clarity restoration</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Prevents crack spreading</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Lifetime warranty</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Mobile service to your location</span>
                    </li>
                  </ul>
                  <h4 className="font-semibold text-gray-900 mb-2">When You Need This:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 mb-6">
                    <li>• Chips smaller than a quarter</li>
                    <li>• Cracks under 6 inches</li>
                    <li>• Damage not in driver's direct view</li>
                    <li>• Recent damage (repair works best when fresh)</li>
                  </ul>
                  <Link
                    href="/services/windshield-repair"
                    className="block text-center bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors mb-2"
                  >
                    Learn More
                  </Link>
                  <Link
                    href="/book"
                    className="block text-center bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Book Repair Now
                  </Link>
                </div>
              </div>

              {/* ADAS Calibration Card */}
              <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
                  <Car className="w-12 h-12 mb-3" />
                  <h3 className="text-2xl font-bold mb-2">ADAS Calibration</h3>
                  <div className="text-3xl font-bold">Included FREE</div>
                  <div className="text-blue-100 flex items-center mt-2">
                    <Clock className="w-4 h-4 mr-2" />
                    30-60 minutes
                  </div>
                </div>
                <div className="p-6">
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-4 rounded">
                    <p className="text-sm font-semibold text-yellow-900">Save $150-$300 - We include this free!</p>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-3">Systems That Require Calibration:</h4>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Lane Departure Warning</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Automatic Emergency Braking</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Adaptive Cruise Control</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Forward Collision Warning</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Lane Keep Assist</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-700 mb-6">
                    Federal regulations require ADAS recalibration after windshield replacement on equipped vehicles (typically 2018+). Without proper calibration, these life-saving safety features may not work correctly.
                  </p>
                  <Link
                    href="/services/adas-calibration"
                    className="block text-center bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* Mobile Service Card */}
              <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-xl">
                  <Car className="w-12 h-12 mb-3" />
                  <h3 className="text-2xl font-bold mb-2">Mobile Service</h3>
                  <div className="text-3xl font-bold">No Extra Charge</div>
                  <div className="text-purple-100 text-sm mt-2">Entire Denver Metro Area</div>
                </div>
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">How It Works:</h4>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-0.5">1</div>
                      <div className="text-sm">
                        <strong>Call or book online</strong> - Schedule at your preferred time and location
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-0.5">2</div>
                      <div className="text-sm">
                        <strong>We come to you</strong> - Home, office, parking lot, or roadside
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-0.5">3</div>
                      <div className="text-sm">
                        <strong>We do the work</strong> - Fully equipped mobile units handle everything on-site
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-0.5">4</div>
                      <div className="text-sm">
                        <strong>You're done</strong> - Back to your day in 60-90 minutes
                      </div>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Where We Come:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 mb-6">
                    <li>• Your home driveway</li>
                    <li>• Office parking lot</li>
                    <li>• Shopping center (while you shop)</li>
                    <li>• Anywhere in our service area</li>
                  </ul>
                  <Link
                    href="/services/mobile-service"
                    className="block text-center bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* Insurance Claims Card */}
              <div className="bg-white rounded-xl shadow-lg border-2 border-teal-200 hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-t-xl">
                  <DollarSign className="w-12 h-12 mb-3" />
                  <h3 className="text-2xl font-bold mb-2">Insurance Claims</h3>
                  <div className="text-3xl font-bold">We Handle Everything</div>
                  <div className="text-teal-100 text-sm mt-2">Most Claims: $0 Out of Pocket</div>
                </div>
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">What We Do:</h4>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Verify your insurance coverage</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>File the claim on your behalf</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Communicate directly with your insurer</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Handle all paperwork</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Bill insurance directly</span>
                    </li>
                  </ul>
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 mb-4 rounded">
                    <p className="text-sm font-semibold text-green-900">Colorado Law: Most comprehensive policies cover windshield replacement with zero deductible.</p>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">We Work With All Major Insurers:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 mb-6">
                    <div>• State Farm</div>
                    <div>• Geico</div>
                    <div>• Progressive</div>
                    <div>• Allstate</div>
                    <div>• USAA</div>
                    <div>• And all others</div>
                  </div>
                  <Link
                    href="/services/insurance-claims"
                    className="block text-center bg-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Service Comparison Table */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Repair vs. Replacement: At a Glance</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Factor</th>
                      <th className="px-6 py-4 text-left font-semibold">Windshield Repair</th>
                      <th className="px-6 py-4 text-left font-semibold">Windshield Replacement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Best For</td>
                      <td className="px-6 py-4 text-gray-700">Chips under ¼", cracks under 6"</td>
                      <td className="px-6 py-4 text-gray-700">Large cracks, multiple chips, edge damage</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Time Required</td>
                      <td className="px-6 py-4 text-gray-700">30-45 minutes</td>
                      <td className="px-6 py-4 text-gray-700">60-90 minutes (+ calibration if needed)</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Typical Cost</td>
                      <td className="px-6 py-4 text-gray-700">$89 (often $0 w/ insurance)</td>
                      <td className="px-6 py-4 text-gray-700">$299-$500</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Insurance</td>
                      <td className="px-6 py-4 text-gray-700">Usually 100% covered, no deductible</td>
                      <td className="px-6 py-4 text-gray-700">Often $0 deductible in Colorado</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Result</td>
                      <td className="px-6 py-4 text-gray-700">Stops spreading, restores clarity</td>
                      <td className="px-6 py-4 text-gray-700">Brand new windshield</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Warranty</td>
                      <td className="px-6 py-4 text-green-600 font-semibold">✓ Lifetime</td>
                      <td className="px-6 py-4 text-green-600 font-semibold">✓ Lifetime</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Mobile Service</td>
                      <td className="px-6 py-4 text-green-600 font-semibold">✓ Available</td>
                      <td className="px-6 py-4 text-green-600 font-semibold">✓ Available</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Drive Time</td>
                      <td className="px-6 py-4 text-gray-700">Immediate</td>
                      <td className="px-6 py-4 text-gray-700">Wait 1 hour after completion</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Colorado Insurance Section */}
          <section className="mb-16">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border-2 border-green-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Most Windshield Claims Cost You $0 in Colorado</h2>
              <p className="text-lg text-gray-700 mb-6">
                Colorado law encourages prompt windshield replacement for safety. As a result, most comprehensive insurance policies cover glass claims with zero or reduced deductibles.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">How It Works:</h3>
                  <ol className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="font-bold text-green-600 mr-2">1.</span>
                      <span>We verify your coverage (takes 5 minutes)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-green-600 mr-2">2.</span>
                      <span>File claim with your insurer</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-green-600 mr-2">3.</span>
                      <span>Your insurer approves the work</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-green-600 mr-2">4.</span>
                      <span>We complete the service</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-green-600 mr-2">5.</span>
                      <span>We bill insurance directly</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-green-600 mr-2">6.</span>
                      <span>You pay only your deductible (typically $0)</span>
                    </li>
                  </ol>
                </div>
                <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-3">Important:</h3>
                  <p className="text-gray-700 mb-4">
                    Filing a glass claim typically does <strong>NOT increase your rates</strong>. Glass claims are considered "comprehensive" (not at-fault), so they usually don't affect your premiums.
                  </p>
                  <p className="text-sm text-gray-600">
                    Don't have your policy info? No problem. We can look up your coverage with just your name, date of birth, and phone number.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Pink Auto Glass for Any Service</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-pink-500">
                <Shield className="w-10 h-10 text-pink-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Lifetime Warranty</h3>
                <p className="text-gray-700">
                  Every repair and replacement is backed by our lifetime warranty. If you experience any issues with our work, we'll fix it free—as long as you own the vehicle.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-blue-500">
                <Clock className="w-10 h-10 text-blue-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Same-Day Service</h3>
                <p className="text-gray-700">
                  Most appointments completed within hours of your call. We work around your schedule with flexible availability 7 days a week.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-purple-500">
                <Wrench className="w-10 h-10 text-purple-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Certified Technicians</h3>
                <p className="text-gray-700">
                  Our team is trained and certified in the latest auto glass techniques, including ADAS calibration for all vehicle makes and models.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-green-500">
                <CheckCircle className="w-10 h-10 text-green-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">OEM Quality Guaranteed</h3>
                <p className="text-gray-700">
                  We use only OEM or OEM-equivalent glass that meets Federal Motor Vehicle Safety Standards. Perfect fit and optical clarity guaranteed.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-yellow-500">
                <DollarSign className="w-10 h-10 text-yellow-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Free ADAS Calibration</h3>
                <p className="text-gray-700">
                  We include this $150-$300 service free with every replacement on equipped vehicles. Your safety systems work correctly, and you save money.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-pink-500">
                <Car className="w-10 h-10 text-pink-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Transparent Pricing</h3>
                <p className="text-gray-700">
                  You'll know your exact cost before we start. No hidden fees, no surprises. We tell you your out-of-pocket amount upfront.
                </p>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="max-w-4xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group">
                  <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                    {faq.question}
                    <span className="text-pink-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-gray-700 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Service Areas & Popular Vehicles */}
          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Service Areas */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Areas</h2>
                <p className="text-gray-700 mb-4">We provide all auto glass services throughout the Denver metro area:</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Denver', slug: 'denver-co' },
                    { name: 'Aurora', slug: 'aurora-co' },
                    { name: 'Lakewood', slug: 'lakewood-co' },
                    { name: 'Boulder', slug: 'boulder-co' },
                    { name: 'Highlands Ranch', slug: 'highlands-ranch-co' },
                    { name: 'Thornton', slug: 'thornton-co' },
                    { name: 'Arvada', slug: 'arvada-co' },
                    { name: 'Westminster', slug: 'westminster-co' },
                    { name: 'Parker', slug: 'parker-co' },
                    { name: 'Centennial', slug: 'centennial-co' },
                  ].map(location => (
                    <Link
                      key={location.slug}
                      href={`/locations/${location.slug}`}
                      className="text-pink-600 hover:underline text-sm"
                    >
                      {location.name} →
                    </Link>
                  ))}
                </div>
              </div>

              {/* Popular Vehicles */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Vehicles We Service</h2>
                <p className="text-gray-700 mb-4">Get vehicle-specific pricing and information:</p>
                <div className="space-y-2">
                  {[
                    { name: 'Toyota Camry', slug: 'toyota-camry-windshield-replacement-denver' },
                    { name: 'Honda Accord', slug: 'honda-accord-windshield-replacement-denver' },
                    { name: 'Subaru Outback', slug: 'subaru-outback-windshield-replacement-denver' },
                    { name: 'Ford F-150', slug: 'ford-f150-windshield-replacement-denver' },
                    { name: 'Toyota RAV4', slug: 'toyota-rav4-windshield-replacement-denver' },
                    { name: 'Honda CR-V', slug: 'honda-cr-v-windshield-replacement-denver' },
                  ].map(vehicle => (
                    <Link
                      key={vehicle.slug}
                      href={`/vehicles/${vehicle.slug}`}
                      className="block text-pink-600 hover:underline text-sm"
                    >
                      {vehicle.name} Windshield Replacement →
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Your Windshield Fixed?</h2>
            <p className="text-xl mb-8 text-pink-100">
              Same-day appointments available throughout Denver metro. Free quotes. Expert service. Lifetime warranty.
            </p>
            <CTAButtons source="services-hub-bottom" />
          </section>
        </div>
      </div>
    </>
  );
}
