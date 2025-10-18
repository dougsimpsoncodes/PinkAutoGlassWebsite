import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Pink Auto Glass',
  description: 'Terms and Conditions for Pink Auto Glass services including SMS messaging terms.',
  robots: 'noindex, follow',
  alternates: {
    canonical: 'https://pinkautoglass.com/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-navy-900 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
              Terms & Conditions
            </h1>
            <p className="text-lg text-gray-300">
              Last Updated: October 7, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 md:p-12">

            <div className="prose prose-lg max-w-none">

              {/* Introduction */}
              <p className="text-gray-700 mb-6">
                Welcome to Pink Auto Glass. By accessing or using our services, you agree to be bound by these Terms
                and Conditions. Please read them carefully.
              </p>

              {/* SMS Terms & Conditions */}
              <h2 className="text-2xl font-bold text-navy-900 mt-8 mb-4">SMS Terms & Conditions</h2>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">SMS Consent Communication</h3>
              <p className="text-gray-700 mb-4">
                The information (phone numbers) obtained as part of the SMS consent process will not be shared with
                third parties for marketing purposes. Your phone number is used exclusively for service-related
                communications as described below.
              </p>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Types of SMS Communications</h3>
              <p className="text-gray-700 mb-4">
                If you have consented to receive text messages from Pink Auto Glass, you may receive messages related
                to the following:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li><strong>Appointment Reminders:</strong> Confirmations and reminders about your scheduled windshield
                repair or replacement appointments</li>
                <li><strong>Service Updates:</strong> Status updates about your service request, technician arrival times,
                and completion notifications</li>
                <li><strong>Quote Information:</strong> Details about your windshield repair or replacement quote</li>
                <li><strong>Follow-up Communications:</strong> Post-service follow-ups to ensure your satisfaction</li>
                <li><strong>Emergency Notifications:</strong> Important updates about weather-related service delays or
                urgent safety information</li>
              </ul>

              <p className="text-gray-700 mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <strong>Example:</strong> "Hello, this is a friendly reminder of your upcoming windshield replacement
                appointment with Pink Auto Glass on [Date] at [Time] at [Location]. You can reply STOP to opt out of
                SMS messaging from Pink Auto Glass at any time."
              </p>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Message Frequency</h3>
              <p className="text-gray-700 mb-6">
                Message frequency may vary depending on the type of communication and your service needs. You may receive
                up to 3-5 SMS messages per service appointment, including confirmation, reminders, and follow-up messages.
                Message frequency will vary based on your interaction with our services.
              </p>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Potential Fees for SMS Messaging</h3>
              <p className="text-gray-700 mb-4">
                Please note that standard message and data rates may apply, depending on your wireless carrier's pricing
                plan. These fees may vary if the message is sent domestically or internationally. Pink Auto Glass is not
                responsible for any charges incurred from your mobile carrier.
              </p>
              <p className="text-gray-700 mb-6">
                <strong>Important:</strong> Check with your mobile carrier regarding their specific messaging rates and
                data plans.
              </p>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Opt-In Method</h3>
              <p className="text-gray-700 mb-4">
                You may opt in to receive SMS messages from Pink Auto Glass in the following ways:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>By checking the SMS consent checkbox when submitting an online form on our website</li>
                <li>By checking the SMS consent checkbox when booking an appointment online</li>
                <li>By providing express verbal consent when speaking with our customer service representatives</li>
              </ul>
              <p className="text-gray-700 mb-6">
                <strong>Note:</strong> Consent to receive SMS messages is optional and not required to use our windshield
                repair and replacement services.
              </p>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Opt-Out Method</h3>
              <p className="text-gray-700 mb-4">
                You can opt out of receiving SMS messages at any time. To do so:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Simply reply <strong>"STOP"</strong> to any SMS message you receive from us</li>
                <li>Call us directly at <a href="tel:+17209187465" className="text-pink-600 hover:text-pink-700">(720) 918-7465</a> to request removal</li>
                <li>Email us at <a href="mailto:service@pinkautoglass.com" className="text-pink-600 hover:text-pink-700">service@pinkautoglass.com</a> to opt out</li>
              </ul>
              <p className="text-gray-700 mb-6">
                After opting out, you will receive one final confirmation message. You may continue to receive
                transactional messages related to active service requests for safety and legal purposes.
              </p>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Help</h3>
              <p className="text-gray-700 mb-4">
                If you are experiencing any issues or need assistance with SMS messages, you can:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Reply with the keyword <strong>"HELP"</strong> to any SMS message</li>
                <li>Call us directly at <a href="tel:+17209187465" className="text-pink-600 hover:text-pink-700">(720) 918-7465</a></li>
                <li>Email us at <a href="mailto:service@pinkautoglass.com" className="text-pink-600 hover:text-pink-700">service@pinkautoglass.com</a></li>
                <li>Visit our website at <a href="https://pinkautoglass.com" className="text-pink-600 hover:text-pink-700">pinkautoglass.com</a> for support</li>
              </ul>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Additional Options</h3>
              <p className="text-gray-700 mb-6">
                If you do not wish to receive SMS messages, you can choose not to check the SMS consent box on our forms.
                You will still be able to use our services and receive communications via email and phone calls.
              </p>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Standard Messaging Disclosures</h3>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Message and data rates may apply from your wireless carrier</li>
                <li>You can opt out at any time by texting "STOP" to any message</li>
                <li>For assistance, text "HELP" or call <a href="tel:+17209187465" className="text-pink-600 hover:text-pink-700">(720) 918-7465</a></li>
                <li>Message frequency will vary based on your service needs</li>
                <li>Carriers are not liable for delayed or undelivered messages</li>
              </ul>

              {/* General Terms */}
              <h2 className="text-2xl font-bold text-navy-900 mt-8 mb-4">General Terms of Service</h2>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Service Description</h3>
              <p className="text-gray-700 mb-6">
                Pink Auto Glass provides mobile windshield repair and replacement services throughout Colorado. Our
                services include rock chip repair, windshield replacement, ADAS calibration, and insurance claim assistance.
              </p>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Service Area</h3>
              <p className="text-gray-700 mb-6">
                We provide mobile services throughout the Denver metro area and surrounding Colorado communities. Specific
                service availability may vary based on location and scheduling.
              </p>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Pricing and Payment</h3>
              <p className="text-gray-700 mb-6">
                All pricing is provided as estimates and may vary based on vehicle make, model, and specific service
                requirements. Final pricing will be confirmed before service begins. We accept various payment methods and
                work with most major insurance providers.
              </p>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Cancellation Policy</h3>
              <p className="text-gray-700 mb-6">
                Appointments may be cancelled or rescheduled with at least 24 hours notice. Late cancellations or
                no-shows may be subject to fees.
              </p>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Warranty</h3>
              <p className="text-gray-700 mb-6">
                All our windshield repairs and replacements come with a lifetime warranty against defects in materials
                and workmanship. Warranty terms and conditions apply.
              </p>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Limitation of Liability</h3>
              <p className="text-gray-700 mb-6">
                Pink Auto Glass is not liable for any indirect, incidental, special, or consequential damages arising from
                the use of our services. Our total liability is limited to the amount paid for the service.
              </p>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Changes to Terms</h3>
              <p className="text-gray-700 mb-6">
                We reserve the right to modify these Terms & Conditions at any time. Changes will be posted on this page
                with an updated "Last Updated" date. Continued use of our services after changes constitutes acceptance of
                the updated terms.
              </p>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Governing Law</h3>
              <p className="text-gray-700 mb-6">
                These Terms & Conditions are governed by the laws of the State of Colorado, without regard to its conflict
                of law provisions.
              </p>

              {/* Contact Information */}
              <h2 className="text-2xl font-bold text-navy-900 mt-8 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about these Terms & Conditions, please contact us:
              </p>

              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <p className="font-semibold text-navy-900 mb-3">Pink Auto Glass</p>
                <p className="text-gray-700 mb-2">
                  Phone: <a href="tel:+17209187465" className="text-pink-600 hover:text-pink-700">(720) 918-7465</a>
                </p>
                <p className="text-gray-700 mb-2">
                  Email: <a href="mailto:service@pinkautoglass.com" className="text-pink-600 hover:text-pink-700">service@pinkautoglass.com</a>
                </p>
                <p className="text-gray-700">
                  Service Area: Colorado
                </p>
              </div>

              {/* Related Pages */}
              <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded-r-lg">
                <h3 className="text-lg font-semibold text-pink-900 mb-3">Related Information</h3>
                <ul className="list-disc pl-6 text-gray-800 space-y-2">
                  <li>
                    <Link href="/privacy" className="text-pink-600 hover:text-pink-700 hover:underline">
                      Privacy Policy
                    </Link> - Learn how we protect your personal information
                  </li>
                  <li>
                    <Link href="/about" className="text-pink-600 hover:text-pink-700 hover:underline">
                      About Us
                    </Link> - Learn more about Pink Auto Glass
                  </li>
                </ul>
              </div>

            </div>

            {/* Back to Home */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link
                href="/"
                className="inline-flex items-center text-pink-600 hover:text-pink-700 font-semibold"
              >
                ← Back to Home
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
