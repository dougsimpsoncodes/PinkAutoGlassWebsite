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
  title: 'Windshield Replacement Wheat Ridge CO | $0 Deductible',
  description: 'Mobile windshield replacement & repair in Wheat Ridge CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair wheat ridge, windshield replacement wheat ridge, auto glass wheat ridge co, mobile windshield service wheat ridge, auto glass applewood, i-70 windshield damage',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/wheat-ridge-co',
  },
  openGraph: {
    title: 'Windshield Replacement Wheat Ridge CO | $0 Deductible',
    description: 'Mobile windshield replacement & repair in Wheat Ridge CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/wheat-ridge-co',
    type: 'website',
  },
};

export default function WheatRidgeLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Wheat Ridge?',
      answer: 'Yes! Mobile service is our specialty in Wheat Ridge. We come to your home, office, or anywhere in the city. Whether you\'re in Applewood, near Clear Creek Crossing, in Prospect Park, or along the Wadsworth corridor, our fully equipped mobile units will meet you wherever is most convenient.'
    },
    {
      question: 'How quickly can you replace a windshield in Wheat Ridge?',
      answer: 'We offer same-day windshield replacement throughout Wheat Ridge. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What Wheat Ridge neighborhoods do you serve?',
      answer: 'We serve all of Wheat Ridge including: Applewood, Applewood Knolls, Prospect Park, Lynwood, Bel Aire, Paramount Heights, Morse Park, Fruitdale, Wheat Ridge Village, Clear Creek Crossing, Hillcrest, Panorama Park, Ridge at 44th, Tabor Estates, and Lakeside. If you\'re anywhere in Wheat Ridge, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Wheat Ridge?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Wheat Ridge residents.'
    },
    {
      question: 'Why is windshield damage so common in Wheat Ridge?',
      answer: 'Wheat Ridge sits at the gateway to the mountains along I-70, one of Colorado\'s most heavily traveled highways. Mountain-bound vehicles carry gravel, ski equipment, and construction materials that fall onto the roadway. Wadsworth Boulevard\'s chip-seal surface creates airborne debris, Clear Creek flooding leaves road debris, and the foothills-edge location means hailstorms hit with particular intensity.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Wheat Ridge',
    state: 'CO',
    zipCode: '80033',
    latitude: 39.7728,
    longitude: -105.0772,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Wheat Ridge, CO', url: 'https://pinkautoglass.com/locations/wheat-ridge-co' }
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
                <span className="text-xl">Wheat Ridge, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Wheat Ridge&apos;s Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service • Same-Day Appointments • Lifetime Warranty
              </p>
              <CTAButtons source="wheat-ridge-co-hero" />
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
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Wheat Ridge, CO', href: '/locations/wheat-ridge-co' }]} />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Why Wheat Ridge Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Wheat Ridge Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Wheat Ridge is a Jefferson County community of about 35,000 residents nestled at the gateway to the Rocky Mountains. At 5,459 feet elevation, this west Denver metro city sits directly along the I-70 corridor -- Colorado&apos;s primary artery to the mountains and one of the most heavily traveled highways in the state. Between the constant I-70 mountain-bound traffic carrying gravel and equipment, Wadsworth Boulevard&apos;s chip-seal surface launching debris, and Clear Creek flood events depositing road hazards, windshield damage is exceptionally common for Wheat Ridge drivers.
                </p>

                <AboveFoldCTA location="location-wheat-ridge-co" />

                <p className="text-lg text-gray-700 mb-4">
                  We understand Wheat Ridge life. You&apos;re commuting on I-70, shopping at the new Clear Creek Crossing development, browsing the antique shops along 44th Avenue, or heading up to the mountains for a weekend ski trip. That&apos;s why we bring our mobile service directly to you -- whether you&apos;re in the charming Applewood neighborhood, the established Prospect Park area, or anywhere along the Wadsworth and Kipling corridors. No need to fight I-70 traffic to get your windshield fixed when we come to your driveway.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Wheat Ridge Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-70 Mountain-Bound Gravel:</strong> I-70 through Wheat Ridge carries a constant stream of mountain-bound traffic -- trucks hauling construction materials, vehicles with roof-mounted ski gear, and trailers dropping road debris. This makes the I-70/Wadsworth and I-70/Kipling interchanges windshield-damage hotspots.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Wadsworth Blvd Chip-Seal Surface:</strong> Wadsworth Boulevard, Wheat Ridge&apos;s busiest north-south arterial, has sections of chip-seal pavement that shed small stones under heavy traffic. This is especially bad during warm months when the tar softens and releases embedded aggregate.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Clear Creek Flood Debris:</strong> Clear Creek runs through the heart of Wheat Ridge. During spring runoff and flood events, the creek deposits sand, gravel, and debris on adjacent roads, creating windshield hazards on routes near the creek corridor.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-70 Freeze-Thaw Cycles:</strong> The I-70 corridor through Wheat Ridge is heavily sanded in winter. At 5,459 feet elevation, the freeze-thaw cycle is relentless -- small chips from morning frost expand in afternoon sun, turning repairable chips into full replacements.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Mountain Equipment Transport:</strong> Wheat Ridge is the last metro stop before I-70 climbs into the mountains. Vehicles loading and unloading recreational equipment, construction materials, and oversized loads create debris zones at the I-70 on-ramps and along 44th Avenue.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Foothills-Edge Hail:</strong> Wheat Ridge&apos;s location at the foothills edge creates a unique weather pattern where updrafts from the mountains intensify hailstorms. The city often experiences larger hail than communities further east on the plains.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Driving Tips */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Wheat Ridge Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">
                  The I-70 corridor and Wadsworth Boulevard generate the most windshield damage in Wheat Ridge. We bring mobile service to your home or office so you never have to add more miles on these high-risk roads.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">Can you come to the Applewood neighborhood?</h3>
                    <p>Absolutely. Applewood is one of our most-served Wheat Ridge neighborhoods. We&apos;ll meet you at your home, or anywhere with a safe, level surface for our work.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">My windshield cracked on the way back from the mountains. How fast can you help?</h3>
                    <p>We offer same-day service throughout Wheat Ridge. Call us as soon as you get home and we&apos;ll often be there the same afternoon.</p>
                  </div>
                </div>
              </section>

              {/* Neighborhoods */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Wheat Ridge Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Applewood', 'Applewood Knolls', 'Prospect Park',
                    'Lynwood', 'Bel Aire', 'Paramount Heights',
                    'Morse Park', 'Fruitdale', 'Wheat Ridge Village',
                    'Clear Creek Crossing', 'Hillcrest', 'Panorama Park',
                    'Ridge at 44th', 'Tabor Estates', 'Lakeside'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don&apos;t see your neighborhood? We serve all of Wheat Ridge - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              {/* Services */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Wheat Ridge</h2>
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
                    <p className="text-gray-700 mb-4">We come to you anywhere in Wheat Ridge. Skip the I-70 traffic -- we bring the shop to you.</p>
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
                  Wheat Ridge Hail Season Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Wheat Ridge&apos;s foothills-edge location creates intensified hailstorms, often producing larger hail than communities further east. Peak season runs April through August. After a hailstorm:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Act Fast:</strong> At 5,459 feet, freeze-thaw cycles turn small chips into full cracks within hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Insurance Covers It:</strong> Comprehensive coverage typically covers hail damage with zero deductible in Colorado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>We Come to You:</strong> Mobile service right to your Wheat Ridge home -- no need to battle I-70 or Wadsworth traffic</span>
                  </li>
                </ul>
              </section>

              {/* Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Wheat Ridge Customers Say</h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Steve P.',
                      neighborhood: 'Applewood',
                      rating: 5,
                      text: 'Truck on I-70 dropped gravel and cracked my windshield coming back from the mountains. Pink Auto Glass came to my Applewood house the next morning. Insurance handled everything -- zero cost to me.'
                    },
                    {
                      name: 'Maria G.',
                      neighborhood: 'Prospect Park',
                      rating: 5,
                      text: 'Wadsworth chip-seal got my windshield again. Third time in two years! They came to Prospect Park same day and repaired the chip before it could spread. Fast and professional every time.'
                    },
                    {
                      name: 'Brian K.',
                      neighborhood: 'Clear Creek Crossing',
                      rating: 5,
                      text: 'After the hailstorm hit Wheat Ridge, they replaced our windshield at the house and handled the insurance claim. The foothills hail was brutal this year but Pink Auto Glass made it painless.'
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Wheat Ridge Customers</h2>
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
              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Wheat Ridge?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Wheat Ridge. Call now for a free quote.</p>
                <CTAButtons source="wheat-ridge-co-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Contact */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Wheat Ridge</h3>
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
                      <span>Mobile Service - All Wheat Ridge</span>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Wheat Ridge" state="CO" />
                </div>

                {/* Nearby Locations */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li><Link href="/locations/lakewood-co" className="text-pink-600 hover:underline">Lakewood, CO →</Link></li>
                    <li><Link href="/locations/arvada-co" className="text-pink-600 hover:underline">Arvada, CO →</Link></li>
                    <li><Link href="/locations/denver-co" className="text-pink-600 hover:underline">Denver, CO →</Link></li>
                    <li><Link href="/locations/golden-co" className="text-pink-600 hover:underline">Golden, CO →</Link></li>
                  </ul>
                </div>

                {/* Popular Vehicles */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Wheat Ridge</h3>
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
