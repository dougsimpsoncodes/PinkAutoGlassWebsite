import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Star } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Westminster CO | $0 Deductible',
  description: 'Mobile windshield replacement & repair in Westminster CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair westminster, windshield replacement westminster, auto glass westminster co, mobile windshield service westminster, windshield replacement near me westminster, legacy ridge windshield repair, westminster station auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/westminster-co',
  },
  openGraph: {
    title: 'Windshield Replacement Westminster CO | $0 Deductible',
    description: 'Mobile windshield replacement & repair in Westminster CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/westminster-co',
    type: 'website',
  },
};

export default function WestminsterLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Westminster?',
      answer: 'Yes! Mobile service is our specialty in Westminster. We come to your home, office, or anywhere in Westminster. Whether you\'re at The Orchard, Westminster Station, Legacy Ridge, or anywhere else in Westminster, we\'ll come to you with our fully equipped mobile units.'
    },
    {
      question: 'How quickly can you replace a windshield in Westminster?',
      answer: 'We offer same-day windshield replacement throughout Westminster. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving. We understand Westminster residents are busy, so we work around your schedule.'
    },
    {
      question: 'What Westminster neighborhoods do you serve?',
      answer: 'We serve all of Westminster including: The Orchard, Westminster Station, Legacy Ridge, Standley Lake, Country Club Hills, McKay Lake, and all other Westminster neighborhoods. If you\'re anywhere in Westminster, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Westminster?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Westminster residents. We can verify your coverage and bill your insurance directly.'
    },
    {
      question: 'Does Pink Auto Glass offer same-day service for residents near the Westminster Promenade?',
      answer: 'We strive to offer prompt and often same-day service for windshield replacements and repairs across Westminster. Give us a call, and we\'ll do our best to get you back on the road quickly, even if you\'re out shopping.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Westminster',
    state: 'CO',
    zipCode: '80031',
    latitude: 39.8367,
    longitude: -105.0372,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Westminster, CO', url: 'https://pinkautoglass.com/locations/westminster-co' }
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
                <span className="text-xl">Westminster, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Westminster's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Navigating Westminster\'s major corridors like US-36 and I-25, alongside its growing commercial and residential areas, exposes your vehicle to various road hazards. The combination of high traffic volume and unpredictable Colorado weather makes windshield damage a frequent concern for residents.
              </p>
              <CTAButtons source="westminster-co-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Westminster, CO', href: '/locations/westminster-co' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Westminster Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Westminster's strategic location needs reliable auto glass service. With over 116,000 residents positioned between Denver and Boulder, Westminster's unique commuter patterns and major shopping centers create specific windshield challenges. From The Orchard to Westminster Station to Legacy Ridge, Pink Auto Glass provides fast, professional windshield repair and replacement throughout Westminster.
                </p>
                <AboveFoldCTA location="location-westminster-co" />

              {/* Windshield Damage in Westminster */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Westminster
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Debris from heavy commuter traffic on US-36 and I-25.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Sudden and intense hailstorms, especially in late spring.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Construction site materials from new developments.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Rocks thrown by landscaping vehicles in suburban neighborhoods.</span>
                  </li>
                </ul>
              </section>
                <p className="text-lg text-gray-700 mb-4">
                  Whether you're commuting on US-36, traveling along I-25, navigating Sheridan Boulevard, or shopping at major centers, we come to you. Our fully equipped mobile units handle everything on-site - at your home, office, or anywhere in Westminster.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Westminster's Unique Windshield Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>US-36 Corridor:</strong> High-speed highway between Denver and Boulder brings heavy commuter traffic and increased rock chip risks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-25 Traffic:</strong> Major north-south interstate creates constant exposure to commercial trucks and highway debris</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Sheridan Boulevard:</strong> Heavy commercial corridor with delivery and construction vehicles increases debris hazards</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Major Shopping Centers:</strong> High traffic volume at The Orchard and Westminster Promenade means more parking lot damage risks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Mid-Metro Weather:</strong> Location between Denver and mountains means temperature extremes that cause chips to spread quickly</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  We know Westminster. Our technicians understand the specific challenges Westminster drivers face and provide expert windshield replacement and repair services tailored to your needs. Don't let a small chip from US-36 debris turn into a full windshield replacement - we offer same-day mobile service throughout all Westminster neighborhoods.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Westminster Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Legacy Ridge</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Westminster Station</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Standley Lake</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Country Club Hills</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">McKay Lake</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">South Westminster</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Hyland Hills</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">City Center</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Hidden Lake</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Amherst</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Federal Heights</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Sheridan Green</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Westminster Promenade</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Westglenn</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Brookhill</span>
                    </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Westminster</h2>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Westminster Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">Commuters along US‑36 often see highway chip damage. We provide mobile repair and OEM replacements across Westminster neighborhoods.</p>
                <div className="space-y-4 text-gray-700 mb-6">
                  <div>
                    <h3 className="font-semibold">Is workplace service available?</h3>
                    <p>Yes—we can complete service while you work. We just need a safe, level spot.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Do you include calibration?</h3>
                    <p>Where required by the vehicle (common on 2018+), calibration is included and documented.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Westminster Customers</h2>
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
                  <Link href="/locations/broomfield-co" className="text-pink-600 hover:underline font-medium">Broomfield</Link>
                  <Link href="/locations/thornton-co" className="text-pink-600 hover:underline font-medium">Thornton</Link>
                  <Link href="/locations/northglenn-co" className="text-pink-600 hover:underline font-medium">Northglenn</Link>
                  <Link href="/locations/arvada-co" className="text-pink-600 hover:underline font-medium">Arvada</Link>
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Westminster?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Westminster. Call now for a free quote.</p>
                <CTAButtons source="westminster-co-cta" />
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
                    <Link href="/locations/thornton-co" className="text-blue-600 hover:underline">Thornton</Link>
                    <Link href="/locations/arvada-co" className="text-blue-600 hover:underline">Arvada</Link>
                    <Link href="/locations/boulder-co" className="text-blue-600 hover:underline">Boulder</Link>
                    <Link href="/locations/denver-co" className="text-blue-600 hover:underline">Denver</Link>
                  </div>
                </div>

                <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d196473!2d-105.0372!3d39.8367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Westminster, CO Map"
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
