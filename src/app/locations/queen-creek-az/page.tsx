import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Queen Creek AZ | Auto Glass Repair | $0 Deductible | (480) 712-7465',
  description: 'Windshield replacement & auto glass repair in Queen Creek AZ. Same-day mobile service to Pecan Creek, Hastings Farms & all Queen Creek. ARS 20-264 means $0 out of pocket. Call (480) 712-7465!',
  keywords: 'windshield replacement queen creek az, windshield repair queen creek, auto glass queen creek az, zero deductible windshield queen creek arizona, hastings farms windshield',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/queen-creek-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Queen Creek, AZ | Pink Auto Glass',
    description: 'Queen Creek trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service to Pecan Creek, Hastings Farms, Cortina & all Queen Creek. ARS 20-264.',
    url: 'https://pinkautoglass.com/locations/queen-creek-az',
    type: 'website',
  },
};

export default function QueenCreekLocationPage() {
  const faqs = [
    {
      question: 'Does Arizona\'s zero-deductible law apply to Queen Creek and San Tan Valley?',
      answer: 'Yes. ARS 20-264 applies statewide to all Arizona drivers with comprehensive coverage. Queen Creek residents in Pecan Creek, Hastings Farms, Cortina, and Harvest all qualify. We verify your coverage before starting work — for most Queen Creek drivers with the glass endorsement, it\'s completely $0 out of pocket.'
    },
    {
      question: 'Why do Queen Creek\'s agricultural roads cause so many windshield chips?',
      answer: 'Queen Creek sits at the edge of one of Arizona\'s most active agricultural areas. Farm roads, equipment routes, and partially-paved access roads throughout the SE Valley bring loose gravel, irrigation residue, and soil to suburban streets. Harvest Festival and equestrian event traffic further contributes. The I-60/Ellsworth corridor also sees growing commercial truck traffic as the area develops.'
    },
    {
      question: 'Will my insurance rates go up if I use my Arizona glass coverage?',
      answer: 'No. ARS 20-263 provides no-fault protection for glass claims throughout Arizona. Filing a windshield replacement claim in Queen Creek cannot legally raise your insurance rates. Queen Creek is a newer community with many transplant residents who don\'t realize this protection exists.'
    },
    {
      question: 'Can you come out to my house in Queen Creek for same-day service?',
      answer: 'Yes. We provide same-day mobile windshield service throughout Queen Creek including Pecan Creek, Sossaman Estates, Cortina, Hastings Farms, Victoria, and Harvest. We come to your home or any convenient location. Call us in the morning and we can typically be there the same day.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Queen Creek',
    state: 'AZ',
    zipCode: '85142',
    latitude: 33.2481,
    longitude: -111.6340,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Queen Creek, AZ', url: 'https://pinkautoglass.com/locations/queen-creek-az' }
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
                <span className="text-xl">Queen Creek, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Queen Creek's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="queen-creek-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Queen Creek, AZ', href: '/locations/queen-creek-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Queen Creek Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Queen Creek occupies a unique position in the Phoenix metro — a rapidly growing family suburb that still borders active agricultural land. The Pecan Festival and equestrian heritage define Queen Creek's community character, but so does the practical reality of farm roads and new construction sharing space with suburban commuters. Ellsworth Road and Rittenhouse Road have become major arteries for families commuting to Gilbert, Chandler, and Mesa, while the surrounding agricultural land brings loose soil and gravel to suburban streets year-round.
                </p>
                <AboveFoldCTA location="location-queen-creek-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona's ARS 20-264 means $0 out of pocket for most Queen Creek drivers with comprehensive coverage. ARS 20-263 means no rate increases. ARS 20-469 means you choose your shop. We provide same-day mobile service throughout Queen Creek and handle your entire insurance claim.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Queen Creek Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Agricultural Road Debris:</strong> Farm equipment, irrigation vehicles, and harvest machinery regularly travel roads between residential neighborhoods and active agricultural parcels. These vehicles bring loose soil, gravel, and organic debris onto suburban commuter routes.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Ellsworth/I-60 Corridor Growth:</strong> The Ellsworth Road corridor has become a primary development artery for SE Valley growth. Construction trucks building new phases of Pecan Creek, Cortina, and Hastings Farms are constant on local roads.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Unpaved Road Transitions:</strong> Queen Creek still has numerous unpaved roads between communities. Drivers transitioning between paved suburban streets and dirt access roads bring loose material back onto pavement constantly.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Summer Heat and Wind:</strong> Queen Creek's inland SE Valley location sees intense summer heat. Monsoon season brings dust storms from the southeast that deposit fine sand and rock chips on vehicle glass throughout the area.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Queen Creek Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your rates.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop — you are not required to use Safelite.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Queen Creek Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Pecan Creek', 'Hastings Farms', 'Cortina',
                    'Sossaman Estates', 'Victoria', 'Harvest',
                    'Encanterra', 'Montelena', 'Barney Farms'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Queen Creek</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Fix agricultural road chips before heat cracks them. Fast mobile service.</p>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Queen Creek Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Jennifer B.', neighborhood: 'Hastings Farms', text: 'A farm equipment truck near Ellsworth gave me a crack I ignored too long in the summer. Pink Auto Glass replaced it at my house in Hastings Farms. State Farm covered everything — absolutely zero cost.' },
                    { name: 'Michael P.', neighborhood: 'Cortina', text: 'New to Queen Creek and had no idea about Arizona\'s glass law. Pink Auto Glass explained it, came to our home in Cortina the next morning, and replaced our windshield for free. Amazing.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Queen Creek Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Queen Creek?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service throughout Queen Creek. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="queen-creek-az-cta" />
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
                    <Link href="/locations/gilbert-az" className="text-blue-600 hover:underline">Gilbert</Link>
                    <Link href="/locations/chandler-az" className="text-blue-600 hover:underline">Chandler</Link>
                    <Link href="/locations/mesa-az" className="text-blue-600 hover:underline">Mesa</Link>
                    <Link href="/locations/apache-junction-az" className="text-blue-600 hover:underline">Apache Junction</Link>
                    <Link href="/locations/maricopa-az" className="text-blue-600 hover:underline">Maricopa</Link>
                    <Link href="/locations/scottsdale-az" className="text-blue-600 hover:underline">Scottsdale</Link>
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
