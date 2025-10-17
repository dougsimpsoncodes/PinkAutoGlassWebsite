import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MessageSquare, Calendar, Shield, Clock, Star, CheckCircle, Wrench, Car } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement Denver | Pink Auto Glass',
  description: 'Professional windshield replacement across the Front Range. OEM quality glass, same-day service, lifetime warranty. We come to you! Book now or call (720) 918-7465.',
  keywords: 'windshield replacement denver, auto glass replacement, windshield replacement cost, mobile windshield replacement, same day windshield replacement',
  openGraph: {
    title: 'Windshield Replacement Denver | Pink Auto Glass',
    description: 'Professional windshield replacement with OEM quality glass. Same-day mobile service. Lifetime warranty.',
    url: 'https://pinkautoglass.com/services/windshield-replacement',
    type: 'website',
  },
};

export default function WindshieldReplacementPage() {
  const faqs = [
    {
      question: 'Does insurance cover windshield replacement in Denver?',
      answer: 'Most insurance companies cover windshield replacement under comprehensive coverage. The exact coverage depends on your vehicle make, model, and features. Luxury vehicles, larger SUVs, and vehicles with ADAS (Advanced Driver Assistance Systems) may have different coverage due to specialized glass and calibration requirements. We provide free quotes and handle all insurance paperwork.'
    },
    {
      question: 'How long does windshield replacement take?',
      answer: 'A standard windshield replacement takes 60-90 minutes from start to finish. This includes removing the old windshield, preparing the frame, installing new OEM-quality glass, and allowing proper cure time. If your vehicle requires ADAS calibration (2018+ models with cameras or sensors), add an additional 30-60 minutes. We recommend waiting at least 1 hour before driving to ensure the adhesive has properly set.'
    },
    {
      question: 'Do you use OEM or aftermarket windshields?',
      answer: 'We primarily use OEM quality (Original Equipment Manufacturer) glass that meets or exceeds factory specifications. OEM quality glass ensures proper fit, optical clarity, and compatibility with modern safety systems like ADAS. For vehicles without advanced safety features, we also offer high-quality aftermarket options that can reduce costs while maintaining safety standards. We\'ll recommend the best option for your specific vehicle and budget.'
    },
    {
      question: 'How does insurance coverage work in Colorado?',
      answer: 'In Colorado, most comprehensive insurance policies cover windshield replacement. We work with all major insurance companies including State Farm, Geico, Progressive, Allstate, USAA, and more. We handle all the paperwork and bill your insurance directly. We\'ll verify your exact coverage before we start.'
    },
    {
      question: 'What is ADAS calibration and do I need it?',
      answer: 'ADAS (Advanced Driver Assistance Systems) calibration is required when replacing windshields on vehicles with cameras, sensors, or heads-up displays mounted on or near the glass. Systems like lane departure warning, automatic emergency braking, adaptive cruise control, and collision avoidance all require precise calibration after windshield replacement. Most vehicles 2018 and newer require ADAS calibration.'
    },
    {
      question: 'Do you offer mobile windshield replacement?',
      answer: 'Absolutely! Mobile service is our specialty. We come to your home, office, or anywhere across the Front Range. Our fully equipped mobile units carry the tools and glass needed to complete your replacement on-site. There\'s no additional charge for mobile service within our service area. Same-day appointments are usually available.'
    },
    {
      question: 'What\'s your warranty on windshield replacement?',
      answer: 'We offer a lifetime warranty on all windshield replacements. This covers defects in materials, workmanship, and leaks for as long as you own your vehicle. If you experience any issues related to our installation, we\'ll fix it free of charge.'
    },
    {
      question: 'When should I replace vs repair my windshield?',
      answer: 'Replace your windshield if: the damage is larger than a dollar bill, the crack extends to the edge of the glass, damage is in the driver\'s line of sight, there are multiple chips or cracks, or the damage has penetrated the inner layer of glass. Repair is suitable for chips smaller than a quarter and cracks under 6 inches that are not in critical viewing areas. We\'ll assess your damage and recommend the safest, most cost-effective solution.'
    }
  ];

  const serviceSchema = generateServiceSchema({
    serviceName: 'Windshield Replacement',
    description: 'Professional windshield replacement service in Denver metro area. OEM quality glass, mobile service, same-day appointments, lifetime warranty, and ADAS calibration included.',
    serviceType: 'Auto Glass Replacement',
    areaServed: ['Denver', 'Aurora', 'Lakewood', 'Boulder', 'Highlands Ranch', 'Thornton', 'Arvada', 'Westminster', 'Parker', 'Centennial', 'Fort Collins', 'Colorado Springs']
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Services', url: 'https://pinkautoglass.com/services' },
    { name: 'Windshield Replacement', url: 'https://pinkautoglass.com/services/windshield-replacement' }
  ]);

  const combinedSchema = combineSchemas(serviceSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 page-top-padding">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Professional Windshield Replacement in Denver
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-pink-100">
                OEM Quality Glass • Same-Day Service • Lifetime Warranty
              </p>
              <CTAButtons source="windshield-replacement" />
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrustSignals />
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Services', href: '/services' },
              { label: 'Windshield Replacement', href: '/services/windshield-replacement' }
            ]}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">

              {/* What is Windshield Replacement */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  What is Full Windshield Replacement?
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Windshield replacement is the complete removal of your damaged windshield and installation of a new one. Unlike repairs that fill chips and cracks, replacement gives you a brand-new windshield that restores your vehicle's structural integrity, safety systems, and optical clarity.
                </p>

                <AboveFoldCTA location="service-windshield-replacement" />

                <p className="text-lg text-gray-700 mb-4">
                  Modern windshields are crucial safety components. They provide up to 60% of your vehicle's structural strength in a rollover and ensure proper airbag deployment. A compromised windshield puts you and your passengers at risk - that's why we use only OEM quality glass that meets Federal Motor Vehicle Safety Standards (FMVSS).
                </p>
              </section>

              {/* When Replacement is Needed */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  When You Need Windshield Replacement
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                      <Car className="w-5 h-5 mr-2" />
                      Large Damage
                    </h3>
                    <p className="text-red-800">Cracks longer than 6 inches or chips larger than a quarter require replacement.</p>
                  </div>
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                      <Car className="w-5 h-5 mr-2" />
                      Driver's View
                    </h3>
                    <p className="text-red-800">Any damage in the driver's direct line of sight compromises safety and visibility.</p>
                  </div>
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                      <Car className="w-5 h-5 mr-2" />
                      Edge Damage
                    </h3>
                    <p className="text-red-800">Cracks extending to the windshield edge affect structural integrity.</p>
                  </div>
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                      <Car className="w-5 h-5 mr-2" />
                      Multiple Chips
                    </h3>
                    <p className="text-red-800">Three or more chips indicate weakened glass that should be replaced.</p>
                  </div>
                </div>
              </section>

              {/* Our Process */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our 6-Step Windshield Replacement Process
                </h2>
                <div className="space-y-4">
                  {[
                    { num: 1, title: 'Vehicle Inspection', desc: 'We inspect your vehicle and verify the correct windshield part number for your exact make, model, and year.' },
                    { num: 2, title: 'Old Windshield Removal', desc: 'Using specialized tools, we carefully remove the damaged windshield and all old adhesive from the frame.' },
                    { num: 3, title: 'Frame Preparation', desc: 'We clean and prime the windshield frame to ensure optimal adhesion of the new glass.' },
                    { num: 4, title: 'New Glass Installation', desc: 'We apply high-grade urethane adhesive and carefully position your new OEM-quality windshield.' },
                    { num: 5, title: 'ADAS Calibration', desc: 'For vehicles with cameras or sensors, we perform precise ADAS calibration to restore safety system functionality.' },
                    { num: 6, title: 'Quality Check & Cure Time', desc: 'We inspect the installation, test for leaks, and advise you on proper cure time before driving.' }
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
                      <span className="text-gray-700">For ADAS-equipped vehicles (2018+)</span>
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
                  <strong>Our Recommendation:</strong> We recommend OEM quality glass for all vehicles, especially those with ADAS. The slight price difference is worth the peace of mind knowing your windshield is exactly as the manufacturer intended.
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
                  After windshield replacement, these systems must be recalibrated to ensure they function correctly. Our certified technicians use manufacturer-approved equipment to ensure your safety systems work perfectly.
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
                      <div className="text-sm text-gray-700">We come to your location</div>
                    </div>
                    <div className="text-center">
                      <Shield className="w-12 h-12 text-pink-600 mx-auto mb-3" />
                      <div className="font-bold text-gray-900 mb-2">Lifetime Warranty</div>
                      <div className="text-sm text-gray-700">Workmanship guaranteed forever</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Insurance */}
              <section className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Insurance Claims - We Handle Everything
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Most windshield replacements are covered by your comprehensive insurance policy. We work with all major insurance companies:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {['State Farm', 'Geico', 'Progressive', 'Allstate', 'USAA', 'Farmers', 'Liberty Mutual', 'Nationwide'].map(insurer => (
                    <div key={insurer} className="bg-white p-2 rounded text-center text-sm font-medium text-gray-700">
                      {insurer}
                    </div>
                  ))}
                </div>
                <p className="text-lg text-gray-700">
                  <strong>We handle all the paperwork and bill your insurance directly.</strong> You'll know your exact out-of-pocket cost before we start. No surprises.
                </p>
              </section>

              {/* FAQs */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                      <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                        {faq.question}
                        <span className="text-pink-600 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              {/* Popular Vehicles We Service */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Popular Vehicles We Service in Denver
                </h2>
                <p className="text-gray-700 mb-4">Get vehicle-specific information:</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { make: 'Toyota', model: 'Camry', slug: 'toyota-camry-windshield-replacement-denver' },
                    { make: 'Honda', model: 'Accord', slug: 'honda-accord-windshield-replacement-denver' },
                    { make: 'Subaru', model: 'Outback', slug: 'subaru-outback-windshield-replacement-denver' },
                    { make: 'Ford', model: 'F-150', slug: 'ford-f150-windshield-replacement-denver' },
                    { make: 'Jeep', model: 'Wrangler', slug: 'jeep-wrangler-windshield-replacement-denver' },
                    { make: 'Tesla', model: 'Model 3', slug: 'tesla-model-3-windshield-replacement-denver' },
                    { make: 'Toyota', model: 'RAV4', slug: 'toyota-rav4-windshield-replacement-denver' },
                    { make: 'Honda', model: 'CR-V', slug: 'honda-cr-v-windshield-replacement-denver' },
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

              {/* CTA Section */}
              <section className="bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Replace Your Windshield?</h2>
                <p className="text-xl mb-6 text-pink-100">
                  Same-day appointments available. Free quotes. Zero-hassle insurance claims.
                </p>
                <CTAButtons source="windshield-replacement" />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Contact Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Get Started Now</h3>
                  <div className="space-y-3">
                    <a
                      href="tel:+17209187465"
                      className="flex items-center justify-center w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
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
                      <span className="text-sm text-gray-700"><strong>Mobile Service</strong> to your location</span>
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
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Area</h3>
                  <p className="text-sm text-gray-700 mb-3">We serve the Front Range:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Link href="/locations/denver-co" className="text-blue-600 hover:underline">Denver</Link>
                    <Link href="/locations/aurora-co" className="text-blue-600 hover:underline">Aurora</Link>
                    <Link href="/locations/lakewood-co" className="text-blue-600 hover:underline">Lakewood</Link>
                    <Link href="/locations/boulder-co" className="text-blue-600 hover:underline">Boulder</Link>
                    <Link href="/locations/highlands-ranch-co" className="text-blue-600 hover:underline">Highlands Ranch</Link>
                    <Link href="/locations/thornton-co" className="text-blue-600 hover:underline">Thornton</Link>
                    <Link href="/locations/fort-collins-co" className="text-blue-600 hover:underline">Fort Collins</Link>
                    <Link href="/locations/colorado-springs-co" className="text-blue-600 hover:underline">Colorado Springs</Link>
                  </div>
                </div>

                {/* Related Services */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Related Services</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/services/windshield-repair" className="text-pink-600 hover:underline">
                        Windshield Repair →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/adas-calibration" className="text-pink-600 hover:underline">
                        ADAS Calibration →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/mobile-service" className="text-pink-600 hover:underline">
                        Mobile Service →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/insurance-claims" className="text-pink-600 hover:underline">
                        Insurance Claims →
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
