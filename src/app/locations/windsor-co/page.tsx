import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Clock, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Windsor CO | Mobile, $0 Deductible',
  description: 'Mobile windshield replacement & repair in Windsor CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair windsor, windshield replacement windsor, auto glass windsor, mobile windshield service windsor co',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/windsor-co',
  },
  openGraph: {
    title: 'Windshield Replacement Windsor CO | Mobile, $0 Deductible',
    description: 'Mobile windshield replacement & repair in Windsor CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/windsor-co',
    type: 'website',
  },
};

export default function WindsorLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Windsor?',
      answer: 'Yes! Mobile service is our specialty in Windsor. We come to your home, office, or anywhere in Windsor and surrounding areas. We\'ll come to you with our fully equipped mobile units.'
    },
    {
      question: 'How quickly can you replace a windshield in Windsor?',
      answer: 'We offer same-day windshield replacement throughout Windsor. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What areas of Windsor do you serve?',
      answer: 'We serve all of Windsor including Downtown Windsor, Water Valley, Harmony Road Corridor and all surrounding areas. If you\'re in the Windsor area, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Windsor?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Windsor residents.'
    },
    {
      question: 'Can Pink Auto Glass accommodate fleet services for businesses in Windsor, given its mixed industrial and residential base?',
      answer: 'Yes, Pink Auto Glass is well-equipped to provide comprehensive fleet services for businesses across Windsor. We understand the importance of keeping your commercial vehicles operational and offer efficient, reliable mobile windshield replacements and repairs to minimize your downtime.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Windsor',
    state: 'CO',
    zipCode: '80550',
    latitude: 40.4775,
    longitude: -104.9014,
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Windsor, CO', url: 'https://pinkautoglass.com/locations/windsor-co' }
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
                <span className="text-xl">Windsor, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Windsor's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Windsor\'s growth and strategic location near I-25, Fort Collins, and Greeley mean drivers frequently encounter a mix of construction, agricultural, and highway traffic. These diverse conditions, along with Northern Colorado\'s active weather, create a high potential for windshield damage.
              </p>
              <CTAButtons source="windsor-co-hero" />
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
              { label: 'Windsor, CO', href: '/locations/windsor-co' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Windsor Residents Choose Pink Auto Glass
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Windsor's growing population, proximity to I-25, and northern Colorado weather mean your windshield faces constant challenges. Pink Auto Glass is Windsor's trusted solution for fast, professional auto glass repair and replacement.
                </p>

                <AboveFoldCTA location="location-windsor-co" />

              {/* Windshield Damage in Windsor */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Windsor
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Rocks and gravel from I-25, a major commuter and commercial route.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Construction debris from ongoing residential and business development.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Debris from agricultural vehicles on roads surrounding farmlands.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Intense hailstorms, a common occurrence in the Northern Front Range.</span>
                  </li>
                </ul>
              </section>

                <p className="text-lg text-gray-700 mb-4">
                  We bring our services to you - whether you're at home, at work, or anywhere in Windsor. Our mobile units are fully equipped to handle all your auto glass needs.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Windsor Service Area</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Downtown Windsor</span>
                    </li>
                  <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Water Valley</span>
                    </li>
                  <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Harmony Road Corridor</span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>East Windsor</span>
                    </li>
                  <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Severance</span>
                    </li>
                  <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Weld County areas</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions - Windsor</h2>
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
              Ready to Fix Your Windshield in Windsor?
            </h2>
            <p className="text-xl mb-8 text-pink-100">
              Same-day mobile service throughout Windsor
            </p>
            <CTAButtons source="windsor-co-footer" />
          </div>
        </section>
      </div>
    </>
  );
}
