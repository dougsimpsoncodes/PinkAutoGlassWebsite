import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Litchfield Park AZ | Auto Glass Repair | $0 Deductible | (480) 712-7465',
  description: 'Windshield replacement & auto glass repair in Litchfield Park AZ. Same-day mobile service near Wigwam Resort, Luke AFB corridor & all Litchfield Park. ARS 20-264 means $0 out of pocket. Call (480) 712-7465!',
  keywords: 'windshield replacement litchfield park az, windshield repair litchfield park, auto glass litchfield park az, zero deductible windshield litchfield park arizona, wigwam resort area auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/litchfield-park-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Litchfield Park, AZ | Pink Auto Glass',
    description: 'Litchfield Park trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service near Wigwam Resort, Luke AFB & all Litchfield Park. ARS 20-264.',
    url: 'https://pinkautoglass.com/locations/litchfield-park-az',
    type: 'website',
  },
};

export default function LitchfieldParkLocationPage() {
  const faqs = [
    {
      question: 'Does Arizona\'s $0 windshield law apply to Litchfield Park residents?',
      answer: 'Yes. ARS 20-264 applies to all Arizona drivers with comprehensive coverage. Litchfield Park residents near the Wigwam Resort, Dreaming Summit, and all other neighborhoods qualify. We verify your coverage before starting work — for most Litchfield Park drivers with the glass endorsement, replacement is completely free.'
    },
    {
      question: 'How does Loop 303 traffic affect windshields in Litchfield Park?',
      answer: 'Loop 303 is one of the most actively expanding corridors in the West Valley, and construction activity associated with Loop 303 improvements generates significant debris. Commercial traffic using Loop 303 to connect to I-10 passes near Litchfield Park, and the corridor has seen major development activity that brings construction equipment and material trucks to surrounding roads.'
    },
    {
      question: 'Will my insurance rates go up if I file a glass claim near Luke AFB?',
      answer: 'No. Arizona law ARS 20-263 provides no-fault rate protection for all glass claims regardless of location. Military families stationed at Luke AFB and civilian residents of Litchfield Park are equally protected. Filing a windshield claim cannot raise your insurance rates in Arizona.'
    },
    {
      question: 'Can you service vehicles at the Wigwam Resort or nearby commercial areas?',
      answer: 'Yes. We provide mobile service throughout Litchfield Park including resort-area commercial zones, residential neighborhoods, and all surrounding areas. We can service your vehicle at your home, hotel, or any Litchfield Park location. Same-day appointments available.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Litchfield Park',
    state: 'AZ',
    zipCode: '85340',
    latitude: 33.4936,
    longitude: -112.3585,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Litchfield Park, AZ', url: 'https://pinkautoglass.com/locations/litchfield-park-az' }
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
                <span className="text-xl">Litchfield Park, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Litchfield Park's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="litchfield-park-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Litchfield Park, AZ', href: '/locations/litchfield-park-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Litchfield Park Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Litchfield Park is one of the West Valley's most distinctive communities — a planned city built around the historic Wigwam Resort, originally developed by Goodyear Tire and Rubber Company as an executive retreat in the 1920s. Today, Litchfield Park is a desirable, master-planned community nestled between Goodyear and the Luke AFB corridor. Loop 303 construction and the I-10 freight corridor create ongoing windshield chip exposure for residents, while the community's affinity for quality service makes Pink Auto Glass's mobile approach a natural fit.
                </p>
                <AboveFoldCTA location="location-litchfield-park-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona's ARS 20-264 means $0 out of pocket for most Litchfield Park drivers with comprehensive coverage. ARS 20-263 means no rate increases. ARS 20-469 means you choose your shop. We come directly to your Litchfield Park home and handle your entire insurance claim.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Litchfield Park Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Loop 303 Expansion Traffic:</strong> The Loop 303 corridor west of Litchfield Park is undergoing major expansion. Construction equipment, road graders, and material trucks are active in the area, bringing road debris to Litchfield Road and surrounding routes.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Luke AFB Approach Corridors:</strong> Litchfield Road and Dysart Road serve as approach corridors for Luke Air Force Base. Military and contractor vehicle traffic on these routes contributes to debris on suburban roads near Litchfield Park.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-10 West Valley Access:</strong> Residents accessing I-10 from Litchfield Park travel through high-traffic corridors where commercial truck traffic is heavy. The I-10 west California freight route passes within a few miles of Litchfield Park.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Litchfield Park Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your rates.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop — your insurer cannot require Safelite.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Litchfield Park Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Wigwam Resort Area', 'Dreaming Summit', 'Historic District',
                    'Litchfield Park South', 'Dysart Corridor', 'Luke AFB Corridor',
                    'Goodyear Border', 'Verrado Approach', 'North Litchfield'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Litchfield Park</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Fix Loop 303 chips before heat expands them. Mobile service to your Litchfield Park home.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full OEM-quality replacement. $0 with ARS 20-264. Mobile service throughout Litchfield Park.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Litchfield Park Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'William H.', neighborhood: 'Wigwam Area', text: 'Construction on Loop 303 near Litchfield Road chipped my windshield. Pink Auto Glass came to my house and replaced it. My Safeco policy covered everything — not a cent out of pocket.' },
                    { name: 'Christine A.', neighborhood: 'Litchfield Park', text: 'Pink Auto Glass came to my home, handled my State Farm claim, and replaced my windshield in under two hours. The most hassle-free service experience I\'ve had. $0 cost.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Litchfield Park Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Litchfield Park?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service throughout Litchfield Park. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="litchfield-park-az-cta" />
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
                    <Link href="/locations/avondale-az" className="text-blue-600 hover:underline">Avondale</Link>
                    <Link href="/locations/buckeye-az" className="text-blue-600 hover:underline">Buckeye</Link>
                    <Link href="/locations/surprise-az" className="text-blue-600 hover:underline">Surprise</Link>
                    <Link href="/locations/peoria-az" className="text-blue-600 hover:underline">Peoria</Link>
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
