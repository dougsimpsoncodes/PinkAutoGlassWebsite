'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Download, Play, RefreshCw } from 'lucide-react';

interface Call {
  id: string;
  call_id: string;
  start_time: string;
  duration: number;
  direction: string;
  from_number: string;
  from_name: string | null;
  to_number: string;
  to_name: string | null;
  result: string;
  action: string;
  recording_uri: string | null;
  transport: string;
}

export default function CallAnalyticsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [dateRange, setDateRange] = useState('7days');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const res = await fetch('/api/admin/calls?limit=100');
      if (!res.ok) return;

      const data = await res.json();
      setCalls(data.calls || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch calls:', error);
      setLoading(false);
    }
  };

  const syncRingCentral = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/sync/ringcentral', { method: 'POST' });
      const data = await res.json();

      if (data.ok) {
        alert(`Synced! ${data.summary.recordsFetched} calls fetched, ${data.summary.newCalls} new`);
        fetchCalls();
      } else {
        alert(`Sync failed: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Sync error: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const filterCalls = () => {
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
      default:
        startDate.setDate(now.getDate() - 7);
    }

    let filtered = calls.filter(call => new Date(call.start_time) >= startDate);

    if (filter !== 'all') {
      filtered = filtered.filter(call => {
        if (filter === 'inbound') return call.direction === 'Inbound';
        if (filter === 'outbound') return call.direction === 'Outbound';
        if (filter === 'missed') return call.result === 'Missed';
        if (filter === 'answered') return call.result === 'Accepted' || call.result === 'Call connected';
        return true;
      });
    }

    return filtered;
  };

  const filteredCalls = filterCalls();

  const stats = {
    total: filteredCalls.length,
    inbound: filteredCalls.filter(c => c.direction === 'Inbound').length,
    outbound: filteredCalls.filter(c => c.direction === 'Outbound').length,
    answered: filteredCalls.filter(c => c.result === 'Accepted' || c.result === 'Call connected').length,
    missed: filteredCalls.filter(c => c.result === 'Missed').length,
    avgDuration: filteredCalls.length > 0
      ? Math.round(filteredCalls.reduce((sum, c) => sum + c.duration, 0) / filteredCalls.length)
      : 0,
  };

  const answerRate = stats.inbound > 0 ? Math.round((stats.answered / stats.inbound) * 100) : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (num: string) => {
    if (!num) return '';
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return num;
  };

  const exportCSV = () => {
    const headers = ['Date', 'Direction', 'From', 'To', 'Duration', 'Result'];
    const rows = filteredCalls.map(c => [
      new Date(c.start_time).toLocaleString(),
      c.direction,
      `${c.from_name || ''} ${c.from_number}`.trim(),
      `${c.to_name || ''} ${c.to_number}`.trim(),
      formatDuration(c.duration),
      c.result,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calls-${dateRange}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading calls...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Call Analytics</h1>
            <p className="text-gray-600 mt-1">RingCentral call log and analytics</p>
          </div>
          <button
            onClick={syncRingCentral}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync RingCentral'}
          </button>
        </div>
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
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              >
                <option value="all">All Calls</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="answered">Answered</option>
                <option value="missed">Missed</option>
              </select>
            </div>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-2">Total Calls</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <Phone className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-2">Inbound</div>
              <div className="text-3xl font-bold text-gray-900">{stats.inbound}</div>
            </div>
            <PhoneIncoming className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-2">Outbound</div>
              <div className="text-3xl font-bold text-gray-900">{stats.outbound}</div>
            </div>
            <PhoneOutgoing className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-2">Missed</div>
              <div className="text-3xl font-bold text-gray-900">{stats.missed}</div>
            </div>
            <PhoneMissed className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Answer Rate</span>
              <span className={`font-bold text-lg ${answerRate >= 80 ? 'text-green-600' : answerRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {answerRate}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Call Duration</span>
              <span className="font-semibold">{formatDuration(stats.avgDuration)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Calls Answered</span>
              <span className="font-semibold text-green-600">{stats.answered}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Call Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Inbound Calls</span>
              <span className="font-semibold">{stats.inbound} ({stats.total > 0 ? Math.round((stats.inbound/stats.total)*100) : 0}%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Outbound Calls</span>
              <span className="font-semibold">{stats.outbound} ({stats.total > 0 ? Math.round((stats.outbound/stats.total)*100) : 0}%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Missed Calls</span>
              <span className="font-semibold text-red-600">{stats.missed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calls Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Calls</h2>
          <p className="text-sm text-gray-600 mt-1">Showing {filteredCalls.length} calls</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recording
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No calls found for selected filters
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(call.start_time).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(call.start_time).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {call.direction === 'Inbound' ? (
                          <PhoneIncoming className="w-4 h-4 text-green-500" />
                        ) : (
                          <PhoneOutgoing className="w-4 h-4 text-blue-500" />
                        )}
                        <span className="text-sm text-gray-900">{call.direction}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{call.from_name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{formatPhoneNumber(call.from_number)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{call.to_name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{formatPhoneNumber(call.to_number)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{formatDuration(call.duration)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        call.result === 'Accepted' || call.result === 'Call connected'
                          ? 'bg-green-100 text-green-800'
                          : call.result === 'Missed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {call.result}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {call.recording_uri ? (
                        <a
                          href={call.recording_uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-pink-600 hover:text-pink-700"
                        >
                          <Play className="w-4 h-4" />
                          <span className="text-xs">Play</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
