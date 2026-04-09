import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Clock, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Broomfield CO | Mobile, $0 Deductible',
  description: 'Mobile windshield replacement & repair in Broomfield CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair broomfield, windshield replacement broomfield, auto glass broomfield, mobile windshield service broomfield co',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/broomfield-co',
  },
  openGraph: {
    title: 'Windshield Replacement Broomfield CO | Mobile, $0 Deductible',
    description: 'Mobile windshield replacement & repair in Broomfield CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/broomfield-co',
    type: 'website',
  },
};

export default function BroomfieldLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Broomfield?',
      answer: 'Yes! Mobile service is our specialty in Broomfield. We come to your home, office, or anywhere in Broomfield and surrounding areas. We\'ll come to you with our fully equipped mobile units.'
    },
    {
      question: 'How quickly can you replace a windshield in Broomfield?',
      answer: 'We offer same-day windshield replacement throughout Broomfield. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What areas of Broomfield do you serve?',
      answer: 'We serve all of Broomfield including Downtown Broomfield, Anthem, Broadlands and all surrounding areas. If you\'re in the Broomfield area, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Broomfield?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Broomfield residents.'
    },
    {
      question: 'What if I need a windshield replacement while shopping at Flatiron Crossing Mall?',
      answer: 'Our mobile service is perfect for this! We can meet you in the parking lot of Flatiron Crossing or any other commercial area in Broomfield. You can finish your shopping or errands, and return to a safely repaired or replaced windshield.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Broomfield',
    state: 'CO',
    zipCode: '80020',
    latitude: 39.9205,
    longitude: -105.0867,
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Broomfield, CO', url: 'https://pinkautoglass.com/locations/broomfield-co' }
  ]);

  const combinedSchema = combineSchemas(localBusinessSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 page-top-padding">
        <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 mr-2" />
                <span className="text-xl">Broomfield, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Broomfield's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Broomfield\'s strategic location along US-36 (Boulder Turnpike) and I-25 means heavy commuter traffic and constant exposure to road hazards. Combined with unpredictable Colorado weather, windshield chips and cracks are a common frustration for drivers in this thriving city.
              </p>
              <CTAButtons source="broomfield-co-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Locations', href: '/locations' },
              { label: 'Broomfield, CO', href: '/locations/broomfield-co' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Broomfield Residents Choose Pink Auto Glass
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Broomfield's US-36 corridor, Northwest Parkway traffic, and Front Range hailstorms mean your windshield faces constant challenges. Pink Auto Glass is Broomfield's trusted solution for fast, professional auto glass repair and replacement.
                </p>

                <AboveFoldCTA location="location-broomfield-co" />

              {/* Windshield Damage in Broomfield */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Broomfield
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Rocks and debris from high-speed US-36 and I-25 traffic.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Frequent hailstorms during the spring and summer months.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Construction materials from new office parks and residential areas.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Gravel and sand used on winter roads around the city.</span>
                  </li>
                </ul>
              </section>

              {/* Our Services */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Services in Broomfield
                </h2>
                <p className="text-gray-700 mb-4">
                  We bring a full range of auto glass services directly to you in Broomfield:
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
                  We bring our services to you - whether you're at home, at work, or anywhere in Broomfield. Our mobile units are fully equipped to handle all your auto glass needs.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Broomfield Service Area</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Downtown Broomfield</span>
                    </li>
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Anthem</span>
                    </li>
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Broadlands</span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>1stBank Center area</span>
                    </li>
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Interlocken</span>
                    </li>
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Flatiron District</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions - Broomfield</h2>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.question}</h3>
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-pink-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Service Today</h3>
                  <div className="space-y-4">
                    <a href="tel:+17209187465" className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
                      <Phone className="w-5 h-5" />
                      (720) 918-7465
                    </a>
                    <Link href="/book" className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-pink-600 font-bold py-3 px-6 rounded-lg border-2 border-pink-600 transition-all">
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
                  </div>
                </div>

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
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Fix Your Windshield in Broomfield?
            </h2>
            <p className="text-xl mb-8 text-pink-100">
              Same-day mobile service throughout Broomfield
            </p>
            <CTAButtons source="broomfield-co-footer" />
          </div>
        </section>
      </div>
    </>
  );
}
