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
  title: 'Windshield Replacement Thornton CO | Mobile, $0 Deductible',
  description: 'Mobile windshield replacement & repair in Thornton CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair thornton, windshield replacement thornton, auto glass thornton co, mobile windshield service thornton, windshield replacement near me thornton, eastlake windshield repair, thornton town center auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/colorado/thornton/',
  },
  openGraph: {
    title: 'Windshield Replacement Thornton CO | Mobile, $0 Deductible',
    description: 'Mobile windshield replacement & repair in Thornton CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/colorado/thornton/',
    type: 'website',
  },
};

export default function ThorntonLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Thornton?',
      answer: 'Yes! Mobile service is our specialty in Thornton. We come to your home, office, or anywhere in Thornton. Whether you\'re in Thornton Town Center, Eastlake, Riverdale, or anywhere else in Thornton, we\'ll come to you with our fully equipped mobile units.'
    },
    {
      question: 'How quickly can you replace a windshield in Thornton?',
      answer: 'We offer same-day windshield replacement throughout Thornton. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving. We understand Thornton residents are busy, so we work around your schedule.'
    },
    {
      question: 'What Thornton neighborhoods do you serve?',
      answer: 'We serve all of Thornton including: Thornton Town Center, Eastlake, Riverdale, Heritage, Thorncreek, Trail Winds, and all other Thornton neighborhoods. If you\'re anywhere in Thornton, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Thornton?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Thornton residents. We can verify your coverage and bill your insurance directly.'
    },
    {
      question: 'Does Pink Auto Glass provide mobile service across the entire Thornton area, including newer developments further north?',
      answer: 'Yes, Pink Auto Glass proudly serves all neighborhoods within Thornton, from the established areas near Northglenn to the rapidly expanding communities further north towards E-470. Our mobile service ensures we can reach you wherever you are in Thornton for convenient windshield repair or replacement.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Thornton',
    state: 'CO',
    zipCode: '80229',
    latitude: 39.8681,
    longitude: -104.9719,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Thornton, CO', url: 'https://pinkautoglass.com/colorado/thornton/' }
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
                <span className="text-xl">Thornton, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Thornton's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Navigating Thornton\'s busy streets, from the I-25 corridor to US-85 or Huron Street, means your windshield faces constant exposure to road hazards. This rapidly growing northern Denver suburb experiences significant commuter traffic and ongoing development, leading to frequent encounters with kicked-up debris and construction materials.
              </p>
              <CTAButtons source="thornton-co-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Thornton, CO', href: '/colorado/thornton/' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Thornton Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Thornton's rapidly growing community needs reliable auto glass service. As Colorado's 6th largest city with over 145,000 residents, Thornton's fast-paced northern suburb expansion creates unique windshield challenges. From Thornton Town Center to Eastlake to Riverdale, Pink Auto Glass provides fast, professional windshield repair and replacement throughout Thornton.
                </p>
                <AboveFoldCTA location="location-thornton-co" />

              {/* Windshield Damage in Thornton */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Thornton
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Heavy commuter traffic on I-25 and US-85 (Brighton Road) frequently causes stone chips.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Extensive ongoing residential and commercial construction throughout the city.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Road treatments during winter months often include sand and gravel, contributing to damage.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Frequent strong winds that can blow debris and intensify the impact of hail storms.</span>
                  </li>
                </ul>
              </section>
                <p className="text-lg text-gray-700 mb-4">
                  Whether you're commuting on I-25, traveling along E-470, navigating Washington Street, or shopping at Town Center, we come to you. Our fully equipped mobile units handle everything on-site - at your home, office, or anywhere in Thornton.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Thornton's Unique Windshield Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-25 Corridor:</strong> Major interstate traffic through northern metro brings constant exposure to highway debris and gravel trucks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>E-470 Beltway:</strong> High-speed toll road traffic increases rock chip risks from commercial and commuter vehicles</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Washington Street Traffic:</strong> Heavy commercial corridor creates frequent debris hazards from delivery and construction trucks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Rapid Development:</strong> Thornton's fast growth means constant construction debris and dust from new residential and commercial projects</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Northern Metro Weather:</strong> Temperature extremes and seasonal winds cause small chips to quickly spread into large cracks</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  We know Thornton. Our technicians understand the specific challenges Thornton drivers face and provide expert windshield replacement and repair services tailored to your needs. Don't let a small chip from I-25 debris turn into a full windshield replacement - we offer same-day mobile service throughout all Thornton neighborhoods.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Thornton Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Heritage</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Eastlake</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Thornton Town Center</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Thorncreek</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Northglenn</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">North Washington</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Thornton Parkway</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Trail Winds</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Hunters Glen</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Belford</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Skyline Vista</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Margaret W Carpenter</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Trailside</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Alpine Vista</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Colorado Boulevard</span>
                    </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Thornton</h2>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Thornton Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">With rapid growth along I‑25 north, construction debris and dust can cause frequent chips. We offer mobile repair and OEM replacements throughout Thornton.</p>
                <div className="space-y-4 text-gray-700 mb-6">
                  <div>
                    <h3 className="font-semibold">Do you service new developments?</h3>
                    <p>Yes—call or book online and we’ll meet you at home or a safe nearby lot.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Is same‑day available?</h3>
                    <p>Often yes; we’ll confirm the earliest arrival window based on your location and weather.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Thornton Customers</h2>
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
                  <Link href="/locations/northglenn-co" className="text-pink-600 hover:underline font-medium">Northglenn</Link>
                  <Link href="/locations/westminster-co" className="text-pink-600 hover:underline font-medium">Westminster</Link>
                  <Link href="/locations/brighton-co" className="text-pink-600 hover:underline font-medium">Brighton</Link>
                  <Link href="/locations/commerce-city-co" className="text-pink-600 hover:underline font-medium">Commerce City</Link>
                  <Link href="/locations/broomfield-co" className="text-pink-600 hover:underline font-medium">Broomfield</Link>
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Thornton?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Thornton. Call now for a free quote.</p>
                <CTAButtons source="thornton-co-cta" />
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
                    <Link href="/locations/northglenn-co" className="text-blue-600 hover:underline">Northglenn</Link>
                    <Link href="/locations/denver-co" className="text-blue-600 hover:underline">Denver</Link>
                    <Link href="/locations/aurora-co" className="text-blue-600 hover:underline">Aurora</Link>
                  </div>
                </div>

                <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d196473!2d-104.9719!3d39.8681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Thornton, CO Map"
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
