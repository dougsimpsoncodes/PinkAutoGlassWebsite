import Link from 'next/link';

interface SuccessConfirmationProps {
  referenceNumber: string;
  email: string;
}

export function SuccessConfirmation({ referenceNumber, email }: SuccessConfirmationProps) {
  return (
    <div className="min-h-screen bg-gradient-light flex items-center justify-center">
      <div className="container-padding">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-xl shadow-brand p-8 sm:p-10 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Main Message */}
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-brand-navy mb-4">
              Request Sent!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              We'll call you within 15 minutes to confirm your appointment.
            </p>

            {/* Reference Number */}
            <div className="bg-gradient-light rounded-lg p-6 mb-8">
              <h2 className="text-sm font-medium text-brand-navy mb-2">
                Reference Number
              </h2>
              <p className="text-2xl font-bold text-brand-pink font-mono">
                {referenceNumber}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Save this number for your records
              </p>
            </div>

            {/* Email Confirmation */}
            <div className="flex items-center justify-center space-x-3 mb-8">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="text-gray-600">
                Confirmation sent to: <span className="font-medium">{email}</span>
              </span>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-brand-navy mb-4">What happens next?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-brand-pink rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-brand-navy">Phone confirmation</p>
                    <p className="text-sm text-gray-600">We'll call within 15 minutes to confirm details</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-brand-pink rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-brand-navy">Schedule appointment</p>
                    <p className="text-sm text-gray-600">We'll find the perfect time that works for you</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-brand-pink rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-brand-navy">Professional service</p>
                    <p className="text-sm text-gray-600">Our certified technicians will take care of everything</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/track?ref=${referenceNumber}`}
                className="btn-primary"
              >
                Track Your Request
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/"
                className="btn-secondary"
              >
                Back to Home
              </Link>
            </div>

            {/* Contact Info */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Questions? Call us:</p>
              <a
                href="tel:+17209187465"
                className="text-lg font-semibold text-brand-pink hover:text-brand-navy transition-colors duration-200"
              >
                (720) 918-7465
              </a>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-brand-navy mb-4">Your Privacy Matters</h4>
            <div className="text-sm text-gray-600 space-y-3">
              <p>
                <strong>Data Retention:</strong> We retain your information for 18 months to provide 
                service and support. Photos are kept for 90 days unless you schedule service with us 
                (then 18 months).
              </p>
              <p>
                <strong>Data Protection:</strong> Your information is encrypted and stored securely 
                using industry-standard practices.
              </p>
              <p>
                <strong>Your Rights:</strong> You can request data deletion, correction, or export 
                at any time by contacting us.
              </p>
              <Link
                href="/privacy-policy"
                className="inline-block text-brand-pink hover:text-brand-navy hover:underline font-medium"
              >
                View Complete Privacy Policy →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}