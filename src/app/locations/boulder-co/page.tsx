import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Star } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Repair Boulder CO | Chip Repair & Replacement | (720) 918-7465',
  description: '★★★★★ Windshield repair & chip repair in Boulder CO. Mobile service to CU Boulder, Pearl Street, Table Mesa, Gunbarrel. $0 deductible often. Mountain driving specialists. Call (720) 918-7465!',
  keywords: 'windshield repair boulder, boulder windshield repair, boulder chip repair, windshield replacement boulder, auto glass boulder co, mobile windshield service boulder, cu boulder windshield repair, gunbarrel auto glass, table mesa windshield replacement',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/boulder-co',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Boulder, CO | Pink Auto Glass',
    description: 'Boulder\'s trusted auto glass experts. Mobile service to CU campus, Pearl Street, Table Mesa & all neighborhoods. Same-day appointments, lifetime warranty.',
    url: 'https://pinkautoglass.com/locations/boulder-co',
    type: 'website',
  },
};

export default function BoulderLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Boulder?',
      answer: 'Yes! Mobile service is our specialty in Boulder. We come to your home, office, or anywhere in Boulder. Our fully equipped mobile units serve all Boulder neighborhoods including University Hill, Table Mesa, Gunbarrel, Pearl Street, and North/South Boulder.'
    },
    {
      question: 'How quickly can you replace a windshield in Boulder?',
      answer: 'We offer same-day windshield replacement throughout Boulder. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving. Perfect for busy Boulder residents and CU students.'
    },
    {
      question: 'What Boulder neighborhoods do you serve?',
      answer: 'We serve all of Boulder including: University Hill, Table Mesa, Gunbarrel, North Boulder, South Boulder, Pearl Street, Downtown Boulder, Chautauqua, Martin Acres, Newlands, and all other Boulder neighborhoods. From CU campus to Niwot, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Boulder?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Boulder residents. We can verify your coverage and bill your insurance directly.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Boulder',
    state: 'CO',
    zipCode: '80301',
    latitude: 40.015,
    longitude: -105.2705,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Boulder, CO', url: 'https://pinkautoglass.com/locations/boulder-co' }
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
                <span className="text-xl">Boulder, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Boulder's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service • Same-Day Appointments • Lifetime Warranty
              </p>
              <CTAButtons source="boulder-co-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Boulder, CO', href: '/locations/boulder-co' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Boulder Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Welcome to Boulder—105,000+ residents, home of the University of Colorado Boulder, and the iconic Pearl Street Mall (a 4-block pedestrian mall featuring 300+ businesses, 85% locally owned, including beloved Boulder Book Store since 1973 and Black Diamond climbing gear). Nestled at 5,430 feet elevation against the stunning Flatirons, Boulder combines college town energy with outdoor adventure—but that means unique windshield challenges. From University Hill ("The Hill" on 13th Street near CU campus) to the Chautauqua neighborhood at the base of the Flatirons, from Gunbarrel's tech corridor to Table Mesa's family neighborhoods, Pink Auto Glass serves every corner of Boulder.
                </p>
                <AboveFoldCTA location="location-boulder-co" />
                <p className="text-lg text-gray-700 mb-4">
                  Whether you're commuting on Highway 36 (Boulder Turnpike) to Denver, exploring Boulder Canyon's scenic mountain route, navigating Baseline Road to Chautauqua's hiking trails, shopping on Pearl Street Mall, grabbing food on The Hill near CU, working in the Gunbarrel tech offices, or hiking in the Flatirons, we bring fully equipped mobile service directly to you. Our technicians understand Boulder's unique blend of urban living and mountain proximity.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Boulder Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Highway 36 (Boulder Turnpike) Commuter Traffic:</strong> This 35-minute route to Denver sees 75,000+ daily vehicles. The highway's constant construction (ongoing expansion projects) and heavy commercial truck traffic create rock chip hazards, especially between Boulder and Broomfield. This is Boulder residents' #1 source of windshield damage.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Boulder Canyon & Mountain Access Roads:</strong> Routes to Nederland, Eldora Ski Resort, and mountain recreation areas (Boulder Canyon, Flagstaff Road, Sunshine Canyon) are unpaved or partially paved. Loose gravel, falling rocks, and debris from mountain weather damage windshields. Summer thunderstorms wash rocks onto canyon roads.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>CU Boulder Campus Parking & Traffic:</strong> 35,000+ students create chaotic parking situations on The Hill, near the Broadway/Baseline intersection, and around campus. Tight parking spots, distracted student drivers, and bike traffic lead to parking lot mishaps and windshield damage.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Chautauqua & Flatirons Gravel Parking:</strong> Boulder's most popular hiking areas (Chautauqua, NCAR, Flatirons trailheads) have gravel parking lots. Cars constantly kick up rocks, and overflow parking on Baseline Road means dust and debris coating vehicles.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Extreme Elevation & Weather Swings:</strong> At 5,430 feet elevation with dramatic Flatirons uplift, Boulder experiences wild temperature swings—40°F mornings and 80°F afternoons are common. These rapid changes cause small chips to propagate into full cracks within hours. Boulder also gets surprise late-spring/early-fall snowstorms that stress windshields.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Active Outdoor Lifestyle Traffic:</strong> Boulderites' love of outdoor recreation means frequent trips on gravel roads, unpaved trailhead access routes, and mountain passes. Ski racks, bike racks, and roof cargo carriers can loosen and vibrate, stressing windshields and causing existing chips to crack.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  We know Boulder intimately. Our technicians understand the specific challenges you face—whether it's Highway 36 commuter debris, Boulder Canyon rock chips, CU campus parking mishaps, or Chautauqua gravel lot damage. Don't let a small chip from your morning commute down Baseline turn into a costly full replacement—we offer same-day mobile service throughout all Boulder neighborhoods, from Pearl Street Mall to Gunbarrel's tech campus.
                </p>
              </section>

              {/* Boulder Chip Repair Section */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Boulder's Rock Chip Repair Specialists</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Rock chips are especially common in Boulder due to mountain driving, gravel from canyon roads, and construction traffic on Highway 36. If you've picked up a chip from your commute or weekend mountain trip, we can repair it before it spreads into a costly crack.
                </p>
                <div className="bg-green-50 border-l-4 border-green-600 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">✓ Why Boulder Drivers Get More Rock Chips</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-600 font-bold mr-2">•</span>
                      <span><strong>Mountain Gravel:</strong> Boulder Canyon, Flagstaff Road, and mountain access routes have loose rocks and debris</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 font-bold mr-2">•</span>
                      <span><strong>Highway 36 Construction:</strong> Frequent roadwork and heavy truck traffic kick up rocks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 font-bold mr-2">•</span>
                      <span><strong>Temperature Extremes:</strong> Boulder's elevation causes rapid temperature swings that make chips spread faster</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 font-bold mr-2">•</span>
                      <span><strong>Unpaved Roads:</strong> Popular hiking and mountain biking trailheads have gravel parking areas</span>
                    </li>
                  </ul>
                </div>
                <p className="text-lg text-gray-700 mb-4">
                  <strong>30-Minute Mobile Chip Repair:</strong> We come to you anywhere in Boulder - University Hill, Table Mesa, Gunbarrel, or Pearl Street. Most insurance policies cover chip repair with $0 deductible. Don't wait for that chip to crack - call us today at <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">(720) 918-7465</a>.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-pink-600 mb-2">30 min</div>
                    <div className="text-gray-700 font-medium">Repair Time</div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-pink-600 mb-2">$0</div>
                    <div className="text-gray-700 font-medium">Often with Insurance</div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-pink-600 mb-2">Same Day</div>
                    <div className="text-gray-700 font-medium">Mobile Service</div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Boulder Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">University Hill</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Table Mesa</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Gunbarrel</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">North Boulder</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">South Boulder</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Martin Acres</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Newlands</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Chautauqua</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Downtown Boulder</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Pearl Street</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Boulder Creek</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Wonderland Lake</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Niwot</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Four Mile Canyon</span>
                    </div>
                  <div className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">Mapleton Hill</span>
                    </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Boulder</h2>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Boulder Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">Between Hwy 36 and mountain access roads, rock chips are common in Boulder. We provide mobile service across Table Mesa, Gunbarrel, and North/South Boulder.</p>
                <div className="space-y-4 text-gray-700 mb-6">
                  <div>
                    <h3 className="font-semibold">Do you service campus and downtown?</h3>
                    <p>Yes—please share your location details and we’ll select a safe spot for curbside service.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Are ADAS calibrations common in Boulder?</h3>
                    <p>Yes—many 2018+ vehicles need calibration. We include it where required and provide documentation.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Boulder Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Boulder?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Boulder. Call now for a free quote.</p>
                <CTAButtons source="boulder-co-cta" />
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
                    <Link href="/locations/thornton-co" className="text-blue-600 hover:underline">Thornton</Link>
                    <Link href="/locations/denver-co" className="text-blue-600 hover:underline">Denver</Link>
                    <Link href="/locations/lakewood-co" className="text-blue-600 hover:underline">Lakewood</Link>
                  </div>
                </div>

                <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d196473!2d-105.2705!3d40.015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Boulder, CO Map"
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
