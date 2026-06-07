import { Metadata } from 'next';
import Link from 'next/link';
import { Clock, CheckCircle, Truck, AlertTriangle } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'How Long Does Windshield Replacement Take?',
  description: 'Windshield replacement takes 60-90 minutes plus 1 hour cure time. Same-day mobile service — we come to you. Call (720) 918-7465.',
  keywords: 'how long windshield replacement, windshield replacement time, same day windshield replacement, mobile windshield replacement time',
  alternates: {
    canonical: 'https://pinkautoglass.com/how-long-does-windshield-replacement-take',
  },
  openGraph: {
    title: 'How Long Does Windshield Replacement Take?',
    description: 'Windshield replacement takes 60-90 minutes plus 1 hour cure time. Same-day mobile service available.',
    url: 'https://pinkautoglass.com/how-long-does-windshield-replacement-take',
    type: 'website',
  },
};

export default function HowLongPage() {
  const faqs = [
    {
      question: 'Can I drive immediately after windshield replacement?',
      answer: 'No — you need to wait at least 1 hour for the urethane adhesive to cure enough for safe driving. Our technicians will tell you the exact safe drive-away time based on the adhesive used and weather conditions. In cold weather, cure time may be longer.'
    },
    {
      question: 'What happens if it rains during replacement?',
      answer: 'Light rain is usually fine — our mobile units have canopies and we can work in covered areas. Heavy rain or storms may require rescheduling for quality and safety reasons. The adhesive needs a dry surface to bond properly.'
    },
    {
      question: 'Is same-day windshield replacement really possible?',
      answer: 'Yes. For most common vehicles (Honda, Toyota, Subaru, Ford, etc.), we stock windshields on our mobile units and can replace same-day. Luxury vehicles, rare models, or those requiring special glass may need a 1-2 day order. Call us and we\'ll confirm availability immediately.'
    },
    {
      question: 'Does ADAS calibration add time to the replacement?',
      answer: 'Yes — ADAS calibration adds 30-60 minutes after the windshield is installed and the adhesive has cured. Calibration is required for any vehicle with lane departure warning, automatic emergency braking, or adaptive cruise control. We can do it the same visit.'
    },
    {
      question: 'How quickly can you schedule an appointment?',
      answer: 'Most appointments are available same-day if you call before 2 PM. We offer flexible scheduling 7 days a week across the Colorado Front Range and Phoenix metro. Emergency replacements can often be accommodated within hours.'
    },
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'How Long Does Windshield Replacement Take?', url: 'https://pinkautoglass.com/how-long-does-windshield-replacement-take' }
  ]);
  const combinedSchema = combineSchemas(faqSchema, breadcrumbSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <article className="min-h-screen bg-gradient-to-b from-white to-green-50 page-top-padding">
        {/* Hero */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 mr-2" />
                <span className="text-xl">Replacement Timeline</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                How Long Does Windshield Replacement Take?
              </h1>
              <p className="text-lg text-green-100 leading-relaxed mb-6 max-w-3xl mx-auto">
                The replacement itself takes <strong className="text-white">60-90 minutes</strong>. Add <strong className="text-white">1 hour minimum</strong> for adhesive cure time before driving. With our mobile service, we come to you — so you can work, relax, or run errands while we handle everything.
              </p>
              <CTAButtons source="how-long-hero" />
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'How Long Does Replacement Take?' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              {/* Timeline Breakdown */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Step-by-Step Timeline
                </h2>
                <div className="space-y-4">
                  {[
                    { step: 'Arrival & Setup', time: '5-10 min', desc: 'Our mobile technician arrives at your location, sets up the work area, and prepares tools and materials.' },
                    { step: 'Old Windshield Removal', time: '15-20 min', desc: 'We carefully cut and remove the old windshield, clean the frame, and remove old adhesive and debris.' },
                    { step: 'Frame Prep & Primer', time: '10-15 min', desc: 'We apply primer to the frame and the new windshield edge. This ensures a proper bond with the urethane adhesive.' },
                    { step: 'New Windshield Installation', time: '15-20 min', desc: 'We set the new windshield into place with precision, apply urethane adhesive, and ensure a perfect fit and seal.' },
                    { step: 'Cleanup & Inspection', time: '10-15 min', desc: 'We clean up, inspect the seal, check for leaks, and verify everything looks and functions correctly.' },
                    { step: 'Adhesive Cure Time', time: '60+ min', desc: 'The urethane adhesive needs at least 1 hour to cure before the vehicle is safe to drive. We\'ll tell you the exact safe drive-away time.' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-lg text-gray-900">{item.step}</h3>
                          <span className="text-sm text-green-600 font-semibold">{item.time}</span>
                        </div>
                        <p className="text-gray-700">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
                  <p className="text-lg font-semibold text-gray-900">
                    Total time: <strong>2-3 hours</strong> (including cure time)
                  </p>
                  <p className="text-gray-600 mt-1">With mobile service, you don't have to wait at a shop — we come to you.</p>
                </div>
              </section>

              <AboveFoldCTA location="how-long-mid" />

              {/* Factors That Affect Time */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  What Can Affect the Timeline
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">ADAS Calibration</h3>
                    <p className="text-gray-700">Vehicles with lane assist, collision warning, or adaptive cruise control need camera calibration after replacement. Adds <strong>30-60 minutes</strong>. <Link href="/services/adas-calibration" className="text-green-600 hover:underline">Learn more about ADAS</Link>.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Cold Weather</h3>
                    <p className="text-gray-700">Below 40°F, adhesive cures slower. We may use heated adhesive or recommend a longer cure time. This is common during Colorado winters.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Vehicle Complexity</h3>
                    <p className="text-gray-700">Luxury vehicles, trucks with larger windshields, and vehicles with rain sensors, heated glass, or head-up displays take more time to install correctly.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Glass Availability</h3>
                    <p className="text-gray-700">Common vehicles (Honda, Toyota, Subaru, Ford) — we usually stock the glass. Rare or luxury vehicles may need a 1-2 day order. Call to confirm.</p>
                  </div>
                </div>
              </section>

              {/* Mobile Service Advantage */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Mobile Service Saves You Time
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  With a shop visit, you drive there, wait, then drive home — easily 4-5 hours of your day. With our <Link href="/services/mobile-service" className="text-green-600 hover:underline font-semibold">free mobile service</Link>, we come to your home or office. You work or relax while we handle everything. The total time is the same, but <strong>your time spent waiting is zero</strong>.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-5 text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">Shop Visit</h3>
                    <p className="text-3xl font-bold text-red-600 mb-2">4-5 hours</p>
                    <p className="text-sm text-gray-600">Drive there + wait + drive back</p>
                  </div>
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-5 text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">Mobile Service</h3>
                    <p className="text-3xl font-bold text-green-600 mb-2">0 hours waiting</p>
                    <p className="text-sm text-gray-600">We come to you — no wasted time</p>
                  </div>
                </div>
              </section>

              {/* FAQs */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                      <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                        {faq.question}
                        <span className="text-green-600 group-open:rotate-180 transition-transform">&#9660;</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              {/* Related */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Resources</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <Link href="/pricing" className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-1">Pricing Guide</h3>
                    <p className="text-sm text-gray-600">Costs by vehicle type</p>
                  </Link>
                  <Link href="/services/mobile-service" className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-1">Mobile Service</h3>
                    <p className="text-sm text-gray-600">Free — we come to you</p>
                  </Link>
                  <Link href="/services/emergency-windshield-repair" className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-1">Emergency Service</h3>
                    <p className="text-sm text-gray-600">Same-day 24/7 available</p>
                  </Link>
                </div>
              </section>

              {/* Bottom CTA */}
              <section className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Schedule?</h2>
                <p className="text-xl mb-6 text-green-100">
                  Same-day mobile service. We come to you. Most replacements done in under 2 hours.
                </p>
                <CTAButtons source="how-long-bottom" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Answer</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-900">Replacement</p>
                        <p className="text-sm text-gray-600">60-90 minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-900">Cure Time</p>
                        <p className="text-sm text-gray-600">60+ minutes (don't drive)</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-orange-600 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-900">ADAS Calibration</p>
                        <p className="text-sm text-gray-600">+30-60 minutes (if needed)</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Truck className="w-5 h-5 text-pink-600 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-900">Your Wait Time</p>
                        <p className="text-sm text-gray-600">0 — we come to you</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Areas</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Link href="/locations/denver-co" className="text-green-600 hover:underline">Denver</Link>
                    <Link href="/locations/aurora-co" className="text-green-600 hover:underline">Aurora</Link>
                    <Link href="/locations/boulder-co" className="text-green-600 hover:underline">Boulder</Link>
                    <Link href="/locations/colorado-springs-co" className="text-green-600 hover:underline">Colorado Springs</Link>
                    <Link href="/locations/fort-collins-co" className="text-green-600 hover:underline">Fort Collins</Link>
                    <Link href="/locations/phoenix-az" className="text-green-600 hover:underline">Phoenix</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
