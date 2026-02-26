import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Ahwatukee AZ | Auto Glass Repair | $0 Deductible | (480) 712-7465',
  description: 'Windshield replacement & auto glass repair in Ahwatukee AZ. Same-day mobile service to Ahwatukee Foothills, Club West & all Ahwatukee. ARS 20-264 means $0 out of pocket. Call (480) 712-7465!',
  keywords: 'windshield replacement ahwatukee az, windshield repair ahwatukee, auto glass ahwatukee az, zero deductible windshield ahwatukee, ahwatukee foothills windshield, south phoenix auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/ahwatukee-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Ahwatukee, AZ | Pink Auto Glass',
    description: 'Ahwatukee trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service to Ahwatukee Foothills, Club West, Mountain Park Ranch & all Ahwatukee. ARS 20-264.',
    url: 'https://pinkautoglass.com/locations/ahwatukee-az',
    type: 'website',
  },
};

export default function AhwatukeeLocationPage() {
  const faqs = [
    {
      question: 'Does Arizona\'s zero-deductible glass law apply to Ahwatukee residents?',
      answer: 'Yes. ARS 20-264 applies to all Arizona drivers with comprehensive auto insurance. Ahwatukee residents in Ahwatukee Foothills, Lakewood, The Foothills, Club West, and Mountain Park Ranch all qualify. We verify your coverage before starting work. For most Ahwatukee drivers with the glass endorsement, windshield replacement is completely $0 out of pocket.'
    },
    {
      question: 'Why do Ahwatukee residents deal with so many windshield chips from I-10?',
      answer: 'Ahwatukee sits directly along the I-10 south corridor — Phoenix\'s primary route to Tucson. This segment carries heavy commercial truck traffic heading between the two major Arizona cities. High-speed freeway traffic combined with Ahwatukee\'s proximity to South Mountain Park creates a road environment where rock chips from trucks are a daily reality for residents who commute on the I-10.'
    },
    {
      question: 'Will my rates go up for filing a glass claim in Ahwatukee?',
      answer: 'No. Arizona law ARS 20-263 provides legal no-fault protection for glass claims statewide. Ahwatukee residents can file windshield replacement claims without any risk to their insurance rates. Glass claims are classified as no-fault comprehensive events in Arizona — filing one cannot raise your premiums.'
    },
    {
      question: 'Can you service my vehicle at my Ahwatukee Foothills home with views of South Mountain?',
      answer: 'Yes. We provide mobile service throughout Ahwatukee including all hillside and foothills properties, Lakewood, The Foothills community, Club West, and Mountain Park Ranch. We come to your driveway or any safe, level surface on your property. Same-day appointments available throughout Ahwatukee.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Ahwatukee',
    state: 'AZ',
    zipCode: '85044',
    latitude: 33.3300,
    longitude: -112.0000,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Ahwatukee, AZ', url: 'https://pinkautoglass.com/locations/ahwatukee-az' }
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
                <span className="text-xl">Ahwatukee, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Ahwatukee's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="ahwatukee-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Ahwatukee, AZ', href: '/locations/ahwatukee-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Ahwatukee Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  We offer same-day mobile service throughout Ahwatukee Foothills and Club West — right along the I-10 South Mountain corridor — and Arizona law means most drivers pay $0 out of pocket.
                </p>
                <AboveFoldCTA location="location-ahwatukee-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona law means most Ahwatukee drivers pay $0 — zero-deductible coverage is required, your rates can't go up, and you choose the shop.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Ahwatukee Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-10 South Phoenix-Tucson Corridor:</strong> The I-10 through Ahwatukee is the primary route between Phoenix and Tucson.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>South Mountain Park Access Roads:</strong> Ahwatukee borders the 16,000-acre South Mountain Park, the largest municipal park in the US.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Foothills Elevation and Heat:</strong> Ahwatukee's slight elevation along the South Mountain foothills doesn't provide much temperature relief from summer heat exceeding 110°F.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Maricopa Commuter Traffic:</strong> As one of the first Phoenix-proper exits coming north from Maricopa on I-10, Ahwatukee interchanges concentrate heavy commuter traffic from the growing Maricopa community.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Ahwatukee Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your rates.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop — your insurer cannot require Safelite.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ahwatukee Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Ahwatukee Foothills', 'Lakewood', 'The Foothills',
                    'Club West', 'Mountain Park Ranch', 'Warner Ranch',
                    'Kyrene Corridor', 'South Mountain Border', 'Chandler Border'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Ahwatukee</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Fix I-10 chips before Arizona heat expands them. Mobile service to your Ahwatukee home.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full OEM-quality replacement. $0 with ARS 20-264. Mobile service throughout Ahwatukee.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Ahwatukee Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Dan K.', neighborhood: 'Ahwatukee Foothills', text: 'Got chipped by a truck on I-10 on my commute home. Pink Auto Glass came to my house in the Foothills the next morning. My Progressive coverage handled everything — zero out of pocket.' },
                    { name: 'Melissa T.', neighborhood: 'Club West', text: 'Arizona glass law is amazing and I never knew about it. Pink Auto Glass explained everything, came to my Club West home, and replaced my windshield. Free, fast, and professional.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Ahwatukee Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Ahwatukee?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service throughout Ahwatukee. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="ahwatukee-az-cta" />
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
                    <Link href="/locations/tempe-az" className="text-blue-600 hover:underline">Tempe</Link>
                    <Link href="/locations/chandler-az" className="text-blue-600 hover:underline">Chandler</Link>
                    <Link href="/locations/maricopa-az" className="text-blue-600 hover:underline">Maricopa</Link>
                    <Link href="/locations/gilbert-az" className="text-blue-600 hover:underline">Gilbert</Link>
                    <Link href="/locations/mesa-az" className="text-blue-600 hover:underline">Mesa</Link>
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
