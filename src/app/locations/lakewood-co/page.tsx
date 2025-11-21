import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Star } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Repair & Replacement Lakewood, CO | Pink Auto Glass',
  description: 'Lakewood windshield replacement & repair - same-day mobile service to Bear Valley, Belmar, Green Mountain & all Lakewood neighborhoods. Insurance accepted. Lifetime warranty. Call (720) 918-7465.',
  keywords: 'windshield repair lakewood, windshield replacement lakewood, auto glass lakewood co, mobile windshield service lakewood, belmar windshield repair, bear valley auto glass, windshield replacement near me lakewood',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/lakewood-co',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Lakewood, CO | Pink Auto Glass',
    description: 'Lakewood\'s trusted auto glass experts. Mobile service to all neighborhoods, same-day appointments, lifetime warranty. Serving Bear Valley, Belmar, Green Mountain & more.',
    url: 'https://pinkautoglass.com/locations/lakewood-co',
    type: 'website',
  },
};

export default function LakewoodLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Lakewood?',
      answer: 'Yes! Mobile service is our specialty in Lakewood. We come to your home, office, or anywhere in Lakewood. Our fully equipped mobile units serve all Lakewood neighborhoods including Bear Valley, Belmar, Green Mountain, and Applewood.'
    },
    {
      question: 'How quickly can you replace a windshield in Lakewood?',
      answer: 'We offer same-day windshield replacement throughout Lakewood. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving. We work around your schedule.'
    },
    {
      question: 'What Lakewood neighborhoods do you serve?',
      answer: 'We serve all of Lakewood including: Bear Valley, Green Mountain, Belmar, Applewood, Fox Hollow, Lakewood Heights, Red Rocks, Villa Italia, and all other Lakewood neighborhoods. If you\'re anywhere in Lakewood city limits, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Lakewood?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Lakewood residents. We can verify your coverage and bill your insurance directly.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Lakewood',
    state: 'CO',
    zipCode: '80226',
    latitude: 39.7047,
    longitude: -105.0814,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Lakewood, CO', url: 'https://pinkautoglass.com/locations/lakewood-co' }
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
                <span className="text-xl">Lakewood, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Lakewood's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service • Same-Day Appointments • Lifetime Warranty
              </p>
              <CTAButtons source="lakewood-co-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Lakewood, CO', href: '/locations/lakewood-co' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Lakewood Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  As Colorado's 5th largest city with over 155,000 residents, Lakewood is Denver's immediate western neighbor and home to iconic attractions like Dinosaur Ridge (rated the #1 dinosaur track site in the United States!), Bear Creek Lake Park, and the Belmar town center. From Bear Valley to Green Mountain, Eiber to Foothills neighborhoods, Pink Auto Glass provides fast, professional windshield repair and replacement throughout Lakewood. We bring our mobile service directly to you—whether you're at home, work, shopping at Belmar, visiting Heritage Lakewood Belmar Park, or even exploring Colorado Mills.
                </p>
                <AboveFoldCTA location="location-lakewood-co" />
                <p className="text-lg text-gray-700 mb-4">
                  Whether you're commuting on US-6 (6th Avenue)—one of Denver's busiest east-west corridors—navigating Wadsworth Boulevard's commercial stretch, or accessing I-70 for ski trips, our fully equipped mobile units serve all Lakewood neighborhoods including Glennon Heights, Academy Park, Morrison Road, and Kendrick Lake. We understand the unique challenges Lakewood drivers face as Denver's western gateway to the mountains.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Lakewood Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>US-6 (6th Avenue) Commuter Traffic:</strong> This major arterial sees 85,000+ vehicles daily between I-25 and C-470. Heavy commuter traffic kicks up road debris, especially during rush hour (7-9 AM, 4-7 PM). Construction zones near Sheridan and Kipling are particularly hazardous for rock chips.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Wadsworth Boulevard Commercial Corridor:</strong> As Lakewood's main north-south route, Wadsworth sees constant delivery trucks, construction vehicles servicing Belmar businesses, and road construction. More trucks = more windshield damage from loose cargo and road debris.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-70 Mountain Traffic Gateway:</strong> Lakewood is the last major city before I-70 climbs into the Rockies. Weekend ski traffic (Friday evenings, Sunday afternoons) brings vehicles covered in road sand, ice, and debris from mountain passes. Following too closely behind these vehicles causes rock chips.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Foothills Weather Extremes:</strong> Sitting at 5,518 feet elevation at the base of the foothills, Lakewood experiences rapid temperature swings—morning temps in the 30s, afternoons in the 70s. These swings cause small chips to crack rapidly, often spreading across the windshield within hours.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>West Metro Hail Corridor:</strong> Lakewood sits directly in the path of thunderstorms that develop over the foothills and move east. Green Mountain and Bear Valley neighborhoods see frequent hail May-August, with Bear Creek Lake area being especially prone to large hail.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  We know Lakewood intimately. Our technicians understand the specific challenges you face—whether it's dodging road debris on 6th Ave during the morning commute, dealing with hail damage near Bear Creek, or chips from mountain traffic on I-70. Don't let a small chip from Wadsworth construction turn into a full windshield replacement—we offer same-day mobile service throughout all Lakewood neighborhoods, from Dinosaur Ridge to Villa Italia.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Lakewood Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Bear Valley</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Green Mountain</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Belmar</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Applewood</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Fox Hollow</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Lakewood Heights</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Villa Italia</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Lakewood Estates</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Red Rocks</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Morrison Road</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Kipling</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Wadsworth</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">West Alameda</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Lakewood Plaza</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Kendrick Lake</span>
                    </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Lakewood</h2>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Lakewood Driving & Windshield Care Tips</h2>
                <p className="text-lg text-gray-700 mb-4">As Denver's western neighbor and gateway to the mountains, Lakewood drivers face unique challenges. Here's what you need to know:</p>
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">🚗 6th Avenue (US-6) Commuter Strategy</h3>
                    <p className="text-gray-700">Avoid the far-right lane between Wadsworth and Sheridan during rush hour (7-9 AM, 4-7 PM)—this is where road debris accumulates. Construction zones near Kipling are especially hazardous. If you get a chip during your morning commute, get it repaired the same day before temperature swings cause it to spread.</p>
                  </div>
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">⛷️ Weekend I-70 Ski Traffic Protection</h3>
                    <p className="text-gray-700">Returning ski traffic on Sunday afternoons (2-7 PM) is the #1 cause of windshield damage for Lakewood residents. Vehicles descending from mountain passes carry ice, sand, and road debris. Stay 5+ seconds behind trucks and SUVs with out-of-state plates.</p>
                  </div>
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">🌤️ Foothills Weather Awareness</h3>
                    <p className="text-gray-700">Living at 5,518 feet elevation means dramatic temperature swings. A small chip at 8 AM (35°F) can crack by 2 PM (75°F). Get chips repaired immediately—temperature stress propagates cracks fast in Lakewood's climate.</p>
                  </div>
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Can you service vehicles at Belmar, Colorado Mills, or Bear Creek Lake Park?</h3>
                    <p className="text-gray-700">Absolutely! We regularly service vehicles at Belmar (while you shop or work), Colorado Mills parking areas, Bear Creek Lake Park visitors, Heritage Lakewood Belmar Park, office parks along Wadsworth, and Dinosaur Ridge trailhead parking. You enjoy your day—we handle your windshield.</p>
                  </div>
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Do you serve all Lakewood neighborhoods?</h3>
                    <p className="text-gray-700">Yes—every single one! Bear Valley, Green Mountain, Belmar, Eiber, Glennon Heights, Foothills, Academy Park, Fox Hollow, Lakewood Heights, Villa Italia, Morrison Road, Kendrick Lake, Applewood, and even West Alameda near the foothills. We come to your driveway, office, or any safe parking area.</p>
                  </div>
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">How quickly can you respond in Lakewood?</h3>
                    <p className="text-gray-700">Same-day service is our standard throughout Lakewood—most appointments completed within 2-4 hours. Morning chip on 6th Ave? Fixed by lunch. We know you're busy (commuting to Denver, shopping at Belmar, working in Lakewood offices, or enjoying Bear Creek trails).</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Lakewood Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Lakewood?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Lakewood. Call now for a free quote.</p>
                <CTAButtons source="lakewood-co-cta" />
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
                    <Link href="/locations/denver-co" className="text-blue-600 hover:underline">Denver</Link>
                    <Link href="/locations/arvada-co" className="text-blue-600 hover:underline">Arvada</Link>
                    <Link href="/locations/golden-co" className="text-blue-600 hover:underline">Golden</Link>
                    <Link href="/locations/westminster-co" className="text-blue-600 hover:underline">Westminster</Link>
                  </div>
                </div>

                <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d196473!2d-105.0814!3d39.7047!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lakewood, CO Map"
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
