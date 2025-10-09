'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackFormStart, trackFormSubmit } from '@/lib/analytics';

export default function QuoteForm() {
  const router = useRouter();
  const [formStarted, setFormStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicle: '',
    zip: '',
    hasInsurance: '',
    smsConsent: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formStarted) {
      trackFormStart('homepage_quote_form');
      setFormStarted(true);
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate session and client IDs
      const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();
      const clientId = localStorage.getItem('client_id') || crypto.randomUUID();

      // Store IDs for future use
      sessionStorage.setItem('session_id', sessionId);
      localStorage.setItem('client_id', clientId);

      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'homepage_quote_form',
          timestamp: new Date().toISOString(),
          clientId,
          sessionId,
          firstTouch: {
            utm_source: 'direct',
            referrer: document.referrer || 'direct'
          },
          lastTouch: {
            utm_source: 'direct',
            referrer: document.referrer || 'direct'
          }
        })
      });

      if (response.ok) {
        trackFormSubmit('homepage_quote_form');
        router.push('/thank-you');
      } else {
        alert('Something went wrong. Please call us at (720) 918-7465');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Something went wrong. Please call us at (720) 918-7465');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-xl border-2 border-pink-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Get Your FREE Quote in 60 Seconds</h3>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-base"
            placeholder="John Doe"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full p-4 border-2 border-pink-300 bg-pink-50 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-base font-medium"
            placeholder="(720) 555-1234"
          />
          <p className="text-xs text-gray-600 mt-1">We'll call or text you back in 5 minutes</p>
        </div>

        {/* Vehicle */}
        <div>
          <label htmlFor="vehicle" className="block text-sm font-semibold text-gray-700 mb-2">
            Vehicle (Year Make Model) *
          </label>
          <input
            type="text"
            id="vehicle"
            name="vehicle"
            required
            value={formData.vehicle}
            onChange={handleInputChange}
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-base"
            placeholder="2024 Toyota Camry"
          />
        </div>

        {/* ZIP Code */}
        <div>
          <label htmlFor="zip" className="block text-sm font-semibold text-gray-700 mb-2">
            ZIP Code *
          </label>
          <input
            type="text"
            id="zip"
            name="zip"
            required
            pattern="[0-9]{5}"
            value={formData.zip}
            onChange={handleInputChange}
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-base"
            placeholder="80202"
          />
        </div>

        {/* Insurance */}
        <div>
          <label htmlFor="hasInsurance" className="block text-sm font-semibold text-gray-700 mb-2">
            Do you have insurance? *
          </label>
          <select
            id="hasInsurance"
            name="hasInsurance"
            required
            value={formData.hasInsurance}
            onChange={handleInputChange}
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-base"
          >
            <option value="">Select</option>
            <option value="yes">Yes - I have insurance</option>
            <option value="no">No - I'll pay out of pocket</option>
            <option value="unsure">Not sure</option>
          </select>
        </div>

        {/* SMS Consent Checkbox */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="smsConsent"
              name="smsConsent"
              checked={formData.smsConsent}
              onChange={(e) => setFormData({ ...formData, smsConsent: e.target.checked })}
              className="mt-1 w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
            />
            <label htmlFor="smsConsent" className="text-sm text-gray-700 cursor-pointer">
              By checking this box, you agree to receive Customer Care SMS messages from Pink Auto Glass. You may reply <strong>STOP</strong> to opt out at any time. Reply <strong>HELP</strong> to (720) 918-7465 for assistance. Messages and data rates may apply. Message frequency will vary. Learn more on our{' '}
              <a href="/privacy" className="text-pink-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>{' '}
              page and{' '}
              <a href="/terms" className="text-pink-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Terms & Conditions
              </a>.
            </label>
          </div>
          <p className="text-xs text-gray-600 mt-2 ml-8">
            <em>Optional - Consent is not required to receive a quote.</em>
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-bold py-5 px-6 rounded-xl text-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Get My FREE Quote →'}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          🔒 Your information is secure • We'll respond in 5 minutes
        </p>
      </div>
    </form>
  );
}
