import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Shield, DollarSign, ChevronRight } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Liberty Mutual Windshield Replacement Colorado — Auto Glass Claim Guide',
  description: 'Liberty Mutual comprehensive coverage pays for windshield replacement in Colorado. $0 deductible available under CO law. We bill Liberty Mutual directly. RightTrack won\'t be affected.',
  alternates: {
    canonical: 'https://pinkautoglass.com/insurance/liberty-mutual',
  },
  openGraph: {
    title: 'Liberty Mutual Windshield Replacement Colorado — $0 Available',
    description: 'Liberty Mutual covers glass under comprehensive. $0 deductible under CO law. Direct billing, RightTrack unaffected.',
    url: 'https://pinkautoglass.com/insurance/liberty-mutual',
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
  { name: 'Safeco', slug: 'safeco' },
];

export default function LibertyMutualPage() {
  const faqs = [
    {
      question: 'Does Liberty Mutual cover windshield replacement?',
      answer: 'Yes. Liberty Mutual comprehensive coverage includes windshield replacement. Under Colorado law (CRS 10-4-613), Liberty Mutual policyholders may qualify for $0 out of pocket on glass claims. We verify your exact coverage and deductible before starting any work.'
    },
    {
      question: 'Does filing a Liberty Mutual glass claim affect my RightTrack discount?',
      answer: 'No. RightTrack is Liberty Mutual\'s usage-based insurance program that monitors driving behavior. Comprehensive glass claims are no-fault incidents and do not affect your RightTrack score, discount, or renewal pricing.'
    },
    {
      question: 'How do I file a Liberty Mutual auto glass claim?',
      answer: 'You don\'t have to file it yourself. Call or text Pink Auto Glass with your Liberty Mutual policy number. We contact Liberty Mutual\'s claims department, verify your comprehensive coverage, and handle all the paperwork. You just approve the work and we bill Liberty Mutual directly.'
    },
    {
      question: 'What is the difference between Liberty Mutual and Safeco?',
      answer: 'Safeco is a subsidiary of Liberty Mutual. Both are covered by the same parent company but operate separate claims systems and brands. We handle both. If you\'re unsure which brand your policy is under, we can sort it out from your policy number. Either way, $0 deductible may apply under Colorado law.'
    },
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Insurance Claims', url: 'https://pinkautoglass.com/services/insurance-claims' },
    { name: 'Liberty Mutual', url: 'https://pinkautoglass.com/insurance/liberty-mutual' },
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
                <span className="text-xl">Liberty Mutual Insurance</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Liberty Mutual Windshield Replacement Colorado
              </h1>
              <p className="answer-first text-lg text-gray-100 leading-relaxed mb-6 max-w-3xl mx-auto">
                Yes, Liberty Mutual comprehensive coverage pays for windshield replacement in Colorado. Liberty Mutual also owns Safeco — if you have either brand, the same Colorado zero-deductible law applies. Under Colorado law (CRS 10-4-613), you may qualify for $0 out of pocket. RightTrack program participants are not affected by glass claims. We bill Liberty Mutual directly — you don't call them. Same-day mobile service available across the Front Range.
              </p>
              <CTAButtons source="insurance-liberty-mutual" />
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
              { label: 'Liberty Mutual' },
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
              <h2 className="text-2xl font-bold text-blue-900 mb-3">$0 Out of Pocket with Liberty Mutual in Colorado</h2>
              <p className="text-blue-800 text-lg">
                Colorado Revised Statute 10-4-613 requires insurers to offer zero-deductible glass coverage. Many Liberty Mutual policyholders in Colorado qualify for $0 out of pocket on windshield replacement. Glass claims are no-fault comprehensive — they do not affect your RightTrack score, rate, or renewal. We verify your exact coverage before any work begins.
              </p>
              <div className="mt-4 flex items-center text-blue-900 font-semibold">
                <DollarSign className="w-5 h-5 mr-2" />
                We bill Liberty Mutual directly — you don't call them.
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How a Liberty Mutual Windshield Claim Works</h2>
              <div className="space-y-4">
                {[
                  { num: 1, title: 'Provide Your Policy Number', desc: 'Share your Liberty Mutual policy number from your insurance card or the Liberty Mutual app. That\'s all we need.' },
                  { num: 2, title: 'We Contact Liberty Mutual', desc: 'We call Liberty Mutual\'s claims line, verify your comprehensive coverage, and confirm your deductible — often $0 under Colorado law.' },
                  { num: 3, title: 'You Approve Cost', desc: 'We tell you exactly what you\'ll owe before any work starts. Most Colorado Liberty Mutual customers pay $0.' },
                  { num: 4, title: 'Same-Day Mobile Service', desc: 'We come to your location. Replacement takes 1–2 hours. We bill Liberty Mutual directly.' },
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What Liberty Mutual Customers Should Know</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: 'Liberty Mutual Owns Safeco', body: 'Safeco is a Liberty Mutual subsidiary. We handle glass claims for both brands. If you have a Safeco policy, see our Safeco page for details.' },
                  { title: 'RightTrack Not Affected', body: 'Liberty Mutual\'s RightTrack usage-based program monitors driving behavior. Comprehensive glass claims are no-fault and have zero impact on your RightTrack score or discount.' },
                  { title: 'No Rate Increase', body: 'Glass claims are no-fault comprehensive. Filing a windshield claim with Liberty Mutual does not increase your premium in Colorado.' },
                  { title: 'You Choose Your Shop', body: 'Colorado law gives you the right to choose any licensed auto glass shop. We work directly with Liberty Mutual\'s claims billing process.' },
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions — Liberty Mutual</h2>
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
              <h2 className="text-3xl font-bold mb-4">File Your Liberty Mutual Glass Claim Today</h2>
              <p className="text-xl mb-6 text-teal-100">
                We handle all paperwork. Often $0 out of pocket. Direct billing to Liberty Mutual.
              </p>
              <CTAButtons source="insurance-liberty-mutual" />
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
