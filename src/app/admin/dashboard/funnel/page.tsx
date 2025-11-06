'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import SyncButton from '@/components/admin/SyncButton';
import { TrendingUp, Users, MousePointerClick, Eye, DollarSign, Phone, FileText } from 'lucide-react';

interface PlatformMetrics {
  impressions: number;
  clicks: number;
  uniqueCustomers: number;
  breakdown: {
    byCall: number;
    byForm: number;
  };
  cost: number;
  ctr: number;
  conversionRate: number;
  costPerCustomer: number;
}

interface FunnelData {
  dateRange: {
    start: string;
    end: string;
  };
  platforms: {
    google_ads: PlatformMetrics;
    bing_ads: PlatformMetrics;
    organic: PlatformMetrics;
    direct: PlatformMetrics;
  };
  totals: {
    impressions: number;
    clicks: number;
    uniqueCustomers: number;
    breakdown: {
      byCall: number;
      byForm: number;
    };
    totalCost: number;
    avgCostPerCustomer: number;
    overallCTR: number;
    overallConversionRate: number;
  };
}

export default function MarketingFunnelDashboard() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    fetchFunnelData();
  }, [dateRange]);

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();

    switch (dateRange) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case '7days':
        start.setDate(start.getDate() - 7);
        break;
      case '30days':
        start.setDate(start.getDate() - 30);
        break;
      case '90days':
        start.setDate(start.getDate() - 90);
        break;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const fetchFunnelData = async () => {
    try {
      setLoading(true);
      const range = getDateRange();
      const response = await fetch(`/api/admin/funnel?startDate=${range.start}&endDate=${range.end}`);

      if (!response.ok) {
        throw new Error('Failed to fetch funnel data');
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching funnel data:', error);
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
            <p className="mt-4 text-gray-600">Loading funnel data...</p>
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
    { key: 'bing_ads', name: 'Bing Ads', color: 'green', icon: '🟢' },
    { key: 'organic', name: 'Organic Search', color: 'purple', icon: '🟣' },
    { key: 'direct', name: 'Direct/Unknown', color: 'gray', icon: '⚪' },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Funnel Analysis</h1>
          <p className="text-gray-600 mt-1">Three-Metric System: Impressions → Clicks → Unique Customers</p>
        </div>
        <SyncButton scope="funnel" onSyncComplete={fetchFunnelData} />
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

      {/* Overall Funnel Metrics */}
      <div className="bg-gradient-to-br from-pink-600 to-blue-600 rounded-lg shadow-lg p-8 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-6">Overall Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Impressions */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-6 h-6" />
              <div className="text-sm font-medium opacity-90">Total Impressions</div>
            </div>
            <div className="text-4xl font-bold">{data.totals.impressions.toLocaleString()}</div>
          </div>

          {/* Clicks */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <MousePointerClick className="w-6 h-6" />
              <div className="text-sm font-medium opacity-90">Total Clicks</div>
            </div>
            <div className="text-4xl font-bold">{data.totals.clicks.toLocaleString()}</div>
            <div className="text-sm opacity-75 mt-1">CTR: {data.totals.overallCTR}%</div>
          </div>

          {/* Unique Customers */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6" />
              <div className="text-sm font-medium opacity-90">Unique Customers</div>
            </div>
            <div className="text-4xl font-bold">{data.totals.uniqueCustomers}</div>
            <div className="text-sm opacity-75 mt-1">Conv Rate: {data.totals.overallConversionRate}%</div>
          </div>
        </div>

        {/* Customer Breakdown */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="text-sm font-medium opacity-90 mb-3">First Contact Method Breakdown</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              <div>
                <div className="text-2xl font-bold">{data.totals.breakdown.byCall}</div>
                <div className="text-sm opacity-75">First Contact: Call</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              <div>
                <div className="text-2xl font-bold">{data.totals.breakdown.byForm}</div>
                <div className="text-sm opacity-75">First Contact: Form</div>
              </div>
            </div>
          </div>
          <div className="text-xs opacity-75 mt-3">
            * No overlap - each customer counted once based on first contact
          </div>
        </div>

        {/* Cost Metrics */}
        {data.totals.totalCost > 0 && (
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm opacity-90 mb-1">Total Ad Spend</div>
                <div className="text-3xl font-bold">${data.totals.totalCost.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-1">Cost per Customer</div>
                <div className="text-3xl font-bold">${data.totals.avgCostPerCustomer.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Platform Breakdown */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Performance</h2>
      <div className="grid grid-cols-1 gap-6">
        {platforms.map((platform) => {
          const metrics = data.platforms[platform.key as keyof typeof data.platforms];

          // Skip if no data
          if (metrics.impressions === 0 && metrics.clicks === 0 && metrics.uniqueCustomers === 0) {
            return null;
          }

          return (
            <div key={platform.key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Platform Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{platform.icon}</span>
                  <h3 className="text-xl font-bold text-gray-900">{platform.name}</h3>
                </div>
                {metrics.cost > 0 && (
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Total Spend</div>
                    <div className="text-2xl font-bold text-gray-900">${metrics.cost.toLocaleString()}</div>
                  </div>
                )}
              </div>

              {/* Funnel Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Impressions</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.impressions.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Clicks</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.clicks.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">CTR: {metrics.ctr}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Unique Customers</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.uniqueCustomers}</div>
                  <div className="text-xs text-gray-500 mt-1">Conv: {metrics.conversionRate}%</div>
                </div>
                {metrics.cost > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Cost/Customer</div>
                    <div className="text-2xl font-bold text-gray-900">${metrics.costPerCustomer.toFixed(2)}</div>
                  </div>
                )}
              </div>

              {/* Customer Breakdown */}
              {metrics.uniqueCustomers > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-3">First Contact Method</div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Call:</span>
                      <span className="font-bold text-gray-900">{metrics.breakdown.byCall}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Form:</span>
                      <span className="font-bold text-gray-900">{metrics.breakdown.byForm}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Visual Funnel */}
              <div className="mt-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative h-12 bg-gray-200 rounded-lg overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full bg-${platform.color}-500`}
                        style={{ width: '100%' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
                        {metrics.impressions.toLocaleString()} impressions
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl">→</div>
                  <div className="flex-1">
                    <div className="relative h-12 bg-gray-200 rounded-lg overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full bg-${platform.color}-600`}
                        style={{
                          width: metrics.impressions > 0
                            ? `${Math.min((metrics.clicks / metrics.impressions) * 100 * 10, 100)}%`
                            : '0%'
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
                        {metrics.clicks.toLocaleString()} clicks
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl">→</div>
                  <div className="flex-1">
                    <div className="relative h-12 bg-gray-200 rounded-lg overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full bg-${platform.color}-700`}
                        style={{
                          width: metrics.clicks > 0
                            ? `${Math.min((metrics.uniqueCustomers / metrics.clicks) * 100 * 10, 100)}%`
                            : '0%'
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
                        {metrics.uniqueCustomers} customers
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Insights */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Key Insights</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>No Overlap:</strong> Each customer is counted only once based on their first contact method (call or form)</li>
          <li>• <strong>Unique Customers:</strong> Deduplicated by phone number across all channels and time periods</li>
          <li>• <strong>Direct Calls:</strong> Many customers see ads and call directly without visiting the website - these are tracked via time-based correlation</li>
          <li>• <strong>Cost Efficiency:</strong> Compare cost per customer across platforms to optimize ad spend</li>
        </ul>
      </div>
    </DashboardLayout>
  );
}
