import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Goodyear AZ | Auto Glass Repair | $0 Deductible | (720) 918-7465',
  description: 'Windshield replacement & auto glass repair in Goodyear AZ. Same-day mobile service to Estrella Mountain Ranch, Verrado & all Goodyear. ARS 20-264 means $0 out of pocket. Call (720) 918-7465!',
  keywords: 'windshield replacement goodyear az, windshield repair goodyear, auto glass goodyear az, zero deductible windshield goodyear, estrella mountain ranch windshield, verrado auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/goodyear-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Goodyear, AZ | Pink Auto Glass',
    description: 'Goodyear\'s trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service to Estrella Mountain Ranch, Verrado, Palm Valley & all Goodyear. ARS 20-264.',
    url: 'https://pinkautoglass.com/locations/goodyear-az',
    type: 'website',
  },
};

export default function GoodyearLocationPage() {
  const faqs = [
    {
      question: 'Does Arizona\'s zero-deductible glass law apply to Goodyear and the West Valley?',
      answer: 'Yes. ARS 20-264 applies statewide to all Arizona drivers with comprehensive coverage. Goodyear residents in Estrella Mountain Ranch, Verrado, Palm Valley, and all other neighborhoods qualify. We verify your coverage before starting any work so you know exactly what to expect.'
    },
    {
      question: 'Is Luke AFB proximity affecting windshields near Goodyear?',
      answer: 'Military flight patterns from Luke Air Force Base create sonic pressure that can stress already-chipped glass. More significantly, the heavy vehicle traffic associated with base operations and defense contractor deliveries on area roads contributes to chip risk near Litchfield Road, Dysart Road, and the I-10 west corridor near the base.'
    },
    {
      question: 'Can you come to Estrella Mountain Ranch for mobile windshield service?',
      answer: 'Yes. We provide full mobile service throughout Estrella Mountain Ranch, Verrado, Cottonflower, Bullard, and all other Goodyear communities. We come to your home or any convenient location. The service takes about 60-90 minutes and we handle your insurance claim completely.'
    },
    {
      question: 'Will filing a glass claim affect my insurance rates in Goodyear?',
      answer: 'No. Arizona law ARS 20-263 provides no-fault rate protection. Filing a windshield replacement claim cannot legally raise your insurance premiums. Glass claims are classified as no-fault comprehensive claims in Arizona regardless of how many you file.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Goodyear',
    state: 'AZ',
    zipCode: '85338',
    latitude: 33.4353,
    longitude: -112.3576,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Goodyear, AZ', url: 'https://pinkautoglass.com/locations/goodyear-az' }
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
                <span className="text-xl">Goodyear, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Goodyear's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="goodyear-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Goodyear, AZ', href: '/locations/goodyear-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Goodyear Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Goodyear sits on the western edge of the Phoenix metro, bordered by Luke Air Force Base to the north and the Estrella Mountain Regional Park to the south. Master-planned communities like Estrella Mountain Ranch and Verrado have attracted thousands of families to Goodyear's wide-open western landscape. The I-10 west corridor carries heavy freight traffic between Phoenix and California, and Goodyear Ballpark draws spring training crowds each February. With so much new construction, the I-10, and Luke AFB operations, windshield damage is a constant reality.
                </p>
                <AboveFoldCTA location="location-goodyear-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona law protects Goodyear drivers. ARS 20-264 means $0 out of pocket with comprehensive coverage. ARS 20-263 means no rate increase. ARS 20-469 means you choose your shop. We come to Estrella Mountain Ranch, Verrado, or anywhere in Goodyear and handle your entire insurance claim.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Goodyear Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-10 West California Freight Corridor:</strong> The I-10 between Phoenix and Los Angeles is one of the most heavily traveled freight corridors in the US. Trucks hauling cargo to and from California pass through Goodyear daily at high speeds, creating constant chip exposure.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Luke AFB Heavy Vehicle Traffic:</strong> Luke Air Force Base operations generate significant heavy vehicle traffic on Litchfield Road, Dysart Road, and other west Goodyear corridors. Defense contractor deliveries and military equipment transport add to chip risk.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Estrella Mountain Road Access:</strong> Roads accessing Estrella Mountain Regional Park and the hiking/biking trails transition from suburban pavement to gravel access roads. Desert caliche migrates onto suburban streets in the Estrella Mountain Ranch area.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Verrado New Home Construction:</strong> Verrado continues to expand with new home phases. Active construction zones throughout the development mean constant gravel truck traffic on local streets.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Goodyear Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your rates.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop — insurers cannot require Safelite.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Goodyear Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Estrella Mountain Ranch', 'Palm Valley', 'Verrado',
                    'Cottonflower', 'Bullard', 'Copper Crossing',
                    'Canyon Trails', 'Pebblecreek', 'North Goodyear'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Goodyear</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Fix I-10 and construction chips before Arizona heat cracks them.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full OEM-quality replacement. $0 with ARS 20-264. Mobile service throughout Goodyear.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Goodyear Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Paul M.', neighborhood: 'Estrella Mountain Ranch', text: 'Got a chip from a truck on I-10 near the Estrella exit. Pink Auto Glass came to my home the next morning. My Liberty Mutual coverage handled everything — $0 out of pocket.' },
                    { name: 'Karen L.', neighborhood: 'Verrado', text: 'Construction near new Verrado homes cracked my windshield. Pink Auto Glass came out the same day, handled my AAA claim, and I paid nothing. Great service.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Goodyear Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Goodyear?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Goodyear. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="goodyear-az-cta" />
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
                    <Link href="/locations/avondale-az" className="text-blue-600 hover:underline">Avondale</Link>
                    <Link href="/locations/buckeye-az" className="text-blue-600 hover:underline">Buckeye</Link>
                    <Link href="/locations/litchfield-park-az" className="text-blue-600 hover:underline">Litchfield Park</Link>
                    <Link href="/locations/surprise-az" className="text-blue-600 hover:underline">Surprise</Link>
                    <Link href="/locations/phoenix-az" className="text-blue-600 hover:underline">Phoenix</Link>
                    <Link href="/locations/peoria-az" className="text-blue-600 hover:underline">Peoria</Link>
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
