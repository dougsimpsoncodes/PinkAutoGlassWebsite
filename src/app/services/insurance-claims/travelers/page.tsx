import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MessageSquare, Calendar, CheckCircle, FileText, Shield, Award } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Travelers Windshield Replacement | $0 Deductible CO | (720) 918-7465',
  description: 'Travelers approved shop. Often $0 deductible for glass in Colorado. We file your claim. Direct billing. Same-day mobile service. Won\'t raise rates. Call (720) 918-7465.',
  keywords: 'state farm windshield replacement, state farm glass claim, state farm auto glass, state farm windshield claim, state farm comprehensive glass coverage',
  alternates: {
    canonical: 'https://pinkautoglass.com/services/insurance-claims/travelers',
  },
  openGraph: {
    title: 'Travelers Windshield Replacement Denver | $0 Deductible Often',
    description: 'Travelers approved • We file your claim • Direct billing • Often $0 deductible • Call (720) 918-7465',
    url: 'https://pinkautoglass.com/services/insurance-claims/travelers',
    type: 'website',
  },
};

export default function StateFarmInsurancePage() {
  const faqs = [
    {
      question: 'Does Travelers cover windshield replacement in Colorado?',
      answer: 'Yes! If you have comprehensive coverage on your Travelers auto insurance policy, windshield repair and replacement are covered. In Colorado, many Travelers policies offer $0 deductible for glass repair and low deductibles for replacement. We\'ll verify your exact coverage when you call.'
    },
    {
      question: 'Will filing a Travelers windshield claim raise my rates?',
      answer: 'No. Travelers does not raise your insurance rates for comprehensive glass claims in Colorado. Windshield damage is considered a no-fault comprehensive claim, not an at-fault collision claim. Your rates should remain the same after filing a glass claim.'
    },
    {
      question: 'How do I file a Travelers windshield claim?',
      answer: 'Simply call us at (720) 918-7465 or book online. We\'ll gather your Travelers policy information and file the claim for you. You can also call Travelers first at 1-800-1-800-TRAVELERS, but it\'s not required - we handle everything for you.'
    },
    {
      question: 'What is Travelers\'s glass deductible in Colorado?',
      answer: 'Travelers glass deductibles vary by policy, but many Colorado policies have a $0 deductible for windshield repair (chips) and a reduced deductible for full replacement. We\'ll verify your specific deductible before starting any work so there are no surprises.'
    },
  ];

  const serviceSchema = generateServiceSchema({
    serviceName: 'Travelers Windshield Replacement',
    description: 'Travelers insurance approved windshield replacement and repair service. We handle all claim paperwork and bill Travelers directly.',
    serviceType: 'Insurance Auto Glass Service',
    areaServed: ['Denver', 'Aurora', 'Lakewood', 'Boulder', 'Highlands Ranch', 'Thornton', 'Arvada', 'Westminster', 'Parker', 'Centennial', 'Fort Collins', 'Colorado Springs']
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Services', url: 'https://pinkautoglass.com/services' },
    { name: 'Insurance Claims', url: 'https://pinkautoglass.com/services/insurance-claims' },
    { name: 'Travelers', url: 'https://pinkautoglass.com/services/insurance-claims/travelers' }
  ]);

  const combinedSchema = combineSchemas(serviceSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-red-50 page-top-padding">
        <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 mr-2" />
                <span className="text-xl">Travelers Approved Shop</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Travelers Windshield Replacement Denver
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-red-100">
                $0 Deductible for Repairs • We File Your Claim • Direct Billing • Won't Raise Rates
              </p>
              <CTAButtons source="travelers-insurance" />
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
              { label: 'Insurance Claims', href: '/services/insurance-claims' },
              { label: 'Travelers', href: '/services/insurance-claims/travelers' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Travelers Customers: Better Together - Travelers Like a Good Neighbor, We're Here to Help Pink Auto Glass
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  As the one of America's leading insurance providers, Travelers serves millions of Colorado drivers. If you have comprehensive coverage on your Travelers policy, your windshield repair or replacement is likely covered with <strong>little to no out-of-pocket cost</strong>. Travelers offers excellent glass coverage in Colorado, often with $0 deductible for chip repairs.
                </p>

                <AboveFoldCTA location="service-travelers" />

                <p className="text-lg text-gray-700 mb-4">
                  At Pink Auto Glass, we're experienced with Travelers claims and handle everything for you. From filing the claim to billing Travelers directly, we manage the entire process. You just approve the work, and we take care of the rest.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Why Travelers Customers Choose Pink Auto Glass
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="w-8 h-8 text-red-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">$0 Chip Repair</h3>
                    </div>
                    <p className="text-gray-700">
                      Most Travelers policies offer zero deductible for windshield chip repair in Colorado. We'll verify your coverage and often complete repairs at no cost to you.
                    </p>
                  </div>

                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-3">
                      <FileText className="w-8 h-8 text-red-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">We File Everything</h3>
                    </div>
                    <p className="text-gray-700">
                      Don't waste time calling Travelers. Call us! We'll file the claim, provide all documentation, and communicate with Travelers throughout the process.
                    </p>
                  </div>

                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-3">
                      <Shield className="w-8 h-8 text-red-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Won't Raise Rates</h3>
                    </div>
                    <p className="text-gray-700">
                      Glass claims are comprehensive (not at-fault) claims. Travelers does not raise your rates for windshield replacements in Colorado.
                    </p>
                  </div>

                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-3">
                      <Award className="w-8 h-8 text-red-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Direct Billing</h3>
                    </div>
                    <p className="text-gray-700">
                      We bill Travelers directly. You only pay your deductible (if any). No upfront payment, no waiting for reimbursement.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  How Travelers Windshield Claims Work
                </h2>
                <div className="space-y-4">
                  {[
                    { num: 1, title: 'Call Us First', desc: 'Call (720) 918-7465 or book online. Have your Travelers policy number ready (it\'s on your insurance card or app).' },
                    { num: 2, title: 'We Verify Coverage', desc: 'We contact Travelers to verify your comprehensive coverage and confirm your deductible amount.' },
                    { num: 3, title: 'We File Your Claim', desc: 'We submit all required claim documentation to Travelers. You don\'t need to do anything.' },
                    { num: 4, title: 'Schedule Service', desc: 'Choose mobile service (we come to you) or visit our location. Same-day appointments available.' },
                    { num: 5, title: 'Professional Installation', desc: 'We replace your windshield using OEM glass and include ADAS calibration if needed.' },
                    { num: 6, title: 'We Bill Travelers', desc: 'We send the invoice directly to Travelers. You only pay your deductible (often $0 for chips).' },
                    { num: 7, title: 'Lifetime Warranty', desc: 'Drive away with peace of mind. Our lifetime warranty covers workmanship and leaks.' }
                  ].map((step) => (
                    <div key={step.num} className="flex items-start bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
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

              <section className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  What Travelers Comprehensive Coverage Includes
                </h2>
                <p className="text-gray-700 mb-4">
                  If you have comprehensive coverage on your Travelers policy, here's what's typically covered:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Windshield chip repair (often $0 deductible)',
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

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Travelers Windshield Claim FAQs
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                      <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                        {faq.question}
                        <span className="text-red-600 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to File Your Travelers Claim?</h2>
                <p className="text-xl mb-6 text-red-100">
                  We handle everything. Often $0 for chip repair. Same-day service available.
                </p>
                <CTAButtons source="travelers-cta" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-red-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">File Your Travelers Claim</h3>
                  <div className="space-y-3">
                    <a
                      href="tel:+17209187465"
                      className="flex items-center justify-center w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
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
                      className="flex items-center justify-center w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Book Online
                    </Link>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      <strong>What You'll Need:</strong>
                    </p>
                    <ul className="text-sm text-gray-700 mt-2 space-y-1">
                      <li>• Travelers policy number</li>
                      <li>• Vehicle VIN number</li>
                      <li>• Date of damage (if known)</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Why File Through Us?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-red-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">We handle <strong>all paperwork</strong> with Travelers</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-red-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Direct billing</strong> - no upfront payment</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-red-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Same-day</strong> mobile service available</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-red-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Lifetime warranty</strong> on our work</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Other Insurance Providers</h3>
                  <p className="text-sm text-gray-600 mb-3">We also work with:</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/services/insurance-claims/progressive" className="text-red-600 hover:underline">
                        Progressive →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/insurance-claims/geico" className="text-red-600 hover:underline">
                        Geico →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/insurance-claims" className="text-red-600 hover:underline">
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
