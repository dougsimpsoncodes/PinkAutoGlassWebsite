import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, Clock, CheckCircle, Car, Star, Shield } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateFAQSchema, getBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Mobile Windshield Service Locations Colorado | Pink Auto Glass',
  description: 'Mobile windshield repair and replacement throughout Colorado. Serving Denver, Aurora, Boulder, Lakewood and 10+ metro cities. We come to you - no extra charge. Call (720) 918-7465.',
  keywords: 'windshield repair locations colorado, mobile auto glass denver metro, windshield replacement near me, auto glass service areas colorado',
  openGraph: {
    title: 'Mobile Windshield Service Locations Colorado | Pink Auto Glass',
    description: 'We come to you anywhere in Denver metro. Mobile windshield service with no extra charge.',
    url: 'https://pinkautoglass.com/locations',
    type: 'website',
  },
};

export default function LocationsPage() {
  const locations = [
    {
      name: 'Denver',
      slug: 'denver-co',
      description: 'Colorado\'s capital and largest city',
      neighborhoods: '24+ neighborhoods',
      responseTime: 'Same-day',
      popular: true
    },
    {
      name: 'Aurora',
      slug: 'aurora-co',
      description: 'Colorado\'s 3rd largest city',
      neighborhoods: '15+ neighborhoods',
      responseTime: 'Same-day'
    },
    {
      name: 'Lakewood',
      slug: 'lakewood-co',
      description: 'West Denver metro',
      neighborhoods: '12+ neighborhoods',
      responseTime: 'Same-day'
    },
    {
      name: 'Boulder',
      slug: 'boulder-co',
      description: 'University city north of Denver',
      neighborhoods: '10+ neighborhoods',
      responseTime: 'Same-day'
    },
    {
      name: 'Highlands Ranch',
      slug: 'highlands-ranch-co',
      description: 'South metro community',
      neighborhoods: '8+ neighborhoods',
      responseTime: 'Same-day'
    },
    {
      name: 'Thornton',
      slug: 'thornton-co',
      description: 'North Denver metro',
      neighborhoods: '10+ neighborhoods',
      responseTime: 'Same-day'
    },
    {
      name: 'Arvada',
      slug: 'arvada-co',
      description: 'Northwest Denver suburb',
      neighborhoods: '10+ neighborhoods',
      responseTime: 'Same-day'
    },
    {
      name: 'Westminster',
      slug: 'westminster-co',
      description: 'North-central metro area',
      neighborhoods: '10+ neighborhoods',
      responseTime: 'Same-day'
    },
    {
      name: 'Parker',
      slug: 'parker-co',
      description: 'Southeast Denver metro',
      neighborhoods: '8+ neighborhoods',
      responseTime: 'Same-day'
    },
    {
      name: 'Centennial',
      slug: 'centennial-co',
      description: 'South-central metro area',
      neighborhoods: '10+ neighborhoods',
      responseTime: 'Same-day'
    },
  ];

  const faqs = [
    {
      question: 'How far will you travel for mobile service?',
      answer: 'We provide mobile service throughout the entire Denver metro area including Denver, Aurora, Lakewood, Boulder, Arvada, Thornton, Westminster, Highlands Ranch, Parker, Centennial, and surrounding communities. If you\'re within our service area, there\'s no extra charge for mobile service. Call us to confirm coverage in your specific location.'
    },
    {
      question: 'Do you charge extra for mobile service?',
      answer: 'No! Mobile service is included at no extra charge throughout our entire Denver metro service area. Whether we come to your home, office, or parking lot, you pay the same price as you would at a shop location.'
    },
    {
      question: 'Can you come to me if I\'m outside the Denver metro?',
      answer: 'We primarily serve the Denver metro area and surrounding communities. For locations outside our standard service area, please call us at (720) 918-7465 to discuss. We may be able to accommodate your location or recommend a trusted partner in your area.'
    },
    {
      question: 'How quickly can you get to my location?',
      answer: 'Most appointments are available same-day throughout our service area. Response times vary by location and current demand, but we typically arrive within 2-4 hours of your call. For urgent situations, we can often accommodate faster service.'
    },
    {
      question: 'What if I\'m not sure which city I\'m in?',
      answer: 'No problem! Just provide us with your address and we\'ll confirm whether you\'re in our service area. We serve all of the greater Denver metro region, so if you\'re anywhere in the area, we can likely help you.'
    },
    {
      question: 'Can you perform mobile ADAS calibration?',
      answer: 'Yes! Our mobile units are equipped with the same ADAS calibration equipment we use for in-shop service. We can perform complete windshield replacement with ADAS calibration at your location for vehicles that require it (typically 2018 and newer).'
    }
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Locations', url: 'https://pinkautoglass.com/locations' }
  ]);

  const combinedSchema = combineSchemas(faqSchema, breadcrumbSchema);

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 page-top-padding">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <MapPin className="w-12 h-12 mr-3" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  Mobile Windshield Service Throughout Colorado
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                We come to you anywhere in the Denver metro area • Same-day appointments • No extra charge for mobile service
              </p>
              <CTAButtons source="locations-hub-hero" />
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
          <Breadcrumbs items={[{ label: 'Locations', href: '/locations' }]} />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Intro Section */}
          <section className="mb-16 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Professional Windshield Service Across Denver Metro
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              Pink Auto Glass brings expert windshield repair and replacement directly to you. Our fully equipped mobile units serve 10+ cities throughout the Denver metro area, providing the same quality service you'd receive at a shop—right at your home, office, or any convenient location.
            </p>
            <p className="text-lg text-gray-700">
              Whether you're in downtown Denver, the suburbs of Aurora, or anywhere in between, we come to you with OEM-quality glass, certified technicians, and all the equipment needed for windshield replacement and ADAS calibration.
            </p>
          </section>

          {/* Coverage Map Visual */}
          <section className="mb-16">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Service Coverage Area</h2>
                <p className="text-lg text-gray-700">
                  Serving the entire Denver metro area and surrounding communities
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Coverage Stats */}
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <div className="flex items-center mb-2">
                      <MapPin className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <div className="text-3xl font-bold text-gray-900">10+</div>
                        <div className="text-gray-600">Cities Served</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <div className="flex items-center mb-2">
                      <Car className="w-8 h-8 text-purple-600 mr-3" />
                      <div>
                        <div className="text-3xl font-bold text-gray-900">100+</div>
                        <div className="text-gray-600">Neighborhoods</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <div className="flex items-center mb-2">
                      <Clock className="w-8 h-8 text-green-600 mr-3" />
                      <div>
                        <div className="text-3xl font-bold text-gray-900">Same-Day</div>
                        <div className="text-gray-600">Service Available</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coverage Features */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">What Sets Our Mobile Service Apart</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700"><strong>No Extra Charge</strong> - Mobile service included at no additional cost</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700"><strong>Fully Equipped</strong> - Complete glass inventory and ADAS calibration equipment</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700"><strong>Flexible Scheduling</strong> - Work around your schedule, not ours</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700"><strong>Same Quality</strong> - Identical service and warranty as in-shop work</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700"><strong>Safe Locations</strong> - We work wherever you have a safe, level parking space</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Cities Grid */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Choose Your City for Local Information
            </h2>
            <p className="text-lg text-gray-700 mb-8 text-center max-w-3xl mx-auto">
              Click on your city below for neighborhood-specific coverage, local customer testimonials, and city-specific service information.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location) => (
                <Link
                  key={location.slug}
                  href={`/locations/${location.slug}`}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-pink-400 overflow-hidden"
                >
                  <div className={`p-6 ${location.popular ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'} text-white`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold">{location.name}</h3>
                      <MapPin className="w-6 h-6" />
                    </div>
                    <p className="text-sm opacity-90">{location.description}</p>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{location.neighborhoods} covered</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{location.responseTime} service</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Car className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Mobile service available</span>
                      </div>
                    </div>

                    <div className="flex items-center text-pink-600 font-semibold group-hover:text-pink-700">
                      View {location.name} Details
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Mobile Service Process */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                How Mobile Service Works
              </h2>

              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-pink-600" />
                  </div>
                  <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">1</div>
                  <h3 className="font-bold text-gray-900 mb-2">Call or Book Online</h3>
                  <p className="text-sm text-gray-600">
                    Schedule your service at a time and location that works for you
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">2</div>
                  <h3 className="font-bold text-gray-900 mb-2">We Come to You</h3>
                  <p className="text-sm text-gray-600">
                    Our mobile unit arrives with everything needed for your service
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">3</div>
                  <h3 className="font-bold text-gray-900 mb-2">Expert Service</h3>
                  <p className="text-sm text-gray-600">
                    Certified technicians complete your service on-site in 60-90 minutes
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">4</div>
                  <h3 className="font-bold text-gray-900 mb-2">You're Done</h3>
                  <p className="text-sm text-gray-600">
                    Drive away with a new windshield and lifetime warranty
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Service Highlights */}
          <section className="mb-16">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-8 border-2 border-pink-200">
                <Shield className="w-12 h-12 text-pink-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Same Quality, Any Location</h3>
                <p className="text-gray-700">
                  Our mobile service uses the exact same OEM-quality glass, equipment, and certified technicians as in-shop service. You get our lifetime warranty no matter where we work on your vehicle.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-blue-200">
                <Clock className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Scheduling</h3>
                <p className="text-gray-700">
                  Available 7 days a week with same-day appointments throughout our service area. We work around your schedule—early morning, evening, or weekend appointments available.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border-2 border-green-200">
                <Car className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Full ADAS Capability</h3>
                <p className="text-gray-700">
                  Our mobile units are equipped with ADAS calibration equipment. We can perform complete windshield replacement with calibration at your location—no shop visit needed.
                </p>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              What Our Customers Say About Mobile Service
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Sarah M.',
                  location: 'Cherry Creek, Denver',
                  text: 'They came to my office downtown and replaced my windshield while I worked. Professional, fast, and the quality is perfect. Highly recommend!',
                  rating: 5
                },
                {
                  name: 'Mike D.',
                  location: 'Green Valley Ranch, Aurora',
                  text: 'Mobile service was perfect for my busy schedule. They came to my home and I didn\'t have to miss any work time. Same quality as a shop.',
                  rating: 5
                },
                {
                  name: 'Jessica R.',
                  location: 'Highlands, Denver',
                  text: 'I was skeptical about mobile service, but they brought everything needed and did an amazing job. ADAS calibration included—saved me a trip to the dealership!',
                  rating: 5
                }
              ].map((review, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <div className="flex text-yellow-400 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    <p className="text-sm text-gray-600">{review.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Mobile Service Questions
            </h2>
            <div className="max-w-4xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group">
                  <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center">
                    {faq.question}
                    <span className="text-pink-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-gray-700 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Services CTA */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                All Services Available at Your Location
              </h2>
              <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                Whether you need windshield repair, replacement, or ADAS calibration, we bring complete service to you.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/services/windshield-replacement"
                  className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                >
                  Windshield Replacement
                </Link>
                <Link
                  href="/services/windshield-repair"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Schedule Mobile Service?
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Same-day appointments available throughout Denver metro. We come to you—no extra charge.
            </p>
            <CTAButtons source="locations-hub-bottom" />
            <p className="mt-6 text-sm text-blue-100">
              Serving Denver, Aurora, Lakewood, Boulder, and 6+ more metro cities
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
