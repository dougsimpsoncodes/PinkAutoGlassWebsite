import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Chandler AZ | Auto Glass Repair | $0 Deductible | (480) 712-7465',
  description: 'Windshield replacement & auto glass repair in Chandler AZ. Same-day mobile service to Ocotillo, Fulton Ranch & all Chandler. ARS 20-264 means $0 out of pocket. Call (480) 712-7465!',
  keywords: 'windshield replacement chandler az, windshield repair chandler, auto glass chandler az, zero deductible windshield chandler, ocotillo windshield, mobile auto glass chandler arizona',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/chandler-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Chandler, AZ | Pink Auto Glass',
    description: 'Chandler\'s trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service to Ocotillo, Fulton Ranch, Sun Lakes & all Chandler. ARS 20-264 coverage.',
    url: 'https://pinkautoglass.com/locations/chandler-az',
    type: 'website',
  },
};

export default function ChandlerLocationPage() {
  const faqs = [
    {
      question: 'Does Arizona\'s zero-deductible glass law apply to tech employees in Chandler?',
      answer: 'Yes, absolutely. Arizona\'s ARS 20-264 applies to all Arizona drivers regardless of employer or profession. Intel, Wells Fargo, PayPal, and other major Chandler employers are home to thousands of employees who qualify. If you have comprehensive auto insurance with the glass endorsement, you pay $0 for windshield replacement. We handle all paperwork so you don\'t miss work.'
    },
    {
      question: 'My insurer said I have to use their preferred shop. Is that true?',
      answer: 'No. Under Arizona law ARS 20-469, you have the legal right to choose any auto glass shop. Insurers can recommend preferred shops, but they cannot require you to use them and must inform you of your right to choose. This applies to all Chandler drivers regardless of insurer or policy type.'
    },
    {
      question: 'How quickly can you replace a windshield in Chandler?',
      answer: 'Same-day windshield replacement is available throughout Chandler. We typically schedule within 2-4 hours of your call, and the actual replacement takes 60-90 minutes. We come to your home in Ocotillo, your office near the Intel campus, or anywhere else in Chandler.'
    },
    {
      question: 'Why is the Loop 202 so damaging to windshields in Chandler?',
      answer: 'The Loop 202 (San Tan Freeway) carries significant commercial truck traffic connecting Chandler\'s growing industrial and tech corridor to the broader Phoenix metro. High-speed truck traffic on the 202 and the I-10 connector create constant rock chip exposure. New construction throughout Chandler also contributes to gravel-laden local roads.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Chandler',
    state: 'AZ',
    zipCode: '85224',
    latitude: 33.3062,
    longitude: -111.8413,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Chandler, AZ', url: 'https://pinkautoglass.com/locations/chandler-az' }
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
                <span className="text-xl">Chandler, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Chandler's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="chandler-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Chandler, AZ', href: '/locations/chandler-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Chandler Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Chandler is the Southeast Valley's technology and business hub — home to Intel's massive fabrication facility, Wells Fargo's Chandler campus, PayPal, and dozens of major employers. With rapid residential growth in Ocotillo, Fulton Ranch, and Sun Lakes, Chandler is one of the Phoenix metro's most dynamic and fastest-growing cities. The Loop 202 (San Tan Freeway) and I-10 carry significant commercial traffic through and around Chandler, creating constant windshield chip exposure for commuters and residents.
                </p>
                <AboveFoldCTA location="location-chandler-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona law makes windshield replacement simple and cost-free for most Chandler drivers. ARS 20-264 requires insurers to offer zero-deductible coverage. ARS 20-263 protects your rates. ARS 20-469 gives you the right to choose your shop. We come to your home in Ocotillo, your desk at the Intel campus, or anywhere in Chandler — and handle your entire claim.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Chandler Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Loop 202 San Tan Freeway Traffic:</strong> The 202 connects Chandler's tech corridor to the broader Phoenix metro and carries heavy commercial freight. Daily chip exposure for commuters on the 202 is among the highest in the East Valley.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Intel & Tech Campus Truck Traffic:</strong> Intel's Arizona fab complex and supporting semiconductor supply chain generate constant heavy truck traffic on Chandler roads. Industrial deliveries to the Intel and TSMC campuses add to chip risk near these facilities.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>New Residential Construction:</strong> Chandler's growth means active construction throughout Layton Lakes, Pecos Road corridor, and other developing areas. Construction vehicles — especially concrete mixers and dump trucks — are constant chip sources.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Ocotillo & Sun Lakes Desert Roads:</strong> The Ocotillo and Sun Lakes communities sit near the desert edge where caliche dust and gravel blow onto paved roads. Residents near the Gila River Indian Community border deal with unpaved road debris year-round.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Chandler Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required to be offered with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your Arizona rates.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop. Your insurer cannot require Safelite or any other specific provider.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Chandler Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Downtown Chandler', 'Ocotillo', 'Fulton Ranch',
                    'Sun Lakes', 'Arden Park', 'Dobson Ranch',
                    'Layton Lakes', 'Pecos Road Corridor', 'Cooper Road'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Chandler</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Stop chips before they crack. Fast mobile service throughout Chandler.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full OEM-quality replacement. $0 with ARS 20-264 coverage. Come to your location.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Chandler Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Kevin S.', neighborhood: 'Ocotillo', text: 'Rock chip on the Loop 202 turned into a crack in the summer heat. Pink Auto Glass came to my home in Ocotillo the next morning. Zero cost, they handled my State Farm claim entirely.' },
                    { name: 'Maria G.', neighborhood: 'Fulton Ranch', text: 'Pink Auto Glass came to the Intel campus parking lot during my shift. By the time I finished work, my windshield was replaced and my insurance claim was filed. Couldn\'t have been easier.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Chandler Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Chandler?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Chandler. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="chandler-az-cta" />
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
                    <Link href="/locations/gilbert-az" className="text-blue-600 hover:underline">Gilbert</Link>
                    <Link href="/locations/tempe-az" className="text-blue-600 hover:underline">Tempe</Link>
                    <Link href="/locations/queen-creek-az" className="text-blue-600 hover:underline">Queen Creek</Link>
                    <Link href="/locations/phoenix-az" className="text-blue-600 hover:underline">Phoenix</Link>
                    <Link href="/locations/ahwatukee-az" className="text-blue-600 hover:underline">Ahwatukee</Link>
                  </div>
                </div>

                <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106823.4!2d-111.8413!3d33.3062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872ba4b8ea0b97a7%3A0x8c4c47ab3e3a8e01!2sChandler%2C%20AZ!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Chandler, AZ Map"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
