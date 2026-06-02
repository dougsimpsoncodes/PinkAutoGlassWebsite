'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Phone,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { isStateInServiceArea, OUT_OF_AREA_STATE_MESSAGE } from '@/lib/quote/service-area';
import QuoteBookingForm from '@/components/QuoteBookingForm';
import { trackFormSubmission, trackEvent } from '@/lib/tracking';
import { getMarketFromPath, type Market } from '@/lib/market';

/**
 * Best-effort surface + market tags for quote analytics. Surface is the route
 * the quoter is mounted on; market prefers the plate state (CO/AZ) the user
 * picked, falling back to the page path. Both are diagnostic metadata only —
 * they never change which ad-conversion fires.
 */
function quoteSurface(): string {
  if (typeof window === 'undefined') return 'unknown';
  return window.location.pathname || 'unknown';
}

function resolveQuoteMarket(plateState: string): Market | undefined {
  if (plateState === 'CO') return 'colorado';
  if (plateState === 'AZ') return 'arizona';
  if (typeof window !== 'undefined') return getMarketFromPath(window.location.pathname) ?? undefined;
  return undefined;
}

/**
 * Price-first quote flow (2026-05-27 redesign, second iteration).
 *
 * Stage 1 — Vehicle: plate + state inline, VIN fallback behind a text link.
 *   State-based service-area gate (CO + AZ pass; others blocked at lookup).
 *   ZIP is collected later at the booking step instead of as its own stage,
 *   per Codex+Gemini council (C) — eliminates the duplicate-ask friction.
 * Stage 2 — Priced: full-width, price as hero, prominent Schedule CTA
 *   immediately under the price. Vehicle line becomes a small subtitle.
 *   Sticky mobile bottom CTA so Schedule is always thumb-reachable.
 *   Booking form expands inline when CTA clicked.
 */

type Stage = 'vehicle' | 'priced';
type VehicleMode = 'plate' | 'vin' | 'ymm';

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

// Vehicle year range — current year + 1 down 25 years.
const CURRENT_YEAR = new Date().getFullYear();
const YMM_YEAR_OPTIONS = Array.from({ length: 26 }, (_, i) => CURRENT_YEAR + 1 - i);

export default function AutomatedQuoteForm() {
  const [stage, setStage] = useState<Stage>('vehicle');
  const [vehicleMode, setVehicleMode] = useState<VehicleMode>('plate');
  const [plate, setPlate] = useState('');
  const [plateState, setPlateState] = useState('');
  const [vehicle, setVehicle] = useState<VehicleState>({ vin: '', year: '', make: '', model: '', trim: '' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  // Which input tab produced the CURRENT quote. Drives the mode-aware
  // manual_review screen: YMM (which cannot price today) gets the
  // "enter plate/VIN for an instant price" nudge; plate/VIN failures keep
  // the plain "please call" screen because re-entering won't help them.
  const [quotedVia, setQuotedVia] = useState<VehicleMode>('plate');

  // YMM (Year/Make/Model) mode state. Makes load on first YMM-mode mount;
  // models load when a make is selected. Mirrors the legacy QuoteForm cascade.
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [ymmYear, setYmmYear] = useState('');
  const [ymmMake, setYmmMake] = useState('');
  const [ymmModel, setYmmModel] = useState('');

  useEffect(() => {
    if (vehicleMode !== 'ymm' || availableMakes.length > 0 || loadingMakes) return;
    setLoadingMakes(true);
    fetch('/api/vehicles/makes')
      .then((r) => r.json())
      .then((data) => setAvailableMakes(Array.isArray(data?.makes) ? data.makes : []))
      .catch(() => setNotice('Vehicle list is temporarily unavailable. Try a VIN or plate, or call (720) 918-7465.'))
      .finally(() => setLoadingMakes(false));
  }, [vehicleMode, availableMakes.length, loadingMakes]);

  useEffect(() => {
    if (!ymmMake) {
      setAvailableModels([]);
      setYmmModel('');
      return;
    }
    setLoadingModels(true);
    fetch(`/api/vehicles/models?make=${encodeURIComponent(ymmMake)}`)
      .then((r) => r.json())
      .then((data) => setAvailableModels(Array.isArray(data?.models) ? data.models : []))
      .catch(() => setAvailableModels([]))
      .finally(() => setLoadingModels(false));
  }, [ymmMake]);

  // Diagnostic-only funnel telemetry. Routes through trackEvent (GA4 + DB),
  // NEVER trackFormSubmission/trackConversion, so YMM-miss volume can never
  // inflate Google/Microsoft Ads conversions. This isolation is enforced by
  // scripts/verify-quote-telemetry-isolation.ts (wired into ci:guards).
  function fireQuoteDiagnostic(eventName: string, extra?: Record<string, unknown>) {
    trackEvent({
      eventName,
      eventCategory: 'quote_funnel_diagnostic',
      metadata: { surface: quoteSurface(), market: resolveQuoteMarket(plateState), ...extra },
    }).catch(() => { /* diagnostics never block UX */ });
  }

  // Re-enter path: a YMM-miss visitor chooses to try plate or VIN instead.
  // Preserves all entered field state; only switches the active tab and clears
  // the dead-end quote so the form is interactive again.
  function reenterWith(mode: 'plate' | 'vin') {
    fireQuoteDiagnostic('diagnostic_nudge_replate', { from: 'ymm', to: mode });
    setQuote(null);
    setStage('vehicle');
    setVehicleMode(mode);
    setNotice('');
  }

  async function lookupYmm() {
    if (!ymmYear || !ymmMake || !ymmModel) return;
    setNotice('');
    fireQuoteDiagnostic('quote_attempt_ymm');
    setBusy(true);
    try {
      const v: VehicleState = { vin: '', year: ymmYear, make: ymmMake, model: ymmModel, trim: '' };
      setVehicle(v);
      await requestPrice(v, 'ymm');
    } finally {
      setBusy(false);
    }
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
      await requestPrice(v, 'plate');
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
      await requestPrice(v, 'vin');
    } catch {
      setNotice('VIN lookup is temporarily unavailable. Call (720) 918-7465.');
    } finally {
      setBusy(false);
    }
  }

  async function requestPrice(v: VehicleState, mode: VehicleMode) {
    setQuotedVia(mode);
    try {
      const response = await fetch('/api/quote/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
      setQuote(data);
      setStage('priced');

      if (data.status !== 'manual_review' && data.pricing) {
        // A real price was shown — log this as a funnel 'priced' event so the
        // Quoter Funnel report can count it, but do NOT fire the Ads bidding
        // conversion. Price-shown is a non-contact, window-shopping step; firing
        // it here trained Google/Microsoft toward price curiosity instead of
        // bookable leads. The bidding conversion fires at booking (QuoteBookingForm)
        // or lead-capture (YMM-miss "text me my price") — the first real contact.
        // (council 2026-06-01, unanimous option A)
        trackFormSubmission('quote_form', {
          stage: 'priced',
          quote_total_cents: data?.totalCents,
          quote_id: data?.id,
          vehicle_year: v.year ? Number.parseInt(v.year, 10) : undefined,
          vehicle_make: v.make,
          vehicle_model: v.model,
          surface: quoteSurface(),
          market: resolveQuoteMarket(plateState),
        }, { fireAds: false }).catch(() => { /* analytics never blocks UX */ });
      } else {
        // No price (today YMM always lands here — no YMM->NAGS decoder).
        // Do NOT fire a lead conversion: nothing was captured, so counting it
        // would be a phantom conversion. Diagnostics only; the YMM-miss nudge's
        // "text me my price" capture fires the real lead conversion if the
        // visitor leaves their number.
        fireQuoteDiagnostic(mode === 'ymm' ? 'diagnostic_ymm_miss' : 'diagnostic_manual_review', {
          via: mode,
          quote_token: data?.quoteToken,
        });
      }
    } catch {
      setNotice('Quote pricing is unavailable. Call (720) 918-7465.');
    }
  }

  function newQuote() {
    setStage('vehicle');
    setQuote(null);
    setVehicle({ vin: '', year: '', make: '', model: '', trim: '' });
    setPlate('');
    setNotice('');
  }

  if (stage === 'priced' && quote) {
    return (
      <PricedHero
        quote={quote}
        vehicle={vehicle}
        quotedVia={quotedVia}
        onNewQuote={newQuote}
        onReenter={reenterWith}
        onDiagnostic={fireQuoteDiagnostic}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <VehicleStage
          mode={vehicleMode}
          setMode={setVehicleMode}
          plate={plate}
          setPlate={setPlate}
          plateState={plateState}
          setPlateState={setPlateState}
          ymmYear={ymmYear}
          setYmmYear={setYmmYear}
          ymmMake={ymmMake}
          setYmmMake={setYmmMake}
          ymmModel={ymmModel}
          setYmmModel={setYmmModel}
          availableMakes={availableMakes}
          availableModels={availableModels}
          loadingMakes={loadingMakes}
          loadingModels={loadingModels}
          onLookupYmm={lookupYmm}
          vinInput={vehicle.vin}
          setVinInput={(vin) => setVehicle((prev) => ({ ...prev, vin }))}
          onLookupPlate={lookupPlate}
          onLookupVin={lookupVin}
          busy={busy}
          notice={notice}
        />
      </div>

      <aside className="rounded-lg border border-gray-200 bg-gray-50 p-5">
        <h2 className="text-xl font-bold text-gray-900">Your quote will appear here</h2>
        <div className="mt-4 space-y-3 text-sm text-gray-700">
          <div className="flex gap-2"><ShieldCheck className="h-5 w-5 text-green-600" />Mobile service included</div>
          <div className="flex gap-2"><ShieldCheck className="h-5 w-5 text-green-600" />ADAS calibration added when required</div>
          <div className="flex gap-2"><ShieldCheck className="h-5 w-5 text-green-600" />No payment collected online</div>
        </div>
      </aside>
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
  ymmYear,
  setYmmYear,
  ymmMake,
  setYmmMake,
  ymmModel,
  setYmmModel,
  availableMakes,
  availableModels,
  loadingMakes,
  loadingModels,
  onLookupYmm,
  vinInput,
  setVinInput,
  onLookupPlate,
  onLookupVin,
  busy,
  notice,
}: {
  mode: VehicleMode;
  setMode: (m: VehicleMode) => void;
  plate: string;
  setPlate: (v: string) => void;
  plateState: string;
  setPlateState: (v: string) => void;
  ymmYear: string;
  setYmmYear: (v: string) => void;
  ymmMake: string;
  setYmmMake: (v: string) => void;
  ymmModel: string;
  setYmmModel: (v: string) => void;
  availableMakes: string[];
  availableModels: string[];
  loadingMakes: boolean;
  loadingModels: boolean;
  onLookupYmm: () => void;
  vinInput: string;
  setVinInput: (v: string) => void;
  onLookupPlate: () => void;
  onLookupVin: () => void;
  busy: boolean;
  notice: string;
}) {
  const plateReady = plate.trim().length >= 2 && plateState.length === 2;
  const vinReady = vinInput.trim().length === 17;
  const ymmReady = Boolean(ymmYear && ymmMake && ymmModel);

  const tabClass = (active: boolean) =>
    `flex-1 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
      active
        ? 'bg-pink-600 text-white shadow-sm'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;

  return (
    <div>
      {/* 3-tab vehicle-lookup selector */}
      <div className="mb-4 flex gap-2">
        <button type="button" className={tabClass(mode === 'plate')} onClick={() => setMode('plate')}>
          License plate
        </button>
        <button type="button" className={tabClass(mode === 'vin')} onClick={() => setMode('vin')}>
          VIN
        </button>
        <button type="button" className={tabClass(mode === 'ymm')} onClick={() => setMode('ymm')}>
          Year/Make/Model
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
            disabled={busy || !plateReady}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-4 py-4 text-lg font-bold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            {busy
              ? 'Looking up your price…'
              : plate.trim().length < 2
                ? 'Enter plate to continue'
                : !plateState
                  ? 'Select state to continue'
                  : 'Get my price'}
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
              ? 'Looking up your price…'
              : !vinReady
                ? `${vinInput.length}/17 characters`
                : 'Get my price'}
          </button>
        </div>
      )}

      {mode === 'ymm' && (
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">Year</span>
              <select
                value={ymmYear}
                onChange={(e) => setYmmYear(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-3 text-base font-semibold focus:border-pink-500 focus:outline-none"
              >
                <option value="">Year…</option>
                {YMM_YEAR_OPTIONS.map((y) => <option key={y} value={String(y)}>{y}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">Make</span>
              <select
                value={ymmMake}
                onChange={(e) => setYmmMake(e.target.value)}
                disabled={loadingMakes || availableMakes.length === 0}
                className="w-full rounded-md border border-gray-300 px-3 py-3 text-base font-semibold focus:border-pink-500 focus:outline-none disabled:bg-gray-50"
              >
                <option value="">{loadingMakes ? 'Loading…' : 'Make…'}</option>
                {availableMakes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700">Model</span>
            <select
              value={ymmModel}
              onChange={(e) => setYmmModel(e.target.value)}
              disabled={!ymmMake || loadingModels}
              className="w-full rounded-md border border-gray-300 px-3 py-3 text-base font-semibold focus:border-pink-500 focus:outline-none disabled:bg-gray-50"
            >
              <option value="">
                {!ymmMake ? 'Pick a make first' : loadingModels ? 'Loading…' : 'Model…'}
              </option>
              {availableModels.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <button
            type="button"
            onClick={onLookupYmm}
            disabled={busy || !ymmReady}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-4 py-4 text-lg font-bold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            {busy
              ? 'Looking up your price…'
              : !ymmYear
                ? 'Pick a year'
                : !ymmMake
                  ? 'Pick a make'
                  : !ymmModel
                    ? 'Pick a model'
                    : 'Get my price'}
          </button>
        </div>
      )}

      {notice && (
        <div className="mt-4 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="mt-6 border-t border-gray-100 pt-4 text-center text-sm text-gray-500">
        Can&apos;t find your plate or VIN?{' '}
        <a href="tel:+17209187465" className="font-semibold text-pink-700 hover:underline">
          Call (720) 918-7465
        </a>
      </div>
    </div>
  );
}

function PricedHero({
  quote,
  vehicle,
  quotedVia,
  onNewQuote,
  onReenter,
  onDiagnostic,
}: {
  quote: QuoteResult;
  vehicle: VehicleState;
  quotedVia: VehicleMode;
  onNewQuote: () => void;
  onReenter: (mode: 'plate' | 'vin') => void;
  onDiagnostic: (eventName: string, extra?: Record<string, unknown>) => void;
}) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  if (quote.status === 'manual_review' || !quote.pricing) {
    // YMM can't price today (no decoder). Instead of a dead-end "call us",
    // steer the visitor to plate/VIN (an instant price) and, for those without
    // either handy, offer a "text me my price" capture so the lead is never
    // lost. Genuine plate/VIN failures (exotic brand, no inventory) fall
    // through to the plain call screen — re-entering wouldn't help them.
    if (quotedVia === 'ymm') {
      return (
        <YmmMissNudge
          quote={quote}
          vehicle={vehicle}
          onReenter={onReenter}
          onNewQuote={onNewQuote}
          onDiagnostic={onDiagnostic}
        />
      );
    }
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

  const vehicleLine = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ');
  const totalDollars = (quote.pricing.totalCents / 100).toFixed(2);

  return (
    <div>
      {/* Bordered price card — pink ring so the number pops */}
      <div className="rounded-xl border-2 border-pink-500 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-green-700">
          <CheckCircle2 className="h-5 w-5" /> Installed price, we come to you
        </div>
        <div className="mt-2 text-6xl font-extrabold leading-none text-gray-900 tracking-tight sm:text-7xl">
          ${totalDollars}
        </div>
        <p className="mt-3 text-sm text-gray-600">
          for your <span className="font-semibold text-gray-900">{vehicleLine || 'vehicle'}</span> · + sales tax
        </p>
      </div>

      {/* Transition copy — bridges the price hero and the schedule fields */}
      <div className="mt-5 text-center">
        <div className="text-xl font-bold text-gray-900">Lock in this price.</div>
        <div className="mt-1 text-sm text-gray-600">Quick form below — we come to you, no shop visit.</div>
      </div>

      {/* Inline schedule form — no Schedule button gate */}
      {quote.quoteToken && (
        <div className="mt-5">
          <QuoteBookingForm quoteToken={quote.quoteToken} totalDollars={totalDollars} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setBreakdownOpen(v => !v)}
        className="mt-5 text-sm text-gray-500 underline hover:text-pink-600"
      >
        {breakdownOpen ? 'Hide price breakdown' : 'See price breakdown'}
      </button>

      {breakdownOpen && (
        <div className="mt-3 divide-y divide-gray-100 rounded-md border border-gray-200 text-sm">
          {quote.pricing.lineItems.map((item) => (
            <div key={`${item.kind}-${item.description}`} className="flex justify-between gap-4 px-3 py-2">
              <span className="text-gray-700">{item.description}</span>
              <span className="font-semibold text-gray-900">${(item.amountCents / 100).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between gap-4 bg-gray-50 px-3 py-2">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-gray-900">${totalDollars}</span>
          </div>
          {quote.adas?.requiresCalibration && (
            <div className="px-3 py-2 text-xs text-blue-900">
              Calibration included — we detected lane-assist or camera sensors on your vehicle.
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        {vehicleLine && `Quoted for ${vehicleLine}. `}
        <button type="button" onClick={onNewQuote} className="underline hover:text-pink-600">
          Not your car?
        </button>
      </div>
    </div>
  );
}

/**
 * Shown when a Year/Make/Model lookup can't produce a price (no YMM->NAGS
 * decoder yet). Primary action: re-enter via plate or VIN for an instant price.
 * Secondary: "text me my price" capture for visitors who don't have either
 * handy — POSTs to /api/quote/contact, linking the contact to this exact quote,
 * and fires the real lead conversion so a YMM visitor is never lost (the
 * pre-quoter flow always captured the lead; this preserves that).
 */
function YmmMissNudge({
  quote,
  vehicle,
  onReenter,
  onNewQuote,
  onDiagnostic,
}: {
  quote: QuoteResult;
  vehicle: VehicleState;
  onReenter: (mode: 'plate' | 'vin') => void;
  onNewQuote: () => void;
  onDiagnostic: (eventName: string, extra?: Record<string, unknown>) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [capState, setCapState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [capError, setCapError] = useState('');

  const vehicleLine = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ');
  const phoneDigits = phone.replace(/\D/g, '');
  const canSubmit = name.trim().length >= 2 && phoneDigits.length === 10 && capState !== 'submitting';

  async function submitCapture() {
    if (!canSubmit || !quote.quoteToken) return;
    setCapState('submitting');
    setCapError('');
    onDiagnostic('diagnostic_ymm_text_capture_submit');
    try {
      const res = await fetch('/api/quote/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteToken: quote.quoteToken, fullName: name.trim(), phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCapError(data.error || 'We could not send that. Please call (720) 918-7465.');
        setCapState('error');
        return;
      }
      setCapState('done');
      // Real lead captured (name + phone tied to this quote). Fire the lead
      // conversion — same single Google/Microsoft Ads lead label as quote_form
      // and booking_form; dedup is per-session on 'form_submit', so this counts
      // at most once. This is what keeps a no-price YMM visitor a real lead.
      trackFormSubmission('quote_lead_capture', {
        stage: 'ymm_text_capture',
        quote_id: quote.quoteToken,
        vehicle_year: vehicle.year ? Number.parseInt(vehicle.year, 10) : undefined,
        vehicle_make: vehicle.make,
        vehicle_model: vehicle.model,
        surface: quoteSurface(),
      }).catch(() => { /* analytics never blocks UX */ });
    } catch {
      setCapError('We could not send that. Please call (720) 918-7465.');
      setCapState('error');
    }
  }

  if (capState === 'done') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <CheckCircle2 className="mb-4 h-9 w-9 text-green-700" />
        <h2 className="text-2xl font-bold text-gray-900">You&apos;re all set</h2>
        <p className="mt-2 text-sm text-gray-700">
          We&apos;ll text your price for the{' '}
          <span className="font-semibold text-gray-900">{vehicleLine || 'vehicle'}</span> to{' '}
          <span className="font-semibold text-gray-900">{phone}</span> shortly.
        </p>
        {quote.quoteToken && (
          <div className="mt-4 rounded-md border border-green-200 bg-white p-3 text-sm">
            <div className="font-semibold text-gray-900">Reference</div>
            <div className="font-mono text-base text-gray-700">{quote.quoteToken.slice(0, 8).toUpperCase()}</div>
          </div>
        )}
        <button
          type="button"
          onClick={onNewQuote}
          className="mt-5 inline-flex w-full items-center justify-center text-sm text-gray-500 underline hover:text-pink-600"
        >
          Start a new quote
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-pink-500 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900">Get your exact price now</h2>
      <p className="mt-2 text-sm text-gray-700">
        We can show your installed price instantly with your license plate or VIN
        {vehicleLine ? <> for the <span className="font-semibold text-gray-900">{vehicleLine}</span></> : null}.
      </p>

      {/* Primary: re-enter via plate or VIN (preserves entered fields) */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onReenter('plate')}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-4 py-4 text-base font-bold text-white hover:bg-pink-700"
        >
          <Search className="h-5 w-5" /> Use license plate
        </button>
        <button
          type="button"
          onClick={() => onReenter('vin')}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-pink-600 bg-white px-4 py-4 text-base font-bold text-pink-700 hover:bg-pink-50"
        >
          <Search className="h-5 w-5" /> Use VIN
        </button>
      </div>

      {/* Secondary: text-me-my-price capture for visitors without plate/VIN handy */}
      <div className="mt-6 rounded-md border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <MessageSquare className="h-4 w-4 text-pink-600" /> Don&apos;t have them handy?
        </div>
        <p className="mt-1 text-sm text-gray-600">Leave your number and we&apos;ll text your price.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-base focus:border-pink-500 focus:outline-none"
            placeholder="Your name"
            autoComplete="name"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d\s\-().+]/g, '').slice(0, 14))}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-base focus:border-pink-500 focus:outline-none"
            placeholder="(720) 555-1234"
            inputMode="tel"
            autoComplete="tel"
          />
        </div>
        <button
          type="button"
          onClick={submitCapture}
          disabled={!canSubmit}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-3 text-base font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {capState === 'submitting' ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-5 w-5" />}
          {capState === 'submitting' ? 'Sending…' : 'Text me my price'}
        </button>
        {capError && (
          <div className="mt-2 flex gap-2 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{capError}</span>
          </div>
        )}
      </div>

      {/* Tertiary: phone, demoted */}
      <div className="mt-5 border-t border-gray-100 pt-4 text-center text-sm text-gray-500">
        Prefer to talk?{' '}
        <a href="tel:+17209187465" className="font-semibold text-pink-700 hover:underline">
          Call (720) 918-7465
        </a>
      </div>
      <div className="mt-3 text-center">
        <button type="button" onClick={onNewQuote} className="text-xs text-gray-500 underline hover:text-pink-600">
          Start a new quote
        </button>
      </div>
    </div>
  );
}
