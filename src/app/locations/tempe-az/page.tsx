import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Tempe AZ | Auto Glass Repair | $0 Deductible | (720) 918-7465',
  description: 'Windshield replacement & auto glass repair in Tempe AZ. Same-day mobile service near ASU, Mill Avenue & all Tempe. Arizona ARS 20-264 means $0 out of pocket. Call (720) 918-7465!',
  keywords: 'windshield replacement tempe az, windshield repair tempe, auto glass tempe az, zero deductible windshield tempe, asu area windshield, mobile auto glass tempe arizona',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/tempe-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Tempe, AZ | Pink Auto Glass',
    description: 'Tempe\'s trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service near ASU, Mill Avenue & all Tempe neighborhoods. ARS 20-264 coverage.',
    url: 'https://pinkautoglass.com/locations/tempe-az',
    type: 'website',
  },
};

export default function TempeLocationPage() {
  const faqs = [
    {
      question: 'Do you serve the ASU campus area and student neighborhoods in Tempe?',
      answer: 'Yes. We serve all of Tempe including the ASU campus area, Mill Avenue corridor, and student neighborhoods. Mobile service means we come to your apartment, dorm parking lot, or anywhere in Tempe. Arizona\'s zero-deductible law under ARS 20-264 applies to all Tempe residents with comprehensive coverage regardless of age or student status.'
    },
    {
      question: 'Will my insurance rates go up if I file a glass claim in Tempe?',
      answer: 'No. Arizona law (ARS 20-263) classifies glass claims as no-fault events. Filing a windshield claim in Tempe cannot legally raise your insurance rates. This applies to all Arizona drivers including students with their own or family policies.'
    },
    {
      question: 'Why do Tempe drivers get so many rock chips?',
      answer: 'The I-10/US-60 interchange in Tempe is one of the busiest freeway junctions in Arizona. Constant construction debris from light rail expansion and ongoing infrastructure projects adds to the chip risk. The interchange sees thousands of trucks daily, and at freeway speeds, even a small pebble can crack a windshield.'
    },
    {
      question: 'Does my insurance cover all types of glass — not just the windshield?',
      answer: 'Yes. Arizona law under ARS 20-264 covers ALL vehicle glass, not just the windshield. Door windows, rear glass, vent windows, and quarter glass are all covered under zero-deductible glass endorsements. Same $0 out of pocket for any glass in your vehicle.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Tempe',
    state: 'AZ',
    zipCode: '85281',
    latitude: 33.4255,
    longitude: -111.9400,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Tempe, AZ', url: 'https://pinkautoglass.com/locations/tempe-az' }
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
                <span className="text-xl">Tempe, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Tempe's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="tempe-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Tempe, AZ', href: '/locations/tempe-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Tempe Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Tempe sits at the geographic center of the Phoenix metro — and at the center of some of Arizona's most windshield-damaging road conditions. Home to Arizona State University's main campus, Mill Avenue's vibrant district, and the massive I-10/US-60 interchange, Tempe sees enormous daily traffic volumes. Light rail construction and ongoing infrastructure projects add construction debris to the mix. Tempe is compact but busy — perfect for mobile windshield service that comes to you.
                </p>
                <AboveFoldCTA location="location-tempe-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Whether you're a student, faculty, or longtime Tempe resident, Arizona's glass laws protect you. ARS 20-264 means $0 out of pocket with comprehensive coverage. ARS 20-263 means no rate increase. ARS 20-469 means you choose your shop — not whoever your insurer recommends. We come to you, handle your insurance, and get you back on the road fast.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Tempe Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-10/US-60 Interchange:</strong> This massive interchange is one of the highest-traffic road junctions in Arizona. Thousands of commercial trucks pass through daily, and at freeway speeds, road debris hits with tremendous force. Rock chips here often cause chips that require immediate repair.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Light Rail Construction Debris:</strong> Ongoing expansion of Valley Metro light rail brings construction vehicles, gravel trucks, and road work to Tempe streets regularly. Construction zones create concentrated debris hazards for passing vehicles.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>ASU Commuter Congestion:</strong> Tempe's 75,000+ ASU student and faculty population means stop-and-go traffic near campus that increases exposure to rock chips from other vehicles. Tempe Marketplace and nearby commercial areas also create traffic congestion.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Monsoon Season Flash Flooding:</strong> Tempe's flat terrain makes it susceptible to monsoon-season flooding and the associated flying debris. Haboobs moving through the Phoenix metro frequently originate from the south and east, hitting Tempe first.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Extreme Summer Heat:</strong> Tempe's urban density and large commercial parking areas create heat islands. Vehicles left in parking lots at Tempe Marketplace or near Mill Avenue in summer can experience glass temperatures that accelerate chip expansion.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Tempe Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage required to be offered with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your rates in Arizona.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop. Your insurer can recommend but cannot require.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Tempe Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Downtown Tempe', 'ASU Campus Area', 'Tempe Marketplace',
                    'South Tempe', 'Kyrene', 'McClintock',
                    'Rio Salado', 'Optimist Park', 'Warner Ranch'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Tempe</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Chip repair before Tempe heat turns it into a full crack. Fast mobile service.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full OEM-quality replacement. $0 with ARS 20-264 coverage. ADAS calibration available.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Tempe Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Marcus L.', neighborhood: 'ASU Area', text: 'Got a rock chip on the I-10 interchange. Pink Auto Glass came to my apartment parking lot near campus. Zero hassle, zero cost. They handled my Geico claim start to finish.' },
                    { name: 'Stephanie H.', neighborhood: 'South Tempe', text: 'A chip from a construction truck near the light rail site cracked all the way across in the summer heat. Pink Auto Glass replaced it at my office in South Tempe the next day. $0 out of pocket.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Tempe Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Tempe?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Tempe. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="tempe-az-cta" />
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
                    <Link href="/locations/scottsdale-az" className="text-blue-600 hover:underline">Scottsdale</Link>
                    <Link href="/locations/mesa-az" className="text-blue-600 hover:underline">Mesa</Link>
                    <Link href="/locations/chandler-az" className="text-blue-600 hover:underline">Chandler</Link>
                    <Link href="/locations/gilbert-az" className="text-blue-600 hover:underline">Gilbert</Link>
                    <Link href="/locations/ahwatukee-az" className="text-blue-600 hover:underline">Ahwatukee</Link>
                  </div>
                </div>

                <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d53268.4!2d-111.9400!3d33.4255!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872b0d8b7e4e4a67%3A0x7c6e57f9d1a2b3c4!2sTempe%2C%20AZ!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Tempe, AZ Map"
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
