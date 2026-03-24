'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Phone, ChevronRight } from 'lucide-react';
import { trackFormStart, trackFormSubmission, getSessionId, getGclid, getMsclkid, getUTMParams } from '@/lib/tracking';

const CARRIERS = [
  'Progressive',
  'State Farm',
  'Geico',
  'Allstate',
  'AAA',
  'USAA',
  'Farmers',
  'Liberty Mutual',
  'Safeco',
  'Esurance',
  'Nationwide',
  'Travelers',
  'American Family',
  'The Hartford',
  'MetLife',
  'Other',
];

interface InsuranceQuoteFormProps {
  carrier?: string; // Pre-select carrier if on a carrier-specific page
  source?: string;
  market?: 'colorado' | 'arizona';
}

export default function InsuranceQuoteForm({ carrier, source = 'insurance_page', market = 'colorado' }: InsuranceQuoteFormProps) {
  const isArizona = market === 'arizona';
  const phoneE164 = isArizona ? '+14807127465' : '+17209187465';
  const displayPhone = isArizona ? '(480) 712-7465' : '(720) 918-7465';
  const stateLabel = isArizona ? 'Arizona' : 'Colorado';
  const router = useRouter();
  const [formStarted, setFormStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState(carrier || '');

  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formStarted) {
      trackFormStart(source);
      setFormStarted(true);
    }
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const sessionId = getSessionId();
      const gclid = getGclid();
      const msclkid = getMsclkid();
      const utmParams = getUTMParams();
      const utmSource = utmParams.source || 'direct';

      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Insurance Lead',
          phone,
          zip: '80000',
          hasInsurance: 'yes',
          insuranceCarrier: selectedCarrier || null,
          smsConsent: false,
          source,
          timestamp: new Date().toISOString(),
          sessionId,
          gclid,
          msclkid,
          utmSource,
          utmMedium: utmParams.medium,
          utmCampaign: utmParams.campaign,
          utmTerm: utmParams.term,
          utmContent: utmParams.content,
          firstTouch: {
            utm_source: utmSource,
            referrer: document.referrer || 'direct',
          },
          lastTouch: {
            utm_source: utmSource,
            referrer: document.referrer || 'direct',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        trackFormSubmission(source, { leadId: data.leadId, phone });
        router.push('/thank-you');
      } else {
        alert(`Something went wrong. Please call us at ${displayPhone}`);
      }
    } catch {
      alert(`Something went wrong. Please call us at ${displayPhone}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-teal-100 p-6 sm:p-8">
      {/* Social proof header */}
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-teal-600 shrink-0" />
        <p className="text-sm font-medium text-teal-700">
          Most {stateLabel} drivers pay <strong>$0 out of pocket</strong>
        </p>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-1">
        Get Your $0 Appointment
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        We verify your coverage in 2 minutes and book same-day service.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Carrier selector */}
        <div>
          <label htmlFor="ins-carrier" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Your insurance carrier
          </label>
          <select
            id="ins-carrier"
            value={selectedCarrier}
            onChange={(e) => setSelectedCarrier(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
          >
            <option value="">Select your carrier...</option>
            {CARRIERS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="ins-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Your phone number
          </label>
          <input
            id="ins-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(720) 555-1234"
            value={phone}
            onChange={handlePhoneChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Honeypot */}
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !phone}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors flex items-center justify-center gap-2 min-h-[56px]"
        >
          {isSubmitting ? (
            <span>Submitting...</span>
          ) : (
            <>
              <span>Confirm Coverage &amp; Book</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          We call you to verify coverage — takes about 2 minutes.
          Won&apos;t affect your rates.
        </p>
      </form>

      {/* Or call directly */}
      <div className="mt-5 pt-5 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500 mb-2">Prefer to call?</p>
        <a
          href={`tel:${phoneE164}`}
          className="inline-flex items-center gap-2 text-teal-700 font-semibold hover:text-teal-800 transition-colors"
        >
          <Phone className="w-4 h-4" />
          {displayPhone}
        </a>
      </div>
    </div>
  );
}
