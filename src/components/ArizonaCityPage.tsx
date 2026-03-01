import Link from 'next/link';
import { Phone, MapPin, Shield, Star } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import GoogleReviewsWidget from '@/components/GoogleReviewsWidget';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';
import type { ArizonaCity } from '@/data/arizonaCities';

function cityNameToSlug(name: string): string {
  return name.toLowerCase().replace(/ /g, '-') + '-az';
}

export default function ArizonaCityPage({ city }: { city: ArizonaCity }) {
  const localBusinessSchema = generateLocalBusinessSchema({
    city: city.city,
    state: 'AZ',
    zipCode: '85001',
    latitude: 33.4484,
    longitude: -112.0740,
  });

  const faqSchema = generateFAQSchema(
    city.faqs.map(faq => ({ question: faq.question, answer: faq.answer }))
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: `${city.city}, AZ`, url: `https://pinkautoglass.com/locations/${city.slug}` },
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
                <span className="text-xl">{city.city}, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {city.city}&apos;s Trusted Windshield Repair &amp; Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source={`${city.slug}-hero`} />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Locations', href: '/locations' },
              { label: `${city.city}, AZ`, href: `/locations/${city.slug}` },
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2">
          <time dateTime="2026-02-26" className="text-sm text-gray-500">Updated February 26, 2026</time>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why {city.city} Trusts Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  {city.intro}
                </p>
                <AboveFoldCTA location={city.slug} />
                {city.localContext && (
                  <div className="prose prose-lg text-gray-700 my-6 space-y-4">
                    {city.localContext.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                )}

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{city.challenges.title}</h3>
                  <ul className="space-y-2 text-gray-700">
                    {city.challenges.items.map((item, index) => {
                      const colonIndex = item.indexOf(':');
                      const hasColon = colonIndex !== -1;
                      const boldPart = hasColon ? item.slice(0, colonIndex + 1) : '';
                      const restPart = hasColon ? item.slice(colonIndex + 1) : item;
                      return (
                        <li key={index} className="flex items-start">
                          <span className="text-pink-600 font-bold mr-2">•</span>
                          <span>
                            {hasColon && <strong>{boldPart}</strong>}
                            {restPart}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects {city.city} Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li className="flex items-start">
                      <span className="font-bold mr-2">ARS § 20-263:</span>
                      <span>Requires insurers to offer zero-deductible glass coverage as an option with comprehensive policies. This is the law that makes $0 windshield replacement possible.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">Rate Protection:</span>
                      <span>Filing a glass claim in Arizona legally cannot raise your insurance rates.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">Right to Choose:</span>
                      <span>Insurers can recommend Safelite but cannot require it — and must tell you that you have the right to choose any shop you want.</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{city.city} Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {city.neighborhoods.map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in {city.city}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Fix chips before Arizona heat turns them into full cracks. Fast, $0 with coverage.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full replacement with OEM-quality glass. $0 out of pocket with coverage.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What {city.city} Customers Say</h2>
                <GoogleReviewsWidget city={city.city} count={2} />
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from {city.city} Customers</h2>
                <div className="space-y-4">
                  {city.faqs.map((faq, index) => (
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in {city.city}?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in {city.city}. Arizona law means $0 out of pocket.</p>
                <CTAButtons source={`${city.slug}-cta`} />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Arizona Insurance Law</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>ARS § 20-263:</strong> $0 deductible option required</span>
                    </li>
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Rate Protection:</strong> No rate increase for glass claims</span>
                    </li>
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Right to Choose:</strong> Pick any shop you want</span>
                    </li>
                  </ul>
                  <Link href="/services/insurance-claims/arizona" className="block mt-4 text-pink-600 hover:underline font-semibold">Full AZ Insurance Guide →</Link>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Nearby Arizona Cities</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {city.nearbyLinks.map(name => (
                      <Link key={name} href={`/locations/${cityNameToSlug(name)}`} className="text-blue-600 hover:underline">
                        {name}
                      </Link>
                    ))}
                  </div>
                </div>

                {city.mapEmbedSrc && (
                  <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      src={city.mapEmbedSrc}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`${city.city}, AZ Map`}
                    />
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
