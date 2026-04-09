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
  title: 'Windshield Replacement Greenwood Village | Mobile',
  description: 'Mobile windshield replacement & repair in Greenwood Village CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair greenwood village, windshield replacement greenwood village, auto glass greenwood village co, mobile windshield service greenwood village, ADAS calibration greenwood village, DTC auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/greenwood-village-co',
  },
  openGraph: {
    title: 'Windshield Replacement Greenwood Village | Mobile',
    description: 'Mobile windshield replacement & repair in Greenwood Village CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/greenwood-village-co',
    type: 'website',
  },
};

export default function GreenwooodVillageLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Greenwood Village?',
      answer: 'Yes! Mobile service is our specialty in Greenwood Village. We come to your home, DTC office, or anywhere in the city. Whether you\'re in Greenwood Hills, the DTC business district, Sundance Hills, or Cherry Creek Country Club Estates, our fully equipped mobile units will meet you wherever is most convenient.'
    },
    {
      question: 'How quickly can you replace a windshield in Greenwood Village?',
      answer: 'We offer same-day windshield replacement throughout Greenwood Village. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What Greenwood Village neighborhoods do you serve?',
      answer: 'We serve all of Greenwood Village including: Greenwood Hills, The Preserve, Sundance Hills, Saddlerock, DTC, Cherry Creek Country Club Estates, Village East, Foxridge, Willow Creek, Heritage Place, and every other neighborhood. If you\'re anywhere in Greenwood Village, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Greenwood Village?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Greenwood Village residents.'
    },
    {
      question: 'Do you handle ADAS calibration for luxury vehicles common in Greenwood Village?',
      answer: 'Absolutely. Greenwood Village has one of the highest concentrations of ADAS-equipped luxury vehicles in the Denver metro. We provide professional ADAS calibration for all makes including BMW, Mercedes-Benz, Tesla, Audi, and Lexus. Calibration is included when required after windshield replacement.'
    },
    {
      question: 'Can Pink Auto Glass accommodate a mobile windshield replacement for busy professionals in Greenwood Village?',
      answer: 'Absolutely. Our mobile service is designed for maximum convenience, allowing us to perform windshield replacements at your office during work hours or at your home. We understand the demanding schedules of Greenwood Village professionals and strive to make the process as seamless and time-efficient as possible.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Greenwood Village',
    state: 'CO',
    zipCode: '80111',
    latitude: 39.6172,
    longitude: -104.9503,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Greenwood Village, CO', url: 'https://pinkautoglass.com/locations/greenwood-village-co' }
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
                <span className="text-xl">Greenwood Village, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Greenwood Village&apos;s Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Driving in Greenwood Village means navigating the busy Denver Tech Center (DTC) area and high-traffic corridors like I-25. These conditions, combined with Denver\'s notorious hail season, make windshield damage a frequent concern for residents and commuters.
              </p>
              <CTAButtons source="greenwood-village-co-hero" />
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
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Greenwood Village, CO', href: '/locations/greenwood-village-co' }]} />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Why Greenwood Village Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Greenwood Village Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Greenwood Village is the heart of the Denver Tech Center -- home to roughly 16,000 residents and thousands of corporate offices in Arapahoe County. Sitting at 5,519 feet elevation along the I-25 and I-225 corridors, this affluent community sees some of the highest concentrations of ADAS-equipped luxury vehicles in the entire Denver metro. Between rock chips from the I-25/I-225 interchange, ongoing DTC construction projects, and Colorado&apos;s relentless hail corridor, windshield damage is a near-constant reality for Greenwood Village drivers.
                </p>

                <AboveFoldCTA location="location-greenwood-village-co" />

              {/* Windshield Damage in Greenwood Village */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Greenwood Village
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Debris and gravel kicked up by heavy traffic on I-25 and surrounding DTC roads.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Construction materials from ongoing commercial and residential developments.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Intense hailstorms, which regularly cause significant auto glass damage in this area.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Road salt and sand used in winter, which can contain abrasive particles.</span>
                  </li>
                </ul>
              </section>

                <p className="text-lg text-gray-700 mb-4">
                  We understand Greenwood Village life. You&apos;re commuting on I-25 to a DTC office, dropping kids at Cherry Creek Schools, or heading to Fiddler&apos;s Green for a concert. That&apos;s why we bring our fully equipped mobile units directly to your office parking garage, your driveway in Sundance Hills, or wherever you are. With the highest density of vehicles requiring ADAS calibration after windshield replacement, our technicians are experts at handling the BMW, Tesla, Mercedes, and Audi models that dominate Greenwood Village driveways.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Greenwood Village Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-25/I-225 Interchange Gravel:</strong> The massive interchange where I-25 meets I-225 is one of the busiest in the south metro. Lane shifts, construction zones, and heavy truck traffic launch gravel and debris at windshields daily -- especially during rush hour commutes.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>DTC Construction Zones:</strong> Continuous office park development and road widening projects throughout the Denver Tech Center create miles of loose aggregate, construction vehicle debris, and uneven pavement that chip windshields.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Hail Corridor Exposure:</strong> Greenwood Village sits squarely in the Front Range hail corridor. Severe storms from April through August produce damaging hail, and many DTC parking lots offer zero covered protection.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Freeze-Thaw at 5,519 Feet:</strong> At this elevation, rapid temperature swings -- from freezing mornings to 70-degree afternoons -- cause small chips to propagate into full cracks within hours.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Luxury ADAS Vehicles:</strong> Greenwood Village has one of the highest concentrations of ADAS-equipped vehicles in Colorado. Every windshield replacement on these vehicles requires professional camera calibration to restore safety systems.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Orchard Road Sand & Debris:</strong> Orchard Road, Belleview Avenue, and Arapahoe Road carry heavy commuter traffic through Greenwood Village. Winter sand treatments and year-round debris make these corridors hotspots for windshield damage.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Driving Tips */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Greenwood Village Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">
                  The I-25/I-225 interchange and DTC surface streets generate the most windshield damage in this area. We bring our mobile service to your DTC office or Greenwood Village home so you never lose a workday.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">Can you come to my DTC office?</h3>
                    <p>Absolutely. We service vehicles in DTC parking garages and office lots every day. Just share your building address and we&apos;ll meet you there.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Do you handle ADAS calibration on-site?</h3>
                    <p>Yes. Our mobile units carry the equipment needed for ADAS calibration on most luxury and late-model vehicles common in Greenwood Village.</p>
                  </div>
                </div>
              </section>

              {/* Neighborhoods */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Greenwood Village Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Greenwood Hills', 'GV Country Club', 'The Preserve',
                    'Sundance Hills', 'Saddlerock', 'Centennial Acres',
                    'Village East', 'Eado', 'Orchard Place',
                    'Foxridge', 'Cherry Creek CC Estates', 'Willow Creek',
                    'Heritage Place', 'DTC', 'Cherry Hills Farm'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don&apos;t see your neighborhood? We serve all of Greenwood Village - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              {/* Services */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Greenwood Village</h2>
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
                    <p className="text-gray-700 mb-4">We come to your DTC office, home, or anywhere in Greenwood Village. Skip the I-25 traffic.</p>
                    <Link href="/services/mobile-service" className="text-blue-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">ADAS Calibration</h3>
                    <p className="text-blue-600 font-bold text-2xl mb-3">Professional Calibration</p>
                    <p className="text-gray-700 mb-4">Essential for luxury and 2018+ vehicles. BMW, Tesla, Mercedes, Audi -- we calibrate them all.</p>
                    <Link href="/services/adas-calibration" className="text-blue-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              {/* Hail Season */}
              <section className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-yellow-600" />
                  Greenwood Village Hail Season Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Greenwood Village sits in the Front Range hail corridor, with peak storm season from April through August. Many DTC office lots lack covered parking, leaving vehicles exposed. After a hailstorm:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Act Fast:</strong> At 5,519 feet, temperature swings cause small chips to spread into full cracks within hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Insurance Covers It:</strong> Comprehensive coverage typically covers hail damage with zero deductible in Colorado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>We Come to You:</strong> No need to leave your DTC office or Greenwood Village home -- we bring the shop to your parking spot</span>
                  </li>
                </ul>
              </section>

              {/* Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Greenwood Village Customers Say</h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Christine L.',
                      neighborhood: 'DTC',
                      rating: 5,
                      text: 'They came to my office garage in the DTC and replaced my BMW windshield including ADAS calibration. I didn\'t miss a single meeting. Incredible convenience for a professional service.'
                    },
                    {
                      name: 'Robert K.',
                      neighborhood: 'Sundance Hills',
                      rating: 5,
                      text: 'Hailstorm cracked our windshield while parked at Fiddler\'s Green. Pink Auto Glass handled the insurance claim and came to our house the next morning. Zero out of pocket.'
                    },
                    {
                      name: 'Priya M.',
                      neighborhood: 'The Preserve',
                      rating: 5,
                      text: 'Got a rock chip on I-225 heading to work. They repaired it in my driveway the same afternoon. Fast, professional, and the repair is invisible. Highly recommend.'
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Greenwood Village Customers</h2>
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
                  <Link href="/locations/cherry-hills-village-co" className="text-pink-600 hover:underline font-medium">Cherry Hills Village</Link>
                  <Link href="/locations/centennial-co" className="text-pink-600 hover:underline font-medium">Centennial</Link>
                  <Link href="/locations/englewood-co" className="text-pink-600 hover:underline font-medium">Englewood</Link>
                  <Link href="/locations/lone-tree-co" className="text-pink-600 hover:underline font-medium">Lone Tree</Link>
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Greenwood Village?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Greenwood Village. Call now for a free quote.</p>
                <CTAButtons source="greenwood-village-co-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Contact */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Greenwood Village</h3>
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
                      <span>Mobile Service - All Greenwood Village</span>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Greenwood Village" state="CO" />
                </div>

                {/* Nearby Locations */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li><Link href="/locations/centennial-co" className="text-pink-600 hover:underline">Centennial, CO →</Link></li>
                    <li><Link href="/locations/englewood-co" className="text-pink-600 hover:underline">Englewood, CO →</Link></li>
                    <li><Link href="/locations/cherry-hills-village-co" className="text-pink-600 hover:underline">Cherry Hills Village, CO →</Link></li>
                    <li><Link href="/locations/lone-tree-co" className="text-pink-600 hover:underline">Lone Tree, CO →</Link></li>
                  </ul>
                </div>

                {/* Popular Vehicles */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Greenwood Village</h3>
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
