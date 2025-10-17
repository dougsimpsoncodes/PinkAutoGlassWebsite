import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Repair & Replacement Aurora, CO | Pink Auto Glass',
  description: 'Professional windshield repair and replacement in Aurora, Colorado. Mobile service to your home or office. Same-day appointments. Call (720) 918-7465 for a free quote.',
  keywords: 'windshield repair aurora, windshield replacement aurora, auto glass aurora co, mobile windshield service aurora',
  openGraph: {
    title: 'Windshield Repair & Replacement Aurora, CO | Pink Auto Glass',
    description: 'Aurora\'s trusted auto glass experts. Mobile service, same-day appointments, lifetime warranty.',
    url: 'https://pinkautoglass.com/locations/aurora-co',
    type: 'website',
  },
};

export default function AuroraLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Aurora?',
      answer: 'Yes! Mobile service is our specialty in Aurora. We come to your home, office, or anywhere in Aurora. Whether you\'re in Stapleton, Green Valley Ranch, Southlands, or anywhere else in Aurora, we\'ll come to you with our fully equipped mobile units.'
    },
    {
      question: 'What Aurora neighborhoods do you serve?',
      answer: 'We serve all of Aurora including: Stapleton (Central Park), Green Valley Ranch, Southlands, Buckley AFB area, Murphy Creek, Aurora Highlands, Saddle Rock, Tollgate Crossing, and all other Aurora neighborhoods.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Aurora',
    state: 'CO',
    zipCode: '80010',
    latitude: 39.7294,
    longitude: -104.8319,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Aurora, CO', url: 'https://pinkautoglass.com/locations/aurora-co' }
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
                <span className="text-xl">Aurora, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Aurora's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service • Same-Day Appointments • Lifetime Warranty
              </p>
              <CTAButtons source="aurora-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Aurora, CO', href: '/locations/aurora-co' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Aurora Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Aurora's growing community needs reliable auto glass service. From Stapleton to Green Valley Ranch, Pink Auto Glass provides fast, professional windshield repair and replacement throughout Aurora. We understand Aurora's diverse neighborhoods and bring our mobile service directly to you.
                </p>
                <AboveFoldCTA location="location-aurora" />
                <p className="text-lg text-gray-700 mb-4">
                  Whether you're near Buckley AFB, shopping at Southlands, or at home in Aurora Highlands, we come to you. Our fully equipped mobile units handle everything on-site.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Aurora Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Stapleton', 'Green Valley Ranch', 'Southlands',
                    'Buckley AFB', 'Murphy Creek', 'Aurora Highlands',
                    'Saddle Rock', 'Tollgate Crossing', 'Heather Gardens',
                    'Side Creek', 'Aurora Hills', 'Fitzsimons',
                    'Del Mar Parkway', 'Quincy Reservoir', 'Cherry Creek'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Aurora</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Professional Service</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Professional Service</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Aurora Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'John P.', neighborhood: 'Green Valley Ranch', text: 'Fast service at my home in GVR. They replaced my windshield in under an hour. Professional and thorough!' },
                    { name: 'Maria S.', neighborhood: 'Stapleton', text: 'Mobile service was perfect for my busy schedule. They came to my office and I didn\'t miss any work time.' }
                  ].map((r, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex text-yellow-400 mb-3">{[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}</div>
                      <p className="text-gray-700 mb-2">"{r.text}"</p>
                      <p className="text-gray-900 font-semibold">- {r.name}, {r.neighborhood}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Aurora Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Aurora?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Aurora. Call now for a free quote.</p>
                <CTAButtons source="aurora-cta" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Vehicles in Aurora</h3>
                  <ul className="space-y-2 text-sm">
                    {[
                      { model: 'Subaru Outback', slug: 'subaru-outback-windshield-replacement-denver' },
                      { model: 'Honda CR-V', slug: 'honda-cr-v-windshield-replacement-denver' },
                      { model: 'Toyota RAV4', slug: 'toyota-rav4-windshield-replacement-denver' }
                    ].map(v => (
                      <li key={v.slug}>
                        <Link href={`/vehicles/${v.slug}`} className="text-pink-600 hover:underline flex justify-between">
                          <span>{v.model}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href="/services/windshield-replacement" className="block mt-4 text-blue-600 hover:underline font-semibold">View All Services →</Link>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Nearby Cities</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Link href="/locations/denver-co" className="text-blue-600 hover:underline">Denver</Link>
                    <Link href="/locations/centennial-co" className="text-blue-600 hover:underline">Centennial</Link>
                    <Link href="/locations/parker-co" className="text-blue-600 hover:underline">Parker</Link>
                    <Link href="/locations/thornton-co" className="text-blue-600 hover:underline">Thornton</Link>
                  </div>
                </div>

                <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d196473.28638485644!2d-104.9319!3d39.7294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x876c63220d061d09%3A0x58df34aa1e92234c!2sAurora%2C%20CO!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Aurora, CO Map"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
