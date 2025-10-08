import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Car, DollarSign, Shield, Wrench } from 'lucide-react';
import { getAllMakes, getVehiclesByMake, VehicleModel } from '@/data/makes-models';
import Breadcrumbs from '@/components/Breadcrumbs';
import CTAButtons from '@/components/CTAButtons';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateServiceSchema, getBreadcrumbSchema, combineSchemas } from '@/lib/schema';

interface MakePageProps {
  params: {
    make: string;
  };
}

export async function generateStaticParams() {
  const makes = getAllMakes();
  return makes.map((make) => ({
    make: make.toLowerCase(),
  }));
}

export async function generateMetadata({ params }: MakePageProps): Promise<Metadata> {
  const makeName = params.make.charAt(0).toUpperCase() + params.make.slice(1);
  const vehicles = getVehiclesByMake(makeName);

  if (vehicles.length === 0) {
    return {
      title: 'Make Not Found',
    };
  }

  return {
    title: `${makeName} Windshield Replacement Denver | Expert ${makeName} Auto Glass Service`,
    description: `Professional windshield replacement for all ${makeName} models in Denver. OEM glass, ADAS calibration, lifetime warranty. Most insurance claims $0 out of pocket. Call 720-918-7465.`,
    openGraph: {
      title: `${makeName} Windshield Replacement Denver | Pink Auto Glass`,
      description: `Expert auto glass service for all ${makeName} models. Same-day appointments, mobile service available.`,
      type: 'website',
    },
  };
}

export default function MakePage({ params }: MakePageProps) {
  const makeName = params.make.charAt(0).toUpperCase() + params.make.slice(1);
  const vehicles = getVehiclesByMake(makeName);

  if (vehicles.length === 0) {
    notFound();
  }

  // Sort vehicles by popularity rank
  const sortedVehicles = [...vehicles].sort((a, b) => a.popularityRank - b.popularityRank);

  // Check if any models have ADAS
  const hasADASModels = vehicles.some(v => v.hasADAS);

  const breadcrumbItems = [
    { label: 'Vehicles', href: '/vehicles' },
    { label: makeName, href: `/vehicles/brands/${params.make}` }
  ];

  const serviceSchema = generateServiceSchema({
    serviceName: `${makeName} Windshield Replacement`,
    description: `Professional windshield replacement service for all ${makeName} models in the Denver metro area. OEM glass, ADAS calibration, and lifetime warranty included.`,
    serviceType: 'Auto Glass Replacement',
    priceRange: '299-500',
    areaServed: ['Denver', 'Aurora', 'Lakewood', 'Boulder', 'Highlands Ranch']
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Vehicles', url: 'https://pinkautoglass.com/vehicles' },
    { name: makeName, url: `https://pinkautoglass.com/vehicles/brands/${params.make}` }
  ]);

  const combinedSchema = combineSchemas(serviceSchema, breadcrumbSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-pink-600 to-purple-600 text-white py-20">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Car className="w-12 h-12" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  {makeName} Windshield Replacement Denver
                </h1>
              </div>
              <p className="text-xl text-pink-100 mb-8">
                Expert auto glass service for all {makeName} models. OEM glass, ADAS calibration, lifetime warranty.
              </p>
              <CTAButtons source={`make-${params.make}-hero`} />
            </div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 py-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Introduction */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Denver's Trusted {makeName} Auto Glass Specialists
              </h2>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                When your {makeName} needs windshield replacement or repair in Denver, you need experts who understand the unique requirements of your vehicle. Pink Auto Glass specializes in {makeName} windshields, ensuring perfect fit, proper installation, and full safety system functionality.
              </p>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                We service all {makeName} models with {hasADASModels ? 'specialized ADAS calibration equipment for models with advanced safety systems, ' : ''}OEM-quality glass, and a lifetime warranty on our workmanship. Most insurance claims are covered at $0 out of pocket under Colorado law.
              </p>
            </div>

            <AboveFoldCTA location={`make-${params.make}`} />
          </div>
        </section>

        {/* Why Choose Us for Your {makeName} */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why Denver {makeName} Owners Choose Pink Auto Glass
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-pink-600" />
                  <h3 className="text-xl font-bold text-gray-900">OEM-Quality Glass</h3>
                </div>
                <p className="text-gray-700">
                  We use only OEM or OEM-equivalent glass that meets or exceeds {makeName} factory specifications for safety and durability.
                </p>
              </div>

              {hasADASModels && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Wrench className="w-8 h-8 text-pink-600" />
                    <h3 className="text-xl font-bold text-gray-900">{makeName} ADAS Calibration</h3>
                  </div>
                  <p className="text-gray-700">
                    Professional calibration of your {makeName}'s forward collision warning, lane departure, and other safety systems—included at no extra charge.
                  </p>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-8 h-8 text-pink-600" />
                  <h3 className="text-xl font-bold text-gray-900">Insurance Friendly</h3>
                </div>
                <p className="text-gray-700">
                  We work directly with your insurance company. Under Colorado law, most windshield replacements are covered at $0 deductible.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Car className="w-8 h-8 text-pink-600" />
                  <h3 className="text-xl font-bold text-gray-900">Mobile Service Available</h3>
                </div>
                <p className="text-gray-700">
                  We come to you anywhere in the Denver metro area—at no extra charge. Home, office, or roadside service available.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vehicle Models List */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {makeName} Models We Service
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <p className="text-gray-700 mb-6">
                Click on your {makeName} model below for detailed pricing, ADAS information, and model-specific service details:
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedVehicles.map((vehicle) => (
                  <Link
                    key={vehicle.slug}
                    href={`/vehicles/${vehicle.slug}`}
                    className="group bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 hover:border-pink-400 rounded-lg p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Car className="w-5 h-5 text-pink-600" />
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                        {vehicle.model}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Years: {vehicle.years[0]} - {vehicle.years[vehicle.years.length - 1]}
                    </div>
                    <div className="text-sm font-semibold text-pink-600">
                      From ${vehicle.avgReplacementPrice}
                    </div>
                    {vehicle.hasADAS && (
                      <div className="mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full inline-block">
                        ADAS Calibration Included
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Service Process */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Our {makeName} Windshield Replacement Process
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Free Quote & Scheduling</h3>
                    <p className="text-gray-700">
                      Call 720-918-7465, text, or book online. We'll verify your {makeName} model, year, and insurance coverage in minutes.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile or In-Shop Service</h3>
                    <p className="text-gray-700">
                      Choose mobile service (we come to you) or visit our shop. Same-day and next-day appointments available.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Installation</h3>
                    <p className="text-gray-700">
                      Certified technicians remove your old windshield and install OEM-quality glass following {makeName} specifications.
                    </p>
                  </div>
                </li>
                {hasADASModels && (
                  <li className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">ADAS Calibration</h3>
                      <p className="text-gray-700">
                        For {makeName} models with safety systems, we perform federally-required ADAS calibration to restore full functionality.
                      </p>
                    </div>
                  </li>
                )}
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">
                    {hasADASModels ? '5' : '4'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Check & Safe Drive-Away</h3>
                    <p className="text-gray-700">
                      Final inspection, cleanup, and safe-to-drive confirmation. You're back on the road with a lifetime warranty.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Related Services */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Related Services for {makeName} Owners
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/services/windshield-repair"
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 group"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                  Rock Chip Repair
                </h3>
                <p className="text-gray-700">
                  Small chip? Get it repaired fast for just $89 (often free with insurance).
                </p>
              </Link>

              {hasADASModels && (
                <Link
                  href="/services/adas-calibration"
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 group"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                    ADAS Calibration
                  </h3>
                  <p className="text-gray-700">
                    Standalone calibration service for {makeName} safety systems after windshield work.
                  </p>
                </Link>
              )}

              <Link
                href="/services/mobile-service"
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 group"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                  Mobile Auto Glass
                </h3>
                <p className="text-gray-700">
                  We come to your location anywhere in Denver metro—at no extra charge.
                </p>
              </Link>

              <Link
                href="/services/insurance-claims"
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 group"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                  Insurance Claims Help
                </h3>
                <p className="text-gray-700">
                  We handle your insurance claim from start to finish—most claims $0 out of pocket.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Get Your {makeName} Fixed?
            </h2>
            <p className="text-xl text-pink-100 mb-8">
              Same-day service, lifetime warranty, and most insurance claims covered at $0 out of pocket.
            </p>
            <CTAButtons source={`make-${params.make}-bottom`} />
          </div>
        </section>
      </main>
    </>
  );
}
