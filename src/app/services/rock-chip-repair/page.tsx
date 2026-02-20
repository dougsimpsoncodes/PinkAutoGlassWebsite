import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MessageSquare, Calendar, CheckCircle, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Rock Chip Repair Denver | Windshield Chip Repair | (720) 918-7465',
  description: 'Rock chip & windshield chip repair. Often $0 with insurance. Prevents spreading. 30-minute service. Mobile repair available. Denver, Aurora, Boulder. Call (720) 918-7465 now.',
  keywords: 'rock chip repair, windshield chip repair, rock chip windshield repair, progressive rock chip repair, windshield rock chip repair denver, mobile windshield chip repair',
  alternates: {
    canonical: 'https://pinkautoglass.com/services/rock-chip-repair',
  },
  openGraph: {
    title: 'Rock Chip Repair Denver | Often $0 with Insurance',
    description: 'Fast rock chip repair • Prevents spreading • Often free with insurance • Mobile service • Call (720) 918-7465',
    url: 'https://pinkautoglass.com/services/rock-chip-repair',
    type: 'website',
  },
};

export default function RockChipRepairPage() {
  const faqs = [
    {
      question: 'Can a rock chip in my windshield be repaired?',
      answer: 'Most rock chips can be repaired if they are smaller than a quarter (about 1 inch in diameter) and not directly in the driver\'s line of sight. Chips with 3 or fewer legs (cracks radiating from the chip) are typically repairable. We\'ll inspect your chip free and let you know if repair is possible or if replacement is needed.'
    },
    {
      question: 'How much does rock chip repair cost?',
      answer: 'Rock chip repair typically costs between $50-$100 if paying out of pocket. However, most comprehensive insurance policies in Colorado cover chip repair with $0 deductible - meaning it\'s completely free for you. We\'ll verify your insurance coverage before starting work.'
    },
    {
      question: 'How long does rock chip repair take?',
      answer: 'Most rock chip repairs take only 20-30 minutes. The process involves cleaning the chip, injecting a special resin, and curing it with UV light. You can often wait in your car or nearby, and drive away immediately after - no cure time needed.'
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
    serviceName: 'Rock Chip Repair',
    description: 'Professional rock chip and windshield chip repair service across Colorado. Fast, mobile service often covered by insurance with $0 deductible.',
    serviceType: 'Auto Glass Chip Repair',
    areaServed: ['Denver', 'Aurora', 'Lakewood', 'Boulder', 'Highlands Ranch', 'Thornton', 'Arvada', 'Westminster', 'Parker', 'Centennial', 'Fort Collins', 'Colorado Springs']
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Services', url: 'https://pinkautoglass.com/services' },
    { name: 'Rock Chip Repair', url: 'https://pinkautoglass.com/services/rock-chip-repair' }
  ]);

  const combinedSchema = combineSchemas(serviceSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 page-top-padding">
        <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 mr-2" />
                <span className="text-xl">Don't Let Chips Become Cracks</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Rock Chip & Windshield Chip Repair Denver
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-orange-100">
                Often $0 with Insurance • 30-Minute Service • Prevents Spreading • Mobile Available
              </p>
              <CTAButtons source="rock-chip-repair" />
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
              { label: 'Rock Chip Repair', href: '/services/rock-chip-repair' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Got a Rock Chip? Fix It Now Before It Spreads
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Rock chips happen. Gravel trucks, highway debris, road construction - Colorado roads are tough on windshields. That small chip might seem harmless now, but it can quickly spread into a long crack due to temperature changes, vibrations, and road stress. Once it cracks, you'll need a full windshield replacement instead of a simple repair.
                </p>

                <AboveFoldCTA location="service-rock-chip" />

                <p className="text-lg text-gray-700 mb-4">
                  <strong>Good news:</strong> Rock chip repair is fast (30 minutes), affordable ($50-100), and often <strong>completely free</strong> with comprehensive insurance. Most Colorado insurance policies cover chip repair with $0 deductible. We come to you, fix the chip quickly, and prevent it from spreading.
                </p>
              </section>

              {/* Urgent Alert */}
              <section className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                <h3 className="text-xl font-bold text-red-900 mb-3 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  Why You Need to Act Fast
                </h3>
                <ul className="space-y-2 text-gray-800">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span><strong>Temperature Swings:</strong> Colorado's extreme temperature changes (hot days, cold nights) cause glass to expand and contract, spreading chips into cracks</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span><strong>Road Vibrations:</strong> Every bump and pothole stresses the damaged area, making it worse</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span><strong>Cost Escalation:</strong> A $0 chip repair today becomes a $300-800 windshield replacement tomorrow</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span><strong>Safety Risk:</strong> Cracks weaken your windshield's structural integrity and can obstruct your view</span>
                  </li>
                </ul>
              </section>

              {/* Can It Be Repaired? */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Can Your Rock Chip Be Repaired?
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Use this quick guide to determine if your chip is repairable:
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Repairable */}
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                      <CheckCircle className="w-6 h-6 mr-2" />
                      Usually Repairable ✓
                    </h3>
                    <ul className="space-y-2 text-gray-800">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Smaller than a quarter (1 inch diameter)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Not directly in driver's line of sight</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>3 or fewer cracks from the chip</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Not touching the edge of the windshield</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Outer glass layer isn't severely damaged</span>
                      </li>
                    </ul>
                  </div>

                  {/* Needs Replacement */}
                  <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center">
                      <AlertTriangle className="w-6 h-6 mr-2" />
                      Needs Replacement ✗
                    </h3>
                    <ul className="space-y-2 text-gray-800">
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">✗</span>
                        <span>Larger than a quarter</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">✗</span>
                        <span>Crack longer than 6 inches</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">✗</span>
                        <span>Directly in driver's view (safety issue)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">✗</span>
                        <span>Touching or near the edge</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">✗</span>
                        <span>Deep damage penetrating both glass layers</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">
                  <strong>Not sure?</strong> Send us a photo via text at <a href="sms:+17209187465" className="text-blue-600 hover:underline font-semibold">(720) 918-7465</a> or call for a free assessment. We'll let you know if repair is possible or if replacement is needed.
                </p>
              </section>

              {/* How It Works */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  The Rock Chip Repair Process
                </h2>
                <div className="space-y-4">
                  {[
                    { num: 1, title: 'Inspection', time: '2 min', desc: 'We inspect the chip to confirm it\'s repairable and assess the damage extent.' },
                    { num: 2, title: 'Cleaning', time: '5 min', desc: 'We thoroughly clean the chip area to remove dirt, moisture, and debris.' },
                    { num: 3, title: 'Resin Injection', time: '10 min', desc: 'We inject a clear, specialized resin into the chip using a precision injector tool.' },
                    { num: 4, title: 'UV Curing', time: '10 min', desc: 'We cure the resin with UV light to harden it and bond it to the glass permanently.' },
                    { num: 5, title: 'Polishing', time: '3 min', desc: 'We polish the surface smooth and remove any excess resin. The chip is sealed and stabilized.' }
                  ].map((step) => (
                    <div key={step.num} className="flex items-start bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        {step.num}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-lg text-gray-900">{step.title}</h3>
                          <span className="text-sm text-orange-600 font-semibold">{step.time}</span>
                        </div>
                        <p className="text-gray-700">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-center text-gray-700 font-semibold">
                  Total time: 20-30 minutes • You can drive immediately after
                </p>
              </section>

              {/* Pricing */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Rock Chip Repair Pricing
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
                      <li>✓ Won't raise your rates</li>
                      <li>✓ All paperwork handled</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6 text-center">
                    <DollarSign className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Without Insurance</h3>
                    <div className="text-4xl font-bold text-blue-600 mb-3">$50-$100</div>
                    <p className="text-gray-700 mb-4">
                      Affordable pricing if paying out-of-pocket or if you don't have comprehensive coverage
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
                  <strong>Compare to windshield replacement:</strong> $300-$800+ • Not always covered • Takes 90+ minutes
                </p>
              </section>

              {/* Insurance Coverage */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Insurance Companies That Cover Rock Chip Repair
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  We work with all major insurance providers. These companies typically offer $0 deductible for chip repair in Colorado:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    'Progressive', 'State Farm', 'Geico', 'Allstate',
                    'USAA', 'Farmers', 'Liberty Mutual', 'Nationwide',
                    'American Family', 'Travelers', 'AAA', 'Safeco'
                  ].map(insurer => (
                    <div key={insurer} className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:bg-orange-50 hover:border-orange-300 transition-colors">
                      <span className="text-gray-700 font-medium text-sm">{insurer}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 mt-4">
                  We'll verify your coverage before starting work. Call <a href="tel:+17209187465" className="text-orange-600 hover:underline font-semibold">(720) 918-7465</a> with your policy info.
                </p>
              </section>

              {/* Service Areas */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Mobile Rock Chip Repair Across Colorado
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  We offer mobile chip repair throughout the Front Range. We come to you at home, work, or anywhere:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    'Denver', 'Aurora', 'Lakewood', 'Boulder',
                    'Highlands Ranch', 'Thornton', 'Arvada', 'Westminster',
                    'Parker', 'Centennial', 'Littleton', 'Englewood',
                    'Fort Collins', 'Colorado Springs', 'Loveland', 'Longmont'
                  ].map(city => (
                    <div key={city} className="bg-white border border-gray-200 rounded p-2 text-center hover:bg-orange-50 hover:border-orange-300 transition-colors">
                      <span className="text-gray-700 font-medium text-sm">{city}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQs */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Rock Chip Repair FAQs
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                      <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                        {faq.question}
                        <span className="text-orange-600 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              {/* CTA Section */}
              <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Don't Wait - Fix That Chip Today</h2>
                <p className="text-xl mb-6 text-orange-100">
                  Often $0 with insurance. 30-minute service. Prevents expensive replacement.
                </p>
                <CTAButtons source="rock-chip-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-orange-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Schedule Chip Repair</h3>
                  <div className="space-y-3">
                    <a
                      href="tel:+17209187465"
                      className="flex items-center justify-center w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Call (720) 918-7465
                    </a>
                    <a
                      href="sms:+17209187465"
                      className="flex items-center justify-center w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Text Photo of Chip
                    </a>
                    <Link
                      href="/book"
                      className="flex items-center justify-center w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Book Online
                    </Link>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>30-minute service</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span>Often $0 with insurance</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Why Repair Immediately?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-orange-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Prevents spreading</strong> into expensive cracks</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-orange-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Often free</strong> with insurance</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-orange-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Only 30 minutes</strong> of your time</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-orange-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Maintains safety</strong> and visibility</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Related Services</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/services/windshield-repair" className="text-orange-600 hover:underline">
                        Windshield Crack Repair →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/windshield-replacement" className="text-orange-600 hover:underline">
                        Windshield Replacement →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/mobile-service" className="text-orange-600 hover:underline">
                        Mobile Service Info →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/insurance-claims" className="text-orange-600 hover:underline">
                        Insurance Claims Help →
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
