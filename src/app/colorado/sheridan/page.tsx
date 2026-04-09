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
  title: 'Windshield Replacement Sheridan CO | Mobile, $0 Deductible',
  description: 'Mobile windshield replacement & repair in Sheridan CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair sheridan, windshield replacement sheridan, auto glass sheridan co, mobile windshield service sheridan, sheridan co windshield',
  alternates: {
    canonical: 'https://pinkautoglass.com/colorado/sheridan/',
  },
  openGraph: {
    title: 'Windshield Replacement Sheridan CO | Mobile, $0 Deductible',
    description: 'Mobile windshield replacement & repair in Sheridan CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/colorado/sheridan/',
    type: 'website',
  },
};

export default function SheridanLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Sheridan?',
      answer: 'Yes! Mobile service is our specialty in Sheridan. We come to your home, office, or anywhere in the city. Whether you\'re near River Point shopping center, the Federal Boulevard corridor, or the Oxford Station light rail area, our fully equipped mobile units will meet you wherever is most convenient.'
    },
    {
      question: 'How quickly can you replace a windshield in Sheridan?',
      answer: 'We offer same-day windshield replacement throughout Sheridan. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'What Sheridan neighborhoods do you serve?',
      answer: 'We serve all of Sheridan including: Federal Boulevard Corridor, River Point area, Oxford Station area, Hampden Corridor, King Street area, North Sheridan, South Sheridan, and all surrounding neighborhoods. If you\'re anywhere in Sheridan, we\'ll come to you.'
    },
    {
      question: 'Does insurance cover windshield replacement in Sheridan?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Sheridan residents.'
    },
    {
      question: 'Why do so many Sheridan windshields get damaged?',
      answer: 'Sheridan sits at the intersection of three high-speed highways: US-285, US-85 (Santa Fe Drive), and Federal Boulevard. Heavy truck traffic on these routes kicks up road debris at high velocity. Combined with CDOT chip-seal resurfacing, freeze-thaw pothole cycles, and Front Range hailstorms, windshield damage is extremely common here.'
    },
    {
      question: 'Is it possible to get a mobile windshield replacement in a tight parking situation typical of Sheridan\'s commercial areas?',
      answer: 'Our mobile service is designed to be highly adaptable. Our technicians are skilled at performing replacements in various settings, including tighter parking spots found in Sheridan\'s commercial or apartment complexes. We simply require enough space to safely access and work around your vehicle.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Sheridan',
    state: 'CO',
    zipCode: '80110',
    latitude: 39.6472,
    longitude: -105.0253,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Sheridan, CO', url: 'https://pinkautoglass.com/colorado/sheridan/' }
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
                <span className="text-xl">Sheridan, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Sheridan's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Driving through Sheridan, with its dense urban landscape and proximity to busy routes like US-285, often means navigating heavy traffic and road hazards. This inner-ring suburb\'s mix of commercial areas and residential streets creates numerous opportunities for windshield damage.
              </p>
              <CTAButtons source="sheridan-co-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Sheridan, CO', href: '/colorado/sheridan/' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              {/* Why Sheridan Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Sheridan Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Sheridan is a tight-knit community of about 6,100 residents nestled at 5,280 feet in the heart of the south Denver metro. Though just 2.3 square miles, this city sits at the convergence of three major highways—US-285 (Hampden Avenue), US-85 (Santa Fe Drive), and Federal Boulevard—making windshield damage from road debris an everyday reality for Sheridan drivers.
                </p>

                <AboveFoldCTA location="location-sheridan-co" />

              {/* Windshield Damage in Sheridan */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Sheridan
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Debris and rocks from high-traffic roadways like US-285.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Construction materials from ongoing urban development and maintenance projects.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Hailstorms, a common threat to vehicles in the Denver Metro area.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Loose gravel and dirt from urban alleys or unpaved parking areas.</span>
                  </li>
                </ul>
              </section>

              {/* Our Services */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Services in Sheridan
                </h2>
                <p className="text-gray-700 mb-4">
                  We bring a full range of auto glass services directly to you in Sheridan:
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
                  Whether you're shopping at River Point, catching the light rail at Oxford Station for your downtown Denver commute, or navigating the busy Federal Boulevard corridor, Pink Auto Glass brings professional mobile service directly to you. We understand Sheridan's unique position—bordered by Denver and Englewood, crisscrossed by high-speed traffic—and we're ready to fix your windshield wherever you are in the city.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Sheridan Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Three Highways Converging:</strong> US-285 (55-65 mph expressway), US-85 (Santa Fe Drive), and SH-88 (Federal Boulevard) all pass through this 2.3-square-mile city. High-speed truck and semi traffic dramatically increases rock chip probability.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>US-285 Speed Transition Zone:</strong> Drivers on Hampden Avenue experience a speed drop from 65 mph to 55 mph near Lowell/Knox Court, creating braking zones where trucks kick up loose debris—a prime windshield chip hazard.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>CDOT Chip-Seal Resurfacing:</strong> Colorado DOT regularly applies aggregate chip-seal on US-85 and surrounding roads. Loose gravel in the weeks after application is a leading source of fresh windshield chips for Sheridan drivers.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>River Point Big-Box Traffic:</strong> Heavy delivery truck traffic serving Costco, Target, Home Depot, and other retailers along River Point Parkway and Santa Fe Drive kicks up road debris year-round.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Front Range Hail Alley:</strong> Sheridan sits squarely in the highest hail-frequency zone in North America. Peak season runs April through mid-June, with storms producing quarter-sized to baseball-sized hail that can shatter windshields in minutes.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Freeze-Thaw Amplification:</strong> At mile-high elevation, 40-degree single-day temperature swings are common. A minor chip picked up in October can become a full crack requiring replacement by February if left unrepaired.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-gray-700">
                  Don't let a small chip from Federal Boulevard traffic or a US-285 commute turn into a costly windshield replacement. We offer same-day mobile service throughout all of Sheridan—from the River Point shopping area to the quiet residential streets west of Federal.
                </p>
              </section>

              {/* Local Driving Tips */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Sheridan Driving Tips & Local FAQs</h2>
                <p className="text-lg text-gray-700 mb-4">
                  The US-285/Federal/Santa Fe triangle generates constant road debris. We provide safe curbside service at River Point, your home, or any location in the city.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">Can you meet me at River Point?</h3>
                    <p>Absolutely. We regularly service vehicles in the River Point parking areas while customers shop. Just let us know which store you'll be near.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">I commute via light rail—can you fix my car while I'm at work?</h3>
                    <p>Yes! Many Sheridan customers park at the Oxford Station lot and we complete the repair while they're downtown. Your windshield is ready when you return.</p>
                  </div>
                </div>
              </section>

              {/* Neighborhoods */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Sheridan Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Federal Blvd Corridor', 'River Point Area', 'Oxford Station Area',
                    'Hampden Corridor', 'King Street Area', 'North Sheridan',
                    'South Sheridan', 'West Federal', 'Lowell Blvd Area',
                    'Bonsai Flats', 'Bryant/Clay Blocks', 'Eliot/Hazel Court',
                    'Alcott Street Area', 'Girard Avenue Area', 'Milan Avenue'
                  ].map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don't see your area? We serve all of Sheridan - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area!
                </p>
              </section>

              {/* Services */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Sheridan</h2>
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
                      We come to you anywhere in Sheridan. Home, office, River Point, or Oxford Station parking.
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
                  Sheridan Hail Season Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Sheridan sits in the Front Range "Hail Alley"—the highest hail-frequency zone in North America. Peak season runs late April through mid-June, with storms capable of producing baseball-sized hail. After a hail event:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Act Fast:</strong> At mile-high elevation, small chips spread into large cracks rapidly with temperature changes—sometimes overnight</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Insurance Covers It:</strong> Comprehensive coverage typically covers hail damage with zero deductible in Colorado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>We're Ready:</strong> We increase capacity during hail season to serve Sheridan quickly—often same-day</span>
                  </li>
                </ul>
              </section>

              {/* Customer Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  What Sheridan Customers Say
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Maria L.',
                      neighborhood: 'Federal Blvd Area',
                      rating: 5,
                      text: 'Got a big chip on US-285 during my morning commute. They came to my house near Federal and had it repaired in 30 minutes. Insurance covered everything!'
                    },
                    {
                      name: 'Kevin T.',
                      neighborhood: 'River Point',
                      rating: 5,
                      text: 'They replaced my windshield while I was shopping at Costco in River Point. Dropped off my keys, did my shopping, and came back to a brand new windshield. Couldn\'t be easier.'
                    },
                    {
                      name: 'Amanda R.',
                      neighborhood: 'Oxford Station',
                      rating: 5,
                      text: 'I park at the Oxford light rail station for work. They fixed my cracked windshield while I was downtown. Perfect service for commuters.'
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Sheridan Customers</h2>
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
                  <Link href="/locations/englewood-co" className="text-pink-600 hover:underline font-medium">Englewood</Link>
                  <Link href="/locations/littleton-co" className="text-pink-600 hover:underline font-medium">Littleton</Link>
                  <Link href="/locations/denver-co" className="text-pink-600 hover:underline font-medium">Denver</Link>
                  <Link href="/locations/lakewood-co" className="text-pink-600 hover:underline font-medium">Lakewood</Link>
                  <Link href="/locations/glendale-co" className="text-pink-600 hover:underline font-medium">Glendale</Link>
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Sheridan?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Sheridan. Call now for a free quote.</p>
                <CTAButtons source="sheridan-co-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Sheridan Now</h3>
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
                      <span>Mobile Service - All Sheridan</span>
                    </div>
                  </div>
                </div>

                {/* Service Area Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Sheridan" state="CO" />
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li><Link href="/locations/englewood-co" className="text-pink-600 hover:underline">Englewood, CO →</Link></li>
                    <li><Link href="/locations/denver-co" className="text-pink-600 hover:underline">Denver, CO →</Link></li>
                    <li><Link href="/locations/lakewood-co" className="text-pink-600 hover:underline">Lakewood, CO →</Link></li>
                    <li><Link href="/locations/littleton-co" className="text-pink-600 hover:underline">Littleton, CO →</Link></li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Sheridan</h3>
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
