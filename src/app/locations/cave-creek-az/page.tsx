import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Cave Creek AZ | Auto Glass Repair | $0 Deductible | (720) 918-7465',
  description: 'Windshield replacement & auto glass repair in Cave Creek AZ. Same-day mobile service to Cave Creek Town Center, Carefree & all area. ARS 20-264 means $0 out of pocket. Call (720) 918-7465!',
  keywords: 'windshield replacement cave creek az, windshield repair cave creek, auto glass cave creek az, zero deductible windshield cave creek, carefree windshield, tatum ranch auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/cave-creek-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Cave Creek, AZ | Pink Auto Glass',
    description: 'Cave Creek trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service to Cave Creek Town Center, Carefree & Tatum Ranch. ARS 20-264 coverage.',
    url: 'https://pinkautoglass.com/locations/cave-creek-az',
    type: 'website',
  },
};

export default function CaveCreekLocationPage() {
  const faqs = [
    {
      question: 'Does Arizona\'s $0 windshield law apply to Cave Creek and Carefree residents?',
      answer: 'Yes. ARS 20-264 applies to all Arizona drivers with comprehensive auto insurance. Cave Creek and Carefree residents with the glass endorsement pay $0 for windshield replacement. The endorsement typically adds $5–$15 per month to your comprehensive policy — a small price for coverage that eliminates out-of-pocket costs entirely.'
    },
    {
      question: 'Why is Cave Creek so tough on windshields?',
      answer: 'Cave Creek\'s rural-desert character means many roads are caliche-edged or partially unpaved. The equestrian community brings horse trailers and agricultural vehicles onto roads. Residents regularly travel SR-74 and Cave Creek Road — roads that pass through open desert terrain where loose rock and roadway gravel are constant hazards. The area\'s horse properties contribute to road surfaces that collect loose material.'
    },
    {
      question: 'Will my insurance rates go up if I file a glass claim in Cave Creek?',
      answer: 'No. Arizona law ARS 20-263 provides no-fault rate protection for all glass claims in Arizona. Cave Creek and Carefree residents often maintain long clean driving records and value their insurance history — this law protects that record while letting you use coverage you\'ve already paid for.'
    },
    {
      question: 'Can you come to my equestrian property or rural home in Cave Creek?',
      answer: 'Yes. We provide mobile service throughout Cave Creek and Carefree including rural properties, horse ranches, and all residential areas. We come to your driveway, barn area, or any flat, safe parking area on your property. Same-day service available throughout the Cave Creek/Carefree area.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Cave Creek',
    state: 'AZ',
    zipCode: '85331',
    latitude: 33.8331,
    longitude: -111.9510,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Cave Creek, AZ', url: 'https://pinkautoglass.com/locations/cave-creek-az' }
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
                <span className="text-xl">Cave Creek, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Cave Creek's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="cave-creek-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Cave Creek, AZ', href: '/locations/cave-creek-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Cave Creek Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Cave Creek and neighboring Carefree offer a unique lifestyle that blends upscale desert living with rural charm. Known for its Western-themed Town Center, active equestrian community, and dramatic desert scenery, Cave Creek attracts residents who appreciate both rugged outdoor living and quality services. The trade-off is a road environment that's genuinely harsh on windshields — caliche-edged roads, horse trailer traffic, and desert access routes mean chips are an occupational hazard of life in the high desert north of Phoenix.
                </p>
                <AboveFoldCTA location="location-cave-creek-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona's ARS 20-264 means $0 out of pocket for most Cave Creek drivers with comprehensive coverage. ARS 20-263 protects your rates. ARS 20-469 means you choose your shop. We service luxury vehicles and daily drivers alike, and come directly to your Cave Creek property.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Cave Creek Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Caliche Dust and Desert Roads:</strong> Cave Creek's roads are surrounded by native desert. Caliche dust, loose rock, and desert gravel migrate onto paved roads constantly, especially after monsoon rains that erode road shoulders and wash material across pavement.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Equestrian Traffic:</strong> Horse trailers, equestrian equipment haulers, and agricultural vehicles are a common sight on Cave Creek roads. These vehicles travel between properties and the desert, bringing loose material back to paved roads.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>SR-74 Carefree Highway:</strong> The Carefree Highway (SR-74) connects Cave Creek to the I-17 and US-60 systems. It runs through open desert terrain where loose rock from adjacent hillsides regularly deposits on the roadway.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Tatum Ranch Suburban Transition:</strong> Tatum Ranch sits at the edge of the Cave Creek area, where suburban Phoenix-area roads transition to more rural conditions. This transition zone accumulates debris from both directions.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Cave Creek Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your rates.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop — your insurer cannot require Safelite.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Cave Creek Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Cave Creek Town Center', 'Carefree', 'Tatum Ranch',
                    'Desert Hills', 'Spur Cross', 'Seven Springs',
                    'Adobe Dam', 'Dynamite Corridor', 'Dove Valley'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Cave Creek</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Fix desert road chips before summer heat expands them. Mobile service to your property.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full OEM-quality replacement. $0 with ARS 20-264. We come to Cave Creek and Carefree.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Cave Creek Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'George H.', neighborhood: 'Carefree', text: 'Cave Creek Road finally got my windshield. Pink Auto Glass came to my Carefree property and replaced it while I had my morning coffee. Zero cost — my American Family coverage handled everything.' },
                    { name: 'Kathleen S.', neighborhood: 'Tatum Ranch', text: 'Caliche dust from our equestrian neighbor\'s property gets on everything. Pink Auto Glass repaired my chip before it cracked. Fast, professional, and they explained exactly how the AZ insurance law works.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Cave Creek Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Cave Creek?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service throughout Cave Creek and Carefree. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="cave-creek-az-cta" />
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
                    <Link href="/locations/scottsdale-az" className="text-blue-600 hover:underline">Scottsdale</Link>
                    <Link href="/locations/phoenix-az" className="text-blue-600 hover:underline">Phoenix</Link>
                    <Link href="/locations/peoria-az" className="text-blue-600 hover:underline">Peoria</Link>
                    <Link href="/locations/fountain-hills-az" className="text-blue-600 hover:underline">Fountain Hills</Link>
                    <Link href="/locations/surprise-az" className="text-blue-600 hover:underline">Surprise</Link>
                    <Link href="/locations/glendale-az" className="text-blue-600 hover:underline">Glendale</Link>
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
