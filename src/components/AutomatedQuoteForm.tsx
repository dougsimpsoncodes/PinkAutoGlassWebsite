'use client';

import { FormEvent, useMemo, useState } from 'react';
import { AlertTriangle, BadgeDollarSign, Car, CheckCircle2, Loader2, Phone, Search, ShieldCheck } from 'lucide-react';

type LookupMode = 'plate' | 'vin' | 'manual';

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
}

const STATE_OPTIONS = ['AZ', 'CO', 'CA', 'NM', 'NV', 'TX', 'UT', 'WY'];

export default function AutomatedQuoteForm() {
  const [mode, setMode] = useState<LookupMode>('plate');
  const [plate, setPlate] = useState('');
  const [plateState, setPlateState] = useState('CO');
  const [zip, setZip] = useState('');
  const [hasAdas, setHasAdas] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleState>({
    vin: '',
    year: '',
    make: '',
    model: '',
    trim: '',
  });
  const [lookupLoading, setLookupLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [quote, setQuote] = useState<QuoteResult | null>(null);

  const vehicleReady = useMemo(() => {
    const year = Number.parseInt(vehicle.year, 10);
    return Number.isFinite(year) && year >= 1981 && vehicle.make.trim().length >= 2 && vehicle.model.trim().length >= 1;
  }, [vehicle]);

  async function lookupPlate() {
    setNotice('');
    setQuote(null);
    setLookupLoading(true);
    try {
      const response = await fetch('/api/quote/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plate, state: plateState, zip }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setNotice(data.message || data.error || 'Vehicle lookup needs manual entry.');
        setMode('manual');
        return;
      }
      setVehicle({
        vin: data.vehicle?.vin || '',
        year: data.vehicle?.year ? String(data.vehicle.year) : '',
        make: data.vehicle?.make || '',
        model: data.vehicle?.model || '',
        trim: data.vehicle?.trim || '',
      });
      setNotice('Vehicle found. Review it and get the installed price.');
    } catch {
      setNotice('Plate lookup is unavailable. Enter the vehicle details below.');
      setMode('manual');
    } finally {
      setLookupLoading(false);
    }
  }

  async function lookupVin() {
    setNotice('');
    setQuote(null);
    setLookupLoading(true);
    try {
      const response = await fetch('/api/quote/decode-vin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin: vehicle.vin }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setNotice(data.message || data.error || 'VIN lookup needs manual entry.');
        setMode('manual');
        return;
      }
      setVehicle({
        vin: data.vehicle?.vin || vehicle.vin,
        year: data.vehicle?.year ? String(data.vehicle.year) : '',
        make: data.vehicle?.make || '',
        model: data.vehicle?.model || '',
        trim: data.vehicle?.trim || '',
      });
      setNotice('VIN decoded. Review it and get the installed price.');
    } catch {
      setNotice('VIN lookup is unavailable. Enter the vehicle details below.');
      setMode('manual');
    } finally {
      setLookupLoading(false);
    }
  }

  async function requestQuote(event: FormEvent) {
    event.preventDefault();
    if (!vehicleReady) {
      setNotice('Enter year, make, and model before pricing.');
      return;
    }

    setNotice('');
    setQuote(null);
    setQuoteLoading(true);
    try {
      const response = await fetch('/api/quote/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: {
            vin: vehicle.vin || undefined,
            year: Number.parseInt(vehicle.year, 10),
            make: vehicle.make,
            model: vehicle.model,
            trim: vehicle.trim || undefined,
          },
          state: plateState,
          zip,
          hasAdas,
          plateLast4: plate.slice(-4),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setNotice(data.error || 'Quote pricing is unavailable.');
        return;
      }
      setQuote(data);
    } catch {
      setNotice('Quote pricing is unavailable. Call us and we will confirm it manually.');
    } finally {
      setQuoteLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <form onSubmit={requestQuote} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap gap-2">
          {(['plate', 'vin', 'manual'] as LookupMode[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setMode(option);
                setNotice('');
                setQuote(null);
              }}
              className={`rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${
                mode === option
                  ? 'border-pink-600 bg-pink-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
              }`}
            >
              {option === 'plate' ? 'Plate' : option === 'vin' ? 'VIN' : 'Year / Make / Model'}
            </button>
          ))}
        </div>

        {mode === 'plate' && (
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">License plate</span>
              <input
                value={plate}
                onChange={(event) => setPlate(event.target.value.toUpperCase())}
                className="w-full rounded-md border border-gray-300 px-3 py-3 text-lg font-semibold tracking-wide focus:border-pink-500 focus:outline-none"
                placeholder="ABC1234"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">State</span>
              <select
                value={plateState}
                onChange={(event) => setPlateState(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-3 focus:border-pink-500 focus:outline-none"
              >
                {STATE_OPTIONS.map((state) => <option key={state}>{state}</option>)}
              </select>
            </label>
            <button
              type="button"
              onClick={lookupPlate}
              disabled={lookupLoading || plate.trim().length < 2}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300 sm:col-span-2"
            >
              {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Find Vehicle
            </button>
          </div>
        )}

        {mode === 'vin' && (
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">VIN</span>
              <input
                value={vehicle.vin}
                onChange={(event) => setVehicle(prev => ({ ...prev, vin: event.target.value.toUpperCase() }))}
                className="w-full rounded-md border border-gray-300 px-3 py-3 font-mono text-base tracking-wide focus:border-pink-500 focus:outline-none"
                maxLength={17}
                placeholder="17 characters"
              />
            </label>
            <button
              type="button"
              onClick={lookupVin}
              disabled={lookupLoading || vehicle.vin.trim().length !== 17}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Decode VIN
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700">Year</span>
            <input
              value={vehicle.year}
              onChange={(event) => setVehicle(prev => ({ ...prev, year: event.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-3 focus:border-pink-500 focus:outline-none"
              inputMode="numeric"
              placeholder="2021"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700">Make</span>
            <input
              value={vehicle.make}
              onChange={(event) => setVehicle(prev => ({ ...prev, make: event.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-3 focus:border-pink-500 focus:outline-none"
              placeholder="Toyota"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700">Model</span>
            <input
              value={vehicle.model}
              onChange={(event) => setVehicle(prev => ({ ...prev, model: event.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-3 focus:border-pink-500 focus:outline-none"
              placeholder="Camry"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700">Trim</span>
            <input
              value={vehicle.trim}
              onChange={(event) => setVehicle(prev => ({ ...prev, trim: event.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-3 focus:border-pink-500 focus:outline-none"
              placeholder="Optional"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700">ZIP code</span>
            <input
              value={zip}
              onChange={(event) => setZip(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-3 focus:border-pink-500 focus:outline-none"
              inputMode="numeric"
              placeholder="80202"
            />
          </label>
        </div>

        <label className="mt-4 flex items-start gap-3 rounded-md border border-blue-100 bg-blue-50 p-3">
          <input
            type="checkbox"
            checked={hasAdas}
            onChange={(event) => setHasAdas(event.target.checked)}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
          />
          <span>
            <span className="block text-sm font-semibold text-gray-900">Forward camera or lane-assist windshield</span>
            <span className="block text-sm text-gray-600">Check this for lane keeping, collision warning, Subaru EyeSight, Toyota Safety Sense, Tesla camera glass, and similar systems.</span>
          </span>
        </label>

        {notice && (
          <div className="mt-4 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={quoteLoading || !vehicleReady}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-5 py-3 font-bold text-white transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {quoteLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <BadgeDollarSign className="h-5 w-5" />}
          Get Installed Price
        </button>
      </form>

      <QuotePanel quote={quote} vehicle={vehicle} />
    </div>
  );
}

function QuotePanel({ quote, vehicle }: { quote: QuoteResult | null; vehicle: VehicleState }) {
  if (!quote) {
    return (
      <aside className="rounded-lg border border-gray-200 bg-gray-50 p-5">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-white text-pink-600 shadow-sm">
          <Car className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your quote will appear here</h2>
        <div className="mt-5 space-y-3 text-sm text-gray-700">
          <div className="flex gap-2"><ShieldCheck className="h-5 w-5 text-green-600" />Mobile service included</div>
          <div className="flex gap-2"><ShieldCheck className="h-5 w-5 text-green-600" />Labor and standard supplies included</div>
          <div className="flex gap-2"><ShieldCheck className="h-5 w-5 text-green-600" />No payment collected online</div>
        </div>
      </aside>
    );
  }

  if (quote.status === 'manual_review' || !quote.pricing) {
    return (
      <aside className="rounded-lg border border-amber-200 bg-amber-50 p-5">
        <AlertTriangle className="mb-4 h-9 w-9 text-amber-600" />
        <h2 className="text-2xl font-bold text-gray-900">Manual confirmation needed</h2>
        <p className="mt-2 text-sm text-gray-700">
          {quote.message || 'This vehicle needs a manual glass match before we show a firm installed price.'}
        </p>
        <VehicleSummary vehicle={vehicle} />
        <a
          href="tel:+17209187465"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-5 py-3 font-bold text-white"
        >
          <Phone className="h-5 w-5" />
          Call for Fast Confirmation
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

      <VehicleSummary vehicle={vehicle} />

      <div className="mt-5 divide-y divide-gray-100 rounded-md border border-gray-200">
        {quote.pricing.lineItems.map((item) => (
          <div key={`${item.kind}-${item.description}`} className="flex justify-between gap-4 px-3 py-2 text-sm">
            <span className="text-gray-700">{item.description}</span>
            <span className="font-semibold text-gray-900">{formatCents(item.amountCents)}</span>
          </div>
        ))}
      </div>

      {quote.selectedPart?.description && (
        <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
          <div className="font-semibold text-gray-900">{quote.selectedPart.description}</div>
          {quote.selectedPart.brand && <div>Brand: {quote.selectedPart.brand}</div>}
          {quote.selectedPart.qtyAvailable !== undefined && <div>Availability: {quote.selectedPart.qtyAvailable} in stock</div>}
        </div>
      )}

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <a
          href="/book"
          className="inline-flex items-center justify-center rounded-md bg-pink-600 px-4 py-3 font-bold text-white hover:bg-pink-700"
        >
          Book Appointment
        </a>
        <a
          href="tel:+17209187465"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-3 font-bold text-gray-900 hover:border-pink-300"
        >
          <Phone className="h-4 w-4" />
          Call
        </a>
      </div>
    </aside>
  );
}

function VehicleSummary({ vehicle }: { vehicle: VehicleState }) {
  return (
    <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
      <div className="font-semibold text-gray-900">
        {[vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ')}
      </div>
      {vehicle.vin && <div className="mt-1 font-mono text-xs text-gray-500">VIN {vehicle.vin}</div>}
    </div>
  );
}

function formatCents(amountCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}
