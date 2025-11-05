import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Clock, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Repair & Replacement Loveland, CO | Pink Auto Glass',
  description: 'Professional windshield repair and replacement in Loveland, Colorado. Mobile service to your home or office. Same-day appointments. Call (720) 918-7465 for a free quote.',
  keywords: 'windshield repair loveland, windshield replacement loveland, auto glass loveland, mobile windshield service loveland co',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/loveland-co',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Loveland, CO | Pink Auto Glass',
    description: 'Loveland\'s trusted auto glass experts. Mobile service, same-day appointments, lifetime warranty.',
    url: 'https://pinkautoglass.com/locations/loveland-co',
    type: 'website',
  },
};

export default function LovelandLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Loveland?',
      answer: 'Yes! Mobile service is our specialty in Loveland. We come to your home, office, or anywhere in Loveland and surrounding areas. Whether you\'re downtown, near the Sculpture Park, in west Loveland, or anywhere else, we\'ll come to you with our fully equipped mobile units.'
    },
    {
      question: 'How quickly can you replace a windshield in Loveland?',
      answer: 'We offer same-day windshield replacement throughout Loveland. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What areas of Loveland do you serve?',
      answer: 'We serve all of Loveland including: downtown Loveland, Centerra, Johnstown, west Loveland, and all surrounding areas in Larimer County. If you\'re in the Loveland area, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Loveland?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Loveland residents.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Loveland',
    state: 'CO',
    zipCode: '80537',
    latitude: 40.3978,
    longitude: -105.0750,
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Loveland, CO', url: 'https://pinkautoglass.com/locations/loveland-co' }
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
                <span className="text-xl">Loveland, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Loveland's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service • Same-Day Appointments • Lifetime Warranty
              </p>
              <CTAButtons source="loveland-hero" />
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
              { label: 'Loveland, CO', href: '/locations/loveland-co' }
            ]}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Why Loveland Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Loveland Residents Choose Pink Auto Glass
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Loveland's location along I-25 and US-34, combined with access to mountain roads and frequent severe weather, means your windshield faces constant challenges. From rock chips on the way to Estes Park to hail damage from summer storms, Pink Auto Glass is Loveland's trusted solution for fast, professional auto glass repair and replacement.
                </p>

                <AboveFoldCTA location="location-loveland" />

                <p className="text-lg text-gray-700 mb-4">
                  We understand Loveland life. Whether you're commuting to Fort Collins, enjoying the Sculpture Garden, or heading to the mountains, we bring our services to you. Our mobile units serve all of Loveland, Centerra, and surrounding Larimer County areas.
                </p>
              </section>

              {/* Local Tips & FAQs */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Loveland Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Highway 34 toward Estes Park and Big Thompson Canyon can be especially hard on windshields with mountain debris. I-25 construction and Loveland's hail season also create windshield hazards. We provide convenient mobile service throughout the city.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">Can you service vehicles at Centerra?</h3>
                    <p>Yes. We provide mobile service to Centerra, Johnstown, and all areas of Loveland including shopping centers and office parks.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">How fast can you respond in Loveland?</h3>
                    <p>Same-day service is typically available. We can usually arrive within a few hours depending on your location and our schedule.</p>
                  </div>
                </div>
              </section>

              {/* Service Area */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Loveland Service Area
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  We provide mobile windshield repair and replacement throughout Loveland and surrounding areas:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Downtown Loveland</span>
                    </li>
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Centerra</span>
                    </li>
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>West Loveland</span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Johnstown</span>
                    </li>
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Berthoud</span>
                    </li>
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Surrounding Larimer County</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Services */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Loveland Auto Glass Services
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-pink-500">
                    <h3 className="text-xl font-bold mb-3">Windshield Replacement</h3>
                    <p className="text-gray-700">
                      Full windshield replacement with OEM quality glass. We handle all makes and models at your location.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold mb-3">Windshield Repair</h3>
                    <p className="text-gray-700">
                      Fix chips and small cracks before they spread. Most repairs completed in under 30 minutes.
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
                  Frequently Asked Questions - Loveland
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
                        <div>Loveland & Larimer County</div>
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
              Ready to Fix Your Windshield in Loveland?
            </h2>
            <p className="text-xl mb-8 text-pink-100">
              Same-day mobile service throughout Loveland and Larimer County
            </p>
            <CTAButtons source="loveland-footer" />
          </div>
        </section>

      </div>
    </>
  );
}
