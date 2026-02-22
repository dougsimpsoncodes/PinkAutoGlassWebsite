import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Buckeye AZ | Auto Glass Repair | $0 Deductible | (720) 918-7465',
  description: 'Windshield replacement & auto glass repair in Buckeye AZ — fastest-growing US city. Same-day mobile service. ARS 20-264 means $0 out of pocket. Call (720) 918-7465!',
  keywords: 'windshield replacement buckeye az, windshield repair buckeye, auto glass buckeye az, zero deductible windshield buckeye arizona, sundance buckeye windshield, festival ranch auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/buckeye-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Buckeye, AZ | Pink Auto Glass',
    description: 'Buckeye\'s trusted auto glass experts. America\'s fastest-growing city. Arizona law means $0 out of pocket. Mobile service to Sundance, Festival Ranch & all Buckeye. ARS 20-264.',
    url: 'https://pinkautoglass.com/locations/buckeye-az',
    type: 'website',
  },
};

export default function BuckeyeLocationPage() {
  const faqs = [
    {
      question: 'Does Arizona\'s zero-deductible glass law apply to new Buckeye residents?',
      answer: 'Yes. ARS 20-264 applies to all Arizona residents with comprehensive auto coverage, including recent transplants to new Buckeye developments. If you moved to Buckeye from another state, you may not know Arizona\'s glass coverage laws — we explain everything and verify your coverage at no charge before starting any work.'
    },
    {
      question: 'Why does Buckeye\'s construction cause so many windshield chips?',
      answer: 'Buckeye has ranked as one of the fastest-growing cities in the entire United States for several consecutive years. Massive new home construction in Sundance, Tartesso, Festival Ranch, and Victory at Verrado means construction vehicles are everywhere — gravel trucks, concrete mixers, earth movers, and equipment transporters are active on local roads daily. Partially-paved roads in developing areas contribute loose aggregate that ends up on windshields.'
    },
    {
      question: 'Can you reach my home in far west Buckeye for mobile service?',
      answer: 'Yes. We service all of Buckeye including far western developments like Tartesso and Watson Road corridor communities. Mobile service is included at no extra charge throughout our Arizona service area. Same-day appointments are available for most Buckeye locations.'
    },
    {
      question: 'Will filing a glass claim affect my rates in Buckeye?',
      answer: 'No. Arizona law ARS 20-263 provides legal no-fault protection for glass claims. Your insurance rates cannot legally increase because you filed a windshield replacement claim in Arizona. This applies to all Buckeye residents regardless of your insurer or how long you\'ve been an Arizona resident.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Buckeye',
    state: 'AZ',
    zipCode: '85326',
    latitude: 33.3703,
    longitude: -112.5838,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Buckeye, AZ', url: 'https://pinkautoglass.com/locations/buckeye-az' }
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
                <span className="text-xl">Buckeye, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Buckeye's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="buckeye-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Buckeye, AZ', href: '/locations/buckeye-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Buckeye Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Buckeye has earned the title of America's fastest-growing city — and that explosive growth means construction is the defining feature of daily life here. From the massive Sundance community to Tartesso in the far west, Festival Ranch, and Victory at Verrado, Buckeye is building at a pace that makes road debris a constant hazard. The I-10 west corridor runs along Buckeye's south edge, carrying freight traffic between Phoenix and California. New residents moving to Buckeye from other states often don't know about Arizona's glass coverage laws.
                </p>
                <AboveFoldCTA location="location-buckeye-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona's ARS 20-264 means $0 out of pocket for most Buckeye drivers with comprehensive coverage. ARS 20-263 means your rates are protected. ARS 20-469 means you choose your shop. We come to your new home in any Buckeye community and handle your entire insurance claim.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Buckeye Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Massive New Home Construction Everywhere:</strong> Buckeye's development pace is unmatched in Arizona. Construction vehicles — particularly gravel trucks and concrete mixers — are active on local streets throughout developing neighborhoods. Many Buckeye roads are still partially unpaved in newer sections.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-10 Far West Freight Traffic:</strong> The I-10 through Buckeye carries some of the heaviest freight loads in the state. This is the artery where 18-wheelers from California enter the Phoenix metro — and their speed and load mean significant chip risk for commuters entering the freeway from Buckeye exits.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Desert Open Space Proximity:</strong> Buckeye borders vast open desert to the west and south. Desert winds bring loose caliche, sand, and small rocks onto suburban roads throughout the city. Far western developments like Tartesso have the highest exposure to desert debris.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Buckeye Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your rates in Arizona.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop — your insurer cannot require Safelite.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Buckeye Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Sundance', 'Tartesso', 'Festival Ranch',
                    'Victory at Verrado', 'Watson Road', 'Verrado',
                    'Pasqualetti Ranch', 'Sun Valley Parkway', 'East Buckeye'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Buckeye</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Fix construction chips before Arizona heat cracks them. Mobile service throughout Buckeye.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full OEM-quality replacement. $0 with ARS 20-264. We come to your new Buckeye home.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Buckeye Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Chris D.', neighborhood: 'Sundance', text: 'We moved here from California six months ago and had no idea about Arizona\'s glass law. Pink Auto Glass came to our Sundance home, replaced the windshield, and we paid nothing. Wish we\'d called sooner.' },
                    { name: 'Amanda S.', neighborhood: 'Festival Ranch', text: 'Construction trucks on my street in Festival Ranch gave me a huge crack. Pink Auto Glass was out the same day. My Geico policy covered everything — they handled the paperwork start to finish.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Buckeye Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Buckeye?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Buckeye. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="buckeye-az-cta" />
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
                    <Link href="/locations/litchfield-park-az" className="text-blue-600 hover:underline">Litchfield Park</Link>
                    <Link href="/locations/surprise-az" className="text-blue-600 hover:underline">Surprise</Link>
                    <Link href="/locations/phoenix-az" className="text-blue-600 hover:underline">Phoenix</Link>
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
