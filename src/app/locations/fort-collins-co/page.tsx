import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Clock, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Repair & Replacement Fort Collins, CO | Pink Auto Glass',
  description: 'Professional windshield repair and replacement in Fort Collins, Colorado. Mobile service to your home or office. Same-day appointments. Call (720) 918-7465 for a free quote.',
  keywords: 'windshield repair fort collins, windshield replacement fort collins, auto glass fort collins, mobile windshield service fort collins co',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/fort-collins-co',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Fort Collins, CO | Pink Auto Glass',
    description: 'Fort Collins\' trusted auto glass experts. Mobile service, same-day appointments, lifetime warranty.',
    url: 'https://pinkautoglass.com/locations/fort-collins-co',
    type: 'website',
  },
};

export default function FortCollinsLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Fort Collins?',
      answer: 'Yes! Mobile service is our specialty in Fort Collins. We come to your home, office, or anywhere in the Fort Collins area. Whether you\'re near CSU campus, Old Town, Harmony Corridor, or anywhere else in Fort Collins, we\'ll come to you with our fully equipped mobile units.'
    },
    {
      question: 'How quickly can you replace a windshield in Fort Collins?',
      answer: 'We offer same-day windshield replacement throughout Fort Collins. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What Fort Collins areas do you serve?',
      answer: 'We serve all of Fort Collins including: Old Town, CSU Campus, Midtown, South Fort Collins, Fossil Creek, Harmony Corridor, and all other Fort Collins neighborhoods. If you\'re in Fort Collins, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Fort Collins?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement for the price of your deductible. We work with all major insurance companies and assist with filing all paperwork for Fort Collins residents.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Fort Collins',
    state: 'CO',
    zipCode: '80524',
    latitude: 40.5853,
    longitude: -105.0844,
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Fort Collins, CO', url: 'https://pinkautoglass.com/locations/fort-collins-co' }
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
                <span className="text-xl">Fort Collins, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Fort Collins' Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service • Same-Day Appointments • Lifetime Warranty
              </p>
              <CTAButtons source="fort-collins-hero" />
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
              { label: 'Fort Collins, CO', href: '/locations/fort-collins-co' }
            ]}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Why Fort Collins Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Fort Collins Residents Choose Pink Auto Glass
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Welcome to "Choice City"—home to 170,000+ residents, Colorado State University's 30,000+ students, and the walkable charm of Old Town's Victorian-era streets. Fort Collins' Front Range location at 5,003 feet elevation means dramatic weather changes, frequent hailstorms from March-August, and constant I-25 construction bringing rock chips and road debris. Whether you're dealing with a chip from I-25 traffic, hail damage in the Harmony Corridor, or windshield cracks from temperature swings near Horsetooth Reservoir, Pink Auto Glass is Fort Collins' trusted solution.
                </p>

                <AboveFoldCTA location="location-fort-collins" />

                <p className="text-lg text-gray-700 mb-4">
                  We understand Fort Collins life. You're commuting on College Avenue, catching a CSU Rams game at Canvas Stadium, grabbing coffee in Old Town Square (near Library Park and the Historic Mosman House), exploring the shops and art galleries on Pearl Street, working in the Harmony Corridor tech offices, or hiking at Horsetooth Reservoir. That's why we bring our mobile service directly to you—whether you're in University Acres near CSU, family-friendly Rigden Farm, downtown Old Town, the Harmony Club master-planned community, or anywhere else in Northern Colorado's largest city.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Fort Collins Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>CSU Campus Traffic:</strong> 30,000+ students create heavy congestion on College Avenue, Prospect Road, and around Canvas Stadium/Moby Arena. More traffic = more rock chips from construction vehicles, delivery trucks, and parking lot fender-benders.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-25 Expansion Construction:</strong> The ongoing I-25 widening project between Fort Collins and Loveland creates miles of construction zones with loose gravel, uneven pavement, and debris from construction vehicles. This is the #1 cause of windshield chips for Fort Collins commuters.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Old Town Parking Challenges:</strong> Narrow streets, parallel parking, and historic buildings mean tight quarters. Windshield damage from parking mishaps is common in the Old Town district, especially near the Aggie Theatre and Downtown Artery.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Horsetooth Reservoir Gravel Roads:</strong> Popular recreation areas like Horsetooth, Lory State Park, and foothills trails have gravel access roads. Trucks and SUVs kick up rocks that damage windshields, especially on summer weekends.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Front Range Hail Corridor:</strong> Fort Collins sits directly in the path of severe thunderstorms that develop over the foothills. Hail season (March-August) brings frequent storms with golf ball to baseball-sized hail, especially in South Fort Collins and the Harmony Corridor.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Temperature Extremes:</strong> At 5,003 feet elevation, Fort Collins experiences wild temperature swings—32°F mornings and 75°F afternoons are common in spring/fall. These rapid changes cause small chips to propagate into full cracks within hours.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  We know Fort Collins intimately. Our technicians understand the specific challenges you face—whether it's I-25 construction debris, CSU campus parking lot mishaps, Old Town's tight streets, or hail damage in South Fort Collins. Don't let a small chip from College Avenue traffic turn into a costly windshield replacement—we offer same-day mobile service throughout all Fort Collins neighborhoods, from CSU's Oval to the Harmony Corridor.
                </p>
              </section>

              {/* Service Area Map */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Fort Collins Areas We Serve
                </h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Old Town', 'CSU Campus', 'Midtown',
                    'South Fort Collins', 'Fossil Creek', 'Harmony Corridor',
                    'Timberline', 'Prospect', 'Mulberry',
                    'Foothills', 'Spring Creek', 'Rigden Farm',
                    'Oakridge', 'Northeast', 'Northwest',
                    'Westside', 'Eastside', 'College West'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don't see your neighborhood? We serve all of Fort Collins - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              {/* Our Services in Fort Collins */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Services in Fort Collins
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Professional Service</p>
                    <p className="text-gray-700 mb-4">
                      Fast repair for chips and small cracks. Often covered 100% by insurance with no deductible.
                    </p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">
                      Learn More →
                    </Link>
                  </div>

                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Professional Service</p>
                    <p className="text-gray-700 mb-4">
                      Complete windshield replacement with OEM quality glass. ADAS calibration available.
                    </p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">
                      Learn More →
                    </Link>
                  </div>

                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Service</h3>
                    <p className="text-blue-600 font-bold text-2xl mb-3">No Extra Charge</p>
                    <p className="text-gray-700 mb-4">
                      We come to you anywhere in Fort Collins. Home, office, or curbside service available.
                    </p>
                    <Link href="/services/mobile-service" className="text-blue-600 hover:underline font-semibold">
                      Learn More →
                    </Link>
                  </div>

                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">ADAS Calibration</h3>
                    <p className="text-blue-600 font-bold text-2xl mb-3">Professional Calibration</p>
                    <p className="text-gray-700 mb-4">
                      Required for 2018+ vehicles with advanced safety features.
                    </p>
                    <Link href="/services/adas-calibration" className="text-blue-600 hover:underline font-semibold">
                      Learn More →
                    </Link>
                  </div>
                </div>
              </section>

              {/* Fort Collins-Specific Info */}
              <section className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-yellow-600" />
                  Front Range Weather Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Fort Collins experiences varied weather conditions including hailstorms and rapid temperature changes. After weather damage:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Act Fast:</strong> Small chips can spread into large cracks with temperature fluctuations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Insurance Coverage:</strong> Comprehensive coverage typically covers weather damage for the price of your deductible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Quick Response:</strong> We serve Fort Collins with fast mobile service throughout the year</span>
                  </li>
                </ul>
              </section>

              {/* Customer Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  What Fort Collins Customers Say
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Tom R.',
                      neighborhood: 'Old Town',
                      rating: 5,
                      text: 'They came to my house near Old Town and replaced my windshield while I worked from home. Professional service and the quality is excellent!'
                    },
                    {
                      name: 'Jennifer K.',
                      neighborhood: 'Harmony Corridor',
                      rating: 5,
                      text: 'Got a chip from gravel on Highway 287. Pink Auto Glass came to my office and repaired it the same day. Fast and affordable!'
                    },
                    {
                      name: 'David M.',
                      neighborhood: 'Fossil Creek',
                      rating: 5,
                      text: 'After a spring hailstorm, they handled everything with my insurance. No hassle, great communication, and my windshield looks perfect.'
                    }
                  ].map((review, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-3">
                        <div className="flex text-yellow-400">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-current" />
                          ))}
                        </div>
                        <span className="ml-3 text-gray-600 text-sm">• {review.neighborhood}</span>
                      </div>
                      <p className="text-gray-700 mb-2">"{review.text}"</p>
                      <p className="text-gray-900 font-semibold">- {review.name}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQs */}
              {/* Local Tips & FAQs */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Fort Collins Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">I‑25/Harmony corridors and campus routes generate frequent chips. We coordinate safe curbside service in Midtown, South Fort Collins, Fossil Creek, and Old Town.</p>
                <div className="space-y-4 text-gray-700 mb-6">
                  <div>
                    <h3 className="font-semibold">Do you service CSU and Old Town?</h3>
                    <p>Yes—share your exact location and we’ll meet you at a safe nearby spot.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Is calibration included?</h3>
                    <p>If your vehicle requires it (common on 2018+), we include ADAS calibration and provide documentation.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Common Questions from Fort Collins Customers
                </h2>
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

              {/* CTA Section */}
              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Fort Collins?</h2>
                <p className="text-xl mb-6 text-pink-100">
                  Same-day mobile service anywhere in Fort Collins. Call now for a free quote.
                </p>
                <CTAButtons source="fort-collins-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Contact */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Fort Collins Now</h3>
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
                      <span>Mobile Service - All Fort Collins</span>
                    </div>
                  </div>
                </div>

                {/* Nearby Locations */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/locations/denver-co" className="text-pink-600 hover:underline">
                        Denver, CO →
                      </Link>
                    </li>
                    <li>
                      <Link href="/locations/boulder-co" className="text-pink-600 hover:underline">
                        Boulder, CO →
                      </Link>
                    </li>
                    <li>
                      <Link href="/locations/thornton-co" className="text-pink-600 hover:underline">
                        Thornton, CO →
                      </Link>
                    </li>
                    <li>
                      <Link href="/locations/westminster-co" className="text-pink-600 hover:underline">
                        Westminster, CO →
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Popular Vehicles */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Fort Collins</h3>
                  <p className="text-sm text-gray-600 mb-3">Vehicle-specific pricing:</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/vehicles/subaru-outback-windshield-replacement-denver" className="text-pink-600 hover:underline">
                        Subaru Outback →
                      </Link>
                    </li>
                    <li>
                      <Link href="/vehicles/toyota-rav4-windshield-replacement-denver" className="text-pink-600 hover:underline">
                        Toyota RAV4 →
                      </Link>
                    </li>
                    <li>
                      <Link href="/vehicles/honda-cr-v-windshield-replacement-denver" className="text-pink-600 hover:underline">
                        Honda CR-V →
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
