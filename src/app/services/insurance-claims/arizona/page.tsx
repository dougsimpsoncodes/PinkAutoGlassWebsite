import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MessageSquare, Calendar, CheckCircle, FileText, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Arizona Windshield Insurance Claims | $0 Deductible | ARS 20-264 | Pink Auto Glass',
  description: 'Arizona law (ARS 20-264) means your windshield replacement costs $0. ARS 20-263 protects your rates. ARS 20-469 means you choose your shop — not Safelite. We handle all paperwork. Call (480) 712-7465!',
  keywords: 'arizona windshield insurance claims, ARS 20-264 zero deductible arizona, arizona glass coverage law, $0 windshield arizona, ARS 20-263 no rate increase, ARS 20-469 choose your shop, phoenix windshield insurance',
  alternates: {
    canonical: 'https://pinkautoglass.com/services/insurance-claims/arizona',
  },
  openGraph: {
    title: 'Arizona Windshield Insurance Claims | $0 Deductible | ARS 20-264',
    description: 'Arizona law requires $0 deductible glass coverage. Your rates can\'t go up. You choose your shop. We handle all paperwork for Phoenix metro drivers.',
    url: 'https://pinkautoglass.com/services/insurance-claims/arizona',
    type: 'website',
  },
};

export default function ArizonaInsuranceClaimsPage() {
  const faqs = [
    {
      question: 'Does Arizona law really require $0 deductible windshield replacement?',
      answer: 'Yes. Under ARS 20-264, Arizona law requires every insurance company that offers comprehensive auto policies to also offer a zero-deductible glass endorsement as an optional add-on. If you elected this endorsement (which typically adds only $5–$15/month to your premium), your windshield replacement costs you nothing out of pocket. Many Arizona drivers who have this coverage don\'t realize it — we verify your coverage for free before starting any work.'
    },
    {
      question: 'Will filing a glass claim raise my insurance rates in Arizona?',
      answer: 'No. ARS 20-263 is Arizona\'s no-fault rate protection law for glass claims. It legally prohibits your insurance company from raising your rates solely because you filed an auto glass claim. Glass claims are classified as no-fault comprehensive events under Arizona law. You\'ve been paying for this coverage — using it cannot and does not affect your premiums.'
    },
    {
      question: 'Do I have to use the shop my insurance recommends in Arizona?',
      answer: 'No. Under ARS 20-469, Arizona law gives every driver the explicit legal right to choose any auto glass repair shop. Your insurance company can recommend Safelite or any other preferred shop, but they cannot require you to use it. Critically, they must inform you of your right to choose any shop you want. If your insurer is pressuring you to use a specific shop, they may be violating ARS 20-469. You are free to choose Pink Auto Glass — and we\'ll handle your entire claim regardless of which company you use.'
    },
    {
      question: 'What if I don\'t have glass coverage on my Arizona policy?',
      answer: 'If you don\'t have the glass endorsement, your windshield replacement is subject to your regular comprehensive deductible — typically $250–$1,000. We offer competitive cash pricing for Phoenix metro drivers without coverage. Cash pricing for windshield replacement in Phoenix typically ranges from $200–$900 depending on vehicle make, model, and glass complexity. We provide exact quotes over the phone at no charge.'
    },
    {
      question: 'Does the $0 deductible apply to chip repair too, or only full replacement?',
      answer: 'Arizona\'s zero-deductible glass coverage under ARS 20-264 covers ALL auto glass services — chip repair, crack repair, full windshield replacement, door window replacement, rear glass, and all other vehicle glass. Chip repair (when the damage qualifies) is actually the best use of your coverage because it\'s fast (30-45 minutes), completely free, and prevents a small chip from becoming a full replacement that takes longer. Act fast: Phoenix summer heat turns chips into cracks quickly.'
    },
  ];

  const serviceSchema = generateServiceSchema({
    serviceName: 'Arizona Auto Glass Insurance Claims',
    description: 'Arizona windshield insurance claims service. ARS 20-264 zero-deductible coverage. We handle 100% of paperwork and bill your insurance directly for Phoenix metro drivers.',
    serviceType: 'Insurance Claims Assistance',
    areaServed: ['Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler', 'Gilbert', 'Glendale', 'Peoria', 'Surprise', 'Goodyear', 'Avondale', 'Buckeye', 'Fountain Hills', 'Queen Creek', 'Apache Junction', 'Cave Creek', 'Maricopa', 'El Mirage', 'Litchfield Park', 'Ahwatukee']
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Services', url: 'https://pinkautoglass.com/services' },
    { name: 'Insurance Claims', url: 'https://pinkautoglass.com/services/insurance-claims' },
    { name: 'Arizona', url: 'https://pinkautoglass.com/services/insurance-claims/arizona' }
  ]);

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Arizona Windshield Insurance Claims | ARS 20-264 | $0 Deductible",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".answer-first", "h1"]
    }
  };

  const combinedSchema = combineSchemas(serviceSchema, faqSchema, breadcrumbSchema, webPageSchema);

  const azCities = [
    { name: 'Phoenix', slug: 'phoenix-az' },
    { name: 'Scottsdale', slug: 'scottsdale-az' },
    { name: 'Tempe', slug: 'tempe-az' },
    { name: 'Mesa', slug: 'mesa-az' },
    { name: 'Chandler', slug: 'chandler-az' },
    { name: 'Gilbert', slug: 'gilbert-az' },
    { name: 'Glendale', slug: 'glendale-az' },
    { name: 'Peoria', slug: 'peoria-az' },
    { name: 'Surprise', slug: 'surprise-az' },
    { name: 'Goodyear', slug: 'goodyear-az' },
    { name: 'Avondale', slug: 'avondale-az' },
    { name: 'Buckeye', slug: 'buckeye-az' },
    { name: 'Fountain Hills', slug: 'fountain-hills-az' },
    { name: 'Queen Creek', slug: 'queen-creek-az' },
    { name: 'Apache Junction', slug: 'apache-junction-az' },
    { name: 'Cave Creek', slug: 'cave-creek-az' },
    { name: 'Maricopa', slug: 'maricopa-az' },
    { name: 'El Mirage', slug: 'el-mirage-az' },
    { name: 'Litchfield Park', slug: 'litchfield-park-az' },
    { name: 'Ahwatukee', slug: 'ahwatukee-az' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <article className="min-h-screen bg-gradient-to-b from-white to-orange-50 page-top-padding">
        <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 mr-2" />
                <span className="text-xl">Arizona Glass Law Experts</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Arizona Law Means Your Windshield Replacement Costs $0
              </h1>
              <p className="answer-first text-lg text-orange-100 leading-relaxed mb-6 max-w-3xl mx-auto">
                Arizona has three laws that protect you when your windshield breaks. Under ARS 20-264, insurers must offer zero-deductible glass coverage — most Phoenix metro drivers with comprehensive policies already have it, paying just $5–$15/month extra. Under ARS 20-263, filing a glass claim is legally classified as no-fault, meaning your insurance rates cannot increase. Under ARS 20-469, you have the legal right to choose any auto glass shop — your insurer can recommend Safelite, but they cannot require it and must tell you that you can choose anyone you want. Pink Auto Glass serves all 20 Phoenix metro cities, handles 100% of your insurance paperwork, and provides same-day mobile service to your home or office. You pay nothing, you lose nothing, and you get your windshield replaced by experienced professionals.
              </p>
              <CTAButtons source="az-insurance-claims" />
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
              { label: 'Arizona', href: '/services/insurance-claims/arizona' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <time dateTime="2026-02-22" className="text-sm text-gray-500">
            Updated February 22, 2026
          </time>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">The Three Arizona Laws That Protect You</h2>

                <div className="space-y-6">
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">ARS 20-264: The Zero-Deductible Law</h3>
                    <p className="text-gray-700 mb-3">
                      Arizona Revised Statutes 20-264 requires every insurance company that writes comprehensive auto policies in Arizona to offer a zero-deductible glass endorsement as part of that policy. This is the law that makes $0 windshield replacement possible.
                    </p>
                    <p className="text-gray-700 mb-3">
                      <strong>What this means for you:</strong> If you have comprehensive coverage and elected the glass endorsement (often called "full glass coverage"), your deductible is waived entirely for windshield repair or replacement. You pay nothing out of pocket — not $50, not $100, nothing.
                    </p>
                    <p className="text-gray-700">
                      <strong>Note:</strong> Many competitors incorrectly cite ARS 20-263 for the zero-deductible law. The correct statute is ARS 20-264. ARS 20-263 is the rate protection law (see below).
                    </p>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">ARS 20-263: No Rate Increase Protection</h3>
                    <p className="text-gray-700 mb-3">
                      Arizona Revised Statutes 20-263 provides rate protection for glass claims. Under this law, an insurer cannot raise your premiums solely because you filed an auto glass claim in Arizona. Glass claims are classified as no-fault comprehensive events.
                    </p>
                    <p className="text-gray-700">
                      <strong>What this means for you:</strong> File your claim. Your rates are legally protected. Even if you've filed glass claims in the past, each new claim cannot be used to justify a rate increase. You've been paying for this coverage for years — use it.
                    </p>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">ARS 20-469: Right to Choose Your Shop</h3>
                    <p className="text-gray-700 mb-3">
                      Arizona Revised Statutes 20-469 is the law that most Arizona drivers have never heard of — and that most insurance companies hope you don't know about. Under ARS 20-469, every Arizona driver has the explicit legal right to choose any auto glass repair shop they want for insurance-covered work.
                    </p>
                    <p className="text-gray-700 mb-3">
                      Your insurer can recommend Safelite or any other shop. They cannot require you to use it. And critically, under ARS 20-469, they must tell you that you have the right to choose any shop.
                    </p>
                    <p className="text-gray-700">
                      <strong>What this means for you:</strong> Choose Pink Auto Glass. We handle your claim, come to you, do excellent work, and you exercise a right the law specifically gives you.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Do You Have to Use Safelite in Arizona?</h2>
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
                  <p className="text-lg text-gray-800 font-semibold mb-4">
                    No. Arizona law ARS 20-469 explicitly prohibits your insurer from requiring you to use any specific shop.
                  </p>
                  <p className="text-gray-700 mb-4">
                    This is one of the most misunderstood points in Arizona auto glass. When you call your insurance company to file a glass claim, they will almost always recommend Safelite. They may use language like "we work with Safelite" or "Safelite is our preferred provider." This language is designed to steer you toward their preferred vendor.
                  </p>
                  <p className="text-gray-700 mb-4">
                    What they are legally required to also tell you — though many do not — is that under ARS 20-469, you have the legal right to choose any shop you want. If you express a preference for a different shop, your insurer must honor it. They cannot deny your claim, delay your service, or penalize you in any way for choosing a shop other than Safelite.
                  </p>
                  <p className="text-gray-700">
                    Pink Auto Glass handles claims from every major insurer including State Farm, Geico, Progressive, Allstate, USAA, Farmers, Liberty Mutual, AAA, Nationwide, Travelers, and all others. We work with your insurance company directly — you just tell us to proceed and we handle everything.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Check If You Have Glass Coverage</h2>
                <div className="space-y-4">
                  <p className="text-lg text-gray-700">
                    Not sure if you have the glass endorsement? Here are four ways to check:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { num: '1', title: 'Call Us First', desc: 'The fastest option. Call Pink Auto Glass at (480) 712-7465 and give us your insurance company name and policy number. We verify coverage on your behalf — for free, no obligation.' },
                      { num: '2', title: 'Check Your Declarations Page', desc: 'Your declarations page (the first page of your policy) lists all coverages. Look for "Comprehensive Glass," "Full Glass," or "Glass Endorsement" — any of these indicate zero-deductible coverage.' },
                      { num: '3', title: 'Check Your Insurance App', desc: 'Most major insurers (State Farm, Geico, Progressive, USAA) have apps that show your coverage details. Look under Comprehensive coverage for glass-related entries.' },
                      { num: '4', title: 'Call Your Insurer Directly', desc: 'Ask: "Do I have zero-deductible glass coverage under ARS 20-264?" The specific statute reference helps clarify what you\'re asking about.' },
                    ].map(item => (
                      <div key={item.num} className="flex items-start bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-3 mt-0.5">{item.num}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-700">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How Arizona Glass Claims Work — Step by Step</h2>
                <div className="space-y-4">
                  {[
                    { num: 1, title: 'Contact Pink Auto Glass', desc: 'Call, text, or book online. Tell us your insurance company and policy number (on your insurance card).' },
                    { num: 2, title: 'We Verify Your Coverage', desc: 'We call your insurer and verify that you have zero-deductible glass coverage under ARS 20-264. We confirm the exact cost before any work begins — usually $0.' },
                    { num: 3, title: 'You Approve the Service', desc: 'We tell you exactly what you\'ll pay (typically nothing) and confirm the service. No surprises, ever.' },
                    { num: 4, title: 'We Assist With Filing', desc: 'We assist with filing all required claim documentation directly with your insurance company on your behalf under ARS 20-469.' },
                    { num: 5, title: 'We Schedule Mobile Service', desc: 'We schedule service at your home, office, or any convenient Phoenix metro location. Same-day appointments available.' },
                    { num: 6, title: 'We Complete the Replacement', desc: 'Our certified technicians replace your windshield with OEM-quality glass at your location. Typically 60-90 minutes.' },
                    { num: 7, title: 'We Bill Your Insurance Directly', desc: 'We submit the bill to your insurance company. You drive away with a new windshield and a zero balance owed.' },
                  ].map((step) => (
                    <div key={step.num} className="flex items-start bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Insurance Companies We Work With in Arizona</h2>
                <p className="text-gray-700 mb-6">We handle claims with all major Arizona insurers:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    'State Farm', 'Geico', 'Progressive', 'Allstate',
                    'USAA', 'Farmers', 'Liberty Mutual', 'Nationwide',
                    'American Family', 'Travelers', 'AAA', 'Safeco',
                    'The Hartford', 'Mercury', 'Esurance', 'MetLife'
                  ].map(insurer => (
                    <div key={insurer} className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:bg-orange-50 hover:border-orange-300 transition-colors">
                      <span className="text-gray-700 font-medium">{insurer}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 mt-4 text-center">
                  Don't see your insurer? <a href="tel:+14807127465" className="text-orange-600 hover:underline font-semibold">Call us</a> — we work with all carriers.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Phoenix Area Service Coverage</h2>
                <p className="text-gray-700 mb-6">
                  We provide mobile windshield replacement and insurance claims service throughout the Phoenix metro. Click your city for local coverage details.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {azCities.map(city => (
                    <Link
                      key={city.slug}
                      href={`/locations/${city.slug}`}
                      className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:bg-orange-50 hover:border-orange-300 transition-colors"
                    >
                      <span className="text-orange-700 font-medium text-sm">{city.name}</span>
                    </Link>
                  ))}
                </div>
              </section>

              <AboveFoldCTA location="az-insurance-claims-mid" />

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions About Arizona Glass Coverage</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                      <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                        {faq.question}
                        <span className="text-orange-600 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to File Your Arizona Glass Claim?</h2>
                <p className="text-xl mb-6 text-orange-100">
                  We handle all paperwork. Arizona law means $0 out of pocket. Same-day service across Phoenix metro.
                </p>
                <CTAButtons source="az-insurance-claims-cta" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-orange-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Start Your AZ Claim</h3>
                  <div className="space-y-3">
                    <a
                      href="tel:+14807127465"
                      className="flex items-center justify-center w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Call (480) 712-7465
                    </a>
                    <a
                      href="sms:+14807127465"
                      className="flex items-center justify-center w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Text Policy Info
                    </a>
                    <Link
                      href="/book"
                      className="flex items-center justify-center w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Book Online
                    </Link>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Arizona Glass Laws</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>ARS 20-264</strong>
                        <p className="text-gray-600">Zero-deductible coverage required to be offered</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>ARS 20-263</strong>
                        <p className="text-gray-600">Rates cannot increase from a glass claim</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>ARS 20-469</strong>
                        <p className="text-gray-600">Your right to choose any shop</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">What You'll Need</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-orange-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Insurance Card</strong> with policy number</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-orange-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>VIN Number</strong> (on dashboard or insurance card)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-orange-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Claim Number</strong> (if already filed)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Phoenix Metro Cities</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {azCities.slice(0, 8).map(city => (
                      <Link key={city.slug} href={`/locations/${city.slug}`} className="text-blue-600 hover:underline">{city.name}</Link>
                    ))}
                  </div>
                  <Link href="/locations" className="block mt-3 text-blue-600 hover:underline font-semibold text-sm">View All Locations →</Link>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Related Services</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/services/windshield-replacement" className="text-orange-600 hover:underline">
                        Windshield Replacement →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/windshield-repair" className="text-orange-600 hover:underline">
                        Windshield Repair →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/insurance-claims" className="text-orange-600 hover:underline">
                        Colorado Insurance Claims →
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
