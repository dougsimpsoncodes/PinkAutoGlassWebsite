'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import DateFilterBar, { DateFilter, ALL_DATE_FILTERS } from '@/components/admin/DateFilterBar';
import { useSync } from '@/contexts/SyncContext';
import { useDashboardCache } from '@/contexts/DashboardCacheContext';
import { fetchUnifiedLeads, UnifiedLead } from '@/lib/leadProcessing';
import { getDateRange, isInDateRange } from '@/lib/dateUtils';
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
  Info,
} from 'lucide-react';

interface UnifiedDashboardData {
  summary: {
    totalSpend: number;
    totalClicks: number;
    totalImpressions: number;
    overallCtr: number;
    totalRevenue: number;
    roas: number;
  };
  platforms: {
    google: PlatformMetrics;
    microsoft: PlatformMetrics;
  };
  dateRange: {
    start: string;
    end: string;
    display: string;
    period: string;
  };
}

interface PlatformMetrics {
  spend: number;
  clicks: number;
  impressions: number;
  ctr: number;
}

interface TrafficOverview {
  total_visitors: number;
  total_page_views: number;
  total_conversions: number;
  conversion_rate: number;
}

interface SatelliteDomain {
  utmSource: string;
}

const FALLBACK_SATELLITE_SOURCES = [
  'windshieldcostcalculator',
  'windshielddenver',
  'chiprepairdenver',
  'chiprepairboulder',
  'aurorawindshield',
  'mobilewindshielddenver',
  'cheapestwindshield',
  'newwindshieldcost',
  'getawindshieldquote',
  'newwindshieldnearme',
  'windshieldpricecompare',
  'chiprepairmesa',
  'chiprepairphoenix',
  'chiprepairscottsdale',
  'chiprepairtempe',
  'windshieldcostphoenix',
  'mobilewindshieldphoenix',
  'carwindshieldprices',
  'windshieldrepairprices',
  'carglassprices',
];

export default function AdminDashboard() {
  const { syncVersion } = useSync();
  const { getCachedData, setCachedData, invalidateCache } = useDashboardCache();

  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>('7days');
  const [grossRevenue, setGrossRevenue] = useState<{ grossRevenue: number; attributionRate: number; invoiceCount: number } | null>(null);
  const [allLeads, setAllLeads] = useState<UnifiedLead[]>([]);
  const [trafficOverview, setTrafficOverview] = useState<TrafficOverview | null>(null);
  const [satelliteSources, setSatelliteSources] = useState<string[]>([]);

  const data = getCachedData(dateFilter) as UnifiedDashboardData | null;
  const hasAnyCachedData = ALL_DATE_FILTERS.some(f => getCachedData(f) !== null);

  const dateRangeObj = useMemo(() => getDateRange(dateFilter), [dateFilter]);

  const filteredLeads = useMemo(() => (
    allLeads.filter(lead => isInDateRange(lead.created_at, dateRangeObj))
  ), [allLeads, dateRangeObj]);

  const leadMix = useMemo(() => {
    const total = filteredLeads.length;
    const calls = filteredLeads.filter(l => l.type === 'call').length;
    const forms = filteredLeads.filter(l => l.type === 'form').length;
    const texts = filteredLeads.filter(l => l.type === 'text').length;
    return { total, calls, forms, texts };
  }, [filteredLeads]);

  const platformSummary = useMemo(() => {
    const googleLeads = filteredLeads.filter(l => l.ad_platform === 'google');
    const microsoftLeads = filteredLeads.filter(l => l.ad_platform === 'microsoft');
    const googleRevenue = googleLeads.reduce((sum, l) => sum + (l.revenue_amount || 0), 0);
    const microsoftRevenue = microsoftLeads.reduce((sum, l) => sum + (l.revenue_amount || 0), 0);
    return {
      google: { leads: googleLeads.length, revenue: googleRevenue },
      microsoft: { leads: microsoftLeads.length, revenue: microsoftRevenue },
    };
  }, [filteredLeads]);

  const revenueDrivers = useMemo(() => {
    const satelliteSet = new Set(satelliteSources);
    let searchAds = 0;
    let organic = 0;
    let satellite = 0;
    let direct = 0;

    for (const lead of filteredLeads) {
      const revenue = lead.revenue_amount || 0;

      if (lead.utm_source && satelliteSet.has(lead.utm_source)) {
        satellite += revenue;
      } else if (lead.ad_platform === 'google' || lead.ad_platform === 'microsoft') {
        searchAds += revenue;
      } else if ((lead.ad_platform || '').includes('organic')) {
        organic += revenue;
      } else {
        direct += revenue;
      }
    }

    return { searchAds, organic, satellite, direct };
  }, [filteredLeads, satelliteSources]);

  const fetchLeads = useCallback(async () => {
    try {
      const leads = await fetchUnifiedLeads({ includeAttribution: true });
      setAllLeads(leads);
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  }, []);

  const fetchGrossRevenue = useCallback(async (filter: DateFilter) => {
    try {
      const res = await fetch(`/api/admin/total-revenue?period=${filter}`);
      if (res.ok) {
        const json = await res.json();
        setGrossRevenue(json);
      }
    } catch (err) {
      console.error('Error fetching gross revenue:', err);
    }
  }, []);

  const fetchTrafficOverview = useCallback(async (filter: DateFilter) => {
    try {
      const res = await fetch(`/api/admin/analytics?metric=overview&range=${filter}`);
      if (res.ok) {
        const json = await res.json();
        setTrafficOverview(json.data || null);
      }
    } catch (err) {
      console.error('Error fetching traffic overview:', err);
    }
  }, []);

  const fetchSatelliteSources = useCallback(async (filter: DateFilter) => {
    try {
      const { start, end } = getDateRange(filter);
      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];
      const res = await fetch(`/api/admin/satellite-domains?startDate=${startDate}&endDate=${endDate}`);
      if (res.ok) {
        const json = await res.json();
        const sources = (json.domains || json.data || []) as SatelliteDomain[];
        const mapped = sources.map(s => s.utmSource).filter(Boolean);
        setSatelliteSources(mapped.length > 0 ? mapped : FALLBACK_SATELLITE_SOURCES);
        return;
      }
    } catch (err) {
      console.error('Error fetching satellite sources:', err);
    }
    setSatelliteSources(FALLBACK_SATELLITE_SOURCES);
  }, []);

  const fetchData = useCallback(async (filter: DateFilter) => {
    try {
      const res = await fetch(`/api/admin/dashboard/unified?period=${filter}`);
      if (res.ok) {
        const json = await res.json();
        setCachedData(filter, json);
        return json;
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
    return null;
  }, [setCachedData]);

  const refreshAllData = useCallback(async () => {
    invalidateCache();
    await Promise.all([
      ...ALL_DATE_FILTERS.map(filter => fetchData(filter)),
      fetchLeads(),
      fetchGrossRevenue(dateFilter),
      fetchTrafficOverview(dateFilter),
      fetchSatelliteSources(dateFilter),
    ]);
  }, [fetchData, fetchLeads, fetchGrossRevenue, fetchTrafficOverview, fetchSatelliteSources, invalidateCache, dateFilter]);

  useEffect(() => {
    if (syncVersion > 0) {
      refreshAllData();
    }
  }, [syncVersion, refreshAllData]);

  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
    fetchGrossRevenue(filter);
    fetchTrafficOverview(filter);
    fetchSatelliteSources(filter);
    if (!getCachedData(filter)) {
      setLoading(true);
      fetchData(filter).finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    const promises: Promise<any>[] = [
      fetchLeads(),
      fetchGrossRevenue(dateFilter),
      fetchTrafficOverview(dateFilter),
      fetchSatelliteSources(dateFilter),
    ];
    if (!getCachedData(dateFilter)) {
      promises.push(fetchData(dateFilter));
    }
    if (promises.length > 0) {
      setLoading(true);
      Promise.all(promises).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value || 0);

  const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value || 0);

  if (loading && !hasAnyCachedData) {
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

  if (!data && !loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load dashboard data</p>
          <button
            onClick={() => fetchData(dateFilter)}
            className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const displayData: UnifiedDashboardData = data || {
    summary: { totalSpend: 0, totalClicks: 0, totalImpressions: 0, overallCtr: 0, totalRevenue: 0, roas: 0 },
    platforms: { google: { spend: 0, clicks: 0, impressions: 0, ctr: 0 }, microsoft: { spend: 0, clicks: 0, impressions: 0, ctr: 0 } },
    dateRange: { start: '', end: '', display: 'Loading...', period: dateFilter },
  };

  const { summary, platforms } = displayData;

  const revenueValue = grossRevenue?.grossRevenue ?? summary.totalRevenue;
  const trafficValue = trafficOverview?.total_visitors ?? 0;

  const alerts: Array<{ type: 'warn' | 'ok'; message: string }> = [];
  if (!grossRevenue) alerts.push({ type: 'warn', message: 'Omega revenue not available yet.' });
  if (summary.totalSpend === 0) alerts.push({ type: 'warn', message: 'Ad spend data unavailable for this period.' });
  if (!trafficOverview || trafficOverview.total_visitors === 0) alerts.push({ type: 'warn', message: 'Traffic data unavailable for this period.' });
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
        dateDisplay={displayData.dateRange.display}
        color="pink"
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
            Revenue <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(revenueValue)}</div>
          {grossRevenue && (
            <div className="text-xs text-gray-500 mt-1">
              {grossRevenue.invoiceCount} invoices · {grossRevenue.attributionRate}% attributed
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
            Leads <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(leadMix.total)}</div>
          <div className="text-xs text-gray-500 mt-1">Calls + forms + texts</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
            Ad Spend <Target className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalSpend)}</div>
          <div className="text-xs text-gray-500 mt-1">Google + Microsoft</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
            ROAS <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.roas ? `${summary.roas.toFixed(1)}x` : '—'}</div>
          <div className="text-xs text-gray-500 mt-1">Attributed revenue</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
            Traffic <RadioTower className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(trafficValue)}</div>
          <div className="text-xs text-gray-500 mt-1">Visitors</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Lead Mix</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-4 h-4" />Calls</div>
              <div className="text-xl font-semibold text-gray-900 mt-1">{formatNumber(leadMix.calls)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600"><FileText className="w-4 h-4" />Forms</div>
              <div className="text-xl font-semibold text-gray-900 mt-1">{formatNumber(leadMix.forms)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600"><MessageSquare className="w-4 h-4" />Texts</div>
              <div className="text-xl font-semibold text-gray-900 mt-1">{formatNumber(leadMix.texts)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Google vs Microsoft (Summary)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="text-sm font-medium text-blue-800">Google</div>
              <div className="text-xs text-blue-700 mt-2">Spend</div>
              <div className="text-lg font-semibold text-blue-900">{formatCurrency(platforms.google.spend)}</div>
              <div className="text-xs text-blue-700 mt-2">Leads</div>
              <div className="text-lg font-semibold text-blue-900">{formatNumber(platformSummary.google.leads)}</div>
              <div className="text-xs text-blue-700 mt-2">Revenue</div>
              <div className="text-lg font-semibold text-blue-900">{formatCurrency(platformSummary.google.revenue)}</div>
            </div>
            <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-4">
              <div className="text-sm font-medium text-cyan-800">Microsoft</div>
              <div className="text-xs text-cyan-700 mt-2">Spend</div>
              <div className="text-lg font-semibold text-cyan-900">{formatCurrency(platforms.microsoft.spend)}</div>
              <div className="text-xs text-cyan-700 mt-2">Leads</div>
              <div className="text-lg font-semibold text-cyan-900">{formatNumber(platformSummary.microsoft.leads)}</div>
              <div className="text-xs text-cyan-700 mt-2">Revenue</div>
              <div className="text-lg font-semibold text-cyan-900">{formatCurrency(platformSummary.microsoft.revenue)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Revenue Drivers</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Search Ads</div>
              <div className="text-lg font-semibold text-gray-900">{formatCurrency(revenueDrivers.searchAds)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Organic</div>
              <div className="text-lg font-semibold text-gray-900">{formatCurrency(revenueDrivers.organic)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Satellite</div>
              <div className="text-lg font-semibold text-gray-900">{formatCurrency(revenueDrivers.satellite)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Direct</div>
              <div className="text-lg font-semibold text-gray-900">{formatCurrency(revenueDrivers.direct)}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <Info className="w-3.5 h-3.5" />
            Satellite revenue based on utm_source mapping
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
