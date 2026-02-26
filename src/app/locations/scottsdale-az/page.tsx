import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Scottsdale AZ | Auto Glass Repair | $0 Deductible | (480) 712-7465',
  description: 'Windshield replacement & auto glass repair in Scottsdale AZ. Same-day mobile service to Old Town, North Scottsdale & all areas. Arizona ARS 20-264 means $0 out of pocket. Call (480) 712-7465!',
  keywords: 'windshield replacement scottsdale az, windshield repair scottsdale, auto glass scottsdale, zero deductible windshield scottsdale az, north scottsdale windshield repair, mobile auto glass scottsdale',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/scottsdale-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Scottsdale, AZ | Pink Auto Glass',
    description: 'Scottsdale\'s trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service to Old Town, North Scottsdale, DC Ranch & more. ARS 20-264 zero-deductible.',
    url: 'https://pinkautoglass.com/locations/scottsdale-az',
    type: 'website',
  },
};

export default function ScottsdaleLocationPage() {
  const faqs = [
    {
      question: 'Do you service luxury vehicles like BMW, Mercedes, and Tesla in Scottsdale?',
      answer: 'Yes. Scottsdale has one of the highest concentrations of luxury and European vehicles in Arizona, and we service them all. We use OEM-quality glass and certified technicians for every vehicle. For Tesla and other vehicles with ADAS cameras mounted to the windshield, we perform proper recalibration after replacement.'
    },
    {
      question: 'Does Arizona law protect me from rate increases when I file a glass claim?',
      answer: 'Yes. Under ARS 20-263, Arizona law provides no-fault rate protection for glass claims. Filing a windshield claim cannot legally raise your insurance rates. You\'ve been paying for this coverage — there\'s no reason not to use it.'
    },
    {
      question: 'Can my insurance require me to use a specific shop in Scottsdale?',
      answer: 'No. Under ARS 20-469, Arizona law gives you the right to choose any auto glass repair shop. Your insurer may recommend Safelite or another preferred shop, but they cannot require you to use it and must inform you of your right to choose. We handle all paperwork regardless of your insurer.'
    },
    {
      question: 'What makes windshield damage so common in North Scottsdale?',
      answer: 'North Scottsdale\'s proximity to the McDowell Sonoran Preserve, Troon, and Pinnacle Peak means caliche dust and desert gravel are constant issues. Loop 101 carries heavy traffic including construction trucks serving the rapidly expanding DC Ranch and Grayhawk areas. Desert driving at 75mph means any loose rock becomes a projectile.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Scottsdale',
    state: 'AZ',
    zipCode: '85251',
    latitude: 33.4942,
    longitude: -111.9261,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Scottsdale, AZ', url: 'https://pinkautoglass.com/locations/scottsdale-az' }
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
                <span className="text-xl">Scottsdale, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Scottsdale's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="scottsdale-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Scottsdale, AZ', href: '/locations/scottsdale-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Scottsdale Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  We bring $0 mobile windshield service directly to Scottsdale — from Old Town to DC Ranch and Troon.
                </p>
                <AboveFoldCTA location="location-scottsdale-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona law means most Scottsdale drivers pay $0 — zero-deductible coverage is required, your rates can't go up, and you choose the shop.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Scottsdale Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Loop 101 High-Speed Traffic:</strong> The Pima Freeway (Loop 101) through Scottsdale carries constant truck traffic between Phoenix and the East Valley.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>McDowell Sonoran Preserve Roads:</strong> Access roads to the preserve and surrounding desert communities kick up caliche dust and loose gravel constantly.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Luxury Vehicle ADAS Systems:</strong> Modern luxury vehicles (BMW, Mercedes, Tesla, Audi) have ADAS cameras and sensors mounted to the windshield.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Summer Thermal Stress:</strong> Scottsdale's intense sun reflects off resort and commercial glass, creating localized heat zones that accelerate chip expansion.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>DC Ranch & Grayhawk Construction:</strong> Active development in DC Ranch, Grayhawk, and the broader North Scottsdale corridor means construction vehicles on local streets year-round.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Scottsdale Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required to be offered by all insurers with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — your rates cannot increase from a glass claim.</li>
                    <li><strong>ARS 20-469:</strong> Your legal right to choose any shop. Not Safelite. Any shop. Including us.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Scottsdale Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Old Town', 'North Scottsdale', 'South Scottsdale',
                    'McCormick Ranch', 'DC Ranch', 'Gainey Ranch',
                    'Paradise Valley Border', 'Kierland', 'Grayhawk',
                    'McDowell Mountain', 'Troon', 'Pinnacle Peak'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Scottsdale</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Chip repair before Scottsdale heat turns it into a crack. Fast, $0 with coverage.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full replacement with OEM-quality glass. ADAS calibration included for equipped vehicles.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Scottsdale Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Jennifer M.', neighborhood: 'DC Ranch', text: 'Got a rock chip on the 101. Called Pink Auto Glass and they came to my home in DC Ranch the next morning. $0 out of pocket, insurance handled everything. My Tesla\'s ADAS was recalibrated perfectly.' },
                    { name: 'Robert T.', neighborhood: 'Kierland', text: 'My BMW had a crack from a chip I ignored too long in the summer heat. Pink Auto Glass replaced it at my office in Kierland. They dealt with my insurance — I just signed and drove away.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Scottsdale Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Scottsdale?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Scottsdale. $0 with Arizona coverage.</p>
                <CTAButtons source="scottsdale-az-cta" />
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
                    <Link href="/locations/mesa-az" className="text-blue-600 hover:underline">Mesa</Link>
                    <Link href="/locations/chandler-az" className="text-blue-600 hover:underline">Chandler</Link>
                    <Link href="/locations/gilbert-az" className="text-blue-600 hover:underline">Gilbert</Link>
                    <Link href="/locations/fountain-hills-az" className="text-blue-600 hover:underline">Fountain Hills</Link>
                  </div>
                </div>

                <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106508.4!2d-111.9261!3d33.4942!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872b08f5c6b1025b%3A0x2e8f3bc67e0a73c1!2sScottsdale%2C%20AZ!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Scottsdale, AZ Map"
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
