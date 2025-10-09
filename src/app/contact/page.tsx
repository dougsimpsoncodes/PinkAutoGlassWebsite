import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, MessageSquare, Calendar } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Contact Pink Auto Glass | Denver Mobile Windshield Service',
  description: 'Get in touch with Pink Auto Glass. Call (720) 918-7465 for same-day mobile windshield service in Denver. Available 7 days a week, 7am-7pm.',
  keywords: 'contact Pink Auto Glass, Denver auto glass contact, windshield repair contact, mobile glass service Denver',
  alternates: {
    canonical: 'https://pinkautoglass.com/contact',
  },
  openGraph: {
    title: 'Contact Pink Auto Glass | Denver Mobile Windshield Service',
    description: 'Get in touch with Pink Auto Glass. Call (720) 918-7465 for same-day service.',
    url: 'https://pinkautoglass.com/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="page-top-padding">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Contact' },
            ]}
          />
        </div>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Contact Pink Auto Glass
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're here to help! Reach out for a free quote, schedule service, or get answers to your windshield questions.
            </p>
          </div>

          {/* Quick Contact Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* Call Us */}
            <a
              href="tel:+17209187465"
              className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow border-2 border-transparent hover:border-pink-200"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Call Us</h2>
              <p className="text-gray-600 mb-3">Speak with our team now</p>
              <p className="text-3xl font-bold text-pink-600">(720) 918-7465</p>
              <p className="text-sm text-gray-500 mt-2">7 days a week, 7am - 7pm</p>
            </a>

            {/* Text Us */}
            <a
              href="sms:+17209187465"
              className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-200"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Text Us</h2>
              <p className="text-gray-600 mb-3">Quick questions? Send a text</p>
              <p className="text-3xl font-bold text-blue-600">(720) 918-7465</p>
              <p className="text-sm text-gray-500 mt-2">Fast response times</p>
            </a>

            {/* Email Us */}
            <a
              href="mailto:service@pinkautoglass.com"
              className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-200"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Us</h2>
              <p className="text-gray-600 mb-3">Detailed inquiries welcome</p>
              <p className="text-lg font-semibold text-purple-600 break-all">service@pinkautoglass.com</p>
              <p className="text-sm text-gray-500 mt-2">Response within 24 hours</p>
            </a>
          </div>

          {/* Get a Quote CTA */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl shadow-xl p-8 md:p-12 text-center text-white mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 text-pink-50">
              Get a free quote and schedule your mobile windshield service in just 2 minutes
            </p>
            <Link
              href="/book"
              className="inline-block bg-white text-pink-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              <Calendar className="inline-block w-5 h-5 mr-2 -mt-1" />
              Get Free Quote Now
            </Link>
          </div>

          {/* Contact Information Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Business Hours */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Business Hours</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Monday - Friday</span>
                  <span className="font-semibold text-gray-900">7:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Saturday</span>
                  <span className="font-semibold text-gray-900">7:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Sunday</span>
                  <span className="font-semibold text-gray-900">7:00 AM - 7:00 PM</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-900">
                  <strong>Same-Day Service Available!</strong> Call before 2 PM for same-day windshield repair or replacement.
                </p>
              </div>
            </div>

            {/* Service Area */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                  <MapPin className="w-6 h-6 text-pink-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Service Area</h2>
              </div>
              <p className="text-gray-700 mb-4">
                We provide mobile windshield service throughout the Denver Metro Area and surrounding Colorado communities.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  'Denver', 'Aurora', 'Lakewood', 'Boulder',
                  'Thornton', 'Arvada', 'Westminster', 'Centennial',
                  'Parker', 'Highlands Ranch'
                ].map((city) => (
                  <div key={city} className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                    {city}
                  </div>
                ))}
              </div>
              <Link
                href="/locations"
                className="text-pink-600 hover:text-pink-700 font-semibold"
              >
                View All Locations →
              </Link>
            </div>
          </div>

          {/* Why Contact Us */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Why Choose Pink Auto Glass?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Service</h3>
                <p className="text-gray-600">
                  We come to your home, office, or anywhere in Denver. No need to visit a shop!
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Affordable Pricing</h3>
                <p className="text-gray-600">
                  Rock chip repair from $89, windshield replacement from $299. Insurance handled.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Same-Day Service</h3>
                <p className="text-gray-600">
                  Most repairs and replacements completed the same day you call. Lifetime warranty included.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Common Questions
            </h2>
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  How quickly can you respond to my request?
                </h3>
                <p className="text-gray-700">
                  We aim to contact you within 15 minutes of your quote request. For same-day service, call us directly at (720) 918-7465 before 2 PM.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Do you work with insurance companies?
                </h3>
                <p className="text-gray-700">
                  Yes! We work with all major insurance providers and can handle the entire claims process for you. Most comprehensive policies cover windshield repair with $0 deductible.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  What if I'm outside your main service area?
                </h3>
                <p className="text-gray-700">
                  Contact us anyway! We can often accommodate locations outside our standard service area. Call (720) 918-7465 or email service@pinkautoglass.com to discuss your location.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Can I schedule service for a specific date and time?
                </h3>
                <p className="text-gray-700">
                  Absolutely! When you contact us, we'll work with your schedule to find a convenient time. We offer flexible scheduling 7 days a week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
