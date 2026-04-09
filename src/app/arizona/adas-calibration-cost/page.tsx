import { Metadata } from 'next';
import Link from 'next/link';
import { DollarSign, AlertTriangle, CheckCircle, Car } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  robots: { index: false },
  title: 'ADAS Calibration Cost | Pricing After Replacement',
  description: 'ADAS calibration costs $150-$400 after windshield replacement. Often covered by insurance. Required for safety. Call (480) 712-7465.',
  keywords: 'adas calibration cost, windshield calibration cost, camera calibration after windshield replacement, adas recalibration price',
  alternates: {
    canonical: 'https://pinkautoglass.com/adas-calibration-cost',
  },
  openGraph: {
    title: 'ADAS Calibration Cost | Pricing After Replacement',
    description: 'ADAS calibration costs $150-$400 after windshield replacement. Often covered by insurance. Required for safety.',
    url: 'https://pinkautoglass.com/adas-calibration-cost',
    type: 'website',
  },
};

export default function AdasCostPage() {
  const faqs = [
    {
      question: 'Is ADAS calibration always needed after windshield replacement?',
      answer: 'If your vehicle has any forward-facing camera or sensor mounted on or near the windshield, yes. This includes lane departure warning, automatic emergency braking, adaptive cruise control, forward collision warning, and traffic sign recognition. Even a 1mm shift during replacement can cause these systems to malfunction.'
    },
    {
      question: 'Does insurance cover ADAS calibration?',
      answer: 'In most cases, yes. ADAS calibration is typically included as part of the windshield replacement claim since it\'s a required safety procedure. We include calibration in our insurance billing so you don\'t pay extra. Verify with your carrier — we can check for you.'
    },
    {
      question: 'Can I skip ADAS calibration to save money?',
      answer: 'We strongly advise against it. Skipping calibration means your safety systems (automatic braking, lane assist, collision warning) may not work correctly or could give false alerts. This creates a real safety risk for you and other drivers. It\'s not optional — it\'s a safety requirement.'
    },
    {
      question: 'How long does ADAS calibration take?',
      answer: 'ADAS calibration typically takes 30-60 minutes after the new windshield is installed and the adhesive has cured. We perform calibration as part of the same service visit — no need for a separate appointment.'
    },
    {
      question: 'Do all auto glass shops offer ADAS calibration?',
      answer: 'No. ADAS calibration requires specialized equipment and training that many smaller shops don\'t have. Pink Auto Glass is equipped for both static and dynamic calibration for all major vehicle makes and models. Some shops will replace your windshield but send you to a dealer for calibration — we do it all in one visit.'
    },
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'ADAS Calibration Cost', url: 'https://pinkautoglass.com/adas-calibration-cost' }
  ]);
  const combinedSchema = combineSchemas(faqSchema, breadcrumbSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <article className="min-h-screen bg-gradient-to-b from-white to-purple-50 page-top-padding">
        {/* Hero */}
        <section className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <DollarSign className="w-8 h-8 mr-2" />
                <span className="text-xl">ADAS Calibration Pricing</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                How Much Does ADAS Calibration Cost?
              </h1>
              <p className="text-lg text-purple-100 leading-relaxed mb-6 max-w-3xl mx-auto">
                ADAS calibration typically costs <strong className="text-white">$150-$400</strong> depending on your vehicle. The good news: it's usually <strong className="text-white">covered by insurance</strong> as part of your windshield replacement claim. We include it in our billing so most customers pay nothing extra.
              </p>
              <CTAButtons source="adas-cost-hero" />
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'ADAS Calibration Cost' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              {/* What is ADAS */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  What Is ADAS Calibration?
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  ADAS (Advanced Driver Assistance Systems) includes the cameras and sensors behind your windshield that power safety features like lane departure warning, automatic emergency braking, adaptive cruise control, and forward collision warning. When your windshield is replaced, these sensors need to be recalibrated to their exact factory specifications.
                </p>
                <p className="text-lg text-gray-700">
                  Even a shift of 1-2 millimeters in windshield positioning can cause ADAS systems to misread lane markings, misjudge distances, or fail to detect obstacles. Calibration ensures these life-saving systems work as intended. Learn more on our <Link href="/services/adas-calibration" className="text-purple-600 hover:underline font-semibold">ADAS calibration service page</Link>.
                </p>
              </section>

              {/* Cost Breakdown */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  ADAS Calibration Cost by Vehicle Type
                </h2>
                <div className="space-y-4">
                  {[
                    { category: 'Standard Vehicles', examples: 'Honda Civic, Toyota Camry, Hyundai Elantra', range: '$150 - $250', note: 'Single forward-facing camera, standard calibration' },
                    { category: 'SUVs & Trucks', examples: 'Toyota RAV4, Ford F-150, Jeep Grand Cherokee', range: '$200 - $300', note: 'Larger windshield, may have multiple sensors' },
                    { category: 'Luxury & Advanced', examples: 'Tesla, BMW, Mercedes, Audi, Subaru EyeSight', range: '$250 - $400', note: 'Multiple cameras/sensors, complex calibration requirements' },
                  ].map((tier, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{tier.category}</h3>
                        <span className="text-xl font-bold text-purple-600">{tier.range}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{tier.examples}</p>
                      <p className="text-gray-700">{tier.note}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <p className="text-green-900 font-semibold">
                    With insurance: Usually <strong>$0 additional cost</strong>. ADAS calibration is billed as part of the windshield replacement claim.
                  </p>
                </div>
              </section>

              <AboveFoldCTA location="adas-cost-mid" />

              {/* What Affects Cost */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  What Affects ADAS Calibration Cost
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Calibration Type</h3>
                    <p className="text-gray-700"><strong>Static calibration</strong> uses a target board in a controlled environment. <strong>Dynamic calibration</strong> requires driving the vehicle at specific speeds. Some vehicles need both. Dynamic adds time and cost.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Number of Sensors</h3>
                    <p className="text-gray-700">Vehicles with a single forward camera are simpler. Vehicles with EyeSight (Subaru), ProPILOT (Nissan), or Tesla Autopilot have multiple sensors that all need calibration.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Vehicle Make & Model</h3>
                    <p className="text-gray-700">European luxury brands (BMW, Mercedes, Audi) typically require more complex calibration procedures. Japanese and American vehicles are generally more straightforward.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Bundled vs. Standalone</h3>
                    <p className="text-gray-700">When done alongside windshield replacement, calibration is often cheaper (bundled pricing) and covered by insurance. Standalone calibration (without replacement) is less common but costs the same range.</p>
                  </div>
                </div>
              </section>

              {/* Safety Warning */}
              <section className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                <h2 className="text-xl font-bold text-red-900 mb-3 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  Don't Skip ADAS Calibration
                </h2>
                <p className="text-gray-800 mb-3">
                  Driving without proper ADAS calibration after windshield replacement is a safety risk:
                </p>
                <ul className="space-y-2 text-gray-800">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">-</span>
                    <span>Lane departure warning may steer you into the wrong lane</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">-</span>
                    <span>Automatic emergency braking may not detect obstacles</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">-</span>
                    <span>Adaptive cruise control may misjudge following distance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">-</span>
                    <span>Forward collision warning may give false or missed alerts</span>
                  </li>
                </ul>
              </section>

              {/* Which Vehicles */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Which Vehicles Need ADAS Calibration?
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Most vehicles made after 2015 have at least one ADAS feature that requires calibration after windshield replacement. If your vehicle has any of these, calibration is required:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Lane Departure Warning',
                    'Automatic Emergency Braking',
                    'Adaptive Cruise Control',
                    'Forward Collision Warning',
                    'Traffic Sign Recognition',
                    'Pedestrian Detection',
                    'Rain-Sensing Wipers',
                    'Head-Up Display',
                    'Parking Assist Camera',
                  ].map(feature => (
                    <div key={feature} className="flex items-center bg-white border border-gray-200 rounded p-3">
                      <CheckCircle className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQs */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  ADAS Calibration Cost FAQs
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                      <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                        {faq.question}
                        <span className="text-purple-600 group-open:rotate-180 transition-transform">&#9660;</span>
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
                  <Link href="/services/adas-calibration" className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-1">ADAS Calibration Service</h3>
                    <p className="text-sm text-gray-600">Full service details</p>
                  </Link>
                  <Link href="/pricing" className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-1">Pricing Guide</h3>
                    <p className="text-sm text-gray-600">Windshield replacement costs</p>
                  </Link>
                  <Link href="/does-insurance-cover-windshield-replacement" className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-1">Insurance Coverage</h3>
                    <p className="text-sm text-gray-600">Does insurance cover this?</p>
                  </Link>
                </div>
              </section>

              {/* Bottom CTA */}
              <section className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Get an ADAS Calibration Quote</h2>
                <p className="text-xl mb-6 text-purple-100">
                  Usually covered by insurance. We calibrate all makes and models. Same-day service.
                </p>
                <CTAButtons source="adas-cost-bottom" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Cost range:</span>
                      <span className="font-bold text-purple-600">$150-$400</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">With insurance:</span>
                      <span className="font-bold text-green-600">Usually $0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Time:</span>
                      <span className="font-bold text-gray-900">30-60 min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Required for:</span>
                      <span className="font-bold text-gray-900">Most 2015+ vehicles</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Areas</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Link href="/locations/denver-co" className="text-purple-600 hover:underline">Denver</Link>
                    <Link href="/locations/aurora-co" className="text-purple-600 hover:underline">Aurora</Link>
                    <Link href="/locations/boulder-co" className="text-purple-600 hover:underline">Boulder</Link>
                    <Link href="/locations/colorado-springs-co" className="text-purple-600 hover:underline">Colorado Springs</Link>
                    <Link href="/locations/fort-collins-co" className="text-purple-600 hover:underline">Fort Collins</Link>
                    <Link href="/locations/phoenix-az" className="text-purple-600 hover:underline">Phoenix</Link>
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
