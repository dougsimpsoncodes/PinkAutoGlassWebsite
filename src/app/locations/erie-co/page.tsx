import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Clock, Shield, Star } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import GoogleMapEmbed from '@/components/GoogleMapEmbed';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Erie CO | Mobile, $0 Deductible',
  description: 'Mobile windshield replacement & repair in Erie CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair erie, windshield replacement erie, auto glass erie co, mobile windshield service erie, erie colorado windshield',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/erie-co',
  },
  openGraph: {
    title: 'Windshield Replacement Erie CO | Mobile, $0 Deductible',
    description: 'Mobile windshield replacement & repair in Erie CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/erie-co',
    type: 'website',
  },
};

export default function ErieLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Erie?',
      answer: 'Yes! Mobile service is our specialty in Erie. We come to your home, office, or anywhere in the Erie area. Whether you\'re in Colliers Hill, Flatiron Meadows, Vista Ridge, or anywhere else in Erie, our fully equipped mobile units will meet you wherever is most convenient.'
    },
    {
      question: 'How quickly can you replace a windshield in Erie?',
      answer: 'We offer same-day windshield replacement throughout Erie. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What Erie neighborhoods do you serve?',
      answer: 'We serve all of Erie including: Colliers Hill, Flatiron Meadows, Vista Ridge, Erie Highlands, Old Town Erie, Kenosha Farms, Canyon Creek, and all other Erie neighborhoods. If you\'re anywhere in Erie, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Erie?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Erie residents.'
    },
    {
      question: 'Why do Erie windshields get damaged so often?',
      answer: 'Erie\'s explosive growth means constant construction traffic dropping gravel on CO-7 and local roads. Combined with 23+ documented hail events within 10 miles in 2023 alone, wind-driven grit from the open plains, and high-speed I-25 commutes, windshield damage is one of Erie\'s most common vehicle issues.'
    },
    {
      question: 'Given Erie\'s growth, how quickly can Pink Auto Glass typically schedule a mobile windshield replacement?',
      answer: 'We understand the fast pace of life in growing communities like Erie. Pink Auto Glass prioritizes quick scheduling and efficient mobile service, often able to complete replacements within 24-48 hours. Our goal is to get you back on the road safely and swiftly, minimizing disruption to your day.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Erie',
    state: 'CO',
    zipCode: '80516',
    latitude: 40.05,
    longitude: -105.05,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Erie, CO', url: 'https://pinkautoglass.com/locations/erie-co' }
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
                <span className="text-xl">Erie, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Erie's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Erie\'s rapid growth means a constant presence of construction vehicles and new road developments, adding to the risks of windshield damage. Commuting along Highway 7 or through expanding neighborhoods can expose your vehicle to unexpected road hazards.
              </p>
              <CTAButtons source="erie-co-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Erie, CO', href: '/locations/erie-co' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Erie Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Erie is one of the fastest-growing towns in the United States, with over 40,000 residents at 5,119 feet elevation spanning both Boulder and Weld counties. Originally platted as "Coal Park" in 1871 around the area's first commercial coal mine, Erie has transformed from a quiet mining community into a booming suburban hub with master-planned communities stretching across the landscape.
                </p>

                <AboveFoldCTA location="location-erie-co" />

              {/* Windshield Damage in Erie */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Erie
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Construction debris and gravel from ongoing development projects.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Rocks and pebbles kicked up from agricultural roads transitioning to paved ones.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Hailstorms, a common meteorological event in northern Colorado during spring and summer.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Debris from I-25 for those commuting south towards Denver or north towards Fort Collins.</span>
                  </li>
                </ul>
              </section>

                <p className="text-lg text-gray-700 mb-4">
                  But Erie's rapid growth comes with a cost for windshields. Constant construction traffic on CO-7 and CO-52, frequent hailstorms (23+ documented events within 10 miles in 2023), and high-speed commutes on I-25 make windshield damage one of the most common vehicle issues in town. Whether you're in Colliers Hill, Flatiron Meadows, or Old Town Erie, Pink Auto Glass brings same-day mobile service right to your door.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Erie Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Frequent Documented Hailstorms:</strong> Erie had 23 hail reports within 10 miles in 2023 and 25 in 2024, with the largest recorded at 3 inches in diameter. A single overnight storm can shatter dozens of windshields across neighborhoods.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Construction Zone Debris:</strong> Erie's residential and commercial buildout generates constant heavy truck traffic on CO-7, CO-52, and county roads. Aggregate and gravel falling from dump trucks and flatbeds is a leading chip cause.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Wind-Driven Plains Grit:</strong> Erie sits at the transition between the Foothills and open eastern plains. Sustained Front Range winds of 30-50 mph carry fine gravel and soil particles that sandblast and pit exposed glass over time.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>High-Speed Commuter Exposure:</strong> Residents commuting to Boulder, Denver, or Longmont via I-25 or CO-7 log high daily mileage on high-speed roads where chip probability is significantly elevated.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>New-Construction Road Surfaces:</strong> Newly paved subdivision roads release loose aggregate during their first season. Combined with heavy construction traffic, fresh pavement produces more airborne debris than established roads.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Altitude Temperature Swings:</strong> At 5,100 feet with open weather exposure, nighttime temperatures drop sharply even after warm days. Existing chips propagate through the glass overnight as temperatures cycle.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  Don't let a chip from CO-7 construction or an I-25 commute turn into a costly replacement. We offer same-day mobile service throughout all of Erie—from the newest subdivisions to the historic Old Town core.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Erie Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">
                  CO-7 construction and I-25 commuter traffic are the primary sources of windshield damage for Erie residents. We bring mobile service to any neighborhood, even those still under active construction.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">Can you come to my new subdivision?</h3>
                    <p>Yes—we service all Erie neighborhoods including the newest developments in Colliers Hill and Flatiron Meadows. We'll find a safe, level spot to complete the work.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Is ADAS calibration included?</h3>
                    <p>If your vehicle requires it (common on 2018+ models), we include professional ADAS calibration and provide documentation for your records.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Erie Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Colliers Hill', 'Flatiron Meadows', 'Vista Ridge',
                    'Vista Pointe', 'Arapahoe Ridge', 'Erie Highlands',
                    'Erie Village', 'Erie Commons', 'Candlelight Ridge',
                    'Kenosha Farms', 'Meadow Sweet Farm', 'Canyon Creek',
                    'Grandview', 'Compass', 'Old Town Erie'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don't see your neighborhood? We serve all of Erie - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Erie</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Professional Service</p>
                    <p className="text-gray-700 mb-4">Fast repair for chips and small cracks. Often covered 100% by insurance with no deductible.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Professional Service</p>
                    <p className="text-gray-700 mb-4">Complete windshield replacement with OEM quality glass. ADAS calibration available.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Service</h3>
                    <p className="text-blue-600 font-bold text-2xl mb-3">No Extra Charge</p>
                    <p className="text-gray-700 mb-4">We come to you anywhere in Erie. Home, office, or driveway service available.</p>
                    <Link href="/services/mobile-service" className="text-blue-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">ADAS Calibration</h3>
                    <p className="text-blue-600 font-bold text-2xl mb-3">Professional Calibration</p>
                    <p className="text-gray-700 mb-4">Required for 2018+ vehicles with advanced safety features.</p>
                    <Link href="/services/adas-calibration" className="text-blue-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-yellow-600" />
                  Erie Hail Season Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Erie's position at the Foothills-to-plains transition makes it one of the most hail-active communities in Colorado. With 23+ documented events in 2023 alone, hail damage is when—not if. After a hailstorm:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Act Fast:</strong> Temperature swings at 5,100 feet cause chips to spread rapidly—get repairs before small damage becomes a full replacement</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Insurance Covers It:</strong> Comprehensive coverage typically covers hail damage with zero deductible in Colorado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>We're Ready:</strong> We increase capacity during hail season to serve Erie and surrounding communities quickly</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Erie Customers Say</h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Jake P.',
                      neighborhood: 'Colliers Hill',
                      rating: 5,
                      text: 'Construction trucks on CO-7 finally got my windshield. Pink Auto Glass came to my house in Colliers Hill the same day and had it replaced in under two hours. Insurance covered it all.'
                    },
                    {
                      name: 'Michelle T.',
                      neighborhood: 'Flatiron Meadows',
                      rating: 5,
                      text: 'After the hailstorm in June, everyone in Flatiron Meadows needed windshields. They were fast, professional, and handled all the insurance paperwork. Highly recommend.'
                    },
                    {
                      name: 'Dan W.',
                      neighborhood: 'Vista Ridge',
                      rating: 5,
                      text: 'Third chip this year from my I-25 commute. They repaired it in my driveway in 30 minutes. Insurance covered it and I didn\'t even have to leave home.'
                    }
                  ].map((review, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-3">
                        <div className="flex text-yellow-400">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-current" />
                          ))}
                        </div>
                        <span className="ml-3 text-gray-600 text-sm">{review.neighborhood}</span>
                      </div>
                      <p className="text-gray-700 mb-2">"{review.text}"</p>
                      <p className="text-gray-900 font-semibold">- {review.name}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Erie Customers</h2>
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
                  <Link href="/locations/lafayette-co" className="text-pink-600 hover:underline font-medium">Lafayette</Link>
                  <Link href="/locations/frederick-co" className="text-pink-600 hover:underline font-medium">Frederick</Link>
                  <Link href="/locations/firestone-co" className="text-pink-600 hover:underline font-medium">Firestone</Link>
                  <Link href="/locations/longmont-co" className="text-pink-600 hover:underline font-medium">Longmont</Link>
                  <Link href="/locations/broomfield-co" className="text-pink-600 hover:underline font-medium">Broomfield</Link>
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Erie?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Erie. Call now for a free quote.</p>
                <CTAButtons source="erie-co-cta" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Erie Now</h3>
                  <div className="space-y-3">
                    <a href="tel:+17209187465" className="flex items-center justify-center w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-700 transition-colors">
                      <Phone className="w-5 h-5 mr-2" />
                      (720) 918-7465
                    </a>
                    <Link href="/book" className="flex items-center justify-center w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Book Online
                    </Link>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Open 7 Days: 7am - 7pm</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Mobile Service - All Erie</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Erie" state="CO" />
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li><Link href="/locations/lafayette-co" className="text-pink-600 hover:underline">Lafayette, CO →</Link></li>
                    <li><Link href="/locations/longmont-co" className="text-pink-600 hover:underline">Longmont, CO →</Link></li>
                    <li><Link href="/locations/firestone-co" className="text-pink-600 hover:underline">Firestone, CO →</Link></li>
                    <li><Link href="/locations/broomfield-co" className="text-pink-600 hover:underline">Broomfield, CO →</Link></li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Erie</h3>
                  <p className="text-sm text-gray-600 mb-3">Vehicle-specific info:</p>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/vehicles/subaru-outback-windshield-replacement-denver" className="text-pink-600 hover:underline">Subaru Outback →</Link></li>
                    <li><Link href="/vehicles/toyota-rav4-windshield-replacement-denver" className="text-pink-600 hover:underline">Toyota RAV4 →</Link></li>
                    <li><Link href="/vehicles/honda-cr-v-windshield-replacement-denver" className="text-pink-600 hover:underline">Honda CR-V →</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
