'use client';

import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import DateFilterBar, { type DateFilter } from '@/components/admin/DateFilterBar';
import { useMarket } from '@/contexts/MarketContext';
import {
  Car,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Clock,
  Filter,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
} from 'lucide-react';

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
  market: string | null;
  session_id: string | null;
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
  lead_status: string | null;
  ad_platform: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  resolved_market: string | null;
  booking_id: string | null;
  booking_token: string | null;
  booking_status: string | null;
  booking_date: string | null;
}

type StatusFilter = 'all' | 'scheduled' | 'lead' | 'quote_only';
type SortColumn = 'date' | 'customer' | 'vehicle' | 'lead_status';
type SortDirection = 'asc' | 'desc';

export default function AutomatedQuotesDashboard() {
  const { market } = useMarket();
  const marketLabel = market === 'all' ? 'All Markets' : market === 'colorado' ? 'Denver / CO' : 'Phoenix / AZ';

  const [quotes, setQuotes] = useState<AutomatedQuoteRow[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTest, setShowTest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [reviewQuote, setReviewQuote] = useState<AutomatedQuoteRow | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        limit: '500',
        period: dateFilter,
        market,
      });
      if (showTest) params.set('includeTest', 'true');

      const response = await fetch(`/api/admin/quotes?${params.toString()}`, { cache: 'no-store' });
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
  }, [dateFilter, market, showTest]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const filteredQuotes = useMemo(() => {
    return quotes
      .filter((quote) => {
        if (statusFilter !== 'all' && normalizeLeadStatus(quote) !== statusFilter) return false;

        if (!searchTerm.trim()) return true;
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
          quote.selected_part_description,
          quote.selected_nags_number,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(searchTerm.trim().toLowerCase());
      })
      .sort((a, b) => compareQuotes(a, b, sortColumn, sortDirection));
  }, [quotes, statusFilter, searchTerm, sortColumn, sortDirection]);

  const stats = useMemo(() => ({
    total: quotes.length,
    scheduled: quotes.filter((q) => normalizeLeadStatus(q) === 'scheduled').length,
    lead: quotes.filter((q) => normalizeLeadStatus(q) === 'lead').length,
    quoteOnly: quotes.filter((q) => normalizeLeadStatus(q) === 'quote_only').length,
  }), [quotes]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortColumn(column);
    setSortDirection(column === 'date' ? 'desc' : 'asc');
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Automated Quotes</h1>
            <p className="mt-1 text-gray-600">Homepage quote requests with customer, vehicle, lead, and booking context.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-pink-600" />
              Showing {marketLabel}
            </div>
            <button
              onClick={() => setShowTest((current) => !current)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                showTest
                  ? 'border border-amber-300 bg-amber-50 text-amber-800'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {showTest ? 'Hide test quotes' : 'Show test quotes'}
            </button>
            <button
              onClick={fetchQuotes}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>
          </div>
        </div>

        <DateFilterBar
          dateFilter={dateFilter}
          onFilterChange={setDateFilter}
          dateDisplay={getDateRangeDisplay(quotes)}
          color="gray"
          showSync={false}
        />

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-200">
            <SummaryStat label="TOTAL QUOTE REQUESTS" value={stats.total} detail="All quote attempts" />
            <SummaryStat label="SCHEDULED" value={stats.scheduled} valueClassName="text-green-600" detail="Install booked" />
            <SummaryStat label="LEAD" value={stats.lead} valueClassName="text-blue-600" detail="Contact captured, not yet booked" />
            <SummaryStat label="QUOTE ONLY" value={stats.quoteOnly} valueClassName="text-gray-500" detail="Price shown, no contact captured" />
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, email, or vehicle..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex gap-1">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'lead', label: 'Lead' },
                  { value: 'quote_only', label: 'Quote Only' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value as StatusFilter)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === option.value
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {error && (
            <div className="m-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <HeaderCell>Type</HeaderCell>
                  <HeaderCell>Source</HeaderCell>
                  <SortableHeader column="customer" sortColumn={sortColumn} sortDirection={sortDirection} onClick={handleSort}>Name / Phone</SortableHeader>
                  <HeaderCell>Details</HeaderCell>
                  <SortableHeader column="vehicle" sortColumn={sortColumn} sortDirection={sortDirection} onClick={handleSort}>Vehicle</SortableHeader>
                  <SortableHeader column="date" sortColumn={sortColumn} sortDirection={sortDirection} onClick={handleSort}>Date</SortableHeader>
                  <SortableHeader column="lead_status" sortColumn={sortColumn} sortDirection={sortDirection} onClick={handleSort}>Status</SortableHeader>
                  <HeaderCell>Actions</HeaderCell>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <div className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading automated quotes...
                      </div>
                    </td>
                  </tr>
                ) : filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No automated quotes found
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.map((quote) => {
                    const leadStatus = normalizeLeadStatus(quote);
                    const isLead = leadStatus === 'lead';

                    return (
                      <tr key={quote.id} className={isLead ? 'bg-amber-50/40 hover:bg-amber-50' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            Quote
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{formatSourceLabel(quote)}</div>
                          {quote.utm_campaign && (
                            <div className="text-xs text-gray-500 mt-0.5">{quote.utm_campaign}</div>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{customerName(quote) || 'No contact yet'}</div>
                          {quote.phone_e164 ? (
                            <div className="text-sm text-gray-500">{formatPhoneNumber(quote.phone_e164)}</div>
                          ) : (
                            <div className="text-sm text-gray-400">No phone captured</div>
                          )}
                          {quote.email && (
                            <div className="text-sm text-gray-500">{quote.email}</div>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-700">{detailCopy(quote)}</div>
                          {quote.lead_id && (
                            <div className="text-xs text-green-600 mt-1">Lead linked</div>
                          )}
                          {reasonSummary(quote) && (
                            <div className="text-xs text-gray-500 mt-1">{reasonSummary(quote)}</div>
                          )}
                          {reasonChips(quote).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {reasonChips(quote).map((chip) => (
                                <span
                                  key={chip}
                                  className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700"
                                >
                                  {chip}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          <div className="flex gap-2">
                            <Car className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-gray-900">{vehicleLabel(quote) || 'Unknown vehicle'}</div>
                              {quote.vin && <div className="text-xs text-gray-500 mt-1 font-mono">{quote.vin}</div>}
                              {(quote.zip || quote.state) && (
                                <div className="text-xs text-gray-500 mt-1">{[quote.zip, quote.state].filter(Boolean).join(', ')}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {formatDate(quote.created_at)}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <LeadStatusBadge status={leadStatus} />
                          {quote.booking_date && (
                            <div className="text-xs text-gray-500 mt-1">Install {formatShortDate(quote.booking_date)}</div>
                          )}
                          {!hasBooking(quote) && quote.quote_total_cents ? (
                            <div className="text-xs text-gray-500 mt-1">{formatCents(quote.quote_total_cents)}</div>
                          ) : null}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {isLead ? (
                              <button
                                onClick={() => setReviewQuote(quote)}
                                className="text-pink-600 hover:text-pink-900 font-medium text-sm"
                              >
                                Contact
                              </button>
                            ) : (
                              <span className="text-sm text-gray-400">{leadStatus === 'scheduled' ? 'Booked' : '—'}</span>
                            )}
                            {quote.email && (
                              <a href={`mailto:${quote.email}`} className="text-blue-600 hover:text-blue-800" aria-label="Email customer">
                                <Mail className="w-4 h-4" />
                              </a>
                            )}
                            {quote.phone_e164 && (
                              <a href={`tel:${quote.phone_e164}`} className="text-green-600 hover:text-green-800" aria-label="Call customer">
                                <Phone className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {reviewQuote && (
        <ReviewModal
          quote={reviewQuote}
          onClose={() => setReviewQuote(null)}
          onSaved={() => {
            setReviewQuote(null);
            fetchQuotes();
          }}
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
    if (!Number.isFinite(dollars) || dollars <= 0) {
      setErr('Enter a valid price.');
      return;
    }
    patch({ quote_total_cents: Math.round(dollars * 100), status: 'ready_exact' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Review quote {shortQuoteToken(quote.quote_token)}</h2>
            <p className="text-sm text-gray-600">
              {vehicleLabel(quote) || 'Unknown vehicle'}
              {quote.vin ? ` · ${quote.vin}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {quote.confidence_reasons && quote.confidence_reasons.length > 0 && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <div className="font-semibold">Why it needs review</div>
            <ul className="mt-1 list-disc pl-5">
              {quote.confidence_reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
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
            onChange={(event) => setPrice(event.target.value)}
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
            <button
              onClick={onClose}
              disabled={saving}
              className="rounded-md px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
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

function SummaryStat({
  label,
  value,
  detail,
  valueClassName = 'text-gray-900',
}: {
  label: string;
  value: number;
  detail: string;
  valueClassName?: string;
}) {
  return (
    <div className="p-4 text-center hover:bg-gray-50 transition-colors">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-3xl font-bold ${valueClassName}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{detail}</div>
    </div>
  );
}

function HeaderCell({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>;
}

function SortableHeader({
  children,
  column,
  sortColumn,
  sortDirection,
  onClick,
}: {
  children: ReactNode;
  column: SortColumn;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onClick: (column: SortColumn) => void;
}) {
  return (
    <th
      onClick={() => onClick(column)}
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
    >
      {children}
      <SortIcon column={column} sortColumn={sortColumn} sortDirection={sortDirection} />
    </th>
  );
}

function SortIcon({
  column,
  sortColumn,
  sortDirection,
}: {
  column: SortColumn;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}) {
  if (sortColumn !== column) return <ChevronsUpDown className="w-3.5 h-3.5 ml-1 opacity-40 inline" />;
  return sortDirection === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 ml-1 inline" />
    : <ChevronDown className="w-3.5 h-3.5 ml-1 inline" />;
}

function LeadStatusBadge({ status }: { status: 'scheduled' | 'lead' | 'quote_only' }) {
  const config: Record<string, { style: string; label: string }> = {
    scheduled: { style: 'bg-green-100 text-green-800', label: 'Scheduled' },
    lead: { style: 'bg-blue-100 text-blue-800', label: 'Lead' },
    quote_only: { style: 'bg-gray-100 text-gray-600', label: 'Quote Only' },
  };
  const { style, label } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase ${style}`}>
      {label}
    </span>
  );
}

function hasBooking(quote: AutomatedQuoteRow): boolean {
  return !!quote.booking_id;
}

function normalizeLeadStatus(quote: AutomatedQuoteRow): 'scheduled' | 'lead' | 'quote_only' {
  if (hasBooking(quote)) return 'scheduled';
  if (quote.lead_id) return 'lead';
  return 'quote_only';
}

function formatSourceLabel(quote: AutomatedQuoteRow): string {
  const utmSource = quote.utm_source?.trim();
  const adPlatform = quote.ad_platform?.trim().toLowerCase();

  if (utmSource) return utmSource === 'organic' ? 'Organic' : toTitleLabel(utmSource);
  if (adPlatform === 'google') return 'Google Ads';
  if (adPlatform === 'bing' || adPlatform === 'microsoft') return 'Bing Ads';
  if (adPlatform === 'organic') return 'Organic';
  if (adPlatform === 'direct') return 'Direct';
  return 'Homepage Quote';
}

const MANUAL_REVIEW_STATUSES = new Set(['manual_review', 'needs_confirmation']);
const PRICED_STATUSES = new Set(['ready_exact', 'ready_estimate']);

function hasContactInfo(quote: AutomatedQuoteRow): boolean {
  return !!(quote.phone_e164 || quote.email);
}

function detailCopy(quote: AutomatedQuoteRow): string {
  if (hasBooking(quote)) {
    return quote.booking_date
      ? `Customer booked an install for ${formatShortDate(quote.booking_date)}.`
      : 'Customer received a quote and booked an appointment.';
  }

  if (MANUAL_REVIEW_STATUSES.has(quote.status)) {
    return hasContactInfo(quote)
      ? 'Customer asked for a quote, but the engine could not finish it confidently. Review manually, then follow up.'
      : 'Customer asked for a quote, but no confident price or usable contact info was captured.';
  }

  if (PRICED_STATUSES.has(quote.status) && quote.lead_id) {
    return 'Price is ready, but this quote still looks untouched in CRM.';
  }

  if (PRICED_STATUSES.has(quote.status)) {
    return 'Customer received a price quote and has not booked yet.';
  }

  if (quote.status === 'declined') return 'Quote was declined.';
  if (quote.status === 'expired') return 'Quote expired before booking.';
  return 'Quote is still in progress.';
}

function reasonSummary(quote: AutomatedQuoteRow): string | null {
  const labels = summarizeReasons(getReasonTokens(quote));
  if (labels.length === 0) return null;
  return labels.join(' · ');
}

function reasonChips(quote: AutomatedQuoteRow): string[] {
  const labels = chipReasons(getReasonTokens(quote));
  return labels.slice(0, 4);
}

function getReasonTokens(quote: AutomatedQuoteRow): string[] {
  return quote.confidence_reasons?.length
    ? quote.confidence_reasons
    : quote.status_reason?.split(',').map((part) => part.trim()).filter(Boolean) || [];
}

function summarizeReasons(reasons: string[]): string[] {
  const summary: string[] = [];

  if (reasons.some((reason) => reason.startsWith('selected_') || reason.includes('high_confidence'))) {
    summary.push('Glass match found');
  }

  if (reasons.includes('markup_pricing_formula')) {
    summary.push('Price calculated');
  }

  if (reasons.some((reason) => reason.startsWith('adas_tier_'))) {
    const adasReason = reasons.find((reason) => reason.startsWith('adas_tier_'));
    if (adasReason === 'adas_tier_mandatory') summary.push('ADAS calibration required');
    else if (adasReason === 'adas_tier_recommended') summary.push('ADAS may be needed');
  }

  if (reasons.includes('missing_customer_unit_price')) {
    summary.push('Manual pricing needed');
  }

  if (reasons.includes('no_windshield_candidates')) {
    summary.push('No windshield match found');
  }

  if (reasons.some((reason) => reason.includes('needs_confirmation') || reason.includes('mygrant_confidence_medium'))) {
    summary.push('Needs confirmation');
  }

  if (reasons.some((reason) => reason.includes('autobolt_missing_vin'))) {
    summary.push('VIN lookup incomplete');
  }

  return summary.slice(0, 3);
}

function chipReasons(reasons: string[]): string[] {
  const chips: string[] = [];

  if (reasons.includes('markup_pricing_formula')) chips.push('Auto-priced');
  if (reasons.some((reason) => reason.startsWith('adas_tier_none'))) chips.push('No ADAS');
  if (reasons.some((reason) => reason.startsWith('adas_tier_recommended'))) chips.push('ADAS review');
  if (reasons.some((reason) => reason.startsWith('adas_tier_mandatory'))) chips.push('ADAS required');
  if (reasons.some((reason) => reason.includes('inventory_available'))) chips.push('In stock');
  if (reasons.some((reason) => reason.includes('branch_available'))) chips.push('Local branch');
  if (reasons.includes('missing_customer_unit_price')) chips.push('Need manual price');
  if (reasons.includes('no_windshield_candidates')) chips.push('No match');
  if (reasons.some((reason) => reason.includes('autobolt_missing_vin'))) chips.push('VIN issue');
  if (reasons.some((reason) => reason.includes('mygrant_vehicle_status_e610'))) chips.push('Catalog blocked');

  return Array.from(new Set(chips));
}

function toTitleLabel(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function compareQuotes(a: AutomatedQuoteRow, b: AutomatedQuoteRow, column: SortColumn, direction: SortDirection): number {
  const dir = direction === 'asc' ? 1 : -1;

  switch (column) {
    case 'customer':
      return dir * customerName(a).localeCompare(customerName(b));
    case 'vehicle':
      return dir * vehicleLabel(a).localeCompare(vehicleLabel(b));
    case 'lead_status':
      return dir * normalizeLeadStatus(a).localeCompare(normalizeLeadStatus(b));
    case 'date':
    default:
      return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
}

function customerName(quote: AutomatedQuoteRow): string {
  return [quote.first_name, quote.last_name].filter(Boolean).join(' ');
}

function vehicleLabel(quote: AutomatedQuoteRow): string {
  return [quote.vehicle_year, quote.vehicle_make, quote.vehicle_model, quote.vehicle_trim].filter(Boolean).join(' ');
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
    hour12: true,
  });
}

function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getDateRangeDisplay(quotes: AutomatedQuoteRow[]): string {
  if (quotes.length === 0) return 'No quotes in selected range';
  return `${formatShortDate(quotes[quotes.length - 1].created_at)} - ${formatShortDate(quotes[0].created_at)}`;
}

function formatPhoneNumber(num: string) {
  if (!num) return '';
  const cleaned = num.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return num;
}
