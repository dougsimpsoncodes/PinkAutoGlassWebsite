import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Mesa AZ | Auto Glass Repair | $0 Deductible | (720) 918-7465',
  description: 'Windshield replacement & auto glass repair in Mesa AZ. Same-day mobile service to Dobson Ranch, Eastmark & all Mesa. Arizona ARS 20-264 means $0 out of pocket. Call (720) 918-7465!',
  keywords: 'windshield replacement mesa az, windshield repair mesa, auto glass mesa az, zero deductible windshield mesa, dobson ranch windshield, mobile auto glass mesa arizona',
  alternates: {
    canonical: 'https://pinkautoglass.com/locations/mesa-az',
  },
  openGraph: {
    title: 'Windshield Repair & Replacement Mesa, AZ | Pink Auto Glass',
    description: 'Mesa\'s trusted auto glass experts. Arizona law means $0 out of pocket. Mobile service to Dobson Ranch, Red Mountain, Eastmark & all Mesa. ARS 20-264 coverage.',
    url: 'https://pinkautoglass.com/locations/mesa-az',
    type: 'website',
  },
};

export default function MesaLocationPage() {
  const faqs = [
    {
      question: 'How does Arizona\'s zero-deductible glass law work for Mesa residents?',
      answer: 'Under ARS 20-264, Arizona law requires insurance companies to offer a zero-deductible glass endorsement as part of any comprehensive auto policy. If you have comprehensive coverage and elected the glass endorsement (typically $5–$15 per month), you pay nothing when your windshield is replaced. We verify your coverage before starting any work on your Mesa vehicle.'
    },
    {
      question: 'Does filing a glass claim affect my insurance rates in Mesa?',
      answer: 'No. Arizona law (ARS 20-263) provides no-fault rate protection for glass claims. Insurers cannot legally raise your rates because you filed a glass claim. Mesa residents file these claims regularly — it\'s a benefit you\'ve already paid for.'
    },
    {
      question: 'What parts of Mesa do you serve with mobile windshield service?',
      answer: 'We serve all of Mesa including Dobson Ranch, Red Mountain, Eastmark, Las Sendas, Superstition Springs, Alma School corridor, the Chandler border area, and downtown Mesa. Mobile service means we come to your home, office, or any Mesa location at no extra charge.'
    },
    {
      question: 'Why is the US-60 so hard on windshields in Mesa?',
      answer: 'The US-60 (Superstition Freeway) is one of the heaviest commercial truck corridors in the East Valley. It connects Mesa\'s growing tech and industrial areas to the broader Phoenix metro, meaning constant truck traffic. At 65-75mph, rock chips from truck tires happen regularly. East Mesa\'s ongoing development also adds construction truck traffic to local roads.'
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    city: 'Mesa',
    state: 'AZ',
    zipCode: '85201',
    latitude: 33.4152,
    longitude: -111.8315,
  });

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' },
    { name: 'Mesa, AZ', url: 'https://pinkautoglass.com/locations/mesa-az' }
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
                <span className="text-xl">Mesa, Arizona</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Mesa's Trusted Windshield Repair & Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                New Windshield. $0 Out of Pocket. We Handle Everything.
              </p>
              <CTAButtons source="mesa-az-hero" />
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }, { label: 'Mesa, AZ', href: '/locations/mesa-az' }]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Mesa Residents Choose Pink Auto Glass</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Mesa is Arizona's third-largest city, spanning 140 square miles from the tech corridors near Tempe to the wide-open spaces of East Mesa and the Superstition Mountain foothills. The US-60 (Superstition Freeway) cuts through the heart of Mesa carrying enormous commercial truck traffic, making rock chips a daily reality for Mesa commuters. With Eastmark's booming growth, Las Sendas' desert roads, and the ongoing tech corridor expansion near the Chandler border, Mesa drivers need fast, reliable windshield service.
                </p>
                <AboveFoldCTA location="location-mesa-az" />
                <p className="text-lg text-gray-700 mb-4">
                  Arizona law is on your side. ARS 20-264 means $0 out of pocket for most Mesa drivers with comprehensive coverage. ARS 20-263 means your rates won't go up. ARS 20-469 means you choose the shop — no matter what your insurer says. Pink Auto Glass comes to you anywhere in Mesa, handles your claim, and gets your windshield replaced the same day.
                </p>

                <div className="bg-pink-50 border-l-4 border-pink-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Why Mesa Windshields Face Unique Challenges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>US-60 Superstition Freeway Truck Traffic:</strong> The US-60 is the primary commercial freight route through Mesa. Heavy trucks hauling to and from the East Valley kick up rocks constantly. Residents near Dobson Ranch, Superstition Springs, and Red Mountain are most exposed.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Eastmark & East Mesa New Construction:</strong> Mesa's eastern growth corridor is one of the fastest-developing areas in Arizona. Construction trucks, gravel haulers, and unfinished roads create daily chip hazards for residents in Eastmark, Las Sendas, and new east Mesa developments.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Superstition Mountain Desert Roads:</strong> Roads near the Superstition Wilderness area to the east of Mesa carry ATV traffic, off-road vehicles, and hikers that track sand and gravel onto paved roads. Desert gravel on suburban streets is a persistent chip cause.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Tech Corridor & Industrial Traffic:</strong> Mesa's growing tech corridor near the Chandler border adds delivery trucks, semi-trucks, and commercial vehicles to local road systems. The Mesa Gateway Airport area also sees significant cargo and service vehicle traffic.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-pink-600 font-bold mr-2">•</span>
                      <span><strong>Summer Heat Acceleration:</strong> Mesa's inland location away from Phoenix's urban core can produce slightly higher summer temperatures. Chips that would hold in spring become cracks within weeks of monsoon season heat spikes.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Arizona Law Protects Mesa Drivers</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li><strong>ARS 20-264:</strong> Zero-deductible glass coverage must be offered with comprehensive policies.</li>
                    <li><strong>ARS 20-263:</strong> No-fault rate protection — glass claims cannot raise your Arizona rates.</li>
                    <li><strong>ARS 20-469:</strong> Right to choose any shop. Your insurer cannot require Safelite.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Mesa Neighborhoods We Serve</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    'Downtown Mesa', 'East Mesa', 'Red Mountain',
                    'Eastmark', 'Dobson Ranch', 'Alma School',
                    'Las Sendas', 'Superstition Springs', 'Gilbert Border',
                    'Chandler Border', 'Mesa Gateway', 'West Mesa'
                  ].map(n => (
                    <div key={n} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors">
                      <span className="text-gray-700 font-medium">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services in Mesa</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Repair</h3>
                    <p className="text-gray-700 mb-3">Repair chips before Mesa's summer heat expands them. Fast, $0 with coverage.</p>
                    <Link href="/services/windshield-repair" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                  <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Windshield Replacement</h3>
                    <p className="text-gray-700 mb-3">Full OEM-quality replacement. $0 with ARS 20-264 coverage. Mobile service included.</p>
                    <Link href="/services/windshield-replacement" className="text-pink-600 hover:underline font-semibold">Learn More →</Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Mesa Customers Say</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Tom B.', neighborhood: 'Dobson Ranch', text: 'Got a crack from a rock on the US-60 near my exit. Called Pink Auto Glass and they came to Dobson Ranch that afternoon. My Progressive insurance covered everything — zero out of pocket.' },
                    { name: 'Angela V.', neighborhood: 'Eastmark', text: 'Construction trucks in Eastmark have been brutal on windshields. Pink Auto Glass came to my home and replaced it. They dealt with my insurance company and I paid nothing. Couldn\'t be easier.' }
                  ].map((r, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex text-yellow-400 mb-3">{[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}</div>
                      <p className="text-gray-700 mb-2">"{r.text}"</p>
                      <p className="text-gray-900 font-semibold">- {r.name}, {r.neighborhood}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions from Mesa Customers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started in Mesa?</h2>
                <p className="text-xl mb-6 text-pink-100">Same-day mobile service anywhere in Mesa. Arizona law means $0 out of pocket.</p>
                <CTAButtons source="mesa-az-cta" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Arizona Insurance Law</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>ARS 20-264:</strong> $0 deductible option required</span>
                    </li>
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>ARS 20-263:</strong> No rate increase for glass claims</span>
                    </li>
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>ARS 20-469:</strong> Right to choose your shop</span>
                    </li>
                  </ul>
                  <Link href="/services/insurance-claims/arizona" className="block mt-4 text-pink-600 hover:underline font-semibold">Full AZ Insurance Guide →</Link>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Nearby Arizona Cities</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Link href="/locations/tempe-az" className="text-blue-600 hover:underline">Tempe</Link>
                    <Link href="/locations/chandler-az" className="text-blue-600 hover:underline">Chandler</Link>
                    <Link href="/locations/gilbert-az" className="text-blue-600 hover:underline">Gilbert</Link>
                    <Link href="/locations/scottsdale-az" className="text-blue-600 hover:underline">Scottsdale</Link>
                    <Link href="/locations/queen-creek-az" className="text-blue-600 hover:underline">Queen Creek</Link>
                    <Link href="/locations/apache-junction-az" className="text-blue-600 hover:underline">Apache Junction</Link>
                  </div>
                </div>

                <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106626.4!2d-111.8315!3d33.4152!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872ba7ae2af5f8b5%3A0x3c2b6a2e1f3d4e5f!2sMesa%2C%20AZ!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mesa, AZ Map"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
