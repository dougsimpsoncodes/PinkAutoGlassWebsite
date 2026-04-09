import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Shield, DollarSign, ChevronRight, Phone } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import InsuranceQuoteForm from '@/components/InsuranceQuoteForm';
import { generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  robots: { index: false },
  title: 'Safeco Windshield Replacement CO | $0 Deductible',
  description: 'Safeco covers windshield replacement in Colorado — often $0 deductible. We handle all paperwork and bill Safeco directly. Call (480) 712-7465.',
  alternates: {
    canonical: 'https://pinkautoglass.com/arizona/insurance/safeco',
  },
  openGraph: {
    title: 'Safeco Windshield Replacement CO | $0 Deductible',
    description: 'Safeco covers windshield replacement in Colorado — often $0 deductible. We handle all paperwork and bill Safeco directly. Call (480) 712-7465.',
    url: 'https://pinkautoglass.com/arizona/insurance/safeco',
    type: 'website',
  },
};

const OTHER_CARRIERS = [
  { name: 'Progressive', slug: 'progressive' },
  { name: 'AAA', slug: 'aaa' },
  { name: 'Allstate', slug: 'allstate' },
  { name: 'Geico', slug: 'geico' },
  { name: 'Esurance', slug: 'esurance' },
  { name: 'State Farm', slug: 'state-farm' },
  { name: 'USAA', slug: 'usaa' },
  { name: 'Farmers', slug: 'farmers' },
  { name: 'Liberty Mutual', slug: 'liberty-mutual' },
];

export default function SafecoPage() {
  const faqs = [
    {
      question: 'Does Safeco cover windshield replacement?',
      answer: 'Yes. Safeco comprehensive coverage includes windshield replacement. Safeco is owned by Liberty Mutual. Under Colorado law, Safeco policyholders may qualify for $0 out of pocket on glass claims. We verify your exact coverage before starting any work.'
    },
    {
      question: 'Is Safeco the same as Liberty Mutual?',
      answer: 'Safeco is a subsidiary of Liberty Mutual. They operate as separate brands but share the same parent company. Your Safeco policy is administered by Safeco\'s claims team. We handle both Safeco and Liberty Mutual claims and know the process for each.'
    },
    {
      question: 'How do I file a Safeco glass claim?',
      answer: 'You don\'t have to file it yourself. Call or text Pink Auto Glass with your Safeco policy number. We contact Safeco\'s claims department, verify your comprehensive coverage and deductible, and handle all the paperwork. You just approve the work and we bill Safeco directly.'
    },
    {
      question: 'Will a Safeco glass claim raise my rates?',
      answer: 'No. Windshield replacement is a no-fault comprehensive claim. Safeco does not increase your premium for filing a comprehensive glass claim in Colorado.'
    },
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Insurance Claims', url: 'https://pinkautoglass.com/services/insurance-claims' },
    { name: 'Safeco', url: 'https://pinkautoglass.com/arizona/insurance/safeco' },
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
                <span className="text-xl">Safeco Insurance (A Liberty Mutual Company)</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Safeco Windshield Replacement Colorado
              </h1>
              <p className="answer-first text-lg text-gray-100 leading-relaxed mb-6 max-w-3xl mx-auto">
                Yes — most Safeco policyholders in Colorado qualify for zero-deductible windshield replacement. Safeco is owned by Liberty Mutual — the same zero-deductible law applies and we bill them directly.
              </p>
              <div className="max-w-md mx-auto mt-6">
                <InsuranceQuoteForm carrier="Safeco" source="safeco-insurance" />
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Services', href: '/services' },
              { label: 'Insurance Claims', href: '/services/insurance-claims' },
              { label: 'Safeco' },
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
              <h2 className="text-2xl font-bold text-blue-900 mb-3">$0 Out of Pocket with Safeco in Colorado</h2>
              <p className="text-blue-800 text-lg">
                Colorado law requires insurers to offer zero-deductible glass coverage. Most Safeco policyholders qualify — glass claims are no-fault and won't affect your rate or renewal.
              </p>
              <div className="mt-4 flex items-center text-blue-900 font-semibold">
                <DollarSign className="w-5 h-5 mr-2" />
                We bill Safeco directly — you don't call them.
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How a Safeco Windshield Claim Works</h2>
              <div className="space-y-4">
                {[
                  { num: 1, title: 'Provide Your Safeco Policy Number', desc: 'Your policy number is on your insurance card or in your Safeco account. That\'s all we need.' },
                  { num: 2, title: 'We Contact Safeco', desc: 'We call Safeco\'s claims team, verify your comprehensive coverage, and confirm your deductible — often $0 under CO law.' },
                  { num: 3, title: 'You Approve Cost', desc: 'We confirm exactly what you\'ll owe before any work starts. Most Colorado Safeco customers pay $0.' },
                  { num: 4, title: 'Same-Day Mobile Service', desc: 'We come to your location. Replacement takes 1–2 hours. We bill Safeco directly.' },
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What Safeco Customers Should Know</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: 'Safeco Is Owned by Liberty Mutual', body: 'Safeco and Liberty Mutual share the same parent company but operate separate claims processes. We handle both. If you\'re not sure which brand your policy is under, we can figure it out from your policy number.' },
                  { title: 'Comprehensive Required', body: 'Windshield coverage requires comprehensive. If you have comprehensive on your Safeco policy, your glass is covered under Colorado law.' },
                  { title: 'No Rate Increase', body: 'Glass claims are no-fault comprehensive. Filing a windshield claim with Safeco does not increase your premium.' },
                  { title: 'You Choose Your Shop', body: 'Colorado law gives you the right to choose any licensed auto glass shop. We work with Safeco\'s direct billing process.' },
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions — Safeco</h2>
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
              <h2 className="text-3xl font-bold mb-4">File Your Safeco Glass Claim Today</h2>
              <p className="text-xl mb-6 text-teal-100">
                We handle all paperwork. Often $0 out of pocket. Direct billing to Safeco.
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
                <InsuranceQuoteForm carrier="Safeco" source="insurance-safeco" />
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
