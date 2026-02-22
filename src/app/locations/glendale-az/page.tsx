import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Glendale AZ | Auto Glass Repair | $0 Deductible | (720) 918-7465',
  description: 'Windshield replacement & auto glass repair in Glendale AZ. Same-day mobile service to Westgate, Arrowhead & all Glendale. ARS 20-264 means $0 out of pocket. Call (720) 918-7465!',
  keywords: 'windshield replacement glendale az, windshield repair glendale, auto glass glendale az, zero deductible windshield glendale, westgate windshield, mobile auto glass glendale arizona',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/glendale-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Glendale, AZ | Pink Auto Glass',
    description: 'Glendale\'s trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service to Westgate, Arrowhead, Historic Glendale & more. ARS 20-264 coverage.',
    url: 'https://pinkautoglass.com/locations/glendale-az',
    type: 'website',
  },
};

export default function GlendaleLocationPage() {
  const faqs = [
    {
      question: 'Does Arizona law protect Glendale drivers from insurance rate increases after glass claims?',
      answer: 'Yes. ARS 20-263 is Arizona\'s no-fault rate protection law for glass claims. Filing a windshield replacement claim in Glendale cannot legally raise your insurance rates. Glendale drivers with comprehensive coverage have been paying for this benefit — there\'s no financial reason not to use it.'
    },
    {
      question: 'Can I get my windshield replaced near State Farm Stadium in Glendale?',
      answer: 'Absolutely. We provide mobile service throughout Glendale including Westgate, the State Farm Stadium area, and all surrounding neighborhoods. If you\'re attending a Cardinals game or concert at the stadium, we can schedule service at your home before or after the event. Same-day service available throughout Glendale.'
    },
    {
      question: 'Does Arizona\'s zero-deductible law cover all auto glass, not just windshields?',
      answer: 'Yes. Under ARS 20-264, Arizona\'s zero-deductible glass coverage applies to all auto glass — windshields, door windows, rear glass, vent windows, quarter glass, and even headlights in some policies. All glass in your vehicle is covered by the endorsement, not just the front windshield.'
    },
    {
      question: 'Why is the I-17 so rough on windshields in the Glendale area?',
      answer: 'I-17 (the Black Canyon Freeway) is Arizona\'s primary route connecting Phoenix to Flagstaff and passes through the Glendale area. It carries enormous commercial truck traffic including construction materials, aggregate rock, and freight. High-speed trucks on the I-17 corridor are a major source of windshield chips for Glendale and North Phoenix residents.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Glendale',
    state: 'AZ',
    zipCode: '85301',
    latitude: 33.5387,
    longitude: -112.1860,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Glendale, AZ', url: 'https://pinkautoglass.com/locations/glendale-az' }
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
                <span className="text-xl">Glendale, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Glendale's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="glendale-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Glendale, AZ', href: '/locations/glendale-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Glendale Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Glendale is the West Valley's entertainment and sports hub — home to State Farm Stadium (where the Cardinals play and Super Bowls are held), Westgate Entertainment District, and the historic downtown Catlin Court antique district. Glendale sits at the intersection of I-17 and Loop 101, two of Phoenix's busiest freeways, putting residents in the path of constant commercial truck traffic. The I-17 corridor to Flagstaff is especially hard on windshields with its heavy aggregate and freight trucks.
                </p>
                <AboveFoldCTA location="location-glendale-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Most Glendale drivers with comprehensive insurance qualify for $0 windshield replacement under Arizona's ARS 20-264. Your rates are protected by ARS 20-263. You pick your shop under ARS 20-469. We handle 100% of your insurance claim and come to your home, office, or anywhere in Glendale.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Glendale Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-17 Black Canyon Freeway:</strong> Arizona's primary north-south corridor passes through Glendale carrying heavy freight, construction materials, and aggregate trucks destined for Phoenix metro construction sites. Rock chip exposure on I-17 is among the highest in the metro.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Loop 101 Event Traffic:</strong> On Cardinals game days and Westgate concerts, Loop 101 experiences massive traffic surges that back up onto local Glendale roads. Bumper-to-bumper traffic in these conditions doesn't eliminate chip risk — idling behind trucks actually concentrates it.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Arrowhead & Northwest Development:</strong> The Arrowhead area and northwest Glendale are actively developing. New road construction and expansion projects mean frequent gravel and debris on local roads near Thunderbird, Maryland Avenue, and the Loop 101 corridor.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Sahuaro Ranch Desert Proximity:</strong> The Sahuaro Ranch area borders desert open space. Wind-driven caliche and desert sand migrate onto paved roads, creating an abrasive environment that weakens windshield surfaces over time.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Glendale Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your rates.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop — insurers cannot require Safelite.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Glendale Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Historic Glendale', 'Westgate', 'Arrowhead',
                    'Catlin Court', 'Sahuaro Ranch', 'Thunderbird',
                    'Maryland Avenue', 'Loop 101 Corridor', 'Peoria Border'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Glendale</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Stop I-17 chips from cracking in summer heat. Fast mobile service in Glendale.</p>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Glendale Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'David A.', neighborhood: 'Arrowhead', text: 'Rock chip on I-17 heading home. Called Pink Auto Glass and they came to my house in Arrowhead the same day. Insurance covered everything — I paid nothing. Very professional.' },
                    { name: 'Sandra M.', neighborhood: 'Historic Glendale', text: 'I was worried about my insurance rates going up. The Pink Auto Glass team explained ARS 20-263 — no rate increase for glass claims. They replaced my windshield at my home. Five stars.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Glendale Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Glendale?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Glendale. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="glendale-az-cta" />
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
                    <Link href="/locations/phoenix-az" className="text-blue-600 hover:underline">Phoenix</Link>
                    <Link href="/locations/peoria-az" className="text-blue-600 hover:underline">Peoria</Link>
                    <Link href="/locations/surprise-az" className="text-blue-600 hover:underline">Surprise</Link>
                    <Link href="/locations/el-mirage-az" className="text-blue-600 hover:underline">El Mirage</Link>
                    <Link href="/locations/avondale-az" className="text-blue-600 hover:underline">Avondale</Link>
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
