'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import DateFilterBar, { DateFilter, ALL_DATE_FILTERS } from '@/components/admin/DateFilterBar';
import { useSync } from '@/contexts/SyncContext';
import { useDashboardCache } from '@/contexts/DashboardCacheContext';
import { fetchUnifiedLeads, UnifiedLead } from '@/lib/leadProcessing';
import { getDateRange, isInDateRange } from '@/lib/dateUtils';
import Link from 'next/link';
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
  AlertCircle,
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

  // Gross revenue from omega_installs (all time, not date-filtered)
  const [grossRevenue, setGrossRevenue] = useState<{ grossRevenue: number; attributionRate: number; invoiceCount: number } | null>(null);

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

    // Revenue by platform (from matched invoices)
    const googleRevenue = googleLeads.reduce((sum, l) => sum + (l.revenue_amount || 0), 0);
    const microsoftRevenue = microsoftLeads.reduce((sum, l) => sum + (l.revenue_amount || 0), 0);
    const otherRevenue = otherLeads.reduce((sum, l) => sum + (l.revenue_amount || 0), 0);
    const totalRevenue = filteredLeads.reduce((sum, l) => sum + (l.revenue_amount || 0), 0);

    // New leads needing follow-up
    const newLeads = filteredLeads.filter(l => l.status === 'new');

    // Form-only counts for Lead Attribution section
    const formLeads = filteredLeads.filter(l => l.type === 'form');
    const formByPlatform = {
      google: formLeads.filter(l => l.ad_platform === 'google').length,
      microsoft: formLeads.filter(l => l.ad_platform === 'microsoft').length,
      direct: formLeads.filter(l => !l.ad_platform || (l.ad_platform !== 'google' && l.ad_platform !== 'microsoft')).length,
    };

    return {
      total, google, microsoft, other,
      googleRevenue, microsoftRevenue, otherRevenue, totalRevenue,
      newLeads: newLeads.length,
      formTotal: formLeads.length,
      formNew: formLeads.filter(l => l.status === 'new').length,
      formByPlatform,
    };
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

    const googleROI = googleSpend > 0 ? leadMetrics.googleRevenue / googleSpend : null;
    const microsoftROI = microsoftSpend > 0 ? leadMetrics.microsoftRevenue / microsoftSpend : null;
    const overallROI = totalSpend > 0 ? leadMetrics.totalRevenue / totalSpend : null;

    // Which platform has better ROI
    let winningROI = '';
    if (googleROI !== null && microsoftROI !== null) {
      winningROI = googleROI >= microsoftROI ? 'google' : 'microsoft';
    } else if (googleROI !== null) {
      winningROI = 'google';
    } else if (microsoftROI !== null) {
      winningROI = 'microsoft';
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
      googleROI,
      microsoftROI,
      overallROI,
      winningROI,
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

  const fetchGrossRevenue = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/total-revenue');
      if (res.ok) {
        const json = await res.json();
        setGrossRevenue(json);
      }
    } catch (err) {
      console.error('Error fetching gross revenue:', err);
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
      fetchGrossRevenue(),
    ]);
  }, [fetchData, fetchLeads, fetchGrossRevenue, invalidateCache]);

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

  // Initial load - fetch current filter if not cached + fetch leads + gross revenue
  useEffect(() => {
    const promises: Promise<any>[] = [fetchLeads(), fetchGrossRevenue()];
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
      <div className="mb-6">
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

      {/* ── HERO: Revenue & ROI first ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Revenue */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Gross Revenue</span>
            <DollarSign className="w-5 h-5 opacity-70" />
          </div>
          <p className="text-3xl font-bold">
            {grossRevenue ? formatCurrency(grossRevenue.grossRevenue) : '—'}
          </p>
          <p className="mt-1 text-xs opacity-75">
            {grossRevenue ? `${grossRevenue.invoiceCount} invoices (all time)` : 'Loading...'}
          </p>
          <div className="mt-2 pt-2 border-t border-white/20 text-xs opacity-80">
            <span>Attributed: {formatCurrency(leadMetrics.totalRevenue)}</span>
            {grossRevenue && grossRevenue.grossRevenue > 0 && (
              <span className="ml-1 opacity-70">
                ({grossRevenue.attributionRate}%)
              </span>
            )}
          </div>
        </div>

        {/* Overall ROI */}
        <div className={`rounded-xl shadow-sm p-6 ${
          derivedMetrics.overallROI === null
            ? 'bg-white'
            : derivedMetrics.overallROI >= 3
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400'
              : derivedMetrics.overallROI >= 1
                ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-400'
                : 'bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-400'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Overall ROI</span>
            <TrendingUp className={`w-5 h-5 ${derivedMetrics.overallROI !== null && derivedMetrics.overallROI >= 1 ? 'text-green-500' : 'text-gray-400'}`} />
          </div>
          {derivedMetrics.overallROI === null ? (
            <p className="text-3xl font-bold text-gray-400">—</p>
          ) : (
            <>
              <p className={`text-3xl font-bold ${derivedMetrics.overallROI >= 3 ? 'text-green-700' : derivedMetrics.overallROI >= 1 ? 'text-yellow-700' : 'text-red-700'}`}>
                {derivedMetrics.overallROI.toFixed(1)}x
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {derivedMetrics.winningROI === 'google' ? 'Google leads on ROI' : derivedMetrics.winningROI === 'microsoft' ? 'Microsoft leads on ROI' : ''}
              </p>
            </>
          )}
        </div>

        {/* Total Spend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Ad Spend</span>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.totalSpend)}</p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-blue-600">G: {formatCurrency(platforms.google.spend)}</span>
            <span className="text-gray-300">|</span>
            <span className="text-cyan-600">MS: {formatCurrency(platforms.microsoft.spend)}</span>
          </div>
        </div>

        {/* New Leads Needing Follow-up */}
        <Link href="/admin/dashboard/leads" className="block">
          <div className={`rounded-xl shadow-sm p-6 h-full transition-colors cursor-pointer ${leadMetrics.newLeads > 0 ? 'bg-amber-50 border-2 border-amber-400 hover:bg-amber-100' : 'bg-white hover:bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">New Leads</span>
              <AlertCircle className={`w-5 h-5 ${leadMetrics.newLeads > 0 ? 'text-amber-500' : 'text-gray-400'}`} />
            </div>
            <p className={`text-3xl font-bold ${leadMetrics.newLeads > 0 ? 'text-amber-700' : 'text-gray-900'}`}>
              {leadMetrics.newLeads}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {leadMetrics.newLeads > 0 ? 'Need follow-up → click to view' : `${leadMetrics.total.total} total leads`}
            </p>
          </div>
        </Link>
      </div>

      {/* ── PLATFORM HEAD-TO-HEAD ── */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Platform Comparison</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Google Ads Card */}
          <div className={`border-2 rounded-xl p-6 ${derivedMetrics.winningROI === 'google' ? 'border-green-400 bg-green-50/30' : 'border-blue-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">G</span>
                </div>
                <span className="font-semibold text-gray-900">Google Ads</span>
              </div>
              <div className="flex gap-2">
                {derivedMetrics.winningROI === 'google' && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Best ROI</span>
                )}
                {derivedMetrics.winningCpl === 'google' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Lower CPL</span>
                )}
              </div>
            </div>

            {/* Revenue + ROI row — most important */}
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(leadMetrics.googleRevenue)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">ROI</p>
                {derivedMetrics.googleROI === null ? (
                  <p className="text-2xl font-bold text-gray-400">—</p>
                ) : (
                  <p className={`text-2xl font-bold ${derivedMetrics.googleROI >= 3 ? 'text-green-600' : derivedMetrics.googleROI >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {derivedMetrics.googleROI.toFixed(1)}x
                  </p>
                )}
              </div>
            </div>

            {/* Supporting metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600">Spend</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(platforms.google.spend)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Leads</p>
                <p className="text-lg font-semibold text-gray-900">{leadMetrics.google.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CPL</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(derivedMetrics.googleCpl)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CTR</p>
                <p className="text-lg font-semibold text-gray-900">{formatPercent(platforms.google.ctr)}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-green-500" />{leadMetrics.google.calls}</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-blue-500" />{leadMetrics.google.texts}</span>
              <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-purple-500" />{leadMetrics.google.forms}</span>
            </div>
          </div>

          {/* Microsoft Ads Card */}
          <div className={`border-2 rounded-xl p-6 ${derivedMetrics.winningROI === 'microsoft' ? 'border-green-400 bg-green-50/30' : 'border-cyan-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <span className="text-cyan-600 font-bold">M</span>
                </div>
                <span className="font-semibold text-gray-900">Microsoft Ads</span>
              </div>
              <div className="flex gap-2">
                {derivedMetrics.winningROI === 'microsoft' && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Best ROI</span>
                )}
                {derivedMetrics.winningCpl === 'microsoft' && (
                  <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded-full">Lower CPL</span>
                )}
              </div>
            </div>

            {/* Revenue + ROI row — most important */}
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(leadMetrics.microsoftRevenue)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">ROI</p>
                {derivedMetrics.microsoftROI === null ? (
                  <p className="text-2xl font-bold text-gray-400">—</p>
                ) : (
                  <p className={`text-2xl font-bold ${derivedMetrics.microsoftROI >= 3 ? 'text-green-600' : derivedMetrics.microsoftROI >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {derivedMetrics.microsoftROI.toFixed(1)}x
                  </p>
                )}
              </div>
            </div>

            {/* Supporting metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600">Spend</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(platforms.microsoft.spend)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Leads</p>
                <p className="text-lg font-semibold text-gray-900">{leadMetrics.microsoft.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CPL</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(derivedMetrics.microsoftCpl)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CTR</p>
                <p className="text-lg font-semibold text-gray-900">{formatPercent(platforms.microsoft.ctr)}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-green-500" />{leadMetrics.microsoft.calls}</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-blue-500" />{leadMetrics.microsoft.texts}</span>
              <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-purple-500" />{leadMetrics.microsoft.forms}</span>
            </div>
          </div>
        </div>

        {/* Distribution bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Spend Distribution</span>
              <span className="text-gray-500">Google {formatPercent(comparison.spendShare.google)} | Microsoft {formatPercent(comparison.spendShare.microsoft)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="bg-blue-500 transition-all duration-500" style={{ width: `${comparison.spendShare.google}%` }} />
              <div className="bg-cyan-500 transition-all duration-500" style={{ width: `${comparison.spendShare.microsoft}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Lead Distribution</span>
              <span className="text-gray-500">Google {formatPercent(derivedMetrics.leadShare.google)} | Microsoft {formatPercent(derivedMetrics.leadShare.microsoft)} | Other {formatPercent(derivedMetrics.leadShare.other)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="bg-blue-500 transition-all duration-500" style={{ width: `${derivedMetrics.leadShare.google}%` }} />
              <div className="bg-cyan-500 transition-all duration-500" style={{ width: `${derivedMetrics.leadShare.microsoft}%` }} />
              <div className="bg-gray-400 transition-all duration-500" style={{ width: `${derivedMetrics.leadShare.other}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── OPERATIONS: Calls + Leads ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Call Analytics */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Call Analytics</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{calls.total}</p>
              <p className="text-sm text-gray-600">Total</p>
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
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <p className="text-sm text-gray-600 mb-2">By Source</p>
            <div className="flex justify-between"><span className="text-sm text-blue-600">Google Ads</span><span className="text-sm font-medium">{calls.byPlatform.google}</span></div>
            <div className="flex justify-between"><span className="text-sm text-cyan-600">Microsoft Ads</span><span className="text-sm font-medium">{calls.byPlatform.microsoft}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-600">Direct / Organic</span><span className="text-sm font-medium">{calls.byPlatform.direct}</span></div>
          </div>
        </div>

        {/* Lead Attribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Attribution</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{leadMetrics.total.total}</p>
              <p className="text-sm text-gray-600">Total Leads</p>
            </div>
            <div className={`text-center p-3 rounded-lg ${leadMetrics.newLeads > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
              <p className={`text-2xl font-bold ${leadMetrics.newLeads > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{leadMetrics.newLeads}</p>
              <p className="text-sm text-gray-600">New / Pending</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <p className="text-sm text-gray-600 mb-2">By Source</p>
            <div className="flex justify-between"><span className="text-sm text-blue-600">Google Ads</span><span className="text-sm font-medium">{leadMetrics.google.total}</span></div>
            <div className="flex justify-between"><span className="text-sm text-cyan-600">Microsoft Ads</span><span className="text-sm font-medium">{leadMetrics.microsoft.total}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-600">Direct / Organic</span><span className="text-sm font-medium">{leadMetrics.other.total}</span></div>
          </div>
        </div>
      </div>

      {/* ── INSIGHTS ── */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ROI Winner */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`w-5 h-5 ${derivedMetrics.winningROI ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-900">Best ROI</span>
            </div>
            <p className="text-sm text-gray-600">
              {derivedMetrics.winningROI === 'google' ? (
                <>Google Ads: {derivedMetrics.googleROI?.toFixed(1)}x vs Microsoft: {derivedMetrics.microsoftROI?.toFixed(1) ?? '—'}x</>
              ) : derivedMetrics.winningROI === 'microsoft' ? (
                <>Microsoft Ads: {derivedMetrics.microsoftROI?.toFixed(1)}x vs Google: {derivedMetrics.googleROI?.toFixed(1) ?? '—'}x</>
              ) : (
                <>No spend data to compare ROI</>
              )}
            </p>
          </div>

          {/* CPL Winner */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {derivedMetrics.winningCpl ? <ArrowDownRight className="w-5 h-5 text-green-500" /> : <Minus className="w-5 h-5 text-gray-400" />}
              <span className="font-medium text-gray-900">Best CPL</span>
            </div>
            <p className="text-sm text-gray-600">
              {derivedMetrics.winningCpl === 'google' ? (
                <>Google Ads: {formatCurrency(derivedMetrics.googleCpl)} — {formatCurrency(derivedMetrics.cplDifference)} cheaper</>
              ) : derivedMetrics.winningCpl === 'microsoft' ? (
                <>Microsoft Ads: {formatCurrency(derivedMetrics.microsoftCpl)} — {formatCurrency(derivedMetrics.cplDifference)} cheaper</>
              ) : (
                <>Both platforms have similar CPL</>
              )}
            </p>
          </div>

          {/* CTR + Volume */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-gray-900">Volume Leader</span>
            </div>
            <p className="text-sm text-gray-600">
              {derivedMetrics.winningVolume === 'google' ? (
                <>Google Ads: {formatPercent(derivedMetrics.leadShare.google)} of all leads</>
              ) : derivedMetrics.winningVolume === 'microsoft' ? (
                <>Microsoft Ads: {formatPercent(derivedMetrics.leadShare.microsoft)} of all leads</>
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
