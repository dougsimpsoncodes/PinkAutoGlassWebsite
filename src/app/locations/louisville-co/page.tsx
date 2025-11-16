import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Louisville Windshield Repair | Auto Glass Replacement | Same-Day | (720) 918-7465',
  description: '★★★★★ Louisville auto glass repair & windshield replacement. Mobile service. Often $0 with insurance. Same-day appointments. Lifetime warranty. Serving all Louisville neighborhoods. Call (720) 918-7465!',
  keywords: 'windshield repair louisville, windshield replacement louisville, auto glass louisville co, mobile windshield service louisville',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/louisville-co',
  },
  openGraph: {
    title: 'Louisville Windshield Repair & Replacement CO | Pink Auto Glass',
    description: 'Louisville\'s trusted auto glass experts. Mobile service, same-day appointments, lifetime warranty.',
    url: 'https://pinkautoglass.com/locations/louisville-co',
    type: 'website',
  },
};

export default function LouisvilleLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Louisville?',
      answer: 'Yes! Mobile service is our specialty in Louisville. We come to your home, office, or anywhere in Louisville. Our fully equipped mobile units serve all Louisville neighborhoods including Old Town Louisville, Coal Creek, Harper Lake, and more.'
    },
    {
      question: 'How quickly can you replace a windshield in Louisville?',
      answer: 'We offer same-day windshield replacement throughout Louisville. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What Louisville neighborhoods do you serve?',
      answer: 'We serve all of Louisville including: Old Town Louisville, Coal Creek, Harper Lake, and all other Louisville areas. If you\'re anywhere in Louisville, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Louisville?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Louisville residents.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Louisville',
    state: 'CO',
    zipCode: '80027',
    latitude: 39.9778,
    longitude: -105.1319,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Louisville, CO', url: 'https://pinkautoglass.com/locations/louisville-co' }
  ]);

  const combinedSchema = combineSchemas(localBusinessSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }} />

      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 page-top-padding">
        <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 mr-2" />
                <span className="text-xl">Louisville, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Louisville's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service • Same-Day Appointments • Lifetime Warranty
              </p>
              <CTAButtons source="louisville-co-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Louisville, CO', href: '/locations/louisville-co' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Louisville Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Louisville drivers deserve reliable auto glass service. With 20,712 residents, Louisville's unique location creates specific windshield challenges. From Old Town Louisville to Coal Creek, Pink Auto Glass provides fast, professional windshield repair and replacement throughout Louisville.
                </p>
                <AboveFoldCTA location="location-louisville-co" />
                <p className="text-lg text-gray-700 mb-4">
                  Our fully equipped mobile units serve all Louisville neighborhoods. We understand the unique challenges Louisville drivers face and provide expert windshield care tailored to your needs.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Louisville's Windshield Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Boulder County</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>US-36 corridor</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Tech workers</strong></span>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Louisville Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                    <span className="text-gray-700 font-medium">Old Town Louisville</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                    <span className="text-gray-700 font-medium">Coal Creek</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                    <span className="text-gray-700 font-medium">Harper Lake</span>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Louisville</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Same-Day Service</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Lifetime Warranty</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Louisville Customers</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                      <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                        {faq.question}
                        <span className="text-pink-600 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Louisville?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Louisville. Call now for a free quote.</p>
                <CTAButtons source="louisville-co-cta" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Get a Free Quote</h3>
                  <div className="space-y-3">
                    <a href="tel:+17209187465" className="flex items-center justify-center w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-700 transition-colors">
                      <Phone className="w-5 h-5 mr-2" />
                      Call (720) 918-7465
                    </a>
                    <Link href="/book" className="flex items-center justify-center w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Book Online
                    </Link>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Cities</h3>
                  <ul className="space-y-2">
                    <li><Link href="/locations/denver-co" className="text-pink-600 hover:underline">Denver →</Link></li>
                    <li><Link href="/locations/aurora-co" className="text-pink-600 hover:underline">Aurora →</Link></li>
                    <li><Link href="/locations/boulder-co" className="text-pink-600 hover:underline">Boulder →</Link></li>
                    <li><Link href="/locations/colorado-springs-co" className="text-pink-600 hover:underline">Colorado Springs →</Link></li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Related Services</h3>
                  <ul className="space-y-2">
                    <li><Link href="/services/windshield-repair" className="text-pink-600 hover:underline">Windshield Repair →</Link></li>
                    <li><Link href="/services/windshield-replacement" className="text-pink-600 hover:underline">Windshield Replacement →</Link></li>
                    <li><Link href="/services/mobile-service" className="text-pink-600 hover:underline">Mobile Service →</Link></li>
                    <li><Link href="/services/insurance-claims" className="text-pink-600 hover:underline">Insurance Claims →</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
