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
  title: 'Windshield Replacement Wellington CO | Mobile, $0 Deductible',
  description: 'Mobile windshield replacement & repair in Wellington CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair wellington, windshield replacement wellington, auto glass wellington co, mobile windshield service wellington, wellington co windshield',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/wellington-co',
  },
  openGraph: {
    title: 'Windshield Replacement Wellington CO | Mobile, $0 Deductible',
    description: 'Mobile windshield replacement & repair in Wellington CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/wellington-co',
    type: 'website',
  },
};

export default function WellingtonLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Wellington?',
      answer: 'Yes! Mobile service is our specialty in Wellington. We come to your home, office, or anywhere in the Wellington area. Whether you\'re in Mountain View Ranch, downtown Wellington, or out near Boxelder Estates, our fully equipped mobile units will meet you wherever is most convenient.'
    },
    {
      question: 'How quickly can you replace a windshield in Wellington?',
      answer: 'We offer same-day windshield replacement throughout Wellington. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What Wellington areas do you serve?',
      answer: 'We serve all of Wellington including: Mountain View Ranch, Sage Meadows, Indian Creek Meadows, Old Town Wellington, Harvest Village, Pheasant Run Ridge, and all other Wellington neighborhoods. If you\'re anywhere in Wellington, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Wellington?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement for the price of your deductible. We work with all major insurance companies and handle all the paperwork for Wellington residents.'
    },
    {
      question: 'Why are Wellington windshields so prone to damage?',
      answer: 'Wellington sits on the open high plains at 5,201 feet with no natural windbreaks. I-25 semi-truck traffic kicks up debris at high speed, surrounding Larimer County gravel roads generate loose aggregate, and the area is directly in Hail Alley—the highest hail-frequency zone in North America. Chinook wind events can also cause 30-40 degree temperature swings in hours, rapidly spreading existing chips.'
    },
    {
      question: 'Can Pink Auto Glass provide mobile service to homes located on more rural or unpaved roads outside of central Wellington?',
      answer: 'Yes, our mobile windshield replacement service extends to all areas of Wellington, including homes on rural or unpaved roads. We bring our fully equipped vehicles directly to your location, ensuring you receive convenient and professional service regardless of your specific address.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Wellington',
    state: 'CO',
    zipCode: '80549',
    latitude: 40.7028,
    longitude: -105.0083,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Wellington, CO', url: 'https://pinkautoglass.com/locations/wellington-co' }
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
                <span className="text-xl">Wellington, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Wellington's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Wellington\'s rural charm, combined with its location along the I-25 corridor, means drivers face a unique set of challenges for their windshields. High winds and agricultural activity often contribute to debris, alongside the constant threat of highway impacts.
              </p>
              <CTAButtons source="wellington-co-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Wellington, CO', href: '/locations/wellington-co' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              {/* Why Wellington Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Wellington Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Wellington is one of Northern Colorado's fastest-growing communities, with about 11,500 residents at 5,201 feet elevation on the open high plains north of Fort Collins. Originally a railroad town founded in 1902, Wellington has evolved into a thriving bedroom community—but its exposed position along the I-25 corridor and surrounding gravel county roads make windshield damage a constant concern for local drivers.
                </p>

                <AboveFoldCTA location="location-wellington-co" />

              {/* Windshield Damage in Wellington */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Wellington
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Rocks and gravel from high-speed traffic on I-25, a daily route for many.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Debris from agricultural fields and farm equipment on rural roads.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Strong winds common in Northern Colorado, kicking up various small objects.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Sudden and severe hailstorms, a frequent weather event in the region.</span>
                  </li>
                </ul>
              </section>

              {/* Our Services */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Services in Wellington
                </h2>
                <p className="text-gray-700 mb-4">
                  We bring a full range of auto glass services directly to you in Wellington:
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
                  Whether you're commuting south on I-25 to Fort Collins for work, picking up supplies in Old Town Wellington along Cleveland Avenue, or heading home to one of the newer subdivisions like Mountain View Ranch or Sage Meadows, Pink Auto Glass brings professional mobile service directly to your door. We understand the challenges Wellington drivers face—from I-25 semi-truck debris to gravel road damage on surrounding Larimer County roads.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Wellington Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-25 Semi-Truck Traffic:</strong> Wellington's Exit 278 puts residents directly on a major freight corridor between Denver and Wyoming. Heavy truck volume at 75+ mph kicks up rocks and debris—the #1 cause of windshield chips for Wellington commuters.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Larimer County Gravel Roads:</strong> The county maintains over 555 miles of unpaved roads surrounding Wellington. Residents on acreage properties drive gravel daily before reaching pavement, picking up chips from loose aggregate.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Active Construction Zones:</strong> Rapid growth means multiple subdivisions under construction simultaneously. Gravel haulers, concrete trucks, and construction vehicles generate debris on local roads and SH-1.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Hail Alley Exposure:</strong> Wellington sits on flat, open plains with zero natural shelter from storms. It's directly in the path of severe thunderstorms that produce golf ball to baseball-sized hail, especially May through August.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Chinook Wind Temperature Swings:</strong> Warm downslope winds from the Rockies can raise temperatures 25-40°F within hours during winter. These rapid thermal changes cause existing chips to propagate into full cracks overnight.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Agricultural Equipment:</strong> Farm equipment on SH-1 and surrounding county roads drops gravel, soil, and debris. High plains winds then blow that loose material across travel lanes directly into oncoming windshields.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  Don't let a chip from your I-25 commute or a gravel road turn into a costly replacement. We offer same-day mobile service throughout all of Wellington—from the historic downtown core to the newest subdivisions on the town's expanding edges.
                </p>
              </section>

              {/* Local Driving Tips */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Wellington Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">
                  The I-25 corridor and surrounding gravel county roads are the primary sources of windshield damage for Wellington residents. We provide mobile service to your home, driveway, or anywhere in town.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">Can you come to my new subdivision?</h3>
                    <p>Yes—we service all Wellington neighborhoods including the newest developments. Even if roads are still under construction, we'll find a safe spot nearby to complete the work.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Is calibration included after replacement?</h3>
                    <p>If your vehicle requires it (common on 2018+ models), we include ADAS calibration and provide documentation for your records.</p>
                  </div>
                </div>
              </section>

              {/* Neighborhoods */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Wellington Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Old Town Wellington', 'Mountain View Ranch', 'Sage Meadows',
                    'Indian Creek Meadows', 'Creekside Village', 'Harvest Village',
                    'Park Meadows', 'The Meadows', 'Pheasant Run Ridge',
                    'Prairie View Estates', 'Horseman Hills', 'Fox Chase Estates',
                    'Boxelder Estates', 'Wellington East', 'Wellington West'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don't see your neighborhood? We serve all of Wellington - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              {/* Services */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Wellington</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Professional Service</p>
                    <p className="text-gray-700 mb-4">
                      Fast repair for chips and small cracks. Often covered 100% by insurance with no deductible.
                    </p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>

                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Professional Service</p>
                    <p className="text-gray-700 mb-4">
                      Complete windshield replacement with OEM quality glass. ADAS calibration available.
                    </p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>

                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Service</h3>
                    <p className="text-blue-600 font-bold text-2xl mb-3">No Extra Charge</p>
                    <p className="text-gray-700 mb-4">
                      We come to you anywhere in Wellington. Home, office, or driveway service available.
                    </p>
                    <Link href="/services/mobile-service" className="text-blue-600 hover:underline font-semibold">Learn More →</Link>
                  </div>

                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">ADAS Calibration</h3>
                    <p className="text-blue-600 font-bold text-2xl mb-3">Professional Calibration</p>
                    <p className="text-gray-700 mb-4">
                      Required for 2018+ vehicles with advanced safety features.
                    </p>
                    <Link href="/services/adas-calibration" className="text-blue-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              {/* Hail Season */}
              <section className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-yellow-600" />
                  Wellington Hail Season Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Wellington's flat, open plains position offers zero natural protection from severe weather. The area sits directly in Hail Alley with over 60 documented hail events. After a hailstorm:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Act Fast:</strong> Chinook winds can cause 30-40°F temperature swings within hours, rapidly spreading chips into full cracks</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Insurance Coverage:</strong> Comprehensive coverage typically covers hail damage for the price of your deductible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Quick Response:</strong> We serve Wellington with fast mobile service year-round, with increased capacity during hail season</span>
                  </li>
                </ul>
              </section>

              {/* Customer Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  What Wellington Customers Say
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Jason M.',
                      neighborhood: 'Mountain View Ranch',
                      rating: 5,
                      text: 'Living in a new subdivision means construction trucks everywhere. Got a nasty chip on my commute to Fort Collins. Pink Auto Glass came to my house the same afternoon and fixed it before it could spread.'
                    },
                    {
                      name: 'Sarah P.',
                      neighborhood: 'Old Town Wellington',
                      rating: 5,
                      text: 'After a June hailstorm, my windshield had two cracks. They handled everything with my insurance—zero out of pocket. Came right to my driveway in Old Town.'
                    },
                    {
                      name: 'Brian K.',
                      neighborhood: 'Indian Creek Meadows',
                      rating: 5,
                      text: 'The gravel roads near our property are brutal on windshields. This is my second time using Pink Auto Glass and the quality and speed are always top-notch.'
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

              {/* FAQs */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Wellington Customers</h2>
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

              {/* CTA */}
              {/* Nearby Cities */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  We Also Serve Nearby
                </h2>
                <div className="flex flex-wrap gap-4">
                  <Link href="/locations/fort-collins-co" className="text-pink-600 hover:underline font-medium">Fort Collins</Link>
                  <Link href="/locations/timnath-co" className="text-pink-600 hover:underline font-medium">Timnath</Link>
                  <Link href="/locations/laporte-co" className="text-pink-600 hover:underline font-medium">Laporte</Link>
                  <Link href="/locations/windsor-co" className="text-pink-600 hover:underline font-medium">Windsor</Link>
                  <Link href="/locations/loveland-co" className="text-pink-600 hover:underline font-medium">Loveland</Link>
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Wellington?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Wellington. Call now for a free quote.</p>
                <CTAButtons source="wellington-co-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Wellington Now</h3>
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
                      <span>Mobile Service - All Wellington</span>
                    </div>
                  </div>
                </div>

                {/* Service Area Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Wellington" state="CO" />
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li><Link href="/locations/fort-collins-co" className="text-pink-600 hover:underline">Fort Collins, CO →</Link></li>
                    <li><Link href="/locations/timnath-co" className="text-pink-600 hover:underline">Timnath, CO →</Link></li>
                    <li><Link href="/locations/windsor-co" className="text-pink-600 hover:underline">Windsor, CO →</Link></li>
                    <li><Link href="/locations/loveland-co" className="text-pink-600 hover:underline">Loveland, CO →</Link></li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Wellington</h3>
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
