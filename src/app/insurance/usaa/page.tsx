import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Phone, Shield, DollarSign, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import InsuranceQuoteForm from '@/components/InsuranceQuoteForm';
import { generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'USAA Windshield Replacement CO | $0 Deductible',
  description: 'USAA covers windshield replacement in Colorado — often $0 deductible. We handle all paperwork and bill USAA directly. Call (720) 918-7465.',
  alternates: {
    canonical: 'https://pinkautoglass.com/insurance/usaa',
  },
  openGraph: {
    title: 'USAA Windshield Replacement CO | $0 Deductible',
    description: 'USAA covers windshield replacement in Colorado — often $0 deductible. We handle all paperwork and bill USAA directly. Call (720) 918-7465.',
    url: 'https://pinkautoglass.com/insurance/usaa',
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
  { name: 'Farmers', slug: 'farmers' },
  { name: 'Safeco', slug: 'safeco' },
  { name: 'Liberty Mutual', slug: 'liberty-mutual' },
];

export default function USAAPage() {
  const faqs = [
    {
      question: 'Does USAA cover windshield replacement in Colorado?',
      answer: 'Yes. USAA comprehensive coverage includes windshield replacement. USAA is known for excellent claims processing and customer service. Under Colorado law, USAA members in Colorado may qualify for $0 out of pocket on windshield replacement. We verify your exact coverage before starting any work.'
    },
    {
      question: 'Will my USAA rates go up after a windshield claim?',
      answer: 'No. USAA treats windshield replacement as a no-fault comprehensive claim. This type of claim does not affect your rate, your USAA member discount, or your renewal pricing.'
    },
    {
      question: 'Can I use Pink Auto Glass with USAA insurance?',
      answer: 'Yes. USAA recommends certain preferred shops but Colorado law gives you the right to choose any licensed auto glass shop. We work directly with USAA\'s claims process and handle all billing. Military members don\'t need to navigate the claims process themselves — we handle it all.'
    },
    {
      question: 'I\'m stationed at Fort Carson / Peterson SFB / Buckley SFB. Do you come to me?',
      answer: 'Yes. We provide mobile windshield service throughout Colorado including Colorado Springs (Fort Carson, Peterson SFB) and the Aurora / Denver area (Buckley SFB, Lowry). We come to your location on base or off base. Call or text us to schedule.'
    },
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Insurance Claims', url: 'https://pinkautoglass.com/services/insurance-claims' },
    { name: 'USAA', url: 'https://pinkautoglass.com/insurance/usaa' },
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
                <span className="text-xl">USAA Insurance — Military Members &amp; Families</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                USAA Windshield Replacement Colorado
              </h1>
              <p className="answer-first text-lg text-gray-100 leading-relaxed mb-6 max-w-3xl mx-auto">
                Yes — most USAA members in Colorado qualify for zero-deductible windshield replacement. We provide mobile service on or off base and bill USAA directly — no calls needed.
              </p>
              <div className="max-w-md mx-auto mt-6">
                <InsuranceQuoteForm carrier="USAA" source="usaa-insurance" />
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Services', href: '/services' },
              { label: 'Insurance Claims', href: '/services/insurance-claims' },
              { label: 'USAA' },
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
              <h2 className="text-2xl font-bold text-blue-900 mb-3">$0 Out of Pocket with USAA in Colorado</h2>
              <p className="text-blue-800 text-lg">
                Colorado law requires insurers to offer zero-deductible glass coverage. USAA members are entitled to this protection — and USAA is known for fast, hassle-free claims.
              </p>
              <div className="mt-4 flex items-center text-blue-900 font-semibold">
                <DollarSign className="w-5 h-5 mr-2" />
                We bill USAA directly — you don't call them.
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How a USAA Windshield Claim Works</h2>
              <div className="space-y-4">
                {[
                  { num: 1, title: 'Provide Your USAA Policy Number', desc: 'Share your USAA policy number from your insurance card or the USAA mobile app. That\'s all we need.' },
                  { num: 2, title: 'We Contact USAA', desc: 'We call USAA\'s claims line, verify your comprehensive coverage, and confirm your deductible — often $0 under Colorado law.' },
                  { num: 3, title: 'You Approve Cost', desc: 'We tell you exactly what you\'ll owe before any work begins. Most Colorado USAA members pay nothing.' },
                  { num: 4, title: 'Mobile Service at Your Location', desc: 'We come to your home, office, or on-base location. Replacement takes 1–2 hours. We bill USAA directly.' },
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What USAA Members Should Know</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: 'Serving Colorado Military', body: 'We serve military members and families at Fort Carson, Peterson SFB, Buckley SFB, Schriever SFB, and throughout Colorado. Mobile service available on and off base.' },
                  { title: 'USAA\'s Excellent Claims Process', body: 'USAA is consistently rated #1 for claims satisfaction. Their glass claims process is efficient — we typically have approval within the hour.' },
                  { title: 'No Rate Increase', body: 'Comprehensive glass claims are no-fault. Filing a windshield claim does not affect your USAA premium, member discount, or renewal.' },
                  { title: 'You Choose Your Shop', body: 'Colorado law protects your right to choose any licensed shop. We work directly with USAA\'s claims process and handle all billing.' },
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions — USAA</h2>
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
              <h2 className="text-3xl font-bold mb-4">File Your USAA Glass Claim Today</h2>
              <p className="text-xl mb-6 text-teal-100">
                We handle all paperwork. Often $0 out of pocket. Direct billing to USAA.
              </p>
              <a href="tel:+17209187465" className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold py-3 px-8 rounded-xl text-lg hover:bg-teal-50 transition-colors">
                <Phone className="w-5 h-5" />
                Call (720) 918-7465
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
                <InsuranceQuoteForm carrier="USAA" source="insurance-usaa" />
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
