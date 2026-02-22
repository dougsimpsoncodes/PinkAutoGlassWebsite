import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement El Mirage AZ | Auto Glass Repair | $0 Deductible | (720) 918-7465',
  description: 'Windshield replacement & auto glass repair in El Mirage AZ. Same-day mobile service. Grand Avenue (US-60) corridor & all El Mirage. ARS 20-264 means $0 out of pocket. Call (720) 918-7465!',
  keywords: 'windshield replacement el mirage az, windshield repair el mirage, auto glass el mirage az, zero deductible windshield el mirage arizona, grand avenue windshield, US-60 auto glass el mirage',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/el-mirage-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement El Mirage, AZ | Pink Auto Glass',
    description: 'El Mirage trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service throughout El Mirage and Grand Avenue corridor. ARS 20-264 coverage.',
    url: 'https://pinkautoglass.com/locations/el-mirage-az',
    type: 'website',
  },
};

export default function ElMirageLocationPage() {
  const faqs = [
    {
      question: 'Does Arizona\'s zero-deductible glass law apply to El Mirage residents?',
      answer: 'Yes. ARS 20-264 applies to all Arizona drivers with comprehensive auto insurance. El Mirage residents qualify for $0 windshield replacement with the glass endorsement on their comprehensive policy. We verify coverage before starting any work — for most El Mirage drivers, the cost is nothing out of pocket.'
    },
    {
      question: 'Why does the Grand Avenue (US-60) corridor cause so many windshield chips?',
      answer: 'Grand Avenue (US-60) is one of the oldest and most heavily traveled commercial routes in the Phoenix metro. It carries commercial freight, construction equipment, and industrial vehicles along a diagonal corridor through the West Valley. El Mirage\'s position along this corridor means constant exposure to truck traffic and road debris. Grand Avenue\'s age also means road surfaces are rougher than newer freeways, throwing more debris into traffic lanes.'
    },
    {
      question: 'Can you service my vehicle in El Mirage near the Sun City border?',
      answer: 'Yes. We provide mobile service throughout El Mirage including areas near the Sun City and Youngtown borders. El Mirage is a small city and we can typically reach any El Mirage location within a few hours of your call. Same-day service available.'
    },
    {
      question: 'Will my insurance rates go up if I use my glass coverage?',
      answer: 'No. Arizona law ARS 20-263 provides no-fault rate protection for glass claims. Your rates cannot increase because of a windshield replacement claim in Arizona. El Mirage residents with comprehensive coverage can use this benefit without concern about their premium history.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'El Mirage',
    state: 'AZ',
    zipCode: '85335',
    latitude: 33.6131,
    longitude: -112.3268,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'El Mirage, AZ', url: 'https://pinkautoglass.com/locations/el-mirage-az' }
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
                <span className="text-xl">El Mirage, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                El Mirage's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="el-mirage-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'El Mirage, AZ', href: '/locations/el-mirage-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why El Mirage Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  El Mirage is a small, established West Valley community bordered by Sun City and Youngtown — communities that collectively form one of Arizona's largest concentrations of older residents. El Mirage itself is home to a working-class community that values straightforward, affordable service. Grand Avenue (US-60) cuts through the heart of the area, carrying the West Valley's commercial freight traffic past El Mirage daily. The combination of an older road infrastructure and heavy truck traffic makes windshield damage a regular occurrence for El Mirage residents.
                </p>
                <AboveFoldCTA location="location-el-mirage-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona's ARS 20-264 makes windshield replacement free for most El Mirage drivers with comprehensive coverage. ARS 20-263 protects your rates. ARS 20-469 means you choose the shop. We provide same-day mobile service throughout El Mirage and handle your entire insurance claim at no charge.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why El Mirage Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Grand Avenue Commercial Corridor:</strong> US-60 (Grand Avenue) is a historic commercial road that predates the Phoenix freeway system. Its older pavement and rougher surface conditions, combined with constant commercial truck traffic, make it one of the West Valley's most chip-intensive driving corridors.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Industrial Area Traffic:</strong> El Mirage borders industrial and commercial zones that generate heavy vehicle activity on local roads. Delivery vehicles and commercial equipment move through El Mirage regularly, adding to debris on residential streets.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Older Road Infrastructure:</strong> El Mirage's established community means older road surfaces that have accumulated more cracks and rough patches than newer suburban developments. Older pavement throws more debris into traffic lanes.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects El Mirage Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your rates.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop — your insurer cannot require Safelite.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">El Mirage Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'El Mirage Town Center', 'Sun City Border', 'Youngtown Border',
                    'Grand Avenue Corridor', 'Dysart Road', 'Thunderbird Road',
                    'West El Mirage', 'North El Mirage', 'South El Mirage'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in El Mirage</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Fix Grand Avenue chips before Arizona heat expands them. Mobile service throughout El Mirage.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full OEM-quality replacement. $0 with ARS 20-264. Mobile service to your El Mirage home.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What El Mirage Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Ray T.', neighborhood: 'El Mirage', text: 'Grand Avenue chip turned into a crack. Pink Auto Glass came to my house the same day I called. My Nationwide coverage handled everything — zero out of pocket. Very professional.' },
                    { name: 'Patricia N.', neighborhood: 'Sun City Border', text: 'Didn\'t know Arizona had a zero-deductible glass law. Pink Auto Glass explained it, verified my coverage, came to my home, and replaced my windshield for free. Excellent service.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from El Mirage Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in El Mirage?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service throughout El Mirage. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="el-mirage-az-cta" />
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
                    <Link href="/locations/surprise-az" className="text-blue-600 hover:underline">Surprise</Link>
                    <Link href="/locations/peoria-az" className="text-blue-600 hover:underline">Peoria</Link>
                    <Link href="/locations/glendale-az" className="text-blue-600 hover:underline">Glendale</Link>
                    <Link href="/locations/avondale-az" className="text-blue-600 hover:underline">Avondale</Link>
                    <Link href="/locations/goodyear-az" className="text-blue-600 hover:underline">Goodyear</Link>
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
