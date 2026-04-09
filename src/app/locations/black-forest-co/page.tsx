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
  title: 'Windshield Replacement Black Forest CO | Mobile',
  description: 'Mobile windshield replacement & repair in Black Forest CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
  keywords: 'windshield repair black forest co, windshield replacement black forest, auto glass black forest colorado, mobile windshield service black forest, black forest co auto glass, rural auto glass el paso county',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/black-forest-co',
  },
  openGraph: {
    title: 'Windshield Replacement Black Forest CO | Mobile',
    description: 'Mobile windshield replacement & repair in Black Forest CO. Same-day service, $0 deductible often, lifetime warranty. We come to you! (720) 918-7465.',
    url: 'https://pinkautoglass.com/locations/black-forest-co',
    type: 'website',
  },
};

export default function BlackForestLocationPage() {
  const faqs = [
    {
      question: 'Do you offer mobile windshield service in Black Forest?',
      answer: 'Yes! Mobile service is essential in Black Forest because of the community\'s rural layout. We drive to your property regardless of whether you are on a paved road or a dirt driveway. Our mobile units have navigated every corner of Black Forest from Hodgen Road to Vollmer Road and everywhere in between.'
    },
    {
      question: 'How quickly can you replace a windshield in Black Forest?',
      answer: 'We offer same-day windshield replacement throughout Black Forest. Most appointments are completed within 2-4 hours of your call. The actual replacement takes 60-90 minutes, and we recommend at least 1 hour of cure time before driving. We account for travel time on Black Forest\'s rural roads when scheduling.'
    },
    {
      question: 'Can your mobile units reach properties on dirt roads?',
      answer: 'Absolutely. Our mobile service vehicles are equipped to handle Black Forest\'s extensive network of dirt and gravel roads. We regularly service properties on unpaved roads off Hodgen, Black Forest Road, Shoup, and Vollmer. If a standard vehicle can reach your property, so can we. Just give us your address and any gate codes, and we will be there.'
    },
    {
      question: 'Does insurance cover windshield replacement in Black Forest?',
      answer: 'Yes, most comprehensive insurance policies in Colorado cover windshield replacement with zero deductible. We work with all major insurance companies and handle all the paperwork for Black Forest residents. This is especially helpful given how common gravel road chip damage is in the area.'
    },
    {
      question: 'Why do Black Forest residents need windshield replacement so often?',
      answer: 'Black Forest\'s combination of gravel and dirt roads, higher elevation (7,000-7,200 feet), and rural truck traffic creates a perfect storm for windshield damage. Gravel spray from oncoming vehicles is a daily hazard on unpaved roads. The higher elevation means more intense hailstorms, and extreme overnight freeze cycles that can reach well below zero degrees push small chips into full cracks rapidly. Pine sap is another factor, as it can chemically etch glass over time if not cleaned.'
    },
  ];

  const neighborhoods = [
    'Black Forest Estates', 'Timber Pines', 'Pine Estates',
    'Shiloh Ranch', 'Walden Pines', 'Latigo Trail',
    'Paint Brush Hills', 'Vollmer Ranch', 'North Fork',
    'Pinecrest Estates', 'Forest Lakes', 'Black Squirrel Creek',
    'Eastonville Road', 'Wrangler Ranch', 'Flying Horse North'
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Black Forest',
    state: 'CO',
    zipCode: '80908',
    latitude: 39.0133,
    longitude: -104.6339,
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Black Forest, CO', url: 'https://pinkautoglass.com/locations/black-forest-co' }
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
                <span className="text-xl">Black Forest, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Black Forest&#39;s Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                Mobile Service to Rural Properties, Dirt Roads & All Black Forest Neighborhoods
              </p>
              <CTAButtons source="black-forest-co-hero" />
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
              { label: 'Black Forest, CO', href: '/locations/black-forest-co' }
            ]}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Why Black Forest Chooses Us */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Black Forest Chooses Pink Auto Glass
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Black Forest is a rural, unincorporated community of approximately 15,000 residents in northeastern El Paso County, spread across pine-covered hills at 7,000 to 7,200 feet of elevation. The area is defined by its Ponderosa pine forests, large-lot properties, and an extensive network of dirt and gravel roads connecting neighborhoods along Hodgen Road, Black Forest Road, and Shoup/Vollmer Road. This is a community that values self-reliance - qualities forged even deeper after the devastating 2013 Black Forest Fire, which destroyed 502 homes and tested the resolve of every resident.
                </p>

                <AboveFoldCTA location="location-black-forest-co" />

                <p className="text-lg text-gray-700 mb-4">
                  Pink Auto Glass built our mobile service for communities exactly like Black Forest. When the nearest auto glass shop is a 20-30 minute drive into Colorado Springs, having a technician come to your property is not a convenience - it is a necessity. Our mobile units navigate Black Forest&#39;s dirt roads daily, arriving at your driveway with OEM-quality glass, professional-grade adhesives rated for extreme temperature swings, and ADAS calibration equipment for modern trucks and SUVs. We understand that Black Forest residents drive larger vehicles designed for rural terrain, and we stock glass sizes to match. Insurance paperwork is handled entirely by us, so you can get back to the land and the lifestyle that brought you here.
                </p>
              </section>

              {/* Windshield Challenges Blue Box */}
              <section>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Black Forest&#39;s Windshield Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>Prevalent gravel and dirt roads</strong> - Oncoming vehicles on unpaved roads kick up rocks that strike windshields at close range</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>Post-2013 wildfire dead tree falling debris</strong> - Standing dead timber from the fire continues to drop branches and bark onto roadways</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>Elevation-driven hail intensity at 7,000+ feet</strong> - Higher altitude means hailstones have less distance to melt, resulting in larger, harder impacts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>Pine sap chemical etching on glass</strong> - Ponderosa pine resin deposits etch and pit windshield surfaces over time if not addressed</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>Extreme overnight freeze cycles</strong> - Temperatures at 7,000+ feet can plunge well below zero, rapidly expanding small chips into spreading cracks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">&bull;</span>
                      <span><strong>Rural truck and SUV gravel spray</strong> - Large vehicles on narrow dirt roads throw heavier debris at higher velocity than standard traffic</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Driving Tips */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Black Forest Driving Tips & Local Q&A</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Living in Black Forest means driving gravel roads, navigating pine-lined corridors, and dealing with weather extremes that most Front Range communities never experience. Here are answers to the questions we hear most from local residents.
                </p>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold">My windshield gets chipped constantly on gravel roads. Is there anything I can do?</h3>
                    <p>Slow down when passing oncoming traffic on dirt roads - this is the single biggest factor. Even reducing speed by 10 mph dramatically reduces the force of kicked-up gravel. When you do get a chip, call us the same day. At Black Forest&#39;s elevation, overnight temperatures can drop 60+ degrees from a summer daytime high, and that thermal shock turns repairable chips into full replacement jobs by morning.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Can you really reach my property on a dirt road?</h3>
                    <p>Yes. Our mobile units service Black Forest properties every week, including homes on unpaved roads off Hodgen, Black Forest Road, Vollmer, and Eastonville Road. If a standard pickup truck can reach your driveway, we can too. Just provide your address and any gate or access instructions when you call, and we will plan our route accordingly.</p>
                  </div>
                </div>
              </section>

              {/* Neighborhoods Grid */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Black Forest Neighborhoods We Serve
                </h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {neighborhoods.map(neighborhood => (
                    <div key={neighborhood} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{neighborhood}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-center">
                  Don&#39;t see your neighborhood? We serve all of Black Forest - <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">call us</a> to confirm service in your area.
                </p>
              </section>

              {/* 4 Service Cards */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Services in Black Forest
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
                      Complete windshield replacement with OEM-quality glass for trucks, SUVs, and all vehicles.
                    </p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">
                      Learn More →
                    </Link>
                  </div>

                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Service</h3>
                    <p className="text-blue-600 font-bold text-2xl mb-3">No Extra Charge</p>
                    <p className="text-gray-700 mb-4">
                      We come to your property anywhere in Black Forest. Paved road, dirt road, or gravel driveway - no extra fee.
                    </p>
                    <Link href="/services/mobile-service" className="text-blue-600 hover:underline font-semibold">
                      Learn More →
                    </Link>
                  </div>

                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">ADAS Calibration</h3>
                    <p className="text-blue-600 font-bold text-2xl mb-3">Included When Needed</p>
                    <p className="text-gray-700 mb-4">
                      Required for most 2018+ trucks and SUVs. Professional windshield camera and sensor recalibration.
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
                  Black Forest Hail & Weather Protection
                </h2>
                <p className="text-gray-700 mb-3">
                  At 7,000+ feet of elevation, Black Forest experiences some of the most intense hail on the Front Range. Higher altitude means hailstones travel a shorter distance from cloud to ground, arriving larger and harder than at lower elevations. Severe storms are common from May through September, and the forested terrain can trap cold air overnight, creating extreme temperature differentials. After a hail event:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Act Fast:</strong> Black Forest&#39;s extreme overnight temperature drops can turn hail damage into full cracks within hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>Insurance Covers It:</strong> Comprehensive policies in Colorado typically cover hail damage with zero deductible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">&bull;</span>
                    <span><strong>We Come to You:</strong> No need to drive into Colorado Springs. We bring same-day replacement service directly to your Black Forest property</span>
                  </li>
                </ul>
              </section>

              {/* Customer Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  What Black Forest Customers Say
                </h2>
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-3">
                      &quot;Living on a dirt road off Hodgen means I go through windshields faster than most people. Pink Auto Glass drove out to our property on a gravel road, replaced the windshield on my F-250 in about an hour, and handled the insurance claim completely. They did not charge extra for the rural location. These are the kind of people we need out here.&quot;
                    </p>
                    <p className="text-sm text-gray-500">- Mark W., <span className="font-medium">Vollmer Ranch</span></p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-3">
                      &quot;We rebuilt our home after the 2013 fire and have been in Black Forest ever since. After a hailstorm cracked the windshield on our Subaru, Pink Auto Glass came out the next morning to our place in Timber Pines. Fast, friendly, and zero out of pocket. This community supports people who show up and do good work, and these folks earned it.&quot;
                    </p>
                    <p className="text-sm text-gray-500">- Karen and Jim L., <span className="font-medium">Timber Pines</span></p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-3">
                      &quot;A truck coming the other way on Black Forest Road threw a rock straight into my windshield. I called Pink Auto Glass and they came to my house in Paint Brush Hills the same afternoon. The technician was professional, worked quickly, and even cleaned the pine sap off my new windshield before leaving. Great service.&quot;
                    </p>
                    <p className="text-sm text-gray-500">- Tom S., <span className="font-medium">Paint Brush Hills</span></p>
                  </div>
                </div>
              </section>

              {/* FAQ Accordions */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Common Questions from Black Forest Customers
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Black Forest?</h2>
                <p className="text-xl mb-6 text-pink-100">
                  Same-day mobile service anywhere in Black Forest. Call now for a free quote.
                </p>
                <CTAButtons source="black-forest-co-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Contact Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving Black Forest Now</h3>
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
                      <span>Mobile Service - All Black Forest</span>
                    </div>
                  </div>
                </div>

                {/* Google Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <GoogleMapEmbed city="Black Forest" state="CO" />
                </div>

                {/* Nearby Service Areas */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Service Areas</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/locations/colorado-springs-co" className="text-pink-600 hover:underline">Colorado Springs, CO →</Link>
                    </li>
                    <li>
                      <Link href="/locations/castle-rock-co" className="text-pink-600 hover:underline">Castle Rock, CO →</Link>
                    </li>
                    <li>
                      <Link href="/locations/fountain-co" className="text-pink-600 hover:underline">Fountain, CO →</Link>
                    </li>
                  </ul>
                </div>

                {/* Popular Vehicles */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Popular in Black Forest</h3>
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
