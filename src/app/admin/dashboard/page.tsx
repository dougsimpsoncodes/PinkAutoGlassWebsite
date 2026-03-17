'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import DateFilterBar, { DateFilter } from '@/components/admin/DateFilterBar';
import { useSync } from '@/contexts/SyncContext';
import {
  DollarSign,
  Users,
  Target,
  TrendingUp,
  RadioTower,
  Phone,
  FileText,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { calcROAS, calcAttributionRate } from '@/lib/metricFormulas';

// Mirrors the shape returned by /api/admin/dashboard/metrics
interface MetricsResponse {
  ok: boolean;
  period: {
    start: string;
    end: string;
    startDate: string;
    endDate: string;
    label: string;
  };
  spend: {
    google: number;
    microsoft: number;
    total: number;
  };
  leads: {
    total: number;
    calls: number;
    forms: number;
    texts: number;
    byPlatform: {
      google: { total: number; calls: number; forms: number; texts: number };
      microsoft: { total: number; calls: number; forms: number; texts: number };
      unattributed: { total: number; calls: number; forms: number; texts: number };
    };
  };
  revenue: {
    gross: number;
    attributed: number;
    byPlatform: {
      google: number;
      microsoft: number;
      unattributed: number;
    };
  };
  traffic: {
    visitors: number;
    pageViews: number;
  };
  clickEvents: {
    phoneClicks: number;
    textClicks: number;
    formSubmits: number;
    total: number;
  };
}

export default function AdminDashboard() {
  const { syncVersion } = useSync();

  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>('7days');
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (period: DateFilter) => {
    try {
      setError(null);
      const res = await fetch(`/api/admin/dashboard/metrics?period=${period}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Unknown error');
      setMetrics(json);
    } catch (err: any) {
      console.error('Metrics fetch error:', err);
      setError(err.message || 'Failed to load metrics');
    }
  }, []);

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchMetrics(dateFilter).finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh on sync
  useEffect(() => {
    if (syncVersion > 0) {
      fetchMetrics(dateFilter);
    }
  }, [syncVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
    setLoading(true);
    fetchMetrics(filter).finally(() => setLoading(false));
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value || 0);

  const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value || 0);

  if (loading && !metrics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !metrics) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load dashboard data: {error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchMetrics(dateFilter).finally(() => setLoading(false));
            }}
            className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Derived values
  const m = metrics!;
  const roas = calcROAS(m.revenue.attributed, m.spend.total) ?? 0;
  const attributionRate = calcAttributionRate(m.revenue.attributed, m.revenue.gross);

  // Alerts
  const alerts: Array<{ type: 'warn' | 'ok'; message: string }> = [];
  if (m.revenue.gross === 0) alerts.push({ type: 'warn', message: 'Omega revenue not available for this period.' });
  if (m.spend.total === 0) alerts.push({ type: 'warn', message: 'Ad spend data unavailable for this period.' });
  if (m.traffic.visitors === 0) alerts.push({ type: 'warn', message: 'Traffic data unavailable for this period.' });
  if (alerts.length === 0) alerts.push({ type: 'ok', message: 'All systems reporting normally.' });

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-600 mt-1">30-second morning health check — no drilling</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
          <RadioTower className="w-4 h-4" />
          Market toggle coming soon
        </div>
      </div>

      <DateFilterBar
        dateFilter={dateFilter}
        onFilterChange={handleDateFilterChange}
        dateDisplay={m.period.label}
        color="pink"
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
            Gross Revenue <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(m.revenue.gross)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {attributionRate}% attributed to leads
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
            Qualifying Leads <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(m.leads.total)}</div>
          <div className="text-xs text-gray-500 mt-1">30s+ calls + forms + texts</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
            Ad Spend <Target className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(m.spend.total)}</div>
          <div className="text-xs text-gray-500 mt-1">Google + Microsoft</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
            ROAS <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{roas > 0 ? `${roas.toFixed(1)}x` : '—'}</div>
          <div className="text-xs text-gray-500 mt-1">Attributed rev ÷ ad spend</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
            Traffic <RadioTower className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(m.traffic.visitors)}</div>
          <div className="text-xs text-gray-500 mt-1">Visitors</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Lead Mix</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-4 h-4" />Calls</div>
              <div className="text-xl font-semibold text-gray-900 mt-1">{formatNumber(m.leads.calls)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600"><FileText className="w-4 h-4" />Forms</div>
              <div className="text-xl font-semibold text-gray-900 mt-1">{formatNumber(m.leads.forms)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600"><MessageSquare className="w-4 h-4" />Texts</div>
              <div className="text-xl font-semibold text-gray-900 mt-1">{formatNumber(m.leads.texts)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Google vs Microsoft</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="text-sm font-medium text-blue-800">Google</div>
              <div className="text-xs text-blue-700 mt-2">Spend</div>
              <div className="text-lg font-semibold text-blue-900">{formatCurrency(m.spend.google)}</div>
              <div className="text-xs text-blue-700 mt-2">Leads</div>
              <div className="text-lg font-semibold text-blue-900">{formatNumber(m.leads.byPlatform.google.total)}</div>
              <div className="text-xs text-blue-700 mt-2">Attributed Rev</div>
              <div className="text-lg font-semibold text-blue-900">{formatCurrency(m.revenue.byPlatform.google)}</div>
            </div>
            <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-4">
              <div className="text-sm font-medium text-cyan-800">Microsoft</div>
              <div className="text-xs text-cyan-700 mt-2">Spend</div>
              <div className="text-lg font-semibold text-cyan-900">{formatCurrency(m.spend.microsoft)}</div>
              <div className="text-xs text-cyan-700 mt-2">Leads</div>
              <div className="text-lg font-semibold text-cyan-900">{formatNumber(m.leads.byPlatform.microsoft.total)}</div>
              <div className="text-xs text-cyan-700 mt-2">Attributed Rev</div>
              <div className="text-lg font-semibold text-cyan-900">{formatCurrency(m.revenue.byPlatform.microsoft)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Attributed Revenue by Source</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Google Ads</div>
              <div className="text-lg font-semibold text-gray-900">{formatCurrency(m.revenue.byPlatform.google)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Microsoft Ads</div>
              <div className="text-lg font-semibold text-gray-900">{formatCurrency(m.revenue.byPlatform.microsoft)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Other / Direct</div>
              <div className="text-lg font-semibold text-gray-900">{formatCurrency(m.revenue.byPlatform.unattributed)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                  alert.type === 'warn'
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                }`}
              >
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
