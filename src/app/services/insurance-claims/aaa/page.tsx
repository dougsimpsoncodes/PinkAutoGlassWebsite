import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MessageSquare, Calendar, CheckCircle, FileText, Shield, Award } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'AAA Windshield Replacement | AAA Approved Shop | (720) 918-7465',
  description: 'AAA approved auto repair shop. We handle your AAA windshield claim. Direct billing. Often $0 deductible. Same-day mobile service. Won\'t raise rates. Call (720) 918-7465.',
  keywords: 'aaa windshield claim, aaa windshield replacement, aaa auto glass, aaa approved auto repair, aaa glass claims, triple aaa windshield repair',
  alternates: {
    canonical: 'https://pinkautoglass.com/services/insurance-claims/aaa',
  },
  openGraph: {
    title: 'AAA Windshield Replacement Denver | AAA Approved Shop',
    description: 'AAA approved • We file your claim • Direct billing • Often $0 deductible • Call (720) 918-7465',
    url: 'https://pinkautoglass.com/services/insurance-claims/aaa',
    type: 'website',
  },
};

export default function AAAInsurancePage() {
  const faqs = [
    {
      question: 'Does AAA insurance cover windshield replacement?',
      answer: 'Yes! If you have comprehensive coverage on your AAA auto insurance policy, windshield repair and replacement are typically covered. Many AAA policies offer reduced or zero deductibles for glass claims in Colorado. We\'ll verify your specific coverage when you contact us.'
    },
    {
      question: 'What is AAA\'s deductible for windshield replacement in Colorado?',
      answer: 'AAA deductibles for glass vary by policy. Many AAA policies in Colorado offer $0 or reduced deductibles for comprehensive glass claims, especially for repairs. We\'ll verify your exact deductible before starting any work so you know your out-of-pocket cost.'
    },
    {
      question: 'How do I file an AAA windshield claim?',
      answer: 'Simply call us at (720) 918-7465 or book online. Provide your AAA policy information, and we\'ll handle filing the claim with AAA for you. You can also call AAA first at 1-800-AAA-HELP, but it\'s not required - we can start the process for you.'
    },
    {
      question: 'Is Pink Auto Glass an AAA approved shop?',
      answer: 'Yes! Pink Auto Glass meets AAA\'s standards for quality auto glass service. We\'re experienced with AAA claims processing and work directly with AAA to ensure smooth, hassle-free claims for their members.'
    },
  ];

  const serviceSchema = generateServiceSchema({
    serviceName: 'AAA Windshield Replacement',
    description: 'AAA approved auto glass service. We handle all AAA windshield claims and bill directly. Professional windshield repair and replacement across Colorado.',
    serviceType: 'AAA Insurance Auto Glass Service',
    areaServed: ['Denver', 'Aurora', 'Lakewood', 'Boulder', 'Highlands Ranch', 'Thornton', 'Arvada', 'Westminster', 'Parker', 'Centennial', 'Fort Collins', 'Colorado Springs']
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Services', url: 'https://pinkautoglass.com/services' },
    { name: 'Insurance Claims', url: 'https://pinkautoglass.com/services/insurance-claims' },
    { name: 'AAA', url: 'https://pinkautoglass.com/services/insurance-claims/aaa' }
  ]);

  const combinedSchema = combineSchemas(serviceSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-red-50 page-top-padding">
        <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Award className="w-8 h-8 mr-2" />
                <span className="text-xl">AAA Approved Auto Repair Shop</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                AAA Windshield Replacement Denver
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-red-100">
                AAA Approved • We File Your Claim • Direct Billing • Often Low/No Deductible
              </p>
              <CTAButtons source="aaa-insurance" />
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
              { label: 'AAA', href: '/services/insurance-claims/aaa' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  AAA Members: We Make Your Windshield Claim Easy
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Most AAA drivers in Colorado qualify for <strong>zero-deductible</strong> windshield replacement. Give us your policy number — we handle everything.
                </p>

                <AboveFoldCTA location="service-aaa" />
              </section>

              {/* AAA Member Benefits */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  AAA Member Benefits with Pink Auto Glass
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-3">
                      <Award className="w-8 h-8 text-red-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">AAA Approved Shop</h3>
                    </div>
                    <p className="text-gray-700">
                      We meet AAA's strict standards for quality, service, and reliability. Your AAA membership gives you access to trusted, approved repair shops like us.
                    </p>
                  </div>

                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-3">
                      <FileText className="w-8 h-8 text-red-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">We File Everything</h3>
                    </div>
                    <p className="text-gray-700">
                      Don't worry about paperwork. We handle filing your AAA claim, providing documentation, and communicating with AAA throughout the process.
                    </p>
                  </div>

                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-3">
                      <Shield className="w-8 h-8 text-red-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Quality Guarantee</h3>
                    </div>
                    <p className="text-gray-700">
                      OEM quality glass, professional installation, ADAS calibration included, and lifetime warranty on workmanship and leaks.
                    </p>
                  </div>

                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="w-8 h-8 text-red-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Direct Billing</h3>
                    </div>
                    <p className="text-gray-700">
                      We bill AAA directly. You only pay your deductible (if any). No upfront payment, no waiting for reimbursement.
                    </p>
                  </div>
                </div>
              </section>

              {/* How It Works */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  How AAA Windshield Claims Work
                </h2>
                <div className="space-y-4">
                  {[
                    { num: 1, title: 'Contact Us First', desc: 'Call (720) 918-7465 or book online. Have your AAA membership number and policy info ready.' },
                    { num: 2, title: 'We Verify AAA Coverage', desc: 'We contact AAA to verify your comprehensive coverage and confirm your deductible amount.' },
                    { num: 3, title: 'We File Your Claim', desc: 'We submit all required documentation to AAA. You don\'t need to call AAA or handle paperwork.' },
                    { num: 4, title: 'Choose Service Type', desc: 'Select mobile service (we come to you) or visit our location. Same-day appointments available.' },
                    { num: 5, title: 'Professional Service', desc: 'We repair or replace your windshield using OEM glass. ADAS calibration included if needed.' },
                    { num: 6, title: 'We Bill AAA', desc: 'We send the invoice directly to AAA. You only pay your deductible (often low or $0).' },
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

              {/* AAA Coverage Details */}
              <section className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  What AAA Comprehensive Coverage Typically Includes
                </h2>
                <p className="text-gray-700 mb-4">
                  If you have comprehensive auto insurance through AAA, here's what's usually covered:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Windshield chip repair (often no deductible)',
                    'Full windshield replacement',
                    'Side window replacement',
                    'Rear window replacement',
                    'ADAS calibration (safety requirement)',
                    'Mobile service at your location',
                    'Rock chip damage',
                    'Weather-related glass damage'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center bg-white p-3 rounded">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* AAA Membership Benefits */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why AAA Members Choose Pink Auto Glass
                </h2>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">AAA's Quality Standards</h3>
                        <p className="text-gray-700">We meet or exceed AAA's requirements for technician training, equipment, and customer service</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Hassle-Free Claims</h3>
                        <p className="text-gray-700">We handle all communication with AAA so you don't have to navigate the claims process</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Convenient Service</h3>
                        <p className="text-gray-700">Mobile service available across Colorado. We come to your home, office, or preferred location</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Won't Raise Your Rates</h3>
                        <p className="text-gray-700">Glass claims are comprehensive (not at-fault). AAA typically doesn't raise rates for windshield claims</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </section>

              {/* FAQs */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  AAA Windshield Claim FAQs
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

              {/* CTA Section */}
              <section className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to File Your AAA Claim?</h2>
                <p className="text-xl mb-6 text-red-100">
                  AAA approved shop. We handle everything. Often low or no deductible.
                </p>
                <CTAButtons source="aaa-cta" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-red-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">File Your AAA Claim</h3>
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
                      <li>• AAA membership number</li>
                      <li>• AAA insurance policy number</li>
                      <li>• Vehicle VIN number</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">AAA Member Advantages</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Award className="w-5 h-5 text-red-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>AAA approved</strong> quality standards</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-red-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>We file</strong> all AAA paperwork</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-red-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Direct billing</strong> to AAA</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-red-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Lifetime warranty</strong> included</span>
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
                      <Link href="/services/insurance-claims" className="text-red-600 hover:underline">
                        State Farm, Geico, Allstate →
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
