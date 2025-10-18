'use client';

import { useState } from 'react';
import { Phone, Clock, CheckCircle, Loader } from 'lucide-react';

export default function ScheduleCallback() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    preferredTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const timeOptions = [
    'Morning (8am-12pm)',
    'Afternoon (12pm-4pm)',
    'Evening (4pm-7pm)',
    'Anytime Today',
    'Tomorrow',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Here you would send to your callback scheduling API
      // const response = await fetch('/api/schedule-callback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      setIsSuccess(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ name: '', phone: '', preferredTime: '' });
      }, 3000);
    } catch (err) {
      setError('Something went wrong. Please call us directly at (720) 918-7465');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
        <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Callback Scheduled!</h3>
        <p className="text-green-700">
          We'll call you at {formData.phone} during your preferred time: {formData.preferredTime}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-blue-100 rounded-full mb-3">
          <Phone className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Schedule a Callback</h3>
        <p className="text-gray-600">We'll call you at your preferred time</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="callback-name" className="block text-sm font-semibold mb-2">
            Your Name
          </label>
          <input
            id="callback-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-600 focus:outline-none"
            placeholder="John Smith"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="callback-phone" className="block text-sm font-semibold mb-2">
            Phone Number
          </label>
          <input
            id="callback-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            pattern="[0-9]{10}"
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-600 focus:outline-none"
            placeholder="(720) 555-0123"
          />
          <p className="text-xs text-gray-500 mt-1">10-digit number without dashes</p>
        </div>

        {/* Preferred Time */}
        <div>
          <label htmlFor="callback-time" className="block text-sm font-semibold mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Preferred Time
          </label>
          <select
            id="callback-time"
            value={formData.preferredTime}
            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
            required
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-600 focus:outline-none"
          >
            <option value="">Select a time...</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Scheduling...
            </>
          ) : (
            <>
              <Phone className="w-5 h-5" />
              Schedule My Callback
            </>
          )}
        </button>

        {/* Privacy Note */}
        <p className="text-xs text-gray-500 text-center">
          We respect your privacy. Your information is never shared.
        </p>
      </form>
    </div>
  );
}
