'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SearchTerm {
  search_term: string;
  source: 'PAID' | 'ORG' | 'BOTH';
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
  total_impressions: number;
  total_clicks: number;
  combined_ctr: number;
}

interface SearchPerformanceData {
  dateRange: {
    from: string;
    to: string;
    days: number;
  };
  summary: {
    totalSearchTerms: number;
    paidOnly: number;
    organicOnly: number;
    both: number;
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
  };
  data: SearchTerm[];
}

export default function SearchPerformancePage() {
  const [data, setData] = useState<SearchPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(30);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'paid' | 'organic'>('all');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ message: string; success: boolean } | null>(null);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/dashboard/search-performance?days=${dateRange}&source=${sourceFilter}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch search performance data');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function syncData() {
    try {
      setSyncing(true);
      setSyncStatus(null);

      // Trigger both Google Ads and GSC sync
      const responses = await Promise.all([
        fetch(`/api/admin/sync/google-ads-search-terms?days=${dateRange}`, { method: 'POST' }),
        fetch(`/api/admin/sync/google-search-console?days=${dateRange}`, { method: 'POST' }),
      ]);

      const results = await Promise.all(responses.map(r => r.json()));

      const allSuccess = results.every(r => r.ok);

      if (allSuccess) {
        const totalRecords = results.reduce((sum, r) => sum + (r.summary?.recordsFetched || 0), 0);
        setSyncStatus({
          message: `Successfully synced ${totalRecords} records from Google Ads & Search Console`,
          success: true,
        });
        // Auto-refresh data after successful sync
        await fetchData();
      } else {
        const errors = results.filter(r => !r.ok).map(r => r.error).join(', ');
        setSyncStatus({
          message: `Sync failed: ${errors}`,
          success: false,
        });
      }
    } catch (err: any) {
      setSyncStatus({
        message: `Sync error: ${err.message}`,
        success: false,
      });
    } finally {
      setSyncing(false);
      // Clear status after 5 seconds
      setTimeout(() => setSyncStatus(null), 5000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-[1600px] mx-auto">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-[1600px] mx-auto">
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
            Error: {error || 'No data available'}
          </div>
        </div>
      </div>
    );
  }

  const { summary } = data;

  // Get top performers (high organic, could add paid)
  const topPerformers = data.data
    .filter(t => t.source === 'ORG' && t.organic_impressions > 500)
    .sort((a, b) => b.organic_impressions - a.organic_impressions)
    .slice(0, 5);

  // Get opportunities (high organic, low/no paid)
  const paidOpportunities = data.data
    .filter(
      t =>
        (t.source === 'ORG' || (t.source === 'BOTH' && t.paid_impressions < t.organic_impressions / 2)) &&
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
    <div className="min-h-screen bg-gray-50 p-3 pt-24">
      <div className="max-w-[1600px] mx-auto space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Search Performance</h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Combined paid ads + organic search analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={e => setDateRange(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded px-3 py-1.5 bg-white"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              onClick={syncData}
              disabled={syncing}
              className={`text-sm px-3 py-1.5 rounded font-medium ${
                syncing
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {syncing ? 'Syncing...' : 'Sync Data'}
            </button>
            <button
              onClick={fetchData}
              disabled={syncing}
              className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Refresh
            </button>
          </div>
        </div>

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
        <div className="grid grid-cols-2 gap-3">
          {/* Google Ads (Paid) */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <h3 className="text-sm font-semibold text-gray-900">Google Ads (Paid)</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-gray-600">Impressions</div>
                <div className="text-lg font-bold text-gray-900">
                  {summary.totalPaidImpressions.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Clicks</div>
                <div className="text-lg font-bold text-gray-900">
                  {summary.totalPaidClicks.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">CTR</div>
                <div className="text-lg font-bold text-gray-900">{summary.avgPaidCTR}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Cost</div>
                <div className="text-lg font-bold text-gray-900">
                  ${summary.totalPaidCost.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Avg CPC</div>
                <div className="text-lg font-bold text-gray-900">${summary.avgPaidCPC.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Conversions</div>
                <div className="text-lg font-bold text-gray-900">
                  {summary.totalPaidConversions.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Organic Search */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <h3 className="text-sm font-semibold text-gray-900">Organic Search (Free)</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-gray-600">Impressions</div>
                <div className="text-lg font-bold text-gray-900">
                  {summary.totalOrganicImpressions.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Clicks</div>
                <div className="text-lg font-bold text-gray-900">
                  {summary.totalOrganicClicks.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">CTR</div>
                <div className="text-lg font-bold text-gray-900">{summary.avgOrganicCTR}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Paid Only</div>
                <div className="text-lg font-bold text-gray-900">{summary.paidOnly}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Organic Only</div>
                <div className="text-lg font-bold text-gray-900">{summary.organicOnly}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Both</div>
                <div className="text-lg font-bold text-gray-900">{summary.both}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Search Terms Table */}
        <div className="bg-white rounded border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Search Terms Performance</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              All search terms sorted by total impressions
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-2 font-semibold text-gray-700">Search Term</th>
                  <th className="text-center p-2 font-semibold text-gray-700">Source</th>
                  <th className="text-right p-2 font-semibold text-gray-700">Paid Imp.</th>
                  <th className="text-right p-2 font-semibold text-gray-700">Org Imp.</th>
                  <th className="text-right p-2 font-semibold text-gray-700">Paid Clicks</th>
                  <th className="text-right p-2 font-semibold text-gray-700">Org Clicks</th>
                  <th className="text-right p-2 font-semibold text-gray-700">Paid CTR</th>
                  <th className="text-right p-2 font-semibold text-gray-700">Org CTR</th>
                  <th className="text-right p-2 font-semibold text-gray-700">Cost</th>
                  <th className="text-right p-2 font-semibold text-gray-700">Avg CPC</th>
                  <th className="text-right p-2 font-semibold text-gray-700">Position</th>
                  <th className="text-left p-2 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data.slice(0, 50).map((term, idx) => {
                  let statusBadge = '';
                  let statusColor = '';

                  if (term.source === 'BOTH') {
                    statusBadge = 'BOTH';
                    statusColor = 'bg-purple-100 text-purple-800';
                  } else if (term.paid_cpc > 15 && term.paid_clicks > 5) {
                    statusBadge = 'HIGH COST';
                    statusColor = 'bg-red-100 text-red-800';
                  } else if (term.search_term.includes('pink')) {
                    statusBadge = '✅ BRAND';
                    statusColor = 'bg-green-100 text-green-800';
                  } else if (term.source === 'ORG' && term.organic_position < 10) {
                    statusBadge = '⚡ ADD PAID';
                    statusColor = 'bg-yellow-100 text-yellow-800';
                  } else if (term.source === 'PAID') {
                    statusBadge = 'PAID ONLY';
                    statusColor = 'bg-blue-100 text-blue-800';
                  } else {
                    statusBadge = 'ORG ONLY';
                    statusColor = 'bg-gray-100 text-gray-800';
                  }

                  return (
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
                        {term.paid_impressions > 0 ? term.paid_impressions.toLocaleString() : '-'}
                      </td>
                      <td className="p-2 text-right text-gray-900">
                        {term.organic_impressions > 0
                          ? term.organic_impressions.toLocaleString()
                          : '-'}
                      </td>
                      <td className="p-2 text-right text-gray-900">
                        {term.paid_clicks > 0 ? term.paid_clicks.toLocaleString() : '-'}
                      </td>
                      <td className="p-2 text-right text-gray-900">
                        {term.organic_clicks > 0 ? term.organic_clicks.toLocaleString() : '-'}
                      </td>
                      <td className="p-2 text-right text-gray-900">
                        {term.paid_ctr > 0 ? `${term.paid_ctr}%` : '-'}
                      </td>
                      <td className="p-2 text-right text-gray-900">
                        {term.organic_ctr > 0 ? `${term.organic_ctr}%` : '-'}
                      </td>
                      <td className="p-2 text-right text-gray-900">
                        {term.paid_cost > 0 ? `$${term.paid_cost.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-2 text-right text-gray-900">
                        {term.paid_cpc > 0 ? `$${term.paid_cpc.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-2 text-right text-gray-900">
                        {term.organic_position > 0 ? term.organic_position.toFixed(1) : '-'}
                      </td>
                      <td className="p-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>
                          {statusBadge}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-3 gap-3">
          {/* Top Performers */}
          <div className="bg-white rounded border border-gray-200 p-3">
            <h4 className="text-xs font-semibold text-gray-900 mb-2">
              🏆 Top Organic Performers
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
          <div className="bg-white rounded border border-gray-200 p-3">
            <h4 className="text-xs font-semibold text-gray-900 mb-2">
              ⚡ Add Paid Campaigns
            </h4>
            <p className="text-xs text-gray-600 mb-2">
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
          <div className="bg-white rounded border border-gray-200 p-3">
            <h4 className="text-xs font-semibold text-gray-900 mb-2">
              💰 High Cost Terms
            </h4>
            <p className="text-xs text-gray-600 mb-2">
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
    </div>
  );
}
