'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { TrendingDown, AlertTriangle } from 'lucide-react';
import { useMarket } from '@/contexts/MarketContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Ordered funnel stage identifiers — must match fn_quoter_funnel output. */
const STAGE_ORDER = [
  'traffic_source',
  'landed_quoter',
  'started_quote',
  'price_shown',
  'booked',
] as const;

type StageKey = (typeof STAGE_ORDER)[number];

const STAGE_LABELS: Record<StageKey, string> = {
  traffic_source: 'Sessions',
  landed_quoter: 'Landed on Quoter',
  started_quote: 'Started Quote',
  price_shown: 'Price Shown',
  booked: 'Booked',
};

/** Source → color mapping for bars and legend chips */
const SOURCE_COLORS: Record<string, string> = {
  Google: 'bg-blue-500',
  Microsoft: 'bg-cyan-500',
  Organic: 'bg-green-500',
  Direct: 'bg-gray-400',
};

/** Fallback color for any source not in the table above */
function sourceColor(source: string): string {
  return SOURCE_COLORS[source] ?? 'bg-pink-500';
}

/** Source → hex for inline SVG segments (Tailwind can't be used there) */
const SOURCE_HEX: Record<string, string> = {
  Google: '#3b82f6',
  Microsoft: '#06b6d4',
  Organic: '#22c55e',
  Direct: '#9ca3af',
};

function sourceHex(source: string): string {
  return SOURCE_HEX[source] ?? '#ec4899';
}

// ---------------------------------------------------------------------------
// API response shape
// ---------------------------------------------------------------------------

interface FunnelPayload {
  /** funnelRows[source][stage] = count */
  funnelRows: Record<string, Record<string, number>>;
  sources: string[];
  stages: string[];
  trueTotalBookings: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Total count across all sources for a given stage */
function stageTotal(
  funnelRows: Record<string, Record<string, number>>,
  sources: string[],
  stage: StageKey,
): number {
  return sources.reduce((acc, src) => acc + (funnelRows[src]?.[stage] ?? 0), 0);
}

/**
 * Stage-to-stage conversion rate as a percentage string.
 * Returns '—' when the upstream count is zero.
 */
function convRate(from: number, to: number): string {
  if (from === 0) return '—';
  return `${((to / from) * 100).toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function QuoterFunnelPage() {
  const [data, setData] = useState<FunnelPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7days');
  const { market } = useMarket();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/analytics?metric=quoter_funnel&range=${dateRange}&market=${market}`,
      );
      if (!res.ok) {
        setError(`Failed to load funnel data (${res.status})`);
        return;
      }
      const json = (await res.json()) as { ok: boolean; data?: FunnelPayload; error?: string };
      if (!json.ok || !json.data) {
        setError(json.error ?? 'Unknown error');
        return;
      }
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [dateRange, market]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------------------------------------------------------
  // Derived metrics
  // ---------------------------------------------------------------------------

  const sources: string[] = data?.sources ?? [];
  const funnelRows: Record<string, Record<string, number>> = data?.funnelRows ?? {};
  const trueTotalBookings: number = data?.trueTotalBookings ?? 0;

  /** Total booked count attributed via conversion_events */
  const attributedBookings = sources.reduce(
    (acc, src) => acc + (funnelRows[src]?.booked ?? 0),
    0,
  );
  /** Delta between true total and attributed — caused by the known dedup bug */
  const bookingDelta = trueTotalBookings - attributedBookings;

  /** Top-of-funnel (traffic_source) total — used to normalise bar widths */
  const topTotal = stageTotal(funnelRows, sources, 'traffic_source');

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  /**
   * Segmented horizontal bar for one funnel stage.
   * Width ∝ stage total / top-of-funnel total.
   * Each segment width ∝ source count / stage total.
   */
  function FunnelBar({ stage }: { stage: StageKey }) {
    const total = stageTotal(funnelRows, sources, stage);
    const widthPct = topTotal > 0 ? (total / topTotal) * 100 : 0;

    return (
      <div className="flex items-center gap-3">
        {/* Label + count */}
        <div className="w-36 shrink-0 text-right">
          <span className="text-sm font-medium text-gray-700">{STAGE_LABELS[stage]}</span>
          <span className="ml-2 text-sm text-gray-500">({total.toLocaleString()})</span>
        </div>

        {/* Bar */}
        <div className="flex-1 bg-gray-100 rounded h-8 overflow-hidden relative">
          {/* Outer wrapper proportional to stage total */}
          <div
            className="h-full flex rounded overflow-hidden transition-all duration-500"
            style={{ width: `${widthPct}%` }}
          >
            {sources.map((src) => {
              const srcCount = funnelRows[src]?.[stage] ?? 0;
              const segPct = total > 0 ? (srcCount / total) * 100 : 0;
              if (segPct === 0) return null;
              return (
                <div
                  key={src}
                  title={`${src}: ${srcCount.toLocaleString()}`}
                  style={{ width: `${segPct}%`, backgroundColor: sourceHex(src) }}
                />
              );
            })}
          </div>
        </div>

        {/* Width % label */}
        <div className="w-12 shrink-0 text-xs text-gray-500 text-right">
          {widthPct.toFixed(0)}%
        </div>
      </div>
    );
  }

  /**
   * Conversion rate arrow row between two consecutive stages.
   * Shows overall rate and per-source rates.
   */
  function ConvRateRow({ from, to }: { from: StageKey; to: StageKey }) {
    const fromTotal = stageTotal(funnelRows, sources, from);
    const toTotal = stageTotal(funnelRows, sources, to);
    return (
      <div className="flex items-center gap-3 my-1">
        <div className="w-36 shrink-0" />
        <div className="flex-1 flex items-center gap-2 text-xs text-gray-500 pl-1">
          <span className="font-medium text-gray-700">
            {STAGE_LABELS[from]} → {STAGE_LABELS[to]}:
          </span>
          <span className="font-semibold text-pink-600">
            {convRate(fromTotal, toTotal)}
          </span>
          <span className="text-gray-400">|</span>
          {sources.map((src) => {
            const f = funnelRows[src]?.[from] ?? 0;
            const t = funnelRows[src]?.[to] ?? 0;
            return (
              <span key={src} className="inline-flex items-center gap-1">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: sourceHex(src) }}
                />
                <span className="text-gray-600">{src}:</span>
                <span className="font-medium">{convRate(f, t)}</span>
              </span>
            );
          })}
        </div>
        <div className="w-12 shrink-0" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading funnel data…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-red-600">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
            <p className="font-semibold">Failed to load funnel</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ---------------------------------------------------------------------------
  // Full render
  // ---------------------------------------------------------------------------

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <TrendingDown className="w-8 h-8 text-pink-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quoter Funnel</h1>
            <p className="text-gray-600 mt-0.5">
              Conversion funnel segmented by traffic source
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Date Range:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Data quality note */}
      {bookingDelta > 0 && (
        <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Data quality note:</strong>{' '}
            {trueTotalBookings} total booking{trueTotalBookings !== 1 ? 's' : ''} confirmed in this
            period (from booking records), but only{' '}
            {attributedBookings} could be source-attributed via session events.{' '}
            <strong>{bookingDelta} booking{bookingDelta !== 1 ? 's' : ''}</strong> cannot be
            attributed to a traffic source. This is caused by a known deduplication issue in the
            event pipeline (a session&apos;s first <code>form_submit</code> blocks the second),
            which is being resolved separately. The &quot;Booked&quot; bar reflects attributed
            events only.
          </div>
        </div>
      )}

      {/* Source legend */}
      <div className="mb-6 flex items-center flex-wrap gap-3">
        <span className="text-sm font-medium text-gray-700">Source:</span>
        {sources.map((src) => (
          <span key={src} className="inline-flex items-center gap-1.5 text-sm text-gray-700">
            <span
              className={`inline-block w-3 h-3 rounded-full ${sourceColor(src)}`}
              style={{ backgroundColor: sourceHex(src) }}
            />
            {src}
          </span>
        ))}
        {sources.length === 0 && (
          <span className="text-sm text-gray-500">No data for this period</span>
        )}
      </div>

      {/* Funnel visualization */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Funnel Overview</h2>

        {sources.length === 0 ? (
          <p className="text-gray-500 text-sm">No sessions in the selected period.</p>
        ) : (
          <div className="space-y-1">
            <FunnelBar stage="traffic_source" />
            <ConvRateRow from="traffic_source" to="landed_quoter" />
            <FunnelBar stage="landed_quoter" />
            <ConvRateRow from="landed_quoter" to="started_quote" />
            <FunnelBar stage="started_quote" />
            <ConvRateRow from="started_quote" to="price_shown" />
            <FunnelBar stage="price_shown" />
            <ConvRateRow from="price_shown" to="booked" />
            <FunnelBar stage="booked" />
          </div>
        )}
      </div>

      {/* Source × Stage table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Source × Stage Breakdown</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Counts and stage-to-stage conversion rates per source
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Source
                </th>
                {STAGE_ORDER.map((stage) => (
                  <th
                    key={stage}
                    className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap"
                  >
                    {STAGE_LABELS[stage]}
                  </th>
                ))}
                {/* Conversion rate columns */}
                <th className="px-4 py-3 text-right font-semibold text-gray-500 whitespace-nowrap">
                  Sess→Landed
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500 whitespace-nowrap">
                  Landed→Started
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500 whitespace-nowrap">
                  Started→Priced
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500 whitespace-nowrap">
                  Priced→Booked
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sources.map((src) => {
                const row = funnelRows[src] ?? {};
                const ts = row.traffic_source ?? 0;
                const lq = row.landed_quoter ?? 0;
                const sq = row.started_quote ?? 0;
                const ps = row.price_shown ?? 0;
                const bk = row.booked ?? 0;

                return (
                  <tr key={src} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: sourceHex(src) }}
                        />
                        <span className="font-medium text-gray-900">{src}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{ts.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{lq.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{sq.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{ps.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{bk.toLocaleString()}</td>
                    {/* Conversion rates */}
                    <td className="px-4 py-3 text-right text-gray-500 font-medium">
                      {convRate(ts, lq)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 font-medium">
                      {convRate(lq, sq)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 font-medium">
                      {convRate(sq, ps)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 font-medium">
                      {convRate(ps, bk)}
                    </td>
                  </tr>
                );
              })}

              {/* Totals row */}
              {sources.length > 0 && (
                <tr className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                  <td className="px-6 py-3 text-gray-900">Total</td>
                  {STAGE_ORDER.map((stage) => (
                    <td key={stage} className="px-4 py-3 text-right text-gray-900">
                      {stageTotal(funnelRows, sources, stage).toLocaleString()}
                    </td>
                  ))}
                  {/* Overall conversion rates */}
                  <td className="px-4 py-3 text-right text-gray-700">
                    {convRate(
                      stageTotal(funnelRows, sources, 'traffic_source'),
                      stageTotal(funnelRows, sources, 'landed_quoter'),
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {convRate(
                      stageTotal(funnelRows, sources, 'landed_quoter'),
                      stageTotal(funnelRows, sources, 'started_quote'),
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {convRate(
                      stageTotal(funnelRows, sources, 'started_quote'),
                      stageTotal(funnelRows, sources, 'price_shown'),
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {convRate(
                      stageTotal(funnelRows, sources, 'price_shown'),
                      stageTotal(funnelRows, sources, 'booked'),
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* True-total bookings card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-pink-500">
          <div className="text-sm text-gray-600 mb-1">Total Sessions</div>
          <div className="text-3xl font-bold text-gray-900">
            {stageTotal(funnelRows, sources, 'traffic_source').toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-1">Bookings (attributed)</div>
          <div className="text-3xl font-bold text-gray-900">
            {attributedBookings.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">From conversion events</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-1">Bookings (confirmed total)</div>
          <div className="text-3xl font-bold text-gray-900">
            {trueTotalBookings.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            From booking records
            {bookingDelta > 0 && (
              <span className="text-amber-600 font-medium ml-1">
                ({bookingDelta} unattributed)
              </span>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
