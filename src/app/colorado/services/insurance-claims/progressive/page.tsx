import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, CheckCircle, FileText, Shield, DollarSign } from 'lucide-react';
import InsuranceQuoteForm from '@/components/InsuranceQuoteForm';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Progressive Windshield Replacement CO | $0 Deductible',
  description: 'Progressive covers windshield replacement in Colorado — often $0 deductible. We handle all paperwork and bill Progressive directly. (720) 918-7465.',
  keywords: 'progressive windshield replacement, progressive glass claim, progressive glass coverage, progressive auto glass, progressive windshield claim denver, progressive 0 deductible glass colorado, progressive windshield replacement colorado springs, progressive windshield coverage',
  alternates: {
    canonical: 'https://pinkautoglass.com/colorado/services/insurance-claims/progressive',
  },
  openGraph: {
    title: 'Progressive Windshield Replacement CO | $0 Deductible',
    description: 'Progressive covers windshield replacement in Colorado — often $0 deductible. We handle all paperwork and bill Progressive directly. (720) 918-7465.',
    url: 'https://pinkautoglass.com/colorado/services/insurance-claims/progressive',
    type: 'website',
  },
};

export default function ProgressiveInsurancePage() {
  const faqs = [
    {
      question: 'Does Progressive cover windshield replacement in Colorado?',
      answer: 'Yes! If you have comprehensive coverage on your Progressive auto insurance policy, windshield repair and replacement are covered. In Colorado, many Progressive policies offer $0 deductible for glass claims, meaning you pay nothing out of pocket. We\'ll verify your exact coverage when you call.'
    },
    {
      question: 'Will filing a Progressive windshield claim raise my rates?',
      answer: 'No. Progressive does not raise your insurance rates for comprehensive glass claims in Colorado. Windshield damage is considered a no-fault comprehensive claim, not an at-fault collision claim. Your rates should remain the same after filing a glass claim.'
    },
    {
      question: 'How do I file a Progressive windshield claim?',
      answer: 'It\'s easy! Simply call us at (720) 918-7465 or book online. We\'ll gather your Progressive policy information, help you file the claim with Progressive, and handle all communication with them. You don\'t need to call Progressive first - we do everything for you.'
    },
    {
      question: 'What is Progressive\'s glass deductible in Colorado?',
      answer: 'Many Progressive policies in Colorado have a $0 deductible for comprehensive glass claims. This means windshield repair or replacement can be completely free with no out-of-pocket cost. We\'ll verify your specific deductible before starting any work.'
    },
  ];

  const serviceSchema = generateServiceSchema({
    serviceName: 'Progressive Windshield Replacement',
    description: 'Progressive insurance approved windshield replacement and repair service. We handle all claim paperwork and bill Progressive directly.',
    serviceType: 'Insurance Auto Glass Service',
    areaServed: ['Denver', 'Aurora', 'Lakewood', 'Boulder', 'Highlands Ranch', 'Thornton', 'Arvada', 'Westminster', 'Parker', 'Centennial', 'Fort Collins', 'Colorado Springs']
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Services', url: 'https://pinkautoglass.com/services' },
    { name: 'Insurance Claims', url: 'https://pinkautoglass.com/colorado/services/insurance-claims' },
    { name: 'Progressive', url: 'https://pinkautoglass.com/colorado/services/insurance-claims/progressive' }
  ]);

  const combinedSchema = combineSchemas(serviceSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 page-top-padding">
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 mr-2" />
                <span className="text-xl">Progressive Approved Shop</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Progressive Windshield Replacement Denver
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                $0 Deductible Often • We File Your Claim • Direct Billing • Won't Raise Rates
              </p>
              <div className="max-w-md mx-auto mt-6">
                <InsuranceQuoteForm carrier="Progressive" source="progressive-insurance" />
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Services', href: '/services' },
              { label: 'Insurance Claims', href: '/services/insurance-claims' },
              { label: 'Progressive', href: '/services/insurance-claims/progressive' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Progressive Makes Windshield Claims Easy - And So Do We
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Most Progressive drivers in Colorado qualify for <strong>zero-deductible</strong> windshield replacement. Give us your policy number — we handle everything.
                </p>

                <AboveFoldCTA location="service-progressive" />
              </section>

              {/* Progressive Benefits */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Why Progressive Customers Choose Pink Auto Glass
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-3">
                      <DollarSign className="w-8 h-8 text-blue-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Often $0 Deductible</h3>
                    </div>
                    <p className="text-gray-700">
                      Many Progressive policies in Colorado have zero deductible for comprehensive glass claims. We'll verify your coverage before starting work.
                    </p>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-3">
                      <FileText className="w-8 h-8 text-blue-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">We File Everything</h3>
                    </div>
                    <p className="text-gray-700">
                      Don't call Progressive first. Call us! We'll file the claim, provide all documentation, and communicate with Progressive on your behalf.
                    </p>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-3">
                      <Shield className="w-8 h-8 text-blue-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Won't Raise Rates</h3>
                    </div>
                    <p className="text-gray-700">
                      Glass claims are comprehensive (not at-fault) claims. Progressive does not raise your rates for windshield replacements in Colorado.
                    </p>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="w-8 h-8 text-blue-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Direct Billing</h3>
                    </div>
                    <p className="text-gray-700">
                      We bill Progressive directly. You only pay your deductible (if any). No upfront payment, no reimbursement hassle.
                    </p>
                  </div>
                </div>
              </section>

              {/* How It Works */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  How Progressive Windshield Claims Work
                </h2>
                <div className="space-y-4">
                  {[
                    { num: 1, title: 'Call Us First', desc: 'Call (720) 918-7465 or book online. Have your Progressive policy number ready (it\'s on your insurance card).' },
                    { num: 2, title: 'We Verify Coverage', desc: 'We contact Progressive to verify your comprehensive coverage and confirm your deductible amount.' },
                    { num: 3, title: 'We File Your Claim', desc: 'We submit all required claim documentation to Progressive. You don\'t need to do anything.' },
                    { num: 4, title: 'Schedule Service', desc: 'Choose mobile service (we come to you) or visit us. Same-day appointments available.' },
                    { num: 5, title: 'Professional Installation', desc: 'We replace your windshield using OEM glass and include ADAS calibration if needed.' },
                    { num: 6, title: 'We Bill Progressive', desc: 'We send the invoice directly to Progressive. You only pay your deductible (often $0).' },
                    { num: 7, title: 'Lifetime Warranty', desc: 'Drive away with peace of mind. Our lifetime warranty covers workmanship and leaks.' }
                  ].map((step) => (
                    <div key={step.num} className="flex items-start bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
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

              {/* Coverage Details */}
              <section className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  What Progressive Comprehensive Coverage Includes
                </h2>
                <p className="text-gray-700 mb-4">
                  If you have comprehensive coverage on your Progressive policy, here's what's typically covered:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Windshield chip repair (often $0 cost)',
                    'Full windshield replacement',
                    'Side window replacement',
                    'Rear window replacement',
                    'ADAS calibration (required for safety)',
                    'Mobile service at your location',
                    'Rock chip damage from road debris',
                    'Hail damage to glass'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center bg-white p-3 rounded">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Progressive vs Other Insurers */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Progressive vs Other Insurance Companies
                </h2>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-900 font-semibold">Feature</th>
                        <th className="px-4 py-3 text-center text-blue-600 font-semibold">Progressive</th>
                        <th className="px-4 py-3 text-center text-gray-600">Typical Insurers</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-4 py-3 text-gray-700">Glass Deductible</td>
                        <td className="px-4 py-3 text-center text-blue-600 font-semibold">Often $0</td>
                        <td className="px-4 py-3 text-center text-gray-600">$100-$500</td>
                      </tr>
                      <tr className="border-t bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">Rate Increase After Claim</td>
                        <td className="px-4 py-3 text-center text-blue-600 font-semibold">No</td>
                        <td className="px-4 py-3 text-center text-gray-600">Usually No</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-3 text-gray-700">Choose Your Own Shop</td>
                        <td className="px-4 py-3 text-center text-blue-600 font-semibold">Yes</td>
                        <td className="px-4 py-3 text-center text-gray-600">Yes</td>
                      </tr>
                      <tr className="border-t bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">ADAS Calibration Covered</td>
                        <td className="px-4 py-3 text-center text-blue-600 font-semibold">Yes</td>
                        <td className="px-4 py-3 text-center text-gray-600">Usually Yes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  *Coverage varies by policy. We'll verify your specific Progressive benefits when you call.
                </p>
              </section>

              {/* FAQs */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Progressive Windshield Claim FAQs
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                      <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                        {faq.question}
                        <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              {/* CTA Section */}
              <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to File Your Progressive Claim?</h2>
                <p className="text-xl mb-6 text-blue-100">
                  We handle everything. Often $0 out-of-pocket. Same-day service available.
                </p>
                <a href="tel:+17209187465" className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold py-3 px-8 rounded-xl text-lg hover:bg-teal-50 transition-colors">
                  <Phone className="w-5 h-5" />
                  Call (720) 918-7465
                </a>
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <InsuranceQuoteForm carrier="Progressive" source="progressive-sidebar" />

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Why File Through Us?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">We handle <strong>all paperwork</strong> with Progressive</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Direct billing</strong> - no upfront payment</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Same-day</strong> mobile service available</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Lifetime warranty</strong> on our work</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Other Insurance Providers</h3>
                  <p className="text-sm text-gray-600 mb-3">We also work with:</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/services/insurance-claims" className="text-blue-600 hover:underline">
                        Geico, State Farm, Allstate →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/insurance-claims" className="text-blue-600 hover:underline">
                        USAA, Farmers, AAA →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/insurance-claims" className="text-blue-600 hover:underline">
                        View All Insurers →
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
