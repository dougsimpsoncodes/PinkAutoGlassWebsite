import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Surprise AZ | Auto Glass Repair | $0 Deductible | (720) 918-7465',
  description: 'Windshield replacement & auto glass repair in Surprise AZ. Same-day mobile service to Sun City Grand, Marley Park & all Surprise. ARS 20-264 means $0 out of pocket. Call (720) 918-7465!',
  keywords: 'windshield replacement surprise az, windshield repair surprise, auto glass surprise az, zero deductible windshield surprise, sun city grand windshield, mobile auto glass surprise arizona',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/surprise-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Surprise, AZ | Pink Auto Glass',
    description: 'Surprise\'s trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service to Sun City Grand, Marley Park, Stonebrook & all Surprise. ARS 20-264 coverage.',
    url: 'https://pinkautoglass.com/locations/surprise-az',
    type: 'website',
  },
};

export default function SurpriseLocationPage() {
  const faqs = [
    {
      question: 'Do retired residents at Sun City Grand in Surprise qualify for $0 windshield replacement?',
      answer: 'Yes. Arizona\'s ARS 20-264 zero-deductible glass law applies to all Arizona drivers with comprehensive coverage, including Sun City Grand residents. Many retirees are surprised to learn they\'ve been paying for this benefit their entire time in Arizona. If you have comprehensive insurance with the glass endorsement, your windshield replacement is completely free.'
    },
    {
      question: 'Can you service my vehicle at my Sun City Grand home in Surprise?',
      answer: 'Absolutely. We provide mobile service throughout all of Surprise including Sun City Grand, Marley Park, Stonebrook, Rancho Gabriela, and all other Surprise neighborhoods. We come directly to your home — no need to drive anywhere. Service typically takes 60-90 minutes and we handle all insurance paperwork.'
    },
    {
      question: 'Will my insurance rates go up if I file a glass claim in Surprise?',
      answer: 'No. Arizona law ARS 20-263 provides legal no-fault rate protection for glass claims. Filing a windshield replacement claim in Surprise cannot raise your insurance rates. This law protects every Arizona driver, including longtime residents who have maintained clean driving records and don\'t want to risk their rates.'
    },
    {
      question: 'Why are Bell Road and the US-60 extension so hard on windshields in Surprise?',
      answer: 'The West Valley\'s rapid expansion has turned Bell Road into one of the busiest commercial corridors in the region. The US-60 extension and ongoing Loop 303 construction have added heavy construction equipment to Surprise roads. The combination of new road construction, growing commercial traffic, and desert-edge gravel roads makes Surprise one of the more chip-prone areas in the Phoenix metro.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Surprise',
    state: 'AZ',
    zipCode: '85374',
    latitude: 33.6292,
    longitude: -112.3679,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Surprise, AZ', url: 'https://pinkautoglass.com/locations/surprise-az' }
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
                <span className="text-xl">Surprise, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Surprise's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="surprise-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Surprise, AZ', href: '/locations/surprise-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Surprise Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Surprise has transformed from a small farming community into one of the fastest-growing cities in the West Valley, blending one of Arizona's largest active-adult retirement communities (Sun City Grand) with young families moving into Marley Park, Stonebrook, and West Point. Surprise Stadium draws spring training fans each February, and the ongoing West Valley expansion — including Loop 303 construction — brings constant road equipment and debris to Bell Road and surrounding areas.
                </p>
                <AboveFoldCTA location="location-surprise-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona's laws are especially meaningful for Surprise's large retirement community. ARS 20-264 means $0 out of pocket. ARS 20-263 means no rate increase. ARS 20-469 means you choose the shop — not whoever your insurer recommends. We provide mobile service directly to your home in Sun City Grand or anywhere else in Surprise.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Surprise Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Bell Road Commercial Corridor:</strong> Bell Road is the primary east-west commercial spine of the West Valley. Commercial truck deliveries, construction vehicles, and high-volume retail traffic create constant chip exposure for daily Surprise drivers.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Loop 303 Construction:</strong> The ongoing Loop 303 expansion through the West Valley brings massive construction equipment, gravel trucks, and road work to Surprise roads. Residents near construction zones see elevated chip rates during active work periods.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Desert Edge Roads:</strong> Surprise's western edge borders open desert. Roads near Tierra Encantada, Surprise Farms, and the western boundary transition from paved suburban streets to caliche-edged roads that deposit loose material on commuter routes.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Golf Cart Road Crossings:</strong> Sun City Grand's extensive golf cart network crosses public streets at multiple points. Golf carts occasionally kick up road debris at these intersections, and the volume of low-speed electric vehicle traffic concentrates road grit at crossings.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Surprise Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your rates in Arizona.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop — you are not required to use Safelite.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Surprise Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Marley Park', 'Stonebrook', 'Rancho Gabriela',
                    'Sun City Grand', 'West Point', 'Surprise Farms',
                    'Tierra Encantada', 'Bell Road Corridor', 'North Surprise'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Surprise</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Fix chips from Bell Road and construction traffic. Mobile service to your home.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full OEM-quality replacement. $0 with ARS 20-264 coverage. We come to you.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Surprise Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Harold B.', neighborhood: 'Sun City Grand', text: 'I\'ve lived in Sun City Grand for 12 years and never knew about Arizona\'s zero-deductible glass law. Pink Auto Glass came right to my house and replaced my windshield for nothing. Should have known sooner!' },
                    { name: 'Michelle R.', neighborhood: 'Marley Park', text: 'Construction near Marley Park left me with a cracked windshield. Pink Auto Glass handled my USAA claim and came out the same day. Zero dollars, great service.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Surprise Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Surprise?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Surprise. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="surprise-az-cta" />
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
                    <Link href="/locations/peoria-az" className="text-blue-600 hover:underline">Peoria</Link>
                    <Link href="/locations/glendale-az" className="text-blue-600 hover:underline">Glendale</Link>
                    <Link href="/locations/el-mirage-az" className="text-blue-600 hover:underline">El Mirage</Link>
                    <Link href="/locations/goodyear-az" className="text-blue-600 hover:underline">Goodyear</Link>
                    <Link href="/locations/buckeye-az" className="text-blue-600 hover:underline">Buckeye</Link>
                    <Link href="/locations/litchfield-park-az" className="text-blue-600 hover:underline">Litchfield Park</Link>
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
