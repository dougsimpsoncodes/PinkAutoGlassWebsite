import { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Phone, AlertTriangle, Shield, MapPin, Zap, CheckCircle } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustBadges from '@/components/TrustBadges';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: "24/7 Emergency Windshield Repair Denver | Same-Day Service | Pink Auto Glass",
  description: "Emergency windshield repair and replacement in Denver. Available 24/7 for urgent auto glass needs. Same-day mobile service. Fast response for safety-critical damage.",
  keywords: "emergency windshield repair denver, 24/7 auto glass, same day windshield replacement, urgent windshield repair",
  alternates: {
    canonical: 'https://pinkautoglass.com/services/emergency-windshield-repair',
  },
  openGraph: {
    title: "24/7 Emergency Windshield Repair Denver | Pink Auto Glass",
    description: "Fast emergency windshield service in Denver. Same-day appointments. We come to you.",
    url: "https://pinkautoglass.com/services/emergency-windshield-repair",
    siteName: "Pink Auto Glass",
    type: "website",
  },
};

export default function EmergencyWindshieldRepairPage() {
  const emergencySchema = {
    "@context": "https://schema.org",
    "@type": "EmergencyService",
    "name": "Pink Auto Glass Emergency Windshield Repair",
    "description": "24/7 emergency windshield repair and replacement service in Denver",
    "provider": {
      "@type": "AutoRepair",
      "name": "Pink Auto Glass",
      "telephone": "+17209187465",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Denver",
        "addressRegion": "CO",
        "addressCountry": "US"
      }
    },
    "areaServed": {
      "@type": "State",
      "name": "Colorado"
    },
    "availableChannel": {
      "@type": "ServiceChannel",
      "servicePhone": {
        "@type": "ContactPoint",
        "telephone": "+17209187465",
        "contactType": "emergency",
        "availableLanguage": "English",
        "hoursAvailable": "Mo-Su 00:00-23:59"
      }
    }
  };

  const emergencySituations = [
    {
      title: 'Large Crack Obstructing View',
      description: 'A crack in your line of sight makes driving dangerous and illegal in Colorado.',
      urgency: 'Critical',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Shattered or Spider-Web Damage',
      description: 'Extensive cracking compromises structural integrity and visibility.',
      urgency: 'Critical',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Fast-Spreading Crack',
      description: 'Temperature changes can cause rapid expansion, especially in Colorado weather.',
      urgency: 'High',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Post-Accident Damage',
      description: 'Collision damage requires immediate attention for safety and insurance claims.',
      urgency: 'High',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Hail Storm Damage',
      description: 'Colorado hail can cause multiple chips that need quick repair before spreading.',
      urgency: 'Moderate',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Water Leaking Into Vehicle',
      description: 'Damaged seals or cracks allowing water entry can damage electronics.',
      urgency: 'High',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const whyChooseEmergency = [
    {
      title: 'Same-Day Response',
      description: 'We prioritize emergency calls and can typically arrive within 2-4 hours',
      icon: Clock
    },
    {
      title: 'Mobile Service',
      description: 'We come to you - no need to drive with dangerous windshield damage',
      icon: MapPin
    },
    {
      title: 'Insurance Assistance',
      description: 'Fast insurance verification and direct billing for urgent situations',
      icon: Shield
    },
    {
      title: 'Quality Under Pressure',
      description: 'Emergency service does not mean rushed work - we maintain our high standards',
      icon: CheckCircle
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(emergencySchema) }}
      />

      <div className="page-top-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs items={[{ label: 'Services', href: '/services' }, { label: 'Emergency Windshield Repair', href: '/services/emergency-windshield-repair' }]} />

          {/* Emergency Alert Hero */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-8 md:p-12 text-center text-white mb-12">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-16 h-16 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Emergency Windshield Repair Denver
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100">
              Same-Day Service Available - We Come to You
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="tel:+17209187465"
                className="inline-flex items-center gap-2 bg-white text-red-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Phone className="w-6 h-6" />
                Call Now: (720) 918-7465
              </a>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 bg-red-800 text-white hover:bg-red-900 font-bold py-4 px-8 rounded-lg text-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Clock className="w-6 h-6" />
                Book Emergency Service
              </Link>
            </div>
            <p className="mt-6 text-red-100 text-lg">
              Available 7 days a week - Fast response throughout Denver metro area
            </p>
          </div>

          {/* When You Need Emergency Service */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-4">When You Need Emergency Windshield Service</h2>
            <p className="text-xl text-gray-600 text-center mb-8">
              Don't wait - these situations require immediate attention
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {emergencySituations.map((situation, index) => {
                const Icon = situation.icon;
                return (
                  <div
                    key={index}
                    className={`${situation.bgColor} rounded-xl p-6 border-2 ${situation.color.replace('text-', 'border-')}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Icon className={`w-8 h-8 ${situation.color} flex-shrink-0 mt-1`} />
                      <div>
                        <h3 className="text-xl font-bold mb-2">{situation.title}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${situation.color} bg-white`}>
                          {situation.urgency} Priority
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700">{situation.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Safety Risks Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-3">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                Why Windshield Damage is a Safety Emergency
              </h2>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-xl font-bold mb-2 text-red-600">Structural Integrity Compromised</h3>
                  <p className="text-gray-700">
                    Your windshield provides up to 45% of your vehicle's structural strength in a rollover accident. Cracks weaken this critical safety component.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-xl font-bold mb-2 text-red-600">Airbag Deployment Risk</h3>
                  <p className="text-gray-700">
                    Passenger-side airbags deploy upward against the windshield. A compromised windshield may fail, preventing proper airbag function.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-xl font-bold mb-2 text-red-600">Visibility Hazard</h3>
                  <p className="text-gray-700">
                    Cracks distort vision, especially with headlight glare at night. This dramatically increases accident risk.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-xl font-bold mb-2 text-red-600">Colorado Law Violation</h3>
                  <p className="text-gray-700">
                    Driving with obstructed windshield damage is illegal in Colorado and can result in citations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Our Emergency Service */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Why Choose Pink Auto Glass for Emergencies</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyChooseEmergency.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                    <div className="inline-block p-4 bg-pink-100 rounded-full mb-4">
                      <Icon className="w-8 h-8 text-pink-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Process Timeline */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Fast Emergency Service Process</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div className="flex-1 bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-2">Call or Book Online (2 minutes)</h3>
                  <p className="text-gray-600">
                    Describe your emergency. We'll ask about damage location, size, and your location for fastest dispatch.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div className="flex-1 bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-2">Insurance Verification (5 minutes)</h3>
                  <p className="text-gray-600">
                    We verify your coverage while dispatching our mobile unit. You'll know your exact cost before we arrive.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div className="flex-1 bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-2">We Come to You (2-4 hours typical)</h3>
                  <p className="text-gray-600">
                    Our mobile unit arrives at your location with all equipment. No need to drive with dangerous damage.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  4
                </div>
                <div className="flex-1 bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-2">Professional Service (30-90 minutes)</h3>
                  <p className="text-gray-600">
                    Repair or replacement completed on-site with OEM-quality materials and lifetime warranty. ADAS calibration included.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Coverage Area */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-center mb-6">Emergency Service Coverage Area</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-8 h-8 text-pink-600" />
                    <h3 className="text-xl font-bold">Denver Metro (Priority)</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li>Denver</li>
                    <li>Aurora</li>
                    <li>Lakewood</li>
                    <li>Highlands Ranch</li>
                    <li>Littleton</li>
                    <li>Centennial</li>
                    <li>Thornton</li>
                    <li>Westminster</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-8 h-8 text-blue-600" />
                    <h3 className="text-xl font-bold">Extended Coverage</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li>Boulder</li>
                    <li>Fort Collins</li>
                    <li>Colorado Springs</li>
                    <li>Castle Rock</li>
                    <li>Parker</li>
                    <li>Arvada</li>
                    <li>Broomfield</li>
                    <li>All Colorado Front Range</li>
                  </ul>
                </div>
              </div>
              <p className="text-center mt-6 text-lg">
                Outside our coverage area? Call us - we may be able to arrange emergency service.
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mb-16">
            <TrustBadges variant="grid" size="md" />
          </div>

          {/* Final Emergency CTA */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Don't Wait - Get Emergency Service Now
            </h2>
            <p className="text-xl mb-8 text-red-100">
              Your safety is our priority. Same-day service available throughout Denver.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="tel:+17209187465"
                className="inline-flex items-center gap-2 bg-white text-red-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Phone className="w-6 h-6" />
                Emergency Line: (720) 918-7465
              </a>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 bg-red-800 text-white hover:bg-red-900 font-bold py-4 px-8 rounded-lg text-xl shadow-lg hover:shadow-xl transition-all"
              >
                Book Online Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
