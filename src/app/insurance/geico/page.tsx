import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Phone, Shield, DollarSign, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import InsuranceQuoteForm from '@/components/InsuranceQuoteForm';
import { generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Geico Windshield Replacement Colorado — $0 with Comprehensive Coverage',
  description: 'Geico comprehensive coverage pays for windshield replacement in Colorado. $0 deductible available under CO law. We bill Geico directly. Same-day mobile service.',
  alternates: {
    canonical: 'https://pinkautoglass.com/insurance/geico',
  },
  openGraph: {
    title: 'Geico Windshield Replacement Colorado — $0 Deductible Available',
    description: 'Geico covers windshield replacement under comprehensive. $0 deductible under CO law. Direct billing, no rate increase.',
    url: 'https://pinkautoglass.com/insurance/geico',
    type: 'website',
  },
};

const OTHER_CARRIERS = [
  { name: 'Progressive', slug: 'progressive' },
  { name: 'AAA', slug: 'aaa' },
  { name: 'Allstate', slug: 'allstate' },
  { name: 'Esurance', slug: 'esurance' },
  { name: 'State Farm', slug: 'state-farm' },
  { name: 'USAA', slug: 'usaa' },
  { name: 'Farmers', slug: 'farmers' },
  { name: 'Safeco', slug: 'safeco' },
  { name: 'Liberty Mutual', slug: 'liberty-mutual' },
];

export default function GeicoPage() {
  const faqs = [
    {
      question: 'Does Geico cover windshield replacement?',
      answer: 'Yes. Geico comprehensive coverage includes windshield replacement. Comprehensive is a standard coverage add-on — if you have it, your windshield is covered. Under Colorado law, you may qualify for $0 out of pocket. We verify your coverage before starting any work.'
    },
    {
      question: 'How do I file a Geico glass claim?',
      answer: 'You don\'t have to do it yourself. Call or text Pink Auto Glass with your Geico policy number. We contact Geico\'s Auto Glass Network on your behalf, confirm your coverage and deductible, and handle all the paperwork. You just approve the work and we bill Geico directly.'
    },
    {
      question: 'Can I choose Pink Auto Glass with Geico?',
      answer: 'Yes. Geico uses the Auto Glass Network (operated by Safelite) as a preferred network, but Colorado law gives you the right to choose any licensed auto glass shop. We work directly with Geico\'s claims process. Just give us your policy number and we handle the rest.'
    },
    {
      question: 'Will my Geico rates go up after a windshield claim?',
      answer: 'No. Windshield replacement is filed as a no-fault comprehensive claim. Geico does not increase your premium for comprehensive glass claims. Your driving record and policy pricing are unaffected.'
    },
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Insurance Claims', url: 'https://pinkautoglass.com/services/insurance-claims' },
    { name: 'Geico', url: 'https://pinkautoglass.com/insurance/geico' },
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
                <span className="text-xl">Geico Insurance</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Geico Windshield Replacement Colorado
              </h1>
              <p className="answer-first text-lg text-gray-100 leading-relaxed mb-6 max-w-3xl mx-auto">
                Yes — most Geico drivers in Colorado qualify for zero-deductible windshield replacement. Colorado law lets you choose any shop — not just Safelite — and we bill Geico directly.
              </p>
              <div className="max-w-md mx-auto mt-6">
                <InsuranceQuoteForm carrier="Geico" source="geico-insurance" />
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Services', href: '/services' },
              { label: 'Insurance Claims', href: '/services/insurance-claims' },
              { label: 'Geico' },
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
              <h2 className="text-2xl font-bold text-blue-900 mb-3">$0 Out of Pocket with Geico in Colorado</h2>
              <p className="text-blue-800 text-lg">
                Colorado law requires insurers to offer zero-deductible glass coverage. Most Geico policyholders qualify — glass claims are no-fault and your rates won't go up.
              </p>
              <div className="mt-4 flex items-center text-blue-900 font-semibold">
                <DollarSign className="w-5 h-5 mr-2" />
                We bill Geico directly — you don't call them.
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How a Geico Windshield Claim Works</h2>
              <div className="space-y-4">
                {[
                  { num: 1, title: 'Give Us Your Geico Policy Number', desc: 'Just your policy number from your insurance card or the Geico mobile app. That\'s all we need.' },
                  { num: 2, title: 'We Contact Geico', desc: 'We reach out to Geico\'s Auto Glass Network, verify your comprehensive coverage, and confirm your deductible — often $0.' },
                  { num: 3, title: 'You Approve Cost', desc: 'We tell you exactly what you\'ll owe before any work begins. Most Colorado Geico customers pay nothing.' },
                  { num: 4, title: 'Same-Day Mobile Replacement', desc: 'We come to your home, workplace, or any location. Replacement takes 1–2 hours. We handle all billing with Geico.' },
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What Geico Customers Should Know</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: 'Comprehensive Required', body: 'Windshield replacement is covered under comprehensive — not liability. If you dropped comprehensive to save money, you may not have glass coverage. We can help you check.' },
                  { title: 'No Rate Increase for Glass', body: 'Geico treats windshield claims as no-fault comprehensive. Your premium will not increase for filing a glass claim in Colorado.' },
                  { title: 'Auto Glass Network Is Preferred, Not Required', body: 'Geico routes customers to the Auto Glass Network (run by Safelite) but Colorado law gives you the right to choose any licensed shop.' },
                  { title: 'You Choose Your Shop', body: 'Colorado law protects your right to choose Pink Auto Glass. We handle all direct billing with Geico — you just approve the work.' },
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions — Geico</h2>
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
              <h2 className="text-3xl font-bold mb-4">File Your Geico Glass Claim Today</h2>
              <p className="text-xl mb-6 text-teal-100">
                We handle all paperwork. Often $0 out of pocket. Direct billing to Geico.
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
                <InsuranceQuoteForm carrier="Geico" source="insurance-geico" />
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
