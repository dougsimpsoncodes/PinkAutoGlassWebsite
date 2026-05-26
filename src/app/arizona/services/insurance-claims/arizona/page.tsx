import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, FileText, Shield, Phone } from 'lucide-react';
import InsuranceQuoteForm from '@/components/InsuranceQuoteForm';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import ServiceAreaLinks from '@/components/ServiceAreaLinks';
import { generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Arizona Windshield Insurance Claims | Coverage Check & Mobile Service',
  description:
    'We verify Arizona windshield coverage, help with the claim, and schedule mobile replacement across Phoenix metro. Call (480) 712-7465.',
  keywords:
    'arizona windshield insurance claims, phoenix windshield insurance, zero deductible windshield arizona, arizona auto glass claim, mobile windshield replacement phoenix',
  alternates: {
    canonical: 'https://pinkautoglass.com/arizona/services/insurance-claims/arizona',
  },
  openGraph: {
    title: 'Arizona Windshield Insurance Claims | Coverage Check & Mobile Service',
    description:
      'Coverage verification, claim help, and mobile windshield replacement across Phoenix metro.',
    url: 'https://pinkautoglass.com/arizona/services/insurance-claims/arizona',
    type: 'website',
  },
};

const faqs = [
  {
    question: 'Does Arizona law really allow $0 windshield replacement?',
    answer:
      'Arizona insurers must offer glass coverage options with comprehensive policies. If your policy includes the right glass coverage, your windshield replacement may be $0 out of pocket. We verify that before scheduling.',
  },
  {
    question: 'Will filing a glass claim raise my rates in Arizona?',
    answer:
      'Arizona glass claims are generally treated as no-fault comprehensive claims. The page language here follows the Arizona protections already used elsewhere in this site: your insurer cannot raise your rate solely because you used this glass benefit.',
  },
  {
    question: 'Do I have to use the shop my insurance company recommends?',
    answer:
      'No. Arizona gives you the right to choose your auto glass shop. If your insurer recommends a preferred vendor, you can still choose Pink Auto Glass.',
  },
  {
    question: 'What if I do not have full glass coverage?',
    answer:
      'We can still help. We will tell you whether the job falls under your deductible or whether cash pricing makes more sense for your vehicle.',
  },
  {
    question: 'Do you only help with paperwork, or do you do the replacement too?',
    answer:
      'We do both. We verify coverage, help with the claim, and schedule the mobile windshield replacement service itself.',
  },
];

export default function ArizonaInsuranceClaimsPage() {
  const serviceSchema = generateServiceSchema({
    serviceName: 'Arizona Windshield Insurance Claims Help',
    description:
      'Coverage verification, insurer coordination, and mobile windshield replacement support for Phoenix metro drivers.',
    serviceType: 'Insurance Claims Assistance',
    areaServed: ['Phoenix', 'Scottsdale', 'Mesa', 'Tempe'],
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Arizona', url: 'https://pinkautoglass.com/arizona' },
    { name: 'Services', url: 'https://pinkautoglass.com/arizona/services' },
    { name: 'Insurance Claims', url: 'https://pinkautoglass.com/arizona/services/insurance-claims' },
    {
      name: 'Arizona',
      url: 'https://pinkautoglass.com/arizona/services/insurance-claims/arizona',
    },
  ]);

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Arizona Windshield Insurance Claims | Coverage Check & Mobile Service',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.answer-first', 'h1'],
    },
  };

  const combinedSchema = combineSchemas(serviceSchema, faqSchema, breadcrumbSchema, webPageSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <article className="min-h-screen bg-gradient-to-b from-white to-orange-50 page-top-padding">
        <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 mr-2" />
                <span className="text-xl">Arizona coverage check + claim help</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Arizona Windshield Insurance Claims, Without the Runaround
              </h1>
              <p className="answer-first text-lg text-orange-100 leading-relaxed mb-6 max-w-3xl mx-auto">
                We verify your coverage, explain what you will actually pay, help with the claim, and schedule mobile windshield replacement across Phoenix metro.
              </p>
              <div className="max-w-md mx-auto mt-6">
                <InsuranceQuoteForm source="az-insurance-hub" market="arizona" />
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Arizona', href: '/arizona' },
              { label: 'Services', href: '/arizona/services' },
              { label: 'Insurance Claims', href: '/arizona/services/insurance-claims' },
              { label: 'Arizona', href: '/arizona/services/insurance-claims/arizona' },
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <time dateTime="2026-04-28" className="text-sm text-gray-500">
            Updated April 28, 2026
          </time>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Arizona Drivers Need to Know</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      statute: 'ARS § 20-264',
                      title: 'Glass coverage matters',
                      body: 'Arizona policies can include glass coverage that brings your windshield replacement cost down to $0. We check whether your policy has it before we schedule.',
                      color: 'green',
                    },
                    {
                      statute: 'ARS § 20-263',
                      title: 'Rate protection',
                      body: 'The Arizona protections already used elsewhere on this site treat glass claims as no-fault claim activity. The point for you: using your glass benefit should not be treated like an at-fault loss.',
                      color: 'blue',
                    },
                    {
                      statute: 'ARS § 20-469',
                      title: 'You choose the shop',
                      body: 'Your insurer can recommend a preferred vendor, but you still have the right to choose the shop that does the work.',
                      color: 'purple',
                    },
                  ].map((item) => {
                    const colorMap = {
                      green: 'bg-green-50 border-green-200 text-green-700',
                      blue: 'bg-blue-50 border-blue-200 text-blue-700',
                      purple: 'bg-purple-50 border-purple-200 text-purple-700',
                    } as const;

                    return (
                      <div key={item.statute} className={`border rounded-xl p-5 ${colorMap[item.color as keyof typeof colorMap]}`}>
                        <div className="text-xs font-semibold uppercase tracking-wide mb-2">{item.statute}</div>
                        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-700">{item.body}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Actually Do</h2>
                <p className="text-lg text-gray-700 mb-6">
                  This page is about getting your windshield replacement claim handled cleanly. We are not just sending you to a form. We verify the policy, explain the cost, coordinate with the insurer, and complete the mobile replacement service.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Verify your Arizona coverage before the job starts',
                    'Explain whether the job is $0, deductible-based, or cash-pay',
                    'Help you handle the claim paperwork and insurer coordination',
                    'Schedule mobile replacement at your home or office',
                  ].map((item) => (
                    <div key={item} className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <AboveFoldCTA location="az-insurance-claims-mid" />
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How the Claim Process Works</h2>
                <div className="space-y-4">
                  {[
                    {
                      num: 1,
                      title: 'You send us your vehicle and insurance info',
                      desc: 'Call, text, or submit the form with your basic policy details.',
                    },
                    {
                      num: 2,
                      title: 'We verify coverage',
                      desc: 'We check whether you have qualifying Arizona glass coverage and tell you the expected out-of-pocket amount.',
                    },
                    {
                      num: 3,
                      title: 'We schedule the replacement',
                      desc: 'If you want to move forward, we book mobile service in Phoenix, Scottsdale, Mesa, Tempe, or the broader metro.',
                    },
                    {
                      num: 4,
                      title: 'We coordinate with the insurer',
                      desc: 'We help with the claim paperwork and billing so you are not chasing the process yourself.',
                    },
                  ].map((step) => (
                    <div key={step.num} className="flex items-start bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Full Replacement Service Too?</h2>
                <p className="text-lg text-gray-700 mb-4">
                  If you already know you want the replacement first and insurance help second, use the replacement page here:
                </p>
                <Link
                  href="/arizona/services/windshield-replacement"
                  className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
                >
                  Arizona windshield replacement →
                </Link>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Phoenix Metro Coverage</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Paid launch is centered on Phoenix, Scottsdale, Mesa, and Tempe, but our Arizona service area is broader across the metro.
                </p>
                <ServiceAreaLinks heading="Arizona Cities We Serve" market="arizona" />
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Arizona Insurance FAQs</h2>
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.question} className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-orange-600 text-white rounded-2xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Check Your Coverage?</h2>
                <p className="text-lg text-orange-100 mb-6 max-w-2xl mx-auto">
                  Send us your policy details and vehicle info. We will tell you what the next step looks like before you commit.
                </p>
                <div className="max-w-md mx-auto">
                  <InsuranceQuoteForm source="az-insurance-bottom" market="arizona" />
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Arizona claim checklist</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                    <span>Insurance company name</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                    <span>Policy number</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                    <span>Vehicle year, make, and model</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                    <span>Best Phoenix-area service address</span>
                  </li>
                </ul>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Useful Arizona links</h4>
                  <div className="space-y-2 text-sm">
                    <Link href="/arizona/services/windshield-replacement" className="block text-orange-600 hover:underline">
                      Windshield replacement
                    </Link>
                    <Link href="/phoenix" className="block text-orange-600 hover:underline">
                      Phoenix market page
                    </Link>
                    <a href="tel:+14807127465" className="inline-flex items-center gap-2 text-orange-600 hover:underline">
                      <Phone className="w-4 h-4" />
                      Call (480) 712-7465
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
