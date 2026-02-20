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
  title: 'Federal Heights Windshield Repair | Auto Glass Replacement | Same-Day | (720) 918-7465',
  description: 'Federal Heights auto glass repair & windshield replacement. Mobile service to your home or office. Often $0 with insurance. Same-day appointments. Lifetime warranty. Call (720) 918-7465.',
  keywords: 'windshield repair federal heights, windshield replacement federal heights, auto glass federal heights co, mobile windshield service federal heights',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/federal-heights-co',
  },
  openGraph: {
    title: 'Federal Heights Windshield Repair & Replacement CO | Pink Auto Glass',
    description: 'Federal Heights\' trusted auto glass experts. Mobile service, same-day appointments, lifetime warranty.',
    url: 'https://pinkautoglass.com/locations/federal-heights-co',
    type: 'website',
  },
};

export default function FederalHeightsLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Federal Heights?',
      answer: 'Yes! Mobile service is our specialty in Federal Heights. We come to your home, office, or anywhere in the city. Whether you\'re near the Water World area, along Federal Boulevard, or near the Thornton border, our fully equipped mobile units will meet you wherever is most convenient.'
    },
    {
      question: 'How quickly can you replace a windshield in Federal Heights?',
      answer: 'We offer same-day windshield replacement throughout Federal Heights. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What Federal Heights areas do you serve?',
      answer: 'We serve all of Federal Heights including: Federal Boulevard corridor, Water World area, 92nd Avenue corridor, Pecos Street area, and all residential blocks between 84th and 92nd. If you\'re anywhere in Federal Heights, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Federal Heights?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Federal Heights residents.'
    },
    {
      question: 'Why is windshield damage so common in Federal Heights?',
      answer: 'Federal Boulevard carries 30,000-40,000 vehicles per day through this 1.8-square-mile city. The heavy traffic volume creates constant road surface wear, pothole cycles, and airborne debris. Combined with I-25 access ramp traffic and Front Range hailstorms, windshield damage is extremely common here.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Federal Heights',
    state: 'CO',
    zipCode: '80260',
    latitude: 39.8583,
    longitude: -105.0153,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Federal Heights, CO', url: 'https://pinkautoglass.com/locations/federal-heights-co' }
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
                <span className="text-xl">Federal Heights, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Federal Heights' Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service • Same-Day Appointments • Lifetime Warranty
              </p>
              <CTAButtons source="federal-heights-co-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Federal Heights, CO', href: '/locations/federal-heights-co' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Federal Heights Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Federal Heights is a compact, close-knit community of about 14,000 residents packed into just 1.8 square miles in Adams County. Named after its defining artery—Federal Boulevard, which carries 30,000-40,000 vehicles daily through the city—Federal Heights sits at 5,302 feet elevation in the north Denver metro, bordered by Westminster, Thornton, and Northglenn.
                </p>

                <AboveFoldCTA location="location-federal-heights-co" />

                <p className="text-lg text-gray-700 mb-4">
                  The city is home to Water World, one of the largest water parks in the United States, spanning 70 acres. But for residents, the defining feature is Federal Boulevard's extreme traffic volume. All that traffic means constant road debris, pothole cycles, and rock chips. Pink Auto Glass brings professional mobile service right to your home or anywhere in the city—no need to navigate the busy boulevard to get your windshield fixed.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Federal Heights Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Extreme Federal Blvd Traffic:</strong> With 30,000-40,000 vehicles daily on Federal Boulevard, the road surface endures heavy wear. Chips, gravel, and debris are constantly airborne—especially from trucks and buses in this high-volume corridor.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Stop-and-Go Acceleration Zones:</strong> Federal Heights' compact 1.8-square-mile footprint means frequent acceleration and deceleration on Federal Blvd, US-36 on-ramps, and I-25 approaches. Following distance collapses at speed transitions, and rock strikes are common.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Road Surface Degradation:</strong> Federal Boulevard's extreme daily traffic creates surface wear and pothole cycles faster than typical suburban roads. Rough pavement launches small stones at trailing vehicles year-round.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>I-25 Corridor Hailstorms:</strong> Federal Heights sits in the north Denver metro storm track. Hail events that hit Thornton and Westminster also directly impact Federal Heights, with peak season from April through June.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Summer Water World Traffic:</strong> Hundreds of thousands of visitors converge on Water World's 70-acre facility each summer, dramatically increasing road congestion and debris exposure on Pecos Street and Federal Boulevard during June through August.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>UV Intensity at Altitude:</strong> At 5,302 feet, UV levels accelerate the breakdown of windshield adhesive and edge seals, making existing damage worse faster than at lower elevations.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  Don't wait for a small chip to become a full crack. We offer same-day mobile service throughout Federal Heights—we come to you so you don't have to battle Federal Boulevard traffic to get your windshield fixed.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Federal Heights Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Federal Boulevard and the I-25/US-36 interchanges generate the most windshield damage in the area. We come to your home so you don't have to add more mileage on these high-risk roads.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">Can you come to my home instead of me driving to a shop?</h3>
                    <p>That's exactly what we do. Mobile service is our specialty. We'll come to your house, apartment complex, or anywhere in Federal Heights that has a safe, level spot to work.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">How long does a repair take?</h3>
                    <p>A chip repair takes about 30 minutes. A full windshield replacement takes 60-90 minutes plus 1 hour of cure time. We handle everything on-site.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Federal Heights Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Federal Blvd Corridor', 'Water World Area', '92nd Ave Corridor',
                    'Pecos Street Area', 'North Federal Heights', 'Federal Heights West',
                    'Federal Heights Northwest', '84th-88th Ave Area', 'Perl Mack Manor',
                    'Sherrelwood Adjacent', 'Thornton Border Area', 'Westminster Border Area',
                    'Harris Park Adjacent', 'Hyland Greens Adjacent', 'Commercial Corridor'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don't see your area? We serve all of Federal Heights - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Federal Heights</h2>
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
                    <p className="text-gray-700 mb-4">We come to you anywhere in Federal Heights. Home or office—skip the Federal Blvd traffic.</p>
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
                  Federal Heights Hail Season Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Federal Heights sits in the north Denver metro I-25 corridor storm track. Hail events that impact Thornton and Westminster also directly hit Federal Heights. After a hailstorm:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Act Fast:</strong> Small chips spread quickly at altitude with temperature swings—don't wait for a small crack to become a full replacement</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Insurance Covers It:</strong> Comprehensive coverage typically covers hail damage with zero deductible in Colorado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>We Come to You:</strong> No need to drive on Federal Boulevard to reach a shop—we bring the shop to your home</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Federal Heights Customers Say</h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Rosa G.',
                      neighborhood: 'Federal Blvd Area',
                      rating: 5,
                      text: 'Got a big crack from a truck on Federal Boulevard. They came to my house the same day and replaced the whole windshield. My insurance covered everything and I didn\'t have to go anywhere.'
                    },
                    {
                      name: 'Marcus J.',
                      neighborhood: '92nd Ave Area',
                      rating: 5,
                      text: 'After the hailstorm, I called and they were at my place near 92nd the next morning. Fast, professional, and zero cost to me. Best auto glass service in the area.'
                    },
                    {
                      name: 'Linda P.',
                      neighborhood: 'Pecos Street Area',
                      rating: 5,
                      text: 'Small chip turned into a crack overnight. They repaired it in my apartment parking lot in 30 minutes. So much easier than trying to get to a shop on Federal.'
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Federal Heights Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Federal Heights?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Federal Heights. Call now for a free quote.</p>
                <CTAButtons source="federal-heights-co-cta" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Federal Heights</h3>
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
                      <span>Mobile Service - All Federal Heights</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Federal Heights" state="CO" />
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li><Link href="/locations/westminster-co" className="text-pink-600 hover:underline">Westminster, CO →</Link></li>
                    <li><Link href="/locations/thornton-co" className="text-pink-600 hover:underline">Thornton, CO →</Link></li>
                    <li><Link href="/locations/northglenn-co" className="text-pink-600 hover:underline">Northglenn, CO →</Link></li>
                    <li><Link href="/locations/broomfield-co" className="text-pink-600 hover:underline">Broomfield, CO →</Link></li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Federal Heights</h3>
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
