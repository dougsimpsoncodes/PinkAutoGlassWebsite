import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Avondale AZ | Auto Glass Repair | $0 Deductible | (480) 712-7465',
  description: 'Windshield replacement & auto glass repair in Avondale AZ. Same-day mobile service near Phoenix International Raceway & all Avondale. ARS 20-264 means $0 out of pocket. Call (480) 712-7465!',
  keywords: 'windshield replacement avondale az, windshield repair avondale, auto glass avondale az, zero deductible windshield avondale arizona, mobile windshield avondale',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/avondale-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Avondale, AZ | Pink Auto Glass',
    description: 'Avondale\'s trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service near Phoenix International Raceway & all Avondale. ARS 20-264.',
    url: 'https://pinkautoglass.com/locations/avondale-az',
    type: 'website',
  },
};

export default function AvondaleLocationPage() {
  const faqs = [
    {
      question: 'Does Arizona\'s $0 windshield law apply to Avondale residents?',
      answer: 'Yes. ARS 20-264 applies to all Arizona drivers with comprehensive coverage. Avondale residents in Coldwater Springs, Garden Lakes, Casa Mia, and all other neighborhoods qualify. We verify coverage before starting work so you know exactly what you\'ll pay — which for most drivers is nothing.'
    },
    {
      question: 'Will my insurance rates increase if I file a glass claim in Avondale?',
      answer: 'No. ARS 20-263 provides no-fault rate protection for all Arizona glass claims. Filing a windshield claim in Avondale is legally classified as a no-fault event, meaning your insurer cannot raise your rates because of it.'
    },
    {
      question: 'Why do Avondale residents deal with so many windshield chips near the Raceway?',
      answer: 'The I-10 west corridor near Phoenix International Raceway sees constant commercial truck traffic — the same trucks that service California freight and construction sites throughout the West Valley. Race event traffic further concentrates vehicle density on I-10, increasing debris exposure. Avondale\'s working-class residential areas also sit near industrial zones that generate heavy vehicle activity on local streets.'
    },
    {
      question: 'Can you come to my home in Avondale on the same day I call?',
      answer: 'Yes. Same-day windshield replacement is available throughout Avondale. We typically schedule within 2-4 hours of your call. Mobile service is included at no extra charge — we bring everything needed to complete your replacement at your home, office, or any Avondale location.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Avondale',
    state: 'AZ',
    zipCode: '85323',
    latitude: 33.4356,
    longitude: -112.3496,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Avondale, AZ', url: 'https://pinkautoglass.com/locations/avondale-az' }
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
                <span className="text-xl">Avondale, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Avondale's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="avondale-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Avondale, AZ', href: '/locations/avondale-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Avondale Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  We bring $0 mobile windshield service to Avondale — located just off I-10 west near Phoenix International Raceway, where California freight traffic runs constantly.
                </p>
                <AboveFoldCTA location="location-avondale-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona law means most Avondale drivers pay $0 — zero-deductible coverage is required, your rates can't go up, and you choose the shop.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Avondale Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-10 West California Freight Corridor:</strong> Avondale sits directly on the I-10, Arizona's primary route to California.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Phoenix International Raceway Event Traffic:</strong> Race events concentrate thousands of vehicles in and around the Avondale area.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Industrial Area Road Traffic:</strong> Avondale borders industrial and manufacturing zones that generate heavy vehicle traffic on Van Buren Street and McDowell Road.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Avondale Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your rates.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop — insurers cannot require Safelite.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Avondale Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Avondale Estates', 'Coldwater Springs', 'Garden Lakes',
                    'Casa Mia', 'Rancho Santa Fe', 'Waterston',
                    'Avondale South', 'Van Buren Corridor', 'Litchfield Road'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Avondale</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Stop I-10 chips before they crack. Fast, often $0 with coverage.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full OEM-quality replacement. $0 with ARS 20-264 coverage. Mobile service.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Avondale Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Tony R.', neighborhood: 'Garden Lakes', text: 'Got chipped by a truck on I-10 near my exit. Pink Auto Glass came to my home in Garden Lakes the same afternoon. Zero cost, they handled my insurance. Couldn\'t ask for better service.' },
                    { name: 'Rosa M.', neighborhood: 'Coldwater Springs', text: 'I was nervous about insurance claims but Pink Auto Glass made it completely easy. They called my insurer, filed everything, came to my house. I just said yes and they did the rest.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Avondale Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Avondale?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Avondale. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="avondale-az-cta" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Arizona Insurance Law</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>ARS 20-264:</strong> $0 deductible option required</span>
                    </li>
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>ARS 20-263:</strong> No rate increase for glass claims</span>
                    </li>
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>ARS 20-469:</strong> Right to choose your shop</span>
                    </li>
                  </ul>
                  <Link href="/services/insurance-claims/arizona" className="block mt-4 text-pink-600 hover:underline font-semibold">Full AZ Insurance Guide →</Link>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Nearby Arizona Cities</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Link href="/locations/goodyear-az" className="text-blue-600 hover:underline">Goodyear</Link>
                    <Link href="/locations/buckeye-az" className="text-blue-600 hover:underline">Buckeye</Link>
                    <Link href="/locations/litchfield-park-az" className="text-blue-600 hover:underline">Litchfield Park</Link>
                    <Link href="/locations/phoenix-az" className="text-blue-600 hover:underline">Phoenix</Link>
                    <Link href="/locations/glendale-az" className="text-blue-600 hover:underline">Glendale</Link>
                    <Link href="/locations/surprise-az" className="text-blue-600 hover:underline">Surprise</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
