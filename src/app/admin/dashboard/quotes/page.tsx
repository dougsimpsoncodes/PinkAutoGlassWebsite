'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { AlertTriangle, BadgeDollarSign, Car, CheckCircle2, Clock, Loader2, Phone, RefreshCw, Search } from 'lucide-react';

interface AutomatedQuoteRow {
  id: string;
  quote_token: string;
  lead_id: string | null;
  status: string;
  status_reason: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_e164: string | null;
  email: string | null;
  zip: string | null;
  state: string | null;
  vin: string | null;
  vehicle_year: number | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_trim: string | null;
  selected_brand: string | null;
  selected_part_description: string | null;
  selected_product_id: string | null;
  selected_nags_prefix: string | null;
  selected_nags_number: string | null;
  selected_qty_available: number | null;
  selected_estimated_delivery_date: string | null;
  supplier_cost_cents: number | null;
  quote_total_cents: number | null;
  confidence_reasons: string[] | null;
  is_test: boolean | null;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'manual_review', label: 'Manual review' },
  { value: 'needs_confirmation', label: 'Needs confirmation' },
  { value: 'ready_exact', label: 'Exact price' },
  { value: 'ready_estimate', label: 'Estimate' },
];

// Quotes the engine couldn't confidently price — the triage queue.
const NEEDS_ATTENTION = new Set(['manual_review', 'needs_confirmation']);

export default function AutomatedQuotesDashboard() {
  const [quotes, setQuotes] = useState<AutomatedQuoteRow[]>([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [showTest, setShowTest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (status !== 'all') params.set('status', status);
      if (showTest) params.set('includeTest', 'true');
      const response = await fetch(`/api/admin/quotes?${params}`);
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to load automated quotes.');
      }
      setQuotes(data.quotes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load automated quotes.');
    } finally {
      setLoading(false);
    }
  }, [status, showTest]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const filteredQuotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return quotes;
    return quotes.filter((quote) => {
      const haystack = [
        quote.quote_token,
        quote.first_name,
        quote.last_name,
        quote.phone_e164,
        quote.email,
        quote.vehicle_year,
        quote.vehicle_make,
        quote.vehicle_model,
        quote.vehicle_trim,
        quote.vin,
        quote.selected_product_id,
        quote.selected_nags_number,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }, [quotes, search]);

  const summary = useMemo(() => ({
    total: quotes.length,
    contactReady: quotes.filter(q => q.phone_e164).length,
    needsWork: quotes.filter(q => q.status === 'manual_review' || q.status === 'needs_confirmation').length,
    priced: quotes.filter(q => q.quote_total_cents && q.quote_total_cents > 0).length,
  }), [quotes]);

  // Triage workbench: surface quotes the engine couldn't confidently price as an
  // actionable queue, sorted to the top so staff can resolve them fast.
  const sortedQuotes = useMemo(() => {
    return [...filteredQuotes].sort((a, b) => {
      const aNeeds = NEEDS_ATTENTION.has(a.status) ? 0 : 1;
      const bNeeds = NEEDS_ATTENTION.has(b.status) ? 0 : 1;
      return aNeeds - bNeeds; // needs-attention first; createdAt order preserved within groups
    });
  }, [filteredQuotes]);

  const needsReview = useMemo(
    () => filteredQuotes.filter(q => NEEDS_ATTENTION.has(q.status)).length,
    [filteredQuotes]
  );

  const [reviewQuote, setReviewQuote] = useState<AutomatedQuoteRow | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Automated Quotes</h1>
            <p className="mt-1 text-gray-600">
              {showTest ? 'Showing real + test quotes.' : 'Showing real customer quotes (test/tester traffic hidden).'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTest(v => !v)}
              className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold ${
                showTest
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {showTest ? 'Hide test quotes' : 'Show test quotes'}
            </button>
            <button
              onClick={fetchQuotes}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <SummaryTile icon={<BadgeDollarSign className="h-5 w-5" />} label="Attempts" value={summary.total} />
          <SummaryTile icon={<Phone className="h-5 w-5" />} label="With Contact" value={summary.contactReady} />
          <SummaryTile icon={<AlertTriangle className="h-5 w-5" />} label="Needs Work" value={summary.needsWork} />
          <SummaryTile icon={<CheckCircle2 className="h-5 w-5" />} label="Priced" value={summary.priced} />
        </div>

        {needsReview > 0 && (
          <button
            onClick={() => setStatus('manual_review')}
            className="flex w-full items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-left hover:bg-amber-100"
          >
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <div className="font-semibold text-amber-900">{needsReview} quote{needsReview === 1 ? '' : 's'} need review</div>
              <div className="text-sm text-amber-700">The engine couldn&apos;t confidently price these — set a price or decline so the customer can book.</div>
            </div>
          </button>
        )}

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setStatus(option.value)}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                    status === option.value
                      ? 'border-pink-600 bg-pink-600 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="relative block w-full lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-pink-500 focus:outline-none"
                placeholder="Search ref, phone, vehicle, VIN"
              />
            </label>
          </div>

          {error && (
            <div className="m-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading quotes...
            </div>
          ) : sortedQuotes.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No automated quotes match this view.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Reference</Th>
                    <Th>Status</Th>
                    <Th>Customer</Th>
                    <Th>Vehicle</Th>
                    <Th>Part</Th>
                    <Th>Price</Th>
                    <Th>Created</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {sortedQuotes.map(quote => (
                    <tr key={quote.id} className={`hover:bg-gray-50 ${NEEDS_ATTENTION.has(quote.status) ? 'bg-amber-50/40' : ''}`}>
                      <td className="whitespace-nowrap px-4 py-3 align-top">
                        <div className="font-mono font-semibold text-gray-900">{shortQuoteToken(quote.quote_token)}</div>
                        {quote.is_test && <div className="mt-1 inline-flex rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">Test</div>}
                        {quote.lead_id && <div className="mt-1 text-xs text-green-700">Lead linked</div>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-top">
                        <StatusBadge status={quote.status} />
                        {quote.status_reason && <div className="mt-1 max-w-56 truncate text-xs text-gray-500">{quote.status_reason}</div>}
                        {NEEDS_ATTENTION.has(quote.status) && (
                          <>
                            {quote.confidence_reasons && quote.confidence_reasons.length > 0 && (
                              <div className="mt-1 max-w-56 text-[11px] text-gray-400">{quote.confidence_reasons.slice(0, 2).join(', ')}</div>
                            )}
                            <button
                              onClick={() => setReviewQuote(quote)}
                              className="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50"
                            >
                              Review
                            </button>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium text-gray-900">{customerName(quote) || 'No contact yet'}</div>
                        {quote.phone_e164 && <a href={`tel:${quote.phone_e164}`} className="mt-1 block text-pink-700 hover:underline">{quote.phone_e164}</a>}
                        {quote.email && <a href={`mailto:${quote.email}`} className="mt-1 block text-gray-600 hover:underline">{quote.email}</a>}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex gap-2">
                          <Car className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{vehicleLabel(quote) || 'Unknown vehicle'}</div>
                            {quote.vin && <div className="mt-1 font-mono text-xs text-gray-500">{quote.vin}</div>}
                            {(quote.zip || quote.state) && <div className="mt-1 text-xs text-gray-500">{[quote.zip, quote.state].filter(Boolean).join(', ')}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="max-w-64 font-medium text-gray-900">{quote.selected_part_description || 'No confident part'}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          {[quote.selected_brand, quote.selected_product_id, nagsLabel(quote)].filter(Boolean).join(' | ') || 'Pending match'}
                        </div>
                        {quote.selected_qty_available !== null && (
                          <div className="mt-1 text-xs text-gray-500">Qty {quote.selected_qty_available}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-top">
                        <div className="font-semibold text-gray-900">{quote.quote_total_cents ? formatCents(quote.quote_total_cents) : '-'}</div>
                        {quote.supplier_cost_cents && <div className="mt-1 text-xs text-gray-500">Cost {formatCents(quote.supplier_cost_cents)}</div>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-top text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {formatDate(quote.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {reviewQuote && (
        <ReviewModal
          quote={reviewQuote}
          onClose={() => setReviewQuote(null)}
          onSaved={() => { setReviewQuote(null); fetchQuotes(); }}
        />
      )}
    </DashboardLayout>
  );
}

function ReviewModal({ quote, onClose, onSaved }: { quote: AutomatedQuoteRow; onClose: () => void; onSaved: () => void }) {
  const [price, setPrice] = useState(quote.quote_total_cents ? String(Math.round(quote.quote_total_cents / 100)) : '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true);
    setErr('');
    try {
      const res = await fetch('/api/admin/quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quote.id, ...body }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Update failed.');
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Update failed.');
      setSaving(false);
    }
  };

  const saveReady = () => {
    const dollars = Number(price);
    if (!Number.isFinite(dollars) || dollars <= 0) { setErr('Enter a valid price.'); return; }
    patch({ quote_total_cents: Math.round(dollars * 100), status: 'ready_exact' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Review quote {shortQuoteToken(quote.quote_token)}</h2>
            <p className="text-sm text-gray-600">{vehicleLabel(quote) || 'Unknown vehicle'}{quote.vin ? ` · ${quote.vin}` : ''}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {quote.confidence_reasons && quote.confidence_reasons.length > 0 && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <div className="font-semibold">Why it needs review</div>
            <ul className="mt-1 list-disc pl-5">
              {quote.confidence_reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700">Set price (USD)</label>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-gray-500">$</span>
          <input
            type="number"
            min="0"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="e.g. 450"
            className="w-40 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
          />
          {quote.supplier_cost_cents != null && (
            <span className="text-xs text-gray-500">Supplier cost {formatCents(quote.supplier_cost_cents)}</span>
          )}
        </div>

        {err && <div className="mt-3 text-sm text-red-600">{err}</div>}

        <div className="mt-6 flex items-center justify-between gap-2">
          <button
            onClick={() => patch({ status: 'declined' })}
            disabled={saving}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Decline quote
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} disabled={saving} className="rounded-md px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
            <button
              onClick={saveReady}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save price &amp; mark ready
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-500">{label}</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-pink-50 text-pink-600">{icon}</div>
      </div>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{children}</th>;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ready_exact: 'bg-green-100 text-green-800',
    ready_estimate: 'bg-blue-100 text-blue-800',
    needs_confirmation: 'bg-amber-100 text-amber-800',
    manual_review: 'bg-orange-100 text-orange-800',
    accepted: 'bg-emerald-100 text-emerald-800',
    declined: 'bg-gray-100 text-gray-700',
    expired: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function customerName(quote: AutomatedQuoteRow): string {
  return [quote.first_name, quote.last_name].filter(Boolean).join(' ');
}

function vehicleLabel(quote: AutomatedQuoteRow): string {
  return [quote.vehicle_year, quote.vehicle_make, quote.vehicle_model, quote.vehicle_trim].filter(Boolean).join(' ');
}

function nagsLabel(quote: AutomatedQuoteRow): string {
  return [quote.selected_nags_prefix, quote.selected_nags_number].filter(Boolean).join('');
}

function shortQuoteToken(token: string): string {
  return token.slice(0, 8).toUpperCase();
}

function formatCents(amountCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
