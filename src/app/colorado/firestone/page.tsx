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
  title: 'Windshield Replacement Firestone CO | Mobile, $0 Deductible',
  description: 'Mobile windshield replacement & repair in Firestone CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair firestone, windshield replacement firestone, auto glass firestone co, mobile windshield service firestone, firestone co windshield',
  alternates: {
    canonical: 'https://pinkautoglass.com/colorado/firestone/',
  },
  openGraph: {
    title: 'Windshield Replacement Firestone CO | Mobile, $0 Deductible',
    description: 'Mobile windshield replacement & repair in Firestone CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/colorado/firestone/',
    type: 'website',
  },
};

export default function FirestoneLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Firestone?',
      answer: 'Yes! Mobile service is our specialty in Firestone. We come to your home, office, or anywhere in the Firestone area. Whether you\'re in Barefoot Lakes, Saddleback, Oak Meadows, or anywhere else in Firestone, our fully equipped mobile units will meet you wherever is most convenient.'
    },
    {
      question: 'How quickly can you replace a windshield in Firestone?',
      answer: 'We offer same-day windshield replacement throughout Firestone. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What Firestone neighborhoods do you serve?',
      answer: 'We serve all of Firestone including: Barefoot Lakes, Saddleback, Oak Meadows, Stoneridge, Mountain Shadows, Ridge Crest, Owl Lake Estates, Enchanted Hills, Cimarron Pointe, and all other Firestone areas. If you\'re anywhere in Firestone, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Firestone?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Firestone residents.'
    },
    {
      question: 'Why do Firestone windshields get damaged so often?',
      answer: 'Firestone faces a double hazard: active oil and gas extraction means heavy truck traffic on gravel county roads, while the ongoing residential construction boom brings chip-seal and gravel haulers through town daily. Add in I-25 corridor debris at 75+ mph and the area\'s position in Hail Alley, and windshield damage is extremely common.'
    },
    {
      question: 'How does Pink Auto Glass ensure the new windshield fits perfectly, especially with Firestone\'s blend of vehicle types?',
      answer: 'We use precision installation techniques and source high-quality glass that meets or exceeds OEM standards for all vehicle makes and models. Our experienced technicians ensure a perfect seal and fit, regardless of whether you drive a newer SUV, a work truck, or a family sedan, guaranteeing optimal safety and clarity.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Firestone',
    state: 'CO',
    zipCode: '80520',
    latitude: 40.15,
    longitude: -104.9375,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Firestone, CO', url: 'https://pinkautoglass.com/colorado/firestone/' }
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
                <span className="text-xl">Firestone, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Firestone's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                As a rapidly expanding community, Firestone drivers frequently encounter construction traffic and the challenges of I-25 commutes. The mix of new development and agricultural roots means your windshield is constantly exposed to varied debris and Colorado\'s intense weather.
              </p>
              <CTAButtons source="firestone-co-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Firestone, CO', href: '/colorado/firestone/' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              {/* Why Firestone Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Firestone Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Firestone is one of Colorado's fastest-growing towns, with nearly 20,000 residents—a 900%+ increase since 2000. Part of the Carbon Valley tri-town area with Frederick and Dacono, Firestone sits at 4,971 feet elevation along the I-25 corridor midway between Denver and Fort Collins. The town is home to St. Vrain State Park (Colorado's only state park within town limits) and the well-regarded Saddleback Golf Club.
                </p>

                <AboveFoldCTA location="location-firestone-co" />

              {/* Windshield Damage in Firestone */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Firestone
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Gravel and debris from numerous construction sites across the growing town.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Rocks kicked up by high-speed traffic on nearby I-25.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Debris from agricultural vehicles on roads near farmlands.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Unpredictable hailstorms, particularly during the late spring and summer months.</span>
                  </li>
                </ul>
              </section>

              {/* Our Services */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Services in Firestone
                </h2>
                <p className="text-gray-700 mb-4">
                  We bring a full range of auto glass services directly to you in Firestone:
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
                  But Firestone's rapid growth and Weld County location create a perfect storm for windshield damage. Active oil and gas operations bring heavy truck traffic on gravel county roads, ongoing residential construction generates debris on local streets, and the town sits directly in Hail Alley—the highest hail-frequency zone in North America. Whether you're in Barefoot Lakes, heading to the Firestone City Centre shops along the I-25 frontage road, or commuting south on I-25 to Denver, Pink Auto Glass brings professional mobile service right to your door.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Firestone Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Oil & Gas Truck Traffic:</strong> Weld County is home to nearly half of Colorado's 54,000 active oil and gas wells. Heavy service trucks on unpaved county roads east and south of town kick up gravel and debris that damages windshields daily.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-25 High-Speed Corridor:</strong> Firestone's I-25 frontage road intersection at Firestone Boulevard is the town's highest-accident intersection. Rock chips from trucks traveling 75+ mph on I-25 are the most common windshield damage for local commuters.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Residential Construction Boom:</strong> With 245+ active developments, construction trucks carrying gravel and aggregate are a constant presence on local roads. New streets go through chip-seal phases that generate loose aggregate for weeks.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Hail Alley Positioning:</strong> Firestone sits on flat, open terrain with no geographic barriers. Severe thunderstorms produce quarter-sized to baseball-sized hail, and Weld County has the highest tornado frequency of any U.S. county since 1950—indicating how severe the weather gets here.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Weld County Gravel Roads:</strong> Unpaved county roads on the east and south sides of town are maintained but still produce loose aggregate, especially during grading and chemical stabilization seasons. Oil field access roads add to the problem.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Freeze-Thaw Temperature Cycling:</strong> Front Range temperature swings of 40-50 degrees in a single day are common. Small chips from morning gravel can become full cracks by evening as temperatures drop after sunset.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  Don't let a chip from your I-25 commute or a Weld County gravel road turn into a costly replacement. We offer same-day mobile service throughout all of Firestone—from Barefoot Lakes to Saddleback to the Firestone City Centre area.
                </p>
              </section>

              {/* Local Driving Tips */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Firestone Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Between I-25 traffic, oil field trucks, and construction vehicles, Firestone roads are tough on windshields. We bring our mobile service directly to your subdivision, driveway, or workplace.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">Can you come to my subdivision even if it's still under construction?</h3>
                    <p>Yes—we service all Firestone neighborhoods including newer developments. We'll find a safe, level spot to complete the work.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Do you handle insurance claims for hail damage?</h3>
                    <p>Absolutely. We work with all major insurance companies and handle the entire claims process. Most Firestone customers pay zero out of pocket for hail-related replacements.</p>
                  </div>
                </div>
              </section>

              {/* Neighborhoods */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Firestone Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Barefoot Lakes', 'Saddleback', 'Oak Meadows',
                    'Stoneridge', 'Mountain Shadows', 'Ridge Crest',
                    'Owl Lake Estates', 'Enchanted Hills', 'Cimarron Pointe',
                    'Hearth at Oak Meadows', 'Neighbors Point', 'Falcon Point',
                    'Eagle Crest', 'Del Camino', 'Town Center'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don't see your neighborhood? We serve all of Firestone - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              {/* Services */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Firestone</h2>
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
                      We come to you anywhere in Firestone. Home, office, or driveway service available.
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
                  Firestone Hail Season Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Firestone's flat, open terrain offers no protection from the severe thunderstorms that track across Weld County. Colorado ranks second-worst in the nation for hail damage. After a hailstorm:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Act Fast:</strong> Front Range temperature swings of 40-50°F in a single day cause chips to spread into cracks rapidly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Insurance Covers It:</strong> Comprehensive coverage typically covers hail damage with zero deductible in Colorado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>We're Ready:</strong> We increase capacity during hail season to serve Firestone and Carbon Valley quickly</span>
                  </li>
                </ul>
              </section>

              {/* Customer Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  What Firestone Customers Say
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Mike D.',
                      neighborhood: 'Barefoot Lakes',
                      rating: 5,
                      text: 'The construction trucks around Barefoot Lakes are relentless with the gravel. Got a big crack on my commute. Pink Auto Glass came to my house the next morning and had it replaced in under two hours.'
                    },
                    {
                      name: 'Lisa H.',
                      neighborhood: 'Saddleback',
                      rating: 5,
                      text: 'After the June hailstorm, everyone in our neighborhood needed windshields. They handled my insurance claim and came to Saddleback the same week. Zero hassle, zero cost to me.'
                    },
                    {
                      name: 'Carlos R.',
                      neighborhood: 'Oak Meadows',
                      rating: 5,
                      text: 'Second time using them for a rock chip from I-25. Quick, professional, and my insurance covered it completely. They came right to my driveway in Oak Meadows.'
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Firestone Customers</h2>
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
                  <Link href="/locations/frederick-co" className="text-pink-600 hover:underline font-medium">Frederick</Link>
                  <Link href="/locations/dacono-co" className="text-pink-600 hover:underline font-medium">Dacono</Link>
                  <Link href="/locations/longmont-co" className="text-pink-600 hover:underline font-medium">Longmont</Link>
                  <Link href="/locations/erie-co" className="text-pink-600 hover:underline font-medium">Erie</Link>
                  <Link href="/locations/brighton-co" className="text-pink-600 hover:underline font-medium">Brighton</Link>
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Firestone?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Firestone. Call now for a free quote.</p>
                <CTAButtons source="firestone-co-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Firestone Now</h3>
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
                      <span>Mobile Service - All Firestone</span>
                    </div>
                  </div>
                </div>

                {/* Service Area Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Firestone" state="CO" />
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li><Link href="/locations/frederick-co" className="text-pink-600 hover:underline">Frederick, CO →</Link></li>
                    <li><Link href="/locations/erie-co" className="text-pink-600 hover:underline">Erie, CO →</Link></li>
                    <li><Link href="/locations/longmont-co" className="text-pink-600 hover:underline">Longmont, CO →</Link></li>
                    <li><Link href="/locations/brighton-co" className="text-pink-600 hover:underline">Brighton, CO →</Link></li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Firestone</h3>
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
