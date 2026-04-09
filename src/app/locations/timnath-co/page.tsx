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
  title: 'Windshield Replacement Timnath CO | Mobile, $0 Deductible',
  description: 'Mobile windshield replacement & repair in Timnath CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair timnath, windshield replacement timnath, auto glass timnath co, mobile windshield service timnath colorado, larimer county auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/timnath-co',
  },
  openGraph: {
    title: 'Windshield Replacement Timnath CO | Mobile, $0 Deductible',
    description: 'Mobile windshield replacement & repair in Timnath CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/timnath-co',
    type: 'website',
  },
};

export default function TimnathLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Timnath?',
      answer: 'Yes! Mobile service is our specialty in Timnath. We come to your home, office, or anywhere in the Timnath area. Whether you\'re in Timnath Ranch, Wildwing, Landmark, or anywhere else in Timnath, we\'ll come to you with our fully equipped mobile units.'
    },
    {
      question: 'How quickly can you replace a windshield in Timnath?',
      answer: 'We offer same-day windshield replacement throughout Timnath. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'Does insurance cover windshield replacement in Timnath?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement for the price of your deductible. We work with all major insurance companies and assist with filing all paperwork for Timnath residents.'
    },
    {
      question: 'Do you handle ADAS calibration for newer vehicles in Timnath?',
      answer: 'Absolutely. Many vehicles from 2018 and newer require ADAS (Advanced Driver Assistance Systems) calibration after a windshield replacement. We provide professional calibration and full documentation for Timnath customers.'
    },
    {
      question: 'Why does Timnath seem to have so much windshield damage compared to other towns?',
      answer: 'Timnath is the fastest-growing town in Larimer County, and that explosive growth means road infrastructure is perpetually under construction. New subdivisions are going up constantly, construction vehicles are on every road, and freshly graded surfaces shed loose gravel for months. Add I-25 semi traffic, eastern plains winds gusting 50+ mph, and Cache la Poudre gravel deposits, and Timnath drivers face a uniquely high rate of windshield damage compared to more established communities.'
    },
    {
      question: 'With Timnath\'s growth, do you have experience working with a wide range of newer vehicle models?',
      answer: 'Absolutely. Our technicians are continuously trained on the latest vehicle technologies and windshield designs, ensuring we can expertly service all new models hitting the road in Timnath. We use high-quality glass and proper installation techniques for every replacement.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Timnath',
    state: 'CO',
    zipCode: '80547',
    latitude: 40.5286,
    longitude: -104.9864,
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Timnath, CO', url: 'https://pinkautoglass.com/locations/timnath-co' }
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
                <span className="text-xl">Timnath, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Timnath&apos;s Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Timnath\'s rapid expansion means drivers frequently encounter construction zones and exposure to I-25, leading to various types of windshield damage. The blend of new development and adjacent rural areas creates a dynamic environment for auto glass challenges.
              </p>
              <CTAButtons source="timnath-hero" />
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
              { label: 'Timnath, CO', href: '/locations/timnath-co' }
            ]}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Why Timnath Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Timnath Residents Choose Pink Auto Glass
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Timnath is the fastest-growing town in Larimer County -- a once-quiet agricultural community of roughly 8,000 residents that has exploded with master-planned subdivisions like Timnath Ranch, Wildwing, and Landmark. Sitting at 4,934 feet just east of Fort Collins along the I-25 corridor, Timnath offers brand-new homes, excellent schools, and easy access to Northern Colorado. But that breakneck growth comes with a serious cost to your windshield. Road infrastructure is perpetually under construction, with new subdivisions, road widenings, and utility installations creating loose gravel and construction debris on virtually every major route. Add I-25 semi traffic, eastern plains winds gusting 50+ mph, and Cache la Poudre River gravel deposits, and Timnath drivers face windshield damage at rates far above the state average.
                </p>

                <AboveFoldCTA location="location-timnath" />

              {/* Windshield Damage in Timnath */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Timnath
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Gravel and debris from widespread construction projects throughout Timnath.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Rocks kicked up by high-speed traffic on nearby I-25.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Agricultural debris from the remaining farmlands and adjacent rural roads.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Hailstorms, a common and damaging weather event for Northern Colorado.</span>
                  </li>
                </ul>
              </section>

                <p className="text-lg text-gray-700 mb-4">
                  We understand Timnath&apos;s growing pains. Whether you&apos;re commuting to Fort Collins or Denver on I-25, running errands along the rapidly expanding Harmony Road commercial corridor, enjoying the trails around Timnath Reservoir, or just navigating the maze of construction zones between subdivisions, your windshield is constantly under assault. That&apos;s why we bring our mobile service directly to you -- whether you&apos;re in the established homes of Timnath Ranch and Summerfields, the newer communities of Wildwing and Landmark, or anywhere else in this fast-growing town. No shop visit required.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Timnath Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>I-25 Semi Traffic:</strong> Timnath sits right along I-25, one of Colorado&apos;s busiest interstate corridors. Semi trucks and commercial vehicles traveling at highway speed throw rocks and road debris with tremendous force, making rock chips a daily hazard for Timnath commuters.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Rapid Subdivision Construction:</strong> With new neighborhoods constantly breaking ground, construction vehicles -- dump trucks, concrete mixers, graders -- are everywhere in Timnath. They track mud and gravel onto finished roads, drop debris, and create the loose-surface conditions that generate windshield chips.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Eastern Plains 50+ mph Wind:</strong> Unlike towns sheltered by the foothills, Timnath sits on the open plains where nothing breaks the wind. Sustained gusts exceeding 50 mph launch gravel, construction debris, and agricultural dust into windshields with damaging force.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Harmony Road Commercial Expansion:</strong> Harmony Road through Timnath is undergoing massive commercial development. Widening projects, new shopping centers, and utility work create miles of construction zones with loose gravel and uneven pavement.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Plains Freeze-Thaw Cycles:</strong> At 4,934 feet on the open plains, Timnath experiences dramatic temperature swings without the moderating effect of nearby mountains. Overnight freezes followed by warm afternoons turn small chips into spreading cracks within hours.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Cache la Poudre Gravel Deposits:</strong> The Poudre River corridor deposits sand and gravel across Timnath-area roads, especially during spring runoff. This loose material gets kicked up by traffic and creates a persistent source of windshield-damaging projectiles.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  Our technicians know Timnath&apos;s construction landscape inside and out. Whether your chip came from a semi on I-25, a dump truck near a new subdivision, or wind-driven gravel on Timnath Parkway, we provide fast, professional repair before Colorado&apos;s temperature extremes make it worse. Same-day mobile service throughout all Timnath neighborhoods and surrounding areas.
                </p>
              </section>

              {/* Driving Tips & Local Info */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Timnath Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">I-25 commuter traffic and constant subdivision construction generate frequent chips. We coordinate safe curbside service in Timnath Ranch, Wildwing, Landmark, and all Timnath neighborhoods.</p>
                <div className="space-y-4 text-gray-700 mb-6">
                  <div>
                    <h3 className="font-semibold">Can you access the newer subdivisions still under construction?</h3>
                    <p>Yes -- we regularly serve homes in active construction zones throughout Timnath. Share your address and we&apos;ll coordinate the best spot for safe service, even if your street is brand new.</p>
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
                  Timnath Neighborhoods We Serve
                </h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Timnath Ranch', 'Wildwing', 'Summerfields',
                    'Landmark', 'Timnath Lakes', 'The Retreat at Timnath Ranch',
                    'Reserve at Timnath Ranch', 'Rendezvous', 'Prairie Star',
                    'Owl Ridge', 'Harmony Commons', 'Fossil Lake Ranch',
                    'Registry Ridge', 'Timnath South', 'Patterson Road'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don&apos;t see your neighborhood? We serve all of Timnath - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              {/* Our Services */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Services in Timnath
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
                      We come to you anywhere in Timnath. Home, office, or curbside service available.
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
                  Northern Colorado Hail Season Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Timnath sits in the heart of Northern Colorado&apos;s hail corridor. Severe thunderstorms from March through August regularly produce damaging hail, and the open plains offer no shelter. After weather damage:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Act Fast:</strong> Small chips can spread into large cracks with Timnath&apos;s extreme plains temperature fluctuations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Insurance Coverage:</strong> Comprehensive coverage typically covers weather damage for the price of your deductible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Quick Response:</strong> We serve Timnath with fast mobile service throughout the year, including rapid post-storm response</span>
                  </li>
                </ul>
              </section>

              {/* Customer Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  What Timnath Customers Say
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Chris B.',
                      neighborhood: 'Wildwing',
                      rating: 5,
                      text: 'A semi on I-25 kicked up a rock that cracked my windshield on my morning commute. Pink Auto Glass came to my house in Wildwing that afternoon and had it replaced before dinner. Outstanding service.'
                    },
                    {
                      name: 'Amanda R.',
                      neighborhood: 'Timnath Ranch',
                      rating: 5,
                      text: 'Construction trucks are everywhere in Timnath and my windshield finally paid the price. They came right to my driveway, handled the insurance claim, and the new glass looks perfect. Will definitely recommend to neighbors.'
                    },
                    {
                      name: 'Steve H.',
                      neighborhood: 'Landmark',
                      rating: 5,
                      text: 'Got caught in a hailstorm on Harmony Road. They responded fast, came out to Landmark the next morning, and calibrated my lane-departure camera after the replacement. Professional from start to finish.'
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
                  Common Questions from Timnath Customers
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
                  <Link href="/locations/fort-collins-co" className="text-pink-600 hover:underline font-medium">Fort Collins</Link>
                  <Link href="/locations/windsor-co" className="text-pink-600 hover:underline font-medium">Windsor</Link>
                  <Link href="/locations/loveland-co" className="text-pink-600 hover:underline font-medium">Loveland</Link>
                  <Link href="/locations/wellington-co" className="text-pink-600 hover:underline font-medium">Wellington</Link>
                  <Link href="/locations/greeley-co" className="text-pink-600 hover:underline font-medium">Greeley</Link>
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Timnath?</h2>
                <p className="text-xl mb-6 text-pink-100">
                  Same-day mobile service anywhere in Timnath. Call now for a free quote.
                </p>
                <CTAButtons source="timnath-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Contact */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Timnath Now</h3>
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
                      <span>Mobile Service - All Timnath</span>
                    </div>
                  </div>
                </div>

                {/* Google Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Timnath" state="CO" />
                </div>

                {/* Nearby Locations */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/locations/fort-collins-co" className="text-pink-600 hover:underline">
                        Fort Collins, CO &rarr;
                      </Link>
                    </li>
                    <li>
                      <Link href="/locations/windsor-co" className="text-pink-600 hover:underline">
                        Windsor, CO &rarr;
                      </Link>
                    </li>
                    <li>
                      <Link href="/locations/loveland-co" className="text-pink-600 hover:underline">
                        Loveland, CO &rarr;
                      </Link>
                    </li>
                    <li>
                      <Link href="/locations/johnstown-co" className="text-pink-600 hover:underline">
                        Johnstown, CO &rarr;
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Popular Vehicles */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Timnath</h3>
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
