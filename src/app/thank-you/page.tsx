import { Phone, MessageSquare, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: "Thank You! | Pink Auto Glass Denver",
  description: "Thank you for your quote request. We'll contact you within 5 minutes!",
  robots: "noindex, nofollow", // Don't index thank you pages
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-light">
      <div className="container-padding pt-24 pb-16">
        <div className="max-w-2xl mx-auto">

          {/* Success Message */}
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Thank You!
            </h1>

            <p className="text-xl text-gray-700 mb-6">
              We received your quote request and will contact you within <strong className="text-pink-600">5 minutes</strong>.
            </p>

            <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                What happens next?
              </h2>
              <ol className="text-left space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span>Our team will call or text you within 5 minutes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span>We'll provide a free quote and answer any questions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span>If you're ready, we'll schedule your appointment</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <span>We come to you and fix your windshield!</span>
                </li>
              </ol>
            </div>

            {/* Immediate Contact Options */}
            <div className="border-t-2 border-gray-100 pt-8">
              <p className="text-gray-700 mb-6">
                Can't wait? Reach us now:
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+17209187465"
                  className="inline-flex items-center justify-center gap-2 bg-pink-600 text-white hover:bg-pink-700 font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <Phone className="w-5 h-5" />
                  Call (720) 918-7465
                </a>

                <a
                  href="sms:+17209187465"
                  className="inline-flex items-center justify-center gap-2 bg-white text-pink-600 hover:bg-gray-50 font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all border-2 border-pink-600"
                >
                  <MessageSquare className="w-5 h-5" />
                  Text Us
                </a>
              </div>
            </div>

            {/* Back to Home Link */}
            <div className="mt-8">
              <Link
                href="/"
                className="text-pink-600 hover:text-pink-700 font-semibold underline"
              >
                ← Back to Homepage
              </Link>
            </div>
          </div>

          {/* Trust Reminder */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              🔒 Your information is secure and will never be shared with third parties
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
