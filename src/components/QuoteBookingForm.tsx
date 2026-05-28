'use client';

import { FormEvent, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Phone, ShieldCheck, User } from 'lucide-react';

interface QuoteBookingFormProps {
  quoteToken: string;
  /**
   * Quote-time ZIP if the upstream form happened to capture one. May be
   * empty after the price-first redesign that killed the ZIP entry stage;
   * the booking form now collects ZIP as part of the install address
   * regardless. This prop is only used to pre-fill when present.
   */
  zip?: string;
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
}

const WINDOWS: Array<{ value: 'AM' | 'PM'; label: string; sub: string }> = [
  { value: 'AM', label: 'Morning', sub: '8a-12p' },
  { value: 'PM', label: 'Afternoon', sub: '12-5p' },
];

function nextDayOptions(): Array<{ value: string; label: string }> {
  // Next 14 days starting today.
  const now = new Date();
  const out: Array<{ value: string; label: string }> = [];
  for (let i = 0; i < 14; i += 1) {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + i);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;
    const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getDay()];
    const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dt.getMonth()];
    const label = i === 0 ? `Today (${dow} ${mon} ${dt.getDate()})` : i === 1 ? `Tomorrow (${dow} ${mon} ${dt.getDate()})` : `${dow} ${mon} ${dt.getDate()}`;
    out.push({ value: iso, label });
  }
  return out;
}

function readVariantCookie(): string {
  if (typeof document === 'undefined') return 'control';
  const match = document.cookie.split('; ').find(c => c.startsWith('pag_variant='));
  if (!match) return 'control';
  return decodeURIComponent(match.split('=')[1]) || 'control';
}

export default function QuoteBookingForm({ quoteToken, zip: initialZip }: QuoteBookingFormProps) {
  const [submit, setSubmit] = useState<SubmitState>({ kind: 'idle' });

  const dayOptions = useMemo(nextDayOptions, []);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [installZip, setInstallZip] = useState(initialZip || '');
  const [installDate, setInstallDate] = useState(dayOptions[1]?.value ?? dayOptions[0]?.value);
  const [installWindow, setInstallWindow] = useState<'AM' | 'PM'>('AM');
  const [smsConsent, setSmsConsent] = useState(true);
  // Honeypot: bots fill every field they can see. We hide this from real users
  // with CSS but expose it in the DOM so scrapers will populate it.
  const [honeypot, setHoneypot] = useState('');

  const ready = fullName.trim().length >= 2
    && phone.trim().length >= 7
    && street.trim().length >= 3
    && /^\d{5}(-\d{4})?$/.test(installZip.trim())
    && installDate;

  if (submit.kind === 'success') {
    return <BookingConfirmation success={submit.result} submitted={submit.submitted} />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    setSubmit({ kind: 'submitting' });
    try {
      const response = await fetch('/api/quote/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteToken,
          customer: { fullName, phone, email: email || undefined },
          install: { street, zip: installZip.trim(), date: installDate, window: installWindow },
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
        submitted: { fullName, street, date: installDate, window: installWindow },
      });
    } catch {
      setSubmit({ kind: 'error', message: 'Booking is temporarily unavailable. Please call (720) 918-7465.' });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-gray-700">When</span>
        <select
          value={installDate}
          onChange={(e) => setInstallDate(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-3 focus:border-pink-500 focus:outline-none"
        >
          {dayOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        {WINDOWS.map(w => {
          const active = installWindow === w.value;
          return (
            <button
              type="button"
              key={w.value}
              onClick={() => setInstallWindow(w.value)}
              className={`rounded-md border px-3 py-3 text-left transition ${active ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-200' : 'border-gray-300 bg-white hover:border-pink-300'}`}
            >
              <span className="block text-sm font-semibold text-gray-900">{w.label}</span>
              <span className="block text-xs text-gray-600">{w.sub}</span>
            </button>
          );
        })}
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-gray-700">Your full name</span>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-3 pl-9 pr-3 focus:border-pink-500 focus:outline-none"
            placeholder="Alex Rivera"
            required
            minLength={2}
            autoComplete="name"
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-gray-700">Phone</span>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-3 pl-9 pr-3 focus:border-pink-500 focus:outline-none"
            placeholder="(720) 555-1212"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-gray-700">Install address</span>
        <input
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-3 focus:border-pink-500 focus:outline-none"
          placeholder="123 Main St, Apt 4"
          required
          minLength={3}
          autoComplete="street-address"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-gray-700">Install ZIP</span>
        <input
          value={installZip}
          onChange={(e) => setInstallZip(e.target.value.replace(/[^0-9-]/g, '').slice(0, 10))}
          className="w-full rounded-md border border-gray-300 px-3 py-3 focus:border-pink-500 focus:outline-none"
          placeholder="80202"
          required
          inputMode="numeric"
          autoComplete="postal-code"
        />
        <span className="mt-1 block text-xs text-gray-500">
          We serve Colorado Front Range and Phoenix metro.
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-gray-700">Email <span className="font-normal text-gray-500">(optional)</span></span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-3 focus:border-pink-500 focus:outline-none"
          placeholder="alex@example.com"
          type="email"
          autoComplete="email"
        />
      </label>

      <label className="flex items-start gap-3 rounded-md bg-gray-50 p-3 text-sm">
        <input
          type="checkbox"
          checked={smsConsent}
          onChange={(e) => setSmsConsent(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
        />
        <span className="text-gray-700">
          Pink Auto Glass can text me booking-related updates (arrival window, ETA). Reply STOP to opt out.
        </span>
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
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{submit.message}</div>
      )}

      <button
        type="submit"
        disabled={!ready || submit.kind === 'submitting'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-5 py-3 text-base font-bold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {submit.kind === 'submitting' ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
        Book my install
      </button>

      <p className="text-center text-xs text-gray-500">
        No charge today. Pink confirms by phone or text before arrival.
      </p>
    </form>
  );
}

function BookingConfirmation({ success, submitted }: { success: BookingSuccess; submitted: SubmittedSnapshot }) {
  const window = submitted.window === 'AM' ? 'Morning (8a-12p)' : 'Afternoon (12-5p)';
  return (
    <div className="mt-5 rounded-md border border-green-200 bg-green-50 p-5">
      <CheckCircle2 className="mb-3 h-9 w-9 text-green-600" />
      <h3 className="text-lg font-bold text-gray-900">You're booked, {submitted.fullName.split(' ')[0]}.</h3>
      <p className="mt-1 text-sm text-gray-700">
        Reference: <span className="font-mono font-semibold">{success.bookingToken}</span>
      </p>
      <div className="mt-4 space-y-2 rounded-md border border-green-200 bg-white p-3 text-sm">
        <div className="flex justify-between gap-4"><span className="text-gray-600">When</span><span className="font-semibold text-gray-900">{submitted.date}, {window}</span></div>
        <div className="flex justify-between gap-4"><span className="text-gray-600">Where</span><span className="font-semibold text-gray-900">{submitted.street}</span></div>
      </div>
      <p className="mt-4 text-sm text-gray-700">
        Pink Auto Glass will reach out to confirm the window and answer any insurance questions. Need to change something? Call <a href="tel:+17209187465" className="font-semibold text-pink-700">(720) 918-7465</a> and mention reference <strong>{success.bookingToken}</strong>.
      </p>
    </div>
  );
}
