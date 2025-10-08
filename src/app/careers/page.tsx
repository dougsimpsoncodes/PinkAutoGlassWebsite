import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase, DollarSign, Users, TrendingUp, Clock, Heart, Mail, Phone } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Careers at Pink Auto Glass | Join Our Denver Team',
  description: 'Join the Pink Auto Glass team in Denver! Competitive pay, flexible hours, and great benefits. Now hiring auto glass technicians and support staff.',
  keywords: 'Pink Auto Glass careers, auto glass technician jobs Denver, windshield repair jobs, Denver auto glass employment',
  alternates: {
    canonical: 'https://pinkautoglass.com/careers',
  },
  openGraph: {
    title: 'Careers at Pink Auto Glass | Join Our Denver Team',
    description: 'Join our growing team! Competitive pay, flexible hours, and great benefits.',
    url: 'https://pinkautoglass.com/careers',
    type: 'website',
  },
};

export default function CareersPage() {
  const openPositions = [
    {
      title: 'Mobile Auto Glass Technician',
      type: 'Full-Time',
      location: 'Denver Metro Area',
      description: 'Install and repair windshields and auto glass at customer locations. Company vehicle provided.',
      requirements: [
        '2+ years auto glass experience preferred (will train the right candidate)',
        'Valid driver\'s license and clean driving record',
        'Physical ability to lift 50+ lbs',
        'Excellent customer service skills',
        'Professional appearance and demeanor',
      ],
      pay: '$25-$35/hour + bonuses',
    },
    {
      title: 'Customer Service Representative',
      type: 'Full-Time',
      location: 'Remote/Hybrid',
      description: 'Handle customer inquiries, schedule appointments, and coordinate with technicians.',
      requirements: [
        'Experience in customer service or call center',
        'Strong communication and organizational skills',
        'Comfortable with technology and scheduling software',
        'Bilingual (English/Spanish) a plus',
      ],
      pay: '$18-$22/hour',
    },
    {
      title: 'Auto Glass Apprentice',
      type: 'Full-Time',
      location: 'Denver Metro Area',
      description: 'Learn the auto glass trade from experienced professionals. Paid training program.',
      requirements: [
        'Strong work ethic and willingness to learn',
        'Valid driver\'s license',
        'Physical ability to lift and carry glass',
        'Good mechanical aptitude',
      ],
      pay: '$18-$20/hour (increases with experience)',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="pt-16 md:pt-20">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Careers' },
            ]}
          />
        </div>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16">
            <div className="inline-block bg-pink-100 text-pink-600 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              We're Hiring!
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Join the Pink Auto Glass Team
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Be part of Denver's fastest-growing mobile auto glass service. Great pay, flexible schedule, and a supportive team environment.
            </p>
          </div>

          {/* Why Work With Us */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Why Choose Pink Auto Glass?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Competitive Pay</h3>
                <p className="text-gray-600">
                  Industry-leading wages with performance bonuses and regular raises. Technicians earn $25-$35/hour plus incentives.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Schedule</h3>
                <p className="text-gray-600">
                  Work-life balance matters. Choose full-time or part-time schedules that work for your lifestyle.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Career Growth</h3>
                <p className="text-gray-600">
                  We invest in training and development. Many of our managers started as technicians.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-lg p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Benefits & Perks
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Heart, text: 'Health, dental, and vision insurance (full-time employees)' },
                { icon: DollarSign, text: 'Paid training and certification programs' },
                { icon: Clock, text: 'Paid time off and holidays' },
                { icon: Users, text: 'Team events and appreciation programs' },
                { icon: Briefcase, text: 'Company vehicle and tools provided (technicians)' },
                { icon: TrendingUp, text: 'Performance bonuses and incentives' },
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <benefit.icon className="w-4 h-4 text-pink-600" />
                  </div>
                  <p className="text-gray-700">{benefit.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Current Openings */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Current Openings
            </h2>
            <div className="space-y-6">
              {openPositions.map((position, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                  <div className="flex flex-wrap items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{position.title}</h3>
                      <div className="flex flex-wrap gap-3">
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {position.type}
                        </span>
                        <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          {position.location}
                        </span>
                        <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                          {position.pay}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{position.description}</p>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {position.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  <a
                    href="mailto:careers@pinkautoglass.com?subject=Application for ${position.title}"
                    className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                  >
                    Apply for This Position
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Application Process */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              How to Apply
            </h2>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-pink-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Send Resume</h3>
                <p className="text-sm text-gray-600">Email your resume and cover letter to careers@pinkautoglass.com</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Phone Screen</h3>
                <p className="text-sm text-gray-600">We'll call to discuss your experience and the role</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Interview</h3>
                <p className="text-sm text-gray-600">Meet the team and see if we're a good fit</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-green-600">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Get Started</h3>
                <p className="text-sm text-gray-600">Complete onboarding and begin training</p>
              </div>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <p className="text-blue-900">
                <strong>Don't see a position that fits?</strong> We're always looking for talented people. Send your resume to careers@pinkautoglass.com and we'll keep it on file for future openings.
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl shadow-xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Questions About Careers?
            </h2>
            <p className="text-xl mb-8 text-pink-50 max-w-2xl mx-auto">
              We'd love to hear from you! Reach out to our HR team for more information about working at Pink Auto Glass.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:careers@pinkautoglass.com"
                className="inline-flex items-center bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                careers@pinkautoglass.com
              </a>
              <a
                href="tel:+17209187465"
                className="inline-flex items-center bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-5 h-5 mr-2" />
                (720) 918-7465
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
