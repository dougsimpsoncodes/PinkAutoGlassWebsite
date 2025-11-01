'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { ArrowUpDown, Download, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';

interface PagePerformance {
  page_path: string;
  views: number;
  unique_visitors: number;
  conversions: number;
  conversion_rate: number;
  entry_count: number;
  exit_count: number;
  exit_rate: number;
}

export default function PagePerformancePage() {
  const [data, setData] = useState<PagePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');
  const [sortBy, setSortBy] = useState<keyof PagePerformance>('views');
  const [sortDesc, setSortDesc] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/analytics?metric=page_performance&range=${dateRange}`);

      if (!res.ok) {
        return;
      }

      const result = await res.json();
      setData(result.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch page performance:', error);
      setLoading(false);
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;
    return sortDesc ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
  });

  const handleSort = (column: keyof PagePerformance) => {
    if (sortBy === column) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(column);
      setSortDesc(true);
    }
  };

  const exportCSV = () => {
    const headers = ['Page', 'Views', 'Unique Visitors', 'Conversions', 'Conv. Rate', 'Entry Count', 'Exit Count', 'Exit Rate'];
    const rows = sortedData.map(d => [
      d.page_path,
      d.views,
      d.unique_visitors,
      d.conversions,
      `${d.conversion_rate.toFixed(2)}%`,
      d.entry_count,
      d.exit_count,
      `${d.exit_rate.toFixed(2)}%`
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-performance-${dateRange}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading page performance...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalViews = data.reduce((sum, d) => sum + d.views, 0);
  const totalConversions = data.reduce((sum, d) => sum + d.conversions, 0);
  const avgExitRate = data.length > 0 ? data.reduce((sum, d) => sum + d.exit_rate, 0) / data.length : 0;

  const topEntryPages = [...data].sort((a, b) => b.entry_count - a.entry_count).slice(0, 5);
  const topConvertingPages = [...data].filter(d => d.conversions > 0).sort((a, b) => b.conversion_rate - a.conversion_rate).slice(0, 5);
  const highExitPages = [...data].filter(d => d.exit_rate > 50).sort((a, b) => b.exit_rate - a.exit_rate).slice(0, 5);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Page Performance</h1>
        <p className="text-gray-600 mt-1">Analyze how individual pages contribute to your goals</p>
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
          <div className="text-sm text-gray-600 mb-2">Total Page Views</div>
          <div className="text-3xl font-bold text-gray-900">{totalViews}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-2">Pages Tracked</div>
          <div className="text-3xl font-bold text-gray-900">{data.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-pink-500">
          <div className="text-sm text-gray-600 mb-2">Total Conversions</div>
          <div className="text-3xl font-bold text-gray-900">{totalConversions}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <div className="text-sm text-gray-600 mb-2">Avg. Exit Rate</div>
          <div className="text-3xl font-bold text-gray-900">{avgExitRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Page Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Pages</h2>
          <p className="text-sm text-gray-600 mt-1">Click column headers to sort</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort('page_path')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Page Path
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('views')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Views
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unique_visitors')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Unique
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
                <th
                  onClick={() => handleSort('entry_count')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Entries
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('exit_rate')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Exit Rate
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No page data available for this period
                  </td>
                </tr>
              ) : (
                sortedData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">{item.page_path}</div>
                        <a
                          href={item.page_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-pink-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{item.views}</div>
                      <div className="text-xs text-gray-500">
                        {totalViews > 0 ? ((item.views / totalViews) * 100).toFixed(1) : 0}% of total
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.unique_visitors}</div>
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
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-900">{item.entry_count}</div>
                        {item.entry_count > 0 && <TrendingUp className="w-4 h-4 text-green-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${
                        item.exit_rate >= 70 ? 'text-red-600' :
                        item.exit_rate >= 50 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {item.exit_rate.toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Entry Pages */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">🚪 Top Entry Pages</h3>
          {topEntryPages.length === 0 ? (
            <p className="text-sm text-gray-500">No entry page data</p>
          ) : (
            <div className="space-y-3">
              {topEntryPages.map((page, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="text-sm text-gray-700 truncate flex-1">{page.page_path}</div>
                  <div className="text-sm font-semibold text-gray-900 ml-2">{page.entry_count}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Best Converting Pages */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">⭐ Best Converting Pages</h3>
          {topConvertingPages.length === 0 ? (
            <p className="text-sm text-gray-500">No conversion data</p>
          ) : (
            <div className="space-y-3">
              {topConvertingPages.map((page, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="text-sm text-gray-700 truncate flex-1">{page.page_path}</div>
                  <div className="text-sm font-semibold text-green-600 ml-2">{page.conversion_rate.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High Exit Pages */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">⚠️ High Exit Rate Pages</h3>
          {highExitPages.length === 0 ? (
            <p className="text-sm text-gray-500">No high exit pages</p>
          ) : (
            <div className="space-y-3">
              {highExitPages.map((page, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="text-sm text-gray-700 truncate flex-1">{page.page_path}</div>
                  <div className="text-sm font-semibold text-red-600 ml-2">{page.exit_rate.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
