'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { Download, ChevronDown, ChevronUp, Clock, MousePointerClick, FileText } from 'lucide-react';

interface Session {
  session_id: string;
  visitor_id: string;
  started_at: string;
  ended_at: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  entry_page?: string;
  exit_page?: string;
  page_views_count: number;
  device_type?: string;
  browser?: string;
  conversions?: number;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');
  const [filterConverted, setFilterConverted] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/analytics?metric=sessions&range=${dateRange}`);

      if (!res.ok) {
        return;
      }

      const result = await res.json();
      setSessions(result.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    // Filter by conversion status
    if (filterConverted === 'converted' && (!session.conversions || session.conversions === 0)) return false;
    if (filterConverted === 'not_converted' && session.conversions && session.conversions > 0) return false;

    // Filter by source
    if (filterSource !== 'all') {
      const source = session.utm_source || 'direct';
      if (source !== filterSource) return false;
    }

    return true;
  });

  const uniqueSources = Array.from(new Set(sessions.map(s => s.utm_source || 'direct')));

  const exportCSV = () => {
    const headers = ['Session ID', 'Start Time', 'Duration (min)', 'Pages', 'Conversions', 'Source', 'Medium', 'Entry Page', 'Exit Page', 'Device', 'Browser'];
    const rows = filteredSessions.map(s => {
      const duration = s.ended_at
        ? Math.round((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 1000 / 60)
        : 0;
      return [
        s.session_id,
        new Date(s.started_at).toLocaleString(),
        duration,
        s.page_views_count,
        s.conversions || 0,
        s.utm_source || 'direct',
        s.utm_medium || '',
        s.entry_page || '',
        s.exit_page || '',
        s.device_type || '',
        s.browser || '',
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-sessions-${dateRange}.csv`;
    a.click();
  };

  const getSessionDuration = (session: Session) => {
    if (!session.ended_at) return 'Active';
    const duration = Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000 / 60);
    return `${duration} min`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading sessions...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const convertedSessions = sessions.filter(s => s.conversions && s.conversions > 0).length;
  const avgPagesPerSession = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + s.page_views_count, 0) / sessions.length
    : 0;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Sessions</h1>
        <p className="text-gray-600 mt-1">Explore individual user journeys through your site</p>
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
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={filterConverted}
                onChange={(e) => setFilterConverted(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              >
                <option value="all">All Sessions</option>
                <option value="converted">Converted</option>
                <option value="not_converted">Not Converted</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Source:</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              >
                <option value="all">All Sources</option>
                {uniqueSources.map(source => (
                  <option key={source} value={source} className="capitalize">{source}</option>
                ))}
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
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-2">Total Sessions</div>
          <div className="text-3xl font-bold text-gray-900">{sessions.length}</div>
          <div className="text-xs text-gray-500 mt-2">
            {filteredSessions.length !== sessions.length ? `Filtered: ${filteredSessions.length}` : 'All sessions'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-2">Converted Sessions</div>
          <div className="text-3xl font-bold text-gray-900">{convertedSessions}</div>
          <div className="text-xs text-gray-500 mt-2">
            {sessions.length > 0 ? ((convertedSessions / sessions.length) * 100).toFixed(1) : 0}% conversion rate
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-pink-500">
          <div className="text-sm text-gray-600 mb-2">Avg. Pages/Session</div>
          <div className="text-3xl font-bold text-gray-900">{avgPagesPerSession.toFixed(1)}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <div className="text-sm text-gray-600 mb-2">Top Source</div>
          <div className="text-2xl font-bold text-gray-900 capitalize">
            {uniqueSources.length > 0 ? uniqueSources[0] : 'N/A'}
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Session Details</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredSessions.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No sessions found matching your filters
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div key={session.session_id} className="hover:bg-gray-50 transition-colors">
                <button
                  onClick={() => setExpandedSession(expandedSession === session.session_id ? null : session.session_id)}
                  className="w-full px-6 py-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(session.started_at).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Session ID: {session.session_id.slice(0, 8)}...
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-600">Duration</div>
                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getSessionDuration(session)}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-600">Pages</div>
                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {session.page_views_count}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-600">Source</div>
                        <div className="text-sm font-semibold text-gray-900 capitalize">
                          {session.utm_source || 'Direct'}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-600">Conversions</div>
                        <div className={`text-sm font-semibold ${
                          session.conversions && session.conversions > 0 ? 'text-green-600' : 'text-gray-400'
                        } flex items-center gap-1`}>
                          <MousePointerClick className="w-4 h-4" />
                          {session.conversions || 0}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      {expandedSession === session.session_id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {expandedSession === session.session_id && (
                  <div className="px-6 pb-4 border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Session Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Visitor ID:</span>{' '}
                            <span className="font-mono text-xs">{session.visitor_id}</span>
                          </div>
                          {session.device_type && (
                            <div>
                              <span className="text-gray-600">Device:</span>{' '}
                              <span className="capitalize">{session.device_type}</span>
                            </div>
                          )}
                          {session.browser && (
                            <div>
                              <span className="text-gray-600">Browser:</span>{' '}
                              <span>{session.browser}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Navigation</h4>
                        <div className="space-y-2 text-sm">
                          {session.entry_page && (
                            <div>
                              <span className="text-gray-600">Entry Page:</span>{' '}
                              <span className="font-medium">{session.entry_page}</span>
                            </div>
                          )}
                          {session.exit_page && (
                            <div>
                              <span className="text-gray-600">Exit Page:</span>{' '}
                              <span className="font-medium">{session.exit_page}</span>
                            </div>
                          )}
                          {session.utm_campaign && (
                            <div>
                              <span className="text-gray-600">Campaign:</span>{' '}
                              <span>{session.utm_campaign}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Session Behavior Pattern</h3>
          <p className="text-sm text-blue-800">
            Users view an average of <span className="font-bold">{avgPagesPerSession.toFixed(1)}</span> pages per session.
            {convertedSessions > 0 && (
              <> Sessions with conversions tend to have more page views, indicating higher engagement.</>
            )}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">Conversion Insight</h3>
          <p className="text-sm text-green-800">
            {convertedSessions > 0 ? (
              <>
                <span className="font-bold">{((convertedSessions / sessions.length) * 100).toFixed(1)}%</span> of sessions
                result in a conversion. Focus on replicating successful session patterns.
              </>
            ) : (
              'No conversions yet. Analyze session behavior to identify optimization opportunities.'
            )}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
