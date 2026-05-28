'use client';

import { FormEvent, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Car,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Phone,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { isInServiceArea, OUT_OF_AREA_MESSAGE } from '@/lib/quote/service-area';
import QuoteBookingForm from '@/components/QuoteBookingForm';

/**
 * Staged disclosure quote flow (2026-05-27 redesign per Codex+Gemini council).
 *
 * Stage 1 — ZIP: gate the service area before asking for anything else.
 * Stage 2 — Vehicle: plate default + state inline, VIN fallback behind a
 *   text link. Customers without either land on the phone CTA. No manual
 *   Y/M/M entry; backend already routes manual cases to "call us" per
 *   the Q12 pricing rule.
 * Stage 3 — Priced: vehicle summary card replaces input; QuotePanel
 *   on the right surfaces the full quote + booking form.
 */

type Stage = 'zip' | 'vehicle' | 'priced';
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
  const [stage, setStage] = useState<Stage>('zip');
  const [zip, setZip] = useState('');
  const [zipError, setZipError] = useState('');

  const [vehicleMode, setVehicleMode] = useState<VehicleMode>('plate');
  const [plate, setPlate] = useState('');
  const [plateState, setPlateState] = useState('');
  const [vehicle, setVehicle] = useState<VehicleState>({ vin: '', year: '', make: '', model: '', trim: '' });

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [quote, setQuote] = useState<QuoteResult | null>(null);

  function continueFromZip(event: FormEvent) {
    event.preventDefault();
    setZipError('');
    const check = isInServiceArea(zip);
    if (!check.inServiceArea) {
      setZipError(check.reason === 'invalid_zip'
        ? 'Please enter a valid 5-digit ZIP code.'
        : OUT_OF_AREA_MESSAGE);
      return;
    }
    setNotice('');
    setStage('vehicle');
  }

  async function lookupPlate() {
    setNotice('');
    setBusy(true);
    try {
      const response = await fetch('/api/quote/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plate, state: plateState, zip }),
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
          zip,
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

  function backToZip() {
    setStage('zip');
    setQuote(null);
    setVehicle({ vin: '', year: '', make: '', model: '', trim: '' });
    setPlate('');
    setNotice('');
  }

  function newQuote() {
    setStage('vehicle');
    setQuote(null);
    setVehicle({ vin: '', year: '', make: '', model: '', trim: '' });
    setPlate('');
    setNotice('');
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        {stage === 'zip' && (
          <ZipStage
            zip={zip}
            setZip={setZip}
            error={zipError}
            onContinue={continueFromZip}
          />
        )}

        {stage === 'vehicle' && (
          <VehicleStage
            zip={zip}
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
            onBack={backToZip}
            busy={busy}
            notice={notice}
          />
        )}

        {stage === 'priced' && (
          <PricedStage vehicle={vehicle} onNewQuote={newQuote} zip={zip} />
        )}
      </div>

      <QuotePanel quote={quote} vehicle={vehicle} zip={zip} state={plateState} />
    </div>
  );
}

function ZipStage({
  zip,
  setZip,
  error,
  onContinue,
}: {
  zip: string;
  setZip: (v: string) => void;
  error: string;
  onContinue: (event: FormEvent) => void;
}) {
  return (
    <form onSubmit={onContinue}>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-gray-700">ZIP code</span>
        <input
          value={zip}
          onChange={(event) => setZip(event.target.value.replace(/[^0-9-]/g, '').slice(0, 10))}
          className="w-full rounded-md border border-gray-300 px-3 py-3 text-lg font-semibold tracking-wide focus:border-pink-500 focus:outline-none"
          inputMode="numeric"
          placeholder="80202"
          autoFocus
          autoComplete="postal-code"
        />
      </label>

      {error && (
        <div className="mt-3 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={zip.trim().length < 5}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-5 py-3 text-base font-bold text-white transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        Continue
        <ArrowRight className="h-5 w-5" />
      </button>

      <a
        href="tel:+17209187465"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-pink-600"
      >
        <Phone className="h-4 w-4" />
        Prefer to call? (720) 918-7465
      </a>
    </form>
  );
}

function VehicleStage({
  zip,
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
  onBack,
  busy,
  notice,
}: {
  zip: string;
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
  onBack: () => void;
  busy: boolean;
  notice: string;
}) {
  const plateReady = plate.trim().length >= 2 && plateState.length === 2;
  const vinReady = vinInput.trim().length === 17;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-pink-600"
      >
        <ChevronLeft className="h-4 w-4" />
        ZIP {zip}
      </button>

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
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-4 py-3 text-base font-bold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300"
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
            Don't have your plate? Use VIN instead
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-4 py-3 text-base font-bold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300"
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
        Can't find your plate or VIN?{' '}
        <a href="tel:+17209187465" className="font-semibold text-pink-700 hover:underline">
          Call (720) 918-7465
        </a>
      </div>
    </div>
  );
}

function PricedStage({
  vehicle,
  onNewQuote,
  zip,
}: {
  vehicle: VehicleState;
  onNewQuote: () => void;
  zip: string;
}) {
  const vehicleLine = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ');
  return (
    <div>
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md bg-green-50 text-green-600">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Vehicle confirmed</h2>
      <div className="mt-4 rounded-md bg-gray-50 p-4">
        <div className="text-base font-semibold text-gray-900">{vehicleLine || 'Your vehicle'}</div>
        {vehicle.vin && (
          <div className="mt-1 font-mono text-xs text-gray-500">VIN {vehicle.vin}</div>
        )}
        <div className="mt-2 text-xs text-gray-500">Install ZIP {zip}</div>
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Your installed price is ready. Review on the right and schedule when you're ready.
      </p>
      <button
        type="button"
        onClick={onNewQuote}
        className="mt-4 text-sm text-gray-500 underline hover:text-pink-600"
      >
        Not your car? Edit
      </button>
    </div>
  );
}

function QuotePanel({
  quote,
  vehicle,
  zip,
  state,
}: {
  quote: QuoteResult | null;
  vehicle: VehicleState;
  zip: string;
  state: string;
}) {
  if (!quote) {
    return (
      <aside className="rounded-lg border border-gray-200 bg-gray-50 p-5">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-white text-pink-600 shadow-sm">
          <Car className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your quote will appear here</h2>
        <div className="mt-5 space-y-3 text-sm text-gray-700">
          <div className="flex gap-2"><ShieldCheck className="h-5 w-5 text-green-600" />Mobile service included</div>
          <div className="flex gap-2"><ShieldCheck className="h-5 w-5 text-green-600" />ADAS calibration added when required</div>
          <div className="flex gap-2"><ShieldCheck className="h-5 w-5 text-green-600" />No payment collected online</div>
        </div>
      </aside>
    );
  }

  if (quote.status === 'manual_review' || !quote.pricing) {
    return (
      <aside className="rounded-lg border border-amber-200 bg-amber-50 p-5">
        <Phone className="mb-4 h-9 w-9 text-amber-700" />
        <h2 className="text-2xl font-bold text-gray-900">Please call for accurate pricing</h2>
        <p className="mt-2 text-sm text-gray-700">
          {quote.message || "We need a few more details to price this vehicle. Call us and we'll quote you on the phone."}
        </p>
        {quote.quoteToken && (
          <div className="mt-4 rounded-md border border-amber-200 bg-white p-3 text-sm">
            <div className="font-semibold text-gray-900">Reference</div>
            <div className="font-mono text-base text-gray-700">{shortQuoteToken(quote.quoteToken)}</div>
            <div className="mt-1 text-gray-600">Mention this when you call.</div>
          </div>
        )}
        <a
          href="tel:+17209187465"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-5 py-3 text-lg font-bold text-white hover:bg-pink-700"
        >
          <Phone className="h-5 w-5" />
          (720) 918-7465
        </a>
      </aside>
    );
  }

  return (
    <aside className="rounded-lg border border-green-200 bg-white p-5 shadow-sm">
      <CheckCircle2 className="mb-4 h-9 w-9 text-green-600" />
      <div className="text-sm font-semibold uppercase tracking-wide text-green-700">
        {quote.status === 'ready_exact' ? 'Exact installed price' : 'Installed estimate'}
      </div>
      <div className="mt-1 text-5xl font-bold text-gray-900">
        {formatCents(quote.pricing.totalCents)}
      </div>
      <p className="mt-2 text-sm text-gray-600">{quote.message}</p>

      <div className="mt-5 divide-y divide-gray-100 rounded-md border border-gray-200">
        {quote.pricing.lineItems.map((item) => (
          <div key={`${item.kind}-${item.description}`} className="flex justify-between gap-4 px-3 py-2 text-sm">
            <span className="text-gray-700">{item.description}</span>
            <span className="font-semibold text-gray-900">{formatCents(item.amountCents)}</span>
          </div>
        ))}
        <div className="flex justify-between gap-4 bg-gray-50 px-3 py-2 text-sm">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="font-bold text-gray-900">{formatCents(quote.pricing.totalCents)}</span>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">+ sales tax at install</p>

      {quote.adas?.requiresCalibration && (
        <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          <span className="font-semibold">Calibration included.</span>{' '}
          We detected lane-assist or camera sensors on your vehicle. The price above already includes the ADAS calibration our technician will perform after install.
        </div>
      )}

      {quote.selectedPart?.description && (
        <div className="mt-4 rounded-md bg-gray-50 p-3 text-xs text-gray-600">
          <div className="font-semibold text-gray-900">{quote.selectedPart.description}</div>
          {quote.selectedPart.brand && <div>Brand: {quote.selectedPart.brand}</div>}
          {quote.selectedPart.qtyAvailable !== undefined && (
            <div>Availability: {quote.selectedPart.qtyAvailable} in stock</div>
          )}
        </div>
      )}

      {quote.quoteToken && (
        <QuoteBookingForm
          quoteToken={quote.quoteToken}
          zip={zip}
          state={state}
          vehicleSummary={[vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ')}
        />
      )}

      <a
        href="tel:+17209187465"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-pink-300"
      >
        <Phone className="h-4 w-4" />
        Prefer to call? (720) 918-7465
      </a>
    </aside>
  );
}

function formatCents(amountCents: number): string {
  return `$${(amountCents / 100).toFixed(2)}`;
}

function shortQuoteToken(token: string): string {
  return token.slice(0, 8).toUpperCase();
}
