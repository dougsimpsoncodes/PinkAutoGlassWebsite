import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MessageSquare, Calendar, CheckCircle, Clock, DollarSign } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';
import ServiceAreaLinks from '@/components/ServiceAreaLinks';
import RelatedServices from '@/components/RelatedServices';

export const metadata: Metadata = {
  robots: { index: false },
  title: 'Windshield Chip & Crack Repair | $0 With Insurance',
  description: 'Fast windshield chip and crack repair. Often $0 with insurance. Mobile service — we come to you. Lifetime warranty. Call (720) 918-7465.',
  keywords: 'windshield repair denver, rock chip repair, windshield crack repair, auto glass repair denver, chip repair cost, windshield repair near me, mobile windshield repair denver',
  alternates: {
    canonical: 'https://pinkautoglass.com/colorado/services/windshield-repair',
  },
  openGraph: {
    title: 'Windshield Chip & Crack Repair | $0 With Insurance',
    description: 'Fast windshield chip and crack repair. Often $0 with insurance. Mobile service — we come to you. Lifetime warranty.',
    url: 'https://pinkautoglass.com/colorado/services/windshield-repair',
    type: 'website',
  },
};

export default function WindshieldRepairPage() {
  const faqs = [
    {
      question: 'Does insurance cover windshield repair in Colorado?',
      answer: 'Most comprehensive insurance policies in Colorado cover windshield repair with zero deductible - meaning you pay nothing out of pocket. We work with Progressive, State Farm, Geico, Allstate, USAA, Farmers, and all major carriers. We can verify your coverage before scheduling.'
    },
    {
      question: 'When should I repair vs replace my windshield?',
      answer: 'Repair is suitable when: the chip is smaller than a quarter, cracks are less than 6 inches long, damage is not in the driver\'s direct line of sight, and the damage hasn\'t penetrated the inner layer of glass. Replace when: damage is larger than a dollar bill, cracks extend to the windshield edge, you have multiple chips, or damage obstructs the driver\'s view. We\'ll assess your damage honestly and recommend the safest, most cost-effective solution.'
    },
    {
      question: 'How much does rock chip repair cost?',
      answer: 'Rock chip repair typically costs between $50-$100 if paying out of pocket. However, most comprehensive insurance policies in Colorado cover chip repair with $0 deductible - meaning it\'s completely free for you. We\'ll verify your insurance coverage before starting work.'
    },
    {
      question: 'Will the chip still be visible after repair?',
      answer: 'While rock chip repair dramatically improves the appearance, a faint mark may still be visible upon close inspection. However, the chip will be sealed and stabilized to prevent spreading. Most customers report that the repair is barely noticeable and far better than the original damage.'
    },
    {
      question: 'What happens if I don\'t repair a rock chip?',
      answer: 'Rock chips can quickly spread into long cracks due to vibrations, temperature changes, and road stress. Once a chip becomes a crack longer than 6 inches, it usually can\'t be repaired and requires full windshield replacement (much more expensive). It\'s best to repair chips immediately to prevent spreading.'
    },
  ];

  const serviceSchema = generateServiceSchema({
    serviceName: 'Windshield Repair',
    description: 'Professional windshield chip and crack repair service in Denver metro area. Fast 30-minute service, often covered by insurance, prevents chips from spreading.',
    serviceType: 'Auto Glass Repair',
    areaServed: ['Denver', 'Aurora', 'Lakewood', 'Boulder', 'Highlands Ranch', 'Thornton', 'Arvada', 'Westminster', 'Parker', 'Centennial']
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Services', url: 'https://pinkautoglass.com/services' },
    { name: 'Windshield Repair', url: 'https://pinkautoglass.com/colorado/services/windshield-repair' }
  ]);

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Windshield Chip Repair Denver | Lifetime Warranty",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".answer-first", "h1"]
    }
  };

  const combinedSchema = combineSchemas(serviceSchema, faqSchema, breadcrumbSchema, webPageSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <article className="min-h-screen bg-gradient-to-b from-white to-pink-50 page-top-padding">
        {/* Hero */}
<section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Fast Windshield Chip & Crack Repair
              </h1>
              <p className="answer-first text-lg text-gray-100 leading-relaxed mb-6 max-w-3xl mx-auto">
                Windshield chip repair in Denver takes about 30 minutes and most Colorado drivers pay nothing out of pocket. Under Colorado comprehensive insurance policies, windshield repair is typically covered with zero deductible, meaning your insurer pays the full cost. Pink Auto Glass offers same-day mobile chip repair across the entire Front Range. We come to your home, office, or wherever you are with our fully equipped mobile units. Our technicians inject advanced resin into the damaged area using vacuum and pressure cycles, then cure it under UV light to restore up to 90 percent of your windshield's original strength. Repairing a chip early prevents it from spreading into a long crack that would require a full replacement. Colorado's dramatic temperature swings between day and night can turn a small rock chip into an irreparable crack within days. Every repair is backed by our lifetime warranty on workmanship, and we handle all insurance paperwork so you can focus on your day.
              </p>
              <CTAButtons source="windshield-repair" />
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
              { label: 'Services', href: '/services' },
              { label: 'Windshield Repair', href: '/services/windshield-repair' }
            ]}
          />
        </div>

        {/* Timestamp */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <time dateTime="2026-02-22" className="text-sm text-gray-500">
            Updated February 22, 2026
          </time>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Stop Chips Before They Spread
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  A small rock chip might seem insignificant, but Colorado's temperature swings cause chips to spread into long cracks fast. What starts as a repairable chip can require a full replacement within days. Windshield repair uses advanced resin technology to fill and seal the damage, preventing it from growing.
                </p>

                <AboveFoldCTA location="service-windshield-repair" />

                <p className="text-lg text-gray-700 mb-4">
                  Our repair process takes just 30 minutes and restores up to 90% of your windshield's original strength. Best of all, most insurance companies in Colorado cover windshield repair with zero deductible - you pay absolutely nothing.
                </p>
              </section>

              {/* Pricing — merged from rock-chip-repair page */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Chip & Crack Repair Pricing
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
                    <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">With Insurance</h3>
                    <div className="text-4xl font-bold text-green-600 mb-3">$0</div>
                    <p className="text-gray-700 mb-4">
                      Most comprehensive policies in Colorado cover chip repair with zero deductible
                    </p>
                    <ul className="text-sm text-left text-gray-700 space-y-1">
                      <li>✓ We bill insurance directly</li>
                      <li>✓ No out-of-pocket cost</li>
                      <li>✓ Won’t raise your rates</li>
                      <li>✓ All paperwork handled</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6 text-center">
                    <DollarSign className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Without Insurance</h3>
                    <div className="text-4xl font-bold text-blue-600 mb-3">$50-$100</div>
                    <p className="text-gray-700 mb-4">
                      Affordable pricing if paying out-of-pocket
                    </p>
                    <ul className="text-sm text-left text-gray-700 space-y-1">
                      <li>✓ Same quality service</li>
                      <li>✓ Lifetime warranty included</li>
                      <li>✓ Much cheaper than replacement</li>
                      <li>✓ Mobile service available</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-6 text-center text-gray-700">
                  <strong>Compare to windshield replacement:</strong> $300-$800+ · Not always covered · Takes 90+ minutes
                </p>
              </section>

              {/* Service Area Section */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Serving Denver, Aurora, Boulder & Colorado Springs
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  We bring our mobile windshield chip repair service directly to you across the entire Front Range. Whether you're at home, work, or anywhere in between, we'll come to you with our fully equipped mobile units.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { city: 'Denver', path: '/locations/denver-co' },
                    { city: 'Aurora', path: '/locations/aurora-co' },
                    { city: 'Boulder', path: '/locations/boulder-co' },
                    { city: 'Colorado Springs', path: '/locations/colorado-springs-co' },
                    { city: 'Lakewood', path: '/locations/lakewood-co' },
                    { city: 'Fort Collins', path: '/locations/fort-collins-co' },
                    { city: 'Thornton', path: '/locations/thornton-co' },
                    { city: 'Arvada', path: '/locations/arvada-co' },
                  ].map((location) => (
                    <Link
                      key={location.city}
                      href={location.path}
                      className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors"
                    >
                      <span className="text-gray-700 font-medium">{location.city}</span>
                    </Link>
                  ))}
                </div>
                <p className="text-gray-600 text-sm">
                  <strong>Same-day mobile service available</strong> across all Colorado Front Range communities. Call <a href="tel:+17209187465" className="text-pink-600 hover:underline font-semibold">(720) 918-7465</a> to schedule.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Can Your Damage Be Repaired?
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-900 mb-3">✓ Repairable Damage</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span>Chips smaller than a quarter</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span>Cracks less than 6 inches</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span>Not in driver's line of sight</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                        <span>Outer layer damage only</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-red-900 mb-3">✗ Requires Replacement</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2 mt-1 flex-shrink-0">✗</span>
                        <span>Chips larger than a dollar bill</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2 mt-1 flex-shrink-0">✗</span>
                        <span>Cracks longer than 6 inches</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2 mt-1 flex-shrink-0">✗</span>
                        <span>Damage in driver's view</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2 mt-1 flex-shrink-0">✗</span>
                        <span>Cracks at windshield edge</span>
                      </li>
                    </ul>
                    <Link href="/services/windshield-replacement" className="inline-block mt-4 text-red-600 hover:underline font-semibold">
                      Learn about replacement →
                    </Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our 5-Step Repair Process
                </h2>
                <div className="space-y-4">
                  {[
                    { num: 1, title: 'Damage Assessment', desc: 'We inspect the chip or crack to confirm it\'s repairable and determine the best approach.' },
                    { num: 2, title: 'Surface Preparation', desc: 'We clean the damaged area and remove any loose glass fragments and debris.' },
                    { num: 3, title: 'Vacuum & Pressure', desc: 'Using specialized equipment, we create a vacuum to remove air and moisture from the break.' },
                    { num: 4, title: 'Resin Injection', desc: 'We inject high-grade optical resin into the damaged area under pressure, filling all cracks and voids.' },
                    { num: 5, title: 'UV Curing & Polish', desc: 'The resin is cured with UV light, then polished to restore optical clarity. Total time: 30 minutes.' }
                  ].map((step) => (
                    <div key={step.num} className="flex items-start bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        {step.num}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{step.title}</h3>
                        <p className="text-gray-700">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Insurance Coverage - Often No Out-of-Pocket Cost
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  In Colorado, most comprehensive insurance policies cover windshield repair with <strong>zero deductible</strong>. This means you pay nothing - your insurance covers the full cost. We work with all major insurers and handle the paperwork.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Popular Vehicles We Service in Denver
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { make: 'Toyota', model: 'Camry', slug: 'toyota-camry-windshield-replacement-denver' },
                    { make: 'Honda', model: 'Accord', slug: 'honda-accord-windshield-replacement-denver' },
                    { make: 'Subaru', model: 'Outback', slug: 'subaru-outback-windshield-replacement-denver' },
                    { make: 'Ford', model: 'F-150', slug: 'ford-f150-windshield-replacement-denver' },
                    { make: 'Tesla', model: 'Model 3', slug: 'tesla-model-3-windshield-replacement-denver' },
                  ].map(v => (
                    <Link
                      key={v.slug}
                      href={`/vehicles/${v.slug}`}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all"
                    >
                      <div className="font-semibold text-gray-900">{v.make} {v.model}</div>
                      <div className="text-sm text-green-600">Learn More →</div>
                    </Link>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                      <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                        {faq.question}
                        <span className="text-green-600 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              
              <ServiceAreaLinks />
              <RelatedServices currentSlug="/services/windshield-repair" />

              <section className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Stop That Chip From Spreading</h2>
                <p className="text-xl mb-6 text-green-100">
                  Same-day appointments. Often covered by insurance. 30-minute service.
                </p>
                <CTAButtons source="windshield-repair" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Get Started Now</h3>
                  <div className="space-y-3">
                    <a
                      href="tel:+17209187465"
                      className="flex items-center justify-center w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Call (720) 918-7465
                    </a>
                    <a
                      href="sms:+17209187465"
                      className="flex items-center justify-center w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Text Us
                    </a>
                    <Link
                      href="/book"
                      className="flex items-center justify-center w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Book Online
                    </Link>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Why Act Fast?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Clock className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Temperature Changes</strong> cause chips to spread</span>
                    </li>
                    <li className="flex items-start">
                      <DollarSign className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Save Money</strong> - repair is more affordable than replacement</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Often Covered</strong> by insurance with no deductible</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Link href="/locations/denver-co" className="text-blue-600 hover:underline">Denver</Link>
                    <Link href="/locations/aurora-co" className="text-blue-600 hover:underline">Aurora</Link>
                    <Link href="/locations/lakewood-co" className="text-blue-600 hover:underline">Lakewood</Link>
                    <Link href="/locations/boulder-co" className="text-blue-600 hover:underline">Boulder</Link>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Related Services</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/services/windshield-replacement" className="text-green-600 hover:underline">
                        Windshield Replacement →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/mobile-service" className="text-green-600 hover:underline">
                        Mobile Service →
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
