'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import DateFilterBar, { DateFilter, ALL_DATE_FILTERS } from '@/components/admin/DateFilterBar';
import { useMarket } from '@/contexts/MarketContext';
import { useSync } from '@/contexts/SyncContext';
import { calcROAS, calcCPL } from '@/lib/metricFormulas';
import {
  DollarSign,
  Users,
  Target,
  TrendingUp,
  Search,
  MapPin,
} from 'lucide-react';

interface AdsData {
  spend: number;
  clicks: number;
  impressions: number;
  ctr: number;
  apiConversions: number;
  topConverters: {
    term: string;
    conversions: number;
    convRate: number;
    cpa: number;
    clicks: number;
  }[];
}

interface SearchTermRow {
  search_term: string;
  total_impressions: number;
  total_clicks: number;
  total_cost: number;
  total_leads: number;
  cost_per_lead: number;
}

interface SearchPerformanceData {
  summary: {
    combined: { impressions: number; clicks: number; cost: number; leads: number };
  };
  data: SearchTermRow[];
}

const FILTER_TO_DAYS: Record<DateFilter, number> = {
  today: 0,
  yesterday: 1,
  '7days': 7,
  '30days': 30,
  all: 365,
};

export default function SearchAdsControlRoom() {
  const { market } = useMarket();
  const { syncVersion } = useSync();

  const [dateFilter, setDateFilter] = useState<DateFilter>('7days');
  const [loading, setLoading] = useState(true);

  const [googleCache, setGoogleCache] = useState<Record<DateFilter, AdsData | null>>({
    today: null,
    yesterday: null,
    '7days': null,
    '30days': null,
    all: null,
  });
  const [microsoftCache, setMicrosoftCache] = useState<Record<DateFilter, AdsData | null>>({
    today: null,
    yesterday: null,
    '7days': null,
    '30days': null,
    all: null,
  });
  const [searchCache, setSearchCache] = useState<Record<DateFilter, SearchPerformanceData | null>>({
    today: null,
    yesterday: null,
    '7days': null,
    '30days': null,
    all: null,
  });

  // Lead counts from canonical server-side source (metrics API)
  const [leadsSummary, setLeadsSummary] = useState({ total: 0, google: 0, microsoft: 0 });
  const [revenueSummary, setRevenueSummary] = useState({ google: 0, microsoft: 0 });
  const [periodDisplay, setPeriodDisplay] = useState('');

  const googleData = googleCache[dateFilter];
  const microsoftData = microsoftCache[dateFilter];
  const searchData = searchCache[dateFilter];
  const hasAnyCachedData = Object.values(googleCache).some(d => d) || Object.values(microsoftCache).some(d => d);

  const combinedSpend = (googleData?.spend || 0) + (microsoftData?.spend || 0);
  const combinedLeads = leadsSummary.total;
  const combinedRevenue = revenueSummary.google + revenueSummary.microsoft;

  const cpa = calcCPL(combinedSpend, combinedLeads) ?? 0;
  const roas = calcROAS(combinedRevenue, combinedSpend) ?? 0;

  const googleCpa = calcCPL(googleData?.spend || 0, leadsSummary.google) ?? 0;
  const microsoftCpa = calcCPL(microsoftData?.spend || 0, leadsSummary.microsoft) ?? 0;

  const topWinners = useMemo(() => {
    const terms = searchData?.data || [];
    return [...terms]
      .filter(t => t.total_leads > 0)
      .sort((a, b) => b.total_leads - a.total_leads)
      .slice(0, 5);
  }, [searchData]);

  const topLosers = useMemo(() => {
    const terms = searchData?.data || [];
    return [...terms]
      .filter(t => t.total_cost > 0)
      .sort((a, b) => b.cost_per_lead - a.cost_per_lead)
      .slice(0, 5);
  }, [searchData]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value || 0);

  const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value || 0);

  const fetchLeadCounts = useCallback(async (period: DateFilter) => {
    try {
      const res = await fetch(`/api/admin/dashboard/metrics?period=${period}&market=${market}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.ok) return;
      setLeadsSummary({
        total: data.leads.total,
        google: data.leads.byPlatform.google.total,
        microsoft: data.leads.byPlatform.microsoft.total,
      });
      setRevenueSummary({
        google: data.revenue.byPlatform.google,
        microsoft: data.revenue.byPlatform.microsoft,
      });
      setPeriodDisplay(data.period?.label || '');
    } catch (err) {
      console.error('Error fetching lead counts:', err);
    }
  }, [market]);

  const fetchGoogle = useCallback(async (filter: DateFilter) => {
    const res = await fetch(`/api/admin/dashboard/google-ads?period=${filter}`);
    if (!res.ok) return null;
    const json = await res.json();
    setGoogleCache(prev => ({ ...prev, [filter]: json }));
    return json as AdsData;
  }, []);

  const fetchMicrosoft = useCallback(async (filter: DateFilter) => {
    const res = await fetch(`/api/admin/dashboard/microsoft-ads?period=${filter}`);
    if (!res.ok) return null;
    const json = await res.json();
    setMicrosoftCache(prev => ({ ...prev, [filter]: json }));
    return json as AdsData;
  }, []);

  const fetchSearchPerformance = useCallback(async (filter: DateFilter) => {
    const days = FILTER_TO_DAYS[filter] ?? 7;
    const res = await fetch(`/api/admin/dashboard/search-performance?days=${days}&minImpressions=5`);
    if (!res.ok) return null;
    const json = await res.json();
    setSearchCache(prev => ({ ...prev, [filter]: json }));
    return json as SearchPerformanceData;
  }, []);

  const refreshAllData = useCallback(async () => {
    await Promise.all([
      ...ALL_DATE_FILTERS.map(filter => fetchGoogle(filter)),
      ...ALL_DATE_FILTERS.map(filter => fetchMicrosoft(filter)),
      fetchSearchPerformance(dateFilter),
      fetchLeadCounts(dateFilter),
    ]);
  }, [fetchGoogle, fetchMicrosoft, fetchSearchPerformance, fetchLeadCounts, dateFilter]);

  useEffect(() => {
    if (syncVersion > 0) {
      refreshAllData();
    }
  }, [syncVersion, refreshAllData]);

  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
    fetchLeadCounts(filter);
    fetchSearchPerformance(filter);
    if (!googleCache[filter]) {
      setLoading(true);
      Promise.all([
        fetchGoogle(filter),
        fetchMicrosoft(filter),
        fetchSearchPerformance(filter),
      ]).finally(() => setLoading(false));
    }
  };

  // Re-fetch when market changes
  useEffect(() => {
    setLoading(true);
    setGoogleCache({ today: null, yesterday: null, '7days': null, '30days': null, all: null });
    setMicrosoftCache({ today: null, yesterday: null, '7days': null, '30days': null, all: null });
    setSearchCache({ today: null, yesterday: null, '7days': null, '30days': null, all: null });
    Promise.all([
      fetchGoogle(dateFilter),
      fetchMicrosoft(dateFilter),
      fetchSearchPerformance(dateFilter),
      fetchLeadCounts(dateFilter),
    ]).finally(() => setLoading(false));
  }, [market]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && !hasAnyCachedData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Search Ads Control Room</h1>
          <p className="text-gray-600 mt-1">Budget pacing, efficiency, winners/losers, search-term quality</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-pink-600" />
          Showing {market === 'all' ? 'All Markets' : market === 'colorado' ? 'Denver / CO' : 'Phoenix / AZ'}
        </div>
      </div>

      <DateFilterBar
        dateFilter={dateFilter}
        onFilterChange={handleDateFilterChange}
        dateDisplay={periodDisplay}
        color="pink"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500">Spend <DollarSign className="w-4 h-4" /></div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(combinedSpend)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500">Qualifying Leads <Users className="w-4 h-4" /></div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(combinedLeads)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500">Cost / Lead <Target className="w-4 h-4" /></div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(cpa)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500">ROAS <TrendingUp className="w-4 h-4" /></div>
          <div className="text-2xl font-bold text-gray-900">{roas ? `${roas.toFixed(1)}x` : '—'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Google vs Microsoft</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="text-sm font-medium text-blue-800">Google</div>
              <div className="text-xs text-blue-700 mt-2">Spend</div>
              <div className="text-lg font-semibold text-blue-900">{formatCurrency(googleData?.spend || 0)}</div>
              <div className="text-xs text-blue-700 mt-2">Leads</div>
              <div className="text-lg font-semibold text-blue-900">{formatNumber(leadsSummary.google)}</div>
              <div className="text-xs text-blue-700 mt-2">Attributed Rev</div>
              <div className="text-lg font-semibold text-blue-900">{formatCurrency(revenueSummary.google)}</div>
            </div>
            <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-4">
              <div className="text-sm font-medium text-cyan-800">Microsoft</div>
              <div className="text-xs text-cyan-700 mt-2">Spend</div>
              <div className="text-lg font-semibold text-cyan-900">{formatCurrency(microsoftData?.spend || 0)}</div>
              <div className="text-xs text-cyan-700 mt-2">Leads</div>
              <div className="text-lg font-semibold text-cyan-900">{formatNumber(leadsSummary.microsoft)}</div>
              <div className="text-xs text-cyan-700 mt-2">Attributed Rev</div>
              <div className="text-lg font-semibold text-cyan-900">{formatCurrency(revenueSummary.microsoft)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Budget Signals</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Google Cost / Lead</span>
              <span>{formatCurrency(googleCpa)} {googleCpa > 0 && microsoftCpa > 0 && googleCpa < microsoftCpa ? '· Lower' : ''}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Microsoft Cost / Lead</span>
              <span>{formatCurrency(microsoftCpa)} {googleCpa > 0 && microsoftCpa > 0 && microsoftCpa < googleCpa ? '· Lower' : ''}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Spend / day</span>
              <span>{formatCurrency(combinedSpend / Math.max(FILTER_TO_DAYS[dateFilter] || 1, 1))}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Top Winners (Search Terms)</h2>
          {topWinners.length === 0 ? (
            <div className="text-sm text-gray-500">No term data available for this range.</div>
          ) : (
            <div className="space-y-3">
              {topWinners.map((term) => (
                <div key={term.search_term} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-gray-900">{term.search_term}</div>
                    <div className="text-xs text-gray-500">{formatNumber(term.total_impressions)} imps · {formatNumber(term.total_clicks)} clicks</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-600">{formatNumber(term.total_leads)} leads</div>
                    <div className="text-xs text-gray-500">{formatCurrency(term.cost_per_lead)} CPL</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Losers / Waste (High CPL)</h2>
          {topLosers.length === 0 ? (
            <div className="text-sm text-gray-500">No term data available for this range.</div>
          ) : (
            <div className="space-y-3">
              {topLosers.map((term) => (
                <div key={term.search_term} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-gray-900">{term.search_term}</div>
                    <div className="text-xs text-gray-500">{formatNumber(term.total_clicks)} clicks</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-rose-600">{formatCurrency(term.cost_per_lead)} CPL</div>
                    <div className="text-xs text-gray-500">{formatNumber(term.total_leads)} leads</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Search Term Quality</h2>
        {searchData?.data?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Total impressions</div>
              <div className="text-lg font-semibold text-gray-900">{formatNumber(searchData.summary.combined.impressions)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Total clicks</div>
              <div className="text-lg font-semibold text-gray-900">{formatNumber(searchData.summary.combined.clicks)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Total spend</div>
              <div className="text-lg font-semibold text-gray-900">{formatCurrency(searchData.summary.combined.cost)}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Search term data not available.</div>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <Search className="w-3.5 h-3.5" />
          Term quality is derived from combined Google/Microsoft search term data.
        </div>
      </div>
    </DashboardLayout>
  );
}
