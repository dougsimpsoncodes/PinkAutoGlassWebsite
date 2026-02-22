import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Fountain Hills AZ | Auto Glass Repair | $0 Deductible | (720) 918-7465',
  description: 'Windshield replacement & auto glass repair in Fountain Hills AZ. Same-day mobile service to Eagle Mountain, Firerock & all Fountain Hills. ARS 20-264 means $0 out of pocket. Call (720) 918-7465!',
  keywords: 'windshield replacement fountain hills az, windshield repair fountain hills, auto glass fountain hills az, zero deductible windshield fountain hills arizona, eagle mountain auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/fountain-hills-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Fountain Hills, AZ | Pink Auto Glass',
    description: 'Fountain Hills trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service to Eagle Mountain, Firerock, Sunridge Canyon & all Fountain Hills.',
    url: 'https://pinkautoglass.com/locations/fountain-hills-az',
    type: 'website',
  },
};

export default function FountainHillsLocationPage() {
  const faqs = [
    {
      question: 'Does Arizona\'s zero-deductible glass law apply to Fountain Hills residents?',
      answer: 'Yes. ARS 20-264 applies to all Arizona drivers with comprehensive auto insurance. Fountain Hills residents in Eagle Mountain, Firerock Country Club, Sunridge Canyon, and all other neighborhoods qualify. The glass endorsement typically adds just $5–$15 per month to your premium, and we verify coverage before starting any work.'
    },
    {
      question: 'Why is driving to and from Fountain Hills so hard on windshields?',
      answer: 'Fountain Hills\' scenic location means most residents must travel SR-87 (the Beeline Highway) or Shea Boulevard to reach Phoenix metro. SR-87 is a desert highway that carries significant truck traffic and runs through terrain where loose rock and gravel is common. Gravel roads near desert preserves and the McDowell Mountain Regional Park vicinity also contribute to chip risk.'
    },
    {
      question: 'Will my rates go up if I file a glass claim from Fountain Hills?',
      answer: 'No. Arizona law ARS 20-263 provides no-fault rate protection. Filing a windshield claim cannot raise your insurance rates regardless of your location in Arizona. Many Fountain Hills residents maintain long clean driving records — this protection means you can use your glass coverage without any impact on your record.'
    },
    {
      question: 'Can you service vehicles at Firerock Country Club or Eagle Mountain communities?',
      answer: 'Yes. We provide full mobile service throughout Fountain Hills including gated communities at Firerock Country Club, Eagle Mountain, Sunridge Canyon, and all other neighborhoods. We work with community entry procedures to access your location. Service typically takes 60-90 minutes at your home or driveway.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Fountain Hills',
    state: 'AZ',
    zipCode: '85268',
    latitude: 33.5873,
    longitude: -111.7165,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Fountain Hills, AZ', url: 'https://pinkautoglass.com/locations/fountain-hills-az' }
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
                <span className="text-xl">Fountain Hills, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Fountain Hills' Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="fountain-hills-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Fountain Hills, AZ', href: '/locations/fountain-hills-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Fountain Hills Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Fountain Hills is one of the Phoenix metro's most scenic communities — built around its famous world-record fountain and set against the McDowell Mountains. The town attracts affluent residents who value high-quality service, and many drive luxury vehicles with advanced ADAS systems. The trade-off for Fountain Hills' spectacular desert setting is the road environment: SR-87, Shea Boulevard, and the network of desert roads near McDowell Mountain Regional Park create consistent chip exposure for residents who commute to Scottsdale and Phoenix daily.
                </p>
                <AboveFoldCTA location="location-fountain-hills-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona's ARS 20-264 means $0 out of pocket for most Fountain Hills drivers. ARS 20-263 means no rate increases. ARS 20-469 means you choose your shop. We service all vehicles including ADAS-equipped luxury models, and we come directly to your Fountain Hills home or gated community.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Fountain Hills Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>SR-87 Desert Highway:</strong> The Beeline Highway carries commercial truck traffic and runs through rugged desert terrain where loose rock and gravel from hillsides frequently lands on the roadway. Commutes to and from Fountain Hills on SR-87 are consistently chip-prone.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Shea Boulevard Gravel Shoulders:</strong> Shea Boulevard through the McDowell Mountain area has limited shoulders that accumulate desert debris. High-speed traffic on Shea turns loose material into windshield hazards.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Desert Preserve Access Roads:</strong> Residents and visitors accessing McDowell Mountain Regional Park and nearby desert preserves travel roads that transition to gravel or caliche surfaces, bringing desert material back to paved roads.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Luxury Vehicle ADAS Complexity:</strong> Many Fountain Hills residents drive vehicles with windshield-mounted ADAS cameras (Audi, BMW, Mercedes, Tesla, Range Rover). These require proper recalibration after windshield replacement — we perform this service on-site.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Fountain Hills Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your rates.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop — your insurer cannot require Safelite.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Fountain Hills Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Eagle Mountain', 'Firerock Country Club', 'Sunridge Canyon',
                    'Fountain Hills Town Center', 'Shea Corridor', 'Desert Canyon',
                    'McDowell Mountain Area', 'La Montana', 'Crestview'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Fountain Hills</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Fix SR-87 chips before desert heat cracks them. Mobile service to your home.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">OEM-quality glass. ADAS calibration for luxury vehicles. $0 with ARS 20-264.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Fountain Hills Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Richard N.', neighborhood: 'Eagle Mountain', text: 'Got chipped on SR-87 heading home from Scottsdale. Pink Auto Glass came to Eagle Mountain and replaced my BMW windshield. ADAS recalibrated, insurance handled, zero cost. Perfect service.' },
                    { name: 'Patricia G.', neighborhood: 'Firerock Country Club', text: 'They navigated the Firerock gate without any issue and replaced my windshield in my driveway. My Progressive policy covered everything. Couldn\'t have been more professional.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Fountain Hills Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Fountain Hills?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Fountain Hills. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="fountain-hills-az-cta" />
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
                    <Link href="/locations/cave-creek-az" className="text-blue-600 hover:underline">Cave Creek</Link>
                    <Link href="/locations/mesa-az" className="text-blue-600 hover:underline">Mesa</Link>
                    <Link href="/locations/gilbert-az" className="text-blue-600 hover:underline">Gilbert</Link>
                    <Link href="/locations/apache-junction-az" className="text-blue-600 hover:underline">Apache Junction</Link>
                    <Link href="/locations/phoenix-az" className="text-blue-600 hover:underline">Phoenix</Link>
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
