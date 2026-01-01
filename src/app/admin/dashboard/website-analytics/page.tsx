'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import DateFilterBar, { DateFilter } from '@/components/admin/DateFilterBar';
import { useSync } from '@/contexts/SyncContext';

interface TrafficSource {
  source: string;
  visitors: number;
  page_views: number;
  conversions: number;
  conversion_rate: number;
}

interface PagePerformance {
  page_path: string;
  views: number;
  unique_visitors: number;
  conversions: number;
  conversion_rate: number;
}

interface OverviewData {
  total_visitors: number;
  total_page_views: number;
  total_conversions: number;
  conversion_rate: number;
}

interface LeadTypeBreakdown {
  phone_click: number;
  form_submit: number;
  text_click: number;
}

export default function WebsiteAnalyticsPage() {
  // Get global sync state
  const { syncVersion } = useSync();

  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [pagePerformance, setPagePerformance] = useState<PagePerformance[]>([]);
  const [leadTypes, setLeadTypes] = useState<LeadTypeBreakdown>({ phone_click: 0, form_submit: 0, text_click: 0 });

  // Subscribe to global sync events
  useEffect(() => {
    if (syncVersion > 0) {
      fetchAllData();
    }
  }, [syncVersion]);

  useEffect(() => {
    fetchAllData();
  }, [dateFilter]);

  // DateFilter values match API range values directly
  const getDateRange = () => dateFilter;

  const fetchAllData = async () => {
    setLoading(true);
    const range = getDateRange();

    try {
      const [overviewRes, trafficRes, pagesRes, conversionsRes] = await Promise.all([
        fetch(`/api/admin/analytics?metric=overview&range=${range}`),
        fetch(`/api/admin/analytics?metric=traffic_detail&range=${range}`),
        fetch(`/api/admin/analytics?metric=page_performance&range=${range}`),
        fetch(`/api/admin/analytics?metric=conversions&range=${range}`),
      ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setOverview(data.data);
      }

      if (trafficRes.ok) {
        const data = await trafficRes.json();
        setTrafficSources(data.data || []);
      }

      if (pagesRes.ok) {
        const data = await pagesRes.json();
        // Sort by views and take top 5
        const sorted = (data.data || [])
          .sort((a: PagePerformance, b: PagePerformance) => b.views - a.views)
          .slice(0, 5);
        setPagePerformance(sorted);
      }

      if (conversionsRes.ok) {
        const data = await conversionsRes.json();
        const byType = data.data?.by_type || {};
        setLeadTypes({
          phone_click: byType.phone_click || 0,
          form_submit: byType.form_submit || 0,
          text_click: byType.text_click || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use overview total for consistency - traffic sources should sum to this
  const totalVisitors = overview?.total_visitors || trafficSources.reduce((sum, s) => sum + s.visitors, 0);

  // Calculate total conversions from traffic sources for verification
  const totalConversionsFromSources = trafficSources.reduce((sum, s) => sum + s.conversions, 0);

  // Check for data consistency - if there's a significant mismatch, it indicates orphan data
  const conversionMismatch = overview?.total_conversions
    ? Math.abs(overview.total_conversions - totalConversionsFromSources)
    : 0;

  // Get source color
  const getSourceColor = (source: string) => {
    if (source.includes('google-ads') || source === 'google') return 'bg-blue-500';
    if (source.includes('google-organic') || source === 'google-organic') return 'bg-green-500';
    if (source === 'direct') return 'bg-purple-500';
    if (source.includes('microsoft') || source.includes('bing')) return 'bg-cyan-500';
    if (source.includes('facebook')) return 'bg-blue-600';
    return 'bg-gray-500';
  };

  const getSourceLabel = (source: string) => {
    if (source === 'google-ads') return 'Google Ads';
    if (source === 'google-organic') return 'Organic Search';
    if (source === 'microsoft-ads') return 'Microsoft Ads';
    if (source === 'direct') return 'Direct';
    if (source === 'bing') return 'Bing';
    return source.charAt(0).toUpperCase() + source.slice(1).replace(/-/g, ' ');
  };

  // Sort traffic sources by visitors
  const sortedTrafficSources = [...trafficSources].sort((a, b) => b.visitors - a.visitors).slice(0, 4);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Website Analytics</h1>
        <p className="text-gray-600 mt-1">Traffic sources, page performance, and conversion analysis</p>
      </div>

      {/* Date Filter Bar */}
      <DateFilterBar
        dateFilter={dateFilter}
        onFilterChange={setDateFilter}
        color="gray"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">Unique Visitors</div>
          <div className="text-3xl font-bold text-gray-900">{overview?.total_visitors?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">Page Views</div>
          <div className="text-3xl font-bold text-gray-900">{overview?.total_page_views?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">Pages/Visit</div>
          <div className="text-3xl font-bold text-gray-900">
            {overview?.total_visitors ? (overview.total_page_views / overview.total_visitors).toFixed(1) : '0'}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">Conversions</div>
          <div className="text-3xl font-bold text-gray-900">{overview?.total_conversions || 0}</div>
        </div>
        <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-xl shadow-sm p-6 text-white">
          <div className="text-sm font-medium text-pink-100 mb-2">Conv. Rate</div>
          <div className="text-3xl font-bold">{overview?.conversion_rate?.toFixed(1) || '0'}%</div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Traffic Sources */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
          <div className="space-y-3">
            {sortedTrafficSources.map((source, idx) => {
              const percentage = totalVisitors > 0 ? Math.round((source.visitors / totalVisitors) * 100) : 0;
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getSourceColor(source.source)}`}></div>
                      <span className="text-sm text-gray-700">{getSourceLabel(source.source)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{source.visitors.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 ml-1">{percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                    <div className={`${getSourceColor(source.source)} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
            {sortedTrafficSources.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No traffic data</p>
            )}
          </div>
        </div>

        {/* Lead Source Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Source Performance</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2">Source</th>
                <th className="pb-2 text-right">Leads</th>
                <th className="pb-2 text-right">Conv%</th>
              </tr>
            </thead>
            <tbody>
              {sortedTrafficSources.map((source, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-2 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getSourceColor(source.source)}`}></div>
                    {getSourceLabel(source.source)}
                  </td>
                  <td className="py-2 text-right font-semibold">{source.conversions}</td>
                  <td className={`py-2 text-right ${source.conversion_rate >= 5 ? 'text-green-600' : source.conversion_rate >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {source.conversion_rate.toFixed(1)}%
                  </td>
                </tr>
              ))}
              {sortedTrafficSources.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-500">No data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Page Conversion Rates */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Conversion Rates</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2">Page</th>
                <th className="pb-2 text-right">Views</th>
                <th className="pb-2 text-right">Conv%</th>
              </tr>
            </thead>
            <tbody>
              {pagePerformance.map((page, idx) => {
                // Shorten page paths for display
                let displayPath = page.page_path;
                if (displayPath.length > 25) {
                  displayPath = '...' + displayPath.slice(-22);
                }
                return (
                  <tr key={idx} className="border-b border-gray-50">
                    <td className="py-2 text-gray-700" title={page.page_path}>{displayPath}</td>
                    <td className="py-2 text-right">{page.views.toLocaleString()}</td>
                    <td className={`py-2 text-right font-semibold ${page.conversion_rate >= 5 ? 'text-green-600' : page.conversion_rate >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {page.conversion_rate.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
              {pagePerformance.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-500">No data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Type Breakdown - Horizontal Bars */}
      {(() => {
        const totalLeads = leadTypes.phone_click + leadTypes.form_submit + leadTypes.text_click;
        const maxCount = Math.max(leadTypes.phone_click, leadTypes.form_submit, leadTypes.text_click, 1);

        return (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Type Breakdown</h3>
            <div className="space-y-4">
              {/* Phone Calls */}
              <div className="flex items-center gap-4">
                <div className="w-28 text-sm text-gray-600 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Phone Calls
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative">
                  <div
                    className="bg-blue-500 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-300"
                    style={{ width: `${Math.max((leadTypes.phone_click / maxCount) * 100, leadTypes.phone_click > 0 ? 15 : 0)}%` }}
                  >
                    {leadTypes.phone_click > 0 && (
                      <span className="text-sm font-bold text-white">{leadTypes.phone_click}</span>
                    )}
                  </div>
                </div>
                <div className="w-14 text-right text-sm text-gray-500">
                  {totalLeads > 0 ? Math.round((leadTypes.phone_click / totalLeads) * 100) : 0}%
                </div>
              </div>

              {/* Form Submissions */}
              <div className="flex items-center gap-4">
                <div className="w-28 text-sm text-gray-600 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Forms
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative">
                  <div
                    className="bg-purple-500 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-300"
                    style={{ width: `${Math.max((leadTypes.form_submit / maxCount) * 100, leadTypes.form_submit > 0 ? 15 : 0)}%` }}
                  >
                    {leadTypes.form_submit > 0 && (
                      <span className="text-sm font-bold text-white">{leadTypes.form_submit}</span>
                    )}
                  </div>
                </div>
                <div className="w-14 text-right text-sm text-gray-500">
                  {totalLeads > 0 ? Math.round((leadTypes.form_submit / totalLeads) * 100) : 0}%
                </div>
              </div>

              {/* Text Messages */}
              <div className="flex items-center gap-4">
                <div className="w-28 text-sm text-gray-600 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Texts
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative">
                  <div
                    className="bg-green-500 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-300"
                    style={{ width: `${Math.max((leadTypes.text_click / maxCount) * 100, leadTypes.text_click > 0 ? 15 : 0)}%` }}
                  >
                    {leadTypes.text_click > 0 && (
                      <span className="text-sm font-bold text-white">{leadTypes.text_click}</span>
                    )}
                  </div>
                </div>
                <div className="w-14 text-right text-sm text-gray-500">
                  {totalLeads > 0 ? Math.round((leadTypes.text_click / totalLeads) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Leads</span>
              <span className="text-xl font-bold text-gray-900">{totalLeads}</span>
            </div>
          </div>
        );
      })()}

      {/* Priority Actions */}
      {overview && overview.total_visitors > 0 && (() => {
        // Pre-compute the low-converting source/page to avoid repeated .find() calls
        const lowConvertingSource = sortedTrafficSources.find(s => s.conversion_rate < 3 && s.visitors > 10);
        const lowConvertingPage = pagePerformance.find(p => p.conversion_rate < 2 && p.views > 20);

        return (
          <div className="bg-gradient-to-r from-pink-600 to-blue-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Priority Actions</h3>
            <div className="grid grid-cols-3 gap-4">
              {/* Find lowest converting high-traffic source */}
              {lowConvertingSource && (
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                  <div className="font-medium text-sm mb-2">Improve Low-Converting Source</div>
                  <p className="text-sm text-white/80">
                    {getSourceLabel(lowConvertingSource.source)} has {lowConvertingSource.visitors} visitors but only {lowConvertingSource.conversion_rate.toFixed(1)}% conversion
                  </p>
                </div>
              )}

              {/* Find lowest converting high-traffic page */}
              {lowConvertingPage && (
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                  <div className="font-medium text-sm mb-2">Optimize Low-Converting Page</div>
                  <p className="text-sm text-white/80">
                    {lowConvertingPage.page_path.slice(0, 30)} has high views but low conversion
                  </p>
                </div>
              )}

              {/* General insight */}
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                <div className="font-medium text-sm mb-2">Overall Performance</div>
                <p className="text-sm text-white/80">
                  {overview.conversion_rate >= 5
                    ? 'Great conversion rate! Focus on driving more traffic.'
                    : overview.conversion_rate >= 2
                      ? 'Good performance. Look for quick wins on landing pages.'
                      : 'Conversion rate needs work. Review call-to-actions and forms.'}
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </DashboardLayout>
  );
}
