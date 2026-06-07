import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MessageSquare, Calendar, Car, CheckCircle, Clock, MapPin, Shield, Star } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import ServiceAreaLinks from '@/components/ServiceAreaLinks';
import { generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';
import QuoterEmbed from '@/components/QuoterEmbed';

export const metadata: Metadata = {
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
    areaServed: ['Phoenix', 'Scottsdale', 'Mesa', 'Tempe', 'Chandler', 'Gilbert', 'Glendale', 'Peoria', 'Surprise', 'Goodyear', 'Buckeye', 'Queen Creek'],
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
                  Our 6-Step Windshield Replacement Process
                </h2>
                <div className="space-y-4">
                  {[
                    { num: 1, title: 'Vehicle Inspection', desc: 'We inspect your vehicle and verify the correct windshield part number for your exact make, model, and year. We check for ADAS sensors and camera units.' },
                    { num: 2, title: 'Old Windshield Removal', desc: 'Using specialized tools, we carefully remove the damaged windshield and all old adhesive from the frame.' },
                    { num: 3, title: 'Frame Preparation', desc: 'We clean and prime the windshield frame to ensure optimal adhesion of the new glass — especially important in Phoenix heat.' },
                    { num: 4, title: 'New Glass Installation', desc: 'We apply high-grade urethane adhesive and carefully position your new OEM-quality windshield for a factory-tight fit.' },
                    { num: 5, title: 'ADAS Calibration', desc: 'For vehicles with cameras or sensors (common on 2018+), we recalibrate and provide documentation.' },
                    { num: 6, title: 'Quality Check & Cure Time', desc: 'We inspect the installation, test for leaks, and advise you on proper cure time before driving.' },
                  ].map((step) => (
                    <div key={step.num} className="flex items-start bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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

              {/* OEM vs Aftermarket */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  OEM vs Aftermarket Windshields: What's the Difference?
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">OEM (Original Equipment Manufacturer) Glass</h3>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">Exact same glass that came with your vehicle from the factory</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">Perfect fit and optical clarity guaranteed</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">Required for ADAS-equipped vehicles (2018+)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">Maintains vehicle resale value</span>
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Aftermarket Glass</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">Lower cost alternative for older vehicles</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">Meets DOT safety standards</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">Suitable for vehicles without advanced safety features</span>
                    </li>
                  </ul>
                </div>
                <p className="text-lg text-gray-700 mt-4">
                  <strong>Our Recommendation:</strong> We recommend OEM quality glass for all vehicles, especially those with ADAS. The slight price difference is worth knowing your windshield fits and performs exactly as the manufacturer intended.
                </p>
              </section>

              {/* ADAS Calibration */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  ADAS Calibration Included
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Modern vehicles (2018 and newer) come equipped with Advanced Driver Assistance Systems (ADAS) that rely on cameras and sensors mounted on or near the windshield. These systems include:
                </p>
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center bg-blue-50 p-3 rounded">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                    <span>Lane Departure Warning</span>
                  </div>
                  <div className="flex items-center bg-blue-50 p-3 rounded">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                    <span>Automatic Emergency Braking</span>
                  </div>
                  <div className="flex items-center bg-blue-50 p-3 rounded">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                    <span>Adaptive Cruise Control</span>
                  </div>
                  <div className="flex items-center bg-blue-50 p-3 rounded">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                    <span>Collision Avoidance</span>
                  </div>
                </div>
                <p className="text-lg text-gray-700">
                  After windshield replacement, these systems must be recalibrated to ensure they function correctly. Our certified technicians use manufacturer-approved equipment to restore your safety systems.
                </p>
              </section>

              {/* What's Included */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  What's Included in Your Service
                </h2>
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 border-2 border-pink-200">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Shield className="w-12 h-12 text-pink-600 mx-auto mb-3" />
                      <div className="font-bold text-gray-900 mb-2">OEM Quality Glass</div>
                      <div className="text-sm text-gray-700">Exact same glass as factory original</div>
                    </div>
                    <div className="text-center">
                      <Car className="w-12 h-12 text-pink-600 mx-auto mb-3" />
                      <div className="font-bold text-gray-900 mb-2">Mobile Service</div>
                      <div className="text-sm text-gray-700">We come to your location across Phoenix metro</div>
                    </div>
                    <div className="text-center">
                      <Shield className="w-12 h-12 text-pink-600 mx-auto mb-3" />
                      <div className="font-bold text-gray-900 mb-2">Lifetime Warranty</div>
                      <div className="text-sm text-gray-700">Workmanship guaranteed forever</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Popular Vehicles */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Popular Vehicles We Service in Phoenix
                </h2>
                <p className="text-gray-700 mb-4">Get vehicle-specific information:</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { make: 'Toyota', model: 'Camry', slug: 'toyota-camry-windshield-replacement-phoenix' },
                    { make: 'Honda', model: 'Civic', slug: 'honda-civic-windshield-replacement-phoenix' },
                    { make: 'Ford', model: 'F-150', slug: 'ford-f150-windshield-replacement-phoenix' },
                    { make: 'Chevrolet', model: 'Silverado', slug: 'chevrolet-silverado-windshield-replacement-phoenix' },
                    { make: 'Toyota', model: 'RAV4', slug: 'toyota-rav4-windshield-replacement-phoenix' },
                    { make: 'Honda', model: 'CR-V', slug: 'honda-cr-v-windshield-replacement-phoenix' },
                    { make: 'Nissan', model: 'Altima', slug: 'nissan-altima-windshield-replacement-phoenix' },
                    { make: 'Hyundai', model: 'Tucson', slug: 'hyundai-tucson-windshield-replacement-phoenix' },
                  ].map(v => (
                    <Link
                      key={v.slug}
                      href={`/vehicles/${v.slug}`}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-pink-500 hover:shadow-md transition-all"
                    >
                      <div className="font-semibold text-gray-900">{v.make} {v.model}</div>
                      <div className="text-sm text-pink-600">Learn More →</div>
                    </Link>
                  ))}
                </div>
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

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Contact Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Get Started Now</h3>
                  <div className="space-y-3">
                    <a
                      href="tel:+14807127465"
                      className="flex items-center justify-center w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Call (480) 712-7465
                    </a>
                    <a
                      href="sms:+14807127465"
                      className="flex items-center justify-center w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Text Us
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

                {/* Why Choose Us */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Why Choose Pink Auto Glass?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Shield className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Lifetime Warranty</strong> on all replacements</span>
                    </li>
                    <li className="flex items-start">
                      <Clock className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Same-Day Service</strong> available</span>
                    </li>
                    <li className="flex items-start">
                      <Star className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>OEM Quality Glass</strong> guaranteed</span>
                    </li>
                    <li className="flex items-start">
                      <Car className="w-5 h-5 text-pink-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Mobile Service</strong> across Phoenix metro</span>
                    </li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="text-sm text-gray-700">
                      We're proud supporters of breast cancer research, and a portion of our proceeds goes to help fund breast cancer awareness and treatment.
                    </p>
                  </div>
                </div>

                {/* Service Area */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Phoenix Metro Service Area</h3>
                  <p className="text-sm text-gray-700 mb-3">We serve the entire Valley:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Link href="/arizona/phoenix" className="text-blue-600 hover:underline">Phoenix</Link>
                    <Link href="/arizona/scottsdale" className="text-blue-600 hover:underline">Scottsdale</Link>
                    <Link href="/arizona/mesa" className="text-blue-600 hover:underline">Mesa</Link>
                    <Link href="/arizona/tempe" className="text-blue-600 hover:underline">Tempe</Link>
                    <Link href="/arizona/chandler" className="text-blue-600 hover:underline">Chandler</Link>
                    <Link href="/arizona/gilbert" className="text-blue-600 hover:underline">Gilbert</Link>
                    <Link href="/arizona/glendale" className="text-blue-600 hover:underline">Glendale</Link>
                    <Link href="/arizona/peoria" className="text-blue-600 hover:underline">Peoria</Link>
                  </div>
                </div>

                {/* Related Services */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Related Services</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/arizona/services/windshield-repair" className="text-pink-600 hover:underline">
                        Windshield Repair →
                      </Link>
                    </li>
                    <li>
                      <Link href="/arizona/services/adas-calibration" className="text-pink-600 hover:underline">
                        ADAS Calibration →
                      </Link>
                    </li>
                    <li>
                      <Link href="/arizona/services/mobile-service" className="text-pink-600 hover:underline">
                        Mobile Service →
                      </Link>
                    </li>
                    <li>
                      <Link href="/arizona/services/insurance-claims" className="text-pink-600 hover:underline">
                        Insurance Claims →
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
