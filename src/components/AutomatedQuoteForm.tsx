'use client';

import { useEffect, useRef, useState } from 'react';
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
type VehicleMode = 'plate' | 'vin';

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

const STATE_OPTIONS = ['AZ', 'CO', 'CA', 'NM', 'NV', 'TX', 'UT', 'WY'];

export default function AutomatedQuoteForm() {
  const [stage, setStage] = useState<Stage>('vehicle');
  const [vehicleMode, setVehicleMode] = useState<VehicleMode>('plate');
  const [plate, setPlate] = useState('');
  const [plateState, setPlateState] = useState('');
  const [vehicle, setVehicle] = useState<VehicleState>({ vin: '', year: '', make: '', model: '', trim: '' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [quote, setQuote] = useState<QuoteResult | null>(null);

  async function lookupPlate() {
    if (!isStateInServiceArea(plateState)) {
      setNotice(OUT_OF_AREA_STATE_MESSAGE);
      return;
    }
    setNotice('');
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
      await requestPrice(v);
    } catch {
      setNotice('Plate lookup is temporarily unavailable. Try a VIN below, or call (720) 918-7465.');
    } finally {
      setBusy(false);
    }
  }

  async function lookupVin() {
    setNotice('');
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
      await requestPrice(v);
    } catch {
      setNotice('VIN lookup is temporarily unavailable. Call (720) 918-7465.');
    } finally {
      setBusy(false);
    }
  }

  async function requestPrice(v: VehicleState) {
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
    return <PricedHero quote={quote} vehicle={vehicle} plateState={plateState} onNewQuote={newQuote} />;
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
  vinInput: string;
  setVinInput: (v: string) => void;
  onLookupPlate: () => void;
  onLookupVin: () => void;
  busy: boolean;
  notice: string;
}) {
  const plateReady = plate.trim().length >= 2 && plateState.length === 2;
  const vinReady = vinInput.trim().length === 17;

  return (
    <div>
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
                autoFocus
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
          <button
            type="button"
            onClick={() => setMode('vin')}
            className="text-sm text-gray-500 underline hover:text-pink-600"
          >
            Don&apos;t have your plate? Use VIN instead
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
              autoFocus
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
          <button
            type="button"
            onClick={() => setMode('plate')}
            className="text-sm text-gray-500 underline hover:text-pink-600"
          >
            Use license plate instead
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
  plateState,
  onNewQuote,
}: {
  quote: QuoteResult;
  vehicle: VehicleState;
  plateState: string;
  onNewQuote: () => void;
}) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const bookingRef = useRef<HTMLDivElement | null>(null);

  function openBooking() {
    setBookingOpen(true);
    // Defer scroll so the form has rendered before we measure its position
    setTimeout(() => {
      bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

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

  const vehicleLine = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ');
  const totalDollars = (quote.pricing.totalCents / 100).toFixed(2);

  return (
    <>
      <div className="rounded-lg border border-green-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-green-700">
          <CheckCircle2 className="h-5 w-5" /> Installed price
        </div>

        <div className="mt-2 text-6xl font-bold leading-none text-gray-900">
          ${totalDollars}
        </div>

        <p className="mt-3 text-base text-gray-600">
          for your <span className="font-semibold text-gray-900">{vehicleLine || 'vehicle'}</span>
          <span className="block text-sm text-gray-500">+ sales tax at install · mobile service included</span>
        </p>

        {!bookingOpen && (
          <button
            type="button"
            onClick={openBooking}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-5 py-5 text-xl font-bold text-white shadow-sm hover:bg-pink-700"
          >
            Schedule my install
          </button>
        )}

        {!bookingOpen && (
          <a
            href="tel:+17209187465"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-pink-300"
          >
            <Phone className="h-4 w-4" />
            Prefer to call? (720) 918-7465
          </a>
        )}

        <button
          type="button"
          onClick={() => setBreakdownOpen(v => !v)}
          className="mt-4 text-sm text-gray-500 underline hover:text-pink-600"
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

        <div className="mt-5 text-xs text-gray-500">
          {vehicleLine && `Quoted for ${vehicleLine}.`}{' '}
          <button type="button" onClick={onNewQuote} className="underline hover:text-pink-600">
            Not your car?
          </button>
        </div>
      </div>

      {bookingOpen && quote.quoteToken && (
        <div ref={bookingRef} className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <QuoteBookingForm
            quoteToken={quote.quoteToken}
            zip=""
            state={plateState}
            vehicleSummary={vehicleLine}
          />
        </div>
      )}

      {!bookingOpen && (
        <MobileStickyCta totalDollars={totalDollars} onClick={openBooking} />
      )}
    </>
  );
}

function MobileStickyCta({
  totalDollars,
  onClick,
}: {
  totalDollars: string;
  onClick: () => void;
}) {
  // Only renders on small screens — desktop has the price + CTA already visible.
  // Uses backdrop-blur and a top border so it never visually fights the page.
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] backdrop-blur sm:hidden">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex w-full items-center justify-between gap-2 rounded-md bg-pink-600 px-4 py-4 text-base font-bold text-white shadow-sm hover:bg-pink-700"
      >
        <span>Schedule install</span>
        <span className="font-bold">${totalDollars}</span>
      </button>
    </div>
  );
}
