import { Metadata } from 'next';
import Link from 'next/link';
import { Check, Phone, Calendar, Shield, DollarSign, Car, Truck, AlertCircle } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustBadges from '@/components/TrustBadges';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: "Windshield Replacement Cost Denver 2025 | Pricing Guide | Pink Auto Glass",
  description: "See windshield replacement costs in Denver by vehicle type. Transparent pricing, insurance coverage info, and instant quotes. Most customers pay $0 with insurance.",
  keywords: "windshield replacement cost denver, auto glass prices denver, windshield cost, insurance windshield replacement",
  alternates: {
    canonical: 'https://pinkautoglass.com/pricing',
  },
  openGraph: {
    title: "Windshield Replacement Cost Denver | Pink Auto Glass",
    description: "Transparent pricing for windshield replacement in Denver. Get instant quote. Most pay $0 with insurance.",
    url: "https://pinkautoglass.com/pricing",
    siteName: "Pink Auto Glass",
    type: "website",
  },
};

export default function PricingPage() {
  const pricingTiers = [
    {
      category: 'Compact Sedans',
      examples: 'Honda Civic, Toyota Corolla, Mazda3',
      priceRange: '$300 - $480',
      features: ['Standard windshield', 'Mobile service included', 'Lifetime warranty'],
      icon: Car,
      popular: false
    },
    {
      category: 'Mid-Size Vehicles',
      examples: 'Honda Accord, Toyota Camry, Subaru Outback',
      priceRange: '$350 - $550',
      features: ['OEM-quality glass', 'Mobile service included', 'ADAS calibration if needed', 'Lifetime warranty'],
      icon: Car,
      popular: true
    },
    {
      category: 'SUVs & Trucks',
      examples: 'Toyota RAV4, Ford F-150, Jeep Wrangler',
      priceRange: '$380 - $650',
      features: ['OEM-quality glass', 'Mobile service included', 'ADAS calibration included', 'Lifetime warranty'],
      icon: Truck,
      popular: false
    },
    {
      category: 'Premium & ADAS Vehicles',
      examples: 'Tesla, BMW, Mercedes, Subaru EyeSight',
      priceRange: '$450 - $800+',
      features: ['OEM glass required', 'Advanced ADAS calibration', 'Mobile service included', 'Lifetime warranty', 'Specialized equipment'],
      icon: Car,
      popular: false
    }
  ];

  const costFactors = [
    {
      title: 'Vehicle Size',
      description: 'Larger windshields require more glass and labor. Trucks and SUVs typically cost more than compact sedans.',
      impact: 'Moderate'
    },
    {
      title: 'ADAS Features',
      description: 'Vehicles with Advanced Driver Assistance Systems need calibration after replacement. Required by federal law for 2018+ vehicles.',
      impact: 'High'
    },
    {
      title: 'Glass Type',
      description: 'OEM glass costs more than aftermarket but ensures perfect fit and proper ADAS function. We recommend OEM for ADAS vehicles.',
      impact: 'Moderate'
    },
    {
      title: 'Special Features',
      description: 'Heated windshields, acoustic layers, HUD, rain sensors add to cost. These features enhance comfort and safety.',
      impact: 'Low to Moderate'
    },
    {
      title: 'Urgency',
      description: 'Same-day and emergency service available at no extra charge. We come to you anywhere in Denver metro.',
      impact: 'None'
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much does windshield replacement cost in Denver?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Windshield replacement in Denver typically costs $300-$480 for compact sedans, $350-$550 for mid-size vehicles, $380-$650 for SUVs/trucks, and $450-$800+ for premium vehicles with ADAS. Most customers with comprehensive insurance pay $0 out of pocket."
        }
      },
      {
        "@type": "Question",
        "name": "Does insurance cover windshield replacement in Colorado?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, if you have comprehensive coverage, most insurance companies in Colorado cover windshield replacement with zero deductible. We verify your coverage and handle all paperwork for you."
        }
      },
      {
        "@type": "Question",
        "name": "Is ADAS calibration included in the price?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, ADAS calibration is included in our windshield replacement price when required. We never charge it as a separate add-on. Federal law requires calibration for 2018+ vehicles with safety systems."
        }
      },
      {
        "@type": "Question",
        "name": "Do you charge extra for mobile service?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, mobile service is always free. We come to your home or office anywhere in the Denver metro area at no additional charge."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="page-top-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs items={[{ label: 'Pricing', href: '/pricing' }]} />

          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Windshield Replacement Cost in Denver
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Transparent pricing with no hidden fees. Most customers with insurance pay $0 out of pocket.
            </p>
            <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <DollarSign className="w-8 h-8 text-pink-600" />
                <span className="text-3xl font-bold text-pink-600">$0</span>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                Most Common Out-of-Pocket Cost with Insurance
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Colorado insurance typically covers windshield replacement with zero deductible
              </p>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Pricing by Vehicle Type</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingTiers.map((tier, index) => {
                const Icon = tier.icon;
                return (
                  <div
                    key={index}
                    className={`bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-105 ${
                      tier.popular ? 'border-4 border-pink-500 relative' : 'border border-gray-200'
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                        Most Popular
                      </div>
                    )}
                    <div className="text-center mb-4">
                      <div className="inline-block p-3 bg-pink-100 rounded-full mb-3">
                        <Icon className="w-8 h-8 text-pink-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{tier.category}</h3>
                      <p className="text-sm text-gray-600 mb-4">{tier.examples}</p>
                      <div className="text-3xl font-bold text-pink-600">{tier.priceRange}</div>
                      <p className="text-xs text-gray-500 mt-1">Without insurance</p>
                    </div>
                    <ul className="space-y-2">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <p className="text-sm text-gray-600 mb-4">
                All prices include mobile service, installation, and lifetime warranty. ADAS calibration included when required.
              </p>
              <Link
                href="/book"
                className="inline-block bg-pink-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-700 transition-colors"
              >
                Get Your Exact Quote
              </Link>
            </div>
          </div>

          {/* Cost Factors */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">What Affects Windshield Replacement Cost?</h2>
            <div className="space-y-4">
              {costFactors.map((factor, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{factor.title}</h3>
                      <p className="text-gray-600">{factor.description}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                      factor.impact === 'High' ? 'bg-red-100 text-red-700' :
                      factor.impact === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                      factor.impact === 'None' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {factor.impact}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insurance Coverage Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-center mb-6">Insurance Coverage in Colorado</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                    <h3 className="text-xl font-bold">With Comprehensive</h3>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                      <span>Typically $0 deductible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                      <span>We handle all paperwork</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                      <span>Direct billing to insurer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                      <span>Won't raise your rates</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                    <h3 className="text-xl font-bold">Without Insurance</h3>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-orange-600 mt-0.5" />
                      <span>Competitive cash pricing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-orange-600 mt-0.5" />
                      <span>No hidden fees</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-orange-600 mt-0.5" />
                      <span>Same quality service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-orange-600 mt-0.5" />
                      <span>Payment plans available</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold mb-4">
                  We verify your coverage before starting work - no surprises!
                </p>
                <a
                  href="tel:+17209187465"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call for Insurance Verification
                </a>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Pricing FAQs</h2>
            <div className="space-y-4">
              <details className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <summary className="text-xl font-bold cursor-pointer">
                  How much does windshield replacement cost in Denver?
                </summary>
                <p className="mt-4 text-gray-600">
                  Windshield replacement in Denver typically costs $300-$480 for compact sedans, $350-$550 for mid-size vehicles, $380-$650 for SUVs/trucks, and $450-$800+ for premium vehicles with ADAS. Most customers with comprehensive insurance pay $0 out of pocket.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <summary className="text-xl font-bold cursor-pointer">
                  Does insurance cover windshield replacement in Colorado?
                </summary>
                <p className="mt-4 text-gray-600">
                  Yes, if you have comprehensive coverage, most insurance companies in Colorado cover windshield replacement with zero deductible. We verify your coverage and handle all paperwork for you.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <summary className="text-xl font-bold cursor-pointer">
                  Is ADAS calibration included in the price?
                </summary>
                <p className="mt-4 text-gray-600">
                  Yes, ADAS calibration is included in our windshield replacement price when required. We never charge it as a separate add-on. Federal law requires calibration for 2018+ vehicles with safety systems.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <summary className="text-xl font-bold cursor-pointer">
                  Do you charge extra for mobile service?
                </summary>
                <p className="mt-4 text-gray-600">
                  No, mobile service is always free. We come to your home or office anywhere in the Denver metro area at no additional charge.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <summary className="text-xl font-bold cursor-pointer">
                  What's the difference between OEM and aftermarket glass pricing?
                </summary>
                <p className="mt-4 text-gray-600">
                  OEM glass typically costs $50-$150 more than aftermarket but ensures perfect fit and proper ADAS function. We recommend OEM for vehicles with advanced safety systems. Your insurance may cover OEM glass.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <summary className="text-xl font-bold cursor-pointer">
                  Will filing a windshield claim raise my insurance rates?
                </summary>
                <p className="mt-4 text-gray-600">
                  No, windshield replacement is typically a no-fault comprehensive claim that doesn't affect your rates. It's not like an at-fault accident. However, check with your specific carrier to confirm their policy.
                </p>
              </details>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mb-16">
            <TrustBadges variant="grid" size="md" />
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Your Exact Quote in 60 Seconds
            </h2>
            <p className="text-xl mb-8 text-pink-100">
              Fast, accurate pricing with insurance verification included
            </p>
            <CTAButtons source="pricing-page" />
          </div>
        </div>
      </div>
    </>
  );
}
