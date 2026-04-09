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
  title: 'Windshield Replacement Security Widefield | Mobile',
  description: 'Mobile windshield replacement & repair in Security Widefield CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair security-widefield co, windshield replacement security widefield, auto glass security widefield colorado, mobile windshield service security widefield, fort carson windshield, peterson sfb auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/security-widefield-co',
  },
  openGraph: {
    title: 'Windshield Replacement Security Widefield | Mobile',
    description: 'Mobile windshield replacement & repair in Security Widefield CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/security-widefield-co',
    type: 'website',
  },
};

export default function SecurityWidefieldLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Security-Widefield?',
      answer: 'Yes! Mobile service is our specialty in Security-Widefield. We come to your home, office, or anywhere in the community. Our fully equipped mobile units serve all neighborhoods from Security and Widefield proper to Stratmoor Hills, Meadow Lake, and every area in between.'
    },
    {
      question: 'How quickly can you replace a windshield in Security-Widefield?',
      answer: 'We offer same-day windshield replacement throughout Security-Widefield. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'Do you work with military insurance like USAA?',
      answer: 'Absolutely. Many of our Security-Widefield customers are military families connected to Fort Carson or Peterson Space Force Base. We work with USAA, GEICO Military, and all major insurance providers. We handle the entire claims process so you do not have to deal with paperwork, and most comprehensive policies cover replacement with zero deductible.'
    },
    {
      question: 'Does insurance cover windshield replacement in Security-Widefield?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Security-Widefield residents. Colorado law is favorable for windshield claims.'
    },
    {
      question: 'Why is windshield damage so common in Security-Widefield?',
      answer: 'Security-Widefield sits in a geographic bowl between Fort Carson and Colorado Springs, which concentrates afternoon hail cells. CO-85/87 carries high-speed traffic that kicks up debris, and the area has ongoing road work related to PFAS remediation and infrastructure improvements. Add gravel shoulders in Stratmoor and temperature inversions that stress glass, and the combination makes windshield damage a common problem for local drivers.'
    },
  ];

  const neighborhoods = [
    'Security', 'Widefield', 'Stratmoor Hills',
    'Stratmoor Valley', 'Meadow Lake', 'Carmel Estates',
    'Country Club', 'Widefield Estates', 'Kettle Creek',
    'Mountain Vista', 'Sunrise', 'Brookside',
    'Rainbow Falls Park', 'Janitell', 'Cimarron Hills'
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Security-Widefield',
    state: 'CO',
    zipCode: '80911',
    latitude: 38.7478,
    longitude: -104.7147,
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Security-Widefield, CO', url: 'https://pinkautoglass.com/locations/security-widefield-co' }
  ]);

  const combinedSchema = combineSchemas(localBusinessSchema, faqSchema, breadcrumbSchema);

  return (
    <>
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
                <span className="text-xl">Security-Widefield, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Security-Widefield&#39;s Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Security-Widefield\'s close proximity to Fort Carson and I-25 creates a high volume of diverse traffic, from military vehicles to daily commuters. This environment, coupled with the region\'s intense weather, consistently exposes windshields to potential damage.
              </p>
              <CTAButtons source="security-widefield-co-hero" />
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
              { label: 'Security-Widefield, CO', href: '/locations/security-widefield-co' }
            ]}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Why Security-Widefield Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Security-Widefield Chooses Pink Auto Glass
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Security-Widefield is a tight-knit community of approximately 40,000 residents in El Paso County, situated between Fort Carson to the south and Colorado Springs to the north. The area sits at about 5,800 feet of elevation in a natural bowl that funnels afternoon storm cells and creates temperature inversions that put constant stress on automotive glass. CO-85/87 runs through the heart of the community carrying fast-moving traffic, and Fontaine Boulevard connects residential areas to base gates and commercial districts.
                </p>

                <AboveFoldCTA location="location-security-widefield-co" />

              {/* Windshield Damage in Security-Widefield */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Windshields Get Damaged in Security-Widefield
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Rocks and debris from heavy traffic on I-25 and nearby main roads.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Gravel or dirt kicked up by military vehicles operating in the area.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Sudden hailstorms, a frequent occurrence in the southern Colorado Springs region.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>Debris from construction or road maintenance projects within the community.</span>
                  </li>
                </ul>
              </section>

              {/* Our Services */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Services in Security Widefield
                </h2>
                <p className="text-gray-700 mb-4">
                  We bring a full range of auto glass services directly to you in Security Widefield:
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
                  Pink Auto Glass has deep roots in the Security-Widefield community. Many of our customers are military families stationed at Fort Carson or Peterson Space Force Base, and we designed our mobile service to fit the unpredictable schedules that come with military life. We arrive at your driveway in Stratmoor Hills, your parking lot near Widefield Estates, or wherever is convenient. Our technicians use OEM-quality glass and adhesives engineered for Colorado conditions, and every replacement includes ADAS calibration when your vehicle requires it. We process insurance claims directly with USAA, GEICO Military, and all major providers so you never have to chase paperwork.
                </p>
              </section>

              {/* Windshield Challenges Blue Box */}
              <section>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Security-Widefield&#39;s Windshield Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>CO-85/87 high-speed chips</strong> - Fast-moving traffic on the main corridor flings gravel and road debris into windshields daily</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>Fort Carson gate approach road debris</strong> - Military vehicles and heavy equipment leave sand, gravel, and metal fragments near base entrances</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>Ongoing PFAS remediation road work</strong> - Infrastructure projects create loose surfaces and construction debris across the area</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>Afternoon hailstorm corridor</strong> - The bowl terrain channels and intensifies storm cells moving south from Colorado Springs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>Gravel shoulder roads in Stratmoor</strong> - Unpaved edges kick up rocks when vehicles pull off or pass on narrow residential roads</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>Temperature inversion cracking in bowl terrain</strong> - Cold air trapped overnight causes rapid temperature drops that expand small chips into cracks</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Driving Tips */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Security-Widefield Driving Tips & Local Q&A</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Between CO-85/87, I-25, and Fontaine Boulevard, Security-Widefield drivers face a steady stream of road hazards. Here is what local customers ask us most often.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">I drive CO-85/87 every day. What should I watch for?</h3>
                    <p>The speed limit changes and road surface transitions along CO-85/87 create zones where debris accumulates. Stay out of the far-right lane when possible, keep generous following distance, and address chips immediately. In Security-Widefield&#39;s bowl terrain, overnight temperatures can drop 40-50 degrees from the daytime high, which is enough to turn a small chip into a spreading crack by morning.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Can you come to the Stratmoor area or near the base gates?</h3>
                    <p>Yes, we service every part of Security-Widefield including Stratmoor Hills, Stratmoor Valley, the neighborhoods near Gate 1 and Gate 20 at Fort Carson, and all of Widefield proper. We bring everything we need in our mobile units, so there is no need to drive to a shop.</p>
                  </div>
                </div>
              </section>

              {/* Neighborhoods Grid */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Security-Widefield Neighborhoods We Serve
                </h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {neighborhoods.map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don&#39;t see your neighborhood? We serve all of Security-Widefield - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area.
                </p>
              </section>

              {/* 4 Service Cards */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Services in Security-Widefield
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Same-Day Service</p>
                    <p className="text-gray-700 mb-4">
                      Fast repair for chips and small cracks. Often covered 100% by insurance with no deductible.
                    </p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">
                      Learn More →
                    </Link>
                  </div>

                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-pink-600 font-bold text-2xl mb-3">Lifetime Warranty</p>
                    <p className="text-gray-700 mb-4">
                      Complete windshield replacement with OEM-quality glass. ADAS calibration included when required.
                    </p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">
                      Learn More →
                    </Link>
                  </div>

                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Service</h3>
                    <p className="text-blue-600 font-bold text-2xl mb-3">No Extra Charge</p>
                    <p className="text-gray-700 mb-4">
                      We come to you anywhere in Security-Widefield. Home, office, or near the base gates - no extra fee.
                    </p>
                    <Link href="/services/mobile-service" className="text-blue-600 hover:underline font-semibold">
                      Learn More →
                    </Link>
                  </div>

                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">ADAS Calibration</h3>
                    <p className="text-blue-600 font-bold text-2xl mb-3">Included When Needed</p>
                    <p className="text-gray-700 mb-4">
                      Required for most 2018+ vehicles. Professional windshield camera and sensor recalibration.
                    </p>
                    <Link href="/services/adas-calibration" className="text-blue-600 hover:underline font-semibold">
                      Learn More →
                    </Link>
                  </div>
                </div>
              </section>

              {/* Hail/Weather Yellow Box */}
              <section className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-yellow-600" />
                  Security-Widefield Hail & Weather Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Security-Widefield&#39;s bowl-shaped terrain between Fort Carson and the southern edge of Colorado Springs creates a natural funnel for severe thunderstorms. The area is squarely in Colorado&#39;s hail corridor, with the most intense activity running from May through September. After a hail event:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Act Fast:</strong> Temperature inversions in the bowl terrain can drop nighttime temps sharply, turning hail chips into spreading cracks by sunrise</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Insurance Covers It:</strong> Comprehensive policies in Colorado typically cover hail damage with zero deductible, including USAA and military plans</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>We Scale Up:</strong> We increase staffing during hail season to serve Security-Widefield residents quickly, often with same-day availability</span>
                  </li>
                </ul>
              </section>

              {/* Customer Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  What Security-Widefield Customers Say
                </h2>
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-3">
                      &quot;We just PCS&#39;d to Fort Carson and got a cracked windshield within the first week from road debris on CO-85. Pink Auto Glass came to our rental in Stratmoor Hills while we were still unpacking. They filed everything with USAA and we paid nothing. Made the transition a little easier.&quot;
                    </p>
                    <p className="text-sm text-gray-500">- Amanda K., <span className="font-medium">Stratmoor Hills</span></p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-3">
                      &quot;A hailstorm hit Widefield hard last June and cracked both my windshield and back glass. Pink Auto Glass fit me in the next day and replaced both. They were thorough, professional, and the insurance claim was completely painless. Best auto glass experience I have had in Colorado.&quot;
                    </p>
                    <p className="text-sm text-gray-500">- Dave P., <span className="font-medium">Widefield Estates</span></p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-3">
                      &quot;I got a rock chip near the Fountain Boulevard and CO-85 intersection and called Pink Auto Glass that afternoon. The technician came to my house in Meadow Lake, repaired the chip in about 30 minutes, and it was completely covered by my insurance. Very professional and on time.&quot;
                    </p>
                    <p className="text-sm text-gray-500">- Lisa G., <span className="font-medium">Meadow Lake</span></p>
                  </div>
                </div>
              </section>

              {/* FAQ Accordions */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Common Questions from Security-Widefield Customers
                </h2>
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

              {/* Pink CTA Section */}
              {/* Nearby Cities */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  We Also Serve Nearby
                </h2>
                <div className="flex flex-wrap gap-4">
                  <Link href="/locations/fountain-co" className="text-pink-600 hover:underline font-medium">Fountain</Link>
                  <Link href="/locations/fort-carson-co" className="text-pink-600 hover:underline font-medium">Fort Carson</Link>
                  <Link href="/locations/colorado-springs-co" className="text-pink-600 hover:underline font-medium">Colorado Springs</Link>
                  <Link href="/locations/cimarron-hills-co" className="text-pink-600 hover:underline font-medium">Cimarron Hills</Link>
                  <Link href="/locations/falcon-co" className="text-pink-600 hover:underline font-medium">Falcon</Link>
                </div>
              </section>

              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Security-Widefield?</h2>
                <p className="text-xl mb-6 text-pink-100">
                  Same-day mobile service anywhere in Security-Widefield. Call now for a free quote.
                </p>
                <CTAButtons source="security-widefield-co-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Contact Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Security-Widefield Now</h3>
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
                      <span>Open 7 Days: 7am - 7pm</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Mobile Service - All Security-Widefield</span>
                    </div>
                  </div>
                </div>

                {/* Google Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Security-Widefield" state="CO" />
                </div>

                {/* Nearby Service Areas */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/locations/colorado-springs-co" className="text-pink-600 hover:underline">Colorado Springs, CO →</Link>
                    </li>
                    <li>
                      <Link href="/locations/fountain-co" className="text-pink-600 hover:underline">Fountain, CO →</Link>
                    </li>
                    <li>
                      <Link href="/locations/castle-rock-co" className="text-pink-600 hover:underline">Castle Rock, CO →</Link>
                    </li>
                    <li>
                      <Link href="/locations/manitou-springs-co" className="text-pink-600 hover:underline">Manitou Springs, CO →</Link>
                    </li>
                  </ul>
                </div>

                {/* Popular Vehicles */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Security-Widefield</h3>
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
