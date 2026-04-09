import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Star } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Arvada CO | Mobile, $0 Deductible',
  description: 'Mobile windshield replacement & repair in Arvada CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair arvada, windshield replacement arvada, auto glass arvada co, mobile windshield service arvada, windshield replacement near me arvada, old town arvada windshield repair, candelas auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/arvada-co',
  },
  openGraph: {
    title: 'Windshield Replacement Arvada CO | Mobile, $0 Deductible',
    description: 'Mobile windshield replacement & repair in Arvada CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/arvada-co',
    type: 'website',
  },
};

export default function ArvadaLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Arvada?',
      answer: 'Yes! Mobile service is our specialty in Arvada. We come to your home, office, or anywhere in Arvada. Whether you\'re in Old Town Arvada, Candelas, Leyden Rock, or anywhere else in Arvada, we\'ll come to you with our fully equipped mobile units.'
    },
    {
      question: 'How quickly can you replace a windshield in Arvada?',
      answer: 'We offer same-day windshield replacement throughout Arvada. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving. We understand Arvada residents are busy, so we work around your schedule.'
    },
    {
      question: 'What Arvada neighborhoods do you serve?',
      answer: 'We serve all of Arvada including: Olde Town Arvada, Candelas, Leyden Rock, Stonebridge, Ralston Creek, Berkeley Park, Arvada West, and all other Arvada neighborhoods. If you\'re anywhere in Arvada city limits, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Arvada?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Arvada residents. We can verify your coverage and bill your insurance directly.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Arvada',
    state: 'CO',
    zipCode: '80002',
    latitude: 39.8028,
    longitude: -105.0875,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Arvada, CO', url: 'https://pinkautoglass.com/locations/arvada-co' }
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
                <span className="text-xl">Arvada, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Arvada's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service • Same-Day Appointments • Lifetime Warranty
              </p>
              <CTAButtons source="arvada-co-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Arvada, CO', href: '/locations/arvada-co' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Arvada Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Arvada's historic community needs reliable auto glass service. With over 125,000 residents, Arvada's unique blend of old-town charm and modern development creates specific windshield challenges. From Old Town Arvada to the new Candelas and Leyden Rock developments, Pink Auto Glass provides fast, professional windshield repair and replacement throughout Arvada.
                </p>
                <AboveFoldCTA location="location-arvada-co" />
                <p className="text-lg text-gray-700 mb-4">
                  Whether you're commuting on US-36, traveling along Wadsworth Boulevard, navigating I-70, or exploring historic Olde Town, we come to you. Our fully equipped mobile units handle everything on-site - at your home, office, or anywhere in Arvada.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Arvada's Unique Windshield Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>US-36 Corridor:</strong> High-speed traffic between Denver and Boulder increases rock chip risks from commercial vehicles and highway debris</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-70 Mountain Traffic:</strong> Heavy weekend traffic to ski resorts brings road debris and gravel from mountain highways</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>New Development Construction:</strong> Ongoing builds in Candelas and Leyden Rock create construction debris and dust hazards</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Wadsworth Boulevard:</strong> Heavy commercial traffic on this major north-south route increases windshield damage frequency</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Proximity to Mountains:</strong> Arvada's location near the foothills means temperature swings that cause chips to spread quickly</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  We know Arvada. Our technicians understand the specific challenges Arvada drivers face and provide expert windshield replacement and repair services tailored to your needs. Don't let a small chip from US-36 debris turn into a full windshield replacement - we offer same-day mobile service throughout all Arvada neighborhoods.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Arvada Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Olde Town Arvada</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Candelas</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Leyden Rock</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Stonebridge</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Ralston Creek</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Berkeley Park</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Arvada West</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Van Bibber Creek</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Wadsworth</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Grandview Estates</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Indian Tree</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Rocky Flats</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Plainview</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Tallman Gulch</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Gold Strike</span>
                    </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Arvada</h2>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Arvada Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">Candelas and Leyden Rock areas see dust and debris from new builds. We offer mobile service throughout Olde Town and west Arvada neighborhoods.</p>
                <div className="space-y-4 text-gray-700 mb-6">
                  <div>
                    <h3 className="font-semibold">Do you serve new developments?</h3>
                    <p>Yes—we regularly service Candelas, Leyden Rock, and Stonebridge with curbside convenience.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Can you work at my home?</h3>
                    <p>Absolutely. Our mobile units are fully equipped to complete service at your driveway or curb.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Arvada Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Arvada?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Arvada. Call now for a free quote.</p>
                <CTAButtons source="arvada-co-cta" />
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
                    <Link href="/locations/westminster-co" className="text-blue-600 hover:underline">Westminster</Link>
                    <Link href="/locations/lakewood-co" className="text-blue-600 hover:underline">Lakewood</Link>
                    <Link href="/locations/denver-co" className="text-blue-600 hover:underline">Denver</Link>
                    <Link href="/locations/thornton-co" className="text-blue-600 hover:underline">Thornton</Link>
                  </div>
                </div>

                <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d196473!2d-105.0875!3d39.8028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Arvada, CO Map"
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
