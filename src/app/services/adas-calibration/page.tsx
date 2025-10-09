import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MessageSquare, Calendar, CheckCircle, Camera, AlertTriangle } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'ADAS Calibration Denver - Included Free After Windshield Replacement',
  description: 'Professional ADAS camera calibration in Denver after windshield replacement. Required for lane assist, collision warning. We include it free (others charge $150-$300). Call (720) 918-7465.',
  keywords: 'ADAS calibration denver, windshield camera calibration, lane departure calibration, forward collision warning calibration',
  openGraph: {
    title: 'ADAS Calibration Denver | Pink Auto Glass',
    description: 'ADAS calibration included free with windshield replacement. Certified technicians, OEM-spec equipment.',
    url: 'https://pinkautoglass.com/services/adas-calibration',
    type: 'website',
  },
};

export default function AdasCalibrationPage() {
  const faqs = [
    {
      question: 'What is ADAS calibration and why is it necessary?',
      answer: 'ADAS (Advanced Driver Assistance Systems) calibration is a precise alignment process required after windshield replacement on vehicles with cameras or sensors mounted on or near the glass. These systems - including lane departure warning, automatic emergency braking, adaptive cruise control, and collision avoidance - rely on exact positioning to function correctly. Even a 1mm shift in the windshield can cause these safety systems to malfunction or provide false alerts. Calibration ensures your safety systems work as the manufacturer intended.'
    },
    {
      question: 'How much does ADAS calibration cost?',
      answer: 'Many shops charge $150-$300 for ADAS calibration as a separate service. At Pink Auto Glass, we include ADAS calibration FREE with every windshield replacement that requires it. This saves you hundreds of dollars and ensures your safety systems are properly calibrated. We believe safety features shouldn\'t be an expensive add-on - they should work correctly from day one.'
    },
  ];

  const serviceSchema = generateServiceSchema({
    serviceName: 'ADAS Calibration',
    description: 'Professional ADAS camera calibration service in Denver metro area. Included free with windshield replacement. Certified technicians use OEM-spec equipment.',
    priceRange: '0-0',
    serviceType: 'ADAS Calibration Service',
    areaServed: ['Denver Metropolitan Area']
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Services', url: 'https://pinkautoglass.com/services' },
    { name: 'ADAS Calibration', url: 'https://pinkautoglass.com/services/adas-calibration' }
  ]);

  const combinedSchema = combineSchemas(serviceSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 page-top-padding">
        <section className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 mr-2" />
                <span className="text-xl">Safety System Calibration</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                ADAS Calibration After Windshield Replacement
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-purple-100">
                Included FREE • Certified Technicians • OEM Equipment • Required for 2018+ Vehicles
              </p>
              <CTAButtons source="adas-calibration" />
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
              { label: 'ADAS Calibration', href: '/services/adas-calibration' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  What is ADAS Calibration?
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Modern vehicles (2018 and newer) come equipped with Advanced Driver Assistance Systems (ADAS) that use cameras and sensors mounted on or near your windshield. When your windshield is replaced, these cameras must be precisely recalibrated to ensure life-saving safety features work correctly.
                </p>

                <AboveFoldCTA location="service-adas-calibration" />

                <p className="text-lg text-gray-700 mb-4">
                  ADAS calibration is a precision process using specialized equipment that aligns your vehicle's cameras to manufacturer specifications. Without proper calibration, your safety systems may fail to activate, activate incorrectly, or provide false warnings - putting you and your passengers at risk.
                </p>
              </section>

              <section className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                <div className="flex items-start">
                  <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-red-900 mb-2">
                      Federal Law Requires ADAS Calibration
                    </h3>
                    <p className="text-red-800">
                      As of 2018, federal law requires that any vehicle equipped with ADAS must have its safety systems recalibrated after windshield replacement. Skipping this step is not only dangerous - it may violate safety regulations and could affect insurance claims if there's an accident.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  ADAS Systems That Require Calibration
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: 'Lane Departure Warning (LDW)', desc: 'Alerts when you drift out of your lane' },
                    { name: 'Lane Keep Assist (LKA)', desc: 'Actively steers you back into your lane' },
                    { name: 'Automatic Emergency Braking (AEB)', desc: 'Brakes automatically to prevent collisions' },
                    { name: 'Forward Collision Warning (FCW)', desc: 'Warns of potential front-end collisions' },
                    { name: 'Adaptive Cruise Control (ACC)', desc: 'Maintains safe distance from vehicles ahead' },
                    { name: 'Pedestrian Detection', desc: 'Detects pedestrians and prevents accidents' },
                    { name: 'Traffic Sign Recognition', desc: 'Reads and displays speed limit signs' },
                    { name: 'Heads-Up Display (HUD)', desc: 'Projects information onto the windshield' }
                  ].map((system, idx) => (
                    <div key={idx} className="bg-white border border-purple-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{system.name}</h3>
                      <p className="text-sm text-gray-600">{system.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our ADAS Calibration Process
                </h2>
                <div className="space-y-4">
                  {[
                    { num: 1, title: 'System Scan', desc: 'We connect to your vehicle\'s computer system to identify which ADAS features are equipped.' },
                    { num: 2, title: 'Target Setup', desc: 'Specialized calibration targets are positioned at precise distances and angles according to manufacturer specs.' },
                    { num: 3, title: 'Static Calibration', desc: 'Using OEM-approved equipment, we calibrate cameras while the vehicle is stationary.' },
                    { num: 4, title: 'Dynamic Calibration', desc: 'For some vehicles, we perform a test drive to complete the calibration process.' },
                    { num: 5, title: 'Verification', desc: 'We re-scan the system to verify all ADAS features are functioning correctly and error-free.' }
                  ].map((step) => (
                    <div key={step.num} className="flex items-start bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
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

              <section className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  We Include ADAS Calibration FREE
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-gray-500 mb-2 line-through">$150-$300</div>
                    <div className="text-sm text-gray-600 mb-4">What other shops charge</div>
                  </div>
                  <div>
                    <div className="text-5xl font-bold text-green-600 mb-2">$0</div>
                    <div className="text-sm text-gray-600 mb-4">Included with our windshield replacement</div>
                  </div>
                </div>
                <p className="text-gray-700">
                  When you choose Pink Auto Glass for windshield replacement, ADAS calibration is <strong>automatically included at no extra charge</strong>. We believe your safety systems should work correctly - without breaking the bank.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Vehicles That Commonly Require ADAS Calibration
                </h2>
                <p className="text-gray-700 mb-4">Most vehicles from 2018 onward require ADAS calibration. Common models include:</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { make: 'Honda', model: 'Accord', slug: 'honda-accord-windshield-replacement-denver' },
                    { make: 'Toyota', model: 'Camry', slug: 'toyota-camry-windshield-replacement-denver' },
                    { make: 'Subaru', model: 'Outback', slug: 'subaru-outback-windshield-replacement-denver' },
                    { make: 'Tesla', model: 'Model 3', slug: 'tesla-model-3-windshield-replacement-denver' },
                    { make: 'Toyota', model: 'RAV4', slug: 'toyota-rav4-windshield-replacement-denver' },
                    { make: 'Honda', model: 'CR-V', slug: 'honda-cr-v-windshield-replacement-denver' },
                  ].map(v => (
                    <Link
                      key={v.slug}
                      href={`/vehicles/${v.slug}`}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-purple-500 hover:shadow-md transition-all"
                    >
                      <div className="font-semibold text-gray-900">{v.make} {v.model}</div>
                      <div className="text-sm text-purple-600">View Details →</div>
                    </Link>
                  ))}
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
                        <span className="text-purple-600 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Need Windshield Replacement with ADAS?</h2>
                <p className="text-xl mb-6 text-purple-100">
                  Calibration included free. Certified technicians. OEM equipment.
                </p>
                <CTAButtons source="adas-calibration" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Get Started</h3>
                  <div className="space-y-3">
                    <a
                      href="tel:+17209187465"
                      className="flex items-center justify-center w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Call (720) 918-7465
                    </a>
                    <a
                      href="sms:+17209187465"
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

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Why Calibration Matters</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Safety First</strong> - Systems work correctly</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Legal Compliance</strong> - Required by law</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>No Extra Cost</strong> - Included free</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Certified Techs</strong> - OEM-trained</span>
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
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Related Services</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/services/windshield-replacement" className="text-purple-600 hover:underline">
                        Windshield Replacement →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/mobile-service" className="text-purple-600 hover:underline">
                        Mobile Service →
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
