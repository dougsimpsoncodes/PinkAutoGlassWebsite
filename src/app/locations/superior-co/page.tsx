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
  title: 'Windshield Replacement Superior CO | Mobile, $0 Deductible',
  description: 'Mobile windshield replacement & repair in Superior CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair superior, windshield replacement superior, auto glass superior co, mobile windshield service superior colorado, boulder county auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/superior-co',
  },
  openGraph: {
    title: 'Windshield Replacement Superior CO | Mobile, $0 Deductible',
    description: 'Mobile windshield replacement & repair in Superior CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/superior-co',
    type: 'website',
  },
};

export default function SuperiorLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Superior?',
      answer: 'Yes! Mobile service is our specialty in Superior. We come to your home, office, or anywhere in the Superior area. Whether you\'re in Rock Creek Ranch, Anthem, Sagamore, or anywhere else in Superior, we\'ll come to you with our fully equipped mobile units.'
    },
    {
      question: 'How quickly can you replace a windshield in Superior?',
      answer: 'We offer same-day windshield replacement throughout Superior. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'Does insurance cover windshield replacement in Superior?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement for the price of your deductible. We work with all major insurance companies and assist with filing all paperwork for Superior residents.'
    },
    {
      question: 'Do you handle ADAS calibration for newer vehicles in Superior?',
      answer: 'Absolutely. Many vehicles from 2018 and newer require ADAS (Advanced Driver Assistance Systems) calibration after a windshield replacement. We provide professional calibration and full documentation for Superior customers.'
    },
    {
      question: 'Is windshield damage worse in Superior because of the Marshall Fire rebuild?',
      answer: 'Unfortunately, yes. The December 2021 Marshall Fire destroyed over 1,000 homes in Superior and Louisville, and the community is still mid-rebuild years later. Construction vehicles -- dump trucks, concrete mixers, heavy haulers -- are a constant presence on Superior roads. They kick up gravel, drop debris, and create road damage that generates windshield chips at far higher rates than normal. We see significantly more windshield claims from Superior than from similarly-sized towns without active reconstruction.'
    },
    {
      question: 'Does Pink Auto Glass offer Advanced Driver-Assistance Systems (ADAS) calibration for newer vehicles in Superior?',
      answer: 'Yes, for newer vehicles common in Superior that are equipped with ADAS features like lane departure warning or automatic emergency braking, proper windshield replacement often requires camera recalibration. Our technicians are trained and equipped to perform precise ADAS calibration, ensuring your safety systems function correctly.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Superior',
    state: 'CO',
    zipCode: '80027',
    latitude: 39.9528,
    longitude: -105.1686,
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Superior, CO', url: 'https://pinkautoglass.com/locations/superior-co' }
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
                <span className="text-xl">Superior, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Superior&apos;s Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Superior residents commuting on US-36 to Boulder or Denver face the constant threat of road debris from high-speed traffic. As a newer, developing community, construction activity also adds to the risks your windshield encounters daily.
              </p>
              <CTAButtons source="superior-hero" />
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
              { label: 'Superior, CO', href: '/locations/superior-co' }
            ]}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Why Superior Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Superior Residents Choose Pink Auto Glass
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Superior is a Boulder County community of roughly 14,000 residents situated at 5,380 feet on the mesa between Boulder and Broomfield. Known for its master-planned neighborhoods like Rock Creek Ranch, Anthem, and Sagamore, Superior offers top-rated schools, open space trails, and quick access to US-36. But Superior is also a community mid-rebuild. The devastating Marshall Fire of December 2021 destroyed over 1,000 homes here and in neighboring Louisville, and the reconstruction effort continues years later. That means construction vehicles are everywhere -- dump trucks, concrete mixers, and heavy haulers that kick up gravel and debris on every major road. Combined with high-speed US-36 strikes, exposed mesa wind corridors, and extreme temperature swings, Superior windshields face relentless punishment.
                </p>

                <AboveFoldCTA location="location-superior" />

              {/* Windshield Damage in Superior */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Superior
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Rocks and debris from fast-moving vehicles on US-36.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Construction materials from ongoing residential and commercial expansion.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Severe hailstorms, which frequently impact Boulder County.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>High winds prevalent in the Front Range, kicking up various road debris.</span>
                  </li>
                </ul>
              </section>

                <p className="text-lg text-gray-700 mb-4">
                  We understand what Superior is going through. Whether you&apos;re living in one of the rebuilt homes in Sagamore, commuting from Rock Creek Ranch to Denver on US-36, walking the trails around Rock Creek, dropping kids at Eldorado K-8, or exploring the new Downtown Superior development, your windshield is at risk from construction debris and road hazards every day. That&apos;s why we bring our mobile service directly to you -- whether you&apos;re in the established neighborhoods of Saddlebrooke and The Hamlet, the newer communities of Anthem and Lanterns, or anywhere else in Superior. No shop visit required.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Superior Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Marshall Fire Burn Scar Debris:</strong> The 2021 Marshall Fire left behind acres of disturbed, destabilized land. Wind picks up ash, loose soil, and construction debris from rebuild sites and carries it across Superior&apos;s roads, pelting windshields with abrasive material.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>US-36 High-Speed Strikes:</strong> Superior sits right along the US-36 corridor where vehicles travel 65-75 mph. Rocks and debris launched at these speeds cause instant windshield damage, and the sheer volume of traffic makes it nearly impossible to avoid.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Master-Planned Construction:</strong> Even beyond the Marshall Fire rebuild, Superior has ongoing subdivision development. New road construction, grading, and utility work create loose gravel and debris that gets tracked onto finished roads.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Exposed Mesa Wind Corridor:</strong> Superior sits on an open mesa with minimal natural wind breaks. Sustained winds channel across the flat terrain, reaching speeds that launch loose construction materials, gravel, and debris into windshields with force.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>New Road Surfaces:</strong> Freshly paved roads throughout the rebuild areas shed loose aggregate for months after completion. Until traffic fully compacts these surfaces, every vehicle ahead of you is a potential source of windshield-damaging stones.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Extreme Temperature Swings:</strong> At 5,380 feet on an exposed mesa, Superior experiences some of the Front Range&apos;s most dramatic temperature swings -- 50-60 degree shifts in a single day are not uncommon, turning small chips into spreading cracks within hours.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  Our technicians know Superior&apos;s current landscape -- the active rebuild zones, the construction traffic patterns, and the roads most prone to debris. Whether your chip came from a dump truck on McCaslin, a rock kicked up on US-36, or wind-driven debris from a burn scar area, we provide fast, professional repair before Colorado&apos;s temperature extremes make it worse. Same-day mobile service throughout all Superior neighborhoods.
                </p>
              </section>

              {/* Driving Tips & Local Info */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Superior Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">Marshall Fire reconstruction and US-36 commuter traffic generate frequent chips. We coordinate safe curbside service in Rock Creek Ranch, Anthem, Sagamore, and all Superior neighborhoods.</p>
                <div className="space-y-4 text-gray-700 mb-6">
                  <div>
                    <h3 className="font-semibold">Can you access the Marshall Fire rebuild areas?</h3>
                    <p>Yes -- we regularly serve homes in active reconstruction zones and understand the access logistics. Share your address and we&apos;ll coordinate the best meeting point for safe service.</p>
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
                  Superior Neighborhoods We Serve
                </h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Rock Creek Ranch', 'Saddlebrooke', 'Sagamore',
                    'The Hamlet', 'Signature at Rock Creek', 'Anthem',
                    'Lanterns', 'Copper Ranch', 'Palo Park',
                    'Rock Creek North', 'Aspen Meadows', 'Creekside at Rock Creek',
                    'Prairie Center', 'Coalton Commons', 'Downtown Superior'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don&apos;t see your neighborhood? We serve all of Superior - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              {/* Our Services */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Services in Superior
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
                      We come to you anywhere in Superior. Home, office, or curbside service available.
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
                  Superior Weather &amp; Fire Recovery Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Superior residents know extreme weather firsthand. From the Marshall Fire&apos;s 100+ mph winds to Front Range hailstorms, your windshield faces year-round threats. After weather damage:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Act Fast:</strong> Small chips can spread into large cracks with Superior&apos;s extreme daily temperature swings on the exposed mesa</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Insurance Coverage:</strong> Comprehensive coverage typically covers weather damage for the price of your deductible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Quick Response:</strong> We serve Superior with fast mobile service throughout the year, including rapid post-storm response</span>
                  </li>
                </ul>
              </section>

              {/* Customer Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  What Superior Customers Say
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Rachel K.',
                      neighborhood: 'Rock Creek Ranch',
                      rating: 5,
                      text: 'A construction truck dropped gravel all over McCaslin and I got a huge chip. Pink Auto Glass came to my driveway in Rock Creek Ranch that same afternoon. Fast, professional, and they made the insurance process painless.'
                    },
                    {
                      name: 'Dan S.',
                      neighborhood: 'Anthem',
                      rating: 5,
                      text: 'We rebuilt after the Marshall Fire and our brand new car already has windshield damage from all the construction traffic. Pink Auto Glass handled everything quickly and the quality is excellent. Sadly, I know I\'ll need them again.'
                    },
                    {
                      name: 'Michelle T.',
                      neighborhood: 'Sagamore',
                      rating: 5,
                      text: 'Wind-blown debris cracked my windshield while it was parked in my own driveway. They came out the next morning, replaced it, and calibrated my safety cameras. Great service from start to finish.'
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
                  Common Questions from Superior Customers
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
              {/* Nearby Cities */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  We Also Serve Nearby
                </h2>
                <div className="flex flex-wrap gap-4">
                  <Link href="/locations/louisville-co" className="text-pink-600 hover:underline font-medium">Louisville</Link>
                  <Link href="/locations/broomfield-co" className="text-pink-600 hover:underline font-medium">Broomfield</Link>
                  <Link href="/locations/lafayette-co" className="text-pink-600 hover:underline font-medium">Lafayette</Link>
                  <Link href="/locations/boulder-co" className="text-pink-600 hover:underline font-medium">Boulder</Link>
                  <Link href="/locations/westminster-co" className="text-pink-600 hover:underline font-medium">Westminster</Link>
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Superior?</h2>
                <p className="text-xl mb-6 text-pink-100">
                  Same-day mobile service anywhere in Superior. Call now for a free quote.
                </p>
                <CTAButtons source="superior-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Contact */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Superior Now</h3>
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
                      <span>Mobile Service - All Superior</span>
                    </div>
                  </div>
                </div>

                {/* Google Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Superior" state="CO" />
                </div>

                {/* Nearby Locations */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/locations/louisville-co" className="text-pink-600 hover:underline">
                        Louisville, CO &rarr;
                      </Link>
                    </li>
                    <li>
                      <Link href="/locations/broomfield-co" className="text-pink-600 hover:underline">
                        Broomfield, CO &rarr;
                      </Link>
                    </li>
                    <li>
                      <Link href="/locations/boulder-co" className="text-pink-600 hover:underline">
                        Boulder, CO &rarr;
                      </Link>
                    </li>
                    <li>
                      <Link href="/locations/westminster-co" className="text-pink-600 hover:underline">
                        Westminster, CO &rarr;
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Popular Vehicles */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Superior</h3>
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
