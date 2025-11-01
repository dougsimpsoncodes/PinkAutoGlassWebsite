'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { Activity, Eye, MousePointerClick, RefreshCw, Users } from 'lucide-react';

interface LiveEvent {
  id: string;
  type: 'page_view' | 'conversion' | 'session_start';
  timestamp: string;
  page_path?: string;
  event_type?: string;
  button_location?: string;
  utm_source?: string;
  session_id: string;
}

export default function LiveActivityPage() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchData = async () => {
    try {
      const [sessionsRes, pageViewsRes, conversionsRes] = await Promise.all([
        fetch('/api/admin/analytics?metric=sessions&range=today'),
        fetch('/api/admin/analytics?metric=pages&range=today'),
        fetch('/api/admin/analytics?metric=conversions_detail&range=today'),
      ]);

      if (!sessionsRes.ok) {
        router.push('/admin/login');
        return;
      }

      const sessionsData = await sessionsRes.json();
      const pageViewsData = await pageViewsRes.json();
      const conversionsData = await conversionsRes.json();

      // Calculate active visitors (sessions in last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const activeSessions = sessionsData.data?.filter((session: any) =>
        new Date(session.started_at) > fiveMinutesAgo
      ) || [];
      setActiveVisitors(activeSessions.length);

      // Build combined event stream
      const allEvents: LiveEvent[] = [
        // Add page views
        ...(pageViewsData.data?.slice(0, 30).map((pv: any) => ({
          id: `pv-${Math.random()}`,
          type: 'page_view' as const,
          timestamp: new Date().toISOString(), // Placeholder since page_views don't have created_at
          page_path: pv.path,
          session_id: '',
        })) || []),
        // Add conversions
        ...(conversionsData.data?.map((conv: any) => ({
          id: conv.id,
          type: 'conversion' as const,
          timestamp: conv.created_at,
          event_type: conv.event_type,
          button_location: conv.button_location,
          page_path: conv.page_path,
          utm_source: conv.utm_source,
          session_id: conv.session_id,
        })) || []),
        // Add session starts
        ...(sessionsData.data?.slice(0, 20).map((session: any) => ({
          id: session.session_id,
          type: 'session_start' as const,
          timestamp: session.started_at,
          utm_source: session.utm_source,
          page_path: session.entry_page,
          session_id: session.session_id,
        })) || []),
      ];

      // Sort by timestamp and take last 50
      allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setEvents(allEvents.slice(0, 50));
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch live activity:', error);
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'page_view':
        return <Eye className="w-5 h-5" />;
      case 'conversion':
        return <MousePointerClick className="w-5 h-5" />;
      case 'session_start':
        return <Users className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'page_view':
        return 'bg-blue-500';
      case 'conversion':
        return 'bg-green-500';
      case 'session_start':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventLabel = (event: LiveEvent) => {
    switch (event.type) {
      case 'page_view':
        return `Viewed ${event.page_path}`;
      case 'conversion':
        return `${event.event_type?.replace('_', ' ')} - ${event.button_location}`;
      case 'session_start':
        return `New session started${event.utm_source ? ` from ${event.utm_source}` : ''}`;
      default:
        return 'Unknown event';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading live activity...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const recentConversions = events.filter(e => e.type === 'conversion').length;
  const recentPageViews = events.filter(e => e.type === 'page_view').length;
  const recentSessions = events.filter(e => e.type === 'session_start').length;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Activity</h1>
            <p className="text-gray-600 mt-1">Monitor real-time visitor activity</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
              <span className="text-sm text-gray-600">
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="ml-2 text-xs text-pink-600 hover:text-pink-700 font-medium"
              >
                {autoRefresh ? 'Disable' : 'Enable'}
              </button>
            </div>

            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Now
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-pink-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm mb-2 opacity-90">Active Visitors</div>
          <div className="text-4xl font-bold">{activeVisitors}</div>
          <div className="text-xs mt-2 opacity-75">In last 5 minutes</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-pink-500">
          <div className="text-sm text-gray-600 mb-2">New Sessions</div>
          <div className="text-3xl font-bold text-gray-900">{recentSessions}</div>
          <div className="text-xs text-gray-500 mt-2">Recent activity</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-2">Page Views</div>
          <div className="text-3xl font-bold text-gray-900">{recentPageViews}</div>
          <div className="text-xs text-gray-500 mt-2">Recent activity</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-2">Conversions</div>
          <div className="text-3xl font-bold text-gray-900">{recentConversions}</div>
          <div className="text-xs text-gray-500 mt-2">Recent activity</div>
        </div>
      </div>

      {/* Activity Stream */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Activity Stream</h2>
              <p className="text-sm text-gray-600 mt-1">Last 50 events across all visitors</p>
            </div>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
          {events.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No recent activity
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`${getEventColor(event.type)} text-white p-3 rounded-lg flex-shrink-0`}>
                    {getEventIcon(event.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 capitalize">
                          {event.type.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {getEventLabel(event)}
                        </p>
                        {event.page_path && (
                          <p className="text-xs text-gray-500 mt-1">
                            Page: {event.page_path}
                          </p>
                        )}
                        {event.utm_source && (
                          <p className="text-xs text-gray-500">
                            Source: {event.utm_source}
                          </p>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-gray-500">
                          {getTimeAgo(event.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Real-Time Monitoring</h3>
          <p className="text-sm text-blue-800">
            {activeVisitors > 0 ? (
              <>
                You have <span className="font-bold">{activeVisitors}</span> active visitor{activeVisitors !== 1 ? 's' : ''} on your site right now.
                {autoRefresh && ' This page refreshes automatically every 5 seconds.'}
              </>
            ) : (
              'No active visitors detected in the last 5 minutes. This data updates in real-time.'
            )}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">Recent Conversion Activity</h3>
          <p className="text-sm text-green-800">
            {recentConversions > 0 ? (
              <>
                Great! You've had <span className="font-bold">{recentConversions}</span> conversion{recentConversions !== 1 ? 's' : ''} in recent activity.
                Keep up the momentum!
              </>
            ) : (
              'No recent conversions detected. Monitor user behavior to optimize for conversions.'
            )}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
