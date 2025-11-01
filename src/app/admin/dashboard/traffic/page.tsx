'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { ArrowUpDown, Download, Filter } from 'lucide-react';

interface TrafficSource {
  source: string;
  medium?: string;
  campaign?: string;
  visitors: number;
  page_views: number;
  conversions: number;
  conversion_rate: number;
  avg_session_duration?: number;
}

export default function TrafficSourcesPage() {
  const [data, setData] = useState<TrafficSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');
  const [sortBy, setSortBy] = useState<keyof TrafficSource>('visitors');
  const [sortDesc, setSortDesc] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/analytics?metric=traffic_detail&range=${dateRange}`);

      if (!res.ok) {
        return;
      }

      const result = await res.json();
      setData(result.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch traffic data:', error);
      setLoading(false);
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;
    return sortDesc ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
  });

  const handleSort = (column: keyof TrafficSource) => {
    if (sortBy === column) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(column);
      setSortDesc(true);
    }
  };

  const exportCSV = () => {
    const headers = ['Source', 'Medium', 'Campaign', 'Visitors', 'Page Views', 'Conversions', 'Conversion Rate'];
    const rows = sortedData.map(d => [
      d.source,
      d.medium || '',
      d.campaign || '',
      d.visitors,
      d.page_views,
      d.conversions,
      `${d.conversion_rate.toFixed(2)}%`
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic-sources-${dateRange}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading traffic data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalVisitors = data.reduce((sum, d) => sum + d.visitors, 0);
  const totalPageViews = data.reduce((sum, d) => sum + d.page_views, 0);
  const totalConversions = data.reduce((sum, d) => sum + d.conversions, 0);
  const avgConversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Traffic Sources</h1>
        <p className="text-gray-600 mt-1">Detailed analysis of where your visitors come from</p>
      </div>

      {/* Controls */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Date Range:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-2">Total Visitors</div>
          <div className="text-3xl font-bold text-gray-900">{totalVisitors}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-2">Total Page Views</div>
          <div className="text-3xl font-bold text-gray-900">{totalPageViews}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-pink-500">
          <div className="text-sm text-gray-600 mb-2">Total Conversions</div>
          <div className="text-3xl font-bold text-gray-900">{totalConversions}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <div className="text-sm text-gray-600 mb-2">Avg. Conversion Rate</div>
          <div className="text-3xl font-bold text-gray-900">{avgConversionRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Traffic Sources Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Source Performance</h2>
          <p className="text-sm text-gray-600 mt-1">Click column headers to sort</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort('source')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Source
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('visitors')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Visitors
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('page_views')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Page Views
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('conversions')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Conversions
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('conversion_rate')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Conv. Rate
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No traffic data available for this period
                  </td>
                </tr>
              ) : (
                sortedData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold ${
                          item.source === 'google' ? 'bg-blue-500' :
                          item.source === 'facebook' ? 'bg-blue-600' :
                          item.source === 'direct' ? 'bg-gray-500' : 'bg-pink-500'
                        }`}>
                          {item.source.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 capitalize">{item.source}</div>
                          {item.medium && (
                            <div className="text-xs text-gray-500">{item.medium}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{item.visitors}</div>
                      <div className="text-xs text-gray-500">
                        {totalVisitors > 0 ? ((item.visitors / totalVisitors) * 100).toFixed(1) : 0}% of total
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.page_views}</div>
                      <div className="text-xs text-gray-500">
                        {item.visitors > 0 ? (item.page_views / item.visitors).toFixed(1) : 0} per visitor
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">{item.conversions}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${
                        item.conversion_rate >= 10 ? 'text-green-600' :
                        item.conversion_rate >= 5 ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {item.conversion_rate.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-pink-600 to-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min((item.conversion_rate / 20) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Best Performing Source</h3>
          {data.length > 0 && (
            <p className="text-sm text-blue-800">
              <span className="font-bold capitalize">{sortedData[0]?.source}</span> has the highest conversion rate at{' '}
              <span className="font-bold">{sortedData[0]?.conversion_rate.toFixed(1)}%</span>
            </p>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">📈 Optimization Tip</h3>
          <p className="text-sm text-green-800">
            Focus on channels with high visitor counts but low conversion rates for quick wins
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
