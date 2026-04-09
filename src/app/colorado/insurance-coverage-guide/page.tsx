import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, CheckCircle, Phone, FileText } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  robots: { index: false },
  title: 'Does Insurance Cover Windshield Replacement?',
  description: 'Yes — most comprehensive policies cover windshield replacement. Colorado law: often $0 deductible. We handle all paperwork. (720) 918-7465.',
  keywords: 'does insurance cover windshield replacement, windshield insurance colorado, zero deductible windshield, insurance windshield claim, comprehensive coverage windshield',
  alternates: {
    canonical: 'https://pinkautoglass.com/does-insurance-cover-windshield-replacement',
  },
  openGraph: {
    title: 'Does Insurance Cover Windshield Replacement?',
    description: 'Yes — most comprehensive policies cover windshield replacement. Colorado law: often $0 deductible.',
    url: 'https://pinkautoglass.com/does-insurance-cover-windshield-replacement',
    type: 'website',
  },
};

export default function InsuranceCoveragePage() {
  const faqs = [
    {
      question: 'Will filing a windshield claim raise my insurance rates?',
      answer: 'No. In Colorado, comprehensive claims (which include windshield replacement) typically do not affect your premium. Windshield claims are considered "no-fault" claims since road debris damage is unavoidable. Your rates should remain the same.'
    },
    {
      question: 'What if I only have liability insurance?',
      answer: 'Liability-only policies do not cover windshield damage — you would pay out of pocket. Windshield coverage requires comprehensive coverage, which is an optional add-on. If you drive on Colorado highways regularly, comprehensive coverage is strongly recommended given the rock chip risk.'
    },
    {
      question: 'Do I have to use my insurance company\'s preferred shop?',
      answer: 'No. Colorado law gives you the right to choose any auto glass provider. Your insurance company may recommend a shop, but you are never required to use them. Pink Auto Glass works directly with all major insurers and handles the billing for you.'
    },
    {
      question: 'How long does the insurance claims process take?',
      answer: 'Most claims are approved within minutes. We call your insurance company, verify your coverage, and get approval before we start work. The entire process — from your first call to us to a new windshield — can happen the same day.'
    },
    {
      question: 'Does insurance cover windshield repair (chip repair) too?',
      answer: 'Yes, and it\'s usually even easier. Most comprehensive policies cover chip repair with $0 deductible in Colorado. Repair is faster (30 minutes) and cheaper for insurers, so approval is almost always immediate.'
    },
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Does Insurance Cover Windshield Replacement?', url: 'https://pinkautoglass.com/does-insurance-cover-windshield-replacement' }
  ]);
  const combinedSchema = combineSchemas(faqSchema, breadcrumbSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <article className="min-h-screen bg-gradient-to-b from-white to-blue-50 page-top-padding">
        {/* Hero */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 mr-2" />
                <span className="text-xl">Insurance Coverage Guide</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Does Insurance Cover Windshield Replacement?
              </h1>
              <p className="text-lg text-blue-100 leading-relaxed mb-6 max-w-3xl mx-auto">
                <strong className="text-white">Yes.</strong> If you have comprehensive auto insurance, your policy almost certainly covers windshield replacement. In Colorado, most drivers pay $0 out of pocket thanks to zero-deductible glass coverage. In Arizona, state law requires $0 deductible for windshield replacement with comprehensive coverage. We handle all the paperwork — you just approve the work.
              </p>
              <CTAButtons source="insurance-guide-hero" />
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Does Insurance Cover Windshield Replacement?' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              {/* Comprehensive vs Liability */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Comprehensive Coverage vs. Liability Only
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Windshield replacement is covered under <strong>comprehensive coverage</strong>, not collision or liability. Comprehensive covers damage from things outside your control — rock chips from highway debris, hail, vandalism, and falling objects.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-900 mb-3 flex items-center">
                      <CheckCircle className="w-6 h-6 mr-2" />
                      Comprehensive Coverage
                    </h3>
                    <ul className="space-y-2 text-gray-800">
                      <li>✓ Covers windshield replacement</li>
                      <li>✓ Covers chip and crack repair</li>
                      <li>✓ Often $0 deductible in CO & AZ</li>
                      <li>✓ Won't raise your rates</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-red-900 mb-3">
                      Liability Only
                    </h3>
                    <ul className="space-y-2 text-gray-800">
                      <li>✗ Does NOT cover windshield damage</li>
                      <li>✗ You pay full cost out of pocket</li>
                      <li>✗ Typical cost: $300-$800+</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* State Laws */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Colorado & Arizona Windshield Laws
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Colorado</h3>
                    <p className="text-gray-700 mb-3">
                      Colorado comprehensive insurance policies typically offer zero-deductible windshield coverage. Most drivers pay <strong>$0 out of pocket</strong> for both repair and replacement.
                    </p>
                    <p className="text-gray-600 text-sm">
                      We verify your specific coverage before starting work so there are no surprises.
                    </p>
                  </div>
                  <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Arizona</h3>
                    <p className="text-gray-700 mb-3">
                      Arizona state law requires insurance companies to waive the deductible for windshield replacement when you have comprehensive coverage. This means <strong>$0 out of pocket</strong> is guaranteed by law.
                    </p>
                    <p className="text-gray-600 text-sm">
                      A.R.S. § 20-1057.01 — your insurer cannot charge a deductible for windshield replacement.
                    </p>
                  </div>
                </div>
              </section>

              <AboveFoldCTA location="insurance-guide-mid" />

              {/* How Claims Work */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  How to File a Windshield Insurance Claim
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  The easiest way: <strong>call us and we handle everything</strong>. Here's what happens:
                </p>
                <div className="space-y-4">
                  {[
                    { num: 1, title: 'Call Pink Auto Glass', desc: 'Tell us your insurance carrier and policy number. That\'s all we need to start.' },
                    { num: 2, title: 'We Verify Coverage', desc: 'We call your insurance company, confirm your deductible (usually $0), and get pre-approval.' },
                    { num: 3, title: 'We Schedule Service', desc: 'Same-day mobile service in most cases. We come to your home or office.' },
                    { num: 4, title: 'We Replace & Bill', desc: 'We do the work and bill your insurance directly. You sign off and drive away.' },
                  ].map((step) => (
                    <div key={step.num} className="flex items-start bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        {step.num}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{step.title}</h3>
                        <p className="text-gray-700">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-gray-600">
                  Want the full details? See our <Link href="/services/insurance-claims" className="text-blue-600 hover:underline font-semibold">insurance claims service page</Link>.
                </p>
              </section>

              {/* Carriers */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Insurance Companies We Work With
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  We work with all major carriers and handle billing directly. Click your carrier for specific coverage details:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { name: 'Progressive', slug: 'progressive' },
                    { name: 'State Farm', slug: 'state-farm' },
                    { name: 'Geico', slug: 'geico' },
                    { name: 'Allstate', slug: 'allstate' },
                    { name: 'USAA', slug: 'usaa' },
                    { name: 'AAA', slug: 'aaa' },
                    { name: 'Farmers', slug: 'farmers' },
                    { name: 'Liberty Mutual', slug: 'liberty-mutual' },
                    { name: 'Safeco', slug: 'safeco' },
                    { name: 'Esurance', slug: 'esurance' },
                  ].map((carrier) => (
                    <Link
                      key={carrier.slug}
                      href={`/insurance/${carrier.slug}`}
                      className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <span className="text-gray-700 font-medium text-sm">{carrier.name}</span>
                    </Link>
                  ))}
                </div>
                <p className="mt-4 text-gray-600 text-sm">
                  Don't see your carrier? We work with all insurance companies — call us at <a href="tel:+17209187465" className="text-blue-600 hover:underline font-semibold">(720) 918-7465</a>.
                </p>
              </section>

              {/* FAQs */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Insurance Coverage FAQs
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                      <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                        {faq.question}
                        <span className="text-blue-600 group-open:rotate-180 transition-transform">&#9660;</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              {/* Related */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Resources</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <Link href="/pricing" className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-1">Pricing Guide</h3>
                    <p className="text-sm text-gray-600">See costs by vehicle type</p>
                  </Link>
                  <Link href="/services/windshield-replacement" className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-1">Windshield Replacement</h3>
                    <p className="text-sm text-gray-600">Our replacement service details</p>
                  </Link>
                  <Link href="/services/windshield-repair" className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-1">Chip & Crack Repair</h3>
                    <p className="text-sm text-gray-600">Fast 30-minute repair service</p>
                  </Link>
                </div>
              </section>

              {/* Bottom CTA */}
              <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">We Handle Your Insurance Claim</h2>
                <p className="text-xl mb-6 text-blue-100">
                  Most Colorado & Arizona drivers pay $0. We verify coverage, file the claim, and bill your insurer directly.
                </p>
                <CTAButtons source="insurance-guide-bottom" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Answer</h3>
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <p className="text-green-900 font-semibold">
                      Yes, insurance covers windshield replacement if you have comprehensive coverage.
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                      Colorado: Often $0 deductible
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                      Arizona: $0 deductible by law
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                      Won't raise your rates
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                      We handle all paperwork
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Areas</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Link href="/locations/denver-co" className="text-blue-600 hover:underline">Denver</Link>
                    <Link href="/locations/aurora-co" className="text-blue-600 hover:underline">Aurora</Link>
                    <Link href="/locations/boulder-co" className="text-blue-600 hover:underline">Boulder</Link>
                    <Link href="/locations/colorado-springs-co" className="text-blue-600 hover:underline">Colorado Springs</Link>
                    <Link href="/locations/fort-collins-co" className="text-blue-600 hover:underline">Fort Collins</Link>
                    <Link href="/locations/phoenix-az" className="text-blue-600 hover:underline">Phoenix</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
