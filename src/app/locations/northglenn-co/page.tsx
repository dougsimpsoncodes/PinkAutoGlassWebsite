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
  title: 'Northglenn Windshield Repair | Auto Glass Replacement | Same-Day | (720) 918-7465',
  description: 'Northglenn auto glass repair & windshield replacement. Mobile service to your home or office. Often $0 with insurance. Same-day appointments. Lifetime warranty. Serving all Northglenn neighborhoods. Call (720) 918-7465.',
  keywords: 'windshield repair northglenn, windshield replacement northglenn, auto glass northglenn co, mobile windshield service northglenn, auto glass repair northglenn colorado',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/northglenn-co',
  },
  openGraph: {
    title: 'Northglenn Windshield Repair & Replacement CO | Pink Auto Glass',
    description: 'Northglenn\'s trusted auto glass experts. Mobile service, same-day appointments, lifetime warranty.',
    url: 'https://pinkautoglass.com/locations/northglenn-co',
    type: 'website',
  },
};

export default function NorthglennLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Northglenn?',
      answer: 'Yes! Mobile service is our specialty in Northglenn. We come to your home, office, or anywhere in the city. Whether you\'re in Original Northglenn, Northborough, Huron Hills, or along the 104th Avenue corridor, our fully equipped mobile units will meet you wherever is most convenient.'
    },
    {
      question: 'How quickly can you replace a windshield in Northglenn?',
      answer: 'We offer same-day windshield replacement throughout Northglenn. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What Northglenn neighborhoods do you serve?',
      answer: 'We serve all of Northglenn including: Original Northglenn, Northborough, Northpark, Huron Hills, Quentin Hill, Eastlake, York Street Corridor, Claude Court, Margaret Heights, Washington Square, Orchard Park, Parkway Estates, Crest View, and every other Northglenn neighborhood. If you\'re anywhere in Northglenn, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Northglenn?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Northglenn residents.'
    },
    {
      question: 'Why do Northglenn cars get so many windshield chips?',
      answer: 'Northglenn sits directly along the I-25 corridor between 104th and 120th Avenue, where legacy pavement and heavy commuter traffic generate constant debris. The city\'s 1950s-era street infrastructure creates rough surfaces, and Adams County road sand from winter treatments stays on streets well into spring. Combined with minimal tree canopy that leaves vehicles exposed to hail, windshield damage is extremely common in Northglenn.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Northglenn',
    state: 'CO',
    zipCode: '80233',
    latitude: 39.8858,
    longitude: -104.9872,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Northglenn, CO', url: 'https://pinkautoglass.com/locations/northglenn-co' }
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
                <span className="text-xl">Northglenn, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Northglenn&apos;s Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service • Same-Day Appointments • Lifetime Warranty
              </p>
              <CTAButtons source="northglenn-co-hero" />
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
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Northglenn, CO', href: '/locations/northglenn-co' }]} />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Why Northglenn Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Northglenn Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Northglenn is a well-established Adams County community of about 39,000 residents, founded in the late 1950s as one of Colorado&apos;s original planned suburbs. Sitting at 5,387 feet elevation along the I-25 corridor between 104th and 120th Avenue, Northglenn&apos;s aging infrastructure and high-traffic arterials create a perfect storm for windshield damage. The combination of I-25&apos;s legacy pavement, heavy commercial truck traffic on 104th Avenue, and Adams County&apos;s aggressive winter sand treatments means rock chips and cracks are a near-daily occurrence for Northglenn drivers.
                </p>

                <AboveFoldCTA location="location-northglenn-co" />

                <p className="text-lg text-gray-700 mb-4">
                  We understand Northglenn life. You&apos;re commuting on I-25 to downtown Denver, shopping along the 104th Avenue corridor, or enjoying the community events at the Northglenn Recreation Center. That&apos;s why we bring our mobile service directly to you -- whether you&apos;re in the Original Northglenn neighborhoods near Malley Drive, the Huron Hills area, or the newer developments near Eastlake. No need to fight 104th Avenue traffic to reach a shop when we bring the shop to your driveway.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Northglenn Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-25 Legacy Pavement:</strong> The stretch of I-25 through Northglenn (104th to 120th exits) has some of the oldest pavement in the north metro. Rough surfaces, patch repairs, and expansion joint wear launch debris at windshields during every rush-hour commute.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>104th Ave Commercial Trucks:</strong> 104th Avenue is Northglenn&apos;s primary commercial corridor, carrying heavy truck traffic to retail centers, warehouses, and I-25 on-ramps. Loaded trucks throw gravel and debris, especially at acceleration zones near intersections.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Aging 1950s Street Infrastructure:</strong> Many of Northglenn&apos;s original residential streets date back to the late 1950s and 1960s. Decades of patching, chip-seal resurfacing, and curb deterioration create loose aggregate that chips windshields even at neighborhood speeds.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Adams County Road Sand:</strong> Adams County applies heavy sand treatments on Northglenn roads throughout winter. This sand lingers well into spring, becoming airborne as temperatures rise and traffic increases.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Minimal Tree Canopy for Hail:</strong> Unlike older, tree-heavy neighborhoods in Denver, Northglenn&apos;s original development left limited mature tree canopy. This means vehicles parked in driveways and on streets have little natural hail protection during storms.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Light Rail Construction Debris:</strong> RTD N Line construction and related road improvements along the I-25 corridor generate construction debris, lane shifts, and uneven pavement that create additional windshield hazards for Northglenn commuters.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Driving Tips */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Northglenn Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">
                  I-25 between 104th and 120th and the 104th Avenue commercial corridor generate the most windshield damage in Northglenn. We come to your home so you don&apos;t have to add more mileage on these high-risk roads.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">Can you come to my house in the older Northglenn neighborhoods?</h3>
                    <p>Absolutely. We service vehicles in all Northglenn neighborhoods, from the original 1950s-era homes to newer developments. Any safe, level spot in your driveway or parking area works for us.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">How long does a replacement take?</h3>
                    <p>A chip repair takes about 30 minutes. A full windshield replacement takes 60-90 minutes plus 1 hour of cure time. We handle everything on-site at your home.</p>
                  </div>
                </div>
              </section>

              {/* Neighborhoods */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Northglenn Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Original Northglenn', 'Northborough', 'Northpark',
                    'Huron Hills', 'Quentin Hill', 'Eastlake',
                    'York Street Corridor', 'Claude Court', 'Margaret Heights',
                    'Washington Square', 'Orchard Park', 'Parkway Estates',
                    'Crest View', 'Northglenn Gardens', 'Malley Drive Area'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don&apos;t see your neighborhood? We serve all of Northglenn - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              {/* Services */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Northglenn</h2>
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
                    <p className="text-gray-700 mb-4">We come to you anywhere in Northglenn. Skip the 104th Avenue traffic -- we bring the shop to you.</p>
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
                  Northglenn Hail Season Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Northglenn&apos;s location in the north Denver metro I-25 corridor puts it directly in the path of Front Range hailstorms. With minimal mature tree canopy, vehicles are especially exposed. After a hailstorm:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Act Fast:</strong> Temperature swings at 5,387 feet cause small chips to spread into full cracks quickly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Insurance Covers It:</strong> Comprehensive coverage typically covers hail damage with zero deductible in Colorado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>We Come to You:</strong> Mobile service right to your Northglenn driveway -- no need to battle 104th Avenue traffic</span>
                  </li>
                </ul>
              </section>

              {/* Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Northglenn Customers Say</h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Carlos M.',
                      neighborhood: 'Huron Hills',
                      rating: 5,
                      text: 'I-25 construction threw a rock and cracked my windshield on the way to work. Pink Auto Glass came to my Huron Hills house that same afternoon. Insurance covered everything and the service was excellent.'
                    },
                    {
                      name: 'Debbie F.',
                      neighborhood: 'Original Northglenn',
                      rating: 5,
                      text: 'Hailstorm got my car parked in the driveway -- no garage in our older neighborhood. They replaced the windshield the next day, handled the insurance claim, and it was zero out of pocket. Lifesaver.'
                    },
                    {
                      name: 'Kevin L.',
                      neighborhood: 'Eastlake',
                      rating: 5,
                      text: 'Got a chip from road sand on 104th that spread into a crack overnight. They came to my house near Eastlake and replaced it in about an hour. Professional, fast, and affordable. Will use again.'
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Northglenn Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Northglenn?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Northglenn. Call now for a free quote.</p>
                <CTAButtons source="northglenn-co-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Contact */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Northglenn</h3>
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
                      <span>Mobile Service - All Northglenn</span>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Northglenn" state="CO" />
                </div>

                {/* Nearby Locations */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li><Link href="/locations/thornton-co" className="text-pink-600 hover:underline">Thornton, CO →</Link></li>
                    <li><Link href="/locations/westminster-co" className="text-pink-600 hover:underline">Westminster, CO →</Link></li>
                    <li><Link href="/locations/commerce-city-co" className="text-pink-600 hover:underline">Commerce City, CO →</Link></li>
                    <li><Link href="/locations/brighton-co" className="text-pink-600 hover:underline">Brighton, CO →</Link></li>
                  </ul>
                </div>

                {/* Popular Vehicles */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Northglenn</h3>
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
