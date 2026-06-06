'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Phone,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { isStateInServiceArea, OUT_OF_AREA_STATE_MESSAGE } from '@/lib/quote/service-area';
import QuoteBookingForm from '@/components/QuoteBookingForm';
import {
  getGclid,
  getMsclkid,
  getSessionId,
  getUTMParams,
  getVisitorId,
  trackFormSubmission,
  trackEvent,
  trackQuoteGeneratedConversion,
} from '@/lib/tracking';
import { getMarketFromPath, type Market } from '@/lib/market';
import type { SatelliteQuoterTrackingContext } from '@/lib/satellite-quoter/tracking';

/**
 * Best-effort surface + market tags for quote analytics. Surface is the route
 * the quoter is mounted on; market prefers the plate state (CO/AZ) the user
 * picked, falling back to the page path. Both are diagnostic metadata only —
 * they never change which ad-conversion fires.
 */
function quoteSurface(trackingContext?: SatelliteQuoterTrackingContext): string {
  if (trackingContext?.surface) return trackingContext.surface;
  if (typeof window === 'undefined') return 'unknown';
  return window.location.pathname || 'unknown';
}

function resolveQuoteMarket(
  plateState: string,
  trackingContext?: SatelliteQuoterTrackingContext
): Market | undefined {
  if (plateState === 'CO') return 'colorado';
  if (plateState === 'AZ') return 'arizona';
  if (trackingContext?.marketHint === 'colorado' || trackingContext?.marketHint === 'arizona') {
    return trackingContext.marketHint;
  }
  if (typeof window !== 'undefined') return getMarketFromPath(window.location.pathname) ?? undefined;
  return undefined;
}

/**
 * Contact-gated quote flow (2026-06-05 partner requirement).
 *
 * Stage 1 — Vehicle: plate + state inline, VIN available as a tab.
 *   State-based service-area gate (CO + AZ pass; others blocked at lookup).
 *   ZIP is collected later at the booking step instead of as its own stage,
 *   per Codex+Gemini council (C) — eliminates the duplicate-ask friction.
 * Stage 2 — Contact: matched vehicle confirmation + minimal lead capture.
 *   Partner-safe: price is not revealed until name + phone are saved.
 * Stage 3 — Priced: price as hero, then one Schedule CTA that expands booking.
 */

type Stage = 'vehicle' | 'contact' | 'priced';
type VehicleMode = 'plate' | 'vin';

interface AutomatedQuoteFormProps {
  flowMode?: 'standard' | 'zip-first-unlocked';
  showIntro?: boolean;
  trackingContext?: SatelliteQuoterTrackingContext;
}

interface VehicleState {
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
}

interface QuoteLineItem {
  kind: string;
  description: string;
  amountCents: number;
}

interface QuoteResult {
  success: boolean;
  status: 'ready_exact' | 'ready_estimate' | 'manual_review';
  quoteToken?: string;
  message?: string;
  pricing?: {
    totalCents: number;
    totalDollars: number;
    lineItems: QuoteLineItem[];
    confidenceReasons: string[];
  };
  selectedPart?: {
    brand?: string;
    description?: string;
    qtyAvailable?: number;
    estimatedDeliveryDate?: string;
  };
  adas?: { requiresCalibration: boolean; calibrations: Array<{ type?: string; sensor?: string }> };
}

interface QuoteContactState {
  fullName: string;
  phone: string;
  email: string;
}

// All 50 US states + DC. Service-area enforcement is downstream (per ZIP at
// booking time); the dropdown is comprehensive so out-of-state customers
// don't bounce at this step.
const STATE_OPTIONS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI',
  'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN',
  'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH',
  'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA',
  'WV', 'WI', 'WY',
];

function currentSessionId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return getSessionId();
}

function vehicleLine(vehicle: VehicleState): string {
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ');
}

function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function AutomatedQuoteForm({
  flowMode = 'standard',
  showIntro = true,
  trackingContext,
}: AutomatedQuoteFormProps) {
  const [stage, setStage] = useState<Stage>('vehicle');
  const [vehicleMode, setVehicleMode] = useState<VehicleMode>('plate');
  const [pendingVehicleMode, setPendingVehicleMode] = useState<VehicleMode>('plate');
  const [plate, setPlate] = useState('');
  const [plateState, setPlateState] = useState('');
  const [vehicle, setVehicle] = useState<VehicleState>({ vin: '', year: '', make: '', model: '', trim: '' });
  const [contact, setContact] = useState<QuoteContactState>({ fullName: '', phone: '', email: '' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (!retryAfter) return;
    const tick = () => {
      const remaining = Math.ceil((retryAfter - Date.now()) / 1000);
      if (remaining <= 0) { setCooldownSeconds(0); setRetryAfter(null); }
      else setCooldownSeconds(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [retryAfter]);

  // Diagnostic-only funnel telemetry. Routes through trackEvent (GA4 + DB),
  // NEVER trackFormSubmission/trackConversion, so diagnostic funnel events can
  // never inflate Google/Microsoft Ads conversions.
  function fireQuoteDiagnostic(eventName: string, extra?: Record<string, unknown>) {
    trackEvent({
      eventName,
      eventCategory: 'quote_funnel_diagnostic',
      metadata: {
        surface: quoteSurface(trackingContext),
        market: resolveQuoteMarket(plateState, trackingContext),
        flow_mode: flowMode,
        ...trackingContext,
        ...extra,
      },
    }).catch(() => { /* diagnostics never block UX */ });
  }

  async function lookupPlate() {
    if (!isStateInServiceArea(plateState)) {
      setNotice(OUT_OF_AREA_STATE_MESSAGE);
      return;
    }
    setNotice('');
    fireQuoteDiagnostic('quote_attempt_plate');
    setBusy(true);
    try {
      const response = await fetch('/api/quote/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plate, state: plateState }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setNotice(data.message || data.error || "We couldn't find that plate. Try a VIN below, or call (720) 918-7465.");
        setRetryAfter(Date.now() + 60_000);
        return;
      }
      const v: VehicleState = {
        vin: data.vehicle?.vin || '',
        year: data.vehicle?.year ? String(data.vehicle.year) : '',
        make: data.vehicle?.make || '',
        model: data.vehicle?.model || '',
        trim: data.vehicle?.trim || '',
      };
      setVehicle(v);
      setPendingVehicleMode('plate');
      setStage('contact');
      fireQuoteDiagnostic('quote_contact_gate_shown', { via: 'plate' });
    } catch {
      setNotice('Plate lookup is temporarily unavailable. Try a VIN below, or call (720) 918-7465.');
    } finally {
      setBusy(false);
    }
  }

  async function lookupVin() {
    setNotice('');
    fireQuoteDiagnostic('quote_attempt_vin');
    setBusy(true);
    try {
      const response = await fetch('/api/quote/decode-vin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin: vehicle.vin }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setNotice(data.message || data.error || "We couldn't decode that VIN. Double-check it or call (720) 918-7465.");
        return;
      }
      const v: VehicleState = {
        vin: data.vehicle?.vin || vehicle.vin,
        year: data.vehicle?.year ? String(data.vehicle.year) : '',
        make: data.vehicle?.make || '',
        model: data.vehicle?.model || '',
        trim: data.vehicle?.trim || '',
      };
      setVehicle(v);
      setPendingVehicleMode('vin');
      setStage('contact');
      fireQuoteDiagnostic('quote_contact_gate_shown', { via: 'vin' });
    } catch {
      setNotice('VIN lookup is temporarily unavailable. Call (720) 918-7465.');
    } finally {
      setBusy(false);
    }
  }

  async function requestPrice(v: VehicleState, mode: VehicleMode, contactToSave?: QuoteContactState) {
    try {
      const response = await fetch('/api/quote/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId(),
          clientId: getVisitorId(),
          vehicle: {
            vin: v.vin || undefined,
            year: Number.parseInt(v.year, 10),
            make: v.make,
            model: v.model,
            trim: v.trim || undefined,
          },
          state: plateState,
          plateLast4: plate.slice(-4),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setNotice(data.error || 'Quote pricing is unavailable. Call (720) 918-7465.');
        return;
      }
      if (data?.vehicle) {
        setVehicle({
          vin: data.vehicle.vin || v.vin,
          year: data.vehicle.year ? String(data.vehicle.year) : v.year,
          make: data.vehicle.make || v.make,
          model: data.vehicle.model || v.model,
          trim: data.vehicle.trim ?? v.trim,
        });
      }
      if (contactToSave) {
        if (!data.quoteToken) {
          setNotice('We found your vehicle, but could not save the quote reference. Please try again or call (720) 918-7465.');
          return;
        }

        const utm = getUTMParams();
        const contactResponse = await fetch('/api/quote/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteToken: data.quoteToken,
            fullName: contactToSave.fullName,
            phone: contactToSave.phone,
            email: contactToSave.email || '',
            smsConsent: contactToSave.phone.trim().length > 0,
            clientId: getVisitorId(),
            sessionId: currentSessionId(),
            utmSource: utm.source || '',
            utmMedium: utm.medium || '',
            utmCampaign: utm.campaign || '',
            utmTerm: utm.term || '',
            utmContent: utm.content || '',
            gclid: getGclid() || '',
            msclkid: getMsclkid() || '',
            state: plateState,
          }),
        });
        const contactData = await contactResponse.json().catch(() => ({}));
        if (!contactResponse.ok || !contactData.success) {
          setNotice(contactData.error || 'We found your price, but could not save your contact info. Please try again or call (720) 918-7465.');
          return;
        }
        fireQuoteDiagnostic('quote_contact_saved', {
          via: mode,
          quote_token: data.quoteToken,
        });
        trackFormSubmission('quote_form', {
          stage: 'contact_saved',
          leadId: contactData.leadId,
          quote_token: data.quoteToken,
          phone: contactToSave.phone,
          email: contactToSave.email || undefined,
          vehicle_year: v.year ? Number.parseInt(v.year, 10) : undefined,
          vehicle_make: v.make,
          vehicle_model: v.model,
          surface: quoteSurface(trackingContext),
          market: resolveQuoteMarket(plateState, trackingContext),
          flow_mode: flowMode,
          ...trackingContext,
        }).catch(() => { /* analytics never blocks UX */ });
      }
      setQuote(data);
      setStage('priced');

      if (data.status !== 'manual_review' && data.pricing) {
        // Fire quote_generated to GA4 AND write a DB row so the server-side
        // funnel has visibility into the middle step (page_view → quote_generated
        // → purchase). NOT a Key Event — keeps Smart Bidding signal clean.
        trackQuoteGeneratedConversion(
          'windshield',
          `${v.year} ${v.make} ${v.model}`.trim(),
          {
            quote_token: data?.quoteToken,
            quote_total_cents: data?.pricing?.totalCents,
            vehicle_year: v.year ? Number.parseInt(v.year, 10) : undefined,
            vehicle_make: v.make,
            vehicle_model: v.model,
            surface: quoteSurface(trackingContext),
            market: resolveQuoteMarket(plateState, trackingContext),
            flow_mode: flowMode,
            ...trackingContext,
          },
        ).catch(() => { /* analytics never blocks UX */ });

        // A real price was shown — log this as a funnel 'priced' event so the
        // Quoter Funnel report can count it, but do NOT fire the Ads bidding
        // conversion. Price-shown is a non-contact, window-shopping step; firing
        // it here trained Google/Microsoft toward price curiosity instead of
        // captured leads. Contact-saved and booking fire the bidding conversions.
        trackFormSubmission('quote_form', {
          stage: 'priced',
          quote_token: data?.quoteToken,
          quote_total_cents: data?.pricing?.totalCents,
          vehicle_year: v.year ? Number.parseInt(v.year, 10) : undefined,
          vehicle_make: v.make,
          vehicle_model: v.model,
          surface: quoteSurface(trackingContext),
          market: resolveQuoteMarket(plateState, trackingContext),
          flow_mode: flowMode,
          ...trackingContext,
        }, { fireAds: false }).catch(() => { /* analytics never blocks UX */ });
      } else {
        fireQuoteDiagnostic('diagnostic_manual_review', {
          via: mode,
          quote_token: data?.quoteToken,
        });
      }
    } catch {
      setNotice('Quote pricing is unavailable. Call (720) 918-7465.');
    }
  }

  async function submitContactAndPrice() {
    const phoneDigits = contact.phone.replace(/\D/g, '');
    if (contact.fullName.trim().length < 2 || phoneDigits.length !== 10) {
      setNotice('Enter your name and a valid mobile phone number to see your installed price.');
      return;
    }
    if (contact.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      setNotice('Enter a valid email, or leave the email field blank.');
      return;
    }

    setNotice('');
    setBusy(true);
    try {
      await requestPrice(vehicle, pendingVehicleMode, {
        fullName: contact.fullName.trim(),
        phone: contact.phone,
        email: contact.email.trim(),
      });
    } finally {
      setBusy(false);
    }
  }

  function newQuote() {
    setStage('vehicle');
    setQuote(null);
    setVehicle({ vin: '', year: '', make: '', model: '', trim: '' });
    setContact({ fullName: '', phone: '', email: '' });
    setPlate('');
    setNotice('');
  }

  if (stage === 'priced' && quote) {
    return (
      <PricedHero
        quote={quote}
        vehicle={vehicle}
        contact={contact}
        onNewQuote={newQuote}
        onDiagnostic={fireQuoteDiagnostic}
        trackingContext={trackingContext}
      />
    );
  }

  if (stage === 'contact') {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <ContactStage
          vehicle={vehicle}
          contact={contact}
          setContact={setContact}
          onSubmit={submitContactAndPrice}
          busy={busy}
          notice={notice}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <VehicleStage
        mode={vehicleMode}
        setMode={setVehicleMode}
        plate={plate}
        setPlate={setPlate}
        plateState={plateState}
        setPlateState={setPlateState}
        vinInput={vehicle.vin}
        setVinInput={(vin) => setVehicle((prev) => ({ ...prev, vin }))}
        onLookupPlate={lookupPlate}
        onLookupVin={lookupVin}
        busy={busy}
        notice={notice}
        cooldownSeconds={cooldownSeconds}
        showIntro={showIntro}
      />
    </div>
  );
}

function VehicleStage({
  mode,
  setMode,
  plate,
  setPlate,
  plateState,
  setPlateState,
  vinInput,
  setVinInput,
  onLookupPlate,
  onLookupVin,
  busy,
  notice,
  cooldownSeconds,
  showIntro,
}: {
  mode: VehicleMode;
  setMode: (m: VehicleMode) => void;
  plate: string;
  setPlate: (v: string) => void;
  plateState: string;
  setPlateState: (v: string) => void;
  vinInput: string;
  setVinInput: (v: string) => void;
  onLookupPlate: () => void;
  onLookupVin: () => void;
  busy: boolean;
  notice: string;
  cooldownSeconds: number;
  showIntro: boolean;
}) {
  const plateReady = plate.trim().length >= 2 && plateState.length === 2;
  const vinReady = vinInput.trim().length === 17;

  const tabClass = (active: boolean) =>
    `flex-1 rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors ${
      active
        ? 'shadow-sm'
        : 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;
  const tabStyle = (active: boolean) => (
    active
      ? {
          backgroundColor: '#be185d',
          borderColor: '#831843',
          color: '#ffffff',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)',
        }
      : undefined
  );

  return (
    <div>
      {showIntro && (
        <div className="mb-5 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
            Get an Instant Price Quote
          </h2>
          <p className="mt-2 text-sm font-medium text-gray-600 sm:text-base">
            Simply enter your license plate or VIN
          </p>
        </div>
      )}

      <h3 className="mb-3 text-center text-base font-bold text-gray-950">
        Simply enter your vehicle details
        <br />
        to get your price.
      </h3>

      {/* 2-tab vehicle-lookup selector */}
      <div className="mb-4 flex gap-2">
        <button type="button" className={tabClass(mode === 'plate')} style={tabStyle(mode === 'plate')} onClick={() => setMode('plate')}>
          License plate
        </button>
        <button type="button" className={tabClass(mode === 'vin')} style={tabStyle(mode === 'vin')} onClick={() => setMode('vin')}>
          VIN
        </button>
      </div>

      {mode === 'plate' && (
        <div className="grid gap-3">
          <div className="grid grid-cols-[1fr_120px] gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">License plate</span>
              <input
                value={plate}
                onChange={(event) => setPlate(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                className="w-full rounded-md border border-gray-300 px-3 py-3 text-lg font-semibold tracking-wide focus:border-pink-500 focus:outline-none"
                placeholder="ABC1234"
                autoComplete="off"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">State</span>
              <select
                value={plateState}
                onChange={(event) => setPlateState(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-3 text-lg font-semibold focus:border-pink-500 focus:outline-none"
              >
                <option value="">—</option>
                {STATE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          </div>
          <button
            type="button"
            onClick={onLookupPlate}
            disabled={busy || !plateReady || cooldownSeconds > 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-4 py-4 text-lg font-bold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            {busy
              ? 'Finding your vehicle…'
              : cooldownSeconds > 0
                ? `Try again in ${cooldownSeconds}s`
                : plate.trim().length < 2
                  ? 'Enter plate to continue'
                  : !plateState
                    ? 'Select state to continue'
                    : 'Find my vehicle'}
          </button>
        </div>
      )}

      {mode === 'vin' && (
        <div className="grid gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700">VIN (17 characters)</span>
            <input
              value={vinInput}
              onChange={(event) => setVinInput(event.target.value.toUpperCase().slice(0, 17))}
              className="w-full rounded-md border border-gray-300 px-3 py-3 font-mono text-base tracking-wider focus:border-pink-500 focus:outline-none"
              maxLength={17}
              placeholder="1HGCV1F30NA000000"
              autoComplete="off"
            />
            <span className="mt-1 block text-xs text-gray-500">
              Look on the dashboard near the windshield, or the door jamb.
            </span>
          </label>
          <button
            type="button"
            onClick={onLookupVin}
            disabled={busy || !vinReady}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-4 py-4 text-lg font-bold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            {busy
              ? 'Finding your vehicle…'
              : !vinReady
                ? `${vinInput.length}/17 characters`
                : 'Find my vehicle'}
          </button>
        </div>
      )}

      {notice && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{notice}</span>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <span>Mobile service included</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <span>ADAS calibration added when required</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <span>No payment collected online</span>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4 text-center text-sm text-gray-500">
        Can&apos;t find your plate or VIN?{' '}
        <a href="tel:+17209187465" className="font-semibold text-pink-700 hover:underline">
          Call (720) 918-7465
        </a>
      </div>
    </div>
  );
}

function ContactStage({
  vehicle,
  contact,
  setContact,
  onSubmit,
  busy,
  notice,
}: {
  vehicle: VehicleState;
  contact: QuoteContactState;
  setContact: (next: QuoteContactState) => void;
  onSubmit: () => void;
  busy: boolean;
  notice: string;
}) {
  const phoneDigits = contact.phone.replace(/\D/g, '');
  const emailTrimmed = contact.email.trim();
  const emailValid = emailTrimmed === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
  const ready = contact.fullName.trim().length >= 2 && phoneDigits.length === 10 && emailValid;
  const smsChecked = contact.phone.trim().length > 0;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-600 text-white">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-gray-950">{vehicleLine(vehicle) || 'Vehicle matched'}</div>
            <div className="text-sm font-medium text-gray-600">Glass matched. Mobile replacement quote ready.</div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-950">Almost there.</h2>
        <p className="mt-1 text-sm font-medium text-gray-600">Enter your contact info.</p>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-gray-700">Full name</span>
          <input
            value={contact.fullName}
            onChange={(event) => setContact({ ...contact, fullName: event.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-3 text-base font-medium text-gray-950 focus:border-pink-500 focus:outline-none"
            placeholder="Alex Morgan"
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-gray-700">Mobile phone</span>
          <input
            value={contact.phone}
            onChange={(event) => setContact({ ...contact, phone: formatPhoneInput(event.target.value) })}
            className="w-full rounded-md border border-gray-300 px-3 py-3 text-base font-medium text-gray-950 focus:border-pink-500 focus:outline-none"
            placeholder="(720) 555-0198"
            inputMode="tel"
            autoComplete="tel"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-gray-700">
            Email <span className="text-gray-400">optional</span>
          </span>
          <input
            value={contact.email}
            onChange={(event) => setContact({ ...contact, email: event.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-3 text-base font-medium text-gray-950 focus:border-pink-500 focus:outline-none"
            placeholder="alex@example.com"
            inputMode="email"
            autoComplete="email"
          />
        </label>
      </div>

      <label className="mt-4 flex items-start gap-2 text-xs font-medium text-gray-600">
        <input
          type="checkbox"
          checked={smsChecked}
          readOnly
          className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-pink-600"
        />
        <span>Text me this quote and booking updates. Reply STOP to opt out.</span>
      </label>

      {notice && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{notice}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={busy || !ready}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-4 py-4 text-lg font-bold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {busy && <Loader2 className="h-5 w-5 animate-spin" />}
        {busy ? 'Preparing your price…' : 'Show my installed price'}
      </button>
    </form>
  );
}

function PricedHero({
  quote,
  vehicle,
  contact,
  onNewQuote,
  onDiagnostic,
  trackingContext,
}: {
  quote: QuoteResult;
  vehicle: VehicleState;
  contact: QuoteContactState;
  onNewQuote: () => void;
  onDiagnostic: (eventName: string, extra?: Record<string, unknown>) => void;
  trackingContext?: SatelliteQuoterTrackingContext;
}) {
  const [bookingOpen, setBookingOpen] = useState(false);

  if (quote.status === 'manual_review' || !quote.pricing) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <Phone className="mb-4 h-9 w-9 text-amber-700" />
        <h2 className="text-2xl font-bold text-gray-900">Please call for accurate pricing</h2>
        <p className="mt-2 text-sm text-gray-700">
          {quote.message || "We need a few more details to price this vehicle. Call us and we'll quote you on the phone."}
        </p>
        {quote.quoteToken && (
          <div className="mt-4 rounded-md border border-amber-200 bg-white p-3 text-sm">
            <div className="font-semibold text-gray-900">Reference</div>
            <div className="font-mono text-base text-gray-700">{quote.quoteToken.slice(0, 8).toUpperCase()}</div>
            <div className="mt-1 text-gray-600">Mention this when you call.</div>
          </div>
        )}
        <a
          href="tel:+17209187465"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-5 py-4 text-lg font-bold text-white hover:bg-pink-700"
        >
          <Phone className="h-5 w-5" />
          (720) 918-7465
        </a>
        <button
          type="button"
          onClick={onNewQuote}
          className="mt-3 inline-flex w-full items-center justify-center text-sm text-gray-500 underline hover:text-pink-600"
        >
          Start a new quote
        </button>
      </div>
    );
  }

  const vehicleSummary = vehicleLine(vehicle);
  const totalDollars = (quote.pricing.totalCents / 100).toFixed(2);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="rounded-xl border-2 border-pink-500 bg-white p-5 text-center shadow-sm">
        <div className="inline-flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wide text-green-700">
          <CheckCircle2 className="h-5 w-5" /> Installed price, we come to you
        </div>
        <div className="mt-2 text-6xl font-extrabold leading-none text-gray-900 tracking-tight sm:text-7xl">
          ${totalDollars}
        </div>
        <p className="mt-3 text-sm text-gray-600">
          for your <span className="font-semibold text-gray-900">{vehicleSummary || 'vehicle'}</span> plus sales tax.
        </p>
      </div>

      <div className="mt-5 text-center">
        <div className="text-xl font-bold text-gray-900">Lock in this price</div>
        <div className="mt-1 text-sm text-gray-600">Quick scheduling below. We come to you, no shop visit.</div>
      </div>

      <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
        <div className="grid grid-cols-[90px_1fr] gap-y-2 text-left">
          <span className="text-gray-600">Customer</span>
          <span className="font-bold text-gray-950">{contact.fullName || 'Customer'}</span>
          <span className="text-gray-600">Phone</span>
          <span className="font-bold text-gray-950">{contact.phone || 'Mobile phone'}</span>
          <span className="text-gray-600">Next step</span>
          <span className="font-bold text-gray-950">Choose install time</span>
        </div>
      </div>

      {quote.quoteToken && !bookingOpen && (
        <button
          type="button"
          onClick={() => {
            setBookingOpen(true);
            onDiagnostic('quote_schedule_opened', { quote_token: quote.quoteToken });
          }}
          className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-pink-600 px-4 py-4 text-lg font-bold text-white hover:bg-pink-700"
        >
          Schedule installation
        </button>
      )}

      {quote.quoteToken && bookingOpen && (
        <div className="mt-5">
          <QuoteBookingForm
            quoteToken={quote.quoteToken}
            totalDollars={totalDollars}
            trackingContext={trackingContext}
            initialCustomer={contact}
          />
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        {vehicleSummary && `Quoted for ${vehicleSummary}. `}
        <button type="button" onClick={onNewQuote} className="underline hover:text-pink-600">
          Not your car?
        </button>
      </div>
    </div>
  );
}
