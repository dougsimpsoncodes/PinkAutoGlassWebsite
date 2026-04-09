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
  title: 'Windshield Replacement Johnstown CO | Mobile, $0 Deductible',
  description: 'Mobile windshield replacement & repair in Johnstown CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair johnstown, windshield replacement johnstown, auto glass johnstown co, mobile windshield service johnstown, auto glass repair johnstown colorado',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/johnstown-co',
  },
  openGraph: {
    title: 'Windshield Replacement Johnstown CO | Mobile, $0 Deductible',
    description: 'Mobile windshield replacement & repair in Johnstown CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/johnstown-co',
    type: 'website',
  },
};

export default function JohnstownLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Johnstown?',
      answer: 'Yes! Mobile service is our specialty in Johnstown. We come to your home, office, or anywhere in the Johnstown area. Whether you\'re in Thompson River Ranch, Pioneer Ridge, Johnstown Village, or near the Crossroads Blvd shopping area, our fully equipped mobile units will meet you wherever is most convenient.'
    },
    {
      question: 'How quickly can you replace a windshield in Johnstown?',
      answer: 'We offer same-day windshield replacement throughout Johnstown. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What Johnstown neighborhoods do you serve?',
      answer: 'We serve all of Johnstown including: Johnstown Village, Johnstown Farms, Pioneer Ridge, Thompson River Ranch, Carlisle, The Brands, Clearview, Centennial Farm, Eagle Ridge, Discovery Ridge, and all other Johnstown communities. If you\'re anywhere in the Johnstown area, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Johnstown?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Johnstown residents.'
    },
    {
      question: 'Why do Johnstown residents get so many windshield chips?',
      answer: 'Johnstown sits along the I-25 corridor between Fort Collins and Denver, one of the busiest freight routes in Colorado. The combination of heavy truck traffic at exits 252-254, open plains crosswinds that blow agricultural dust and debris, and constant new-construction gravel from the town\'s rapid growth makes windshield damage extremely common here.'
    },
    {
      question: 'Does Pink Auto Glass service the range of vehicles found in Johnstown, from family cars to farm trucks?',
      answer: 'Yes, our expert technicians are equipped to handle windshield replacements for a diverse array of vehicles common in Johnstown, including family sedans, SUVs, trucks, and even some light commercial or agricultural vehicles. We ensure high-quality service and durable glass for every customer.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Johnstown',
    state: 'CO',
    zipCode: '80534',
    latitude: 40.3369,
    longitude: -104.9517,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Johnstown, CO', url: 'https://pinkautoglass.com/locations/johnstown-co' }
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
                <span className="text-xl">Johnstown, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Johnstown&apos;s Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Johnstown, situated between Loveland and Greeley and near I-25, experiences a unique mix of rural and developing area driving conditions. This blend exposes windshields to both agricultural debris and high-speed highway impacts, alongside Colorado\'s unpredictable weather.
              </p>
              <CTAButtons source="johnstown-co-hero" />
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
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Johnstown, CO', href: '/locations/johnstown-co' }]} />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Why Johnstown Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Johnstown Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Johnstown is one of Northern Colorado&apos;s fastest-growing communities, straddling the Larimer and Weld county line with roughly 18,000 residents at 4,997 feet elevation. Positioned along the I-25 corridor between Loveland and the Greeley area, Johnstown&apos;s location at exits 252-254 puts it directly in the path of heavy freight truck traffic heading between Denver and Wyoming. Between the constant I-25 truck debris, open-plains crosswinds that blow Weld County agricultural dust, and gravel from the dozens of new-construction developments, windshield damage is a fact of life here.
                </p>

                <AboveFoldCTA location="location-johnstown-co" />

              {/* Windshield Damage in Johnstown */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Johnstown
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Rocks and gravel from I-25, a main artery for Johnstown commuters.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Debris from agricultural vehicles on surrounding rural roads.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Hailstorms, a prevalent risk for Northern Colorado vehicles during summer months.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Dust and small stones from unpaved roads and construction zones.</span>
                  </li>
                </ul>
              </section>

                <p className="text-lg text-gray-700 mb-4">
                  We understand Johnstown life. You&apos;re commuting on I-25 to Loveland, Fort Collins, or Denver, shopping at the Crossroads Blvd retail area, or settling into one of the many new master-planned communities like Thompson River Ranch or Pioneer Ridge. That&apos;s why we bring our mobile service directly to you -- whether you&apos;re in the established Johnstown Village core, out in the new Stroh Farm or Harvest Village neighborhoods, or anywhere in between. No need to drive to Loveland or Fort Collins for auto glass service.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Johnstown Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-25 Truck Freight Corridor:</strong> Johnstown&apos;s I-25 exits (252-254) sit on one of Colorado&apos;s busiest freight routes. Semi-trucks and commercial vehicles throw rocks, gravel, and debris at high speed, making windshield chips nearly unavoidable for daily commuters.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Open Plains Crosswind:</strong> Unlike sheltered Front Range cities, Johnstown sits on open plains where crosswinds gust to 50+ mph. These winds carry sand, gravel, and agricultural debris directly into windshields -- especially along US-34 and CO-60.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Weld County Agricultural Dust:</strong> Weld County is one of Colorado&apos;s most productive agricultural counties. Farming operations, feedlots, and dirt roads generate airborne particulates that sandblast windshields and accelerate existing chip damage.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>New-Construction Gravel:</strong> Johnstown&apos;s explosive growth means dozens of active construction sites. Unfinished roads, construction truck traffic, and loose aggregate from new subdivisions create constant windshield hazards.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Hail on Open Terrain:</strong> Without the foothills to partially deflect storms, Johnstown&apos;s open terrain takes the full force of Front Range hailstorms. April through August brings frequent damaging hail with little natural shelter.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>US-34 Freeze-Thaw Sand:</strong> US-34 (Crossroads Blvd) is heavily sanded in winter. Spring thaw launches accumulated grit at trailing vehicles, and the freeze-thaw cycle at 4,997 feet turns small chips into full cracks quickly.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Driving Tips */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Johnstown Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">
                  I-25 exits 252-254 and the US-34/Crossroads corridor generate the most windshield damage in the Johnstown area. We bring mobile service directly to your neighborhood so you never have to drive to another city for auto glass work.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">Can you come to my new-construction neighborhood?</h3>
                    <p>Absolutely. We service vehicles in Thompson River Ranch, Pioneer Ridge, Stroh Farm, and all Johnstown communities -- even if the roads are still being finished.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">How long does a repair take?</h3>
                    <p>A chip repair takes about 30 minutes. A full windshield replacement takes 60-90 minutes plus 1 hour of cure time. We handle everything on-site at your home.</p>
                  </div>
                </div>
              </section>

              {/* Neighborhoods */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Johnstown Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Johnstown Village', 'Johnstown Farms', 'Pioneer Ridge',
                    'Thompson River Ranch', 'Carlisle', 'The Brands',
                    'Clearview', 'Johnstown Crossing', 'Centennial Farm',
                    'Eagle Ridge', 'Discovery Ridge', 'Overlook',
                    'Stroh Farm', 'Harvest Village', 'Mariana Butte'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don&apos;t see your neighborhood? We serve all of Johnstown - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              {/* Services */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Johnstown</h2>
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
                    <p className="text-gray-700 mb-4">We come to you anywhere in Johnstown. No need to drive to Loveland or Fort Collins.</p>
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
                  Johnstown Hail Season Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Johnstown&apos;s open-terrain location means hailstorms hit with full force, with no foothills to deflect them. Peak hail season runs April through August. After a hailstorm:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Act Fast:</strong> Freeze-thaw cycles at 4,997 feet turn small chips into full cracks within hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Insurance Covers It:</strong> Comprehensive coverage typically covers hail damage with zero deductible in Colorado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>We Come to You:</strong> Mobile service right to your Johnstown neighborhood -- no driving to another city needed</span>
                  </li>
                </ul>
              </section>

              {/* Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Johnstown Customers Say</h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Mike T.',
                      neighborhood: 'Thompson River Ranch',
                      rating: 5,
                      text: 'I-25 truck kicked up a rock and cracked my windshield on the way home from Denver. They came to my house in Thompson River Ranch the next morning and handled everything. Great service without leaving town.'
                    },
                    {
                      name: 'Sarah B.',
                      neighborhood: 'Pioneer Ridge',
                      rating: 5,
                      text: 'Construction gravel from all the new building chipped my windshield twice this year. Pink Auto Glass came to Pioneer Ridge both times -- fast, professional, and my insurance covered it completely.'
                    },
                    {
                      name: 'Jason W.',
                      neighborhood: 'Johnstown Village',
                      rating: 5,
                      text: 'After a nasty hailstorm, they replaced my windshield right in my driveway. Handled the insurance claim too. So glad I didn\'t have to drive to Loveland or Fort Collins for this.'
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Johnstown Customers</h2>
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
                  <Link href="/locations/loveland-co" className="text-pink-600 hover:underline font-medium">Loveland</Link>
                  <Link href="/locations/greeley-co" className="text-pink-600 hover:underline font-medium">Greeley</Link>
                  <Link href="/locations/milliken-co" className="text-pink-600 hover:underline font-medium">Milliken</Link>
                  <Link href="/locations/windsor-co" className="text-pink-600 hover:underline font-medium">Windsor</Link>
                  <Link href="/locations/berthoud-co" className="text-pink-600 hover:underline font-medium">Berthoud</Link>
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Johnstown?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Johnstown. Call now for a free quote.</p>
                <CTAButtons source="johnstown-co-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Contact */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Johnstown</h3>
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
                      <span>Mobile Service - All Johnstown</span>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Johnstown" state="CO" />
                </div>

                {/* Nearby Locations */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li><Link href="/locations/loveland-co" className="text-pink-600 hover:underline">Loveland, CO →</Link></li>
                    <li><Link href="/locations/windsor-co" className="text-pink-600 hover:underline">Windsor, CO →</Link></li>
                    <li><Link href="/locations/fort-collins-co" className="text-pink-600 hover:underline">Fort Collins, CO →</Link></li>
                    <li><Link href="/locations/greeley-co" className="text-pink-600 hover:underline">Greeley, CO →</Link></li>
                  </ul>
                </div>

                {/* Popular Vehicles */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Johnstown</h3>
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
