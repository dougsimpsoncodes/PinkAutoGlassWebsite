'use client';

import { FormEvent, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Phone } from 'lucide-react';
import { getNextTwoWorkingDays, pillDateLabel, pillDayLabel, toIsoLocal } from '@/lib/quote/schedule-slots';
import { trackFormSubmission } from '@/lib/tracking';
import { trackPurchase } from '@/lib/analytics';
import type { SatelliteQuoterTrackingContext } from '@/lib/satellite-quoter/tracking';

/**
 * Booking form inside the priced-state PricedHero. Per the 2026-05-28 owner
 * walkthrough of mobile conversion:
 *   - 4-pill time picker (Today/Tomorrow × AM/PM with actual date + time
 *     range), replacing a separate day dropdown + AM/PM toggle. Removes two
 *     "field cards" worth of vertical space.
 *   - 2-col field layout (Name/Phone paired, Address+ZIP paired)
 *   - Email field removed; captured later via SMS follow-up
 *   - Single Book my install submit button at the bottom (no sticky duplicate)
 */

interface QuoteBookingFormProps {
  quoteToken: string;
  totalDollars: string;
  trackingContext?: SatelliteQuoterTrackingContext;
  initialCustomer?: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
  initialZip?: string;
}

interface BookingSuccess {
  bookingToken: string;
  status: string;
  channels: Array<{ channel: 'email' | 'sms'; outcome: 'sent' | 'skipped' | 'failed'; reason?: string }>;
}

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; result: BookingSuccess; submitted: SubmittedSnapshot }
  | { kind: 'error'; message: string };

interface SubmittedSnapshot {
  fullName: string;
  street: string;
  date: string;
  window: 'AM' | 'PM';
  dayLabel: string;
}

/**
 * The 4 slots offered by the pill picker — next 2 working days × AM/PM.
 * Per Dan 2026-05-28: no same-day appointments. Pink works Mon-Sat (Sundays
 * off). US federal holidays are skipped. Label uses "Tomorrow" only when
 * day-1 is literally today+1; otherwise day-of-week (so a Saturday customer
 * sees "Mon" not a misleading "Tomorrow Mon").
 *
 * Day-1/Day-2 selection logic lives in src/lib/quote/schedule-slots.ts.
 */
type SlotKey = 'day1_am' | 'day1_pm' | 'day2_am' | 'day2_pm';

interface SlotOption {
  key: SlotKey;
  date: string;          // ISO YYYY-MM-DD
  window: 'AM' | 'PM';
  dayLabel: string;      // "Tomorrow" / "Sat" / "Mon" / etc
  dateLabel: string;     // "5/29"
  timeLabel: string;     // "8a-12p" / "12p-5p"
}

function buildSlotOptions(now: Date = new Date()): SlotOption[] {
  const [day1, day2] = getNextTwoWorkingDays(now);
  const day1Label = pillDayLabel(day1, now);
  const day2Label = pillDayLabel(day2, now);

  return [
    { key: 'day1_am', date: toIsoLocal(day1), window: 'AM', dayLabel: day1Label, dateLabel: pillDateLabel(day1), timeLabel: '8a-12p' },
    { key: 'day1_pm', date: toIsoLocal(day1), window: 'PM', dayLabel: day1Label, dateLabel: pillDateLabel(day1), timeLabel: '12p-5p' },
    { key: 'day2_am', date: toIsoLocal(day2), window: 'AM', dayLabel: day2Label, dateLabel: pillDateLabel(day2), timeLabel: '8a-12p' },
    { key: 'day2_pm', date: toIsoLocal(day2), window: 'PM', dayLabel: day2Label, dateLabel: pillDateLabel(day2), timeLabel: '12p-5p' },
  ];
}

function readVariantCookie(): string {
  if (typeof document === 'undefined') return 'control';
  const match = document.cookie.split('; ').find(c => c.startsWith('pag_variant='));
  if (!match) return 'control';
  return decodeURIComponent(match.split('=')[1]) || 'control';
}

export default function QuoteBookingForm({
  quoteToken,
  totalDollars,
  trackingContext,
  initialCustomer,
  initialZip,
}: QuoteBookingFormProps) {
  const [submit, setSubmit] = useState<SubmitState>({ kind: 'idle' });
  const slots = useMemo(buildSlotOptions, []);
  const [selectedSlot, setSelectedSlot] = useState<SlotKey>('day1_am');

  const [fullName, setFullName] = useState(initialCustomer?.fullName || '');
  const [phone, setPhone] = useState(initialCustomer?.phone || '');
  const [email, setEmail] = useState(initialCustomer?.email || '');
  const [street, setStreet] = useState('');
  const [installZip, setInstallZip] = useState(initialZip || '');
  const [smsConsent, setSmsConsent] = useState(true);
  const [honeypot, setHoneypot] = useState('');

  // Strip every non-digit, count to 10. Phone is valid only with 10 digits.
  const phoneDigits = phone.replace(/\D/g, '');
  // Email is optional. When non-empty, must look email-shaped before submit.
  const emailTrimmed = email.trim();
  const emailValid = emailTrimmed === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
  const ready = fullName.trim().length >= 2
    && phoneDigits.length === 10
    && street.trim().length >= 3
    && /^\d{5}(-\d{4})?$/.test(installZip.trim())
    && emailValid;

  // Auto-format phone as (XXX) XXX-XXXX as the user types.
  function formatPhoneInput(raw: string) {
    const d = raw.replace(/\D/g, '').slice(0, 10);
    if (d.length === 0) return '';
    if (d.length < 4) return `(${d}`;
    if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }

  if (submit.kind === 'success') {
    return <BookingConfirmation success={submit.result} submitted={submit.submitted} />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    const slot = slots.find(s => s.key === selectedSlot);
    if (!slot) return;
    setSubmit({ kind: 'submitting' });
    try {
      const response = await fetch('/api/quote/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteToken,
          customer: { fullName, phone, email: emailTrimmed || undefined },
          install: { street, zip: installZip.trim(), date: slot.date, window: slot.window },
          smsConsent,
          honeypot,
          variantId: readVariantCookie(),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setSubmit({ kind: 'error', message: data.error || 'We could not complete the booking. Please call (720) 918-7465.' });
        return;
      }
      setSubmit({
        kind: 'success',
        result: { bookingToken: data.bookingToken, status: data.notification?.status, channels: data.notification?.channels || [] },
        submitted: { fullName, street, date: slot.date, window: slot.window, dayLabel: `${slot.dayLabel} ${slot.dateLabel}` },
      });
      // Fire GA4 purchase event — enables ROAS bidding in Google Ads.
      // transaction_id = bookingToken deduplicates on re-render.
      // Server-resolved accepted price (discount applied) keeps ROAS honest.
      const acceptedDollars = typeof data.acceptedTotalCents === 'number'
        ? data.acceptedTotalCents / 100
        : parseFloat(totalDollars) || 150;
      trackPurchase(
        data.bookingToken,
        acceptedDollars,
        'Windshield Service',
      );

      // Fire booking-conversion event with the same `quote_form` name so Google Ads
      // + Microsoft Ads pick it up. Phone/email are captured for enhanced conversions.
      trackFormSubmission('quote_form', {
        stage: 'booked',
        booking_token: data.bookingToken,
        phone,
        email: emailTrimmed || undefined,
        install_date: slot.date,
        install_window: slot.window,
        ...trackingContext,
      }).catch(() => { /* analytics never blocks UX */ });
    } catch {
      setSubmit({ kind: 'error', message: 'Booking is temporarily unavailable. Please call (720) 918-7465.' });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {/* 4-pill picker — day + date + time range */}
      <div className="grid grid-cols-4 gap-2">
        {slots.map(slot => {
          const active = slot.key === selectedSlot;
          return (
            <button
              type="button"
              key={slot.key}
              onClick={() => setSelectedSlot(slot.key)}
              className={
                'rounded-md px-1 py-2 text-center transition ' +
                (active
                  ? 'border-2 border-pink-500 bg-pink-50 ring-2 ring-pink-200'
                  : 'border border-gray-300 bg-white hover:border-pink-300')
              }
            >
              <span className="block text-xs font-bold text-gray-900">{slot.dayLabel}</span>
              <span className="block text-[10px] text-gray-500">{slot.dateLabel}</span>
              <span className="block text-[11px] font-semibold text-gray-700 mt-0.5">{slot.timeLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Name + Phone paired */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Name</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-3 text-base focus:border-pink-500 focus:outline-none"
            placeholder="Jane Doe"
            aria-label="Your name"
            required
            minLength={2}
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Phone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            // Guard 2: onKeyDown strips letters before they ever reach the
            // input on hardware keyboards. The onChange handler already
            // strips non-digits, but blocking at keypress prevents the
            // 1-frame flicker some users notice when typing letters fast.
            onKeyDown={(e) => {
              // Allow: digits, formatting/structural keys, modifier combos
              if (e.metaKey || e.ctrlKey || e.altKey) return;
              const allowed = ['Backspace', 'Delete', 'Tab', 'Enter', 'Home', 'End',
                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
              if (allowed.includes(e.key)) return;
              if (/^\d$/.test(e.key)) return;
              e.preventDefault();
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-3 text-base focus:border-pink-500 focus:outline-none"
            placeholder="(720) 555-1234"
            aria-label="Phone"
            type="tel"
            required
            autoComplete="tel"
            // numeric (not tel) gives a pure number-pad on iOS — no * or #
            // characters; less chance a user thinks the field accepts text.
            inputMode="numeric"
            maxLength={14}
          />
        </label>
      </div>

      {/* Address + ZIP paired */}
      <div className="grid grid-cols-[1fr_100px] gap-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Install address</span>
          <input
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-3 text-base focus:border-pink-500 focus:outline-none"
            placeholder="1234 Main St"
            aria-label="Install address"
            required
            minLength={3}
            autoComplete="street-address"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">ZIP</span>
          <input
            value={installZip}
            onChange={(e) => setInstallZip(e.target.value.replace(/[^0-9-]/g, '').slice(0, 10))}
            className="w-full rounded-md border border-gray-300 px-3 py-3 text-base focus:border-pink-500 focus:outline-none"
            placeholder="80202"
            aria-label="ZIP"
            required
            inputMode="numeric"
            autoComplete="postal-code"
          />
        </label>
      </div>

      {/* Optional email — paper-trail confirmation for customers who want one.
          Not required; phone is the dispatch channel. Per council reco 2026-05-28. */}
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
          Email <span className="text-gray-400 font-normal normal-case tracking-normal">(optional — for confirmation)</span>
        </span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full rounded-md border px-3 py-3 text-base focus:border-pink-500 focus:outline-none ${
            emailValid ? 'border-gray-300' : 'border-red-400'
          }`}
          placeholder="you@example.com"
          aria-label="Email (optional)"
          type="email"
          autoComplete="email"
          inputMode="email"
        />
        {!emailValid && (
          <span className="mt-1 block text-xs text-red-600">Please enter a valid email or leave blank.</span>
        )}
      </label>

      <label className="flex items-start gap-2 text-xs text-gray-600">
        <input
          type="checkbox"
          checked={smsConsent}
          onChange={(e) => setSmsConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
        />
        <span>Text me booking updates · Reply STOP to opt out</span>
      </label>

      {/* Honeypot — invisible to humans, attractive to bots */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {submit.kind === 'error' && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {submit.message}
        </div>
      )}

      <button
        type="submit"
        disabled={!ready || submit.kind === 'submitting'}
        className="inline-flex w-full items-center justify-between gap-2 rounded-lg bg-pink-600 px-5 py-5 text-lg font-bold text-white shadow-sm hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        <span className="flex items-center gap-2">
          {submit.kind === 'submitting' && <Loader2 className="h-5 w-5 animate-spin" />}
          Book my install
        </span>
        <span>${totalDollars}</span>
      </button>

      <a
        href="tel:+17209187465"
        className="block w-full text-center text-sm font-semibold text-gray-500 hover:text-pink-600"
      >
        <Phone className="inline h-4 w-4 mr-1 -mt-0.5" />
        Prefer to call? (720) 918-7465
      </a>

      <p className="text-center text-xs text-gray-500">
        No charge today. We&apos;ll confirm by phone or text before arrival.
      </p>
    </form>
  );
}

function BookingConfirmation({ success, submitted }: { success: BookingSuccess; submitted: SubmittedSnapshot }) {
  const window = submitted.window === 'AM' ? '8a-12p' : '12p-5p';
  return (
    <div className="rounded-md border border-green-200 bg-green-50 p-5">
      <CheckCircle2 className="mb-3 h-9 w-9 text-green-600" />
      <h3 className="text-lg font-bold text-gray-900">You&apos;re booked, {submitted.fullName.split(' ')[0]}.</h3>
      <p className="mt-1 text-sm text-gray-700">
        Reference: <span className="font-mono font-semibold">{success.bookingToken}</span>
      </p>
      <div className="mt-4 space-y-2 rounded-md border border-green-200 bg-white p-3 text-sm">
        <div className="flex justify-between gap-4"><span className="text-gray-600">When</span><span className="font-semibold text-gray-900">{submitted.dayLabel}, {window}</span></div>
        <div className="flex justify-between gap-4"><span className="text-gray-600">Where</span><span className="font-semibold text-gray-900">{submitted.street}</span></div>
      </div>
      <p className="mt-4 text-sm text-gray-700">
        We&apos;ll text you a heads-up about 30 minutes before arrival. Need to change something? Call{' '}
        <a href="tel:+17209187465" className="font-semibold text-pink-700">(720) 918-7465</a> and mention reference <strong>{success.bookingToken}</strong>.
      </p>
    </div>
  );
}
