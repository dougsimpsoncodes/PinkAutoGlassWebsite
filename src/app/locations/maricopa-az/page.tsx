import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Maricopa AZ | Auto Glass Repair | $0 Deductible | (480) 712-7465',
  description: 'Windshield replacement & auto glass repair in Maricopa AZ. Same-day mobile service to Province, Rancho El Dorado & all Maricopa. ARS 20-264 means $0 out of pocket. Call (480) 712-7465!',
  keywords: 'windshield replacement maricopa az, windshield repair maricopa, auto glass maricopa az, zero deductible windshield maricopa arizona, province maricopa windshield, SR-347 auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/maricopa-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Maricopa, AZ | Pink Auto Glass',
    description: 'Maricopa trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service to Province, Rancho El Dorado & all Maricopa. ARS 20-264 coverage.',
    url: 'https://pinkautoglass.com/locations/maricopa-az',
    type: 'website',
  },
};

export default function MaricopaLocationPage() {
  const faqs = [
    {
      question: 'Does Arizona\'s $0 windshield law apply to Maricopa and Pinal County residents?',
      answer: 'Yes. ARS 20-264 is an Arizona statewide law that applies to all Arizona drivers with comprehensive coverage regardless of county. Maricopa city residents in Pinal County qualify just like Maricopa County drivers. We verify your coverage before starting work — for most Maricopa drivers with the glass endorsement, it\'s $0 out of pocket.'
    },
    {
      question: 'Why is the SR-347 commute so hard on windshields?',
      answer: 'SR-347 (John Wayne Parkway) is the primary commuter route connecting Maricopa to the Phoenix metro — a 35-mile stretch through open desert and Gila River Indian Community land. This road carries thousands of daily commuters past construction zones, gravel shoulders, and desert terrain where loose material regularly deposits on the roadway. The lack of median protection and open terrain means wind-blown rock is a constant chip source.'
    },
    {
      question: 'Will my rates go up for filing a glass claim as a Maricopa commuter?',
      answer: 'No. Arizona law ARS 20-263 provides no-fault rate protection for glass claims statewide. Filing a windshield claim in Maricopa cannot legally raise your insurance rates. Maricopa commuters who drive SR-347 daily are among Arizona\'s most glass-vulnerable drivers — this protection is especially valuable for frequent commuters.'
    },
    {
      question: 'Can you come to my home in Maricopa — it\'s pretty far from Phoenix?',
      answer: 'Yes. We provide mobile service throughout Maricopa including Province, Rancho El Dorado, Smith Farms, Homestead, and all other Maricopa neighborhoods. Maricopa\'s distance from central Phoenix is why mobile service matters — we come to you so you don\'t have to drive a damaged windshield to a shop. Same-day appointments available.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Maricopa',
    state: 'AZ',
    zipCode: '85138',
    latitude: 33.0581,
    longitude: -112.0476,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Maricopa, AZ', url: 'https://pinkautoglass.com/locations/maricopa-az' }
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
                <span className="text-xl">Maricopa, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Maricopa's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="maricopa-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Maricopa, AZ', href: '/locations/maricopa-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Maricopa Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  We offer same-day mobile service to your Maricopa home — no SR-347 drive required — and Arizona law means most drivers pay $0 out of pocket.
                </p>
                <AboveFoldCTA location="location-maricopa-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona law means most Maricopa drivers pay $0 — zero-deductible coverage is required, your rates can't go up, and you choose the shop.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Maricopa Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>SR-347 Daily Commute:</strong> SR-347 is a 35-mile desert highway with limited median barriers and gravel shoulders.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Gila River Indian Community Corridor:</strong> SR-347 passes through the Gila River Indian Community, where gravel shoulders and desert road conditions are more pronounced than on typical Phoenix metro freeways.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Active New Development:</strong> Maricopa continues to expand rapidly, with construction activity throughout Province, Homestead, and Santa Rosa Springs bringing gravel trucks to local roads year-round.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Desert Sand and Monsoon Haboobs:</strong> Maricopa sits in open desert with limited wind protection, where intense monsoon haboobs from the southeast deposit sand and rock on roads.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Maricopa Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required with comprehensive policies statewide.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your rates anywhere in Arizona.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop — your insurer cannot require Safelite.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Maricopa Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Province', 'Rancho El Dorado', 'Smith Farms',
                    'Homestead', 'Santa Rosa Springs', 'Cobblestone Farms',
                    'Glennwilde', 'Tortosa', 'South Maricopa'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Maricopa</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Fix SR-347 chips before Maricopa heat expands them. Mobile service to your home.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full OEM-quality replacement. $0 with ARS 20-264. We come to Maricopa so you don't have to drive.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Maricopa Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Steve C.', neighborhood: 'Province', text: 'The SR-347 commute finally destroyed my windshield. Pink Auto Glass came to my Province home — didn\'t have to drive to Phoenix with a cracked windshield. Travelers insurance covered 100%.' },
                    { name: 'Laura M.', neighborhood: 'Rancho El Dorado', text: 'I commute to Chandler daily on 347 and chips are just part of life. Finally used my Arizona glass coverage through Pink Auto Glass. Wish I\'d done it sooner. They handled everything.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Maricopa Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Maricopa?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service to your Maricopa home. No SR-347 drive required. $0 out of pocket.</p>
                <CTAButtons source="maricopa-az-cta" />
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
                    <Link href="/locations/chandler-az" className="text-blue-600 hover:underline">Chandler</Link>
                    <Link href="/locations/queen-creek-az" className="text-blue-600 hover:underline">Queen Creek</Link>
                    <Link href="/locations/gilbert-az" className="text-blue-600 hover:underline">Gilbert</Link>
                    <Link href="/locations/buckeye-az" className="text-blue-600 hover:underline">Buckeye</Link>
                    <Link href="/locations/ahwatukee-az" className="text-blue-600 hover:underline">Ahwatukee</Link>
                    <Link href="/locations/apache-junction-az" className="text-blue-600 hover:underline">Apache Junction</Link>
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
