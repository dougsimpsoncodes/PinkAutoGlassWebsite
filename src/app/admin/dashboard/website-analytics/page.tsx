'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { useMarket } from '@/contexts/MarketContext';
import { useSync } from '@/contexts/SyncContext';
import DateFilterBar, { DateFilter } from '@/components/admin/DateFilterBar';
import {
  Download,
  Phone,
  MessageSquare,
  FileText,
  ArrowUpDown,
  ExternalLink,
  TrendingUp,
  MapPin,
} from 'lucide-react';

// ── Interfaces ──────────────────────────────────────────────────────────────

interface TrafficSource {
  source: string;
  medium?: string;
  campaign?: string;
  visitors: number;
  page_views: number;
  conversions: number;
  conversion_rate: number;
}

interface PagePerformance {
  page_path: string;
  views: number;
  unique_visitors: number;
  conversions: number;
  conversion_rate: number;
  entry_count: number;
  exit_count: number;
  exit_rate: number;
}

interface OverviewData {
  total_visitors: number;
  total_page_views: number;
  total_conversions: number;
  conversion_rate: number;
}

interface LeadTypeBreakdown {
  phone_click: number;
  form_submit: number;
  text_click: number;
}

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

// ── Helpers ─────────────────────────────────────────────────────────────────

const SOURCE_COLORS: Record<string, string> = {
  'google-ads': 'bg-blue-500',
  'google': 'bg-blue-500',
  'google-organic': 'bg-green-500',
  'microsoft': 'bg-cyan-500',
  'microsoft-ads': 'bg-cyan-500',
  'bing': 'bg-cyan-500',
  'direct': 'bg-purple-500',
  'facebook': 'bg-blue-600',
};

function sourceColor(source: string) {
  return SOURCE_COLORS[source] ?? 'bg-gray-500';
}

function sourceLabel(source: string) {
  const map: Record<string, string> = {
    'google-ads': 'Google Ads',
    'google': 'Google',
    'google-organic': 'Organic Search',
    'microsoft-ads': 'Microsoft Ads',
    'microsoft': 'Microsoft Ads',
    'bing': 'Microsoft/Bing',
    'direct': 'Direct',
  };
  return map[source] ?? source.charAt(0).toUpperCase() + source.slice(1).replace(/-/g, ' ');
}

function convRate(rate: number) {
  const color = rate >= 10 ? 'text-green-600' : rate >= 5 ? 'text-yellow-600' : 'text-gray-600';
  return <span className={`text-sm font-semibold ${color}`}>{rate.toFixed(1)}%</span>;
}

function exportCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

// ── Component ────────────────────────────────────────────────────────────────

export default function WebsiteTrafficPage() {
  const { market } = useMarket();
  const { syncVersion } = useSync();

  const [dateRange, setDateRange] = useState<DateFilter>('7days');
  const [loading, setLoading] = useState(true);

  // Overview
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [leadTypes, setLeadTypes] = useState<LeadTypeBreakdown>({ phone_click: 0, form_submit: 0, text_click: 0 });

  // Traffic
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [trafficSort, setTrafficSort] = useState<keyof TrafficSource>('visitors');
  const [trafficDesc, setTrafficDesc] = useState(true);

  // Conversions
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [convFilter, setConvFilter] = useState<string>('all');

  // Pages
  const [pageData, setPageData] = useState<PagePerformance[]>([]);
  const [pageSort, setPageSort] = useState<keyof PagePerformance>('views');
  const [pageDesc, setPageDesc] = useState(true);

  useEffect(() => { fetchAll(); }, [dateRange, market]);
  useEffect(() => { if (syncVersion > 0) fetchAll(); }, [syncVersion]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [metricsRes, trafficRes, pagesRes, convDetailRes] = await Promise.all([
        fetch(`/api/admin/dashboard/metrics?period=${dateRange}&market=${market}`),
        // NOTE: /api/admin/analytics does not yet support market filtering — traffic/page data is unfiltered
        fetch(`/api/admin/analytics?metric=traffic_detail&range=${dateRange}`),
        fetch(`/api/admin/analytics?metric=page_performance&range=${dateRange}`),
        fetch(`/api/admin/analytics?metric=conversions_detail&range=${dateRange}`),
      ]);

      if (metricsRes.ok) {
        const d = await metricsRes.json();
        if (d.ok) {
          setOverview({
            total_visitors: d.traffic.visitors,
            total_page_views: d.traffic.pageViews,
            total_conversions: d.clickEvents.total,
            conversion_rate: d.traffic.visitors > 0 ? (d.clickEvents.total / d.traffic.visitors) * 100 : 0,
          });
          setLeadTypes({ phone_click: d.clickEvents.phoneClicks, form_submit: d.clickEvents.formSubmits, text_click: d.clickEvents.textClicks });
        }
      }
      if (trafficRes.ok) { const d = await trafficRes.json(); setTrafficSources(d.data || []); }
      if (pagesRes.ok) { const d = await pagesRes.json(); setPageData(d.data || []); }
      if (convDetailRes.ok) { const d = await convDetailRes.json(); setConversions(d.data || []); }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────

  const totalVisitors = overview?.total_visitors ?? trafficSources.reduce((s, t) => s + t.visitors, 0);

  const sortedTraffic = [...trafficSources].sort((a, b) => {
    const av = a[trafficSort] ?? 0; const bv = b[trafficSort] ?? 0;
    return trafficDesc ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
  });

  const sortedPages = [...pageData].sort((a, b) => {
    const av = a[pageSort] ?? 0; const bv = b[pageSort] ?? 0;
    return pageDesc ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
  });

  const filteredConversions = convFilter === 'all' ? conversions : conversions.filter(c => c.event_type === convFilter);

  const convByType = conversions.reduce((acc, c) => { acc[c.event_type] = (acc[c.event_type] || 0) + 1; return acc; }, {} as Record<string, number>);

  const convBySource = Object.entries(
    conversions.reduce((acc, c) => {
      const src = c.utm_source || 'direct';
      if (!acc[src]) acc[src] = { count: 0, sessions: new Set<string>() };
      acc[src].count += 1;
      acc[src].sessions.add(c.session_id);
      return acc;
    }, {} as Record<string, { count: number; sessions: Set<string> }>)
  ).map(([source, d]) => ({ source, conversions: d.count, sessions: d.sessions.size }))
    .sort((a, b) => b.conversions - a.conversions);

  const topEntryPages = [...pageData].sort((a, b) => b.entry_count - a.entry_count).slice(0, 5);
  const topConvPages = [...pageData].filter(d => d.conversions > 0).sort((a, b) => b.conversion_rate - a.conversion_rate).slice(0, 5);
  const highExitPages = [...pageData].filter(d => d.exit_rate > 50).sort((a, b) => b.exit_rate - a.exit_rate).slice(0, 5);

  const totalLeadTypes = leadTypes.phone_click + leadTypes.form_submit + leadTypes.text_click;
  const maxLeadType = Math.max(leadTypes.phone_click, leadTypes.form_submit, leadTypes.text_click, 1);

  function handleTrafficSort(col: keyof TrafficSource) {
    trafficSort === col ? setTrafficDesc(!trafficDesc) : (setTrafficSort(col), setTrafficDesc(true));
  }
  function handlePageSort(col: keyof PagePerformance) {
    pageSort === col ? setPageDesc(!pageDesc) : (setPageSort(col), setPageDesc(true));
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const SortTh = ({ label, col, current, desc, onSort }: { label: string; col: string; current: string; desc: boolean; onSort: (c: any) => void }) => (
    <th
      onClick={() => onSort(col)}
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3.5 h-3.5 ${current === col ? 'text-pink-600' : 'text-gray-400'}`} />
      </div>
    </th>
  );

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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Website &amp; Traffic</h1>
          <p className="text-gray-600 mt-1">Overview · Traffic Sources · Click Events · Pages</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-pink-600" />
          Showing {market === 'all' ? 'All Markets' : market === 'colorado' ? 'Denver / CO' : 'Phoenix / AZ'}
        </div>
      </div>

      <DateFilterBar
        dateFilter={dateRange}
        onFilterChange={(filter) => setDateRange(filter)}
        color="pink"
      />

      {/* Jump links */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {['overview', 'traffic', 'conversions', 'pages'].map(id => (
          <a
            key={id}
            href={`#${id}`}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700 transition-colors shadow-sm capitalize"
          >
            {id === 'overview' ? 'Overview' : id === 'traffic' ? 'Traffic Sources' : id === 'conversions' ? 'Click Events' : 'Pages'}
          </a>
        ))}
      </div>

      {/* ══ SECTION 1: OVERVIEW ══════════════════════════════════════════════ */}
      <div id="overview" className="scroll-mt-8 mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Overview</h2>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Unique Visitors', value: overview?.total_visitors?.toLocaleString() ?? '0' },
            { label: 'Page Views', value: overview?.total_page_views?.toLocaleString() ?? '0' },
            { label: 'Pages / Visit', value: overview?.total_visitors ? (overview.total_page_views / overview.total_visitors).toFixed(1) : '0' },
            { label: 'Click Events', value: overview?.total_conversions?.toLocaleString() ?? '0' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
            </div>
          ))}
          <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-xl shadow-sm p-4 text-white">
            <div className="text-sm font-medium text-pink-100 mb-1">Conv. Rate</div>
            <div className="text-2xl font-bold">{overview?.conversion_rate?.toFixed(1) ?? '0'}%</div>
          </div>
        </div>

        {/* Lead type breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Click Event Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Phone Calls', count: leadTypes.phone_click, color: 'bg-blue-500', icon: <Phone className="w-4 h-4 text-blue-600" /> },
              { label: 'Form Submits', count: leadTypes.form_submit, color: 'bg-purple-500', icon: <FileText className="w-4 h-4 text-purple-600" /> },
              { label: 'Texts', count: leadTypes.text_click, color: 'bg-green-500', icon: <MessageSquare className="w-4 h-4 text-green-600" /> },
            ].map(({ label, count, color, icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-28 text-sm text-gray-600 flex items-center gap-1.5">{icon}{label}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-7 relative">
                  <div
                    className={`${color} h-7 rounded-full flex items-center justify-end pr-3 transition-all duration-300`}
                    style={{ width: `${Math.max((count / maxLeadType) * 100, count > 0 ? 12 : 0)}%` }}
                  >
                    {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                  </div>
                </div>
                <div className="w-10 text-right text-sm text-gray-500">
                  {totalLeadTypes > 0 ? Math.round((count / totalLeadTypes) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-lg font-bold text-gray-900">{totalLeadTypes}</span>
          </div>
        </div>

        {/* Source + page conv tables (compact overview) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Top Traffic Sources</h3>
            <div className="space-y-2">
              {[...trafficSources].sort((a, b) => b.visitors - a.visitors).slice(0, 5).map((src, i) => {
                const pct = totalVisitors > 0 ? Math.round((src.visitors / totalVisitors) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-0.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${sourceColor(src.source)}`} />
                        <span className="text-gray-700">{sourceLabel(src.source)}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{src.visitors.toLocaleString()} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`${sourceColor(src.source)} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {trafficSources.length === 0 && <p className="text-sm text-gray-400">No data</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Top Converting Pages</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100 text-xs uppercase">
                  <th className="pb-2">Page</th>
                  <th className="pb-2 text-right">Views</th>
                  <th className="pb-2 text-right">Conv%</th>
                </tr>
              </thead>
              <tbody>
                {[...pageData].sort((a, b) => b.views - a.views).slice(0, 5).map((pg, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-1.5 text-gray-700 truncate max-w-[180px]" title={pg.page_path}>
                      {pg.page_path.length > 28 ? '…' + pg.page_path.slice(-25) : pg.page_path}
                    </td>
                    <td className="py-1.5 text-right text-gray-600">{pg.views.toLocaleString()}</td>
                    <td className="py-1.5 text-right">{convRate(pg.conversion_rate)}</td>
                  </tr>
                ))}
                {pageData.length === 0 && <tr><td colSpan={3} className="py-3 text-center text-gray-400">No data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ══ SECTION 2: TRAFFIC SOURCES ═══════════════════════════════════════ */}
      <div id="traffic" className="scroll-mt-8 mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Traffic Sources</h2>
          <button
            onClick={() => exportCSV(
              ['Source', 'Medium', 'Campaign', 'Visitors', 'Page Views', 'Conversions', 'Conv Rate'],
              sortedTraffic.map(d => [d.source, d.medium ?? '', d.campaign ?? '', d.visitors, d.page_views, d.conversions, `${d.conversion_rate.toFixed(2)}%`]),
              `traffic-sources-${dateRange}.csv`
            )}
            className="flex items-center gap-2 px-3 py-1.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Total Visitors', value: trafficSources.reduce((s, d) => s + d.visitors, 0).toLocaleString(), border: 'border-blue-500' },
            { label: 'Page Views', value: trafficSources.reduce((s, d) => s + d.page_views, 0).toLocaleString(), border: 'border-green-500' },
            { label: 'Conversions', value: trafficSources.reduce((s, d) => s + d.conversions, 0).toLocaleString(), border: 'border-pink-500' },
            { label: 'Avg Conv Rate', value: (() => { const tv = trafficSources.reduce((s, d) => s + d.visitors, 0); const tc = trafficSources.reduce((s, d) => s + d.conversions, 0); return tv > 0 ? `${((tc / tv) * 100).toFixed(1)}%` : '0%'; })(), border: 'border-orange-500' },
          ].map(({ label, value, border }) => (
            <div key={label} className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${border}`}>
              <div className="text-sm text-gray-600 mb-1">{label}</div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortTh label="Source" col="source" current={trafficSort} desc={trafficDesc} onSort={handleTrafficSort} />
                  <SortTh label="Visitors" col="visitors" current={trafficSort} desc={trafficDesc} onSort={handleTrafficSort} />
                  <SortTh label="Page Views" col="page_views" current={trafficSort} desc={trafficDesc} onSort={handleTrafficSort} />
                  <SortTh label="Conversions" col="conversions" current={trafficSort} desc={trafficDesc} onSort={handleTrafficSort} />
                  <SortTh label="Conv Rate" col="conversion_rate" current={trafficSort} desc={trafficDesc} onSort={handleTrafficSort} />
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedTraffic.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No traffic data for this period</td></tr>
                ) : sortedTraffic.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${sourceColor(item.source)} flex items-center justify-center text-white text-xs font-bold`}>
                          {item.source.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{sourceLabel(item.source)}</div>
                          {item.medium && <div className="text-xs text-gray-400">{item.medium}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">{item.visitors.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">{totalVisitors > 0 ? ((item.visitors / totalVisitors) * 100).toFixed(1) : 0}%</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{item.page_views.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">{item.visitors > 0 ? (item.page_views / item.visitors).toFixed(1) : 0}/visit</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">{item.conversions}</td>
                    <td className="px-4 py-3">{convRate(item.conversion_rate)}</td>
                    <td className="px-4 py-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-pink-600 to-blue-600 h-2 rounded-full" style={{ width: `${Math.min((item.conversion_rate / 20) * 100, 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ══ SECTION 3: CONVERSIONS ════════════════════════════════════════════ */}
      <div id="conversions" className="scroll-mt-8 mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Click Events</h2>
          <div className="flex items-center gap-3">
            <select
              value={convFilter}
              onChange={e => setConvFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none"
            >
              <option value="all">All Types</option>
              <option value="phone_click">Phone Calls</option>
              <option value="text_click">Text Messages</option>
              <option value="form_submit">Form Submissions</option>
            </select>
            <button
              onClick={() => exportCSV(
                ['Date', 'Time', 'Type', 'Location', 'Page', 'Source', 'Medium', 'Campaign'],
                filteredConversions.map(c => [
                  new Date(c.created_at).toLocaleDateString(),
                  new Date(c.created_at).toLocaleTimeString(),
                  c.event_type, c.button_location, c.page_path,
                  c.utm_source ?? 'direct', c.utm_medium ?? '', c.utm_campaign ?? '',
                ]),
                `conversions-${dateRange}.csv`
              )}
              className="flex items-center gap-2 px-3 py-1.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: conversions.length, border: 'border-pink-500' },
            { label: 'Phone Calls', value: convByType.phone_click ?? 0, border: 'border-blue-500' },
            { label: 'Texts', value: convByType.text_click ?? 0, border: 'border-green-500' },
            { label: 'Forms', value: convByType.form_submit ?? 0, border: 'border-orange-500' },
          ].map(({ label, value, border }) => (
            <div key={label} className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${border}`}>
              <div className="text-sm text-gray-600 mb-1">{label}</div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              {label !== 'Total' && conversions.length > 0 && (
                <div className="text-xs text-gray-400 mt-1">{((value as number) / conversions.length * 100).toFixed(1)}% of total</div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* By source */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">By Source</h3>
            <div className="space-y-3">
              {convBySource.length === 0 ? (
                <p className="text-sm text-gray-400">No source data</p>
              ) : convBySource.map(stat => (
                <div key={stat.source} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-md ${sourceColor(stat.source)} flex items-center justify-center text-white text-xs font-bold`}>
                      {stat.source.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 capitalize">{stat.source}</div>
                      <div className="text-xs text-gray-400">{stat.sessions} sessions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{stat.conversions}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent conversions */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Recent Click Events</h3>
              <p className="text-xs text-gray-400 mt-0.5">{filteredConversions.length} shown</p>
            </div>
            <div className="overflow-y-auto max-h-80">
              {filteredConversions.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No click events for this period</div>
              ) : filteredConversions.map(c => {
                const typeColor = c.event_type === 'phone_click' ? 'bg-blue-500' : c.event_type === 'text_click' ? 'bg-green-500' : 'bg-pink-500';
                const typeIcon = c.event_type === 'phone_click' ? <Phone className="w-4 h-4" /> : c.event_type === 'text_click' ? <MessageSquare className="w-4 h-4" /> : <FileText className="w-4 h-4" />;
                return (
                  <div key={c.id} className="px-5 py-3 hover:bg-gray-50 border-b border-gray-100 flex items-start gap-3">
                    <div className={`${typeColor} text-white p-2 rounded-lg flex-shrink-0`}>{typeIcon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 capitalize">{c.event_type.replace('_', ' ')}</div>
                      <div className="text-xs text-gray-500">{c.page_path} · {c.button_location}</div>
                      {c.utm_source && <div className="text-xs text-gray-400">{c.utm_source}{c.utm_medium && ` / ${c.utm_medium}`}</div>}
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0 text-right">
                      <div>{new Date(c.created_at).toLocaleDateString()}</div>
                      <div>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══ SECTION 4: PAGES ══════════════════════════════════════════════════ */}
      <div id="pages" className="scroll-mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Pages</h2>
          <button
            onClick={() => exportCSV(
              ['Page', 'Views', 'Unique Visitors', 'Conversions', 'Conv Rate', 'Entries', 'Exits', 'Exit Rate'],
              sortedPages.map(d => [d.page_path, d.views, d.unique_visitors, d.conversions, `${d.conversion_rate.toFixed(2)}%`, d.entry_count, d.exit_count, `${d.exit_rate.toFixed(2)}%`]),
              `pages-${dateRange}.csv`
            )}
            className="flex items-center gap-2 px-3 py-1.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Total Views', value: pageData.reduce((s, d) => s + d.views, 0).toLocaleString(), border: 'border-blue-500' },
            { label: 'Pages Tracked', value: pageData.length, border: 'border-green-500' },
            { label: 'Conversions', value: pageData.reduce((s, d) => s + d.conversions, 0), border: 'border-pink-500' },
            { label: 'Avg Exit Rate', value: pageData.length > 0 ? `${(pageData.reduce((s, d) => s + d.exit_rate, 0) / pageData.length).toFixed(1)}%` : '0%', border: 'border-orange-500' },
          ].map(({ label, value, border }) => (
            <div key={label} className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${border}`}>
              <div className="text-sm text-gray-600 mb-1">{label}</div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
            </div>
          ))}
        </div>

        {/* Full page table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortTh label="Page" col="page_path" current={pageSort} desc={pageDesc} onSort={handlePageSort} />
                  <SortTh label="Views" col="views" current={pageSort} desc={pageDesc} onSort={handlePageSort} />
                  <SortTh label="Unique" col="unique_visitors" current={pageSort} desc={pageDesc} onSort={handlePageSort} />
                  <SortTh label="Conversions" col="conversions" current={pageSort} desc={pageDesc} onSort={handlePageSort} />
                  <SortTh label="Conv Rate" col="conversion_rate" current={pageSort} desc={pageDesc} onSort={handlePageSort} />
                  <SortTh label="Entries" col="entry_count" current={pageSort} desc={pageDesc} onSort={handlePageSort} />
                  <SortTh label="Exit Rate" col="exit_rate" current={pageSort} desc={pageDesc} onSort={handlePageSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedPages.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No page data for this period</td></tr>
                ) : sortedPages.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-gray-900">{item.page_path}</span>
                        <a href={item.page_path} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-pink-500">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">{item.views.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">{pageData.reduce((s, d) => s + d.views, 0) > 0 ? ((item.views / pageData.reduce((s, d) => s + d.views, 0)) * 100).toFixed(1) : 0}%</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.unique_visitors}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">{item.conversions}</td>
                    <td className="px-4 py-3">{convRate(item.conversion_rate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        {item.entry_count}
                        {item.entry_count > 0 && <TrendingUp className="w-3.5 h-3.5 text-green-500" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${item.exit_rate >= 70 ? 'text-red-600' : item.exit_rate >= 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {item.exit_rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Page insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            { title: '🚪 Top Entry Pages', items: topEntryPages, valueKey: 'entry_count' as const, valueColor: 'text-gray-900' },
            { title: '⭐ Best Converting', items: topConvPages, valueKey: 'conversion_rate' as const, valueColor: 'text-green-600', suffix: '%' },
            { title: '⚠️ High Exit Rate', items: highExitPages, valueKey: 'exit_rate' as const, valueColor: 'text-red-600', suffix: '%' },
          ].map(({ title, items, valueKey, valueColor, suffix }) => (
            <div key={title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
              {items.length === 0 ? (
                <p className="text-sm text-gray-400">No data</p>
              ) : (
                <div className="space-y-2">
                  {items.map((pg, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="text-xs text-gray-600 truncate flex-1">{pg.page_path}</div>
                      <div className={`text-sm font-semibold ${valueColor} ml-2 flex-shrink-0`}>
                        {suffix ? (pg[valueKey] as number).toFixed(1) + suffix : pg[valueKey]}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
