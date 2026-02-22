import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Peoria AZ | Auto Glass Repair | $0 Deductible | (480) 712-7465',
  description: 'Windshield replacement & auto glass repair in Peoria AZ. Same-day mobile service to Vistancia, Lake Pleasant & all Peoria. ARS 20-264 means $0 out of pocket. Call (480) 712-7465!',
  keywords: 'windshield replacement peoria az, windshield repair peoria, auto glass peoria az, zero deductible windshield peoria, vistancia windshield, mobile auto glass peoria arizona',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/peoria-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Peoria, AZ | Pink Auto Glass',
    description: 'Peoria\'s trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service to Vistancia, Lake Pleasant, P83 & all Peoria. ARS 20-264 coverage.',
    url: 'https://pinkautoglass.com/locations/peoria-az',
    type: 'website',
  },
};

export default function PeoriaLocationPage() {
  const faqs = [
    {
      question: 'Does Arizona\'s zero-deductible glass law apply to Peoria and the Northwest Valley?',
      answer: 'Yes. ARS 20-264 applies to all Arizona drivers with comprehensive auto insurance. Peoria residents, including those in newer communities like Vistancia and Westwing, all qualify if they have a glass endorsement on their comprehensive policy. The endorsement typically adds just $5–$15/month to your premium, and we can check your coverage in minutes.'
    },
    {
      question: 'Can you service my vehicle near Lake Pleasant or the Peoria Sports Complex?',
      answer: 'Yes. We provide mobile service throughout all of Peoria including the Lake Pleasant area, Peoria Sports Complex, P83 Entertainment District, and all residential neighborhoods from Arrowhead to Vistancia. We come to your home, your workplace, or any convenient location in Peoria.'
    },
    {
      question: 'Will filing a glass claim raise my insurance rates in Peoria?',
      answer: 'No. Arizona law ARS 20-263 provides no-fault rate protection for glass claims. Filing a windshield replacement claim in Peoria is legally classified as a no-fault comprehensive claim, which means your insurer cannot use it to raise your premiums.'
    },
    {
      question: 'Why do Peoria drivers get so many windshield chips from Happy Valley Road?',
      answer: 'Happy Valley Road and the broader Peoria/Deer Valley growth corridor is one of the most active development zones in the Northwest Valley. Constant new construction brings gravel trucks, concrete trucks, and road graders onto Happy Valley, Pinnacle Peak, and connecting roads. Chip rates in Peoria\'s northern developments rival those near major freeways.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Peoria',
    state: 'AZ',
    zipCode: '85345',
    latitude: 33.5806,
    longitude: -112.2374,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Peoria, AZ', url: 'https://pinkautoglass.com/locations/peoria-az' }
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
                <span className="text-xl">Peoria, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Peoria's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="peoria-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Peoria, AZ', href: '/locations/peoria-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Peoria Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Peoria stretches from the developed Arrowhead commercial corridor all the way north to Lake Pleasant Regional Park, encompassing some of the Phoenix metro's most scenic and fastest-growing terrain. Peoria Sports Complex draws spring training fans each year, P83 Entertainment District is a gathering hub, and communities like Vistancia and Westwing represent some of the NW Valley's newest residential growth. With this growth comes construction traffic, and with Lake Pleasant comes roads that transition from pristine pavement to gravel paths that bring debris back to city streets.
                </p>
                <AboveFoldCTA location="location-peoria-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Peoria drivers with comprehensive insurance qualify for $0 windshield replacement under Arizona's ARS 20-264. ARS 20-263 means no rate increases. ARS 20-469 means you choose the shop. We come to you anywhere in Peoria and handle your entire claim so you don't have to.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Peoria Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Lake Pleasant Road Access:</strong> State Route 74 and other access roads to Lake Pleasant transition between paved roads and areas with loose gravel and caliche. Boat trailers, ATVs, and recreational vehicles frequent these routes, kicking up debris.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Vistancia & Westwing Development:</strong> Peoria's northern communities represent active new construction zones. Gravel trucks, earth movers, and construction equipment operate on partially-paved roads throughout these developments year-round.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Loop 101 and Northern Extensions:</strong> The Loop 101 corridor through Peoria carries significant commercial truck traffic. The planned and ongoing Loop 303 corridor improvements in the area also generate construction debris and road equipment traffic.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Desert Edge Dust and Sand:</strong> Peoria's northern neighborhoods border open desert. Monsoon-season haboobs regularly deposit sand and small rocks on suburban roads, and steady desert winds keep road shoulders stocked with loose material.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Peoria Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your rates.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop — your insurer cannot require Safelite.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Peoria Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Lake Pleasant', 'Vistancia', 'Westwing',
                    'Arrowhead', 'Crossroads at Peoria', 'Rio Vista',
                    'Happy Valley', 'Parkridge', 'North Peoria'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Peoria</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Fix chips from Lake Pleasant roads and construction traffic. Fast mobile service.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full OEM-quality replacement. $0 with ARS 20-264 coverage throughout Peoria.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Peoria Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Brian T.', neighborhood: 'Vistancia', text: 'Construction trucks from the new development near Vistancia gave me a big crack. Pink Auto Glass came out the same day. My Farmers insurance covered it all — no charge, no hassle.' },
                    { name: 'Lisa P.', neighborhood: 'Arrowhead', text: 'I didn\'t realize I could choose my own shop. My insurer kept pushing Safelite. Pink Auto Glass explained Arizona law and took care of everything. Excellent experience.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Peoria Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Peoria?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Peoria. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="peoria-az-cta" />
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
                    <Link href="/locations/glendale-az" className="text-blue-600 hover:underline">Glendale</Link>
                    <Link href="/locations/surprise-az" className="text-blue-600 hover:underline">Surprise</Link>
                    <Link href="/locations/phoenix-az" className="text-blue-600 hover:underline">Phoenix</Link>
                    <Link href="/locations/el-mirage-az" className="text-blue-600 hover:underline">El Mirage</Link>
                    <Link href="/locations/cave-creek-az" className="text-blue-600 hover:underline">Cave Creek</Link>
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
