'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { useSync } from '@/contexts/SyncContext';
import {
  DollarSign,
  Target,
  Users,
  MousePointer,
  Eye,
  BarChart3,
  Zap,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface GoogleAdsData {
  spend: number;
  clicks: number;
  impressions: number;
  ctr: number;
  leads: {
    total: number;
    calls: number;  // Unique callers (30s+ inbound calls)
    forms: number;  // Form submissions
  };
  costPerLead: number;
  apiConversions: number;
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
      className="px-4 py-2 rounded-lg text-sm font-medium bg-pink-600 text-white hover:bg-pink-700 disabled:bg-pink-400 ml-2 flex items-center gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
      {syncing ? (progress || 'Syncing...') : 'Sync All Data'}
    </button>
  );
}

export default function GoogleAdsPage() {
  // Get global sync state
  const { syncVersion } = useSync();

  // Cache data for all time periods
  const [dataCache, setDataCache] = useState<Record<DateFilter, GoogleAdsData | null>>({
    today: null,
    yesterday: null,
    '7days': null,
    '30days': null,
    all: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');

  // Get current data from cache
  const data = dataCache[dateFilter];

  // Check if we have ANY cached data (for showing content while loading new period)
  const hasAnyCachedData = Object.values(dataCache).some(d => d !== null);

  const fetchData = useCallback(async (filter: DateFilter) => {
    try {
      const response = await fetch(`/api/admin/dashboard/google-ads?period=${filter}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Google Ads data');
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
    const promises = ALL_FILTERS.map(filter => fetchData(filter));
    await Promise.all(promises);
  }, [fetchData]);

  // Subscribe to global sync events
  useEffect(() => {
    if (syncVersion > 0) {
      refreshAllData();
    }
  }, [syncVersion, refreshAllData]);

  // When changing date filter, use cached data or fetch if not available
  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
    // If data not in cache, fetch it
    if (!dataCache[filter]) {
      setLoading(true);
      fetchData(filter).finally(() => setLoading(false));
    }
  };

  // Initial load - fetch current filter
  useEffect(() => {
    setLoading(true);
    fetchData(dateFilter).finally(() => setLoading(false));
  }, []);

  // Only show full-page spinner on initial load (no cached data at all)
  if (loading && !hasAnyCachedData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
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
  const displayData: GoogleAdsData = data || {
    spend: 0,
    clicks: 0,
    impressions: 0,
    ctr: 0,
    leads: { total: 0, calls: 0, forms: 0 },
    costPerLead: 0,
    apiConversions: 0,
    topConverters: [],
    dateRange: { start: '', end: '', display: 'No data available' },
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Google Ads Performance</h1>
            <p className="text-gray-600 mt-1">Google Search & Display advertising analytics</p>
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

      {/* Primary Metrics - Ad Spend vs Unique Leads */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-300 rounded-xl p-6 mb-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-pink-600" />
          Primary Metric: Ad Spend vs Unique Leads
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Spend */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Ad Spend</p>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${displayData.spend.toFixed(2)}
            </p>
          </div>

          {/* Unique Leads */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Unique Leads</p>
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {displayData.leads.total}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {displayData.leads.calls} calls • {displayData.leads.forms} forms
            </p>
          </div>

          {/* Cost Per Lead */}
          <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-pink-300">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-pink-600">Cost Per Lead</p>
              <Target className="w-5 h-5 text-pink-600" />
            </div>
            <p className="text-3xl font-bold text-pink-600">
              ${displayData.costPerLead.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Primary KPI: Lower is better
            </p>
          </div>
        </div>
      </div>

      {/* Lead Attribution Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Lead Attribution (Google Ads)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Unique Callers</p>
            <p className="text-2xl font-bold text-blue-600">{displayData.leads.calls}</p>
            <p className="text-xs text-gray-500 mt-1">30s+ inbound calls attributed to Google</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Form Submissions</p>
            <p className="text-2xl font-bold text-purple-600">{displayData.leads.forms}</p>
            <p className="text-xs text-gray-500 mt-1">Quote forms attributed to Google</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Google Conversions</p>
            <p className="text-2xl font-bold text-orange-600">{displayData.apiConversions}</p>
            <p className="text-xs text-gray-500 mt-1">Conversions tracked by Google Ads API</p>
          </div>
        </div>
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Lead Definition:</strong> A lead is either a form submission OR a unique phone caller with a 30+ second call. Calls are attributed to Google via GCLID tracking within a 5-minute session window.
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spend</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${displayData.spend.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-pink-600" />
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {displayData.clicks.toLocaleString()}
              </p>
            </div>
            <MousePointer className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Impressions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {displayData.impressions.toLocaleString()}
              </p>
            </div>
            <Eye className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CTR</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {displayData.ctr.toFixed(2)}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Top Converters */}
      {displayData.topConverters.length > 0 && (
        <div className="bg-white shadow-sm border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-green-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Top Converting Terms - Increase Bids</h2>
                <p className="text-sm text-gray-600 mt-1">These terms are winners - consider increasing bids by +40%</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {displayData.topConverters.map((term, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{term.term}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {term.conversions} conversions @ {term.convRate.toFixed(1)}% rate • ${term.cpa.toFixed(2)} CPA • {term.clicks} clicks
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-700">
                    {term.convRate.toFixed(1)}% Conv Rate
                  </p>
                  <p className="text-xs text-gray-600">
                    ${term.cpa.toFixed(2)} CPA
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links to Google Ads</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a
            href="https://ads.google.com/aw/campaigns"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">Open Campaigns</span>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
          <a
            href="https://ads.google.com/aw/keywords/negatives"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">Negative Keywords</span>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
          <a
            href="https://ads.google.com/aw/conversions"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">Conversion Settings</span>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
          <a
            href="https://ads.google.com/aw/reporting"
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
