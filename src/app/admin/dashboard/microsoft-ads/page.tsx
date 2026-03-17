'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { useSync } from '@/contexts/SyncContext';
import {
  DollarSign,
  Target,
  Users,
  ExternalLink,
  RefreshCw,
  Phone,
  MessageSquare,
  FileText,
  TrendingUp,
} from 'lucide-react';
import PlatformLeadsTable from '@/components/admin/PlatformLeadsTable';
import { type UnifiedLeadRow } from '@/lib/unifiedLeadsBuilder';
import { calcROAS, calcCPL } from '@/lib/metricFormulas';

interface MicrosoftAdsData {
  spend: number;
  clicks: number;
  impressions: number;
  ctr: number;
  topConverters: {
    term: string;
    conversions: number;
    convRate: number;
    cpa: number;
    clicks: number;
  }[];
  dateRange: {
    start: string;
    end: string;
    display: string;
  };
}

type DateFilter = 'today' | 'yesterday' | '7days' | '30days' | 'all';
const ALL_FILTERS: DateFilter[] = ['today', 'yesterday', '7days', '30days', 'all'];

// Inline sync button that uses global sync context
function SyncButtonInline() {
  const { syncing, progress, triggerGlobalSync } = useSync();
  return (
    <button
      onClick={triggerGlobalSync}
      disabled={syncing}
      className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-cyan-400 ml-2 flex items-center gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
      {syncing ? (progress || 'Syncing...') : 'Sync All Data'}
    </button>
  );
}

export default function MicrosoftAdsPage() {
  // Get global sync state
  const { syncVersion } = useSync();

  // Cache data for all time periods
  const [dataCache, setDataCache] = useState<Record<DateFilter, MicrosoftAdsData | null>>({
    today: null,
    yesterday: null,
    '7days': null,
    '30days': null,
    all: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');

  // Lead data from canonical server-side source (same logic as Executive Dashboard)
  const [microsoftLeads, setMicrosoftLeads] = useState<UnifiedLeadRow[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);

  // Get current data from cache
  const data = dataCache[dateFilter];

  // Check if we have ANY cached data (for showing content while loading new period)
  const hasAnyCachedData = Object.values(dataCache).some(d => d !== null);

  const leadCounts = useMemo(() => ({
    total: microsoftLeads.length,
    calls: microsoftLeads.filter(l => l.type === 'call').length,
    texts: microsoftLeads.filter(l => l.type === 'text').length,
    forms: microsoftLeads.filter(l => l.type === 'form').length,
  }), [microsoftLeads]);

  const costPerLead = useMemo(() => {
    return calcCPL(data?.spend ?? 0, leadCounts.total) ?? 0;
  }, [leadCounts.total, data]);

  const revenue = useMemo(() => {
    return microsoftLeads.reduce((sum, lead) => sum + (lead.revenue_amount || 0), 0);
  }, [microsoftLeads]);

  const roi = useMemo(() => {
    return calcROAS(revenue, data?.spend ?? 0);
  }, [revenue, data]);

  const fetchLeads = useCallback(async (period: DateFilter) => {
    try {
      setLeadsLoading(true);
      const res = await fetch(`/api/admin/dashboard/unified-leads?period=${period}&platform=microsoft`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.ok) setMicrosoftLeads(data.leads || []);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  const fetchData = useCallback(async (filter: DateFilter) => {
    try {
      const response = await fetch(`/api/admin/dashboard/microsoft-ads?period=${filter}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Microsoft Ads data');
      }
      const result = await response.json();
      setDataCache(prev => ({ ...prev, [filter]: result }));
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, []);

  // Refresh all data when global sync triggers
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      ...ALL_FILTERS.map(filter => fetchData(filter)),
      fetchLeads(dateFilter),
    ]);
  }, [fetchData, fetchLeads, dateFilter]);

  // Subscribe to global sync events
  useEffect(() => {
    if (syncVersion > 0) {
      refreshAllData();
    }
  }, [syncVersion, refreshAllData]);

  // When changing date filter, use cached data or fetch if not available
  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
    fetchLeads(filter);
    // If data not in cache, fetch it
    if (!dataCache[filter]) {
      setLoading(true);
      fetchData(filter).finally(() => setLoading(false));
    }
  };

  // Initial load - fetch current filter + leads
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData(dateFilter),
      fetchLeads(dateFilter),
    ]).finally(() => setLoading(false));
  }, []);

  // Only show full-page spinner on initial load (no cached data at all)
  if (loading && !hasAnyCachedData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !data) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => fetchData(dateFilter)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Use placeholder data if API not ready yet
  const displayData: MicrosoftAdsData = data || {
    spend: 0,
    clicks: 0,
    impressions: 0,
    ctr: 0,
    topConverters: [],
    dateRange: { start: '', end: '', display: 'No data available' },
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Microsoft Ads Performance</h1>
            <p className="text-gray-600 mt-1">Bing, Yahoo & DuckDuckGo advertising analytics</p>
          </div>
        </div>
      </div>

      {/* Date Range Display with Filter Buttons */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-blue-800">
            <strong>Report Period:</strong> {displayData.dateRange.display}
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => handleDateFilterChange(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-800 hover:bg-blue-100 border border-blue-300'
                }`}
              >
                {filter === 'today' && 'Today'}
                {filter === 'yesterday' && 'Yesterday'}
                {filter === '7days' && 'Last 7 Days'}
                {filter === '30days' && 'Last 30 Days'}
                {filter === 'all' && 'All Time'}
              </button>
            ))}
            <SyncButtonInline />
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 rounded-xl p-6 mb-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-cyan-600" />
          Microsoft Ads Performance
        </h2>

        {/* Row 1: Financial KPIs (most actionable) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Ad Spend */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-600">Ad Spend</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${displayData.spend.toFixed(2)}
            </p>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-green-300">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-green-700">Attributed Revenue</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              ${revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            {revenue === 0 && <p className="text-xs text-gray-400 mt-1">From matched invoices</p>}
          </div>

          {/* ROI */}
          <div className={`bg-white rounded-lg p-4 shadow-sm border-2 ${roi === null ? 'border-gray-200' : roi >= 3 ? 'border-green-500' : roi >= 1 ? 'border-yellow-400' : 'border-red-400'}`}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className={`w-4 h-4 ${roi === null ? 'text-gray-400' : roi >= 1 ? 'text-green-600' : 'text-red-500'}`} />
              <p className={`text-sm font-medium ${roi === null ? 'text-gray-600' : roi >= 1 ? 'text-green-700' : 'text-red-600'}`}>ROAS</p>
            </div>
            {roi === null ? (
              <p className="text-2xl font-bold text-gray-400">—</p>
            ) : (
              <>
                <p className={`text-2xl font-bold ${roi >= 3 ? 'text-green-600' : roi >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {roi.toFixed(1)}x
                </p>
                <p className="text-xs text-gray-500 mt-1">Attributed rev ÷ spend</p>
              </>
            )}
          </div>

          {/* Cost Per Lead */}
          <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-cyan-300">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-cyan-600" />
              <p className="text-sm font-medium text-cyan-600">Cost / Lead</p>
            </div>
            <p className="text-2xl font-bold text-cyan-600">
              ${costPerLead.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Row 2: Lead Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Leads */}
          <div className="bg-white/70 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
            </div>
            <p className="text-xl font-bold text-green-600">{leadCounts.total}</p>
          </div>

          {/* Click to Call */}
          <div className="bg-white/70 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-medium text-gray-600">Click to Call</p>
            </div>
            <p className="text-xl font-bold text-blue-600">{leadCounts.calls}</p>
          </div>

          {/* Click to Text */}
          <div className="bg-white/70 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <p className="text-sm font-medium text-gray-600">Click to Text</p>
            </div>
            <p className="text-xl font-bold text-indigo-600">{leadCounts.texts}</p>
          </div>

          {/* Form Submissions */}
          <div className="bg-white/70 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-purple-600" />
              <p className="text-sm font-medium text-gray-600">Form Leads</p>
            </div>
            <p className="text-xl font-bold text-purple-600">{leadCounts.forms}</p>
          </div>
        </div>
      </div>

      {/* Platform Leads Table — uses the same microsoftLeads as the primary metric */}
      <PlatformLeadsTable platform="microsoft" dateFilter={dateFilter} accentColor="cyan" leads={microsoftLeads} leadsLoading={leadsLoading} />

      {/* Quick Links */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links to Microsoft Ads</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a
            href="https://ads.microsoft.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">Open Campaigns</span>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
          <a
            href="https://ads.microsoft.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">Negative Keywords</span>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
          <a
            href="https://ads.microsoft.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">UET Tag Settings</span>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
          <a
            href="https://ads.microsoft.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">Reports</span>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
