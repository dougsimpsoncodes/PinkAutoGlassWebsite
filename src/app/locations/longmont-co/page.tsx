import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Clock, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Repair & Replacement Longmont, CO | Pink Auto Glass',
  description: 'Professional windshield repair and replacement in Longmont, Colorado. Mobile service to your home or office. Same-day appointments. Call (720) 918-7465 for a free quote.',
  keywords: 'windshield repair longmont, windshield replacement longmont, auto glass longmont, mobile windshield service longmont co',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/longmont-co',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Longmont, CO | Pink Auto Glass',
    description: 'Longmont\'s trusted auto glass experts. Mobile service, same-day appointments, lifetime warranty.',
    url: 'https://pinkautoglass.com/locations/longmont-co',
    type: 'website',
  },
};

export default function LongmontLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Longmont?',
      answer: 'Yes! Mobile service is our specialty in Longmont. We come to your home, office, or anywhere in Longmont and surrounding areas. We\'ll come to you with our fully equipped mobile units.'
    },
    {
      question: 'How quickly can you replace a windshield in Longmont?',
      answer: 'We offer same-day windshield replacement throughout Longmont. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What areas of Longmont do you serve?',
      answer: 'We serve all of Longmont including Downtown Longmont, Prospect, Twin Peaks and all surrounding areas. If you\'re in the Longmont area, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Longmont?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Longmont residents.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Longmont',
    state: 'CO',
    zipCode: '80501',
    latitude: 40.1672,
    longitude: -105.1019,
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Longmont, CO', url: 'https://pinkautoglass.com/locations/longmont-co' }
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
                <span className="text-xl">Longmont, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Longmont's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service • Same-Day Appointments • Lifetime Warranty
              </p>
              <CTAButtons source="longmont-co-hero" />
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
              { label: 'Longmont, CO', href: '/locations/longmont-co' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Longmont Residents Choose Pink Auto Glass
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Longmont's position along US-287 and I-25, combined with frequent hail and mountain weather mean your windshield faces constant challenges. Pink Auto Glass is Longmont's trusted solution for fast, professional auto glass repair and replacement.
                </p>

                <AboveFoldCTA location="location-longmont-co" />

                <p className="text-lg text-gray-700 mb-4">
                  We bring our services to you - whether you're at home, at work, or anywhere in Longmont. Our mobile units are fully equipped to handle all your auto glass needs.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Longmont Service Area</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Downtown Longmont</span>
                    </li>
                  <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Prospect</span>
                    </li>
                  <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Twin Peaks</span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Sandstone Ranch</span>
                    </li>
                  <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Fox Grove</span>
                    </li>
                  <li className="flex items-start">
                      <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Surrounding Boulder County</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions - Longmont</h2>
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
              Ready to Fix Your Windshield in Longmont?
            </h2>
            <p className="text-xl mb-8 text-pink-100">
              Same-day mobile service throughout Longmont
            </p>
            <CTAButtons source="longmont-co-footer" />
          </div>
        </section>
      </div>
    </>
  );
}
