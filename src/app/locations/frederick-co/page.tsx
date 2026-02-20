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
  title: 'Frederick Windshield Repair | Auto Glass Replacement | Same-Day | (720) 918-7465',
  description: 'Frederick auto glass repair & windshield replacement. Mobile service to your home or office. Often $0 with insurance. Same-day appointments. Lifetime warranty. Call (720) 918-7465.',
  keywords: 'windshield repair frederick, windshield replacement frederick, auto glass frederick co, mobile windshield service frederick, frederick colorado windshield',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/frederick-co',
  },
  openGraph: {
    title: 'Frederick Windshield Repair & Replacement CO | Pink Auto Glass',
    description: 'Frederick\'s trusted auto glass experts. Mobile service, same-day appointments, lifetime warranty.',
    url: 'https://pinkautoglass.com/locations/frederick-co',
    type: 'website',
  },
};

export default function FrederickLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Frederick?',
      answer: 'Yes! Mobile service is our specialty in Frederick. We come to your home, office, or anywhere in the Frederick area. Whether you\'re in Silverstone, Clark Ranch, Mirada, or anywhere else in Frederick, our fully equipped mobile units will meet you wherever is most convenient.'
    },
    {
      question: 'How quickly can you replace a windshield in Frederick?',
      answer: 'We offer same-day windshield replacement throughout Frederick. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What Frederick neighborhoods do you serve?',
      answer: 'We serve all of Frederick including: Silverstone, Clark Ranch, Mirada, Prairie Greens, Moore Farm, Wyndham Hill, Coal Ridge, Fox Run, and all other Frederick areas. If you\'re anywhere in Frederick, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Frederick?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Frederick residents.'
    },
    {
      question: 'Why are Frederick windshields so prone to damage?',
      answer: 'Frederick sits in the Wattenberg Field, one of Colorado\'s most productive oil and gas regions with over 100 active wells within town limits. Heavy service trucks and tankers on CO-52 and local roads constantly drop gravel and aggregate. Combined with residential construction debris, I-25 corridor traffic, and Weld County hailstorms, windshield damage is a year-round reality.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Frederick',
    state: 'CO',
    zipCode: '80530',
    latitude: 40.0986,
    longitude: -104.9386,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Frederick, CO', url: 'https://pinkautoglass.com/locations/frederick-co' }
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
                <span className="text-xl">Frederick, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Frederick's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service • Same-Day Appointments • Lifetime Warranty
              </p>
              <CTAButtons source="frederick-co-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Frederick, CO', href: '/locations/frederick-co' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Frederick Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Frederick is the northernmost of the Carbon Valley "Tri-Towns" (with Firestone and Dacono), home to about 18,000 residents at 4,972 feet elevation in Weld County. Founded as a coal mining community in the 1800s—the McKissick Mine opened here in 1872—Frederick has evolved into a growing suburban town while retaining its small-town character along the historic Frontier Street corridor.
                </p>

                <AboveFoldCTA location="location-frederick-co" />

                <p className="text-lg text-gray-700 mb-4">
                  Today, Frederick sits atop the Wattenberg Field of the Denver-Julesburg Basin, one of Colorado's most productive oil and gas regions with over 100 active wells within town limits. This means heavy service truck traffic on CO-52 and local roads—combined with ongoing residential construction, I-25 corridor debris, and Weld County's infamous hailstorms—making windshield damage an everyday concern. Pink Auto Glass brings professional mobile service directly to your Frederick driveway.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Frederick Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Oil & Gas Service Truck Traffic:</strong> Frederick sits within the Wattenberg Field with 100+ active wells in town. Heavy service trucks, tankers, and equipment haulers on CO-52 and local roads constantly drop gravel and aggregate that chips following vehicles' windshields.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>CO-52 Road Surface Stress:</strong> CO-52 carries combined residential and industrial energy traffic—a mix that degrades road surfaces faster than typical suburban roads, producing loose aggregate that gets kicked up at speed.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Weld County Hail Corridor:</strong> Weld County is one of Colorado's most hail-active areas with zero terrain barriers to deflect storms. Golf ball or larger hail events are documented in Frederick and the surrounding Tri-Towns area regularly.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Residential Construction Debris:</strong> Like neighboring Firestone and Erie, Frederick's rapid growth means constant dump truck and cement mixer traffic through town. New subdivisions like Silverstone and Clark Ranch generate aggregate on roadways.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Wind-Driven Plains Grit:</strong> At 4,972 feet on the eastern plains margin, Frederick experiences sustained high winds that pick up fine soil and grit from surrounding agricultural land and undeveloped parcels, pitting windshields over time.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Extreme Temperature Swings:</strong> The plains climate produces some of the region's widest daily temperature ranges. A 70°F afternoon followed by near-freezing overnight causes existing chips to expand rapidly through the glass.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  Don't let a chip from CO-52 traffic or an oil field truck turn into a costly replacement. We offer same-day mobile service throughout Frederick—from Silverstone to the historic Frontier Street core.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Frederick Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Oil field trucks on CO-52 and construction traffic from new subdivisions are the biggest sources of windshield damage in Frederick. We come to your driveway so you don't have to drive on these roads with a damaged windshield.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">Can you come to my new subdivision?</h3>
                    <p>Yes—we service all Frederick neighborhoods including the newest developments. Even if surrounding roads are still under construction, we'll find a safe spot to complete the work.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Do you handle hail damage insurance claims?</h3>
                    <p>Absolutely. We work with all major insurance companies and handle the entire claims process. Most Frederick customers pay zero out of pocket for hail-related replacements.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Frederick Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Silverstone', 'Clark Ranch', 'Prairie Greens',
                    'Moore Farm', 'Mirada', 'Wyndham Hill',
                    'Coal Ridge', 'Fox Run', 'Hidden Creek North',
                    'Rinn Valley Ranch', 'Summit View Estates', 'Godding Hollow',
                    'Carriage Hills', 'Raspberry Hill', 'Eagle Valley'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don't see your neighborhood? We serve all of Frederick - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Frederick</h2>
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
                    <p className="text-gray-700 mb-4">We come to you anywhere in Frederick. Home, office, or driveway service available.</p>
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

              <section className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-yellow-600" />
                  Frederick Hail Season Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Frederick and the Carbon Valley sit on flat, open plains with no terrain barriers. Weld County is one of Colorado's most hail-active areas. After a hailstorm:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Act Fast:</strong> Plains temperature swings cause chips to spread into cracks rapidly—sometimes overnight</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Insurance Covers It:</strong> Comprehensive coverage typically covers hail damage with zero deductible in Colorado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>We're Ready:</strong> We increase capacity during hail season to serve Frederick and the Tri-Towns area quickly</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Frederick Customers Say</h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Steve K.',
                      neighborhood: 'Silverstone',
                      rating: 5,
                      text: 'An oil field truck on CO-52 kicked up a rock that cracked my windshield. Pink Auto Glass came to my house in Silverstone the same day. Insurance covered it all and the work was excellent.'
                    },
                    {
                      name: 'Jennifer M.',
                      neighborhood: 'Clark Ranch',
                      rating: 5,
                      text: 'Living near active construction means chips are inevitable. This is my second time using Pink Auto Glass and they\'re always fast, professional, and handle the insurance perfectly.'
                    },
                    {
                      name: 'Tony B.',
                      neighborhood: 'Prairie Greens',
                      rating: 5,
                      text: 'Hailstorm took out both our car windshields. They replaced both in one visit at our house in Prairie Greens. Handled all the insurance paperwork too. Highly recommend.'
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

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Frederick Customers</h2>
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

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Frederick?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Frederick. Call now for a free quote.</p>
                <CTAButtons source="frederick-co-cta" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Frederick Now</h3>
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
                      <span>Mobile Service - All Frederick</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Frederick" state="CO" />
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li><Link href="/locations/firestone-co" className="text-pink-600 hover:underline">Firestone, CO →</Link></li>
                    <li><Link href="/locations/erie-co" className="text-pink-600 hover:underline">Erie, CO →</Link></li>
                    <li><Link href="/locations/longmont-co" className="text-pink-600 hover:underline">Longmont, CO →</Link></li>
                    <li><Link href="/locations/brighton-co" className="text-pink-600 hover:underline">Brighton, CO →</Link></li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Frederick</h3>
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
