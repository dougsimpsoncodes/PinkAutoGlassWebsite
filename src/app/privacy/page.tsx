import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Pink Auto Glass',
  description: 'Privacy Policy for Pink Auto Glass - Learn how we collect, use, and protect your personal information.',
  robots: 'noindex, follow',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-navy-900 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
              Privacy Policy
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
                Pink Auto Glass ("we," "our," or "us") respects your privacy and is committed to protecting your personal
                information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
                you visit our website, use our mobile services, or interact with us through phone, text, or other communications.
              </p>

              <p className="text-gray-700 mb-8">
                Please read this Privacy Policy carefully. By using our services or providing us with your information,
                you agree to the terms of this Privacy Policy.
              </p>

              {/* Information We Collect */}
              <h2 className="text-2xl font-bold text-navy-900 mt-8 mb-4">1. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Personal Information</h3>
              <p className="text-gray-700 mb-4">
                We may collect personal information that you provide to us, including but not limited to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Name and contact information (email address, phone number, mailing address)</li>
                <li>Vehicle information (make, model, year, VIN)</li>
                <li>Insurance information</li>
                <li>Service location and appointment details</li>
                <li>Payment information (processed securely through third-party payment processors)</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Automatically Collected Information</h3>
              <p className="text-gray-700 mb-4">
                When you visit our website, we may automatically collect certain information, including:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent on our site</li>
                <li>Referring website addresses</li>
                <li>Cookie data and similar tracking technologies</li>
              </ul>

              {/* Phone and Text Communications */}
              <h2 className="text-2xl font-bold text-navy-900 mt-8 mb-4">2. Phone and Text Message Communications</h2>

              <div className="bg-pink-50 border-l-4 border-pink-500 p-6 mb-6 rounded-r-lg">
                <h3 className="text-xl font-semibold text-pink-900 mb-3">Express Consent for Communications</h3>
                <p className="text-gray-800 mb-4">
                  By providing your phone number to Pink Auto Glass, you expressly consent to receive:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-800 space-y-2">
                  <li>Phone calls from us or our authorized representatives regarding your service requests, appointments,
                  and follow-up communications</li>
                  <li>Text messages (SMS/MMS) related to appointment confirmations, service updates, reminders, and
                  customer service communications</li>
                  <li>Promotional messages, special offers, and marketing communications (with your separate opt-in consent)</li>
                </ul>

                <p className="text-gray-800 mb-4">
                  <strong>You are not required to consent to receive promotional calls or texts as a condition of purchasing
                  any goods or services from Pink Auto Glass.</strong>
                </p>
              </div>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Automated Calling and Texting</h3>
              <p className="text-gray-700 mb-4">
                By providing your telephone number, you agree that Pink Auto Glass and our authorized service providers
                may contact you using:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Automated telephone dialing systems</li>
                <li>Prerecorded or artificial voice messages</li>
                <li>Automated text messages (SMS/MMS)</li>
              </ul>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Message Frequency and Charges</h3>
              <p className="text-gray-700 mb-4">
                Message frequency varies depending on your service requests and communication preferences. Standard message
                and data rates may apply from your wireless carrier. Please contact your wireless carrier for details about
                your messaging plan.
              </p>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Opting Out of Communications</h3>
              <p className="text-gray-700 mb-4">
                <strong>Text Messages:</strong> You may opt out of receiving text messages at any time by:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Replying <strong>STOP</strong>, <strong>UNSUBSCRIBE</strong>, <strong>QUIT</strong>,
                <strong>CANCEL</strong>, or <strong>OPT-OUT</strong> to any text message you receive from us</li>
                <li>Contacting us at <a href="tel:+17209187465" className="text-pink-600 hover:text-pink-700">(720) 918-7465</a></li>
                <li>Emailing us at <a href="mailto:service@pinkautoglass.com" className="text-pink-600 hover:text-pink-700">service@pinkautoglass.com</a></li>
              </ul>

              <p className="text-gray-700 mb-4">
                After you opt out, you will receive one final message confirming your opt-out request. You may continue
                to receive transactional messages related to active service requests.
              </p>

              <p className="text-gray-700 mb-6">
                <strong>Phone Calls:</strong> You may opt out of receiving promotional phone calls by:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Informing our representative during any phone call that you wish to opt out</li>
                <li>Contacting us at <a href="tel:+17209187465" className="text-pink-600 hover:text-pink-700">(720) 918-7465</a></li>
                <li>Emailing us at <a href="mailto:service@pinkautoglass.com" className="text-pink-600 hover:text-pink-700">service@pinkautoglass.com</a></li>
              </ul>

              <h3 className="text-xl font-semibold text-navy-900 mt-6 mb-3">Help and Support</h3>
              <p className="text-gray-700 mb-6">
                For help with text messages, reply <strong>HELP</strong> to any text message or contact us at{' '}
                <a href="tel:+17209187465" className="text-pink-600 hover:text-pink-700">(720) 918-7465</a>.
              </p>

              {/* How We Use Your Information */}
              <h2 className="text-2xl font-bold text-navy-900 mt-8 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Provide and manage our windshield repair and replacement services</li>
                <li>Schedule and confirm appointments</li>
                <li>Process payments and insurance claims</li>
                <li>Communicate with you about your service requests</li>
                <li>Send appointment reminders and service updates</li>
                <li>Improve our services and customer experience</li>
                <li>Send promotional offers and marketing communications (with your consent)</li>
                <li>Comply with legal obligations</li>
                <li>Prevent fraud and enhance security</li>
              </ul>

              {/* Information Sharing */}
              <h2 className="text-2xl font-bold text-navy-900 mt-8 mb-4">4. How We Share Your Information</h2>
              <p className="text-gray-700 mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf
                (payment processing, appointment scheduling, text messaging services)</li>
                <li><strong>Insurance Companies:</strong> When processing insurance claims with your authorization</li>
                <li><strong>Business Partners:</strong> Auto glass manufacturers and suppliers as needed to fulfill services</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect our legal rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>

              <p className="text-gray-700 mb-4">
                We do not sell your personal information to third parties for their marketing purposes.
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                <p className="text-gray-800 font-semibold">
                  Mobile Opt-in and SMS Consent:
                </p>
                <p className="text-gray-800 mt-2">
                  Mobile opt-in, SMS consent, and phone numbers collected for SMS communication purposes will not be
                  shared with any third party or affiliates for marketing purposes.
                </p>
              </div>

              {/* Cookies and Tracking */}
              <h2 className="text-2xl font-bold text-navy-900 mt-8 mb-4">5. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our website. You can
                control cookies through your browser settings, though disabling cookies may limit certain website features.
              </p>

              {/* Data Security */}
              <h2 className="text-2xl font-bold text-navy-900 mt-8 mb-4">6. Data Security</h2>
              <p className="text-gray-700 mb-6">
                We implement reasonable security measures to protect your personal information from unauthorized access,
                disclosure, alteration, or destruction. However, no internet transmission is completely secure, and we
                cannot guarantee absolute security.
              </p>

              {/* Your Rights */}
              <h2 className="text-2xl font-bold text-navy-900 mt-8 mb-4">7. Your Privacy Rights</h2>
              <p className="text-gray-700 mb-4">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Access to the personal information we hold about you</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your personal information (subject to legal requirements)</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdrawal of consent for certain data processing activities</li>
              </ul>

              <p className="text-gray-700 mb-6">
                To exercise these rights, please contact us using the information provided below.
              </p>

              {/* Third-Party Links */}
              <h2 className="text-2xl font-bold text-navy-900 mt-8 mb-4">8. Third-Party Websites</h2>
              <p className="text-gray-700 mb-6">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices
                of these external sites. We encourage you to review their privacy policies.
              </p>

              {/* Children's Privacy */}
              <h2 className="text-2xl font-bold text-navy-900 mt-8 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 mb-6">
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal
                information from children.
              </p>

              {/* Changes to Policy */}
              <h2 className="text-2xl font-bold text-navy-900 mt-8 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-6">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by
                posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use
                of our services after changes become effective constitutes your acceptance of the revised policy.
              </p>

              {/* Contact Information */}
              <h2 className="text-2xl font-bold text-navy-900 mt-8 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
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

              {/* TCPA Compliance Notice */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">TCPA Compliance Notice</h3>
                <p className="text-gray-800 text-sm">
                  This Privacy Policy complies with the Telephone Consumer Protection Act (TCPA) and related regulations.
                  By providing your phone number and express consent, you authorize Pink Auto Glass to contact you using
                  automated technology. Consent is not required as a condition of purchase, and you may revoke consent
                  at any time using the opt-out methods described above.
                </p>
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
