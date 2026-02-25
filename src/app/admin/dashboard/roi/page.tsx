'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import SyncButton from '@/components/admin/SyncButton';
import { DollarSign, TrendingUp, TrendingDown, Users, Target } from 'lucide-react';
import { getDateRange as getMtDateRange, getMountainTime, type DateFilter } from '@/lib/dateUtils';

interface PlatformROI {
  uniqueCustomers: number;
  cost: number;
  revenue: number;
  costPerCustomer: number;
  revenuePerCustomer: number;
  roi: number;
  profit: number;
  profitMargin: number;
}

interface ROIData {
  dateRange: {
    start: string;
    end: string;
  };
  platforms: {
    google_ads: PlatformROI;
    microsoft_ads: PlatformROI;
    organic: PlatformROI;
    direct: PlatformROI;
  };
  totals: {
    uniqueCustomers: number;
    totalCost: number;
    totalRevenue: number;
    avgCostPerCustomer: number;
    avgRevenuePerCustomer: number;
    overallROI: number;
    totalProfit: number;
    profitMargin: number;
  };
}

export default function ROIDashboard() {
  const [data, setData] = useState<ROIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    fetchROIData();
  }, [dateRange]);

  const getDateRange = () => {
    // Handle 90days specially since dateUtils doesn't have it
    if (dateRange === '90days') {
      const mtNow = getMountainTime();
      const today = new Date(mtNow.getFullYear(), mtNow.getMonth(), mtNow.getDate());
      const start = new Date(today);
      start.setDate(start.getDate() - 90);
      return {
        start: start.toISOString().split('T')[0],
        end: mtNow.toISOString().split('T')[0],
      };
    }
    // Use canonical Mountain Time date range for all standard filters
    const range = getMtDateRange(dateRange as DateFilter);
    return {
      start: range.start.toISOString().split('T')[0],
      end: range.end.toISOString().split('T')[0],
    };
  };

  const fetchROIData = async () => {
    try {
      setLoading(true);
      const range = getDateRange();
      const response = await fetch(`/api/admin/roi?startDate=${range.start}&endDate=${range.end}`);

      if (!response.ok) {
        throw new Error('Failed to fetch ROI data');
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching ROI data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading ROI data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">No data available</p>
        </div>
      </DashboardLayout>
    );
  }

  const platforms = [
    { key: 'google_ads', name: 'Google Ads', color: 'blue', icon: '🔵' },
    { key: 'microsoft_ads', name: 'Microsoft Ads', color: 'green', icon: '🟢' },
    { key: 'organic', name: 'Organic Search', color: 'purple', icon: '🟣' },
    { key: 'direct', name: 'Direct/Unknown', color: 'gray', icon: '⚪' },
  ];

  const paidPlatforms = platforms.filter(p => ['google_ads', 'microsoft_ads'].includes(p.key));

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ROI Dashboard</h1>
          <p className="text-gray-600 mt-1">Cost per unique customer and revenue analysis</p>
        </div>
        <SyncButton scope="roi" onSyncComplete={fetchROIData} />
      </div>

      {/* Date Range Selector */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 mb-6">
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
          <div className="ml-auto text-sm text-gray-600">
            {data.dateRange.start} to {data.dateRange.end}
          </div>
        </div>
      </div>

      {/* Overall ROI Metrics */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg shadow-lg p-8 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-6">Overall Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6" />
              <div className="text-sm font-medium opacity-90">Total Revenue</div>
            </div>
            <div className="text-4xl font-bold">${data.totals.totalRevenue.toLocaleString()}</div>
          </div>

          {/* Total Cost */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6" />
              <div className="text-sm font-medium opacity-90">Total Ad Spend</div>
            </div>
            <div className="text-4xl font-bold">${data.totals.totalCost.toLocaleString()}</div>
          </div>

          {/* Total Profit */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6" />
              <div className="text-sm font-medium opacity-90">Total Profit</div>
            </div>
            <div className="text-4xl font-bold">${data.totals.totalProfit.toLocaleString()}</div>
            <div className="text-sm opacity-75 mt-1">Margin: {data.totals.profitMargin}%</div>
          </div>

          {/* ROI */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6" />
              <div className="text-sm font-medium opacity-90">Overall ROI</div>
            </div>
            <div className="text-4xl font-bold">{data.totals.overallROI.toFixed(2)}x</div>
            <div className="text-sm opacity-75 mt-1">
              ${data.totals.overallROI.toFixed(2)} revenue per $1 spent
            </div>
          </div>
        </div>

        {/* Per Customer Metrics */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 text-sm opacity-90 mb-1">
                <Users className="w-4 h-4" />
                Unique Customers
              </div>
              <div className="text-3xl font-bold">{data.totals.uniqueCustomers}</div>
            </div>
            <div>
              <div className="text-sm opacity-90 mb-1">Avg Cost per Customer</div>
              <div className="text-3xl font-bold">${data.totals.avgCostPerCustomer.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm opacity-90 mb-1">Avg Revenue per Customer</div>
              <div className="text-3xl font-bold">${data.totals.avgRevenuePerCustomer.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Comparison */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform ROI Comparison</h2>

      {/* Paid Platforms Comparison Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Customers</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ad Spend</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost/Customer</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue/Customer</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ROI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paidPlatforms.map(platform => {
              const metrics = data.platforms[platform.key as keyof typeof data.platforms];

              if (metrics.uniqueCustomers === 0 && metrics.cost === 0) {
                return null;
              }

              return (
                <tr key={platform.key} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <span className="font-medium text-gray-900">{platform.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {metrics.uniqueCustomers}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900">
                    ${metrics.cost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900">
                    ${metrics.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={metrics.profit >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      ${metrics.profit.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900">
                    ${metrics.costPerCustomer.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900">
                    ${metrics.revenuePerCustomer.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`font-bold ${metrics.roi >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {metrics.roi.toFixed(2)}x
                      </span>
                      {metrics.roi >= 1 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Individual Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map(platform => {
          const metrics = data.platforms[platform.key as keyof typeof data.platforms];

          // Skip if no data
          if (metrics.uniqueCustomers === 0 && metrics.revenue === 0) {
            return null;
          }

          const isPaid = ['google_ads', 'microsoft_ads'].includes(platform.key);

          return (
            <div key={platform.key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Platform Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{platform.icon}</span>
                  <h3 className="text-xl font-bold text-gray-900">{platform.name}</h3>
                </div>
                {isPaid && metrics.roi >= 1 && (
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Profitable
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Unique Customers</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.uniqueCustomers}</div>
                </div>

                {isPaid && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">Ad Spend</div>
                    <div className="text-2xl font-bold text-gray-900">${metrics.cost.toLocaleString()}</div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Revenue</div>
                  <div className="text-2xl font-bold text-green-600">${metrics.revenue.toLocaleString()}</div>
                </div>

                {isPaid && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">ROI</div>
                    <div className={`text-2xl font-bold ${metrics.roi >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.roi.toFixed(2)}x
                    </div>
                  </div>
                )}
              </div>

              {/* Per Customer Metrics */}
              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm font-medium text-gray-700 mb-3">Per Customer</div>
                <div className="space-y-2">
                  {isPaid && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cost:</span>
                      <span className="text-sm font-medium text-gray-900">${metrics.costPerCustomer.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="text-sm font-medium text-gray-900">${metrics.revenuePerCustomer.toFixed(2)}</span>
                  </div>
                  {isPaid && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Profit:</span>
                      <span className={`text-sm font-medium ${metrics.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${(metrics.revenuePerCustomer - metrics.costPerCustomer).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profit Margin Bar */}
              {isPaid && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Profit Margin</span>
                    <span className="font-medium text-gray-900">{metrics.profitMargin}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${metrics.profitMargin >= 50 ? 'bg-green-500' : 'bg-yellow-500'}`}
                      style={{ width: `${Math.min(metrics.profitMargin, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Key Insights */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">💡 ROI Insights</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>ROI Calculation:</strong> ROI = Total Revenue / Total Ad Spend (e.g., 5.0x means $5 revenue per $1 spent)</li>
          <li>• <strong>Cost per Customer:</strong> Based on unique customers (deduplicated by phone number), not total clicks or calls</li>
          <li>• <strong>Organic &amp; Direct:</strong> No ad spend, so ROI is infinite - revenue is pure profit</li>
          <li>• <strong>Profitability:</strong> Any platform with ROI &gt; 1.0x is generating more revenue than cost</li>
          <li>• <strong>Optimization:</strong> Compare cost per customer across platforms to identify where to allocate more budget</li>
        </ul>
      </div>
    </DashboardLayout>
  );
}
