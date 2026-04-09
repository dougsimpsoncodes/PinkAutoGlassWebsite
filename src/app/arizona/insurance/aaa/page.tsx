import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Shield, FileText, DollarSign, ChevronRight, Phone } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import InsuranceQuoteForm from '@/components/InsuranceQuoteForm';
import { generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  robots: { index: false },
  title: 'AAA Windshield Replacement CO | $0 Deductible',
  description: 'AAA covers windshield replacement in Colorado — often $0 deductible. We handle all paperwork and bill AAA directly. Call (480) 712-7465.',
  alternates: {
    canonical: 'https://pinkautoglass.com/arizona/insurance/aaa',
  },
  openGraph: {
    title: 'AAA Windshield Replacement CO | $0 Deductible',
    description: 'AAA covers windshield replacement in Colorado — often $0 deductible. We handle all paperwork and bill AAA directly. Call (480) 712-7465.',
    url: 'https://pinkautoglass.com/arizona/insurance/aaa',
    type: 'website',
  },
};

const OTHER_CARRIERS = [
  { name: 'Progressive', slug: 'progressive' },
  { name: 'Allstate', slug: 'allstate' },
  { name: 'Geico', slug: 'geico' },
  { name: 'Esurance', slug: 'esurance' },
  { name: 'State Farm', slug: 'state-farm' },
  { name: 'USAA', slug: 'usaa' },
  { name: 'Farmers', slug: 'farmers' },
  { name: 'Safeco', slug: 'safeco' },
  { name: 'Liberty Mutual', slug: 'liberty-mutual' },
];

export default function AAAPage() {
  const faqs = [
    {
      question: 'Is my AAA windshield covered by my membership or by insurance?',
      answer: 'AAA auto glass coverage comes from your AAA auto insurance policy — not your roadside membership. AAA underwrites auto insurance through CSAA Insurance Group or the Interinsurance Exchange of the Automobile Club depending on your region. Your glass claim is processed through the insurance carrier, not your membership account.'
    },
    {
      question: 'Will filing an AAA glass claim affect my membership benefits?',
      answer: 'No. Filing a comprehensive glass claim under your AAA auto insurance has no effect on your AAA membership, roadside assistance benefits, or member discounts. Glass claims are classified as no-fault comprehensive claims and do not affect your driving record or membership standing.'
    },
    {
      question: 'How do I contact AAA to file a glass claim?',
      answer: 'You don\'t have to. When you call Pink Auto Glass, we contact AAA\'s claims department on your behalf. We verify your coverage, deductible, and any specific requirements — then we handle all the paperwork. Just give us your AAA policy number and we take it from there.'
    },
    {
      question: 'Can I use Pink Auto Glass with AAA insurance?',
      answer: 'Yes. Colorado law gives you the right to choose any licensed auto glass shop regardless of what AAA recommends. We work directly with AAA\'s claims process and bill them directly. AAA members often have preferred pricing but can always choose an independent shop like Pink Auto Glass.'
    },
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Insurance Claims', url: 'https://pinkautoglass.com/services/insurance-claims' },
    { name: 'AAA', url: 'https://pinkautoglass.com/arizona/insurance/aaa' },
  ]);
  const combinedSchema = combineSchemas(faqSchema, breadcrumbSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <article className="min-h-screen bg-gradient-to-b from-white to-green-50 page-top-padding">
        <section className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 mr-2" />
                <span className="text-xl">AAA Insurance</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                AAA Windshield Claim Colorado — How to File &amp; Get $0 Service
              </h1>
              <p className="answer-first text-lg text-gray-100 leading-relaxed mb-6 max-w-3xl mx-auto">
                Yes — most AAA policyholders in Colorado qualify for zero-deductible windshield replacement. Claims go through your underwriting carrier, not your roadside membership — we handle it all and bill AAA directly.
              </p>
              <div className="max-w-md mx-auto mt-6">
                <InsuranceQuoteForm carrier="AAA" source="aaa-insurance" />
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Services', href: '/services' },
              { label: 'Insurance Claims', href: '/services/insurance-claims' },
              { label: 'AAA' },
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <time dateTime="2026-02-26" className="text-sm text-gray-500">
            Updated February 26, 2026
          </time>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mt-6">
          <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10 lg:items-start">
            <div className="space-y-12">

            <section className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <h2 className="text-2xl font-bold text-blue-900 mb-3">$0 Out of Pocket with AAA in Colorado</h2>
              <p className="text-blue-800 text-lg">
                Colorado law requires insurers to offer zero-deductible glass coverage. Most AAA policyholders qualify — we verify your coverage and confirm your cost before we start.
              </p>
              <div className="mt-4 flex items-center text-blue-900 font-semibold">
                <DollarSign className="w-5 h-5 mr-2" />
                We bill AAA directly — you don't call them.
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How an AAA Windshield Claim Works</h2>
              <div className="space-y-4">
                {[
                  { num: 1, title: 'Call or Text Us', desc: 'Provide your AAA policy number. We handle everything from this point forward.' },
                  { num: 2, title: 'We Contact AAA', desc: 'We call AAA\'s glass claims line, confirm your comprehensive coverage, and check your deductible — often $0 under CO law.' },
                  { num: 3, title: 'You Approve Cost', desc: 'We tell you exactly what you\'ll owe before we begin. Most Colorado AAA drivers pay nothing.' },
                  { num: 4, title: 'Mobile Service at Your Location', desc: 'We come to your home, office, or any safe location. Replacement completed in 1–2 hours.' },
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What AAA Customers Should Know</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: 'Insurance vs. Membership', body: 'AAA glass coverage is part of your auto insurance policy, not your roadside membership. Claims go through CSAA Insurance Group or the Interinsurance Exchange depending on your region.' },
                  { title: 'No Effect on Membership', body: 'Comprehensive glass claims are no-fault. Filing one does not affect your AAA membership, roadside benefits, or member discounts.' },
                  { title: 'AAA Member Preferred Pricing', body: 'AAA members may have access to preferred pricing or network shops. However, you are never required to use them. Colorado law protects your right to choose.' },
                  { title: 'You Choose Your Shop', body: 'Colorado law gives you the right to choose any licensed auto glass shop. We work directly with AAA\'s claims process and handle all billing.' },
                ].map((fact) => (
                  <div key={fact.title} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{fact.title}</h3>
                        <p className="text-gray-700 text-sm">{fact.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions — AAA</h2>
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
              <h2 className="text-3xl font-bold mb-4">File Your AAA Glass Claim Today</h2>
              <p className="text-xl mb-6 text-teal-100">
                We handle all paperwork. Often $0 out of pocket. Direct billing to AAA.
              </p>
              <a href="tel:+14807127465" className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold py-3 px-8 rounded-xl text-lg hover:bg-teal-50 transition-colors">
                <Phone className="w-5 h-5" />
                Call (480) 712-7465
              </a>
            </section>

            <section className="bg-white rounded-xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Other Insurance Carriers We Work With</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {OTHER_CARRIERS.map((carrier) => (
                  <Link
                    key={carrier.slug}
                    href={`/insurance/${carrier.slug}`}
                    className="flex items-center justify-between bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-300 rounded-lg px-4 py-3 text-gray-900 transition-colors"
                  >
                    <span className="font-medium">{carrier.name}</span>
                    <ChevronRight className="w-4 h-4 text-teal-600" />
                  </Link>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/services/insurance-claims" className="text-teal-600 hover:underline font-semibold">
                  View All Insurance Carriers →
                </Link>
              </div>
            </section>

            </div>

            {/* Sticky sidebar form */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <InsuranceQuoteForm carrier="AAA" source="insurance-aaa" />
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
