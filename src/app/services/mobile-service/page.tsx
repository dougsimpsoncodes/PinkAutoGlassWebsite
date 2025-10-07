import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MessageSquare, Calendar, CheckCircle, MapPin, Wrench } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';
import TrustSignals from '@/components/TrustSignals';
import Breadcrumbs from '@/components/Breadcrumbs';
import AboveFoldCTA from '@/components/AboveFoldCTA';
import { generateServiceSchema, generateFAQSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Mobile Windshield Service Denver - We Come To You',
  description: 'Professional mobile auto glass service in Denver metro. We come to your home, office, or anywhere. Fully equipped vans. Same-day service. No extra charge. Call (720) 918-7465.',
  keywords: 'mobile windshield service denver, mobile auto glass, windshield replacement at home, mobile glass repair denver',
  openGraph: {
    title: 'Mobile Windshield Service Denver | Pink Auto Glass',
    description: 'Mobile windshield repair and replacement. We come to you. No extra charge for mobile service.',
    url: 'https://pinkautoglass.com/services/mobile-service',
    type: 'website',
  },
};

export default function MobileServicePage() {
  const faqs = [
    {
      question: 'Is there an extra charge for mobile service?',
      answer: 'No! Mobile service is included at no additional cost within the Denver metro area. Our prices are the same whether you come to us or we come to you. We believe convenience shouldn\'t cost extra. Our service area includes Denver, Aurora, Lakewood, Boulder, Highlands Ranch, Thornton, Arvada, Westminster, Parker, and Centennial.'
    },
    {
      question: 'How does mobile windshield service work?',
      answer: 'It\'s simple: Call or book online, tell us your location (home, office, parking lot, anywhere), and choose a time. Our technician arrives in a fully equipped mobile unit with all tools and your windshield. We complete the repair or replacement on-site while you work, relax at home, or run errands. The entire process takes 60-90 minutes, and we clean up completely before we leave.'
    },
  ];

  const serviceSchema = generateServiceSchema({
    serviceName: 'Mobile Windshield Service',
    description: 'Mobile windshield repair and replacement service in Denver metro area. We come to your location with fully equipped mobile units. No extra charge for mobile service.',
    priceRange: '89-500',
    serviceType: 'Mobile Auto Glass Service',
    areaServed: ['Denver Metropolitan Area']
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://pinkautoglass.com' },
    { name: 'Services', url: 'https://pinkautoglass.com/services' },
    { name: 'Mobile Service', url: 'https://pinkautoglass.com/services/mobile-service' }
  ]);

  const combinedSchema = combineSchemas(serviceSchema, faqSchema, breadcrumbSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 pt-16 md:pt-20">
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 mr-2" />
                <span className="text-xl">We Come To You</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Mobile Windshield Repair & Replacement in Denver
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Home • Office • Anywhere • No Extra Charge • Same-Day Available
              </p>
              <CTAButtons source="mobile-service" />
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
              { label: 'Mobile Service', href: '/services/mobile-service' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Leave Home When We Can Come to You?
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Your time is valuable. Why waste hours driving to a shop, waiting in a lobby, and arranging rides? With Pink Auto Glass mobile service, our certified technicians bring the shop to you. Whether you're at home in Denver, at your office in downtown, or even at a park with the kids, we'll come to your location.
                </p>

                <AboveFoldCTA location="service-mobile" />

                <p className="text-lg text-gray-700 mb-4">
                  Our mobile units are fully equipped with professional tools, OEM-quality glass, and everything needed for repair or replacement. We maintain the same high standards as a shop - just at your convenience.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Where We Provide Mobile Service
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: '🏠', title: 'Your Home', desc: 'Work from home? We\'ll come to your driveway or street. You can stay inside while we work.' },
                    { icon: '🏢', title: 'Your Office', desc: 'At work? We\'ll service your vehicle in the parking lot. No need to take time off.' },
                    { icon: '🅿️', title: 'Public Parking', desc: 'At the gym, shopping, or at a restaurant? We can meet you anywhere with safe parking.' },
                    { icon: '⛰️', title: 'Recreational Areas', desc: 'Enjoying the outdoors? We serve Chatfield, Cherry Creek, Bear Creek Lake, and more.' }
                  ].map((location, idx) => (
                    <div key={idx} className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="text-4xl mb-3">{location.icon}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{location.title}</h3>
                      <p className="text-gray-700">{location.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  How Mobile Service Works - It's Easy
                </h2>
                <div className="space-y-4">
                  {[
                    { num: 1, title: 'Book Your Appointment', desc: 'Call, text, or book online. Tell us where you\'ll be and when works best for you.' },
                    { num: 2, title: 'We Come to You', desc: 'Our technician arrives in a fully equipped mobile unit at your specified location.' },
                    { num: 3, title: 'Professional Service', desc: 'We perform the repair or replacement on-site using the same process and quality as a shop.' },
                    { num: 4, title: 'You Stay Productive', desc: 'Continue working, stay at home with family, or run errands - no waiting in a lobby.' },
                    { num: 5, title: 'Complete & Clean', desc: 'We finish in 60-90 minutes, clean up all debris, and test for leaks. You\'re done!' }
                  ].map((step) => (
                    <div key={step.num} className="flex items-start bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
              </section>

              <section className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Mobile Units Are Fully Equipped
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Each mobile service vehicle carries everything needed for professional windshield service:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Professional removal and installation tools',
                    'OEM-quality windshields for all makes/models',
                    'High-grade urethane adhesives',
                    'ADAS calibration equipment',
                    'UV curing lights',
                    'Chip repair resin and injectors',
                    'Protective coverings for your interior',
                    'Cleanup equipment and vacuum'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center bg-white p-3 rounded">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Service Area - Denver Metro
                </h2>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    'Denver', 'Aurora', 'Lakewood', 'Boulder', 'Highlands Ranch',
                    'Thornton', 'Arvada', 'Westminster', 'Parker', 'Centennial',
                    'Littleton', 'Englewood', 'Golden', 'Commerce City'
                  ].map(city => (
                    <div key={city} className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-blue-50 hover:border-blue-300 transition-colors">
                      <span className="text-gray-700 font-medium">{city}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 mt-4 text-center">
                  Don't see your city? <a href="tel:+17209187465" className="text-blue-600 hover:underline font-semibold">Call us</a> - we likely serve your area!
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Popular Vehicles We Service
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { make: 'Toyota', model: 'Camry', slug: 'toyota-camry-windshield-replacement-denver' },
                    { make: 'Honda', model: 'Accord', slug: 'honda-accord-windshield-replacement-denver' },
                    { make: 'Subaru', model: 'Outback', slug: 'subaru-outback-windshield-replacement-denver' },
                    { make: 'Ford', model: 'F-150', slug: 'ford-f150-windshield-replacement-denver' },
                    { make: 'Jeep', model: 'Wrangler', slug: 'jeep-wrangler-windshield-replacement-denver' },
                  ].map(v => (
                    <Link
                      key={v.slug}
                      href={`/vehicles/${v.slug}`}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="font-semibold text-gray-900">{v.make} {v.model}</div>
                      <div className="text-sm text-blue-600">View Pricing →</div>
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
                        <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready for Mobile Service?</h2>
                <p className="text-xl mb-6 text-blue-100">
                  We come to you. No extra charge. Same-day available.
                </p>
                <CTAButtons source="mobile-service" />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Schedule Mobile Service</h3>
                  <div className="space-y-3">
                    <a
                      href="tel:+17209187465"
                      className="flex items-center justify-center w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Call (720) 918-7465
                    </a>
                    <a
                      href="sms:+17209187465"
                      className="flex items-center justify-center w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Text Your Location
                    </a>
                    <Link
                      href="/book"
                      className="flex items-center justify-center w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Book Online
                    </Link>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Mobile Service Benefits</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>No Extra Charge</strong> for mobile service</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Save Time</strong> - no driving, no waiting</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Same Quality</strong> as shop service</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700"><strong>Flexible Scheduling</strong> at your convenience</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Related Services</h3>
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
                    <li>
                      <Link href="/services/adas-calibration" className="text-blue-600 hover:underline">
                        ADAS Calibration →
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
