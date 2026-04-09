import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Clock, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Greeley CO | Mobile, $0 Deductible',
  description: 'Mobile windshield replacement & repair in Greeley CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair greeley, windshield replacement greeley, auto glass greeley, mobile windshield service greeley co',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/greeley-co',
  },
  openGraph: {
    title: 'Windshield Replacement Greeley CO | Mobile, $0 Deductible',
    description: 'Mobile windshield replacement & repair in Greeley CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/greeley-co',
    type: 'website',
  },
};

export default function GreeleyLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Greeley?',
      answer: 'Yes! Mobile service is our specialty in Greeley. We come to your home, office, or anywhere in Greeley and surrounding Weld County areas. Whether you\'re downtown near UNC, in west Greeley, or anywhere else, we\'ll come to you with our fully equipped mobile units.'
    },
    {
      question: 'How quickly can you replace a windshield in Greeley?',
      answer: 'We offer same-day windshield replacement throughout Greeley. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What areas of Greeley do you serve?',
      answer: 'We serve all of Greeley including: downtown Greeley, University of Northern Colorado campus area, west Greeley, Centerplace, Garden City, and all surrounding areas. If you\'re in the Greeley area, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Greeley?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Greeley residents.'
    },
    {
      question: 'Can Pink Auto Glass service my farm equipment windshield in the Greeley area?',
      answer: 'While we primarily focus on automotive windshields, we encourage you to call us to discuss your specific farm equipment needs. We might be able to assist or point you in the right direction for specialized agricultural glass services in the Greeley area.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Greeley',
    state: 'CO',
    zipCode: '80631',
    latitude: 40.4233,
    longitude: -104.7091,
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Greeley, CO', url: 'https://pinkautoglass.com/locations/greeley-co' }
  ]);

  const combinedSchema = combineSchemas(localBusinessSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 page-top-padding">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 mr-2" />
                <span className="text-xl">Greeley, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Greeley's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Greeley\'s unique mix of agricultural routes, heavy US-34 and US-85 traffic, and exposure to plains weather can be tough on windshields. From farm equipment kicking up debris to severe hailstorms, drivers often find themselves in need of glass repair.
              </p>
              <CTAButtons source="greeley-hero" />
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
          <Breadcrumbs
            items={[
              { label: 'Locations', href: '/locations' },
              { label: 'Greeley, CO', href: '/locations/greeley-co' }
            ]}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Why Greeley Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Greeley Residents Choose Pink Auto Glass
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Greeley's agricultural setting and highway traffic on US-34 and US-85 can be tough on windshields. From gravel trucks and farm equipment on rural roads to sudden hailstorms sweeping across the plains, your windshield faces unique challenges in Weld County. Pink Auto Glass is Greeley's trusted solution for fast, professional auto glass repair and replacement.
                </p>

                <AboveFoldCTA location="location-greeley" />

              {/* Windshield Damage in Greeley */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Greeley
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Debris from agricultural vehicles on rural roads.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Rocks and gravel from heavy truck traffic on US-34 and US-85.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Severe hailstorms, common in Northern Colorado.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Dust and small stones from unpaved roads and construction sites.</span>
                  </li>
                </ul>
              </section>

              {/* Our Services */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Services in Greeley
                </h2>
                <p className="text-gray-700 mb-4">
                  We bring a full range of auto glass services directly to you in Greeley:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Link href="/services/windshield-replacement" className="bg-white border border-gray-200 rounded-lg p-3 hover:border-pink-300 hover:shadow-sm transition-all">
                    <span className="font-semibold text-gray-900">Windshield Replacement</span>
                    <span className="block text-sm text-gray-600">Full replacement with OEM glass</span>
                  </Link>
                  <Link href="/services/windshield-repair" className="bg-white border border-gray-200 rounded-lg p-3 hover:border-pink-300 hover:shadow-sm transition-all">
                    <span className="font-semibold text-gray-900">Chip & Crack Repair</span>
                    <span className="block text-sm text-gray-600">30-minute service, often $0</span>
                  </Link>
                  <Link href="/services/adas-calibration" className="bg-white border border-gray-200 rounded-lg p-3 hover:border-pink-300 hover:shadow-sm transition-all">
                    <span className="font-semibold text-gray-900">ADAS Calibration</span>
                    <span className="block text-sm text-gray-600">Camera recalibration after replacement</span>
                  </Link>
                  <Link href="/services/insurance-claims" className="bg-white border border-gray-200 rounded-lg p-3 hover:border-pink-300 hover:shadow-sm transition-all">
                    <span className="font-semibold text-gray-900">Insurance Claims</span>
                    <span className="block text-sm text-gray-600">We handle all paperwork — $0 often</span>
                  </Link>
                </div>
              </section>

                <p className="text-lg text-gray-700 mb-4">
                  We understand Greeley life. Whether you're commuting to work, visiting the UNC campus, or heading to one of Greeley's many community events, we bring our services to you. Our mobile units serve all of Greeley and surrounding areas.
                </p>
              </section>

              {/* Local Tips & FAQs */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Greeley Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Highway 34 and 85 see heavy agricultural traffic, and gravel roads outside town can kick up debris. Greeley's prairie location also means severe hail is a constant risk during spring and summer. We provide mobile service throughout Greeley and Weld County.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">Do you serve rural areas outside Greeley?</h3>
                    <p>Yes. We provide mobile service to surrounding Weld County communities including Evans, Garden City, and rural areas.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Can you handle farm vehicle windshields?</h3>
                    <p>Absolutely. We service all types of vehicles including trucks, farm equipment, and commercial vehicles.</p>
                  </div>
                </div>
              </section>

              {/* Service Area */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Greeley Service Area
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  We provide mobile windshield repair and replacement throughout Greeley and surrounding areas:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Downtown Greeley</span>
                    </li>
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>UNC Campus Area</span>
                    </li>
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>West Greeley</span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Centerplace</span>
                    </li>
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Evans</span>
                    </li>
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Garden City</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Services */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Greeley Auto Glass Services
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-pink-500">
                    <h3 className="text-xl font-bold mb-3">Windshield Replacement</h3>
                    <p className="text-gray-700">
                      Full windshield replacement with OEM quality glass. We handle all makes and models, including trucks and agricultural vehicles.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold mb-3">Windshield Repair</h3>
                    <p className="text-gray-700">
                      Fix chips and small cracks before they spread. Most repairs completed in under 30 minutes at your location.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold mb-3">ADAS Calibration</h3>
                    <p className="text-gray-700">
                      Advanced driver assistance system calibration included with windshield replacement on equipped vehicles.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <h3 className="text-xl font-bold mb-3">Insurance Claims</h3>
                    <p className="text-gray-700">
                      We handle all insurance paperwork and billing. Work with all major insurance providers.
                    </p>
                  </div>
                </div>
              </section>

              {/* FAQs */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions - Greeley
                </h2>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {faq.question}
                      </h3>
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">

                {/* Contact Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-pink-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Service Today</h3>
                  <div className="space-y-4">
                    <a
                      href="tel:+17209187465"
                      className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                    >
                      <Phone className="w-5 h-5" />
                      (720) 918-7465
                    </a>
                    <Link
                      href="/book"
                      className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-pink-600 font-bold py-3 px-6 rounded-lg border-2 border-pink-600 transition-all"
                    >
                      Book Online
                    </Link>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-start gap-3 text-sm text-gray-600 mb-3">
                      <Clock className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900">Hours</div>
                        <div>7 Days a Week</div>
                        <div>7:00 AM - 7:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <MapPin className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900">Service Area</div>
                        <div>Greeley & Weld County</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why Choose Us */}
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Why Choose Us</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Shield className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Lifetime Warranty</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">200+ 5-Star Reviews</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Same-Day Service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Mobile Service to You</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Fix Your Windshield in Greeley?
            </h2>
            <p className="text-xl mb-8 text-pink-100">
              Same-day mobile service throughout Greeley and Weld County
            </p>
            <CTAButtons source="greeley-footer" />
          </div>
        </section>

      </div>
    </>
  );
}
