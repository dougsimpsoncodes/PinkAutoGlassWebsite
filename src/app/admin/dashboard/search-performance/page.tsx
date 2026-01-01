'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import DateFilterBar, { DateFilter } from '@/components/admin/DateFilterBar';
import { useSync } from '@/contexts/SyncContext';

interface SearchTerm {
  search_term: string;
  source: 'PAID' | 'ORG';
  paid_impressions: number;
  paid_clicks: number;
  paid_cost: number;
  paid_ctr: number;
  paid_cpc: number;
  paid_conversions: number;
  paid_campaigns: string[];
  organic_impressions: number;
  organic_clicks: number;
  organic_ctr: number;
  organic_position: number;
  organic_pages: string[];
  calls: number;
  quotes: number;
  texts: number;
  total_leads: number;
  cost_per_lead: number;
  lead_conversion_rate: number;
  total_impressions: number;
  total_clicks: number;
  ctr: number;
}

interface SearchPerformanceData {
  dateRange: {
    from: string;
    to: string;
    days: number;
  };
  summary: {
    totalRows: number;
    totalUniqueTerms: number;
    paidRows: number;
    organicRows: number;
    termsInBoth: number;
    totalPaidImpressions: number;
    totalPaidClicks: number;
    totalPaidCost: number;
    totalPaidConversions: number;
    avgPaidCTR: number;
    avgPaidCPC: number;
    totalOrganicImpressions: number;
    totalOrganicClicks: number;
    avgOrganicCTR: number;
    totalImpressions: number;
    totalClicks: number;
    avgCombinedCTR: number;
    totalCalls: number;
    totalQuotes: number;
    totalTexts: number;
    totalLeads: number;
    paidCalls: number;
    paidQuotes: number;
    paidTexts: number;
    paidLeads: number;
    organicCalls: number;
    organicQuotes: number;
    organicTexts: number;
    organicLeads: number;
  };
  data: SearchTerm[];
}

export default function SearchPerformancePage() {
  // Get global sync state
  const { syncVersion } = useSync();

  // Cache data per time period - instant switching when cached
  const [dataCache, setDataCache] = useState<Record<DateFilter, SearchPerformanceData | null>>({
    today: null,
    yesterday: null,
    '7days': null,
    '30days': null,
    all: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'paid' | 'organic'>('all');
  const [syncStatus, setSyncStatus] = useState<{ message: string; success: boolean } | null>(null);

  // Get current data from cache
  const data = dataCache[dateFilter];

  // Check if we have ANY cached data (for showing content while loading new period)
  const hasAnyCachedData = Object.values(dataCache).some(d => d !== null);

  // Convert DateFilter to days number for API
  const getDateRangeDays = (filter: DateFilter): number => {
    switch (filter) {
      case 'today': return 0;
      case 'yesterday': return 1;
      case '7days': return 7;
      case '30days': return 30;
      case 'all': return 365; // Use 365 for "all time" in search performance
      default: return 30;
    }
  };

  // Get date display string
  const getDateRangeDisplay = (): string => {
    const today = new Date();
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    switch (dateFilter) {
      case 'today':
        return formatDate(today);
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return formatDate(yesterday);
      }
      case '7days': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return `${formatDate(weekAgo)} - ${formatDate(today)}`;
      }
      case '30days': {
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        return `${formatDate(monthAgo)} - ${formatDate(today)}`;
      }
      case 'all':
        return 'All Time';
      default:
        return '';
    }
  };

  const fetchData = useCallback(async (filter: DateFilter) => {
    try {
      const days = getDateRangeDays(filter);
      const response = await fetch(
        `/api/admin/dashboard/search-performance?days=${days}&source=${sourceFilter}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch search performance data');
      }

      const result = await response.json();
      setDataCache(prev => ({ ...prev, [filter]: result }));
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [sourceFilter]);

  // Subscribe to global sync events - refresh all cached data
  useEffect(() => {
    if (syncVersion > 0) {
      // Clear cache and refetch current filter
      setDataCache({ today: null, yesterday: null, '7days': null, '30days': null, all: null });
      fetchData(dateFilter);
    }
  }, [syncVersion]);

  // Handle date filter change - use cache or fetch
  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
    if (!dataCache[filter]) {
      setLoading(true);
      fetchData(filter).finally(() => setLoading(false));
    }
  };

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchData(dateFilter).finally(() => setLoading(false));
  }, []);

  // Only show full-page spinner on initial load (no cached data at all)
  if (loading && !hasAnyCachedData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading search performance...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !data) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
          Error: {error || 'No data available'}
        </div>
      </DashboardLayout>
    );
  }

  // If we're loading a new period and don't have data yet, show loading state
  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { summary } = data;

  // Get top performers (high organic, could add paid)
  const topPerformers = data.data
    .filter(t => t.source === 'ORG' && t.organic_impressions > 500)
    .sort((a, b) => b.organic_impressions - a.organic_impressions)
    .slice(0, 5);

  // Get opportunities (high organic, low/no paid)
  // Find organic terms that don't have a corresponding paid term
  const organicTermsSet = new Set(data.data.filter(t => t.source === 'ORG').map(t => t.search_term));
  const paidTermsSet = new Set(data.data.filter(t => t.source === 'PAID').map(t => t.search_term));

  const paidOpportunities = data.data
    .filter(
      t =>
        t.source === 'ORG' &&
        !paidTermsSet.has(t.search_term) &&
        t.organic_impressions > 200 &&
        t.organic_position < 10
    )
    .slice(0, 5);

  // Get high cost terms (needs optimization)
  const highCostTerms = data.data
    .filter(t => t.paid_cpc > 15 && t.paid_clicks > 5)
    .sort((a, b) => b.paid_cost - a.paid_cost)
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Search Performance</h1>
          <p className="text-gray-600 mt-1">
            Combined paid ads + organic search analysis
          </p>
        </div>

        {/* Date Filter Bar */}
        <DateFilterBar
          dateFilter={dateFilter}
          onFilterChange={handleDateFilterChange}
          dateDisplay={getDateRangeDisplay()}
          color="cyan"
        />

        {/* Sync Status Message */}
        {syncStatus && (
          <div
            className={`p-3 rounded text-sm ${
              syncStatus.success
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {syncStatus.success ? '✅' : '❌'} {syncStatus.message}
          </div>
        )}

        {/* Overview Metrics - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Google Ads (Paid) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h3 className="text-lg font-semibold text-gray-900">Google Ads (Paid)</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Impressions</div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.totalPaidImpressions.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Clicks</div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.totalPaidClicks.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Cost</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${summary.totalPaidCost.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Leads</div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.paidLeads}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Lead Breakdown</div>
                <div className="text-sm text-gray-600 flex gap-2">
                  <span>📞{summary.paidCalls}</span>
                  <span>📧{summary.paidQuotes}</span>
                  <span>💬{summary.paidTexts}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Cost/Lead</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${summary.paidLeads > 0 ? (summary.totalPaidCost / summary.paidLeads).toFixed(2) : '0.00'}
                </div>
              </div>
            </div>
          </div>

          {/* Organic Search */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <h3 className="text-lg font-semibold text-gray-900">Organic Search (Free)</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Impressions</div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.totalOrganicImpressions.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Clicks</div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.totalOrganicClicks.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">CTR</div>
                <div className="text-2xl font-bold text-gray-900">{summary.avgOrganicCTR}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Leads</div>
                <div className="text-2xl font-bold text-green-600">
                  {summary.organicLeads}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Lead Breakdown</div>
                <div className="text-sm text-gray-600 flex gap-2">
                  <span>📞{summary.organicCalls}</span>
                  <span>📧{summary.organicQuotes}</span>
                  <span>💬{summary.organicTexts}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Lead Value</div>
                <div className="text-2xl font-bold text-green-600">
                  ${summary.organicLeads > 0 && summary.paidLeads > 0 ?
                    ((summary.totalPaidCost / summary.paidLeads) * summary.organicLeads).toFixed(0) :
                    '0'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Search Terms Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Search Terms Performance</h3>
            <p className="text-sm text-gray-600 mt-1">
              All search terms sorted by total impressions
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-2 font-semibold text-gray-700">Search Term</th>
                  <th className="text-center p-2 font-semibold text-gray-700">Source</th>
                  <th className="text-right p-2 font-semibold text-gray-700">Impressions</th>
                  <th className="text-right p-2 font-semibold text-gray-700">Clicks</th>
                  <th className="text-right p-2 font-semibold text-gray-700">Total Leads</th>
                  <th className="text-right p-2 font-semibold text-gray-700">Lead Breakdown</th>
                  <th className="text-right p-2 font-semibold text-gray-700">Cost</th>
                  <th className="text-right p-2 font-semibold text-gray-700">Cost/Lead</th>
                  <th className="text-right p-2 font-semibold text-gray-700">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data.slice(0, 50).map((term, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2">
                        <div className="font-medium text-gray-900 max-w-xs truncate">
                          {term.search_term}
                        </div>
                        {term.paid_campaigns.length > 0 && (
                          <div className="text-xs text-gray-500 mt-0.5 truncate">
                            {term.paid_campaigns[0]}
                          </div>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            term.source === 'PAID'
                              ? 'bg-blue-100 text-blue-800'
                              : term.source === 'ORG'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {term.source}
                        </span>
                      </td>
                      <td className="p-2 text-right text-gray-900">
                        {term.total_impressions.toLocaleString()}
                      </td>
                      <td className="p-2 text-right text-gray-900">
                        {term.total_clicks.toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        <span className="font-semibold text-gray-900">
                          {term.total_leads > 0 ? term.total_leads : '-'}
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex gap-1 justify-end">
                          {term.calls > 0 && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                              📞 {term.calls}
                            </span>
                          )}
                          {term.quotes > 0 && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">
                              📧 {term.quotes}
                            </span>
                          )}
                          {term.texts > 0 && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800">
                              💬 {term.texts}
                            </span>
                          )}
                          {term.total_leads === 0 && <span className="text-gray-400">-</span>}
                        </div>
                      </td>
                      <td className="p-2 text-right text-gray-900">
                        {term.paid_cost > 0 ? `$${term.paid_cost.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-2 text-right">
                        {term.cost_per_lead > 0 ? (
                          <span className={`font-semibold ${
                            term.cost_per_lead > 50 ? 'text-red-600' :
                            term.cost_per_lead > 30 ? 'text-orange-500' :
                            term.cost_per_lead > 0 ? 'text-green-600' :
                            ''
                          }`}>
                            ${term.cost_per_lead.toFixed(2)}
                          </span>
                        ) : term.source === 'ORG' && term.total_leads > 0 ? (
                          <span className="font-semibold text-green-600">Free</span>
                        ) : '-'}
                      </td>
                      <td className="p-2 text-right text-gray-900">
                        {term.organic_position > 0 ? (
                          <span className={`font-semibold ${
                            term.organic_position <= 3 ? 'text-green-600' :
                            term.organic_position <= 10 ? 'text-blue-600' :
                            'text-gray-600'
                          }`}>
                            #{term.organic_position.toFixed(1)}
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Performers */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Top Organic Performers
            </h4>
            <div className="space-y-1.5">
              {topPerformers.map((term, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 truncate flex-1">
                      {term.search_term}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {term.organic_impressions.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    Position {term.organic_position.toFixed(1)} • {term.organic_clicks} clicks
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paid Opportunities */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Add Paid Campaigns
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              High organic volume, top 10 position - add paid to dominate
            </p>
            <div className="space-y-1.5">
              {paidOpportunities.map((term, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 truncate flex-1">
                      {term.search_term}
                    </span>
                    <span className="text-green-600 ml-2">
                      {term.organic_impressions.toLocaleString()} imp
                    </span>
                  </div>
                  <div className="text-gray-500">
                    Position {term.organic_position.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High Cost Terms */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              High Cost Terms
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Expensive terms - consider pausing or optimizing
            </p>
            <div className="space-y-1.5">
              {highCostTerms.map((term, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 truncate flex-1">
                      {term.search_term}
                    </span>
                    <span className="text-red-600 ml-2">${term.paid_cost.toFixed(2)}</span>
                  </div>
                  <div className="text-gray-500">
                    ${term.paid_cpc.toFixed(2)} CPC • {term.paid_clicks} clicks
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
