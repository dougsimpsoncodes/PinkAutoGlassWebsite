'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { trackFormSubmission, trackFormStart, getSessionId, getGclid, getMsclkid, getUTMParams } from '@/lib/tracking';
import { resolveMarket, getPhoneForMarket } from '@/lib/market';

/**
 * QuickCaptureForm — Above-the-fold lead capture.
 * Collects name + phone + ZIP. Vehicle details collected on thank-you page (progressive capture).
 */
export default function QuickCaptureForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [zip, setZip] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formStarted, setFormStarted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const market = resolveMarket(pathname);
  const { displayPhone } = getPhoneForMarket(market);

  const normalizePhoneDigits = (value: string) => {
    return value.replace(/\D/g, '').replace(/^1/, '').slice(0, 10);
  };

  const formatPhone = (value: string) => {
    const digits = normalizePhoneDigits(value);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleFieldFocus = () => {
    if (!formStarted) {
      trackFormStart('quick_capture');
      setFormStarted(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your name');
      return;
    }
    const digits = normalizePhoneDigits(phone);
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (zip.length !== 5 || !/^\d{5}$/.test(zip)) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const sessionId = getSessionId();
      const gclid = getGclid();
      const msclkid = getMsclkid();
      const utmParams = getUTMParams();
      const utmSource = utmParams.source || null;

      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          zip,
          hasInsurance: 'unsure',
          source: 'hero_quick_capture',
          timestamp: new Date().toISOString(),
          sessionId,
          gclid,
          msclkid,
          utmSource,
          utmMedium: utmParams.medium,
          utmCampaign: utmParams.campaign,
          utmTerm: utmParams.term,
          utmContent: utmParams.content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store leadId for progressive capture on thank-you page
        if (data.leadId) {
          sessionStorage.setItem('pending_lead_id', data.leadId);
        }
        await trackFormSubmission('hero_quick_capture', { leadId: data.leadId, phone });
        router.push('/thank-you');
      } else {
        setError(`Something went wrong. Call us at ${displayPhone}`);
      }
    } catch {
      setError(`Something went wrong. Call us at ${displayPhone}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
      <p className="text-white/90 text-sm mb-3 font-medium">Get a callback in 5 minutes:</p>
      <div className="flex flex-col gap-2">
        {/* Row 1: Name */}
        <input
          type="text"
          placeholder="Your name"
          aria-label="Your name"
          autoComplete="name"
          value={name}
          onChange={(e) => { handleFieldFocus(); setName(e.target.value); }}
          className="w-full px-4 py-3 rounded-lg text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
          required
        />
        {/* Row 2: Phone + ZIP + Submit */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="tel"
            placeholder="Phone number"
            aria-label="Phone number"
            autoComplete="tel"
            value={phone}
            onChange={(e) => { handleFieldFocus(); setPhone(formatPhone(e.target.value)); }}
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
            required
          />
          <input
            type="text"
            placeholder="ZIP"
            aria-label="ZIP code"
            autoComplete="postal-code"
            value={zip}
            onChange={(e) => { handleFieldFocus(); setZip(e.target.value.replace(/\D/g, '').slice(0, 5)); }}
            className="w-full sm:w-24 px-4 py-3 rounded-lg text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
            required
            maxLength={5}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {isSubmitting ? 'Sending...' : 'Get Quote'}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-red-200 text-sm mt-2">{error}</p>
      )}
      <p className="text-white/60 text-xs mt-2">No spam. We&apos;ll call or text to confirm details.</p>
    </form>
  );
}
