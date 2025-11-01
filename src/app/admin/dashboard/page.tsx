'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';

interface OverviewMetrics {
  total_visitors: number;
  total_page_views: number;
  total_conversions: number;
  conversion_rate: number;
}

interface TrafficSource {
  source: string;
  visitors: number;
}

interface ConversionData {
  by_type: Record<string, number>;
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [conversions, setConversions] = useState<ConversionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      const [overviewRes, trafficRes, conversionsRes] = await Promise.all([
        fetch(`/api/admin/analytics?metric=overview&range=${dateRange}`),
        fetch(`/api/admin/analytics?metric=traffic_sources&range=${dateRange}`),
        fetch(`/api/admin/analytics?metric=conversions&range=${dateRange}`),
      ]);

      if (!overviewRes.ok) {
        return;
      }

      const overviewData = await overviewRes.json();
      const trafficData = await trafficRes.json();
      const conversionsData = await conversionsRes.json();

      setOverview(overviewData.data);
      setTrafficSources(trafficData.data || []);
      setConversions(conversionsData.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Real-time website performance insights</p>
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
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Data
          </div>
        </div>
      </div>

      {/* Key Metrics - CLICKABLE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Visitors - Click to Traffic page */}
        <Link href="/admin/dashboard/traffic">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-pink-500 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-600 mb-2">Total Visitors</div>
                <div className="text-3xl font-bold text-gray-900">{overview?.total_visitors || 0}</div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors" />
            </div>
          </div>
        </Link>

        {/* Page Views - Click to Pages page */}
        <Link href="/admin/dashboard/pages">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-600 mb-2">Page Views</div>
                <div className="text-3xl font-bold text-gray-900">{overview?.total_page_views || 0}</div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </Link>

        {/* Conversions - Click to Conversions page */}
        <Link href="/admin/dashboard/conversions">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-600 mb-2">Conversions</div>
                <div className="text-3xl font-bold text-gray-900">{overview?.total_conversions || 0}</div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
          </div>
        </Link>

        {/* Conversion Rate */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <div className="text-sm text-gray-600 mb-2">Conversion Rate</div>
          <div className="text-3xl font-bold text-gray-900">
            {overview?.conversion_rate ? overview.conversion_rate.toFixed(1) : '0.0'}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traffic Sources - CLICKABLE */}
        <Link href="/admin/dashboard/traffic">
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Traffic Sources</h3>
              <ArrowUpRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {trafficSources.length === 0 ? (
                <p className="text-gray-500 text-sm">No traffic data yet</p>
              ) : (
                trafficSources.slice(0, 5).map((source) => (
                  <div key={source.source} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold ${
                        source.source === 'google' ? 'bg-blue-500' :
                        source.source === 'facebook' ? 'bg-blue-600' :
                        source.source === 'direct' ? 'bg-gray-500' : 'bg-pink-500'
                      }`}>
                        {source.source.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium capitalize">{source.source}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{source.visitors}</div>
                      <div className="text-xs text-gray-500">visitors</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Link>

        {/* Conversions by Type - CLICKABLE */}
        <Link href="/admin/dashboard/conversions">
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Conversions by Type</h3>
              <ArrowUpRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {!conversions || Object.keys(conversions.by_type || {}).length === 0 ? (
                <p className="text-gray-500 text-sm">No conversion data yet</p>
              ) : (
                Object.entries(conversions.by_type).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {type === 'phone_click' && '📞'}
                        {type === 'text_click' && '💬'}
                        {type === 'form_submit' && '📝'}
                      </div>
                      <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{count}</div>
                      <div className="text-xs text-gray-500">
                        {overview?.total_conversions
                          ? ((count / overview.total_conversions) * 100).toFixed(1)
                          : '0'}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/dashboard/sessions" className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors">
          <h4 className="font-semibold text-blue-900 mb-1">View User Sessions</h4>
          <p className="text-sm text-blue-700">See individual user journeys</p>
        </Link>

        <Link href="/admin/dashboard/live" className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors">
          <h4 className="font-semibold text-green-900 mb-1">Live Activity</h4>
          <p className="text-sm text-green-700">Monitor real-time visitors</p>
        </Link>

        <button className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors text-left">
          <h4 className="font-semibold text-gray-900 mb-1">Export Data</h4>
          <p className="text-sm text-gray-700">Download CSV report</p>
        </button>
      </div>
    </DashboardLayout>
  );
}
