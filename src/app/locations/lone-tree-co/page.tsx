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
  title: 'Windshield Replacement Lone Tree CO | Mobile, $0 Deductible',
  description: 'Mobile windshield replacement & repair in Lone Tree CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair lone tree, windshield replacement lone tree, auto glass lone tree co, mobile windshield service lone tree, auto glass ridgegate, park meadows windshield',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/lone-tree-co',
  },
  openGraph: {
    title: 'Windshield Replacement Lone Tree CO | Mobile, $0 Deductible',
    description: 'Mobile windshield replacement & repair in Lone Tree CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/lone-tree-co',
    type: 'website',
  },
};

export default function LoneTreeLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Lone Tree?',
      answer: 'Yes! Mobile service is our specialty in Lone Tree. We come to your home, office, or anywhere in the city. Whether you\'re at RidgeGate, near Park Meadows, in Heritage Hills, or at the Sky Ridge Medical Center area, our fully equipped mobile units will meet you wherever is most convenient.'
    },
    {
      question: 'How quickly can you replace a windshield in Lone Tree?',
      answer: 'We offer same-day windshield replacement throughout Lone Tree. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What Lone Tree neighborhoods do you serve?',
      answer: 'We serve all of Lone Tree including: RidgeGate, Acres Green, Heritage Hills, Fairway Ridge, Lone Tree Golf Club Estates, Carriage Club, Pronghorn, Meyers Ranch, Wildcat Ridge, Lincoln Commons, Sky Ridge, Village at Lone Tree, and every other Lone Tree neighborhood. If you\'re anywhere in Lone Tree, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Lone Tree?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Lone Tree residents.'
    },
    {
      question: 'Why is windshield damage so common in Lone Tree?',
      answer: 'Lone Tree sits at the C-470/E-470/I-25 interchange triangle at 5,950 feet elevation -- one of the highest communities in the south metro. The combination of high-speed interchange traffic, elevation-driven wind and temperature extremes, and massive exposed parking lots like Park Meadows makes windshield damage extremely common here.'
    },
    {
      question: 'Can Pink Auto Glass provide efficient service for a mobile windshield replacement while I\'m at work or shopping in Lone Tree?',
      answer: 'Absolutely. Our mobile service is ideal for your busy schedule in Lone Tree. We can come to your office in the business district, or even meet you at a location like Park Meadows while you shop or run errands, ensuring minimal interruption to your day.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Lone Tree',
    state: 'CO',
    zipCode: '80124',
    latitude: 39.5497,
    longitude: -104.8953,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Lone Tree, CO', url: 'https://pinkautoglass.com/locations/lone-tree-co' }
  ]);

  const combinedSchema = combineSchemas(localBusinessSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }} />

      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 page-top-padding">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 mr-2" />
                <span className="text-xl">Lone Tree, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Lone Tree&apos;s Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Drivers in Lone Tree navigate a bustling retail environment around Park Meadows and major highways like I-25 and E-470 daily. The high volume of traffic, combined with ongoing commercial development, creates a constant risk of windshield damage.
              </p>
              <CTAButtons source="lone-tree-co-hero" />
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
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Lone Tree, CO', href: '/locations/lone-tree-co' }]} />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Why Lone Tree Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Lone Tree Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Lone Tree is a thriving Douglas County community of about 15,000 residents, home to the sprawling RidgeGate development, Park Meadows mall, Sky Ridge Medical Center, and the Charles Schwab campus. At 5,950 feet elevation -- one of the highest communities in the south Denver metro -- Lone Tree sits at the strategic triangle where I-25, C-470, and E-470 converge. That means constant high-speed interchange traffic, airborne gravel, and some of the most punishing freeze-thaw cycles in the metro area.
                </p>

                <AboveFoldCTA location="location-lone-tree-co" />

              {/* Windshield Damage in Lone Tree */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Lone Tree
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Debris and rocks from high-speed traffic on I-25 and E-470.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Construction materials from continuous expansion in the commercial and residential areas.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Hailstorms, which frequently impact the southern Denver Metro region.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Parking lot incidents or accidental impacts near busy shopping centers.</span>
                  </li>
                </ul>
              </section>

              {/* Our Services */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Services in Lone Tree
                </h2>
                <p className="text-gray-700 mb-4">
                  We bring a full range of auto glass services directly to you in Lone Tree:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Link href="/services/windshield-replacement" className="bg-white border border-gray-200 rounded-lg p-3 hover:border-pink-300 hover:shadow-sm transition-all">
                    <span className="font-semibold text-gray-900">Windshield Replacement</span>
                    <span className="block text-sm text-gray-600">Full replacement with OEM glass</span>
                  </Link>
                  <Link href="/services/windshield-repair" className="bg-white border border-gray-200 rounded-lg p-3 hover:border-pink-300 hover:shadow-sm transition-all">
                    <span className="font-semibold text-gray-900">Chip & Crack Repair</span>
                    <span className="block text-sm text-gray-600">30-minute service, often $0</span>
                  </Link>
                  <Link href="/services/adas-calibration" className="bg-white border border-gray-200 rounded-lg p-3 hover:border-pink-300 hover:shadow-sm transition-all">
                    <span className="font-semibold text-gray-900">ADAS Calibration</span>
                    <span className="block text-sm text-gray-600">Camera recalibration after replacement</span>
                  </Link>
                  <Link href="/services/insurance-claims" className="bg-white border border-gray-200 rounded-lg p-3 hover:border-pink-300 hover:shadow-sm transition-all">
                    <span className="font-semibold text-gray-900">Insurance Claims</span>
                    <span className="block text-sm text-gray-600">We handle all paperwork — $0 often</span>
                  </Link>
                </div>
              </section>

                <p className="text-lg text-gray-700 mb-4">
                  We understand Lone Tree life. You&apos;re commuting on I-25 or C-470, working in the RidgeGate office parks, shopping at Park Meadows, or heading to Sky Ridge for an appointment. That&apos;s why we bring our fully equipped mobile units directly to you -- whether you&apos;re parked at your Heritage Hills home, at a Lincoln Avenue office, or in the massive Park Meadows parking lot. With Lone Tree&apos;s high concentration of late-model vehicles requiring ADAS calibration, our technicians are experienced with every make and model.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Lone Tree Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>C-470/E-470 Interchange Traffic:</strong> The C-470 and E-470 interchange near Lone Tree is one of the highest-speed junctions in the south metro. Lane merges, toll-road acceleration zones, and constant traffic throw gravel and road debris at windshields daily.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Elevation Wind at 5,950 Feet:</strong> Lone Tree&apos;s high elevation means stronger winds and more dramatic temperature swings than lower-lying suburbs. Wind-driven debris is a constant hazard, and small chips spread into full cracks faster here.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Front Range Hail Corridor:</strong> Douglas County regularly takes direct hits from severe hailstorms between April and August. The open terrain around Lone Tree offers little natural protection from approaching storm cells.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Park Meadows Exposed Parking:</strong> Park Meadows mall&apos;s enormous surface parking lots offer zero cover. Vehicles parked during shopping trips are fully exposed to hail, wind-driven debris, and the intense UV radiation at altitude.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Sky Ridge Hospital Traffic:</strong> The Sky Ridge Medical Center area generates heavy daily traffic on Ridge Gate Parkway and Lincoln Avenue. Emergency vehicles, patient transport, and visitor congestion create stop-and-go conditions where rock strikes are common.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>E-470 Toll Road Grit:</strong> E-470&apos;s high-speed traffic and heavy winter sanding create a year-round supply of road grit that chips windshields, especially during spring thaw when accumulated sand becomes airborne.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Driving Tips */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Lone Tree Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">
                  The I-25/C-470/E-470 triangle and Lincoln Avenue corridor generate the most windshield damage in Lone Tree. We bring mobile service to your home or office so you never have to rearrange your schedule.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">Can you come to the Park Meadows area?</h3>
                    <p>Yes. We service vehicles in the Park Meadows parking lots, RidgeGate offices, and all surrounding areas regularly. Just share your location and we&apos;ll meet you there.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Do you serve the new RidgeGate developments?</h3>
                    <p>Absolutely. We service all RidgeGate neighborhoods and businesses, including the newer sections still under development.</p>
                  </div>
                </div>
              </section>

              {/* Neighborhoods */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Lone Tree Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'RidgeGate', 'Acres Green', 'Heritage Hills',
                    'Retreat at Heritage Hills', 'Fairway Ridge', 'LT Golf Club Estates',
                    'Carriage Club', 'Pronghorn', 'Meyers Ranch',
                    'Wildcat Ridge', 'Oakwood Estates', 'Lincoln Commons',
                    'Sky Ridge', 'Village at Lone Tree', 'Remington'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don&apos;t see your neighborhood? We serve all of Lone Tree - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              {/* Services */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Lone Tree</h2>
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
                    <p className="text-gray-700 mb-4">Complete windshield replacement with OEM quality glass. ADAS calibration included for equipped vehicles.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Service</h3>
                    <p className="text-blue-600 font-bold text-2xl mb-3">No Extra Charge</p>
                    <p className="text-gray-700 mb-4">We come to your home, office, or Park Meadows parking lot. Skip the C-470 traffic.</p>
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

              {/* Hail Season */}
              <section className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-yellow-600" />
                  Lone Tree Hail Season Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Lone Tree and Douglas County regularly take direct hits from severe hailstorms. With Park Meadows&apos; massive exposed parking lots and limited covered parking throughout the city, hail damage is extremely common. After a hailstorm:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Act Fast:</strong> At 5,950 feet, extreme temperature swings cause chips to spread into full cracks within hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Insurance Covers It:</strong> Comprehensive coverage typically covers hail damage with zero deductible in Colorado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>We Come to You:</strong> Mobile service to your Lone Tree home or office -- no need to navigate the interchanges</span>
                  </li>
                </ul>
              </section>

              {/* Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Lone Tree Customers Say</h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Karen S.',
                      neighborhood: 'RidgeGate',
                      rating: 5,
                      text: 'Got a rock chip on C-470 and they came to my RidgeGate office the same afternoon. The repair was quick and invisible. So much better than driving to a shop during my workday.'
                    },
                    {
                      name: 'David H.',
                      neighborhood: 'Heritage Hills',
                      rating: 5,
                      text: 'Hail cracked our windshield while parked at Park Meadows. Pink Auto Glass replaced it at our Heritage Hills home, handled the insurance, and even calibrated the safety cameras. First class.'
                    },
                    {
                      name: 'Amanda R.',
                      neighborhood: 'Acres Green',
                      rating: 5,
                      text: 'E-470 gravel cracked my windshield. They came to Acres Green the next morning and replaced it with ADAS calibration included. Insurance covered everything. Highly recommend!'
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
                      <p className="text-gray-700 mb-2">&ldquo;{review.text}&rdquo;</p>
                      <p className="text-gray-900 font-semibold">- {review.name}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQs */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Lone Tree Customers</h2>
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

              {/* CTA */}
              {/* Nearby Cities */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  We Also Serve Nearby
                </h2>
                <div className="flex flex-wrap gap-4">
                  <Link href="/locations/highlands-ranch-co" className="text-pink-600 hover:underline font-medium">Highlands Ranch</Link>
                  <Link href="/locations/centennial-co" className="text-pink-600 hover:underline font-medium">Centennial</Link>
                  <Link href="/locations/parker-co" className="text-pink-600 hover:underline font-medium">Parker</Link>
                  <Link href="/locations/castle-rock-co" className="text-pink-600 hover:underline font-medium">Castle Rock</Link>
                  <Link href="/locations/englewood-co" className="text-pink-600 hover:underline font-medium">Englewood</Link>
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Lone Tree?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Lone Tree. Call now for a free quote.</p>
                <CTAButtons source="lone-tree-co-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Contact */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Lone Tree</h3>
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
                      <span>Mobile Service - All Lone Tree</span>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Lone Tree" state="CO" />
                </div>

                {/* Nearby Locations */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li><Link href="/locations/highlands-ranch-co" className="text-pink-600 hover:underline">Highlands Ranch, CO →</Link></li>
                    <li><Link href="/locations/centennial-co" className="text-pink-600 hover:underline">Centennial, CO →</Link></li>
                    <li><Link href="/locations/parker-co" className="text-pink-600 hover:underline">Parker, CO →</Link></li>
                    <li><Link href="/locations/castle-rock-co" className="text-pink-600 hover:underline">Castle Rock, CO →</Link></li>
                  </ul>
                </div>

                {/* Popular Vehicles */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Lone Tree</h3>
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
