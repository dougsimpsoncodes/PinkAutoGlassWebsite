import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Star } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  robots: { index: false }, // Phase 1: noindex during coexistence
  title: 'Windshield Replacement Highlands Ranch | Mobile',
  description: 'Mobile windshield replacement & repair in Highlands Ranch CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair highlands ranch, windshield replacement highlands ranch, auto glass highlands ranch co, mobile windshield service highlands ranch, windshield replacement near me highlands ranch, backcountry windshield repair, westridge auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/colorado/highlands-ranch/',
  },
  openGraph: {
    title: 'Windshield Replacement Highlands Ranch | Mobile',
    description: 'Mobile windshield replacement & repair in Highlands Ranch CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/colorado/highlands-ranch/',
    type: 'website',
  },
};

export default function HighlandsRanchLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Highlands Ranch?',
      answer: 'Yes! Mobile service is our specialty in Highlands Ranch. We come to your home, office, or anywhere in Highlands Ranch. Whether you\'re in Backcountry, Northridge, Westridge, or anywhere else in Highlands Ranch, we\'ll come to you with our fully equipped mobile units.'
    },
    {
      question: 'How quickly can you replace a windshield in Highlands Ranch?',
      answer: 'We offer same-day windshield replacement throughout Highlands Ranch. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving. We understand Highlands Ranch residents are busy, so we work around your schedule.'
    },
    {
      question: 'What Highlands Ranch neighborhoods do you serve?',
      answer: 'We serve all of Highlands Ranch including: Backcountry, Northridge, Southridge, Westridge, Highlands Ranch Town Center, Redstone, Sanctuary, and all other Highlands Ranch neighborhoods. If you\'re anywhere in Highlands Ranch, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Highlands Ranch?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Highlands Ranch residents. We can verify your coverage and bill your insurance directly.'
    },
    {
      question: 'What if I need a windshield replacement while at the Highlands Ranch Rec Center?',
      answer: 'Our mobile service is designed for maximum convenience, so we can certainly come to you at any of the Highlands Ranch Rec Centers or your workplace. Just let us know your location, and we\'ll handle the repair while you continue your day.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Highlands Ranch',
    state: 'CO',
    zipCode: '80126',
    latitude: 39.5539,
    longitude: -104.9689,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Highlands Ranch, CO', url: 'https://pinkautoglass.com/colorado/highlands-ranch/' }
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
                <span className="text-xl">Highlands Ranch, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Highlands Ranch's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Driving through Highlands Ranch involves navigating busy routes like C-470 and University Blvd, exposing your windshield to a range of hazards. From daily commuter debris to intense hailstorms, protecting your vehicle\'s glass is a regular challenge for residents.
              </p>
              <CTAButtons source="highlands-ranch-co-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Highlands Ranch, CO', href: '/colorado/highlands-ranch/' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Highlands Ranch Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Highlands Ranch's affluent master-planned community needs reliable auto glass service. With over 105,000 residents, Highlands Ranch's unique suburban layout and commuter patterns create specific windshield challenges. From Backcountry to Northridge to Westridge, Pink Auto Glass provides fast, professional windshield repair and replacement throughout Highlands Ranch.
                </p>
                <AboveFoldCTA location="location-highlands-ranch-co" />

              {/* Windshield Damage in Highlands Ranch */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Highlands Ranch
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Rocks and gravel from C-470 traffic.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Frequent hailstorms during the spring and summer.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Debris from ongoing suburban construction projects.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Minor impacts from landscaping equipment in residential areas.</span>
                  </li>
                </ul>
              </section>
                <p className="text-lg text-gray-700 mb-4">
                  Whether you're commuting on C-470, traveling along I-25, navigating Santa Fe Drive, or shopping at Town Center, we come to you. Our fully equipped mobile units handle everything on-site - at your home, office, or anywhere in Highlands Ranch.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Highlands Ranch's Unique Windshield Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>C-470 Corridor:</strong> Heavy commuter traffic on this major beltway increases rock chip risks from high-speed highway debris</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-25 Commutes:</strong> Daily commutes to Denver and the Tech Center bring increased exposure to highway gravel and construction materials</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Santa Fe Drive Traffic:</strong> Busy commercial corridor with trucks and delivery vehicles creates frequent debris hazards</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Family Vehicle Frequency:</strong> High percentage of SUVs and minivans with large windshields that are more prone to damage</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Colorado Climate:</strong> Elevation and temperature swings from foothills proximity cause small chips to spread into large cracks</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  We know Highlands Ranch. Our technicians understand the specific challenges Highlands Ranch drivers face and provide expert windshield replacement and repair services tailored to your needs. Don't let a small chip from C-470 debris turn into a full windshield replacement - we offer same-day mobile service throughout all Highlands Ranch neighborhoods.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Highlands Ranch Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Backcountry</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Northridge</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Southridge</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Westridge</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Highlands Ranch Town Center</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Redstone</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Ranch at Highlands Ranch</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Sanctuary</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Sterling Ranch</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Shea Homes</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Wildcat Reserve</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">University Hills</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">East Highlands Ranch</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Cougar Run</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Timbers</span>
                    </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Highlands Ranch</h2>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Highlands Ranch Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">C‑470/E‑470 commutes and family‑vehicle trips mean chips spread quickly here. We provide mobile service in neighborhoods across Highlands Ranch.</p>
                <div className="space-y-4 text-gray-700 mb-6">
                  <div>
                    <h3 className="font-semibold">Can you come during school pickup hours?</h3>
                    <p>Yes—book a window that avoids the rush or we can meet you at home after.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Do SUVs cost more?</h3>
                    <p>Typically yes due to glass size and features; we’ll provide an exact quote before scheduling.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Highlands Ranch Customers</h2>
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
                  <Link href="/locations/littleton-co" className="text-pink-600 hover:underline font-medium">Littleton</Link>
                  <Link href="/locations/lone-tree-co" className="text-pink-600 hover:underline font-medium">Lone Tree</Link>
                  <Link href="/locations/centennial-co" className="text-pink-600 hover:underline font-medium">Centennial</Link>
                  <Link href="/locations/castle-pines-co" className="text-pink-600 hover:underline font-medium">Castle Pines</Link>
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Highlands Ranch?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Highlands Ranch. Call now for a free quote.</p>
                <CTAButtons source="highlands-ranch-co-cta" />
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
                    <Link href="/locations/centennial-co" className="text-blue-600 hover:underline">Centennial</Link>
                    <Link href="/locations/littleton-co" className="text-blue-600 hover:underline">Littleton</Link>
                    <Link href="/locations/parker-co" className="text-blue-600 hover:underline">Parker</Link>
                    <Link href="/locations/denver-co" className="text-blue-600 hover:underline">Denver</Link>
                  </div>
                </div>

                <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d196473!2d-104.9689!3d39.5539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Highlands Ranch, CO Map"
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
