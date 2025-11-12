'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Play, RefreshCw, Users, CheckCircle, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';

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
  session_id: string;
  result: string;
  action: string;
  recording_id: string | null;
  recording_uri: string | null;
  transport: string;
}

export default function CallAnalyticsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCalls();
  }, []);

  // Deduplicate calls - only show one call per session_id
  const deduplicateCalls = (calls: Call[]): Call[] => {
    const sessionMap = new Map<string, Call>();

    calls.forEach(call => {
      const existing = sessionMap.get(call.session_id);

      if (!existing) {
        // First party in this session - add it
        sessionMap.set(call.session_id, call);
      } else {
        // Prefer Inbound calls to our business number (+17209187465)
        const isInboundToUs = call.direction === 'Inbound' && call.to_number === '+17209187465';
        const existingIsInboundToUs = existing.direction === 'Inbound' && existing.to_number === '+17209187465';

        if (isInboundToUs && !existingIsInboundToUs) {
          sessionMap.set(call.session_id, call);
        }
      }
    });

    return Array.from(sessionMap.values());
  };

  const fetchCalls = async () => {
    try {
      const res = await fetch('/api/admin/calls?limit=1000', {
        credentials: 'include' // Include Basic Auth credentials
      });
      if (!res.ok) return;

      const data = await res.json();
      const deduplicatedCalls = deduplicateCalls(data.calls || []);
      setCalls(deduplicatedCalls);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch calls:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Step 1: Sync from RingCentral API to database
      const syncRes = await fetch('/api/admin/sync/ringcentral', {
        method: 'POST',
        credentials: 'include' // Include Basic Auth credentials
      });

      if (!syncRes.ok) {
        console.error('Sync failed:', await syncRes.text());
      }

      // Step 2: Fetch updated calls from database
      await fetchCalls();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
    setRefreshing(false);
  };

  const getCallsInDateRange = () => {
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
      case 'all':
        // Return all calls without filtering
        return calls;
      default:
        // Default to all calls
        return calls;
    }

    return calls.filter(call => new Date(call.start_time) >= startDate);
  };

  const callsInDateRange = getCallsInDateRange();

  // Group calls by customer phone number (conversation-style)
  interface CallGroup {
    customerNumber: string;
    customerName: string | null;
    calls: Call[];
    mostRecentCall: Call;
    totalCalls: number;
  }

  const groupCallsByCustomer = (calls: Call[]): CallGroup[] => {
    const groups = new Map<string, Call[]>();
    const businessNumber = '+17209187465';

    // Step 1: Identify all customer numbers that have called us (inbound calls only)
    // These are the ONLY numbers we consider "customers"
    const inboundCustomerNumbers = new Set<string>();

    calls.forEach(call => {
      if (call.direction === 'Inbound') {
        const customerNumber = call.from_number;

        // Skip our business number and internal extensions
        if (customerNumber === businessNumber) return;
        if (customerNumber && !customerNumber.startsWith('+') && customerNumber.length <= 4) return;

        inboundCustomerNumbers.add(customerNumber);
      }
    });

    // Step 2: Group ALL calls (inbound and outbound) but ONLY for customers who have called us
    calls.forEach(call => {
      // Determine the customer number for this call
      let customerNumber: string;

      if (call.direction === 'Inbound') {
        // Customer called us - use their number (from_number)
        customerNumber = call.from_number;
      } else {
        // We called out - use the number we called (to_number)
        customerNumber = call.to_number;
      }

      // Skip our own business number and internal extensions
      if (customerNumber === businessNumber) return;
      if (customerNumber && !customerNumber.startsWith('+') && customerNumber.length <= 4) return;

      // CRITICAL: Only include this call if the customer has called us at least once
      // This filters out standalone outbound calls (employees cold-calling)
      if (!inboundCustomerNumbers.has(customerNumber)) {
        return; // Skip outbound-only calls - not a customer yet
      }

      if (!groups.has(customerNumber)) {
        groups.set(customerNumber, []);
      }
      groups.get(customerNumber)!.push(call);
    });

    // Convert to CallGroup array and sort
    const groupArray: CallGroup[] = Array.from(groups.entries()).map(([customerNumber, groupCalls]) => {
      // Sort calls within group by timestamp (newest first)
      groupCalls.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

      const mostRecentCall = groupCalls[0];
      const customerName = mostRecentCall.direction === 'Inbound'
        ? mostRecentCall.from_name
        : mostRecentCall.to_name;

      return {
        customerNumber,
        customerName,
        calls: groupCalls,
        mostRecentCall,
        totalCalls: groupCalls.length,
      };
    });

    // Sort groups by most recent call timestamp (newest first)
    groupArray.sort((a, b) =>
      new Date(b.mostRecentCall.start_time).getTime() - new Date(a.mostRecentCall.start_time).getTime()
    );

    return groupArray;
  };

  const callGroups = groupCallsByCustomer(callsInDateRange);

  const toggleGroup = (customerNumber: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(customerNumber)) {
        next.delete(customerNumber);
      } else {
        next.add(customerNumber);
      }
      return next;
    });
  };

  // Calculate unique callers (distinct phone numbers)
  const inboundCalls = callsInDateRange.filter(c => c.direction === 'Inbound');
  const uniqueCallers = new Set(inboundCalls.map(c => c.from_number)).size;

  // Calculate answered unique callers (customers who got through)
  const answeredCalls = inboundCalls.filter(c => c.result === 'Accepted' || c.result === 'Call connected');
  const answeredUniqueCallers = new Set(answeredCalls.map(c => c.from_number)).size;

  const stats = {
    total: callsInDateRange.length,
    inbound: inboundCalls.length,
    outbound: callsInDateRange.filter(c => c.direction === 'Outbound').length,
    answered: answeredCalls.length,
    missed: callsInDateRange.filter(c => c.result === 'Missed').length,
    uniqueCallers, // Unique phone numbers that called
    answeredUniqueCallers, // Unique customers who got through
    avgDuration: callsInDateRange.length > 0
      ? Math.round(callsInDateRange.reduce((sum, c) => sum + c.duration, 0) / callsInDateRange.length)
      : 0,
  };

  const answerRate = stats.inbound > 0 ? Math.round((stats.answered / stats.inbound) * 100) : 0;
  const uniqueCallerConversionRate = stats.uniqueCallers > 0 ? Math.round((stats.answeredUniqueCallers / stats.uniqueCallers) * 100) : 0;

  // Group unique customers by day for line chart
  const customersByDay = callsInDateRange
    .filter(call => call.direction === 'Inbound') // Only inbound calls
    .reduce((acc: Record<string, Set<string>>, call) => {
      const date = new Date(call.start_time).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = new Set();
      }
      acc[date].add(call.from_number); // Track unique phone numbers per day
      return acc;
    }, {});

  const chartData = Object.entries(customersByDay)
    .map(([date, numbersSet]) => ({
      date,
      uniqueCustomers: numbersSet.size
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const maxCustomersInDay = Math.max(...chartData.map(d => d.uniqueCustomers), 1);

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

  const getLastUpdateTime = () => {
    if (!lastUpdated) return 'Not yet loaded';

    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Format relative time
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

    // For older data, show absolute date/time
    return lastUpdated.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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
        <h1 className="text-3xl font-bold text-gray-900">Call Analytics</h1>
        <p className="text-gray-600 mt-1">RingCentral call log and analytics</p>
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
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
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

      {/* Unique Caller Metrics */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200 p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Unique Customer Tracking
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-2">Unique Callers</div>
                <div className="text-3xl font-bold text-gray-900">{stats.uniqueCallers}</div>
                <div className="text-xs text-gray-500 mt-1">Distinct phone numbers</div>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-2">Customers Reached</div>
                <div className="text-3xl font-bold text-gray-900">{stats.answeredUniqueCallers}</div>
                <div className="text-xs text-gray-500 mt-1">Unique calls answered</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-pink-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-2">Answer Rate</div>
                <div className="text-3xl font-bold text-gray-900">{uniqueCallerConversionRate}%</div>
                <div className="text-xs text-gray-500 mt-1">Unique callers answered</div>
              </div>
              <TrendingUp className="w-8 h-8 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Unique Customers Line Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-6">Unique Customers by Day</h3>
        {chartData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No call data available for this date range
          </div>
        ) : (
          <div className="w-full h-64">
            <svg className="w-full h-full" viewBox="0 -20 1600 320" preserveAspectRatio="xMidYMid meet">
              {/* Y-axis grid lines and labels */}
              {[0, 1, 2, 3, 4, 5].map((tick) => {
                const y = 250 - (tick * 50);
                const value = Math.round((tick / 5) * maxCustomersInDay);
                return (
                  <g key={tick}>
                    <line
                      x1="60"
                      y1={y}
                      x2="1540"
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                    <text
                      x="50"
                      y={y + 4}
                      textAnchor="end"
                      fontSize="12"
                      fill="#6b7280"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              {/* X-axis labels */}
              {chartData.map((point, index) => {
                const x = 60 + (index * (1480 / Math.max(chartData.length - 1, 1)));
                return (
                  <text
                    key={index}
                    x={x}
                    y="275"
                    textAnchor="middle"
                    fontSize="11"
                    fill="#6b7280"
                  >
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </text>
                );
              })}

              {/* Line path */}
              <path
                d={chartData.map((point, index) => {
                  const x = 60 + (index * (1480 / Math.max(chartData.length - 1, 1)));
                  const y = 250 - ((point.uniqueCustomers / maxCustomersInDay) * 250);
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#9333ea"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {chartData.map((point, index) => {
                const x = 60 + (index * (1480 / Math.max(chartData.length - 1, 1)));
                const y = 250 - ((point.uniqueCustomers / maxCustomersInDay) * 250);
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#9333ea"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    <title>{`${point.date}: ${point.uniqueCustomers} unique customer${point.uniqueCustomers !== 1 ? 's' : ''}`}</title>
                  </g>
                );
              })}

              {/* X-axis */}
              <line x1="60" y1="250" x2="1540" y2="250" stroke="#9ca3af" strokeWidth="2" />

              {/* Y-axis */}
              <line x1="60" y1="0" x2="60" y2="250" stroke="#9ca3af" strokeWidth="2" />

              {/* Y-axis label */}
              <text
                x="20"
                y="130"
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
                transform="rotate(-90 20 130)"
              >
                Unique Customers
              </text>
            </svg>
          </div>
        )}
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Call History by Customer</h2>
              <p className="text-sm text-gray-600 mt-1">Showing {callGroups.length} unique customers ({callsInDateRange.length} total calls)</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Last Update</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{getLastUpdateTime()}</p>
              <p className="text-xs text-gray-500 mt-1">Click refresh to sync from RingCentral</p>
            </div>
          </div>
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
              {callGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No calls found for selected date range
                  </td>
                </tr>
              ) : (
                callGroups.map((group) => {
                  const isExpanded = expandedGroups.has(group.customerNumber);
                  const call = group.mostRecentCall;

                  return (
                    <>
                      {/* Primary row - Most recent call */}
                      <tr
                        key={`group-${group.customerNumber}`}
                        className="hover:bg-gray-50 cursor-pointer border-l-4 border-l-purple-500"
                        onClick={() => toggleGroup(group.customerNumber)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(call.start_time).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(call.start_time).toLocaleTimeString()}
                              </div>
                            </div>
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
                          <div className="text-sm font-medium text-gray-900">{group.customerName || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{formatPhoneNumber(group.customerNumber)}</div>
                          {group.totalCalls > 1 && (
                            <div className="text-xs text-purple-600 font-medium mt-1">
                              {group.totalCalls} total calls
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{call.direction === 'Inbound' ? (call.to_name || 'Unknown') : (call.from_name || 'Unknown')}</div>
                          <div className="text-xs text-gray-500">{formatPhoneNumber(call.direction === 'Inbound' ? call.to_number : call.from_number)}</div>
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
                          {call.recording_id ? (
                            <a
                              href={`/api/admin/recording/${call.recording_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-pink-600 hover:text-pink-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Play className="w-4 h-4" />
                              <span className="text-xs">Play</span>
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded rows - Previous calls from same customer */}
                      {isExpanded && group.calls.slice(1).map((prevCall, index) => (
                        <tr
                          key={`${group.customerNumber}-${prevCall.id}`}
                          className="bg-purple-50 border-l-4 border-l-purple-300"
                        >
                          <td className="px-6 py-3 whitespace-nowrap">
                            <div className="pl-6">
                              <div className="text-xs text-gray-600">
                                {new Date(prevCall.start_time).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(prevCall.start_time).toLocaleTimeString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {prevCall.direction === 'Inbound' ? (
                                <PhoneIncoming className="w-3 h-3 text-green-500" />
                              ) : (
                                <PhoneOutgoing className="w-3 h-3 text-blue-500" />
                              )}
                              <span className="text-xs text-gray-700">{prevCall.direction}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="text-xs text-gray-600">Previous call</div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="text-xs text-gray-600">{prevCall.direction === 'Inbound' ? (prevCall.to_name || 'Unknown') : (prevCall.from_name || 'Unknown')}</div>
                            <div className="text-xs text-gray-500">{formatPhoneNumber(prevCall.direction === 'Inbound' ? prevCall.to_number : prevCall.from_number)}</div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-700">{formatDuration(prevCall.duration)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              prevCall.result === 'Accepted' || prevCall.result === 'Call connected'
                                ? 'bg-green-100 text-green-800'
                                : prevCall.result === 'Missed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {prevCall.result}
                            </span>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            {prevCall.recording_id ? (
                              <a
                                href={`/api/admin/recording/${prevCall.recording_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-pink-600 hover:text-pink-700"
                              >
                                <Play className="w-3 h-3" />
                                <span className="text-xs">Play</span>
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
