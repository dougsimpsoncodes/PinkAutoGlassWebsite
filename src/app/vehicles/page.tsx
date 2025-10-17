import { Metadata } from 'next';
import Link from 'next/link';
import { Car, DollarSign, CheckCircle, Shield, Wrench, Search, ChevronRight } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getTopVehicles, getAllMakes, getVehiclesByMake } from '@/data/makes-models';
import { generateFAQSchema, getBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Windshield Replacement by Vehicle | Denver Auto Glass Pricing | Pink Auto Glass',
  description: 'Get exact windshield replacement pricing for your vehicle. OEM glass, ADAS calibration included free. Serving all makes and models in Denver metro. Professional Service.',
  keywords: 'windshield replacement by vehicle, auto glass pricing by car, vehicle windshield cost, adas calibration by make model',
  openGraph: {
    title: 'Windshield Replacement Pricing by Vehicle | Pink Auto Glass',
    description: 'Find exact pricing for your vehicle make and model. ADAS calibration included free.',
    url: 'https://pinkautoglass.com/vehicles',
    type: 'website',
  },
};

export default function VehiclesPage() {
  const topVehicles = getTopVehicles(12);
  const allMakes = getAllMakes();

  // Get count of vehicles per make
  const makesCounts = allMakes.map(make => ({
    make,
    count: getVehiclesByMake(make).length,
    slug: make.toLowerCase()
  }));

  const faqs = [
    {
      question: 'Why does windshield replacement cost vary by vehicle?',
      answer: 'Windshield prices vary based on several factors: glass size (SUVs cost more than compact cars), features like rain sensors or heads-up displays, ADAS camera integration, and whether OEM glass is required. Luxury vehicles and newer models with advanced safety systems typically cost more due to specialized glass and calibration requirements.'
    },
    {
      question: 'What is ADAS and which vehicles need it?',
      answer: 'ADAS (Advanced Driver Assistance Systems) includes features like lane departure warning, automatic emergency braking, and adaptive cruise control. Most vehicles from 2018 and newer have ADAS cameras mounted on or near the windshield that require recalibration after replacement. We include ADAS calibration free with every replacement - other shops charge Competitive Pricing extra.'
    },
    {
      question: 'Should I use OEM or aftermarket glass for my vehicle?',
      answer: 'We recommend OEM glass for all vehicles, especially those with ADAS (2018+). OEM glass ensures perfect fit, optical clarity, and proper ADAS function. For older vehicles without advanced features, high-quality aftermarket glass can save money while meeting safety standards. We\'ll recommend the best option for your specific vehicle and budget.'
    },
    {
      question: 'Do you service all vehicle makes and models?',
      answer: 'Yes! We service all major makes and models including domestic, foreign, luxury, and electric vehicles. Our technicians are trained on manufacturer-specific requirements for Toyota, Honda, Subaru, Ford, Chevrolet, Tesla, and many more. If you don\'t see your vehicle listed, call us - we can source glass for any vehicle.'
    },
    {
      question: 'How do I get an exact quote for my specific vehicle?',
      answer: 'Click on your vehicle make and model on this page for detailed pricing. For the most accurate quote, call us at (720) 918-7465 or book online with your vehicle year, make, model, and trim level. We\'ll provide an exact price including any ADAS calibration needed.'
    },
    {
      question: 'What if my vehicle has special features like rain sensors or HUD?',
      answer: 'We handle all special features including rain sensors, heads-up displays (HUD), heated glass, and acoustic windshields. These features may affect glass cost, but we include proper installation and programming at no extra labor charge. Our quote will reflect any premium features your vehicle has.'
    }
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Vehicles', url: 'https://pinkautoglass.com/vehicles' }
  ]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": allMakes.map((make, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Brand",
        "name": make,
        "url": `https://pinkautoglass.com/vehicles/brands/${make.toLowerCase()}`
      }
    }))
  };

  const combinedSchema = combineSchemas(itemListSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 page-top-padding">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Car className="w-12 h-12 mr-3" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  Find Your Vehicle's Windshield Replacement Cost
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                Get exact pricing for your make and model • OEM quality glass • ADAS calibration included free • Professional Service
              </p>
              <CTAButtons source="vehicles-hub-hero" />
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
          <Breadcrumbs items={[{ label: 'Vehicles', href: '/vehicles' }]} />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Intro Section */}
          <section className="mb-16 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Why Vehicle-Specific Windshield Service Matters
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              Not all windshields are created equal. Your vehicle's windshield is engineered specifically for your make and model, with precise specifications for fit, features, and safety systems. Modern vehicles (especially 2018 and newer) have Advanced Driver Assistance Systems (ADAS) that rely on cameras and sensors mounted on the windshield.
            </p>
            <p className="text-lg text-gray-700">
              Choosing the right glass and ensuring proper ADAS calibration is critical for your safety. That's why we provide vehicle-specific information, pricing, and service recommendations tailored to your exact vehicle.
            </p>
          </section>

          {/* Popular Vehicles */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Popular Vehicles in Denver
              </h2>
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-lg text-gray-700 mb-8">
              Click on your vehicle below for detailed pricing, ADAS information, and model-specific service details:
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topVehicles.map((vehicle) => (
                <Link
                  key={vehicle.slug}
                  href={`/vehicles/${vehicle.slug}`}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-blue-400"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">{vehicle.make}</div>
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {vehicle.model}
                        </h3>
                      </div>
                      <Car className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>

                    <div className="mb-4">
                      <div className="text-3xl font-bold text-blue-600">
                        ${vehicle.avgReplacementPrice}
                      </div>
                      <div className="text-sm text-gray-600">Typical windshield replacement</div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        <span>{vehicle.glassType === 'OEM' ? 'OEM Glass Required' : 'OEM Quality Glass'}</span>
                      </div>
                      {vehicle.hasADAS && (
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          <span className="font-semibold text-green-700">ADAS Calibration Included Free</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        <span>Lifetime Warranty</span>
                      </div>
                    </div>

                    <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Browse by Make */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Browse by Vehicle Make
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Select your vehicle brand to see all available models with pricing and specifications:
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {makesCounts.map((makeData) => (
                <Link
                  key={makeData.make}
                  href={`/vehicles/brands/${makeData.slug}`}
                  className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-blue-400 p-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {makeData.make}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-gray-600">
                    {makeData.count} {makeData.count === 1 ? 'model' : 'models'} available
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* ADAS Education */}
          <section className="mb-16">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 md:p-12 border-2 border-yellow-300">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    What is ADAS Calibration?
                  </h2>
                  <p className="text-lg text-gray-700 mb-4">
                    Advanced Driver Assistance Systems (ADAS) are safety features in modern vehicles that rely on cameras and sensors mounted on or near your windshield. After windshield replacement, these systems must be recalibrated to work correctly.
                  </p>
                  <p className="text-lg text-gray-700 mb-6">
                    <strong>Most vehicles from 2018 and newer require ADAS calibration.</strong> Other shops charge Competitive Pricing for this service. We include it free with every replacement.
                  </p>
                  <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                    <p className="text-sm font-semibold text-green-900">
                      💰 Save Competitive Pricing - ADAS calibration included free with our windshield replacement!
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="font-bold text-gray-900 mb-4">ADAS Systems We Calibrate:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">Lane Departure Warning</div>
                        <div className="text-sm text-gray-600">Alerts when drifting out of lane</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">Automatic Emergency Braking</div>
                        <div className="text-sm text-gray-600">Prevents front-end collisions</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">Adaptive Cruise Control</div>
                        <div className="text-sm text-gray-600">Maintains safe following distance</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">Lane Keep Assist</div>
                        <div className="text-sm text-gray-600">Helps steer to stay in lane</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">Heads-Up Display (HUD)</div>
                        <div className="text-sm text-gray-600">Projects info onto windshield</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Why Vehicle-Specific Service */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Why We Provide Vehicle-Specific Information
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-500">
                <DollarSign className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Accurate Pricing</h3>
                <p className="text-gray-700">
                  Windshield costs vary significantly by vehicle. A Honda Civic costs less than a Ford F-150. ADAS-equipped vehicles need calibration. We give you exact pricing upfront—no surprises.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-purple-500">
                <Shield className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Safety Compliance</h3>
                <p className="text-gray-700">
                  Modern vehicles have specific glass and calibration requirements. Using wrong glass or skipping calibration can disable safety features. We ensure your vehicle meets manufacturer specs.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-green-500">
                <Wrench className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Service</h3>
                <p className="text-gray-700">
                  Our technicians are trained on manufacturer-specific requirements for Toyota, Honda, Subaru, Ford, and more. We know the unique needs of your vehicle and service it correctly.
                </p>
              </div>
            </div>
          </section>

          {/* Service Comparison by Vehicle Type */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Typical Pricing by Vehicle Type
            </h2>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Vehicle Type</th>
                      <th className="px-6 py-4 text-left font-semibold">Examples</th>
                      <th className="px-6 py-4 text-left font-semibold">Typical Cost</th>
                      <th className="px-6 py-4 text-left font-semibold">ADAS Common?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Compact Sedan</td>
                      <td className="px-6 py-4 text-gray-700">Honda Civic, Toyota Corolla</td>
                      <td className="px-6 py-4 text-green-600 font-bold">Contact for Quote</td>
                      <td className="px-6 py-4 text-gray-700">2018+ models</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Mid-Size Sedan</td>
                      <td className="px-6 py-4 text-gray-700">Honda Accord, Toyota Camry</td>
                      <td className="px-6 py-4 text-green-600 font-bold">Contact for Quote</td>
                      <td className="px-6 py-4 text-gray-700">2018+ standard</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Compact SUV</td>
                      <td className="px-6 py-4 text-gray-700">Honda CR-V, Toyota RAV4</td>
                      <td className="px-6 py-4 text-orange-600 font-bold">Contact for Quote</td>
                      <td className="px-6 py-4 text-gray-700">2017+ standard</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Full-Size Truck</td>
                      <td className="px-6 py-4 text-gray-700">Ford F-150, Chevy Silverado</td>
                      <td className="px-6 py-4 text-orange-600 font-bold">Contact for Quote</td>
                      <td className="px-6 py-4 text-gray-700">2020+ common</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Luxury/Premium</td>
                      <td className="px-6 py-4 text-gray-700">Tesla, BMW, Mercedes</td>
                      <td className="px-6 py-4 text-red-600 font-bold">Contact for Quote</td>
                      <td className="px-6 py-4 text-gray-700">Nearly all models</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 px-6 py-4 text-sm text-gray-600">
                <strong>Note:</strong> All prices include OEM-quality glass, professional installation, mobile service, and ADAS calibration (if required). Lifetime warranty on all work.
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Vehicle-Specific Service Questions
            </h2>
            <div className="max-w-4xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group">
                  <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                    {faq.question}
                    <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-gray-700 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Related Services */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                All Services Available for Your Vehicle
              </h2>
              <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                No matter what vehicle you drive, we provide complete windshield services with expert care.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/services/windshield-replacement"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Windshield Replacement
                </Link>
                <Link
                  href="/services/windshield-repair"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Windshield Repair
                </Link>
                <Link
                  href="/services/adas-calibration"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  ADAS Calibration
                </Link>
                <Link
                  href="/services"
                  className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  View All Services
                </Link>
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Find Exact Pricing for Your Vehicle
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Browse by make and model above or call for instant pricing. ADAS calibration included free.
            </p>
            <CTAButtons source="vehicles-hub-bottom" />
          </section>
        </div>
      </div>
    </>
  );
}
