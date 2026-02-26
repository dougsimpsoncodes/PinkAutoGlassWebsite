import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Phoenix AZ | Auto Glass Repair | $0 Deductible | (480) 712-7465',
  description: 'Windshield replacement & auto glass repair in Phoenix AZ. Same-day mobile service. Arizona law (ARS 20-264) means $0 out of pocket with comprehensive coverage. We handle all paperwork. Call (480) 712-7465!',
  keywords: 'windshield replacement phoenix az, windshield repair phoenix, auto glass phoenix az, zero deductible windshield phoenix, ARS 20-264 arizona, mobile windshield phoenix',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/phoenix-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Phoenix, AZ | Pink Auto Glass',
    description: 'Phoenix\'s trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service to all neighborhoods, same-day appointments. ARS 20-264 zero-deductible coverage.',
    url: 'https://pinkautoglass.com/locations/phoenix-az',
    type: 'website',
  },
};

export default function PhoenixLocationPage() {
  const faqs = [
    {
      question: 'Does Arizona law really require $0 deductible windshield replacement in Phoenix?',
      answer: 'Yes. Under ARS 20-264, Arizona law requires insurance companies to offer zero-deductible glass coverage as part of any comprehensive auto policy. If you have comprehensive coverage and selected the glass endorsement (which typically costs just $5–$15/month extra), your windshield replacement in Phoenix costs you nothing out of pocket. We verify your coverage before we start any work.'
    },
    {
      question: 'Will filing a glass claim raise my insurance rates in Phoenix?',
      answer: 'No. Under ARS 20-263, filing an auto glass claim in Arizona is a no-fault event. Arizona law legally prohibits insurers from raising your rates solely because you filed a glass claim. You\'ve been paying for this coverage — using it is your right.'
    },
    {
      question: 'Do I have to use Safelite or my insurance\'s recommended shop in Phoenix?',
      answer: 'Absolutely not. Under ARS 20-469, Arizona law gives you the legal right to choose any auto glass shop you want. Your insurer can suggest Safelite or another shop, but they cannot require you to use it and must tell you that you have the right to choose any shop. Choose Pink Auto Glass — we handle 100% of the paperwork.'
    },
    {
      question: 'Why is summer heat such a big problem for Phoenix windshields?',
      answer: 'Phoenix summer temperatures regularly exceed 115°F, which causes thermal expansion in auto glass. A small chip or crack that might stay stable in a cooler climate can spread rapidly in Phoenix heat — sometimes cracking all the way across the windshield overnight. If you have a chip, get it repaired immediately before summer heat turns a $0 repair into a full replacement.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85001',
    latitude: 33.4484,
    longitude: -112.0740,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Phoenix, AZ', url: 'https://pinkautoglass.com/locations/phoenix-az' }
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
                <span className="text-xl">Phoenix, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Phoenix's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="phoenix-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Phoenix, AZ', href: '/locations/phoenix-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Phoenix Drivers Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  We offer same-day mobile service anywhere in Phoenix — from Arcadia to Laveen to the I-10/I-17 corridor — and Arizona law means most drivers pay $0 out of pocket.
                </p>
                <AboveFoldCTA location="location-phoenix-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona law means most Phoenix drivers pay $0 — zero-deductible coverage is required, your rates can't go up, and you choose the shop.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Phoenix Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Extreme Summer Heat (115°F+):</strong> Thermal expansion causes existing chips to spread rapidly.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-10 & I-17 Truck Traffic:</strong> The I-10/I-17 corridor through Phoenix carries constant commercial freight to and from California, Texas, and northern Arizona.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Monsoon Season (July–September):</strong> Arizona's monsoon season brings sudden haboobs, flying debris, hail, and dramatic temperature drops.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Sky Harbor Airport Corridor:</strong> Heavy airport-related traffic on the I-10 and SR-143 creates constant rock chip exposure.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Caliche Dust & Desert Sand:</strong> Phoenix's desert environment means caliche dust and sand act as constant abrasives on glass surfaces.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>West Valley Construction:</strong> Rapid growth in Laveen, Deer Valley, and North Phoenix means constant construction vehicle traffic on local roads.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Phoenix Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li className="flex items-start">
                      <span className="font-bold mr-2">ARS 20-264:</span>
                      <span>Requires insurers to offer zero-deductible glass coverage as an option with comprehensive policies. This is the law that makes $0 windshield replacement possible.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">ARS 20-263:</span>
                      <span>No-fault rate protection. Filing a glass claim in Arizona legally cannot raise your insurance rates.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">ARS 20-469:</span>
                      <span>Right to choose your shop. Insurers can recommend Safelite but cannot require it — and must tell you that you have the right to choose any shop you want.</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Phoenix Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Downtown Phoenix', 'Arcadia', 'Ahwatukee',
                    'Biltmore', 'Desert Ridge', 'Camelback East',
                    'South Mountain', 'Laveen', 'Maryvale',
                    'Deer Valley', 'Moon Valley', 'Sunnyslope',
                    'Central Phoenix', 'North Phoenix', 'Tempe Border'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Phoenix</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Fix chips before Phoenix heat turns them into full cracks. Fast, $0 with coverage.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full replacement with OEM-quality glass. $0 out of pocket with ARS 20-264 coverage.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Phoenix Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Carlos R.', neighborhood: 'Arcadia', text: 'I had a huge crack from a rock on the I-10. Called Pink Auto Glass and they came to my office in Arcadia the same afternoon. Zero out of pocket with my insurance — they handled everything. Took less than 90 minutes.' },
                    { name: 'Diane K.', neighborhood: 'Desert Ridge', text: 'My insurance recommended Safelite but I looked up ARS 20-469 and found out I could choose my own shop. Went with Pink Auto Glass — great decision. Professional, fast, and my rates didn\'t go up.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Phoenix Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Phoenix?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Phoenix. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="phoenix-az-cta" />
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
                    <Link href="/locations/scottsdale-az" className="text-blue-600 hover:underline">Scottsdale</Link>
                    <Link href="/locations/tempe-az" className="text-blue-600 hover:underline">Tempe</Link>
                    <Link href="/locations/mesa-az" className="text-blue-600 hover:underline">Mesa</Link>
                    <Link href="/locations/chandler-az" className="text-blue-600 hover:underline">Chandler</Link>
                    <Link href="/locations/glendale-az" className="text-blue-600 hover:underline">Glendale</Link>
                    <Link href="/locations/peoria-az" className="text-blue-600 hover:underline">Peoria</Link>
                  </div>
                </div>

                <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d212950.55!2d-112.0740!3d33.4484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872b12ed50a179cb%3A0x8c69c7f8354a1bac!2sPhoenix%2C%20AZ!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Phoenix, AZ Map"
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
