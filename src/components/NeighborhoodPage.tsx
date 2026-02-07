import Link from 'next/link';
import { Phone, MapPin, Clock, Shield, Car, Wrench } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import GoogleMapEmbed from '@/components/GoogleMapEmbed';
import GoogleReviewsWidget from '@/components/GoogleReviewsWidget';
import type { Neighborhood } from '@/data/neighborhoods';
import { getNeighborhoodsByCity } from '@/data/neighborhoods';
import {
  generateLocalBusinessSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  combineSchemas,
} from '@/lib/schema';

// Map citySlug to the URL folder name (e.g. "denver" -> "denver-co")
const citySlugToFolder: Record<string, string> = {
  denver: 'denver-co',
  aurora: 'aurora-co',
  lakewood: 'lakewood-co',
  boulder: 'boulder-co',
  'fort-collins': 'fort-collins-co',
  'colorado-springs': 'colorado-springs-co',
};

// Nearby city links per city (other cities we serve)
const nearbyCities: Record<string, { name: string; href: string }[]> = {
  denver: [
    { name: 'Aurora, CO', href: '/locations/aurora-co' },
    { name: 'Lakewood, CO', href: '/locations/lakewood-co' },
    { name: 'Boulder, CO', href: '/locations/boulder-co' },
  ],
  aurora: [
    { name: 'Denver, CO', href: '/locations/denver-co' },
    { name: 'Lakewood, CO', href: '/locations/lakewood-co' },
    { name: 'Colorado Springs, CO', href: '/locations/colorado-springs-co' },
  ],
  lakewood: [
    { name: 'Denver, CO', href: '/locations/denver-co' },
    { name: 'Aurora, CO', href: '/locations/aurora-co' },
    { name: 'Boulder, CO', href: '/locations/boulder-co' },
  ],
  boulder: [
    { name: 'Denver, CO', href: '/locations/denver-co' },
    { name: 'Fort Collins, CO', href: '/locations/fort-collins-co' },
    { name: 'Lakewood, CO', href: '/locations/lakewood-co' },
  ],
  'fort-collins': [
    { name: 'Boulder, CO', href: '/locations/boulder-co' },
    { name: 'Denver, CO', href: '/locations/denver-co' },
    { name: 'Colorado Springs, CO', href: '/locations/colorado-springs-co' },
  ],
  'colorado-springs': [
    { name: 'Denver, CO', href: '/locations/denver-co' },
    { name: 'Aurora, CO', href: '/locations/aurora-co' },
    { name: 'Fort Collins, CO', href: '/locations/fort-collins-co' },
  ],
};

function SchemaScript({ schema }: { schema: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function NeighborhoodPage({ neighborhood }: { neighborhood: Neighborhood }) {
  const n = neighborhood;
  const cityFolder = citySlugToFolder[n.citySlug] || `${n.citySlug}-co`;
  const pageUrl = `https://pinkautoglass.com/locations/${cityFolder}/${n.slug}`;
  const cityUrl = `https://pinkautoglass.com/locations/${cityFolder}`;

  // Schema markup
  const localBusinessSchema = generateLocalBusinessSchema({
    city: n.cityName,
    state: 'CO',
    zipCode: n.zipCode,
    latitude: n.coords[0],
    longitude: n.coords[1],
  });

  const faqSchema = generateFAQSchema(
    n.faqs.map((f) => ({ question: f.q, answer: f.a }))
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: `${n.cityName}, CO`, url: cityUrl },
    { name: n.name, url: pageUrl },
  ]);

  const combinedSchema = combineSchemas(localBusinessSchema, faqSchema, breadcrumbSchema);

  // Get sibling neighborhoods for internal linking (exclude self, pick up to 6)
  const siblings = getNeighborhoodsByCity(n.citySlug)
    .filter((s) => s.slug !== n.slug)
    .slice(0, 6);

  const ctaSource = `${n.citySlug}-${n.slug}`;

  return (
    <>
      <SchemaScript schema={combinedSchema} />

      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 page-top-padding">
        {/* Hero */}
        <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 mr-2" />
                <span className="text-xl">{n.name}, {n.cityName}, Colorado</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Windshield Repair &amp; Replacement in {n.name}
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                {n.tagline}
              </p>
              <CTAButtons source={`${ctaSource}-hero`} />
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
              { label: `${n.cityName}, CO`, href: `/locations/${cityFolder}` },
              { label: n.name, href: `/locations/${cityFolder}/${n.slug}` },
            ]}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* Intro */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Mobile Auto Glass Service in {n.name}
                </h2>
                <p className="text-lg text-gray-700 mb-4">{n.intro}</p>
                <AboveFoldCTA location={ctaSource} />
                <p className="text-lg text-gray-700 mb-4">{n.mobileNote}</p>
              </section>

              {/* What Makes This Neighborhood Unique */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  What Makes {n.name} Unique
                </h2>
                <ul className="space-y-3">
                  {n.highlights.map((h, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                      <span className="text-pink-600 mr-3 mt-1 flex-shrink-0">&#10003;</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Driving Hazards & Windshield Risk */}
              <section className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-yellow-600" />
                  Windshield Hazards in {n.name}
                </h2>
                <p className="text-gray-700 mb-3">
                  {n.name} drivers face specific windshield risks. Here&apos;s what to watch for:
                </p>
                <ul className="space-y-2 text-gray-700">
                  {n.hazards.map((h, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-yellow-600 mr-2">&#8226;</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Local Landmarks */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  We Know {n.name}
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  When you call Pink Auto Glass, you&apos;re working with technicians who know {n.name}. We meet you near landmarks you recognize:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {n.landmarks.map((l, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded p-3 flex items-center">
                      <MapPin className="w-4 h-4 text-pink-600 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{l}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Services */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Auto Glass Services in {n.name}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-2">
                      <Wrench className="w-5 h-5 text-pink-600 mr-2" />
                      <h3 className="text-xl font-bold text-gray-900">Windshield Repair</h3>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Fast chip and crack repair. Often covered 100% by insurance with no deductible.
                    </p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">
                      Learn More &rarr;
                    </Link>
                  </div>

                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-2">
                      <Car className="w-5 h-5 text-pink-600 mr-2" />
                      <h3 className="text-xl font-bold text-gray-900">Windshield Replacement</h3>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Complete replacement with OEM-quality glass. ADAS calibration included when needed.
                    </p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">
                      Learn More &rarr;
                    </Link>
                  </div>
                </div>
              </section>

              {/* Google Reviews */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  What {n.cityName} Customers Say
                </h2>
                <GoogleReviewsWidget city={n.cityName} count={3} />
              </section>

              {/* FAQs */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Auto Glass FAQs for {n.name}
                </h2>
                <div className="space-y-4">
                  {n.faqs.map((faq, index) => (
                    <details key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                      <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                        {faq.q}
                        <span className="text-pink-600 group-open:rotate-180 transition-transform">&#9660;</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </section>

              {/* Bottom CTA */}
              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready for Auto Glass Service in {n.name}?</h2>
                <p className="text-xl mb-6 text-pink-100">
                  Same-day mobile service. We come to you in {n.name}. Call now for a free quote.
                </p>
                <CTAButtons source={`${ctaSource}-cta`} />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Contact */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Serving {n.name} Now</h3>
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
                      <span>Mobile Service - {n.name}</span>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{n.name} Service Area</h3>
                  <GoogleMapEmbed city={`${n.name} ${n.cityName}`} state="CO" />
                </div>

                {/* Other Neighborhoods */}
                {siblings.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">More {n.cityName} Neighborhoods</h3>
                    <ul className="space-y-2">
                      {siblings.map((s) => (
                        <li key={s.slug}>
                          <Link href={`/locations/${cityFolder}/${s.slug}`} className="text-pink-600 hover:underline">
                            {s.name} &rarr;
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t">
                      <Link href={`/locations/${cityFolder}`} className="text-gray-600 hover:text-pink-600 text-sm font-semibold">
                        View all {n.cityName} services &rarr;
                      </Link>
                    </div>
                  </div>
                )}

                {/* Nearby Cities */}
                {nearbyCities[n.citySlug] && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Nearby Cities</h3>
                    <ul className="space-y-2">
                      {nearbyCities[n.citySlug].map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className="text-pink-600 hover:underline">
                            {c.name} &rarr;
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
