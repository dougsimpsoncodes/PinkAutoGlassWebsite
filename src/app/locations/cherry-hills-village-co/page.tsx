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
  title: 'Cherry Hills Village Windshield Repair | Auto Glass Replacement | Same-Day | (720) 918-7465',
  description: 'Cherry Hills Village auto glass repair & windshield replacement. Mobile service to your home or office. Often $0 with insurance. Same-day appointments. Lifetime warranty. Call (720) 918-7465.',
  keywords: 'windshield repair cherry hills village, windshield replacement cherry hills village, auto glass cherry hills village co, mobile windshield service cherry hills village',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/cherry-hills-village-co',
  },
  openGraph: {
    title: 'Cherry Hills Village Windshield Repair & Replacement CO | Pink Auto Glass',
    description: 'Cherry Hills Village\'s trusted auto glass experts. Mobile service, same-day appointments, lifetime warranty.',
    url: 'https://pinkautoglass.com/locations/cherry-hills-village-co',
    type: 'website',
  },
};

export default function CherryHillsVillageLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Cherry Hills Village?',
      answer: 'Yes! Mobile service is our specialty in Cherry Hills Village. We come to your home, office, or anywhere in the village. Whether you\'re near Cherry Hills Country Club, Glenmoor, or the Belleview corridor, our fully equipped mobile units will meet you wherever is most convenient.'
    },
    {
      question: 'How quickly can you replace a windshield in Cherry Hills Village?',
      answer: 'We offer same-day windshield replacement throughout Cherry Hills Village. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'Do you work on luxury and European vehicles?',
      answer: 'Absolutely. Cherry Hills Village has a high concentration of BMW, Mercedes, Audi, and Porsche vehicles. We use OEM-quality glass and perform professional ADAS calibration for vehicles with lane-departure, forward-collision, and rain-sensing systems.'
    },
    {
      question: 'Does insurance cover windshield replacement in Cherry Hills Village?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Cherry Hills Village residents.'
    },
    {
      question: 'Why is ADAS calibration important for luxury vehicles?',
      answer: 'Most 2018+ luxury vehicles have cameras and sensors mounted to the windshield that control lane-keeping, automatic braking, and adaptive cruise control. After replacement, these systems must be professionally recalibrated to ensure they function correctly. We include ADAS calibration with every replacement that requires it.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Cherry Hills Village',
    state: 'CO',
    zipCode: '80113',
    latitude: 39.6394,
    longitude: -104.9572,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Cherry Hills Village, CO', url: 'https://pinkautoglass.com/locations/cherry-hills-village-co' }
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
                <span className="text-xl">Cherry Hills Village, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Cherry Hills Village's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service • Same-Day Appointments • Lifetime Warranty
              </p>
              <CTAButtons source="cherry-hills-village-co-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Cherry Hills Village, CO', href: '/locations/cherry-hills-village-co' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Cherry Hills Village Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Cherry Hills Village is one of Colorado's most affluent communities—about 6,300 residents spread across 6.2 square miles of estate homes at 5,423 feet elevation. Home to the legendary Cherry Hills Country Club (host of three U.S. Opens), the village sits between Belleview Avenue and Quincy Avenue in Arapahoe County, just minutes from I-25 and the Denver Tech Center.
                </p>

                <AboveFoldCTA location="location-cherry-hills-village-co" />

                <p className="text-lg text-gray-700 mb-4">
                  Cherry Hills Village residents drive some of the highest-value vehicles on the Front Range—BMW, Mercedes, Audi, Porsche, and other luxury brands with advanced ADAS windshield systems. Pink Auto Glass specializes in OEM-quality replacements with professional ADAS calibration, delivered via mobile service right to your estate driveway, golf club parking, or office.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Cherry Hills Village Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Luxury Vehicle ADAS Complexity:</strong> The concentration of high-end European vehicles with forward-facing cameras, lane-assist sensors, and rain-sensing wipers mounted to the windshield means any replacement requires OEM glass and mandatory recalibration—not just any shop can do it right.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-25 Construction Debris:</strong> Residents commuting north on I-25 into Denver encounter ongoing highway construction zones with loose aggregate and truck-dropped debris—the most common source of rock chips for Cherry Hills commuters.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Front Range Hailstorms:</strong> Arapahoe County sits in Colorado's hail belt. Golf ball-sized hail can shatter panoramic sunroofs and luxury-vehicle glass in a single storm, and Cherry Hills' large estates often lack covered parking for all vehicles.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Thermal Cycling on Large Glass:</strong> Denver's 300+ days of sun combined with cold nights creates rapid expansion and contraction that turns small rock chips into full cracks—especially on oversized panoramic windshields common in luxury SUVs.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Tree-Lined Estate Road Debris:</strong> Large-lot estate roads and tree-lined private lanes accumulate leaf litter, small branches, and gravel that can strike glass at low speeds, particularly after storms.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>UV Degradation at Altitude:</strong> At 5,423 feet, UV intensity is roughly 25% higher than at sea level, accelerating the degradation of factory-applied urethane bonding and windshield tinting over time.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  Don't let a chip from your I-25 commute compromise your vehicle's safety systems. We specialize in luxury vehicle windshield replacement with proper ADAS calibration—delivered via same-day mobile service to your Cherry Hills Village home.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Cherry Hills Village Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">
                  With I-25 and Belleview Avenue generating the bulk of windshield damage for local residents, we bring our mobile service directly to your home or any location in the village.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">Can you come to my estate driveway?</h3>
                    <p>Absolutely. Most Cherry Hills Village customers prefer service at their home. We need a flat, level surface and clearance to work—driveways are ideal.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Do you use OEM glass for luxury vehicles?</h3>
                    <p>Yes. For vehicles with ADAS systems, we use OEM-quality glass that meets manufacturer specifications. We also perform professional recalibration after every replacement.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Cherry Hills Village Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Old Cherry Hills', 'Cherrymoor', 'Cherryridge',
                    'Cherry Hills Farm', 'Glenmoor', 'Charlou',
                    'Devonshire', 'Covington', 'Buell Mansion Area',
                    'Cherry Hills East', 'Cherry Hills North', 'Southmoor Vista',
                    'Mansfield Heights', 'Mockingbird Lane', 'Country Homes'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don't see your neighborhood? We serve all of Cherry Hills Village - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Cherry Hills Village</h2>
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
                      Complete windshield replacement with OEM quality glass. ADAS calibration included.
                    </p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>

                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Service</h3>
                    <p className="text-blue-600 font-bold text-2xl mb-3">No Extra Charge</p>
                    <p className="text-gray-700 mb-4">
                      We come to your estate, office, or club. Discreet, professional service at your convenience.
                    </p>
                    <Link href="/services/mobile-service" className="text-blue-600 hover:underline font-semibold">Learn More →</Link>
                  </div>

                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">ADAS Calibration</h3>
                    <p className="text-blue-600 font-bold text-2xl mb-3">Professional Calibration</p>
                    <p className="text-gray-700 mb-4">
                      Essential for luxury vehicles with lane-keep, auto-brake, and rain-sensing systems.
                    </p>
                    <Link href="/services/adas-calibration" className="text-blue-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-yellow-600" />
                  Cherry Hills Village Hail Season Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Cherry Hills Village's large estates often have more vehicles than covered garage spaces. During hail season (April through mid-June), unprotected vehicles are at serious risk. After a hailstorm:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Act Fast:</strong> Temperature swings at 5,400 feet cause chips to spread into cracks rapidly—especially on large panoramic glass</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Insurance Covers It:</strong> Comprehensive coverage typically covers hail damage with zero deductible in Colorado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>We Handle Luxury Vehicles:</strong> OEM glass and ADAS calibration for BMW, Mercedes, Audi, Porsche, and all makes</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Cherry Hills Village Customers Say</h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Patricia W.',
                      neighborhood: 'Glenmoor',
                      rating: 5,
                      text: 'Had my Mercedes GLE windshield replaced with OEM glass. They came to my home in Glenmoor and handled the ADAS calibration on-site. Flawless work and my insurance covered everything.'
                    },
                    {
                      name: 'Robert C.',
                      neighborhood: 'Cherry Hills Farm',
                      rating: 5,
                      text: 'Got a rock chip on I-25 heading to my office. They came to my driveway the same afternoon. Quick, professional, and they cleaned up perfectly. Highly recommend for the neighborhood.'
                    },
                    {
                      name: 'Susan M.',
                      neighborhood: 'Old Cherry Hills',
                      rating: 5,
                      text: 'After the June hailstorm, both our cars needed windshields. They handled both replacements in one visit and managed all the insurance paperwork. Zero hassle.'
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Cherry Hills Village Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Cherry Hills Village?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Cherry Hills Village. Call now for a free quote.</p>
                <CTAButtons source="cherry-hills-village-co-cta" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Cherry Hills Village</h3>
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
                      <span>Mobile Service - All Cherry Hills</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Cherry Hills Village" state="CO" />
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li><Link href="/locations/englewood-co" className="text-pink-600 hover:underline">Englewood, CO →</Link></li>
                    <li><Link href="/locations/greenwood-village-co" className="text-pink-600 hover:underline">Greenwood Village, CO →</Link></li>
                    <li><Link href="/locations/littleton-co" className="text-pink-600 hover:underline">Littleton, CO →</Link></li>
                    <li><Link href="/locations/centennial-co" className="text-pink-600 hover:underline">Centennial, CO →</Link></li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Cherry Hills</h3>
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
