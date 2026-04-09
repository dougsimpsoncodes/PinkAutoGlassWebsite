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
  title: 'Windshield Replacement Fountain CO | Mobile, $0 Deductible',
  description: 'Mobile windshield replacement & repair in Fountain CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair fountain co, windshield replacement fountain, auto glass fountain colorado, mobile windshield service fountain, fort carson windshield replacement, fountain co auto glass',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/fountain-co',
  },
  openGraph: {
    title: 'Windshield Replacement Fountain CO | Mobile, $0 Deductible',
    description: 'Mobile windshield replacement & repair in Fountain CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/fountain-co',
    type: 'website',
  },
};

export default function FountainLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Fountain?',
      answer: 'Yes! Mobile service is our specialty in Fountain. We come to your home, office, or anywhere in Fountain and surrounding areas. Our fully equipped mobile units serve all Fountain neighborhoods from Fountain Valley Ranch to Lorson Ranch and everywhere in between.'
    },
    {
      question: 'How quickly can you replace a windshield in Fountain?',
      answer: 'We offer same-day windshield replacement throughout Fountain. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving.'
    },
    {
      question: 'Do you serve military families near Fort Carson?',
      answer: 'Absolutely. A large portion of our Fountain customers are military families stationed at Fort Carson. We understand the demands of military schedules and offer flexible appointment times. We provide mobile service to on-post housing, off-post neighborhoods like Lorson Ranch and Mesa Ridge, and can work around deployment and PCS timelines.'
    },
    {
      question: 'Does insurance cover windshield replacement in Fountain?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies including USAA and Tricare-affiliated plans, and we handle all the paperwork for Fountain residents.'
    },
    {
      question: 'What causes so many windshield chips on I-25 near Fountain?',
      answer: 'The I-25 corridor through Fountain carries heavy truck traffic between Colorado Springs and Pueblo. Semis kick up gravel and road debris at highway speeds, and ongoing construction projects add loose material to the roadway. Combined with high-plains wind that blows grit across the highway, this stretch is one of the most common sources of windshield damage in El Paso County.'
    },
  ];

  const neighborhoods = [
    'Fountain Valley Ranch', 'Cross Creek', 'Southgate',
    'Mesa Ridge', 'Ventana', 'Creekside',
    'Fountain Bluffs', 'Eagleridge', 'Lorson Ranch',
    'Diamondback', 'Heritage', 'Fountain Mesa',
    'Northgate', 'Bridle Pass', 'Countryside'
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Fountain',
    state: 'CO',
    zipCode: '80817',
    latitude: 38.6822,
    longitude: -104.7008,
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Fountain, CO', url: 'https://pinkautoglass.com/locations/fountain-co' }
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
                <span className="text-xl">Fountain, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Fountain&#39;s Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service to Fort Carson Families & All Fountain Neighborhoods
              </p>
              <CTAButtons source="fountain-co-hero" />
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
              { label: 'Fountain, CO', href: '/locations/fountain-co' }
            ]}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Why Fountain Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Fountain Chooses Pink Auto Glass
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Fountain sits at the crossroads of I-25 and US-85/87, where roughly 34,000 residents share the road with heavy truck traffic, Fort Carson military convoys, and construction crews working the Santa Fe Avenue corridor. At 5,556 feet of elevation in El Paso County, the high-plains environment adds wind-driven grit, freeze-thaw stress, and seasonal hailstorms to the mix. Pink Auto Glass understands these conditions because we service Fountain drivers every day.
                </p>

                <AboveFoldCTA location="location-fountain-co" />

                <p className="text-lg text-gray-700 mb-4">
                  A large share of Fountain&#39;s population is connected to Fort Carson, and we built our mobile service model with military families in mind. Whether you are at home in Lorson Ranch waiting for a deployment brief, at work near the base gates, or picking up kids at Fountain-Fort Carson High School, we bring the shop to you. Our technicians carry OEM-quality glass, professional-grade adhesives rated for Colorado&#39;s temperature extremes, and the ADAS calibration tools modern vehicles require. Same-day appointments are the norm, and we handle all insurance paperwork so you can focus on what matters.
                </p>
              </section>

              {/* Windshield Challenges Blue Box */}
              <section>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Fountain&#39;s Windshield Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>I-25 truck rock chips</strong> - Heavy semi traffic between Colorado Springs and Pueblo kicks up gravel at highway speed</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>US-85/87 construction debris</strong> - Ongoing Santa Fe Avenue projects leave loose aggregate and road material on the surface</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>Fort Carson military convoy traffic</strong> - Tactical vehicles and equipment transporters create debris and vibration on approach roads</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>High-plains wind and grit</strong> - Sustained winds carry sand and small rocks across exposed roadways</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>Freeze-thaw cycles at 5,556 ft</strong> - Overnight lows expand small chips into spreading cracks by morning</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>Dust storms from the Arkansas River valley</strong> - Seasonal dust events sandblast windshields and reduce visibility</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Driving Tips */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Fountain Driving Tips & Local Q&A</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Between the I-25 corridor, US-85/87, and CO-16, Fountain drivers log serious highway miles. Here are answers to questions we hear from local customers every week.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">I commute on I-25 daily. How can I protect my windshield?</h3>
                    <p>Keep at least a four-second following distance behind semis and avoid the right lane where trucks concentrate. If you get a chip, call us the same day. Colorado temperature swings can turn a quarter-sized chip into a full crack overnight, especially during spring and fall when overnight lows drop well below freezing.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Can you come to my neighborhood near Fort Carson?</h3>
                    <p>Yes. We provide mobile service to every Fountain neighborhood including those closest to the base gates like Mesa Ridge, Ventana, and Lorson Ranch. We can also meet you at your workplace or any safe parking area. Military families with USAA or other military-affiliated insurance are welcome, and we handle all claims directly.</p>
                  </div>
                </div>
              </section>

              {/* Neighborhoods Grid */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Fountain Neighborhoods We Serve
                </h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {neighborhoods.map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don&#39;t see your neighborhood? We serve all of Fountain - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area.
                </p>
              </section>

              {/* 4 Service Cards */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Services in Fountain
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
                      We come to you anywhere in Fountain. Home, office, or base-adjacent parking - no extra fee.
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
                  Fountain Hail & Weather Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  Fountain sits in the southern portion of Colorado&#39;s Front Range hail corridor. Severe thunderstorms roll through regularly from May to September, and the open terrain south of Colorado Springs gives storms room to build. After a hail event:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Act Fast:</strong> Colorado&#39;s 50-degree daily temperature swings can turn hail chips into full cracks within hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Insurance Covers It:</strong> Comprehensive policies typically cover hail damage with zero deductible in Colorado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>We Scale Up:</strong> We increase capacity during hail season to serve Fountain residents quickly, often same-day</span>
                  </li>
                </ul>
              </section>

              {/* Customer Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  What Fountain Customers Say
                </h2>
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-3">
                      &quot;My husband deployed last month and I got a rock chip on I-25 the same week. Pink Auto Glass came to our house in Lorson Ranch the next morning and had it fixed in under an hour. They handled the USAA claim for me, which was one less thing to worry about. Highly recommend for any military family.&quot;
                    </p>
                    <p className="text-sm text-gray-500">- Sarah M., <span className="font-medium">Lorson Ranch</span></p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-3">
                      &quot;A truck on I-25 threw a rock through my windshield right by the Fountain exit. Called Pink Auto Glass and they replaced it the same afternoon at my house in Mesa Ridge. Professional, fast, and the new glass looks perfect. Zero out of pocket with my insurance.&quot;
                    </p>
                    <p className="text-sm text-gray-500">- Jason T., <span className="font-medium">Mesa Ridge</span></p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-3">
                      &quot;We had hail damage on both our vehicles after a storm came through Fountain Valley Ranch. Pink Auto Glass replaced both windshields in one visit and handled all the insurance paperwork. Great communication from start to finish.&quot;
                    </p>
                    <p className="text-sm text-gray-500">- Michelle R., <span className="font-medium">Fountain Valley Ranch</span></p>
                  </div>
                </div>
              </section>

              {/* FAQ Accordions */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Common Questions from Fountain Customers
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
              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Fountain?</h2>
                <p className="text-xl mb-6 text-pink-100">
                  Same-day mobile service anywhere in Fountain. Call now for a free quote.
                </p>
                <CTAButtons source="fountain-co-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Contact Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Fountain Now</h3>
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
                      <span>Mobile Service - All Fountain</span>
                    </div>
                  </div>
                </div>

                {/* Google Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Fountain" state="CO" />
                </div>

                {/* Nearby Service Areas */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/locations/colorado-springs-co" className="text-pink-600 hover:underline">Colorado Springs, CO →</Link>
                    </li>
                    <li>
                      <Link href="/locations/security-widefield-co" className="text-pink-600 hover:underline">Security-Widefield, CO →</Link>
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
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Fountain</h3>
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
