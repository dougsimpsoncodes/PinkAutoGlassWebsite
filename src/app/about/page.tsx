import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import CTAButtons from '@/components/CTAButtons';

export const metadata: Metadata = {
  title: 'About Us | Pink Auto Glass - Mobile Windshield Repair Colorado',
  description: 'Learn about Pink Auto Glass, Colorado\'s trusted mobile windshield repair and replacement service. We\'re proud supporters of breast cancer awareness.',
  openGraph: {
    title: 'About Pink Auto Glass',
    description: 'Colorado\'s mobile windshield repair experts and breast cancer awareness supporters',
    url: 'https://pinkautoglass.com/about',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              About Pink Auto Glass
            </h1>
            <p className="text-xl md:text-2xl text-pink-50">
              Colorado's trusted mobile windshield repair and replacement experts
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">

            {/* Company Story */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-navy-900">
                Our Story
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-4">
                  Pink Auto Glass was founded with a simple mission: to provide fast, reliable, and convenient
                  mobile windshield repair and replacement services throughout Colorado. We understand that
                  your time is valuable, which is why we come to you—whether you're at home, work, or anywhere
                  in between.
                </p>
                <p className="mb-4">
                  Our team of certified technicians brings years of experience and uses only the highest quality
                  materials to ensure your windshield repair or replacement meets the strictest safety standards.
                  We work with all major insurance companies and offer lifetime warranties on all our work.
                </p>
              </div>
            </div>

            {/* Breast Cancer Awareness Section */}
            <div className="mb-16 bg-pink-50 border-l-4 border-pink-500 p-8 rounded-r-lg">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  {/* Placeholder for breast cancer awareness logo */}
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-pink-400">
                    <Image
                      src="/breast-cancer-awareness-logo.svg"
                      alt="Breast Cancer Awareness Ribbon"
                      width={160}
                      height={240}
                      className="object-contain p-4"
                      priority
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-pink-700">
                    Supporting Breast Cancer Awareness
                  </h2>
                  <div className="prose prose-lg max-w-none text-gray-800">
                    <p className="mb-4">
                      At Pink Auto Glass, we're proud to support breast cancer awareness and research.
                      Our commitment to this cause goes beyond our name—it's a core part of who we are
                      and what we stand for.
                    </p>
                    <p className="mb-4">
                      We believe in giving back to our community and supporting those affected by breast
                      cancer. A portion of every service we provide goes toward breast cancer research
                      and support organizations that help patients and their families during their journey.
                    </p>
                    <p>
                      Together, we can make a difference. Every windshield we repair or replace helps
                      fund vital research and support services that save lives.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Our Values */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-8 text-navy-900">
                Our Values
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-pink-500">
                  <h3 className="text-xl font-semibold mb-3 text-navy-900">Quality</h3>
                  <p className="text-gray-700">
                    We use only OEM-quality glass and materials, ensuring your windshield meets or
                    exceeds factory specifications.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
                  <h3 className="text-xl font-semibold mb-3 text-navy-900">Convenience</h3>
                  <p className="text-gray-700">
                    Our mobile service comes to you, saving you time and hassle. We offer same-day
                    service and flexible scheduling.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-pink-500">
                  <h3 className="text-xl font-semibold mb-3 text-navy-900">Safety</h3>
                  <p className="text-gray-700">
                    Your safety is our top priority. All our work is backed by a lifetime warranty
                    and performed by certified technicians.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
                  <h3 className="text-xl font-semibold mb-3 text-navy-900">Community</h3>
                  <p className="text-gray-700">
                    We're committed to supporting breast cancer awareness and giving back to the
                    communities we serve throughout Colorado.
                  </p>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-8 text-navy-900">
                Why Choose Pink Auto Glass?
              </h2>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-pink-500 mr-3 text-xl">✓</span>
                  <span><strong>Mobile Service:</strong> We come to your home, office, or any location in Colorado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-3 text-xl">✓</span>
                  <span><strong>Same-Day Service:</strong> Fast response times to get you back on the road quickly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-3 text-xl">✓</span>
                  <span><strong>Lifetime Warranty:</strong> All our work is backed by our lifetime warranty</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-3 text-xl">✓</span>
                  <span><strong>Insurance Approved:</strong> We work with all major insurance companies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-3 text-xl">✓</span>
                  <span><strong>Certified Technicians:</strong> Trained and experienced professionals</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-3 text-xl">✓</span>
                  <span><strong>Supporting a Cause:</strong> Every service helps fund breast cancer research</span>
                </li>
              </ul>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-primary text-white rounded-xl p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-8 text-pink-50">
                Get a free quote or book your appointment today
              </p>
              <CTAButtons source="about-page" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
