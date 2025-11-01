'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Phone, MessageSquare, Clock, CheckCircle, HelpCircle, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

function TrackContent() {
  const searchParams = useSearchParams();
  const referenceNumber = searchParams.get('ref');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 page-top-padding">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {referenceNumber ? (
          // WITH REFERENCE NUMBER
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Request Received!
              </h1>
              <p className="text-lg text-gray-600">
                We'll contact you within 15 minutes to confirm your appointment
              </p>
            </div>

            {/* Reference Number Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200">
              <div className="text-center mb-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Your Reference Number
                </p>
                <p className="text-4xl font-bold text-blue-600 font-mono tracking-wider">
                  {referenceNumber}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Save this number for your records
                </p>
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-md p-8 border border-blue-200">
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Status: Request Pending
                  </h2>
                  <p className="text-gray-700">
                    Your request has been received and our team is reviewing it now. We'll call you within <strong>15 minutes</strong> to confirm your appointment details and answer any questions.
                  </p>
                </div>
              </div>

              {/* Expected Timeline */}
              <div className="bg-white rounded-lg p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">What Happens Next:</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">✓</div>
                    <div>
                      <div className="font-semibold text-gray-900">1. Request Received</div>
                      <div className="text-sm text-gray-600">Your quote request is in our system</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">2</div>
                    <div>
                      <div className="font-semibold text-gray-900">2. We'll Call You (within 15 min)</div>
                      <div className="text-sm text-gray-600">Confirm details, provide quote, answer questions</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">3</div>
                    <div>
                      <div className="font-semibold text-gray-900">3. Schedule Appointment</div>
                      <div className="text-sm text-gray-600">Pick a time that works for you</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">4</div>
                    <div>
                      <div className="font-semibold text-gray-900">4. Service Completed</div>
                      <div className="text-sm text-gray-600">We come to you and fix your windshield!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Future Tracking Note */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
              <div className="flex items-start">
                <HelpCircle className="w-6 h-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">Coming Soon: Real-Time Tracking</h3>
                  <p className="text-sm text-yellow-800">
                    We're working on a real-time tracking system that will let you see your technician's location and ETA. For now, we'll keep you updated via phone and text.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Options */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                Need to Talk to Us Now?
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href="tel:+17209187465"
                  className="flex items-center justify-center gap-3 bg-pink-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call (720) 918-7465
                </a>
                <a
                  href="sms:+17209187465"
                  className="flex items-center justify-center gap-3 bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  Text Us
                </a>
              </div>
              <p className="text-center text-sm text-gray-600 mt-4">
                Reference your number: <strong className="font-mono text-blue-600">{referenceNumber}</strong>
              </p>
            </div>

            {/* Back to Home */}
            <div className="text-center">
              <Link
                href="/"
                className="inline-block text-pink-600 hover:text-pink-700 font-semibold"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        ) : (
          // NO REFERENCE NUMBER
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Track Your Request
              </h1>
              <p className="text-lg text-gray-600">
                Enter your reference number to check your request status
              </p>
            </div>

            {/* No Reference Number Message */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Don't Have a Reference Number?
              </h2>
              <p className="text-gray-700 mb-6">
                You receive a reference number immediately after submitting a quote request through our booking form. Check your:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Confirmation page</strong> - Displayed immediately after booking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Email</strong> - We send a confirmation to the email you provided</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Text message</strong> - If you opted in for SMS updates</span>
                </li>
              </ul>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-sm text-blue-900">
                  <strong>Still can't find it?</strong> Call or text us at <a href="tel:+17209187465" className="font-semibold underline">(720) 918-7465</a> and we can look up your request by name and phone number.
                </p>
              </div>
            </div>

            {/* Make a New Request */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl shadow-md p-8 border-2 border-pink-200 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Haven't Submitted a Request Yet?
              </h2>
              <p className="text-gray-700 mb-6">
                Get a free quote and schedule your windshield repair or replacement in just a few minutes.
              </p>
              <Link
                href="/book"
                className="inline-block bg-pink-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-pink-700 transition-colors text-lg"
              >
                Get Free Quote Now
              </Link>
            </div>

            {/* How Tracking Works */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                How Request Tracking Works
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-pink-600">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Submit Request</h3>
                  <p className="text-sm text-gray-600">
                    Fill out our booking form with your vehicle and contact info
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-blue-600">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Get Reference Number</h3>
                  <p className="text-sm text-gray-600">
                    Receive a unique tracking number via email and text
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
                  <p className="text-sm text-gray-600">
                    Use your reference number to check status anytime
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Options */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                Questions? We're Here to Help
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <a
                  href="tel:+17209187465"
                  className="flex flex-col items-center justify-center gap-2 bg-pink-600 text-white py-6 px-4 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                >
                  <Phone className="w-6 h-6" />
                  <span>Call Us</span>
                  <span className="text-sm font-normal">(720) 918-7465</span>
                </a>
                <a
                  href="sms:+17209187465"
                  className="flex flex-col items-center justify-center gap-2 bg-blue-600 text-white py-6 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="w-6 h-6" />
                  <span>Text Us</span>
                  <span className="text-sm font-normal">(720) 918-7465</span>
                </a>
                <a
                  href="mailto:service@pinkautoglass.com"
                  className="flex flex-col items-center justify-center gap-2 bg-gray-600 text-white py-6 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  <Mail className="w-6 h-6" />
                  <span>Email Us</span>
                  <span className="text-sm font-normal text-xs">service@pinkautoglass.com</span>
                </a>
              </div>
              <p className="text-center text-sm text-gray-600 mt-6">
                Available 7 days a week, 7am - 7pm
              </p>
            </div>

            {/* Back to Home */}
            <div className="text-center">
              <Link
                href="/"
                className="inline-block text-pink-600 hover:text-pink-700 font-semibold"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 page-top-padding flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}
