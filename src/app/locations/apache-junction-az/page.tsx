import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Apache Junction AZ | Auto Glass Repair | $0 Deductible | (480) 712-7465',
  description: 'Windshield replacement & auto glass repair in Apache Junction AZ. Same-day mobile service near Superstition Mountains & all AJ. ARS 20-264 means $0 out of pocket. Call (480) 712-7465!',
  keywords: 'windshield replacement apache junction az, windshield repair apache junction, auto glass apache junction, zero deductible windshield apache junction, gold canyon windshield, US-60 auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/apache-junction-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Apache Junction, AZ | Pink Auto Glass',
    description: 'Apache Junction trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service to Gold Canyon, Lost Dutchman area & all AJ. ARS 20-264 coverage.',
    url: 'https://pinkautoglass.com/locations/apache-junction-az',
    type: 'website',
  },
};

export default function ApacheJunctionLocationPage() {
  const faqs = [
    {
      question: 'Does Arizona\'s zero-deductible glass law cover Apache Junction residents?',
      answer: 'Yes. ARS 20-264 applies to all Arizona drivers with comprehensive auto insurance, including Apache Junction and Gold Canyon residents. We verify your coverage before starting any work. If you have the glass endorsement, your replacement is completely free regardless of your deductible amount on the rest of your policy.'
    },
    {
      question: 'Why is Apache Junction one of the toughest areas for windshields in Arizona?',
      answer: 'Apache Junction sits at the gateway to the Superstition Mountains and Lost Dutchman State Park. US-60 carries heavy commercial truck traffic through town daily, and ATV and off-road vehicle culture means dirt roads and desert terrain are part of daily life. Off-road vehicles track loose rock and caliche onto paved roads constantly. The area also has many gravel-shouldered roads that contribute to chip exposure.'
    },
    {
      question: 'Can you come to the Gold Canyon area for mobile windshield service?',
      answer: 'Yes. We provide mobile service throughout Apache Junction including Gold Canyon, the Lost Dutchman area, and all Apache Junction neighborhoods. Gold Canyon is one of the Phoenix metro\'s most scenic communities, and we\'re happy to come directly to your home there. Same-day service available throughout the area.'
    },
    {
      question: 'Will my insurance rates go up if I file a windshield claim?',
      answer: 'No. Arizona law ARS 20-263 provides no-fault rate protection for glass claims. Your rates cannot legally increase because of a windshield replacement claim. Many Apache Junction and Gold Canyon residents are retirees who maintain excellent driving records — this protection means you can use your coverage without concern.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Apache Junction',
    state: 'AZ',
    zipCode: '85120',
    latitude: 33.4151,
    longitude: -111.5496,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Apache Junction, AZ', url: 'https://pinkautoglass.com/locations/apache-junction-az' }
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
                <span className="text-xl">Apache Junction, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Apache Junction's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="apache-junction-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Apache Junction, AZ', href: '/locations/apache-junction-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Apache Junction Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Apache Junction is the gateway to the Superstition Mountains and the legendary Lost Dutchman Mine country. Straddling the border between Maricopa and Pinal counties, AJ is a community where outdoor recreation, desert living, and US-60 freeway commuting intersect. The US-60 (Superstition Freeway) carries heavy commercial traffic through town, and Gold Canyon to the east offers scenic desert living with roads that regularly bring loose rock and gravel onto suburban streets. The area's strong ATV and off-road culture means dusty, debris-laden roads are part of daily life.
                </p>
                <AboveFoldCTA location="location-apache-junction-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona's ARS 20-264 means $0 out of pocket for most Apache Junction drivers with comprehensive coverage. ARS 20-263 protects your rates. ARS 20-469 lets you choose your shop. We provide same-day mobile service throughout Apache Junction and Gold Canyon.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Apache Junction Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>US-60 Superstition Freeway Through Town:</strong> The US-60 passes directly through Apache Junction carrying constant commercial truck and freeway traffic. For residents who commute west toward Mesa and Phoenix on the 60, rock chip exposure is a daily reality.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Superstition Mountains Desert Roads:</strong> Roads accessing the Superstition Wilderness, Lost Dutchman State Park, and surrounding desert terrain are partially unpaved and frequently traveled. Desert rock and caliche migrate onto Apache Junction's paved residential streets consistently.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>ATV and Off-Road Culture:</strong> Apache Junction has one of Arizona's most active off-road communities. ATVs, side-by-sides, and off-road vehicles regularly use local roads to access desert terrain, tracking sand and gravel back onto paved surfaces.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Gold Canyon Scenic Road Trade-offs:</strong> Gold Canyon's beautiful desert roads near the Superstition Mountains are scenic but rough on glass. Loose rock from mountain terrain frequently ends up on roadways through this area.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Apache Junction Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your rates.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop — your insurer cannot require Safelite.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Apache Junction Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Gold Canyon', 'Apache Junction Downtown', 'Lost Dutchman Area',
                    'Superstition Foothills', 'Crimson Road', 'Mountain View',
                    'Apache Wells', 'Superstition Springs', 'East Mesa Border'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Apache Junction</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Fix desert road chips before heat expands them. Mobile service throughout AJ.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full OEM-quality replacement. $0 with ARS 20-264. We come to Gold Canyon or anywhere in AJ.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Apache Junction Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Frank W.', neighborhood: 'Gold Canyon', text: 'Desert road chips from near the Superstition trailheads finally got me. Pink Auto Glass came out to Gold Canyon and replaced my windshield. USAA covered everything — not a penny out of pocket.' },
                    { name: 'Connie B.', neighborhood: 'Apache Junction', text: 'I had no idea Arizona law meant my windshield was free. Pink Auto Glass explained the whole thing, came to my house, and took care of my insurance. Excellent people to work with.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Apache Junction Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Apache Junction?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service throughout Apache Junction. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="apache-junction-az-cta" />
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
                    <Link href="/locations/mesa-az" className="text-blue-600 hover:underline">Mesa</Link>
                    <Link href="/locations/queen-creek-az" className="text-blue-600 hover:underline">Queen Creek</Link>
                    <Link href="/locations/gilbert-az" className="text-blue-600 hover:underline">Gilbert</Link>
                    <Link href="/locations/chandler-az" className="text-blue-600 hover:underline">Chandler</Link>
                    <Link href="/locations/fountain-hills-az" className="text-blue-600 hover:underline">Fountain Hills</Link>
                    <Link href="/locations/maricopa-az" className="text-blue-600 hover:underline">Maricopa</Link>
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
