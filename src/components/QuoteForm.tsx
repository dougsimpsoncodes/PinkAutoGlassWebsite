'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trackFormStart, trackFormSubmit } from '@/lib/analytics';

export default function QuoteForm() {
  const router = useRouter();
  const [formStarted, setFormStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    zip: '',
    hasInsurance: '',
    smsConsent: false
  });
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);

  // Generate years array (current year back 20 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  // Fetch makes on component mount
  useEffect(() => {
    const fetchMakes = async () => {
      try {
        setLoadingMakes(true);
        const response = await fetch('/api/vehicles/makes');
        if (response.ok) {
          const data = await response.json();
          setAvailableMakes(data.makes || []);
        }
      } catch (error) {
        console.error('Error fetching makes:', error);
      } finally {
        setLoadingMakes(false);
      }
    };
    fetchMakes();
  }, []);

  // Fetch models when make changes
  useEffect(() => {
    if (!formData.vehicleMake) {
      setAvailableModels([]);
      return;
    }

    const fetchModels = async () => {
      try {
        setLoadingModels(true);
        const response = await fetch(`/api/vehicles/models?make=${encodeURIComponent(formData.vehicleMake)}`);
        if (response.ok) {
          const data = await response.json();
          setAvailableModels(data.models || []);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        setAvailableModels([]);
      } finally {
        setLoadingModels(false);
      }
    };
    fetchModels();
  }, [formData.vehicleMake]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formStarted) {
      trackFormStart('homepage_quote_form');
      setFormStarted(true);
    }

    const { name, value } = e.target;

    // Format phone number as user types
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData({
        ...formData,
        phone: formatted
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
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

      // Combine vehicle data into single string for API
      const vehicle = `${formData.vehicleYear} ${formData.vehicleMake} ${formData.vehicleModel}`.trim();

      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          vehicle: vehicle,
          zip: formData.zip,
          hasInsurance: formData.hasInsurance,
          smsConsent: formData.smsConsent,
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
    <form id="quote-form" onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-xl border-2 border-pink-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Get Your Free Quote</h3>

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
            maxLength={14}
            className="w-full p-4 border-2 border-pink-300 bg-pink-50 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-base font-medium"
            placeholder="(720) 555-1234"
          />
          <p className="text-xs text-gray-600 mt-1">We'll call or text you back in 5 minutes</p>
        </div>

        {/* Vehicle - Year, Make, Model */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Vehicle Information *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* Year */}
            <select
              id="vehicleYear"
              name="vehicleYear"
              required
              value={formData.vehicleYear}
              onChange={(e) => {
                handleInputChange(e);
                setFormData(prev => ({ ...prev, vehicleYear: e.target.value, vehicleMake: '', vehicleModel: '' }));
              }}
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-base"
            >
              <option value="">Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Make */}
            <select
              id="vehicleMake"
              name="vehicleMake"
              required
              value={formData.vehicleMake}
              onChange={(e) => {
                handleInputChange(e);
                setFormData(prev => ({ ...prev, vehicleMake: e.target.value, vehicleModel: '' }));
              }}
              disabled={loadingMakes || availableMakes.length === 0}
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">{loadingMakes ? 'Loading...' : 'Make'}</option>
              {availableMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
              <option value="Other">Other</option>
            </select>

            {/* Model */}
            <select
              id="vehicleModel"
              name="vehicleModel"
              required
              value={formData.vehicleModel}
              onChange={handleInputChange}
              disabled={!formData.vehicleMake || loadingModels}
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">{loadingModels ? 'Loading...' : 'Model'}</option>
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>
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
            <label htmlFor="smsConsent" className="text-xs text-gray-700 cursor-pointer">
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
