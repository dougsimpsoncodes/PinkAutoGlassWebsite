'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { Download, Phone, MessageSquare, FileText, Filter, Calendar } from 'lucide-react';

interface Conversion {
  id: string;
  created_at: string;
  event_type: 'phone_click' | 'text_click' | 'form_submit';
  button_location: string;
  page_path: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  session_id: string;
}

interface ConversionsBySource {
  source: string;
  conversions: number;
  conversion_rate: number;
}

export default function ConversionsPage() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');
  const [filterType, setFilterType] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/analytics?metric=conversions_detail&range=${dateRange}`);

      if (!res.ok) {
        router.push('/admin/login');
        return;
      }

      const result = await res.json();
      setConversions(result.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch conversions:', error);
      setLoading(false);
    }
  };

  const filteredConversions = filterType === 'all'
    ? conversions
    : conversions.filter(c => c.event_type === filterType);

  const conversionsByType = conversions.reduce((acc, conv) => {
    acc[conv.event_type] = (acc[conv.event_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const conversionsBySource = conversions.reduce((acc, conv) => {
    const source = conv.utm_source || 'direct';
    if (!acc[source]) {
      acc[source] = { count: 0, sessions: new Set() };
    }
    acc[source].count += 1;
    acc[source].sessions.add(conv.session_id);
    return acc;
  }, {} as Record<string, { count: number; sessions: Set<string> }>);

  const sourceStats = Object.entries(conversionsBySource).map(([source, data]) => ({
    source,
    conversions: data.count,
    unique_sessions: data.sessions.size,
    conversion_rate: data.sessions.size > 0 ? (data.count / data.sessions.size) * 100 : 0,
  })).sort((a, b) => b.conversions - a.conversions);

  const exportCSV = () => {
    const headers = ['Date', 'Time', 'Type', 'Location', 'Page', 'Source', 'Medium', 'Campaign'];
    const rows = filteredConversions.map(c => [
      new Date(c.created_at).toLocaleDateString(),
      new Date(c.created_at).toLocaleTimeString(),
      c.event_type,
      c.button_location,
      c.page_path,
      c.utm_source || 'direct',
      c.utm_medium || '',
      c.utm_campaign || '',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversions-${dateRange}.csv`;
    a.click();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'phone_click':
        return <Phone className="w-5 h-5" />;
      case 'text_click':
        return <MessageSquare className="w-5 h-5" />;
      case 'form_submit':
        return <FileText className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'phone_click':
        return 'bg-blue-500';
      case 'text_click':
        return 'bg-green-500';
      case 'form_submit':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading conversions...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Conversions</h1>
        <p className="text-gray-600 mt-1">Track all conversion events and analyze performance</p>
      </div>

      {/* Controls */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
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

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              >
                <option value="all">All Types</option>
                <option value="phone_click">Phone Calls</option>
                <option value="text_click">Text Messages</option>
                <option value="form_submit">Form Submissions</option>
              </select>
            </div>
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
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-pink-500">
          <div className="text-sm text-gray-600 mb-2">Total Conversions</div>
          <div className="text-3xl font-bold text-gray-900">{conversions.length}</div>
          <div className="text-xs text-gray-500 mt-2">
            {filterType !== 'all' ? `Filtered: ${filteredConversions.length}` : 'All types'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-2">Phone Calls</div>
          <div className="text-3xl font-bold text-gray-900">{conversionsByType.phone_click || 0}</div>
          <div className="text-xs text-gray-500 mt-2">
            {conversions.length > 0 ? ((conversionsByType.phone_click || 0) / conversions.length * 100).toFixed(1) : 0}% of total
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-2">Text Messages</div>
          <div className="text-3xl font-bold text-gray-900">{conversionsByType.text_click || 0}</div>
          <div className="text-xs text-gray-500 mt-2">
            {conversions.length > 0 ? ((conversionsByType.text_click || 0) / conversions.length * 100).toFixed(1) : 0}% of total
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <div className="text-sm text-gray-600 mb-2">Form Submissions</div>
          <div className="text-3xl font-bold text-gray-900">{conversionsByType.form_submit || 0}</div>
          <div className="text-xs text-gray-500 mt-2">
            {conversions.length > 0 ? ((conversionsByType.form_submit || 0) / conversions.length * 100).toFixed(1) : 0}% of total
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Conversions by Source */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversions by Source</h2>
          <div className="space-y-3">
            {sourceStats.length === 0 ? (
              <p className="text-gray-500 text-sm">No source data available</p>
            ) : (
              sourceStats.map((stat) => (
                <div key={stat.source} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold ${
                      stat.source === 'google' ? 'bg-blue-500' :
                      stat.source === 'facebook' ? 'bg-blue-600' :
                      stat.source === 'direct' ? 'bg-gray-500' : 'bg-pink-500'
                    }`}>
                      {stat.source.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 capitalize">{stat.source}</div>
                      <div className="text-xs text-gray-500">{stat.unique_sessions} sessions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{stat.conversions}</div>
                    <div className="text-xs text-gray-500">{stat.conversion_rate.toFixed(1)}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversion Timeline */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Conversions</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredConversions.length} conversion{filteredConversions.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="overflow-y-auto max-h-96">
            {filteredConversions.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No conversions found for this period
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredConversions.map((conversion) => (
                  <div key={conversion.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`${getEventColor(conversion.event_type)} text-white p-3 rounded-lg`}>
                        {getEventIcon(conversion.event_type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 capitalize">
                              {conversion.event_type.replace('_', ' ')}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">Location:</span> {conversion.button_location}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Page:</span> {conversion.page_path}
                            </p>
                            {conversion.utm_source && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Source:</span> {conversion.utm_source}
                                {conversion.utm_medium && ` / ${conversion.utm_medium}`}
                                {conversion.utm_campaign && ` / ${conversion.utm_campaign}`}
                              </p>
                            )}
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-600">
                              {new Date(conversion.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(conversion.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Most Common Conversion</h3>
          {conversions.length > 0 && (
            <p className="text-sm text-blue-800">
              <span className="font-bold capitalize">
                {Object.entries(conversionsByType).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace('_', ' ')}
              </span>{' '}
              accounts for{' '}
              <span className="font-bold">
                {Object.entries(conversionsByType).sort((a, b) => b[1] - a[1])[0]?.[1] || 0}
              </span>{' '}
              conversions (
              {conversions.length > 0
                ? ((Object.entries(conversionsByType).sort((a, b) => b[1] - a[1])[0]?.[1] || 0) / conversions.length * 100).toFixed(1)
                : 0}%)
            </p>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">Best Converting Source</h3>
          {sourceStats.length > 0 && (
            <p className="text-sm text-green-800">
              <span className="font-bold capitalize">{sourceStats[0]?.source}</span> has the highest conversion rate at{' '}
              <span className="font-bold">{sourceStats[0]?.conversion_rate.toFixed(1)}%</span> with{' '}
              {sourceStats[0]?.conversions} conversions
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
