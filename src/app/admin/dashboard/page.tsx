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
  comparison: {
    spendShare: { google: number; microsoft: number };
    winningPlatform: {
      ctr: string;
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
}

export default function AdminDashboard() {
  // Get global sync state
  const { syncVersion } = useSync();

  // Use shared dashboard cache context
  const { getCachedData, setCachedData, invalidateCache } = useDashboardCache();

  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>('7days');

  // Lead data — single source of truth for all lead counts on this page
  const [allLeads, setAllLeads] = useState<UnifiedLead[]>([]);

  // Get current data from shared cache
  const data = getCachedData(dateFilter) as UnifiedDashboardData | null;

  // Check if we have ANY cached data (for showing content while loading new period)
  const hasAnyCachedData = ALL_DATE_FILTERS.some(f => getCachedData(f) !== null);

  // Filter leads by date range and compute per-platform counts
  const dateRangeObj = useMemo(() => getDateRange(dateFilter), [dateFilter]);

  const filteredLeads = useMemo(() => {
    return allLeads.filter(lead => isInDateRange(lead.created_at, dateRangeObj));
  }, [allLeads, dateRangeObj]);

  const computeLeadCounts = (leads: UnifiedLead[]) => ({
    total: leads.length,
    calls: leads.filter(l => l.type === 'call').length,
    texts: leads.filter(l => l.type === 'text').length,
    forms: leads.filter(l => l.type === 'form').length,
    new: leads.filter(l => l.status === 'new').length,
  });

  const leadMetrics = useMemo(() => {
    const googleLeads = filteredLeads.filter(l => l.ad_platform === 'google');
    const microsoftLeads = filteredLeads.filter(l => l.ad_platform === 'microsoft');
    const otherLeads = filteredLeads.filter(l => !l.ad_platform || (l.ad_platform !== 'google' && l.ad_platform !== 'microsoft'));

    const total = computeLeadCounts(filteredLeads);
    const google = computeLeadCounts(googleLeads);
    const microsoft = computeLeadCounts(microsoftLeads);
    const other = computeLeadCounts(otherLeads);

    // Form-only counts for Lead Attribution section
    const formLeads = filteredLeads.filter(l => l.type === 'form');
    const formByPlatform = {
      google: formLeads.filter(l => l.ad_platform === 'google').length,
      microsoft: formLeads.filter(l => l.ad_platform === 'microsoft').length,
      direct: formLeads.filter(l => !l.ad_platform || (l.ad_platform !== 'google' && l.ad_platform !== 'microsoft')).length,
    };

    return { total, google, microsoft, other, formTotal: formLeads.length, formNew: formLeads.filter(l => l.status === 'new').length, formByPlatform };
  }, [filteredLeads]);

  // Derived CPL and comparison metrics (depends on server-side spend data + client-side lead counts)
  const derivedMetrics = useMemo(() => {
    const googleSpend = data?.platforms.google.spend ?? 0;
    const microsoftSpend = data?.platforms.microsoft.spend ?? 0;
    const totalSpend = googleSpend + microsoftSpend;
    const totalClicks = (data?.platforms.google.clicks ?? 0) + (data?.platforms.microsoft.clicks ?? 0);

    const overallCpl = leadMetrics.total.total > 0 ? totalSpend / leadMetrics.total.total : 0;
    const googleCpl = leadMetrics.google.total > 0 ? googleSpend / leadMetrics.google.total : 0;
    const microsoftCpl = leadMetrics.microsoft.total > 0 ? microsoftSpend / leadMetrics.microsoft.total : 0;
    const conversionRate = totalClicks > 0 ? (leadMetrics.total.total / totalClicks) * 100 : 0;

    const totalLeads = leadMetrics.total.total || 1; // avoid division by zero for shares
    const leadShare = {
      google: (leadMetrics.google.total / totalLeads) * 100,
      microsoft: (leadMetrics.microsoft.total / totalLeads) * 100,
      other: (leadMetrics.other.total / totalLeads) * 100,
    };

    let winningCpl = '';
    if (googleCpl > 0 && microsoftCpl > 0) {
      winningCpl = googleCpl <= microsoftCpl ? 'google' : 'microsoft';
    } else if (googleCpl > 0) {
      winningCpl = 'google';
    } else if (microsoftCpl > 0) {
      winningCpl = 'microsoft';
    }

    let winningVolume = '';
    if (leadMetrics.google.total > leadMetrics.microsoft.total) {
      winningVolume = 'google';
    } else if (leadMetrics.microsoft.total > leadMetrics.google.total) {
      winningVolume = 'microsoft';
    }

    return {
      overallCpl,
      googleCpl,
      microsoftCpl,
      conversionRate,
      leadShare,
      cplDifference: Math.abs(googleCpl - microsoftCpl),
      winningCpl,
      winningVolume,
    };
  }, [data, leadMetrics]);

  const fetchLeads = useCallback(async () => {
    try {
      const leads = await fetchUnifiedLeads({ includeAttribution: true });
      setAllLeads(leads);
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  }, []);

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
    await Promise.all([
      ...ALL_DATE_FILTERS.map(filter => fetchData(filter)),
      fetchLeads(),
    ]);
  }, [fetchData, fetchLeads, invalidateCache]);

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

  // Initial load - fetch current filter if not cached + fetch leads
  useEffect(() => {
    const promises: Promise<any>[] = [fetchLeads()];
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
    summary: { totalSpend: 0, totalClicks: 0, totalImpressions: 0, overallCtr: 0, totalRevenue: 0, roas: 0 },
    platforms: {
      google: { spend: 0, clicks: 0, impressions: 0, ctr: 0 },
      microsoft: { spend: 0, clicks: 0, impressions: 0, ctr: 0 },
    },
    calls: { total: 0, answered: 0, missed: 0, answerRate: 0, byPlatform: { google: 0, microsoft: 0, direct: 0 } },
    comparison: { spendShare: { google: 0, microsoft: 0 }, winningPlatform: { ctr: '' } },
    dateRange: { start: '', end: '', display: 'Loading...', period: dateFilter },
  };

  const { summary, platforms, calls, comparison } = displayData;

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
          <p className="text-3xl font-bold text-gray-900">{leadMetrics.total.total}</p>
          <div className="mt-2 flex items-center gap-2 text-sm flex-wrap">
            <span className="text-blue-600">Google: {leadMetrics.google.total}</span>
            <span className="text-gray-300">|</span>
            <span className="text-cyan-600">MS: {leadMetrics.microsoft.total}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">Other: {leadMetrics.other.total}</span>
          </div>
        </div>

        {/* Cost Per Lead */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Cost Per Lead</span>
            <TrendingDown className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(derivedMetrics.overallCpl)}</p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className={`${derivedMetrics.winningCpl === 'google' ? 'text-green-600 font-medium' : 'text-blue-600'}`}>
              G: {formatCurrency(derivedMetrics.googleCpl)}
            </span>
            <span className="text-gray-300">|</span>
            <span className={`${derivedMetrics.winningCpl === 'microsoft' ? 'text-green-600 font-medium' : 'text-cyan-600'}`}>
              MS: {formatCurrency(derivedMetrics.microsoftCpl)}
            </span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Conversion Rate</span>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatPercent(derivedMetrics.conversionRate)}</p>
          <p className="mt-2 text-sm text-gray-500">
            {formatNumber(summary.totalClicks)} clicks &rarr; {leadMetrics.total.total} leads
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
              {derivedMetrics.winningCpl === 'google' && (
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
                <p className="text-xl font-bold text-gray-900">{leadMetrics.google.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CPL</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(derivedMetrics.googleCpl)}</p>
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
                  {leadMetrics.google.calls}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  {leadMetrics.google.texts}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-purple-500" />
                  {leadMetrics.google.forms}
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
              {derivedMetrics.winningCpl === 'microsoft' && (
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
                <p className="text-xl font-bold text-gray-900">{leadMetrics.microsoft.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CPL</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(derivedMetrics.microsoftCpl)}</p>
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
                  {leadMetrics.microsoft.calls}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  {leadMetrics.microsoft.texts}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-purple-500" />
                  {leadMetrics.microsoft.forms}
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
                <p className="text-xl font-bold text-gray-900">{leadMetrics.other.total}</p>
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
                  {leadMetrics.other.calls}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  {leadMetrics.other.texts}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-purple-500" />
                  {leadMetrics.other.forms}
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
              Google {formatPercent(derivedMetrics.leadShare.google)} | Microsoft {formatPercent(derivedMetrics.leadShare.microsoft)} | Other {formatPercent(derivedMetrics.leadShare.other)}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className="bg-blue-500 transition-all duration-500"
              style={{ width: `${derivedMetrics.leadShare.google}%` }}
            />
            <div
              className="bg-cyan-500 transition-all duration-500"
              style={{ width: `${derivedMetrics.leadShare.microsoft}%` }}
            />
            <div
              className="bg-gray-400 transition-all duration-500"
              style={{ width: `${derivedMetrics.leadShare.other}%` }}
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
              <p className="text-2xl font-bold text-gray-900">{leadMetrics.formTotal}</p>
              <p className="text-sm text-gray-600">Total Form Leads</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{leadMetrics.formNew}</p>
              <p className="text-sm text-gray-600">New (Pending)</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Leads by Source</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600">Google Ads</span>
                <span className="text-sm font-medium">{leadMetrics.formByPlatform.google}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-cyan-600">Microsoft Ads</span>
                <span className="text-sm font-medium">{leadMetrics.formByPlatform.microsoft}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Direct / Organic</span>
                <span className="text-sm font-medium">{leadMetrics.formByPlatform.direct}</span>
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
              {derivedMetrics.winningCpl === 'google' ? (
                <ArrowDownRight className="w-5 h-5 text-green-500" />
              ) : derivedMetrics.winningCpl === 'microsoft' ? (
                <ArrowDownRight className="w-5 h-5 text-green-500" />
              ) : (
                <Minus className="w-5 h-5 text-gray-400" />
              )}
              <span className="font-medium text-gray-900">Best CPL</span>
            </div>
            <p className="text-sm text-gray-600">
              {derivedMetrics.winningCpl === 'google' ? (
                <>Google Ads has {formatCurrency(derivedMetrics.cplDifference)} lower CPL</>
              ) : derivedMetrics.winningCpl === 'microsoft' ? (
                <>Microsoft Ads has {formatCurrency(derivedMetrics.cplDifference)} lower CPL</>
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
              {derivedMetrics.winningVolume === 'google' ? (
                <>Google Ads: {formatPercent(derivedMetrics.leadShare.google)} of leads</>
              ) : derivedMetrics.winningVolume === 'microsoft' ? (
                <>Microsoft Ads: {formatPercent(derivedMetrics.leadShare.microsoft)} of leads</>
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
