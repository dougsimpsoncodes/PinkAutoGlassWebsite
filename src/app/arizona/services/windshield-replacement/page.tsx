import { Metadata } from 'next';
import Link from 'next/link';
import { Car, CheckCircle, Clock, MapPin, Shield, Star } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import ServiceAreaLinks from '@/components/ServiceAreaLinks';
import { generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';
import QuoterEmbed from '@/components/QuoterEmbed';

export const metadata: Metadata = {
  robots: { index: false },
  title: 'Phoenix Windshield Replacement | Same-Day Mobile Service',
  description:
    'Mobile windshield replacement across Phoenix, Scottsdale, Mesa, and Tempe. OEM-quality glass, lifetime workmanship warranty, and insurance help. Call (480) 712-7465.',
  keywords:
    'phoenix windshield replacement, mobile windshield replacement phoenix, windshield replacement scottsdale, windshield replacement mesa, windshield replacement tempe, auto glass replacement phoenix',
  alternates: {
    canonical: 'https://pinkautoglass.com/arizona/services/windshield-replacement',
  },
  openGraph: {
    title: 'Phoenix Windshield Replacement | Same-Day Mobile Service',
    description:
      'Same-day mobile windshield replacement in Phoenix metro. OEM-quality glass, lifetime warranty, and insurance help.',
    url: 'https://pinkautoglass.com/arizona/services/windshield-replacement',
    type: 'website',
  },
};

const faqs = [
  {
    question: 'How much does windshield replacement cost in Phoenix?',
    answer:
      'Cash pricing usually depends on your vehicle, glass features, and calibration needs. If you have comprehensive coverage with full glass coverage, many Arizona drivers pay $0 out of pocket. We verify coverage before the job starts.',
  },
  {
    question: 'How long does windshield replacement take?',
    answer:
      'Most replacements take about 60 to 90 minutes, plus safe drive-away time for the adhesive to cure. If your vehicle needs camera or sensor calibration, that can add time.',
  },
  {
    question: 'Do you offer mobile windshield replacement?',
    answer:
      'Yes. Mobile service is the default. We come to your home, office, or job site across Phoenix metro, including Phoenix, Scottsdale, Mesa, and Tempe.',
  },
  {
    question: 'Do you use OEM or aftermarket glass?',
    answer:
      'We install OEM-quality glass that meets or exceeds factory standards for fit, clarity, and safety. We will explain the best glass option for your specific vehicle before we schedule the work.',
  },
  {
    question: 'Will insurance cover my windshield replacement in Arizona?',
    answer:
      'If you carry comprehensive coverage and the right glass coverage on your policy, your replacement may be fully covered. We help verify coverage and handle the claim process with your insurer.',
  },
  {
    question: 'When should I replace instead of repair?',
    answer:
      'Replacement is usually the safer choice when the crack is long, reaches the edge, sits in the driver’s line of sight, or when there are multiple impact points. We can confirm that before scheduling.',
  },
];

export default function WindshieldReplacementPage() {
  const serviceSchema = generateServiceSchema({
    serviceName: 'Phoenix Windshield Replacement',
    description:
      'Mobile windshield replacement service for Phoenix metro. OEM-quality glass, same-day scheduling, insurance help, and lifetime workmanship warranty.',
    serviceType: 'Auto Glass Replacement',
    areaServed: ['Phoenix', 'Scottsdale', 'Mesa', 'Tempe'],
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Arizona', url: 'https://pinkautoglass.com/arizona' },
    { name: 'Services', url: 'https://pinkautoglass.com/arizona/services' },
    {
      name: 'Windshield Replacement',
      url: 'https://pinkautoglass.com/arizona/services/windshield-replacement',
    },
  ]);

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Phoenix Windshield Replacement | Same-Day Mobile Service',
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

      <article className="min-h-screen bg-gradient-to-b from-white to-pink-50 page-top-padding">
        <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold mb-5">
                <MapPin className="w-4 h-4" />
                Phoenix • Scottsdale • Mesa • Tempe
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Mobile Windshield Replacement in Phoenix Metro
              </h1>
              <p className="answer-first text-lg text-pink-50 leading-relaxed mb-6 max-w-3xl mx-auto">
                Same-day windshield replacement with OEM-quality glass, mobile installation, and lifetime workmanship coverage. If your policy includes Arizona glass coverage, we can help verify it and handle the claim.
              </p>
              <CTAButtons source="az-windshield-replacement" />
            </div>
          </div>
        </section>

        <QuoterEmbed />

        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Arizona', href: '/arizona' },
              { label: 'Services', href: '/arizona/services' },
              { label: 'Windshield Replacement', href: '/arizona/services/windshield-replacement' },
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Phoenix Drivers Replace Fast
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  In Phoenix, small chips do not stay small for long. Heat swings, highway debris, and daily driving on I-10, Loop 101, Loop 202, and US-60 can turn a manageable hit into a full crack fast.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  Our replacement service is built for that reality: mobile scheduling, OEM-quality glass, clean installation, and clear next steps if insurance is involved.
                </p>
                <AboveFoldCTA location="az-windshield-replacement-mid" />
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  What You Get With Pink Auto Glass
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: Clock,
                      title: 'Same-Day Mobile Service',
                      body: 'We come to your home, office, or job site across Phoenix metro when scheduling allows.',
                    },
                    {
                      icon: Shield,
                      title: 'Insurance Help',
                      body: 'We verify coverage, explain your out-of-pocket cost, and help with the claim process.',
                    },
                    {
                      icon: Star,
                      title: 'OEM-Quality Glass',
                      body: 'We use high-quality glass and installation materials that meet safety and fit standards.',
                    },
                    {
                      icon: CheckCircle,
                      title: 'Lifetime Workmanship Warranty',
                      body: 'Your installation is backed against leaks and workmanship issues for as long as you own the vehicle.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-5">
                      <item.icon className="w-6 h-6 text-pink-600 mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-700">{item.body}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  How Our Windshield Replacement Works
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      num: 1,
                      title: 'We confirm your vehicle details',
                      desc: 'We verify the correct glass, features, and scheduling window before we dispatch.',
                    },
                    {
                      num: 2,
                      title: 'We replace the damaged windshield',
                      desc: 'Our technician removes the broken glass, preps the frame, and installs the new windshield correctly.',
                    },
                    {
                      num: 3,
                      title: 'We review drive-away timing',
                      desc: 'You get clear instructions on cure time and what to avoid right after installation.',
                    },
                    {
                      num: 4,
                      title: 'We handle the insurance side if needed',
                      desc: 'If your coverage applies, we help document and process the claim with your insurer.',
                    },
                  ].map((step) => (
                    <div key={step.num} className="flex items-start bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Common Reasons Replacement Is the Right Call
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Cracks longer than a few inches',
                    'Damage at the edge of the windshield',
                    'Multiple chips or impact points',
                    'Damage in the driver’s line of sight',
                  ].map((reason) => (
                    <div key={reason} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <Car className="w-5 h-5 text-red-700 mt-0.5" />
                        <p className="text-red-900 font-medium">{reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Insurance Support for Arizona Drivers
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  We do not make you guess what your policy covers. If you want to use insurance, we check your coverage first, explain the likely out-of-pocket number, and walk you through the next step.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  Need the insurance-focused version first? Go here:
                </p>
                <Link
                  href="/arizona/services/insurance-claims/arizona"
                  className="inline-flex items-center text-pink-600 hover:text-pink-700 font-semibold"
                >
                  Arizona insurance claims help →
                </Link>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Windshield Replacement FAQs</h2>
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.question} className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Phoenix Metro Service Area
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Paid launch is focused on Phoenix, Scottsdale, Mesa, and Tempe, but our Arizona mobile coverage is broader across the metro.
                </p>
                <ServiceAreaLinks heading="Arizona Cities We Serve" market="arizona" />
              </section>

              <section className="bg-pink-600 text-white rounded-2xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Replace Your Windshield?</h2>
                <p className="text-lg text-pink-50 mb-6 max-w-2xl mx-auto">
                  Call, text, or book online. We will confirm the glass, check the schedule, and tell you the next step fast.
                </p>
                <CTAButtons source="az-windshield-replacement-bottom" />
              </section>
            </div>

            <aside className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Why customers call us first</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-pink-600 mt-0.5" />
                    <span>Fast mobile scheduling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-pink-600 mt-0.5" />
                    <span>Clear pricing before the job starts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-pink-600 mt-0.5" />
                    <span>Insurance verification help</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-pink-600 mt-0.5" />
                    <span>Lifetime workmanship warranty</span>
                  </li>
                </ul>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Helpful Arizona links</h4>
                  <div className="space-y-2 text-sm">
                    <Link href="/phoenix" className="block text-pink-600 hover:underline">
                      Phoenix windshield replacement
                    </Link>
                    <Link
                      href="/arizona/services/insurance-claims/arizona"
                      className="block text-pink-600 hover:underline"
                    >
                      Arizona insurance claims help
                    </Link>
                    <Link href="/arizona" className="block text-pink-600 hover:underline">
                      Arizona service overview
                    </Link>
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
