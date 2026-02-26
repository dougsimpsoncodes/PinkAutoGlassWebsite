import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Phone, Shield, FileText, DollarSign, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import InsuranceQuoteForm from '@/components/InsuranceQuoteForm';
import { generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Does Progressive Cover Windshield Replacement in Colorado? Yes — Here\'s How',
  description: 'Progressive comprehensive coverage pays for windshield replacement in Colorado. $0 deductible with glass buyback option. We bill Progressive directly. Same-day service.',
  alternates: {
    canonical: 'https://pinkautoglass.com/insurance/progressive',
  },
  openGraph: {
    title: 'Does Progressive Cover Windshield Replacement in Colorado?',
    description: 'Yes — Progressive comprehensive covers glass. $0 deductible with Glass Buyback option. We bill Progressive directly.',
    url: 'https://pinkautoglass.com/insurance/progressive',
    type: 'website',
  },
};

const OTHER_CARRIERS = [
  { name: 'AAA', slug: 'aaa' },
  { name: 'Allstate', slug: 'allstate' },
  { name: 'Geico', slug: 'geico' },
  { name: 'Esurance', slug: 'esurance' },
  { name: 'State Farm', slug: 'state-farm' },
  { name: 'USAA', slug: 'usaa' },
  { name: 'Farmers', slug: 'farmers' },
  { name: 'Safeco', slug: 'safeco' },
  { name: 'Liberty Mutual', slug: 'liberty-mutual' },
];

export default function ProgressivePage() {
  const faqs = [
    {
      question: 'Does Progressive raise rates after a windshield claim?',
      answer: 'No. Windshield claims filed under comprehensive coverage are no-fault incidents. Progressive does not raise your premium for a comprehensive glass claim. Your driving record and Snapshot score are unaffected.'
    },
    {
      question: 'Does Progressive cover OEM glass?',
      answer: 'Progressive\'s standard coverage uses aftermarket glass unless you have added OEM coverage to your policy. Colorado law gives you the right to request OEM-equivalent quality glass. Ask us about OEM options when you call — we work with Progressive to get the right glass for your vehicle.'
    },
    {
      question: 'What is Progressive\'s Glass Deductible Waiver (Glass Buyback)?',
      answer: 'Progressive offers an optional add-on called the Glass Deductible Waiver or Glass Buyback that reduces your out-of-pocket glass deductible to $0. Even without this add-on, Colorado law (CRS 10-4-613) gives you the right to zero-deductible glass coverage — ask us to verify which applies to your policy.'
    },
    {
      question: 'Can I choose Pink Auto Glass instead of Safelite when using Progressive?',
      answer: 'Yes, absolutely. Progressive may direct you toward Safelite or their Auto Glass Network, but Colorado law gives you the right to choose any licensed auto glass shop. We work directly with Progressive — just give us your policy number and we handle the rest.'
    },
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Insurance Claims', url: 'https://pinkautoglass.com/services/insurance-claims' },
    { name: 'Progressive', url: 'https://pinkautoglass.com/insurance/progressive' },
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
        <section className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 mr-2" />
                <span className="text-xl">Progressive Insurance</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Does Progressive Cover Windshield Replacement in Colorado?
              </h1>
              <p className="answer-first text-lg text-gray-100 leading-relaxed mb-6 max-w-3xl mx-auto">
                Yes — most Progressive drivers in Colorado qualify for zero-deductible windshield replacement. We verify your coverage, file the claim, and bill Progressive directly. Your rates won't go up.
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
              { label: 'Progressive' },
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

            {/* Zero-deductible explainer */}
            <section className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <h2 className="text-2xl font-bold text-blue-900 mb-3">$0 Out of Pocket with Progressive in Colorado</h2>
              <p className="text-blue-800 text-lg">
                Colorado law requires insurers to offer zero-deductible glass coverage. Many Progressive drivers pay $0 — and if you have the Glass Deductible Waiver, it's eliminated outright. We confirm your exact cost before we start.
              </p>
              <div className="mt-4 flex items-center text-blue-900 font-semibold">
                <DollarSign className="w-5 h-5 mr-2" />
                We bill Progressive directly — you don't call them.
              </div>
            </section>

            {/* How it works */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How a Progressive Windshield Claim Works</h2>
              <div className="space-y-4">
                {[
                  { num: 1, title: 'Call or Text Us', desc: 'Give us your Progressive policy number (from your insurance card). That\'s all we need to get started.' },
                  { num: 2, title: 'We Contact Progressive', desc: 'We call Progressive\'s glass claims line, verify your coverage, and confirm your deductible amount — often $0.' },
                  { num: 3, title: 'You Approve Cost', desc: 'We tell you exactly what you\'ll pay before any work begins. Most Colorado drivers pay nothing.' },
                  { num: 4, title: 'Same-Day Service', desc: 'We come to your home, office, or any location. Service completed in 1–2 hours.' },
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

            {/* Key facts */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What Progressive Customers Should Know</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: 'Glass Deductible Waiver', body: 'Progressive\'s optional Glass Buyback add-on reduces your glass deductible to $0. Even without it, Colorado\'s zero-deductible law may apply to your policy.' },
                  { title: 'Esurance Is Now Progressive', body: 'If you have Esurance, it is now owned by Allstate (after being owned by Progressive). The claims process and coverage details are similar to Allstate.' },
                  { title: 'Snapshot Doesn\'t Affect Glass Claims', body: 'If you use Progressive\'s Snapshot usage-based program, filing a glass claim has no effect on your Snapshot discount or overall premium.' },
                  { title: 'You Choose Your Shop', body: 'Progressive uses a third-party network but Colorado law gives you the right to choose any licensed shop. You can always choose Pink Auto Glass — we handle the billing.' },
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

            {/* FAQ */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions — Progressive</h2>
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

            {/* CTA */}
            <section className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">File Your Progressive Glass Claim Today</h2>
              <p className="text-xl mb-6 text-teal-100">
                We handle all paperwork. Often $0 out of pocket. Direct billing to Progressive.
              </p>
              <a href="tel:+17209187465" className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold py-3 px-8 rounded-xl text-lg hover:bg-teal-50 transition-colors">
                <Phone className="w-5 h-5" />
                Call (720) 918-7465
              </a>
            </section>

            {/* Other carriers */}
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
                <InsuranceQuoteForm carrier="Progressive" source="insurance-progressive" />
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
