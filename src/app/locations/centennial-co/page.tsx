import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Star } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Centennial CO | Mobile, $0 Deductible',
  description: 'Mobile windshield replacement & repair in Centennial CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair centennial, windshield replacement centennial, auto glass centennial co, mobile windshield service centennial, southglenn windshield repair, dry creek auto glass, windshield replacement near me centennial',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/centennial-co',
  },
  openGraph: {
    title: 'Windshield Replacement Centennial CO | Mobile, $0 Deductible',
    description: 'Mobile windshield replacement & repair in Centennial CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/centennial-co',
    type: 'website',
  },
};

export default function CentennialLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Centennial?',
      answer: 'Yes! Mobile service is our specialty in Centennial. We come to your home, office, or anywhere in Centennial. Our fully equipped mobile units serve all Centennial neighborhoods including Southglenn, Walnut Hills, Dry Creek, and Piney Creek.'
    },
    {
      question: 'How quickly can you replace a windshield in Centennial?',
      answer: 'We offer same-day windshield replacement throughout Centennial. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving. We work around your schedule.'
    },
    {
      question: 'What Centennial neighborhoods do you serve?',
      answer: 'We serve all of Centennial including: Southglenn, Centennial Airport, Walnut Hills, Dry Creek, Piney Creek, Heritage Greens, Smoky Hill, and all other Centennial neighborhoods. If you\'re anywhere in Centennial city limits, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Centennial?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Centennial residents. We can verify your coverage and bill your insurance directly.'
    },
    {
      question: 'If my vehicle is parked at my office in the Denver Tech Center (DTC) in Centennial, can Pink Auto Glass provide mobile service there?',
      answer: 'Yes, the Denver Tech Center is a prime service area for Pink Auto Glass! Many of our Centennial customers choose to have their windshield repaired or replaced right at their DTC office during work hours, making the process incredibly convenient and hassle-free.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Centennial',
    state: 'CO',
    zipCode: '80112',
    latitude: 39.5807,
    longitude: -104.8772,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Centennial, CO', url: 'https://pinkautoglass.com/locations/centennial-co' }
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
                <span className="text-xl">Centennial, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Centennial's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                As one of the newer, primarily residential cities in the Denver metro area, Centennial drivers often navigate busy thoroughfares like C-470 and I-25, or commute to the Denver Tech Center (DTC). The constant flow of traffic, combined with ongoing suburban development, makes your windshield vulnerable to the common Colorado culprits of chips and cracks.
              </p>
              <CTAButtons source="centennial-co-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Centennial, CO', href: '/locations/centennial-co' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Centennial Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  With over 108,000 residents, Centennial is one of Colorado's most desirable suburbs. From Southglenn to Dry Creek, Walnut Hills to Piney Creek, Pink Auto Glass provides fast, professional windshield repair and replacement throughout Centennial. We bring our mobile service directly to you - whether you're at home, at your office park, or shopping at the Streets at SouthGlenn.
                </p>
                <AboveFoldCTA location="location-centennial-co" />

              {/* Windshield Damage in Centennial */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Centennial
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Heavy commuter traffic on I-25 and C-470, notorious for kicked-up road debris and rocks.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Ongoing residential and commercial construction in this rapidly growing suburb.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Winter road treatments (sand/gravel) contributing to windshield damage after snowstorms.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Vulnerable to springtime hailstorms, a frequent occurrence in the South Metro area.</span>
                  </li>
                </ul>
              </section>
                <p className="text-lg text-gray-700 mb-4">
                  Whether you're commuting on I-25, E-470, or Arapahoe Road, our fully equipped mobile units serve all Centennial neighborhoods. We understand the unique challenges Centennial drivers face and provide expert windshield care tailored to your needs.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Centennial's Unique Windshield Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-25 Corridor:</strong> Major north-south highway with heavy commuter traffic increases rock chip risks from construction and commercial vehicles</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>E-470 Toll Road:</strong> High-speed traffic and gravel trucks create frequent windshield damage for Centennial commuters</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Arapahoe Road Traffic:</strong> Busy east-west corridor with constant construction and development bringing road debris</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Suburban Growth:</strong> Ongoing development and construction in new neighborhoods means increased exposure to construction debris</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Colorado Weather:</strong> Temperature extremes cause windshield chips to crack quickly, especially during seasonal transitions</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  We know Centennial. Our technicians understand the specific challenges Centennial drivers face on I-25, E-470, and Arapahoe Road. Don't let a small chip turn into a full windshield replacement - we offer same-day mobile service throughout all Centennial neighborhoods.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Centennial Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Southglenn</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Centennial Airport</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Walnut Hills</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Dry Creek</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Piney Creek</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Cherry Knolls</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Willow Creek</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Greenwood Village</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Smoky Hill</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Willow Spring</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Heritage Place</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Orchard</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">South Suburban</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Arapahoe Road</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Peakview</span>
                    </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Centennial</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Professional Service</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Professional Service</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              {/* Local Tips & FAQs */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Centennial Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">DTC office parks and I‑25/E‑470 commutes mean curbside convenience is key. We provide mobile service across Centennial with OEM‑quality glass.</p>
                <div className="space-y-4 text-gray-700 mb-6">
                  <div>
                    <h3 className="font-semibold">Can you service DTC offices?</h3>
                    <p>Yes—book a window that fits your schedule; we’ll coordinate a safe spot on‑site.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Do you include ADAS calibration?</h3>
                    <p>Where required by the vehicle, calibration is included and results are documented.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Centennial Customers</h2>
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

              {/* Nearby Cities */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  We Also Serve Nearby
                </h2>
                <div className="flex flex-wrap gap-4">
                  <Link href="/locations/highlands-ranch-co" className="text-pink-600 hover:underline font-medium">Highlands Ranch</Link>
                  <Link href="/locations/littleton-co" className="text-pink-600 hover:underline font-medium">Littleton</Link>
                  <Link href="/locations/lone-tree-co" className="text-pink-600 hover:underline font-medium">Lone Tree</Link>
                  <Link href="/locations/parker-co" className="text-pink-600 hover:underline font-medium">Parker</Link>
                  <Link href="/locations/greenwood-village-co" className="text-pink-600 hover:underline font-medium">Greenwood Village</Link>
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Centennial?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Centennial. Call now for a free quote.</p>
                <CTAButtons source="centennial-co-cta" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Vehicles</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/vehicles/subaru-outback-windshield-replacement-denver" className="text-pink-600 hover:underline flex justify-between"><span>Subaru Outback</span></Link></li>
                    <li><Link href="/vehicles/honda-cr-v-windshield-replacement-denver" className="text-pink-600 hover:underline flex justify-between"><span>Honda CR-V</span></Link></li>
                  </ul>
                  <Link href="/services/windshield-replacement" className="block mt-4 text-blue-600 hover:underline font-semibold">View All Services →</Link>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Nearby Cities</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Link href="/locations/aurora-co" className="text-blue-600 hover:underline">Aurora</Link>
                    <Link href="/locations/parker-co" className="text-blue-600 hover:underline">Parker</Link>
                    <Link href="/locations/highlands-ranch-co" className="text-blue-600 hover:underline">Highlands Ranch</Link>
                    <Link href="/locations/denver-co" className="text-blue-600 hover:underline">Denver</Link>
                  </div>
                </div>

                <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d196473!2d-104.8772!3d39.5807!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Centennial, CO Map"
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
