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
  title: 'Windshield Repair & Replacement Louisville, CO | Pink Auto Glass',
  description: 'Professional windshield repair and replacement in Louisville, Colorado. Mobile service to your home or office. Same-day appointments in Boulder County. Call (720) 918-7465 for a free quote.',
  keywords: 'windshield repair louisville, windshield replacement louisville, auto glass louisville co, mobile windshield service louisville colorado, boulder county auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/louisville-co',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Louisville, CO | Pink Auto Glass',
    description: 'Louisville\'s trusted auto glass experts. Mobile service, same-day appointments, lifetime warranty.',
    url: 'https://pinkautoglass.com/locations/louisville-co',
    type: 'website',
  },
};

export default function LouisvilleLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Louisville?',
      answer: 'Yes! Mobile service is our specialty in Louisville. We come to your home, office, or anywhere in the Louisville area. Whether you\'re in Old Town, Steel Ranch, Coal Creek Ranch, or anywhere else in Louisville, we\'ll come to you with our fully equipped mobile units.'
    },
    {
      question: 'How quickly can you replace a windshield in Louisville?',
      answer: 'We offer same-day windshield replacement throughout Louisville. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'Does insurance cover windshield replacement in Louisville?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement for the price of your deductible. We work with all major insurance companies and assist with filing all paperwork for Louisville residents.'
    },
    {
      question: 'Do you handle ADAS calibration for newer vehicles in Louisville?',
      answer: 'Absolutely. Many vehicles from 2018 and newer require ADAS (Advanced Driver Assistance Systems) calibration after a windshield replacement. We provide professional calibration and full documentation for Louisville customers.'
    },
    {
      question: 'Is windshield damage more common in Louisville because of the old coal mines?',
      answer: 'It genuinely is. Louisville was built over a network of underground coal mine shafts, and the gradual settling of these voids causes irregular pavement shifts, potholes, and cracking across the city. Combined with Coal Creek aggregate on roadways and heavy US-36 debris, Louisville drivers experience above-average windshield damage. The Marshall Fire aftermath has only added to the problem with destabilized land and ongoing construction.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Louisville',
    state: 'CO',
    zipCode: '80027',
    latitude: 39.9778,
    longitude: -105.1319,
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Louisville, CO', url: 'https://pinkautoglass.com/locations/louisville-co' }
  ]);

  const combinedSchema = combineSchemas(localBusinessSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 page-top-padding">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 mr-2" />
                <span className="text-xl">Louisville, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Louisville&apos;s Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service &bull; Same-Day Appointments &bull; Lifetime Warranty
              </p>
              <CTAButtons source="louisville-hero" />
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Locations', href: '/locations' },
              { label: 'Louisville, CO', href: '/locations/louisville-co' }
            ]}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Why Louisville Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Louisville Residents Choose Pink Auto Glass
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Louisville is a Boulder County treasure -- a walkable, award-winning small town of roughly 21,000 residents perched at 5,335 feet along the US-36 corridor. Consistently ranked among the best places to live in America, Louisville blends its coal-mining heritage with a thriving downtown, excellent schools, and neighborhoods like Steel Ranch and Coal Creek Ranch. But Louisville&apos;s roads tell a different story. The city was built atop a network of underground coal mine shafts, and as these voids gradually settle, they cause irregular pavement shifts and potholes across town. Add high-speed US-36 debris at 65-75 mph, Coal Creek aggregate, Marshall Fire aftermath destabilizing land, and Colorado&apos;s relentless freeze-thaw cycles, and windshield damage is simply part of Louisville life.
                </p>

                <AboveFoldCTA location="location-louisville" />

                <p className="text-lg text-gray-700 mb-4">
                  We know Louisville. Whether you&apos;re strolling Main Street in the Downtown Historic District, catching a show at the Louisville Center for the Arts, commuting to Boulder or Denver on US-36, exploring the trails at Harper Lake, or shuttling kids to activities in Governors Ranch, your windshield is constantly at risk. That&apos;s why we bring our mobile service directly to you -- whether you&apos;re in the established streets of Old Town Louisville, the family-friendly neighborhoods of Centennial Valley and Coyote Run, or the newer homes at Legacy and Sagamore. No shop visit needed.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Louisville Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>US-36 High-Speed Debris:</strong> Louisville borders one of Colorado&apos;s busiest expressways. Vehicles traveling 65-75 mph launch rocks and road debris with devastating force, making rock chips nearly unavoidable for Louisville commuters.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Marshall Fire Aftermath:</strong> The devastating December 2021 Marshall Fire destroyed over 1,000 structures in the Louisville-Superior area. Years later, ongoing reconstruction means heavy equipment, construction vehicles, and destabilized soil continue to generate windshield hazards.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Coal Creek Aggregate:</strong> Seasonal runoff along Coal Creek deposits sand, gravel, and loose stone onto Louisville roadways. Passing vehicles kick up this debris directly into windshields, especially in spring and after heavy rains.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Winter Sand Accumulation:</strong> Louisville&apos;s streets are heavily sanded during winter storms. As the snow melts, piles of coarse sand remain on roads for weeks, creating a constant source of airborne grit that pits and chips windshields.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Freeze-Thaw Pavement Fracturing:</strong> At 5,335 feet elevation, Louisville endures dramatic daily temperature swings. Water seeps into small pavement cracks, freezes overnight, and expands -- creating new potholes and launching loose asphalt chunks at passing vehicles.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>McCaslin Commercial Truck Traffic:</strong> McCaslin Blvd (CO-42) serves as Louisville&apos;s main commercial corridor. Delivery trucks, construction vehicles, and heavy commercial traffic generate a steady stream of road debris along this busy route.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  Our technicians understand Louisville&apos;s unique challenges -- from mine-subsidence potholes to Marshall Fire reconstruction debris. Whether your chip came from a rock on US-36, loose aggregate on McCaslin, or a frost-heaved pothole in Old Town, we provide fast, professional repair before Colorado&apos;s temperature extremes make it worse. Same-day mobile service throughout all Louisville neighborhoods.
                </p>
              </section>

              {/* Driving Tips & Local Info */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Louisville Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">US-36 commuters and McCaslin corridor traffic generate frequent chips. We coordinate safe curbside service in Old Town, Steel Ranch, Coal Creek Ranch, and all Louisville neighborhoods.</p>
                <div className="space-y-4 text-gray-700 mb-6">
                  <div>
                    <h3 className="font-semibold">Do you service the Marshall Fire rebuild areas?</h3>
                    <p>Yes -- we regularly serve the reconstruction zones in southern Louisville and understand the unique access challenges. Share your location and we&apos;ll find the best spot to meet you safely.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Is ADAS calibration included with replacement?</h3>
                    <p>If your vehicle requires it (common on 2018+ models), we include ADAS calibration and provide full documentation for your records.</p>
                  </div>
                </div>
              </section>

              {/* Service Area / Neighborhoods */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Louisville Neighborhoods We Serve
                </h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Old Town Louisville', 'Downtown Historic District', 'Harper Lake',
                    'Centennial Valley', 'Governors Ranch', 'Coal Creek Ranch',
                    'Steel Ranch', 'Coyote Run', 'Sundance',
                    'Pine Street Corridor', 'Bella Vista', 'Legacy',
                    'Hecla', 'Wildflower', 'Sagamore'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don&apos;t see your neighborhood? We serve all of Louisville - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              {/* Our Services */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Services in Louisville
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Professional Service</p>
                    <p className="text-gray-700 mb-4">
                      Fast repair for chips and small cracks. Often covered 100% by insurance with no deductible.
                    </p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">
                      Learn More &rarr;
                    </Link>
                  </div>

                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Professional Service</p>
                    <p className="text-gray-700 mb-4">
                      Complete windshield replacement with OEM quality glass. ADAS calibration available.
                    </p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">
                      Learn More &rarr;
                    </Link>
                  </div>

                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Service</h3>
                    <p className="text-blue-600 font-bold text-2xl mb-3">No Extra Charge</p>
                    <p className="text-gray-700 mb-4">
                      We come to you anywhere in Louisville. Home, office, or curbside service available.
                    </p>
                    <Link href="/services/mobile-service" className="text-blue-600 hover:underline font-semibold">
                      Learn More &rarr;
                    </Link>
                  </div>

                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">ADAS Calibration</h3>
                    <p className="text-blue-600 font-bold text-2xl mb-3">Professional Calibration</p>
                    <p className="text-gray-700 mb-4">
                      Required for 2018+ vehicles with advanced safety features.
                    </p>
                    <Link href="/services/adas-calibration" className="text-blue-600 hover:underline font-semibold">
                      Learn More &rarr;
                    </Link>
                  </div>
                </div>
              </section>

              {/* Hail Season Yellow Box */}
              <section className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-yellow-600" />
                  Louisville Hail &amp; Storm Season Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Louisville is no stranger to severe weather. From Front Range hailstorms to the kind of extreme wind events that fueled the Marshall Fire, Louisville windshields take a beating from Mother Nature. After weather damage:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Act Fast:</strong> Small chips can spread into large cracks with Louisville&apos;s dramatic daily temperature swings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Insurance Coverage:</strong> Comprehensive coverage typically covers weather damage for the price of your deductible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Quick Response:</strong> We serve Louisville with fast mobile service throughout the year, including rapid post-storm response</span>
                  </li>
                </ul>
              </section>

              {/* Customer Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  What Louisville Customers Say
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Kevin P.',
                      neighborhood: 'Steel Ranch',
                      rating: 5,
                      text: 'A rock from a construction truck on US-36 cracked my windshield on the way home. Pink Auto Glass came to Steel Ranch the next morning, handled my insurance, and had it done in under two hours. Excellent service.'
                    },
                    {
                      name: 'Lisa M.',
                      neighborhood: 'Old Town Louisville',
                      rating: 5,
                      text: 'Living in Old Town means potholes are just part of life. When one finally cracked my windshield, Pink Auto Glass met me at the downtown library parking lot and took care of everything. So convenient!'
                    },
                    {
                      name: 'James W.',
                      neighborhood: 'Coal Creek Ranch',
                      rating: 5,
                      text: 'After the big hailstorm last summer, they got to our house in Coal Creek Ranch within 24 hours. Professional, honest pricing, and the new windshield looks perfect. Will definitely use them again.'
                    }
                  ].map((review, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-3">
                        <div className="flex text-yellow-400">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-current" />
                          ))}
                        </div>
                        <span className="ml-3 text-gray-600 text-sm">&bull; {review.neighborhood}</span>
                      </div>
                      <p className="text-gray-700 mb-2">&ldquo;{review.text}&rdquo;</p>
                      <p className="text-gray-900 font-semibold">- {review.name}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ Accordions */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Common Questions from Louisville Customers
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                      <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                        {faq.question}
                        <span className="text-pink-600 group-open:rotate-180 transition-transform">&#9660;</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              {/* CTA Section */}
              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Louisville?</h2>
                <p className="text-xl mb-6 text-pink-100">
                  Same-day mobile service anywhere in Louisville. Call now for a free quote.
                </p>
                <CTAButtons source="louisville-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Contact */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Louisville Now</h3>
                  <div className="space-y-3">
                    <a
                      href="tel:+17209187465"
                      className="flex items-center justify-center w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      (720) 918-7465
                    </a>
                    <Link
                      href="/book"
                      className="flex items-center justify-center w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Book Online
                    </Link>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Mon-Sat: 7am - 7pm</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Mobile Service - All Louisville</span>
                    </div>
                  </div>
                </div>

                {/* Google Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Louisville" state="CO" />
                </div>

                {/* Nearby Locations */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/locations/lafayette-co" className="text-pink-600 hover:underline">
                        Lafayette, CO &rarr;
                      </Link>
                    </li>
                    <li>
                      <Link href="/locations/superior-co" className="text-pink-600 hover:underline">
                        Superior, CO &rarr;
                      </Link>
                    </li>
                    <li>
                      <Link href="/locations/boulder-co" className="text-pink-600 hover:underline">
                        Boulder, CO &rarr;
                      </Link>
                    </li>
                    <li>
                      <Link href="/locations/broomfield-co" className="text-pink-600 hover:underline">
                        Broomfield, CO &rarr;
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Popular Vehicles */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Louisville</h3>
                  <p className="text-sm text-gray-600 mb-3">Vehicle-specific pricing:</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/vehicles/subaru-outback-windshield-replacement-denver" className="text-pink-600 hover:underline">
                        Subaru Outback &rarr;
                      </Link>
                    </li>
                    <li>
                      <Link href="/vehicles/toyota-rav4-windshield-replacement-denver" className="text-pink-600 hover:underline">
                        Toyota RAV4 &rarr;
                      </Link>
                    </li>
                    <li>
                      <Link href="/vehicles/honda-cr-v-windshield-replacement-denver" className="text-pink-600 hover:underline">
                        Honda CR-V &rarr;
                      </Link>
                    </li>
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
