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
  title: 'Windshield Repair & Replacement Manitou Springs, CO | Pink Auto Glass',
  description: 'Professional windshield repair and replacement in Manitou Springs, Colorado. Mobile service for Pikes Peak area residents. Same-day appointments in El Paso County. Call (720) 918-7465 for a free quote.',
  keywords: 'windshield repair manitou springs, windshield replacement manitou springs, auto glass manitou springs co, mobile windshield service manitou springs colorado, pikes peak auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/manitou-springs-co',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Manitou Springs, CO | Pink Auto Glass',
    description: 'Manitou Springs\' trusted auto glass experts. Mobile service, same-day appointments, lifetime warranty.',
    url: 'https://pinkautoglass.com/locations/manitou-springs-co',
    type: 'website',
  },
};

export default function ManitouSpringsLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Manitou Springs?',
      answer: 'Yes! Mobile service is our specialty in Manitou Springs. We come to your home, office, or anywhere in the Manitou Springs area. Whether you\'re in Old Town, Crystal Park, Ruxton Park, or anywhere else in Manitou Springs, we\'ll come to you with our fully equipped mobile units.'
    },
    {
      question: 'How quickly can you replace a windshield in Manitou Springs?',
      answer: 'We offer same-day windshield replacement throughout Manitou Springs. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'Does insurance cover windshield replacement in Manitou Springs?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement for the price of your deductible. We work with all major insurance companies and assist with filing all paperwork for Manitou Springs residents.'
    },
    {
      question: 'Do you handle ADAS calibration for newer vehicles in Manitou Springs?',
      answer: 'Absolutely. Many vehicles from 2018 and newer require ADAS (Advanced Driver Assistance Systems) calibration after a windshield replacement. We provide professional calibration and full documentation for Manitou Springs customers.'
    },
    {
      question: 'Does driving on Pikes Peak Highway really damage windshields?',
      answer: 'Yes, the Pikes Peak Highway is one of the most demanding roads in Colorado for windshield glass. Sections of the road feature loose gravel, and vehicles ascending and descending kick stones at close range on the narrow switchbacks. Canyon rockfall from the surrounding walls adds another hazard. The extreme elevation change -- from 7,400 feet at the gate to 14,115 feet at the summit -- also creates dramatic temperature swings that stress glass. Manitou Springs is the only city where residents routinely drive on the Pikes Peak Hill Climb course as part of daily life, and we see the windshield damage to prove it.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Manitou Springs',
    state: 'CO',
    zipCode: '80829',
    latitude: 38.8586,
    longitude: -104.9175,
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Manitou Springs, CO', url: 'https://pinkautoglass.com/locations/manitou-springs-co' }
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
                <span className="text-xl">Manitou Springs, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Manitou Springs&apos; Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service &bull; Same-Day Appointments &bull; Lifetime Warranty
              </p>
              <CTAButtons source="manitou-springs-hero" />
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
              { label: 'Manitou Springs, CO', href: '/locations/manitou-springs-co' }
            ]}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Why Manitou Springs Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Manitou Springs Residents Choose Pink Auto Glass
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Manitou Springs is unlike any other city in Colorado. Tucked into a canyon at the base of Pikes Peak at 6,320 feet elevation, this historic arts community of roughly 5,800 residents is the only city where people drive on the legendary Pikes Peak Hill Climb course as part of daily life. The town&apos;s dramatic setting is stunning -- but it&apos;s also uniquely punishing on windshields. Canyon walls shed rockfall onto narrow roads, the Pikes Peak Highway&apos;s gravel sections throw stones at close range, and flash floods carry debris through town with little warning. Add extreme 50-60 degree temperature swings between sun-baked canyon floors and shaded mountain roads, tourist traffic on streets never designed for modern volume, and canyon-funneled hailstorms, and Manitou Springs windshields face challenges found nowhere else on the Front Range.
                </p>

                <AboveFoldCTA location="location-manitou-springs" />

                <p className="text-lg text-gray-700 mb-4">
                  We understand Manitou Springs life. Whether you&apos;re navigating the tight switchbacks of Ruxton Avenue to the Cog Railway, shopping along Manitou Avenue in Old Town, commuting to Colorado Springs on US-24, exploring Red Rock Canyon, or heading up Pikes Peak for a weekend drive, your windshield is constantly at risk. That&apos;s why we bring our mobile service directly to you -- whether you&apos;re in the historic homes along Serpentine Drive, the hillside community of Crystal Park, the canyon neighborhoods of Iron Springs and Beckers Lane, or anywhere else in this one-of-a-kind mountain town. No shop visit required.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Manitou Springs Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Pikes Peak Highway Gravel Sections:</strong> The road to the 14,115-foot summit includes unpaved stretches where vehicles ahead kick up rocks at close range on narrow switchbacks. Even a single trip up the peak can chip your windshield, and Manitou Springs residents make the drive regularly.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Rockfall from Canyon Walls:</strong> Manitou Springs sits in a narrow canyon surrounded by steep rock formations. Freeze-thaw cycles loosen rock from the canyon walls, sending stones onto roadways below. Ruxton Avenue, Serpentine Drive, and Cave of the Winds Road are particularly prone to rockfall.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Extreme 50-60 Degree Temperature Swings:</strong> The canyon microclimate creates dramatic daily temperature shifts. Sun-baked canyon floors can be 60+ degrees warmer than shaded mountain roads just minutes away. These rapid swings cause small chips to propagate into full cracks faster than anywhere else in the region.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Tourist Traffic on Narrow Roads:</strong> Manitou Springs draws over 2 million visitors annually to Pikes Peak, the Incline, Cave of the Winds, and Garden of the Gods. The resulting traffic on roads designed for a fraction of this volume leads to fender-benders, kicked-up debris, and parking lot mishaps.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Flash Flood Debris:</strong> Manitou Springs is built in a narrow canyon that channels water during storms. Flash floods wash rocks, gravel, and debris across roadways with little warning, creating sudden windshield hazards. The 2013 Waldo Canyon flood devastation is still fresh in local memory.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Canyon-Funneled Hailstorms:</strong> The canyon geography concentrates and channels severe weather directly through town. Hailstorms that might scatter across open plains instead funnel through the canyon with concentrated force, battering vehicles parked along narrow streets with limited cover.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  Our technicians know Manitou Springs&apos; unique terrain. Whether your chip came from gravel on Pikes Peak Highway, rockfall on Ruxton Avenue, or flood debris on Manitou Avenue, we provide fast, professional repair before the canyon&apos;s extreme temperature swings make it worse. Same-day mobile service throughout all Manitou Springs neighborhoods, from Old Town to Crystal Park.
                </p>
              </section>

              {/* Driving Tips & Local Info */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Manitou Springs Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">Pikes Peak Highway gravel, canyon rockfall, and narrow tourist-heavy streets generate frequent chips. We coordinate safe service throughout Old Town, Crystal Park, Ruxton, and all Manitou Springs neighborhoods.</p>
                <div className="space-y-4 text-gray-700 mb-6">
                  <div>
                    <h3 className="font-semibold">Can you service the narrow hillside streets in Manitou Springs?</h3>
                    <p>Yes -- we&apos;re experienced with Manitou&apos;s tight streets and steep driveways. Share your address and we&apos;ll coordinate the best accessible spot nearby. We service Crystal Park, Serpentine Drive, and all canyon-side neighborhoods regularly.</p>
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
                  Manitou Springs Neighborhoods We Serve
                </h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Old Town Manitou Springs', 'Crystal Park', 'Ruxton Park',
                    'Iron Springs', 'Beckers Lane', 'Serpentine Drive',
                    'Villa Mora', 'Spa Meadows', 'Red Rock Canyon',
                    'El Paso Blvd', 'Soda Springs', 'Cave of the Winds Road',
                    'Promontory Pointe', 'Ute Pass Corridor', 'Wittles'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don&apos;t see your neighborhood? We serve all of Manitou Springs - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              {/* Our Services */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Services in Manitou Springs
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
                      We come to you anywhere in Manitou Springs. Home, office, or curbside service available.
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
                  Canyon Weather &amp; Hail Season Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Manitou Springs&apos; canyon geography funnels severe weather directly through town, concentrating hail and wind with devastating effect. Unlike open plains communities, there is little room to maneuver or find shelter on Manitou&apos;s narrow streets. After weather damage:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Act Fast:</strong> Small chips can spread into large cracks within hours due to Manitou&apos;s extreme canyon temperature swings between sun and shade</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Insurance Coverage:</strong> Comprehensive coverage typically covers weather damage for the price of your deductible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Quick Response:</strong> We serve Manitou Springs with fast mobile service throughout the year, including rapid post-storm response</span>
                  </li>
                </ul>
              </section>

              {/* Customer Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  What Manitou Springs Customers Say
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Robert C.',
                      neighborhood: 'Old Town Manitou Springs',
                      rating: 5,
                      text: 'A rock from Pikes Peak Highway cracked my windshield on the way back down. Pink Auto Glass came to my house on Manitou Avenue the next morning and replaced it while I had coffee at the Mate Factor. Seamless experience.'
                    },
                    {
                      name: 'Angela P.',
                      neighborhood: 'Crystal Park',
                      rating: 5,
                      text: 'Living in Crystal Park means rockfall is a constant hazard. They came all the way up our mountain road, handled the insurance, and had the new windshield installed in under two hours. Truly impressed with the service.'
                    },
                    {
                      name: 'Mark D.',
                      neighborhood: 'Ruxton Park',
                      rating: 5,
                      text: 'Canyon-funneled hail got my car parked on Ruxton Avenue. They responded quickly, came out the next day, and even calibrated my forward-collision system. Outstanding work for a small mountain town.'
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
                  Common Questions from Manitou Springs Customers
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Manitou Springs?</h2>
                <p className="text-xl mb-6 text-pink-100">
                  Same-day mobile service anywhere in Manitou Springs. Call now for a free quote.
                </p>
                <CTAButtons source="manitou-springs-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Contact */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Manitou Springs Now</h3>
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
                      <span>Mobile Service - All Manitou Springs</span>
                    </div>
                  </div>
                </div>

                {/* Google Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Manitou Springs" state="CO" />
                </div>

                {/* Nearby Locations */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/locations/colorado-springs-co" className="text-pink-600 hover:underline">
                        Colorado Springs, CO &rarr;
                      </Link>
                    </li>
                    <li>
                      <Link href="/locations/castle-rock-co" className="text-pink-600 hover:underline">
                        Castle Rock, CO &rarr;
                      </Link>
                    </li>
                    <li>
                      <Link href="/locations/fountain-co" className="text-pink-600 hover:underline">
                        Fountain, CO &rarr;
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Popular Vehicles */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Manitou Springs</h3>
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
