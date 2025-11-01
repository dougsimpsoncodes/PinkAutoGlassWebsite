import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Phone, CheckCircle, Shield, Clock, Wrench, DollarSign } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { vehiclesData, getVehicleBySlug, getAllVehicleSlugs } from '@/data/makes-models';
import { generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

// Generate static params for all vehicles
export async function generateStaticParams() {
  const slugs = getAllVehicleSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

// Generate metadata for each vehicle page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const vehicle = getVehicleBySlug(params.slug);

  if (!vehicle) {
    return {
      title: 'Vehicle Not Found | Pink Auto Glass',
    };
  }

  return {
    title: `${vehicle.make} ${vehicle.model} Windshield Replacement Denver | Pink Auto Glass`,
    description: `Professional ${vehicle.make} ${vehicle.model} windshield replacement in Denver. ${vehicle.hasADAS ? 'ADAS calibration available.' : ''} OEM-quality glass, same-day service, lifetime warranty. Mobile service available. Call (720) 918-7465.`,
    keywords: `${vehicle.make} ${vehicle.model} windshield replacement, ${vehicle.make} ${vehicle.model} auto glass, ${vehicle.make} ${vehicle.model} windshield repair denver`,
    alternates: {
      canonical: `https://pinkautoglass.com/vehicles/${vehicle.slug}`,
    },
    openGraph: {
      title: `${vehicle.make} ${vehicle.model} Windshield Replacement | Pink Auto Glass`,
      description: `Professional windshield replacement for your ${vehicle.make} ${vehicle.model}. OEM-quality glass, mobile service, lifetime warranty.`,
      url: `https://pinkautoglass.com/vehicles/${vehicle.slug}`,
      type: 'website',
    },
  };
}

export default function VehiclePage({ params }: { params: { slug: string } }) {
  const vehicle = getVehicleBySlug(params.slug);

  if (!vehicle) {
    notFound();
  }

  const faqs = [
    {
      question: `How do I get a quote for a ${vehicle.make} ${vehicle.model} windshield replacement?`,
      answer: `Get a fast, accurate quote online or by phone. Your exact quote depends on year/trim, glass type, and ${vehicle.hasADAS ? 'ADAS calibration requirements.' : 'whether your vehicle includes cameras/sensors.'} We handle insurance verification and can often schedule same-day mobile service.`
    },
    {
      question: `Do I need ADAS calibration for my ${vehicle.make} ${vehicle.model}?`,
      answer: vehicle.hasADAS
        ? `Yes! ${vehicle.make} ${vehicle.model} models from ${vehicle.adasYearStart || 2018} and newer come equipped with ADAS (Advanced Driver Assistance Systems) that require calibration after windshield replacement. This includes features like lane departure warning, automatic emergency braking, and adaptive cruise control. ADAS calibration available with every ${vehicle.make} ${vehicle.model} windshield replacement - other shops charge Competitive Pricing extra for this service.`
        : `Most ${vehicle.make} ${vehicle.model} models do not require ADAS calibration unless they have optional advanced safety packages. We'll inspect your vehicle and let you know if calibration is needed.`
    },
    {
      question: `Should I use OEM or aftermarket glass for my ${vehicle.make} ${vehicle.model}?`,
      answer: vehicle.glassType === 'OEM'
        ? `We strongly recommend OEM glass for your ${vehicle.make} ${vehicle.model}. ${vehicle.hasADAS ? 'ADAS-equipped vehicles require precise glass specifications to function correctly.' : 'OEM glass ensures perfect fit, optical clarity, and maintains your vehicle\'s value.'} The slight price difference is worth the peace of mind.`
        : vehicle.glassType === 'OEM-Preferred'
        ? `We recommend OEM glass for your ${vehicle.make} ${vehicle.model}, especially for models ${vehicle.hasADAS ? 'with ADAS features' : 'newer than 2015'}. However, high-quality aftermarket glass is also available and can save you money while maintaining safety standards.`
        : `For your ${vehicle.make} ${vehicle.model}, high-quality aftermarket glass is a cost-effective option that meets all safety standards. OEM glass is also available if you prefer factory specifications.`
    },
    {
      question: `How long does ${vehicle.make} ${vehicle.model} windshield replacement take?`,
      answer: `Replacing a ${vehicle.make} ${vehicle.model} windshield takes approximately ${vehicle.hasADAS ? '90-120 minutes' : '60-90 minutes'}, including ${vehicle.hasADAS ? 'ADAS calibration and ' : ''}proper cure time. We recommend waiting at least 1 hour before driving. Our mobile service brings everything to your location - you don't even need to leave home or work.`
    },
    {
      question: `Common windshield issues with ${vehicle.make} ${vehicle.model}?`,
      answer: vehicle.commonIssues
        ? `Common issues we see with ${vehicle.make} ${vehicle.model} windshields include: ${vehicle.commonIssues.join('; ')}. Our technicians are experienced with these specific ${vehicle.make} concerns and ensure proper installation.`
        : `Like most vehicles, ${vehicle.make} ${vehicle.model} windshields are susceptible to rock chips from highway driving and cracks from temperature changes. We recommend repairing chips promptly before they spread into larger cracks.`
    }
  ];

  const serviceSchema = generateServiceSchema({
    serviceName: `${vehicle.make} ${vehicle.model} Windshield Replacement`,
    description: `Professional windshield replacement service for ${vehicle.make} ${vehicle.model} in Denver metro area. OEM-quality glass, mobile service, ${vehicle.hasADAS ? 'ADAS calibration available.' : 'professional installation.'}`,
    serviceType: 'Auto Glass Replacement',
    areaServed: ['Denver', 'Aurora', 'Lakewood']
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Vehicles', url: 'https://pinkautoglass.com/vehicles' },
    { name: `${vehicle.make} ${vehicle.model}`, url: `https://pinkautoglass.com/vehicles/${vehicle.slug}` }
  ]);

  const combinedSchema = combineSchemas(serviceSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="text-sm font-semibold mb-2 text-blue-200">VEHICLE-SPECIFIC SERVICE</div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {vehicle.make} {vehicle.model} Windshield Replacement
              </h1>
              {/* Pricing intentionally not displayed per site policy */}
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                {vehicle.glassType === 'OEM' ? 'OEM Glass Required' : 'OEM Quality Glass'} •
                {vehicle.hasADAS ? ' ADAS Calibration Included' : ' Professional Installation'} •
                Lifetime Warranty
              </p>
              <CTAButtons source={`vehicle-${vehicle.slug}-hero`} />
            </div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs
            items={[
              { label: 'Vehicles', href: '/vehicles' },
              { label: `${vehicle.make} ${vehicle.model}`, href: `/vehicles/${vehicle.slug}` }
            ]}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-10">

              {/* Why This Matters */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why {vehicle.make} {vehicle.model} Windshield Replacement Requires Expertise
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Your {vehicle.make} {vehicle.model} deserves specialized care. {vehicle.hasADAS ? `Models from ${vehicle.adasYearStart || 2018} forward come equipped with advanced safety systems that rely on precise windshield placement and calibration. A generic replacement can compromise these life-saving features.` : `While modern windshields may look simple, proper installation ensures your vehicle\'s structural integrity and safety in a collision.`}
                </p>

                <AboveFoldCTA location={`vehicle-${vehicle.slug}`} />

                <p className="text-sm text-gray-600 mb-6 flex flex-wrap gap-2">
                  <span className="font-medium">Also serving:</span>
                  <Link href="/locations/aurora-co" className="text-pink-600 hover:underline">Aurora</Link>
                  <span>•</span>
                  <Link href="/locations/lakewood-co" className="text-pink-600 hover:underline">Lakewood</Link>
                  <span>•</span>
                  <Link href="/locations/boulder-co" className="text-pink-600 hover:underline">Boulder</Link>
                  <span>•</span>
                  <Link href="/locations/highlands-ranch-co" className="text-pink-600 hover:underline">Highlands Ranch</Link>
                </p>
                {vehicle.notes && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="text-gray-700">
                      <strong>Important:</strong> {vehicle.notes}
                    </p>
                  </div>
                )}
              </section>

              {/* Pricing section removed per site policy */}

              {/* Model-Specific Info */}
              {vehicle.commonIssues && vehicle.commonIssues.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Common {vehicle.make} {vehicle.model} Windshield Issues
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {vehicle.commonIssues.map((issue, idx) => (
                      <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                        <p className="text-gray-700">{issue}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-700 mt-4">
                    Our technicians are trained on {vehicle.make}-specific requirements and ensure your {vehicle.model} windshield is installed to factory specifications.
                  </p>
                </section>
              )}

              {/* Process */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Our {vehicle.make} {vehicle.model} Replacement Process
                </h2>
                <div className="space-y-3">
                  {[
                    `Verify correct windshield part number for your ${vehicle.make} ${vehicle.model} year and trim`,
                    'Remove damaged windshield and clean frame',
                    `Install ${vehicle.glassType === 'OEM' ? 'OEM' : 'OEM-quality'} glass with premium urethane adhesive`,
                    vehicle.hasADAS ? `Calibrate ADAS cameras and sensors to ${vehicle.make} specifications` : 'Test for proper seal and fit',
                    'Quality inspection and 1-hour cure time'
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                        {idx + 1}
                      </div>
                      <p className="text-gray-700 pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQs */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {vehicle.make} {vehicle.model} Windshield FAQs
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                      <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                        {faq.question}
                        <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Replace Your {vehicle.make} {vehicle.model} Windshield?
                </h2>
                <p className="text-xl mb-6 text-blue-100">
                  Expert installation for your {vehicle.make}. Same-day service available.
                </p>
                <CTAButtons source={`vehicle-${vehicle.slug}-cta`} />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Quote */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-xl p-6">
                  <h3 className="text-2xl font-bold mb-2">${vehicle.avgReplacementPrice}</h3>
                  <p className="text-green-100 mb-4">
                    Typical price for {vehicle.make} {vehicle.model}
                  </p>
                  <a
                    href="tel:+17209187465"
                    className="flex items-center justify-center w-full bg-white text-green-700 py-3 px-4 rounded-lg font-bold hover:bg-green-50 transition-colors"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call for Exact Quote
                  </a>
                  <Link
                    href="/book"
                    className="flex items-center justify-center w-full bg-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-800 transition-colors mt-3"
                  >
                    Book Online
                  </Link>
                </div>

                {/* Why Choose Us */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Why Choose Us?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Shield className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Lifetime warranty</strong> on all work</span>
                    </li>
                    <li className="flex items-start">
                      <Wrench className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>{vehicle.make}-certified</strong> technicians</span>
                    </li>
                    <li className="flex items-start">
                      <Clock className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Same-day service</strong> available</span>
                    </li>
                    {vehicle.hasADAS && (
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700"><strong>Professional ADAS calibration</strong> included</span>
                      </li>
                    )}
                    <li className="flex items-start">
                      <DollarSign className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Insurance claims</strong> handled</span>
                    </li>
                  </ul>
                </div>

                {/* Other Honda Models */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Other {vehicle.make} Models
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {vehiclesData
                      .filter(v => v.make === vehicle.make && v.slug !== vehicle.slug)
                      .slice(0, 5)
                      .map(v => (
                        <li key={v.slug}>
                          <Link href={`/vehicles/${v.slug}`} className="text-blue-600 hover:underline">
                            {v.make} {v.model} →
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Service Links */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Our Services</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/services/windshield-replacement" className="text-blue-600 hover:underline">
                        Windshield Replacement →
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/windshield-repair" className="text-blue-600 hover:underline">
                        Windshield Repair →
                      </Link>
                    </li>
                    {vehicle.hasADAS && (
                      <li>
                        <Link href="/services/adas-calibration" className="text-blue-600 hover:underline">
                          ADAS Calibration →
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link href="/services/mobile-service" className="text-blue-600 hover:underline">
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
