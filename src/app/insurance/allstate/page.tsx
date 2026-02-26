import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Shield, DollarSign, ChevronRight } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Allstate Windshield Replacement Colorado — Auto Glass Claims Guide',
  description: 'Allstate comprehensive coverage pays for windshield replacement in Colorado. $0 deductible available. We bill Allstate directly. Glass claims won\'t affect your Safe Driving Bonus.',
  alternates: {
    canonical: 'https://pinkautoglass.com/insurance/allstate',
  },
  openGraph: {
    title: 'Allstate Windshield Replacement Colorado — $0 Deductible Available',
    description: 'Allstate covers glass under comprehensive. $0 deductible under CO law. Direct billing, no effect on Safe Driving Bonus.',
    url: 'https://pinkautoglass.com/insurance/allstate',
    type: 'website',
  },
};

const OTHER_CARRIERS = [
  { name: 'Progressive', slug: 'progressive' },
  { name: 'AAA', slug: 'aaa' },
  { name: 'Geico', slug: 'geico' },
  { name: 'Esurance', slug: 'esurance' },
  { name: 'State Farm', slug: 'state-farm' },
  { name: 'USAA', slug: 'usaa' },
  { name: 'Farmers', slug: 'farmers' },
  { name: 'Safeco', slug: 'safeco' },
  { name: 'Liberty Mutual', slug: 'liberty-mutual' },
];

export default function AllstatePage() {
  const faqs = [
    {
      question: 'Does filing an Allstate glass claim affect my Safe Driving Bonus?',
      answer: 'No. Allstate\'s Safe Driving Bonus and Claim Satisfaction Guarantee are not affected by comprehensive glass claims. Glass claims are classified as no-fault comprehensive incidents — they do not count against your driving record or discount eligibility.'
    },
    {
      question: 'What is Allstate\'s glass deductible in Colorado?',
      answer: 'Your glass deductible with Allstate depends on your policy. Under Colorado law (CRS 10-4-613), you may qualify for $0 out-of-pocket coverage on windshield replacement. We verify your specific deductible before starting any work so there are no surprises.'
    },
    {
      question: 'How do I file an Allstate auto glass claim?',
      answer: 'You don\'t have to file it yourself. Call or text Pink Auto Glass with your Allstate policy number and we contact Allstate on your behalf. We verify coverage, file the Glass Only claim, and bill Allstate directly. You approve the work and we handle everything else.'
    },
    {
      question: 'Can I use Pink Auto Glass instead of Allstate\'s preferred shop?',
      answer: 'Yes. Allstate works with Safelite as a preferred vendor, but Colorado law gives you the right to choose any licensed shop. Allstate cannot deny your claim based solely on your choice of shop. We handle all direct billing with Allstate.'
    },
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Insurance Claims', url: 'https://pinkautoglass.com/services/insurance-claims' },
    { name: 'Allstate', url: 'https://pinkautoglass.com/insurance/allstate' },
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
                <span className="text-xl">Allstate Insurance</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Allstate Windshield Replacement Colorado
              </h1>
              <p className="answer-first text-lg text-gray-100 leading-relaxed mb-6 max-w-3xl mx-auto">
                Yes, Allstate comprehensive coverage pays for windshield replacement in Colorado. Allstate processes Glass Only claims separately from collision claims — meaning your Safe Driving Bonus is not affected. Under Colorado law (CRS 10-4-613), you may qualify for $0 out of pocket. We bill Allstate directly so you never have to call them. Same-day mobile service available across the Denver Front Range.
              </p>
              <CTAButtons source="insurance-allstate" />
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
              { label: 'Allstate' },
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <time dateTime="2026-02-26" className="text-sm text-gray-500">
            Updated February 26, 2026
          </time>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mt-6">
          <div className="space-y-12">

            <section className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <h2 className="text-2xl font-bold text-blue-900 mb-3">$0 Out of Pocket with Allstate in Colorado</h2>
              <p className="text-blue-800 text-lg">
                Colorado Revised Statute 10-4-613 requires insurers to offer zero-deductible glass coverage. Many Allstate policyholders qualify for $0 out of pocket on windshield replacement. Allstate's Glass Only claim type is processed separately from collision — it does not count as an at-fault incident or affect your bonus. We verify your coverage before any work begins.
              </p>
              <div className="mt-4 flex items-center text-blue-900 font-semibold">
                <DollarSign className="w-5 h-5 mr-2" />
                We bill Allstate directly — you don't call them.
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How an Allstate Windshield Claim Works</h2>
              <div className="space-y-4">
                {[
                  { num: 1, title: 'Provide Your Policy Number', desc: 'Share your Allstate policy number (from your insurance card or Allstate app). That\'s all we need.' },
                  { num: 2, title: 'We Contact Allstate', desc: 'We call Allstate\'s glass claims line, open a Glass Only claim, and confirm your deductible — often $0 under CO law.' },
                  { num: 3, title: 'You Approve Cost', desc: 'We confirm what you\'ll owe before we start. Most Colorado Allstate customers pay $0.' },
                  { num: 4, title: 'Same-Day Mobile Service', desc: 'We come to your location. Replacement takes about 1–2 hours. We bill Allstate directly when done.' },
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What Allstate Customers Should Know</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: 'Glass Only Claim Type', body: 'Allstate processes glass as a separate "Glass Only" claim. This is distinct from collision — it does not affect your rate, bonus, or renewal.' },
                  { title: 'Safe Driving Bonus Protected', body: 'Your Allstate Safe Driving Bonus and Claim Satisfaction Guarantee are not impacted by comprehensive glass claims. No-fault claims do not count against your discount.' },
                  { title: 'Safelite Is Preferred, Not Required', body: 'Allstate uses Safelite as a preferred vendor but Colorado law gives you the right to choose any licensed shop. You can always choose Pink Auto Glass.' },
                  { title: 'Esurance Is Now Allstate', body: 'Esurance was acquired by Allstate. If you have Esurance, your glass claim process is now handled through Allstate\'s claims system.' },
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions — Allstate</h2>
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
              <h2 className="text-3xl font-bold mb-4">File Your Allstate Glass Claim Today</h2>
              <p className="text-xl mb-6 text-teal-100">
                We handle all paperwork. Often $0 out of pocket. Direct billing to Allstate.
              </p>
              <CTAButtons source="insurance-allstate" />
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
        </div>
      </article>
    </>
  );
}
