import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Gilbert AZ | Auto Glass Repair | $0 Deductible | (480) 712-7465',
  description: 'Windshield replacement & auto glass repair in Gilbert AZ. Same-day mobile service to Heritage District, Power Ranch & all Gilbert. ARS 20-264 means $0 out of pocket. Call (480) 712-7465!',
  keywords: 'windshield replacement gilbert az, windshield repair gilbert, auto glass gilbert az, zero deductible windshield gilbert, power ranch windshield, mobile auto glass gilbert arizona',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/gilbert-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Gilbert, AZ | Pink Auto Glass',
    description: 'Gilbert\'s trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service to Heritage District, Power Ranch, Agritopia & all Gilbert. ARS 20-264.',
    url: 'https://pinkautoglass.com/locations/gilbert-az',
    type: 'website',
  },
};

export default function GilbertLocationPage() {
  const faqs = [
    {
      question: 'Does Arizona\'s $0 deductible glass law apply to Gilbert\'s newer developments?',
      answer: 'Yes. Arizona\'s ARS 20-264 applies to all Arizona drivers with comprehensive coverage, regardless of where in the state you live. Residents in new Gilbert developments like Morrison Ranch, Lyons Gate, and the Heritage District all qualify. If you have comprehensive insurance with the glass endorsement, your windshield replacement is $0 out of pocket.'
    },
    {
      question: 'Will my insurance rates go up if I use my glass coverage in Gilbert?',
      answer: 'No. Under ARS 20-263, Arizona law specifically protects you from rate increases for glass claims. It\'s a no-fault coverage type — using it legally cannot raise your premiums. Gilbert is one of the fastest-growing cities in the country, and many newer residents don\'t realize this protection exists.'
    },
    {
      question: 'Why do Gilbert residents get so many windshield chips from construction?',
      answer: 'Gilbert has been one of the fastest-growing cities in the entire United States for over a decade. New home construction, road expansions, and commercial development mean constant construction vehicle traffic throughout the city. Gravel trucks, concrete mixers, and dump trucks dropping debris on partially-paved roads are the primary source of windshield damage in newer Gilbert communities.'
    },
    {
      question: 'What is the US-60 and Loop 202 chip risk near Gilbert?',
      answer: 'Gilbert sits at the convergence of the US-60 (Superstition Freeway) and the Loop 202 (San Tan Freeway) — two of the East Valley\'s busiest commercial routes. High-speed truck traffic on both highways creates significant rock chip exposure, especially for residents who commute through these interchanges daily.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Gilbert',
    state: 'AZ',
    zipCode: '85233',
    latitude: 33.3528,
    longitude: -111.7890,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Gilbert, AZ', url: 'https://pinkautoglass.com/locations/gilbert-az' }
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
                <span className="text-xl">Gilbert, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Gilbert's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="gilbert-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Gilbert, AZ', href: '/locations/gilbert-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Gilbert Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  We bring $0 mobile windshield service to Gilbert — from the Heritage District to Power Ranch, Agritopia, and Morrison Ranch.
                </p>
                <AboveFoldCTA location="location-gilbert-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona law means most Gilbert drivers pay $0 — zero-deductible coverage is required, your rates can't go up, and you choose the shop.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Gilbert Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Constant New Construction:</strong> Gilbert adds thousands of new homes and commercial buildings each year.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>US-60/Loop 202 Convergence:</strong> The northern edge of Gilbert sees heavy freeway traffic from both the Superstition Freeway and San Tan Freeway.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Agricultural Legacy Roads:</strong> Gilbert's farming heritage means many local roads were built for farm equipment and have loose shoulders that push gravel onto pavement.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Summer Heat Chip Expansion:</strong> Like all of Phoenix metro, Gilbert's summer temperatures exceed 110°F regularly.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Gilbert Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required to be offered with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your Arizona insurance rates.</li>
                    <li><strong>ARS 20-469:</strong> You choose your shop. Insurers cannot require Safelite or any specific provider.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Gilbert Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Heritage District', 'Agritopia', 'Power Ranch',
                    'Val Vista Lakes', 'Lyons Gate', 'Morrison Ranch',
                    'Finley Farms', 'Shamrock Estates', 'Spectrum'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Gilbert</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Fix construction chips before Arizona heat cracks them. Fast mobile service.</p>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Gilbert Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Jason W.', neighborhood: 'Power Ranch', text: 'A gravel truck near the new construction in Power Ranch left me with a big chip. Pink Auto Glass came out the same day. Zero cost, they handled my Allstate claim. Excellent service.' },
                    { name: 'Nicole F.', neighborhood: 'Heritage District', text: 'I had no idea Arizona\'s zero-deductible glass law existed until I called Pink Auto Glass. They explained everything, came to my home, and replaced my windshield for free. Should have done this years ago.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Gilbert Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Gilbert?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Gilbert. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="gilbert-az-cta" />
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
                    <Link href="/locations/mesa-az" className="text-blue-600 hover:underline">Mesa</Link>
                    <Link href="/locations/queen-creek-az" className="text-blue-600 hover:underline">Queen Creek</Link>
                    <Link href="/locations/tempe-az" className="text-blue-600 hover:underline">Tempe</Link>
                    <Link href="/locations/scottsdale-az" className="text-blue-600 hover:underline">Scottsdale</Link>
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
