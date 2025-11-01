'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';

interface CallStats {
  totalCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  answeredCalls: number;
  missedCalls: number;
  avgDuration: number;
  answeredRate: number;
}

interface SyncStatus {
  lastSyncAt: string | null;
  totalCallsInDatabase: number;
  last7Days: {
    total: number;
    inbound: number;
    answered: number;
    missed: number;
  };
}

interface Call {
  id: string;
  call_id: string;
  start_time: string;
  end_time: string | null;
  duration: number;
  direction: string;
  from_number: string;
  from_name: string | null;
  to_number: string;
  to_name: string | null;
  result: string;
  action: string;
}

export default function CallAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState<CallStats | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [callsLoading, setCallsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('start_time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/admin/sync/ringcentral');
      const data = await response.json();

      if (data.ok) {
        setSyncStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch sync status:', err);
    }
  };

  const fetchCalls = async () => {
    setCallsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/calls?sortBy=${sortBy}&sortOrder=${sortOrder}&limit=100`
      );
      const data = await response.json();

      if (data.ok) {
        setCalls(data.calls);
      }
    } catch (err) {
      console.error('Failed to fetch calls:', err);
    } finally {
      setCallsLoading(false);
    }
  };

  const syncCalls = async () => {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/sync/ringcentral', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.ok) {
        setStats(data.statistics);
        await fetchSyncStatus();
        await fetchCalls();
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sync calls');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus().then(() => setLoading(false));
    fetchCalls();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchCalls();
    }
  }, [sortBy, sortOrder]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const formatPhone = (phone: string) => {
    // Format as (XXX) XXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const match = cleaned.match(/^1(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Call Analytics</h1>
          <p className="text-gray-600 mt-1">
            RingCentral call log data and statistics
          </p>
        </div>
        <button
          onClick={syncCalls}
          disabled={syncing}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition"
        >
          <svg
            className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Sync Status */}
      {syncStatus && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Sync Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Last Sync</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(syncStatus.lastSyncAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Calls in Database</p>
              <p className="text-lg font-semibold text-gray-900">{syncStatus.totalCallsInDatabase}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Calls (Last 7 Days)</p>
              <p className="text-lg font-semibold text-gray-900">{syncStatus.last7Days.total}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Calls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Calls</h3>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalCalls}</div>
              <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
            </div>

            {/* Inbound Calls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Inbound Calls</h3>
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.inboundCalls}</div>
              <p className="text-sm text-gray-500 mt-1">
                {((stats.inboundCalls / stats.totalCalls) * 100).toFixed(0)}% of total
              </p>
            </div>

            {/* Answered Calls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Answered</h3>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.answeredCalls}</div>
              <p className="text-sm text-gray-500 mt-1">
                {stats.answeredRate}% answer rate
              </p>
            </div>

            {/* Missed Calls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Missed Calls</h3>
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.missedCalls}</div>
              <p className="text-sm text-gray-500 mt-1">
                {((stats.missedCalls / stats.inboundCalls) * 100).toFixed(0)}% of inbound
              </p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Outbound Calls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Outbound Calls</h3>
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.outboundCalls}</div>
              <p className="text-sm text-gray-500 mt-1">
                {((stats.outboundCalls / stats.totalCalls) * 100).toFixed(0)}% of total
              </p>
            </div>

            {/* Avg Duration */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Avg Call Duration</h3>
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">{formatDuration(stats.avgDuration)}</div>
              <p className="text-sm text-gray-500 mt-1">
                {stats.avgDuration} seconds
              </p>
            </div>

            {/* Call Quality */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Call Quality Score</h3>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.answeredRate >= 80 ? 'Excellent' : stats.answeredRate >= 60 ? 'Good' : 'Needs Improvement'}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Based on {stats.answeredRate}% answer rate
              </p>
            </div>
          </div>
        </>
      )}

      {/* Instructions */}
      {!stats && !syncing && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Get Started</h2>
          <p className="text-gray-600">
            Click "Sync Now" to fetch your RingCentral call logs and view analytics
          </p>
        </div>
      )}

      {/* Call Log Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Call Log</h2>
          <p className="text-gray-600 mt-1">
            {calls.length} most recent calls
          </p>
        </div>

        {callsLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading calls...</p>
          </div>
        ) : calls.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No calls found. Click "Sync Now" to load call data.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('start_time')}
                  >
                    <div className="flex items-center gap-2">
                      Date/Time
                      {sortBy === 'start_time' && (
                        <span className="text-pink-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('direction')}
                  >
                    <div className="flex items-center gap-2">
                      Direction
                      {sortBy === 'direction' && (
                        <span className="text-pink-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    To
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('duration')}
                  >
                    <div className="flex items-center gap-2">
                      Duration
                      {sortBy === 'duration' && (
                        <span className="text-pink-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Handled By
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('result')}
                  >
                    <div className="flex items-center gap-2">
                      Result
                      {sortBy === 'result' && (
                        <span className="text-pink-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(call.start_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          call.direction === 'Inbound'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {call.direction}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="text-gray-900">{formatPhone(call.from_number)}</div>
                      {call.from_name && (
                        <div className="text-gray-500 text-xs">{call.from_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="text-gray-900">{formatPhone(call.to_number)}</div>
                      {call.to_name && (
                        <div className="text-gray-500 text-xs">{call.to_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(call.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {call.direction === 'Inbound' && call.result === 'Accepted' ? (
                        <div>
                          <div className="text-gray-900">{formatPhone(call.to_number)}</div>
                          {call.to_name && (
                            <div className="text-gray-500 text-xs">{call.to_name}</div>
                          )}
                        </div>
                      ) : call.direction === 'Outbound' ? (
                        <div>
                          <div className="text-gray-900">{formatPhone(call.from_number)}</div>
                          {call.from_name && (
                            <div className="text-gray-500 text-xs">{call.from_name}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          call.result === 'Accepted'
                            ? 'bg-green-100 text-green-800'
                            : call.result === 'Missed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {call.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
