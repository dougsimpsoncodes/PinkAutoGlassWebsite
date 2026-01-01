'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import DateFilterBar, { DateFilter, ALL_DATE_FILTERS } from '@/components/admin/DateFilterBar';
import { useSync } from '@/contexts/SyncContext';
import { useDashboardCache } from '@/contexts/DashboardCacheContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Phone,
  MessageSquare,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Target,
  Users,
} from 'lucide-react';

interface UnifiedDashboardData {
  summary: {
    totalSpend: number;
    totalLeads: number;
    costPerLead: number;
    totalClicks: number;
    totalImpressions: number;
    overallCtr: number;
    conversionRate: number;
    totalRevenue: number;
    roas: number;
  };
  platforms: {
    google: PlatformMetrics;
    microsoft: PlatformMetrics;
    other: PlatformMetrics;
  };
  calls: {
    total: number;
    answered: number;
    missed: number;
    answerRate: number;
    byPlatform: {
      google: number;
      microsoft: number;
      direct: number;
    };
  };
  leads: {
    total: number;
    new: number;
    byPlatform: {
      google: number;
      microsoft: number;
      direct: number;
    };
  };
  comparison: {
    cplDifference: number;
    ctrDifference: number;
    spendShare: { google: number; microsoft: number };
    leadShare: { google: number; microsoft: number; other: number };
    winningPlatform: {
      cpl: string;
      ctr: string;
      volume: string;
    };
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
  leads: {
    total: number;
    calls: number;
    texts: number;
    forms: number;
  };
  costPerLead: number;
}

export default function AdminDashboard() {
  // Get global sync state
  const { syncVersion } = useSync();

  // Use shared dashboard cache context
  const { getCachedData, setCachedData, invalidateCache } = useDashboardCache();

  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');

  // Get current data from shared cache
  const data = getCachedData(dateFilter) as UnifiedDashboardData | null;

  // Check if we have ANY cached data (for showing content while loading new period)
  const hasAnyCachedData = ALL_DATE_FILTERS.some(f => getCachedData(f) !== null);

  const fetchData = useCallback(async (filter: DateFilter) => {
    try {
      const res = await fetch(`/api/admin/dashboard/unified?period=${filter}`);
      if (res.ok) {
        const json = await res.json();
        setCachedData(filter, json); // Store in shared cache
        return json;
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
    return null;
  }, [setCachedData]);

  // Fetch all time periods when sync version changes (global sync triggered)
  const refreshAllData = useCallback(async () => {
    invalidateCache(); // Clear shared cache
    const promises = ALL_DATE_FILTERS.map(filter => fetchData(filter));
    await Promise.all(promises);
  }, [fetchData, invalidateCache]);

  // Subscribe to global sync events
  useEffect(() => {
    if (syncVersion > 0) {
      refreshAllData();
    }
  }, [syncVersion, refreshAllData]);

  // When changing date filter, use cached data or fetch if not available
  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
    if (!getCachedData(filter)) {
      setLoading(true);
      fetchData(filter).finally(() => setLoading(false));
    }
  };

  // Initial load - fetch current filter if not cached
  useEffect(() => {
    if (!getCachedData(dateFilter)) {
      setLoading(true);
      fetchData(dateFilter).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Only show full-page spinner on initial load (no cached data at all)
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

  // If data is null but we're loading a new period, show loading within the page
  // If data is truly failed (not loading and no data), show error
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

  // Use placeholder data while loading a new period
  const displayData: UnifiedDashboardData = data || {
    summary: { totalSpend: 0, totalLeads: 0, costPerLead: 0, totalClicks: 0, totalImpressions: 0, overallCtr: 0, conversionRate: 0, totalRevenue: 0, roas: 0 },
    platforms: {
      google: { spend: 0, clicks: 0, impressions: 0, ctr: 0, leads: { total: 0, calls: 0, texts: 0, forms: 0 }, costPerLead: 0 },
      microsoft: { spend: 0, clicks: 0, impressions: 0, ctr: 0, leads: { total: 0, calls: 0, texts: 0, forms: 0 }, costPerLead: 0 },
      other: { spend: 0, clicks: 0, impressions: 0, ctr: 0, leads: { total: 0, calls: 0, texts: 0, forms: 0 }, costPerLead: 0 },
    },
    calls: { total: 0, answered: 0, missed: 0, answerRate: 0, byPlatform: { google: 0, microsoft: 0, direct: 0 } },
    leads: { total: 0, new: 0, byPlatform: { google: 0, microsoft: 0, direct: 0 } },
    comparison: { cplDifference: 0, ctrDifference: 0, spendShare: { google: 0, microsoft: 0 }, leadShare: { google: 0, microsoft: 0, other: 0 }, winningPlatform: { cpl: '', ctr: '', volume: '' } },
    dateRange: { start: '', end: '', display: 'Loading...', period: dateFilter },
  };

  const { summary, platforms, calls, leads, comparison } = displayData;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Unified view of all advertising performance</p>
      </div>

      {/* Date Filter Bar */}
      <DateFilterBar
        dateFilter={dateFilter}
        onFilterChange={handleDateFilterChange}
        dateDisplay={displayData.dateRange.display}
        color="pink"
      />

      {/* Key KPIs - Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Spend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Ad Spend</span>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.totalSpend)}</p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-blue-600">Google: {formatCurrency(platforms.google.spend)}</span>
            <span className="text-gray-300">|</span>
            <span className="text-cyan-600">MS: {formatCurrency(platforms.microsoft.spend)}</span>
          </div>
        </div>

        {/* Total Leads */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Leads</span>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.totalLeads}</p>
          <div className="mt-2 flex items-center gap-2 text-sm flex-wrap">
            <span className="text-blue-600">Google: {platforms.google.leads.total}</span>
            <span className="text-gray-300">|</span>
            <span className="text-cyan-600">MS: {platforms.microsoft.leads.total}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">Other: {platforms.other.leads.total}</span>
          </div>
        </div>

        {/* Cost Per Lead */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Cost Per Lead</span>
            <TrendingDown className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.costPerLead)}</p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className={`${comparison.winningPlatform.cpl === 'google' ? 'text-green-600 font-medium' : 'text-blue-600'}`}>
              G: {formatCurrency(platforms.google.costPerLead)}
            </span>
            <span className="text-gray-300">|</span>
            <span className={`${comparison.winningPlatform.cpl === 'microsoft' ? 'text-green-600 font-medium' : 'text-cyan-600'}`}>
              MS: {formatCurrency(platforms.microsoft.costPerLead)}
            </span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Conversion Rate</span>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatPercent(summary.conversionRate)}</p>
          <p className="mt-2 text-sm text-gray-500">
            {formatNumber(summary.totalClicks)} clicks &rarr; {summary.totalLeads} leads
          </p>
        </div>
      </div>

      {/* Platform Comparison */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Platform Comparison</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Google Ads Card */}
          <div className="border-2 border-blue-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">G</span>
                </div>
                <span className="font-semibold text-gray-900">Google Ads</span>
              </div>
              {comparison.winningPlatform.cpl === 'google' && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Lower CPL
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Spend</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(platforms.google.spend)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Leads</p>
                <p className="text-xl font-bold text-gray-900">{platforms.google.leads.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CPL</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(platforms.google.costPerLead)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CTR</p>
                <p className="text-xl font-bold text-gray-900">{formatPercent(platforms.google.ctr)}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Lead Breakdown</span>
              </div>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-green-500" />
                  {platforms.google.leads.calls}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  {platforms.google.leads.texts}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-purple-500" />
                  {platforms.google.leads.forms}
                </span>
              </div>
            </div>
          </div>

          {/* Microsoft Ads Card */}
          <div className="border-2 border-cyan-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <span className="text-cyan-600 font-bold">M</span>
                </div>
                <span className="font-semibold text-gray-900">Microsoft Ads</span>
              </div>
              {comparison.winningPlatform.cpl === 'microsoft' && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Lower CPL
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Spend</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(platforms.microsoft.spend)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Leads</p>
                <p className="text-xl font-bold text-gray-900">{platforms.microsoft.leads.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CPL</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(platforms.microsoft.costPerLead)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CTR</p>
                <p className="text-xl font-bold text-gray-900">{formatPercent(platforms.microsoft.ctr)}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Lead Breakdown</span>
              </div>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-green-500" />
                  {platforms.microsoft.leads.calls}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  {platforms.microsoft.leads.texts}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-purple-500" />
                  {platforms.microsoft.leads.forms}
                </span>
              </div>
            </div>
          </div>

          {/* Other/Unattributed Card */}
          <div className="border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-semibold text-gray-900">Other / Direct</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Spend</p>
                <p className="text-xl font-bold text-gray-400">N/A</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Leads</p>
                <p className="text-xl font-bold text-gray-900">{platforms.other.leads.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CPL</p>
                <p className="text-xl font-bold text-gray-400">N/A</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CTR</p>
                <p className="text-xl font-bold text-gray-400">N/A</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Lead Breakdown</span>
              </div>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-green-500" />
                  {platforms.other.leads.calls}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  {platforms.other.leads.texts}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-purple-500" />
                  {platforms.other.leads.forms}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Spend Share Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Spend Distribution</span>
            <span className="text-gray-600">
              Google {formatPercent(comparison.spendShare.google)} | Microsoft {formatPercent(comparison.spendShare.microsoft)}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className="bg-blue-500 transition-all duration-500"
              style={{ width: `${comparison.spendShare.google}%` }}
            />
            <div
              className="bg-cyan-500 transition-all duration-500"
              style={{ width: `${comparison.spendShare.microsoft}%` }}
            />
          </div>
        </div>

        {/* Lead Share Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Lead Distribution</span>
            <span className="text-gray-600">
              Google {formatPercent(comparison.leadShare.google)} | Microsoft {formatPercent(comparison.leadShare.microsoft)} | Other {formatPercent(comparison.leadShare.other)}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className="bg-blue-500 transition-all duration-500"
              style={{ width: `${comparison.leadShare.google}%` }}
            />
            <div
              className="bg-cyan-500 transition-all duration-500"
              style={{ width: `${comparison.leadShare.microsoft}%` }}
            />
            <div
              className="bg-gray-400 transition-all duration-500"
              style={{ width: `${comparison.leadShare.other}%` }}
            />
          </div>
        </div>
      </div>

      {/* Call & Lead Attribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Call Analytics */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Call Analytics</h2>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{calls.total}</p>
              <p className="text-sm text-gray-600">Total Calls</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{calls.answered}</p>
              <p className="text-sm text-gray-600">Answered</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{calls.missed}</p>
              <p className="text-sm text-gray-600">Missed</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Answer Rate</span>
              <span className={`font-medium ${calls.answerRate >= 80 ? 'text-green-600' : calls.answerRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {formatPercent(calls.answerRate)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${calls.answerRate >= 80 ? 'bg-green-500' : calls.answerRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${calls.answerRate}%` }}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Calls by Source</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600">Google Ads</span>
                <span className="text-sm font-medium">{calls.byPlatform.google}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-cyan-600">Microsoft Ads</span>
                <span className="text-sm font-medium">{calls.byPlatform.microsoft}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Direct / Organic</span>
                <span className="text-sm font-medium">{calls.byPlatform.direct}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Attribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Attribution</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{leads.total}</p>
              <p className="text-sm text-gray-600">Total Form Leads</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{leads.new}</p>
              <p className="text-sm text-gray-600">New (Pending)</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Leads by Source</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600">Google Ads</span>
                <span className="text-sm font-medium">{leads.byPlatform.google}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-cyan-600">Microsoft Ads</span>
                <span className="text-sm font-medium">{leads.byPlatform.microsoft}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Direct / Organic</span>
                <span className="text-sm font-medium">{leads.byPlatform.direct}</span>
              </div>
            </div>
          </div>

          {/* Revenue & ROAS */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="text-lg font-bold text-green-600">{formatCurrency(summary.totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">ROAS</span>
              <span className={`text-lg font-bold ${summary.roas >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.roas.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CPL Winner */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {comparison.winningPlatform.cpl === 'google' ? (
                <ArrowDownRight className="w-5 h-5 text-green-500" />
              ) : comparison.winningPlatform.cpl === 'microsoft' ? (
                <ArrowDownRight className="w-5 h-5 text-green-500" />
              ) : (
                <Minus className="w-5 h-5 text-gray-400" />
              )}
              <span className="font-medium text-gray-900">Best CPL</span>
            </div>
            <p className="text-sm text-gray-600">
              {comparison.winningPlatform.cpl === 'google' ? (
                <>Google Ads has {formatCurrency(Math.abs(comparison.cplDifference))} lower CPL</>
              ) : comparison.winningPlatform.cpl === 'microsoft' ? (
                <>Microsoft Ads has {formatCurrency(Math.abs(comparison.cplDifference))} lower CPL</>
              ) : (
                <>Both platforms have similar CPL</>
              )}
            </p>
          </div>

          {/* CTR Winner */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {comparison.winningPlatform.ctr === 'google' ? (
                <ArrowUpRight className="w-5 h-5 text-green-500" />
              ) : comparison.winningPlatform.ctr === 'microsoft' ? (
                <ArrowUpRight className="w-5 h-5 text-green-500" />
              ) : (
                <Minus className="w-5 h-5 text-gray-400" />
              )}
              <span className="font-medium text-gray-900">Best CTR</span>
            </div>
            <p className="text-sm text-gray-600">
              {comparison.winningPlatform.ctr === 'google' ? (
                <>Google Ads: {formatPercent(platforms.google.ctr)} CTR</>
              ) : comparison.winningPlatform.ctr === 'microsoft' ? (
                <>Microsoft Ads: {formatPercent(platforms.microsoft.ctr)} CTR</>
              ) : (
                <>Both platforms have similar CTR</>
              )}
            </p>
          </div>

          {/* Volume Leader */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-gray-900">Volume Leader</span>
            </div>
            <p className="text-sm text-gray-600">
              {comparison.winningPlatform.volume === 'google' ? (
                <>Google Ads: {formatPercent(comparison.leadShare.google)} of leads</>
              ) : comparison.winningPlatform.volume === 'microsoft' ? (
                <>Microsoft Ads: {formatPercent(comparison.leadShare.microsoft)} of leads</>
              ) : (
                <>Equal lead volume from both platforms</>
              )}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
