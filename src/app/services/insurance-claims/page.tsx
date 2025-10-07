import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MessageSquare, Calendar, CheckCircle, FileText, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Auto Glass Insurance Claims Denver - We Handle Everything',
  description: 'Hassle-free auto glass insurance claims in Denver. Often $0 deductible in Colorado. We bill insurance directly. All paperwork handled. Work with all major insurers. Call (720) 918-7465.',
  keywords: 'auto glass insurance claims denver, windshield insurance colorado, zero deductible windshield, insurance glass replacement',
  openGraph: {
    title: 'Auto Glass Insurance Claims Made Easy | Pink Auto Glass',
    description: 'We handle all insurance paperwork. Often $0 out-of-pocket in Colorado. Direct billing to your insurance.',
    url: 'https://pinkautoglass.com/services/insurance-claims',
    type: 'website',
  },
};

export default function InsuranceClaimsPage() {
  const faqs = [
    {
      question: 'Does insurance cover windshield replacement in Colorado?',
      answer: 'Yes! In Colorado, most comprehensive auto insurance policies cover windshield replacement. Better yet, Colorado law encourages carriers to offer zero-deductible coverage for auto glass, meaning you often pay nothing out of pocket. We work with all major insurance companies including State Farm, Geico, Progressive, Allstate, USAA, Farmers, Liberty Mutual, and Nationwide. We verify your coverage before starting work so you know exactly what you\'ll pay.'
    },
    {
      question: 'Do I have to use my insurance company\'s recommended shop?',
      answer: 'No! Colorado law gives you the right to choose any auto glass repair shop you prefer. While your insurance may recommend certain shops, you are never required to use them. You have the freedom to choose Pink Auto Glass or any other provider you trust. Insurance companies must honor your choice and cannot deny your claim based solely on your shop selection.'
    },
  ];

  const serviceSchema = generateServiceSchema({
    serviceName: 'Auto Glass Insurance Claims',
    description: 'Hassle-free auto glass insurance claims service in Denver. We handle all paperwork and bill your insurance directly. Often zero deductible in Colorado.',
    priceRange: '0-100',
    serviceType: 'Insurance Claims Assistance',
    areaServed: ['Denver Metropolitan Area']
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Services', url: 'https://pinkautoglass.com/services' },
    { name: 'Insurance Claims', url: 'https://pinkautoglass.com/services/insurance-claims' }
  ]);

  const combinedSchema = combineSchemas(serviceSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
        <section className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 mr-2" />
                <span className="text-xl">Zero-Hassle Claims</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Auto Glass Insurance Claims Made Easy
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-teal-100">
                We Handle All Paperwork • Often $0 Deductible • Direct Billing • All Major Insurers
              </p>
              <CTAButtons source="insurance-claims" />
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
              { label: 'Insurance Claims', href: '/services/insurance-claims' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Insurance Claims Should Be Easy - And They Are
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Dealing with insurance doesn't have to be frustrating. At Pink Auto Glass, we handle 100% of the insurance paperwork for you. We'll verify your coverage, file your claim, communicate with your insurer, and bill them directly. You just approve the work - we take care of everything else.
                </p>

                <AboveFoldCTA location="service-insurance-claims" />

                <p className="text-lg text-gray-700 mb-4">
                  In Colorado, most comprehensive policies cover windshield repair and replacement with zero deductible. This means you often pay absolutely nothing out of pocket. Even if you have a deductible, we'll tell you the exact amount before we start work - no surprises.
                </p>
              </section>

              <section className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Colorado's Zero-Deductible Law
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Colorado encourages insurance companies to waive deductibles for auto glass claims. Why? Because prompt windshield repair and replacement keeps drivers safe and prevents more costly damage.
                </p>
                <div className="bg-white rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-3xl font-bold text-green-600 mb-2">Repair</div>
                      <div className="text-lg font-semibold mb-1">Usually $0</div>
                      <p className="text-sm text-gray-600">Most insurers waive deductible for chip repair</p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600 mb-2">Replacement</div>
                      <div className="text-lg font-semibold mb-1">Often $0</div>
                      <p className="text-sm text-gray-600">Many policies have $0-$100 glass deductible</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  How Our Insurance Claims Process Works
                </h2>
                <div className="space-y-4">
                  {[
                    { num: 1, title: 'Provide Insurance Info', desc: 'Give us your insurance company name and policy number (usually on your insurance card).' },
                    { num: 2, title: 'We Verify Coverage', desc: 'We call your insurer to verify coverage, deductible amount, and any specific requirements.' },
                    { num: 3, title: 'You Approve Cost', desc: 'We tell you exactly what you\'ll pay out-of-pocket (often $0) before we start any work.' },
                    { num: 4, title: 'We File the Claim', desc: 'We submit all required claim documentation to your insurance company on your behalf.' },
                    { num: 5, title: 'We Complete Service', desc: 'We repair or replace your windshield using OEM-quality materials and professional installation.' },
                    { num: 6, title: 'We Bill Insurance', desc: 'We bill your insurance company directly. You only pay your deductible (if any).' },
                    { num: 7, title: 'You\'re Done!', desc: 'Your windshield is fixed, your claim is handled, and you can drive away safely.' }
                  ].map((step) => (
                    <div key={step.num} className="flex items-start bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
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

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Insurance Companies We Work With
                </h2>
                <p className="text-gray-700 mb-6">We work with all major insurance providers:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    'State Farm', 'Geico', 'Progressive', 'Allstate',
                    'USAA', 'Farmers', 'Liberty Mutual', 'Nationwide',
                    'American Family', 'Travelers', 'AAA', 'Safeco',
                    'The Hartford', 'Mercury', 'Esurance', 'MetLife'
                  ].map(insurer => (
                    <div key={insurer} className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:bg-teal-50 hover:border-teal-300 transition-colors">
                      <span className="text-gray-700 font-medium">{insurer}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 mt-4 text-center">
                  Don't see your insurer? <a href="tel:+17209187465" className="text-teal-600 hover:underline font-semibold">Call us</a> - we work with all carriers!
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Your Rights in Colorado
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">✓ You Can Choose Your Shop</h3>
                    <p className="text-blue-800">
                      Colorado law gives you the right to choose any auto glass repair shop. Insurance companies cannot require you to use a specific shop or deny claims based on your choice.
                    </p>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">✓ Quality Parts Guaranteed</h3>
                    <p className="text-blue-800">
                      You have the right to OEM-quality parts. We use only high-quality glass that meets or exceeds factory specifications - never inferior aftermarket glass.
                    </p>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">✓ Warranty Protection</h3>
                    <p className="text-blue-800">
                      Our lifetime warranty on workmanship and leaks is honored regardless of which insurance company you use. Your coverage is with us, not your insurer.
                    </p>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">✓ No Rate Increase for Glass</h3>
                    <p className="text-blue-800">
                      Most insurance companies do not raise your rates for comprehensive glass claims. Glass claims are considered no-fault incidents.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Popular Vehicles We Service
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { make: 'Toyota', model: 'Camry', slug: 'toyota-camry-windshield-replacement-denver' },
                    { make: 'Honda', model: 'Accord', slug: 'honda-accord-windshield-replacement-denver' },
                    { make: 'Subaru', model: 'Outback', slug: 'subaru-outback-windshield-replacement-denver' },
                    { make: 'Ford', model: 'F-150', slug: 'ford-f150-windshield-replacement-denver' },
                    { make: 'Jeep', model: 'Wrangler', slug: 'jeep-wrangler-windshield-replacement-denver' },
                  ].map(v => (
                    <Link
                      key={v.slug}
                      href={`/vehicles/${v.slug}`}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-teal-500 hover:shadow-md transition-all"
                    >
                      <div className="font-semibold text-gray-900">{v.make} {v.model}</div>
                      <div className="text-sm text-teal-600">View Pricing →</div>
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
                        <span className="text-teal-600 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to File Your Claim?</h2>
                <p className="text-xl mb-6 text-teal-100">
                  We handle all paperwork. Often $0 out-of-pocket. Direct billing.
                </p>
                <CTAButtons source="insurance-claims" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-teal-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Start Your Claim</h3>
                  <div className="space-y-3">
                    <a
                      href="tel:+17209187465"
                      className="flex items-center justify-center w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Call (720) 918-7465
                    </a>
                    <a
                      href="sms:+17209187465"
                      className="flex items-center justify-center w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Text Policy Info
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
                  <h3 className="text-lg font-bold text-gray-900 mb-4">What You'll Need</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-teal-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Insurance Card</strong> with policy number</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-teal-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>VIN Number</strong> (on dashboard or insurance card)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-teal-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Claim Number</strong> (if already filed)</span>
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
                      <Link href="/services/windshield-replacement" className="text-teal-600 hover:underline">
                        Windshield Replacement →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/windshield-repair" className="text-teal-600 hover:underline">
                        Windshield Repair →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/mobile-service" className="text-teal-600 hover:underline">
                        Mobile Service →
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
