import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, CheckCircle, FileText, Shield } from 'lucide-react';
import InsuranceQuoteForm from '@/components/InsuranceQuoteForm';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';
import ServiceAreaLinks from '@/components/ServiceAreaLinks';
import RelatedServices from '@/components/RelatedServices';

export const metadata: Metadata = {
  robots: { index: false },
  title: 'Auto Glass Insurance Claims Colorado | $0 Deductible',
  description: 'We handle all insurance paperwork — Progressive, Geico, State Farm, AAA & more. $0 deductible often. Direct billing. (720) 918-7465.',
  keywords: 'auto glass insurance claims colorado, auto glass insurance claims denver, progressive windshield replacement, windshield insurance colorado, zero deductible windshield colorado, insurance glass replacement, aaa windshield claim',
  alternates: {
    canonical: 'https://pinkautoglass.com/colorado/services/insurance-claims',
  },
  openGraph: {
    title: 'Auto Glass Insurance Claims Colorado | $0 Deductible Often',
    description: 'We handle all insurance paperwork. $0 deductible often in Colorado. Direct billing to Progressive, Geico, State Farm, AAA & more.',
    url: 'https://pinkautoglass.com/colorado/services/insurance-claims',
    type: 'website',
  },
};

export default function InsuranceClaimsPage() {
  const faqs = [
    {
      question: 'Does insurance cover windshield replacement in Colorado?',
      answer: 'Yes! In Colorado, most comprehensive auto insurance policies cover windshield replacement for the price of your deductible. We work with all major insurance companies including State Farm, Geico, Progressive, Allstate, USAA, Farmers, Liberty Mutual, and Nationwide. We verify your coverage before starting work so you know exactly what you\'ll pay.'
    },
    {
      question: 'Do I have to use my insurance company\'s recommended shop?',
      answer: 'No! Colorado law gives you the right to choose any auto glass repair shop you prefer. While your insurance may recommend certain shops, you are never required to use them. You have the freedom to choose Pink Auto Glass or any other provider you trust. Insurance companies must honor your choice and cannot deny your claim based solely on your shop selection.'
    },
  ];

  const serviceSchema = generateServiceSchema({
    serviceName: 'Auto Glass Insurance Claims',
    description: 'Hassle-free auto glass insurance claims service across the Front Range. We handle all paperwork and bill your insurance directly.',
    serviceType: 'Insurance Claims Assistance',
    areaServed: ['Denver', 'Aurora', 'Lakewood', 'Boulder', 'Highlands Ranch', 'Thornton', 'Arvada', 'Westminster', 'Parker', 'Centennial', 'Fort Collins', 'Colorado Springs']
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Services', url: 'https://pinkautoglass.com/services' },
    { name: 'Insurance Claims', url: 'https://pinkautoglass.com/colorado/services/insurance-claims' }
  ]);

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Auto Glass Insurance Claims Colorado | $0 Deductible",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".answer-first", "h1"]
    }
  };

  const combinedSchema = combineSchemas(serviceSchema, faqSchema, breadcrumbSchema, webPageSchema);

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
                <FileText className="w-8 h-8 mr-2" />
                <span className="text-xl">Zero-Hassle Claims</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Auto Glass Insurance Claims Made Easy
              </h1>
              <p className="answer-first text-lg text-gray-100 leading-relaxed mb-6 max-w-3xl mx-auto">
                Most Colorado drivers pay $0. Under state law, your insurer must offer zero-deductible glass coverage — we verify it, file your claim, and bill them directly. Your rates won't go up.
              </p>
              <div className="max-w-md mx-auto mt-6">
                <InsuranceQuoteForm source="insurance-claims-hub" />
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Services', href: '/services' },
              { label: 'Insurance Claims', href: '/services/insurance-claims' }
            ]}
          />
        </div>

        {/* Timestamp */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <time dateTime="2026-02-26" className="text-sm text-gray-500">
            Updated February 26, 2026
          </time>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              {/* Carrier Quick Links */}
              <section className="bg-white rounded-xl p-8 border-2 border-teal-200 shadow-sm mt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Select Your Insurance Carrier
                </h2>
                <p className="text-gray-600 mb-6">
                  Choose your insurer below for carrier-specific coverage details, claim tips, and what to expect — including your $0 deductible options under Colorado law.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { name: 'Progressive', slug: 'progressive' },
                    { name: 'AAA', slug: 'aaa' },
                    { name: 'Allstate', slug: 'allstate' },
                    { name: 'Geico', slug: 'geico' },
                    { name: 'Esurance', slug: 'esurance' },
                    { name: 'State Farm', slug: 'state-farm' },
                    { name: 'USAA', slug: 'usaa' },
                    { name: 'Farmers', slug: 'farmers' },
                    { name: 'Safeco', slug: 'safeco' },
                    { name: 'Liberty Mutual', slug: 'liberty-mutual' },
                  ].map((carrier) => (
                    <Link
                      key={carrier.slug}
                      href={`/insurance/${carrier.slug}`}
                      className="flex flex-col items-center justify-center text-center bg-teal-50 hover:bg-teal-100 border border-teal-200 hover:border-teal-400 rounded-lg px-3 py-4 text-gray-900 transition-colors group"
                    >
                      <Shield className="w-5 h-5 text-teal-600 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-sm leading-tight">{carrier.name}</span>
                      <span className="text-teal-600 text-xs mt-1">View Details →</span>
                    </Link>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Insurance Claims Should Be Easy - And They Are
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Give us your policy number — we call your insurer, confirm your zero-deductible coverage, file the claim, and bill them directly. You just approve the work.
                </p>

                <AboveFoldCTA location="service-insurance-claims" />
              </section>


              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  How Our Insurance Claims Process Works
                </h2>
                <div className="space-y-4">
                  {[
                    { num: 1, title: 'Provide Insurance Info', desc: 'Give us your insurance company name and policy number (usually on your insurance card).' },
                    { num: 2, title: 'We Verify Coverage', desc: 'We call your insurer to verify coverage, deductible amount, and any specific requirements.' },
                    { num: 3, title: 'You Approve Cost', desc: 'We tell you exactly what you\'ll pay out-of-pocket (often nothing) before we start any work.' },
                    { num: 4, title: 'We Assist with Filing', desc: 'We assist with filing all required claim documentation to your insurance company on your behalf.' },
                    { num: 5, title: 'We Complete Service', desc: 'We repair or replace your windshield using OEM quality materials and professional installation.' },
                    { num: 6, title: 'We Bill Insurance', desc: 'We bill your insurance company directly. You only pay your deductible (if any).' },
                    { num: 7, title: 'You\'re Done!', desc: 'Your windshield is fixed, your claim is handled, and you can drive away safely.' }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Insurance Companies We Work With
                </h2>
                <p className="text-gray-700 mb-6">We work with all major insurance providers:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    'State Farm', 'Geico', 'Progressive', 'Allstate',
                    'USAA', 'Farmers', 'Liberty Mutual', 'Nationwide',
                    'American Family', 'Travelers', 'AAA', 'Safeco',
                    'The Hartford', 'Mercury', 'Esurance', 'MetLife'
                  ].map(insurer => (
                    <div key={insurer} className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:bg-teal-50 hover:border-teal-300 transition-colors">
                      <span className="text-gray-700 font-medium">{insurer}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 mt-4 text-center">
                  Don't see your insurer? <a href="tel:+17209187465" className="text-teal-600 hover:underline font-semibold">Call us</a> - we work with all carriers!
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Your Rights in Colorado
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">✓ You Can Choose Your Shop</h3>
                    <p className="text-blue-800">
                      Colorado law gives you the right to choose any auto glass repair shop. Insurance companies cannot require you to use a specific shop or deny claims based on your choice.
                    </p>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">✓ Quality Parts Guaranteed</h3>
                    <p className="text-blue-800">
                      You have the right to OEM quality parts. We use only high-quality glass that meets or exceeds factory specifications - never inferior aftermarket glass.
                    </p>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">✓ Warranty Protection</h3>
                    <p className="text-blue-800">
                      Our lifetime warranty on workmanship and leaks is honored regardless of which insurance company you use. Your coverage is with us, not your insurer.
                    </p>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">✓ No Rate Increase for Glass</h3>
                    <p className="text-blue-800">
                      Most insurance companies do not raise your rates for comprehensive glass claims. Glass claims are considered no-fault incidents.
                    </p>
                  </div>
                </div>
              </section>


              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h2>
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

              
              <ServiceAreaLinks />
              <RelatedServices currentSlug="/services/insurance-claims" />

              <section className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to File Your Claim?</h2>
                <p className="text-xl mb-6 text-teal-100">
                  We handle all paperwork. Often no out-of-pocket cost. Direct billing.
                </p>
                <a href="tel:+17209187465" className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold py-3 px-8 rounded-xl text-lg hover:bg-teal-50 transition-colors">
                  <Phone className="w-5 h-5" />
                  Call (720) 918-7465
                </a>
              </section>

              <section className="bg-white rounded-xl p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Insurance Providers We Handle</h2>
                <p className="text-gray-700 mb-6">
                  Choose your insurer below to see claim tips, coverage notes, and what to expect.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { name: 'Progressive', slug: 'progressive' },
                    { name: 'Geico', slug: 'geico' },
                    { name: 'State Farm', slug: 'state-farm' },
                    { name: 'Allstate', slug: 'allstate' },
                    { name: 'USAA', slug: 'usaa' },
                    { name: 'AAA', slug: 'aaa' },
                    { name: 'Farmers', slug: 'farmers' },
                    { name: 'Liberty Mutual', slug: 'liberty-mutual' },
                    { name: 'Safeco', slug: 'safeco' },
                    { name: 'Esurance', slug: 'esurance' },
                  ].map((insurer) => (
                    <Link
                      key={insurer.slug}
                      href={`/insurance/${insurer.slug}`}
                      className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 transition-colors"
                    >
                      <span className="font-medium">{insurer.name}</span>
                      <span className="text-teal-700 font-semibold">Learn More →</span>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8 border border-blue-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Insurance &amp; Coverage Guides</h2>
                <p className="text-gray-700 mb-6">
                  Deeper answers on coverage, costs, and what to do next if you have glass damage.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Windshield Replacement Cost in Colorado',
                      description: 'Insurance coverage, deductible details, and what impacts pricing.',
                      slug: 'windshield-replacement-cost-colorado-insurance-guide',
                    },
                    {
                      title: 'Windshield Repair vs. Replacement',
                      description: 'How to decide which service you need and why timing matters.',
                      slug: 'windshield-repair-vs-replacement-when-to-choose',
                    },
                    {
                      title: 'ADAS Calibration Complete Guide',
                      description: 'Why calibration matters after replacement and what to expect.',
                      slug: 'adas-calibration-complete-guide-windshield-replacement',
                    },
                    {
                      title: 'Prevent Winter Chips from Becoming Cracks',
                      description: 'Colorado cold-weather tips to protect your glass.',
                      slug: 'winter-colorado-prevent-chips-becoming-cracks',
                    },
                  ].map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/blog/${guide.slug}`}
                      className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{guide.title}</h3>
                      <p className="text-sm text-gray-700 mb-3">{guide.description}</p>
                      <div className="text-teal-700 font-semibold text-sm">Read Guide →</div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <InsuranceQuoteForm source="insurance-claims-sidebar" />

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">What You'll Need</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-teal-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Insurance Card</strong> with policy number</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-teal-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>VIN Number</strong> (on dashboard or insurance card)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-teal-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Claim Number</strong> (if already filed)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Link href="/locations/denver-co" className="text-blue-600 hover:underline">Denver</Link>
                    <Link href="/locations/aurora-co" className="text-blue-600 hover:underline">Aurora</Link>
                    <Link href="/locations/lakewood-co" className="text-blue-600 hover:underline">Lakewood</Link>
                    <Link href="/locations/boulder-co" className="text-blue-600 hover:underline">Boulder</Link>
                    <Link href="/locations/fort-collins-co" className="text-blue-600 hover:underline">Fort Collins</Link>
                    <Link href="/locations/colorado-springs-co" className="text-blue-600 hover:underline">Colorado Springs</Link>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Related Services</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/services/windshield-replacement" className="text-teal-600 hover:underline">
                        Windshield Replacement →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/windshield-repair" className="text-teal-600 hover:underline">
                        Windshield Repair →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/mobile-service" className="text-teal-600 hover:underline">
                        Mobile Service →
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
