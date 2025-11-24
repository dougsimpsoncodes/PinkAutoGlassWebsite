'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import {
  Phone,
  MessageSquare,
  FileText,
  DollarSign,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  PhoneIncoming,
  PhoneMissed,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface DashboardMetrics {
  // Calls
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  uniqueCallers: number;

  // Texts
  textClicks: number;

  // Form Leads
  formLeads: number;
  newLeads: number;

  // Revenue
  totalRevenue: number;

  // Google Ads
  adSpend: number;
  costPerLead: number;
}

interface RecentLead {
  id: string;
  name: string;
  type: 'call' | 'text' | 'form';
  time: string;
  status: string;
  phone?: string;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('7days');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [callsRes, conversionsRes, leadsRes] = await Promise.all([
        fetch('/api/admin/calls?limit=1000'),
        fetch(`/api/admin/analytics?metric=conversions&range=${dateRange}`),
        fetch('/api/admin/leads'),
      ]);

      // Process calls data
      let callMetrics = {
        totalCalls: 0,
        answeredCalls: 0,
        missedCalls: 0,
        uniqueCallers: 0,
      };

      if (callsRes.ok) {
        const callsData = await callsRes.json();
        const calls = callsData.calls || [];

        // Filter by date range
        const now = new Date();
        let startDate = new Date();
        switch (dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case '7days':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30days':
            startDate.setDate(now.getDate() - 30);
            break;
        }

        const filteredCalls = calls.filter((call: any) =>
          new Date(call.start_time) >= startDate
        );

        const inboundCalls = filteredCalls.filter((c: any) => c.direction === 'Inbound');
        const uniqueNumbers = new Set(inboundCalls.map((c: any) => c.from_number));

        callMetrics = {
          totalCalls: filteredCalls.length,
          answeredCalls: filteredCalls.filter((c: any) =>
            c.result === 'Accepted' || c.result === 'Call connected'
          ).length,
          missedCalls: filteredCalls.filter((c: any) => c.result === 'Missed').length,
          uniqueCallers: uniqueNumbers.size,
        };
      }

      // Process conversions (texts)
      let textClicks = 0;
      if (conversionsRes.ok) {
        const conversionsData = await conversionsRes.json();
        textClicks = conversionsData.data?.by_type?.text_click || 0;
      }

      // Process leads
      let leadMetrics = {
        formLeads: 0,
        newLeads: 0,
        totalRevenue: 0,
      };
      let recent: RecentLead[] = [];

      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        const leads = leadsData.leads || [];

        leadMetrics = {
          formLeads: leads.length,
          newLeads: leads.filter((l: any) => l.status === 'new').length,
          totalRevenue: leads.reduce((sum: number, l: any) => sum + (l.revenue_amount || 0), 0),
        };

        // Build recent leads list (combine calls and forms)
        recent = leads.slice(0, 5).map((l: any) => ({
          id: l.id,
          name: `${l.first_name} ${l.last_name}`,
          type: 'form' as const,
          time: new Date(l.created_at).toLocaleString(),
          status: l.status || 'new',
          phone: l.phone,
        }));
      }

      // Calculate cost per lead (calls + texts + forms)
      const totalLeads = callMetrics.uniqueCallers + textClicks + leadMetrics.formLeads;
      // Note: We'd need to fetch ad spend from Google Ads API for real data
      // For now, showing placeholder
      const adSpend = 0; // Will be populated when Google Ads sync is enabled

      setMetrics({
        ...callMetrics,
        textClicks,
        ...leadMetrics,
        adSpend,
        costPerLead: totalLeads > 0 && adSpend > 0 ? adSpend / totalLeads : 0,
      });

      setRecentLeads(recent);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    // Sync RingCentral data first
    try {
      await fetch('/api/admin/sync/ringcentral', { method: 'POST' });
    } catch (e) {
      console.error('RingCentral sync error:', e);
    }

    // Then refresh dashboard
    await fetchDashboardData();
    setRefreshing(false);
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Not yet loaded';
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  if (loading) {
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

  const answerRate = metrics && metrics.totalCalls > 0
    ? Math.round((metrics.answeredCalls / metrics.totalCalls) * 100)
    : 0;

  const totalLeads = (metrics?.uniqueCallers || 0) + (metrics?.textClicks || 0) + (metrics?.formLeads || 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Calls, texts, and leads at a glance</p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 mb-6">
        Last updated: {formatTimeAgo(lastUpdated)}
      </div>

      {/* Total Leads - Hero Metric */}
      <div className="bg-gradient-to-r from-pink-600 to-blue-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-pink-100 text-sm font-medium">Total Leads ({dateRange === 'today' ? 'Today' : dateRange === '7days' ? 'Last 7 Days' : 'Last 30 Days'})</p>
            <p className="text-5xl font-bold mt-2">{totalLeads}</p>
            <p className="text-pink-100 text-sm mt-2">
              {metrics?.uniqueCallers || 0} calls • {metrics?.textClicks || 0} texts • {metrics?.formLeads || 0} forms
            </p>
          </div>
          <div className="bg-white/20 rounded-xl p-4">
            <TrendingUp className="w-12 h-12" />
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Calls Card */}
        <Link href="/admin/dashboard/leads" className="block">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">Phone Calls</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{metrics?.uniqueCallers || 0}</p>
            <p className="text-sm text-gray-500 mt-2">unique callers</p>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <PhoneIncoming className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">{metrics?.answeredCalls || 0} answered</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneMissed className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600">{metrics?.missedCalls || 0} missed</span>
              </div>
            </div>

            {/* Answer Rate */}
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Answer Rate</span>
                <span className={`font-medium ${answerRate >= 80 ? 'text-green-600' : answerRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {answerRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${answerRate >= 80 ? 'bg-green-500' : answerRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${answerRate}%` }}
                />
              </div>
            </div>
          </div>
        </Link>

        {/* Texts Card */}
        <Link href="/admin/dashboard/leads" className="block">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">Text Messages</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{metrics?.textClicks || 0}</p>
            <p className="text-sm text-gray-500 mt-2">click-to-text events</p>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Tracks when visitors tap the text button on your website
              </p>
            </div>
          </div>
        </Link>

        {/* Form Leads Card */}
        <Link href="/admin/dashboard/leads" className="block">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">Form Submissions</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{metrics?.formLeads || 0}</p>
            <p className="text-sm text-gray-500 mt-2">booking requests</p>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New leads</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  {metrics?.newLeads || 0} awaiting
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Revenue & Alerts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Revenue Tracking</h3>
          </div>

          <div className="text-3xl font-bold text-green-600">
            ${(metrics?.totalRevenue || 0).toLocaleString()}
          </div>
          <p className="text-sm text-gray-500 mt-1">from closed leads</p>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              href="/admin/dashboard/leads"
              className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
            >
              Update revenue in Leads
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Alerts/Status Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Status & Alerts</h3>
          </div>

          <div className="space-y-3">
            {/* Missed Calls Alert */}
            {metrics && metrics.missedCalls > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <PhoneMissed className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {metrics.missedCalls} missed call{metrics.missedCalls > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-600">Consider following up</p>
                </div>
              </div>
            )}

            {/* New Leads Alert */}
            {metrics && metrics.newLeads > 0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <FileText className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {metrics.newLeads} new lead{metrics.newLeads > 1 ? 's' : ''} pending
                  </p>
                  <p className="text-xs text-yellow-600">Review in Leads page</p>
                </div>
              </div>
            )}

            {/* All Good */}
            {metrics && metrics.missedCalls === 0 && metrics.newLeads === 0 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">All caught up!</p>
                  <p className="text-xs text-green-600">No pending items</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/dashboard/leads"
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-700">View All Leads</span>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>
          <Link
            href="/admin/dashboard/google-ads"
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-700">Google Ads Analysis</span>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>
          <a
            href="https://ads.google.com/aw/campaigns"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-700">Open Google Ads</span>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
