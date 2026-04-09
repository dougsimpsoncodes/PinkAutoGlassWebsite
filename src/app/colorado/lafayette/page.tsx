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
  robots: { index: false }, // Phase 1: noindex during coexistence
  title: 'Windshield Replacement Lafayette CO | Mobile, $0 Deductible',
  description: 'Mobile windshield replacement & repair in Lafayette CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair lafayette, windshield replacement lafayette, auto glass lafayette co, mobile windshield service lafayette colorado, boulder county auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/colorado/lafayette/',
  },
  openGraph: {
    title: 'Windshield Replacement Lafayette CO | Mobile, $0 Deductible',
    description: 'Mobile windshield replacement & repair in Lafayette CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/colorado/lafayette/',
    type: 'website',
  },
};

export default function LafayetteLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Lafayette?',
      answer: 'Yes! Mobile service is our specialty in Lafayette. We come to your home, office, or anywhere in the Lafayette area. Whether you\'re near Old Town, Rock Creek Ranch, Indian Peaks, or anywhere else in Lafayette, we\'ll come to you with our fully equipped mobile units.'
    },
    {
      question: 'How quickly can you replace a windshield in Lafayette?',
      answer: 'We offer same-day windshield replacement throughout Lafayette. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'Does insurance cover windshield replacement in Lafayette?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement for the price of your deductible. We work with all major insurance companies and assist with filing all paperwork for Lafayette residents.'
    },
    {
      question: 'Do you handle ADAS calibration for newer vehicles in Lafayette?',
      answer: 'Absolutely. Many vehicles from 2018 and newer require ADAS (Advanced Driver Assistance Systems) calibration after a windshield replacement. We provide professional calibration and full documentation for Lafayette customers.'
    },
    {
      question: 'Are Lafayette\'s old brick streets really hard on windshields?',
      answer: 'Yes, Old Town Lafayette\'s historic brick-paved streets and aging infrastructure create persistent pothole and loose aggregate hazards. Combined with heavy US-287 truck traffic kicking up debris, windshield chips are extremely common for Lafayette drivers. We recommend prompt repair before temperature swings turn chips into full cracks.'
    },
    {
      question: 'With Lafayette\'s focus on sustainability, does Pink Auto Glass offer eco-friendly disposal of old windshields?',
      answer: 'Pink Auto Glass is committed to environmentally responsible practices, including the proper recycling and disposal of old windshields whenever possible. We strive to minimize our environmental footprint while providing top-notch auto glass services to the Lafayette community.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Lafayette',
    state: 'CO',
    zipCode: '80026',
    latitude: 39.9936,
    longitude: -105.0897,
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Lafayette, CO', url: 'https://pinkautoglass.com/colorado/lafayette/' }
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
                <span className="text-xl">Lafayette, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Lafayette&apos;s Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Lafayette\'s active community, with its proximity to Boulder and commuter routes like US-287, means vehicles are frequently exposed to varied road conditions. From busy suburban streets to high-altitude weather patterns, windshields face unique challenges.
              </p>
              <CTAButtons source="lafayette-hero" />
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
              { label: 'Lafayette, CO', href: '/colorado/lafayette/' }
            ]}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Why Lafayette Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Lafayette Residents Choose Pink Auto Glass
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Lafayette is a Boulder County gem where roughly 32,000 residents enjoy the best of both worlds: small-town charm and quick access to Boulder and Denver. Sitting at 5,236 feet along the US-287 corridor, Lafayette blends its coal-mining heritage with modern neighborhoods like Rock Creek Ranch and Indian Peaks. But that heritage comes with a cost to your windshield. Old Town Lafayette&apos;s brick-paved streets and aging coal-era infrastructure create persistent pothole and loose aggregate hazards that chip windshields year-round. Add in heavy US-287 truck traffic, Front Range winds gusting 40-60 mph, and Colorado&apos;s brutal freeze-thaw cycling, and it&apos;s no surprise that windshield damage is a fact of life here.
                </p>

                <AboveFoldCTA location="location-lafayette" />

              {/* Windshield Damage in Lafayette */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Lafayette
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Rocks and debris from heavy commuter traffic on US-287 and CO-7.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Hailstorms, a frequent occurrence in Boulder County, particularly in spring and summer.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Debris from nearby open spaces and recreational areas, including gravel and dirt.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Temperature fluctuations that can quickly turn small chips into extensive cracks.</span>
                  </li>
                </ul>
              </section>

                <p className="text-lg text-gray-700 mb-4">
                  We understand Lafayette life. Whether you&apos;re picking up groceries at the Waneka Lake shopping area, walking the trails along Coal Creek, grabbing dinner on Public Road in Old Town, commuting to Boulder on CO-7, or heading south on US-287 to Broomfield, your windshield takes a beating. That&apos;s why we bring our mobile service directly to you -- whether you&apos;re in the established neighborhoods of Centaur Village and Hearthwood, the newer communities of Legacy Park and Silver Creek, or anywhere else in Lafayette. No shop visit required.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Lafayette Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>US-287 Truck Traffic:</strong> Lafayette straddles one of Colorado&apos;s busiest north-south corridors. Semi trucks and commercial vehicles throw rocks and debris at highway speed, making rock chips a daily hazard for anyone commuting through the 287 corridor.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Coal Creek Flooding Deposits:</strong> Seasonal flooding along Coal Creek deposits sand, gravel, and debris onto roadways throughout central Lafayette. These loose materials get kicked up by passing vehicles and strike windshields.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Front Range 40-60 mph Winds:</strong> Lafayette sits in a wind corridor between the Flatirons and the plains. Sustained winds regularly gust 40-60 mph, launching gravel, construction debris, and even small branches into windshields.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>CO-7 Chip Seal Surfaces:</strong> The chip-sealed stretches of CO-7 between Lafayette and Boulder shed loose aggregate, especially in warmer months when the tar softens. Oncoming traffic flings these stones directly at your glass.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>Freeze-Thaw Cycling:</strong> At 5,236 feet, Lafayette experiences rapid temperature swings -- freezing overnight and warming above 50 degrees by midday. This constant expansion and contraction turns small chips into spreading cracks within hours.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 font-bold mr-2">&bull;</span>
                      <span><strong>US-36 Interchange Construction:</strong> Ongoing improvements at the US-36/US-287 interchange create construction zones with loose gravel, uneven pavement, and heavy equipment traffic that generate windshield-damaging debris for Lafayette commuters.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  Our technicians know Lafayette&apos;s roads intimately. Whether your chip came from a truck on US-287, loose aggregate on CO-7, or a pothole on one of Old Town&apos;s historic brick streets, we provide fast, professional repair before Colorado&apos;s temperature swings make it worse. Same-day mobile service throughout all Lafayette neighborhoods, from Rock Creek Ranch to Waneka Lake.
                </p>
              </section>

              {/* Driving Tips & Local Info */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Lafayette Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">The US-287 corridor and Old Town&apos;s aging streets generate frequent chips. We coordinate safe curbside service in Old Town, Rock Creek Ranch, Indian Peaks, and all Lafayette neighborhoods.</p>
                <div className="space-y-4 text-gray-700 mb-6">
                  <div>
                    <h3 className="font-semibold">Can you service Old Town Lafayette with its narrow streets?</h3>
                    <p>Absolutely -- share your exact location and we&apos;ll meet you at a safe nearby spot. We regularly service homes and businesses throughout Old Town and along Public Road.</p>
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
                  Lafayette Neighborhoods We Serve
                </h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Old Town Lafayette', 'Rock Creek Ranch', 'Indian Peaks',
                    'Centaur Village', 'Waneka Lake', 'Hearthwood',
                    'Miramont', 'Sandalwood', 'Coal Creek Village',
                    'Bonanza', 'Buckingham Square', 'Country Club Estates',
                    'Seven Hills', 'Legacy Park', 'Silver Creek'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don&apos;t see your neighborhood? We serve all of Lafayette - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              {/* Our Services */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Services in Lafayette
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
                      We come to you anywhere in Lafayette. Home, office, or curbside service available.
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
                  Boulder County Hail Season Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Lafayette sits squarely in the Front Range hail corridor. Severe thunderstorms from March through August regularly produce damaging hail that can destroy windshields in minutes. After weather damage:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Act Fast:</strong> Small chips can spread into large cracks with Lafayette&apos;s daily temperature fluctuations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Insurance Coverage:</strong> Comprehensive coverage typically covers weather damage for the price of your deductible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Quick Response:</strong> We serve Lafayette with fast mobile service throughout the year, including rapid post-storm response</span>
                  </li>
                </ul>
              </section>

              {/* Customer Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  What Lafayette Customers Say
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Maria G.',
                      neighborhood: 'Rock Creek Ranch',
                      rating: 5,
                      text: 'Got a nasty rock chip from a truck on 287. Pink Auto Glass came to my house in Rock Creek Ranch the same afternoon and repaired it perfectly. Couldn\'t even tell where the chip was!'
                    },
                    {
                      name: 'Brian T.',
                      neighborhood: 'Old Town Lafayette',
                      rating: 5,
                      text: 'The potholes on the old brick streets finally got my windshield. They replaced it at my office on Public Road -- fast, professional, and they handled all the insurance paperwork.'
                    },
                    {
                      name: 'Sarah L.',
                      neighborhood: 'Indian Peaks',
                      rating: 5,
                      text: 'After a hailstorm cracked our windshield, they were out the next morning. Great communication, fair price, and the new windshield looks perfect. Highly recommend for anyone in Lafayette.'
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
                  Common Questions from Lafayette Customers
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
                  <Link href="/locations/erie-co" className="text-pink-600 hover:underline font-medium">Erie</Link>
                  <Link href="/locations/boulder-co" className="text-pink-600 hover:underline font-medium">Boulder</Link>
                  <Link href="/locations/broomfield-co" className="text-pink-600 hover:underline font-medium">Broomfield</Link>
                  <Link href="/locations/superior-co" className="text-pink-600 hover:underline font-medium">Superior</Link>
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Lafayette?</h2>
                <p className="text-xl mb-6 text-pink-100">
                  Same-day mobile service anywhere in Lafayette. Call now for a free quote.
                </p>
                <CTAButtons source="lafayette-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Contact */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Lafayette Now</h3>
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
                      <span>Mobile Service - All Lafayette</span>
                    </div>
                  </div>
                </div>

                {/* Google Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Lafayette" state="CO" />
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
                      <Link href="/locations/erie-co" className="text-pink-600 hover:underline">
                        Erie, CO &rarr;
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
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Lafayette</h3>
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
