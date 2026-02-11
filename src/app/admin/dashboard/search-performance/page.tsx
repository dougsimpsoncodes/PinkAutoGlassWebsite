'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import DateFilterBar, { DateFilter } from '@/components/admin/DateFilterBar';
import { useSync } from '@/contexts/SyncContext';
import { Download, ArrowUpDown, AlertTriangle, TrendingUp, Lightbulb, Target, DollarSign } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────

interface SearchTerm {
  search_term: string;
  sources: string[];
  google_impressions: number;
  google_clicks: number;
  google_cost: number;
  google_conversions: number;
  google_campaigns: string[];
  microsoft_impressions: number;
  microsoft_clicks: number;
  microsoft_cost: number;
  microsoft_conversions: number;
  microsoft_campaigns: string[];
  organic_impressions: number;
  organic_clicks: number;
  organic_position: number;
  organic_pages: string[];
  total_impressions: number;
  total_clicks: number;
  total_cost: number;
  calls: number;
  quotes: number;
  texts: number;
  total_leads: number;
  cost_per_lead: number;
}

interface PlatformSummary {
  impressions: number;
  clicks: number;
  cost?: number;
  conversions?: number;
  leads: number;
  ctr: number;
  costPerLead?: number;
}

interface Insight {
  type: 'overlap' | 'coverage_gap' | 'platform_arbitrage' | 'waste' | 'top_performer';
  severity: 'high' | 'medium' | 'low';
  search_term: string;
  recommendation: string;
  data: Record<string, any>;
}

interface SearchPerformanceData {
  dateRange: { from: string; to: string; days: number };
  summary: {
    totalTerms: number;
    google: PlatformSummary;
    microsoft: PlatformSummary;
    organic: PlatformSummary;
    combined: { impressions: number; clicks: number; cost: number; leads: number };
  };
  insights: Insight[];
  data: SearchTerm[];
}

type SortKey = 'impressions' | 'clicks' | 'cost' | 'leads' | 'cost_per_lead' | 'position';
type SortDir = 'asc' | 'desc';

// ─── Component ───────────────────────────────────────────

export default function SearchPerformancePage() {
  const { syncVersion } = useSync();

  const [dataCache, setDataCache] = useState<Record<DateFilter, SearchPerformanceData | null>>({
    today: null, yesterday: null, '7days': null, '30days': null, all: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'google' | 'microsoft' | 'organic'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('impressions');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showInsights, setShowInsights] = useState(true);

  const data = dataCache[dateFilter];
  const hasAnyCachedData = Object.values(dataCache).some(d => d !== null);

  const getDateRangeDays = (filter: DateFilter): number => {
    switch (filter) {
      case 'today': return 0;
      case 'yesterday': return 1;
      case '7days': return 7;
      case '30days': return 30;
      case 'all': return 365;
      default: return 30;
    }
  };

  const getDateRangeDisplay = (): string => {
    if (data?.dateRange) {
      if (dateFilter === 'today') return data.dateRange.to;
      if (dateFilter === 'yesterday') return data.dateRange.from;
      return `${data.dateRange.from} to ${data.dateRange.to}`;
    }
    return '';
  };

  const fetchData = useCallback(async (filter: DateFilter) => {
    try {
      const days = getDateRangeDays(filter);
      const response = await fetch(`/api/admin/dashboard/search-performance?days=${days}&minImpressions=5`);
      if (!response.ok) throw new Error('Failed to fetch search performance data');
      const result = await response.json();
      setDataCache(prev => ({ ...prev, [filter]: result }));
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);

  // Sync refresh
  useEffect(() => {
    if (syncVersion > 0) {
      setDataCache({ today: null, yesterday: null, '7days': null, '30days': null, all: null });
      fetchData(dateFilter);
    }
  }, [syncVersion]);

  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
    if (!dataCache[filter]) {
      setLoading(true);
      fetchData(filter).finally(() => setLoading(false));
    }
  };

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchData(dateFilter).finally(() => setLoading(false));
  }, []);

  // ─── Sort and filter data ───
  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    let filtered = data.data;

    if (sourceFilter !== 'all') {
      const sourceMap: Record<string, string> = {
        google: 'G-Paid',
        microsoft: 'M-Paid',
        organic: 'Organic',
      };
      filtered = filtered.filter(t => t.sources.includes(sourceMap[sourceFilter]));
    }

    return [...filtered].sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortKey) {
        case 'impressions': aVal = a.total_impressions; bVal = b.total_impressions; break;
        case 'clicks': aVal = a.total_clicks; bVal = b.total_clicks; break;
        case 'cost': aVal = a.total_cost; bVal = b.total_cost; break;
        case 'leads': aVal = a.total_leads; bVal = b.total_leads; break;
        case 'cost_per_lead': aVal = a.cost_per_lead; bVal = b.cost_per_lead; break;
        case 'position': aVal = a.organic_position || 999; bVal = b.organic_position || 999; break;
        default: aVal = a.total_impressions; bVal = b.total_impressions;
      }
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [data, sourceFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  // ─── CSV Export ───
  const exportCSV = () => {
    if (!filteredData.length) return;
    const headers = ['Search Term', 'Sources', 'Total Impressions', 'Total Clicks', 'Total Cost',
      'Google Imp', 'Google Clicks', 'Google Cost', 'Microsoft Imp', 'Microsoft Clicks', 'Microsoft Cost',
      'Organic Imp', 'Organic Clicks', 'Organic Position', 'Calls', 'Quotes', 'Texts', 'Total Leads', 'Cost/Lead'];
    const rows = filteredData.map(t => [
      `"${t.search_term}"`, t.sources.join('+'), t.total_impressions, t.total_clicks, t.total_cost,
      t.google_impressions, t.google_clicks, t.google_cost,
      t.microsoft_impressions, t.microsoft_clicks, t.microsoft_cost,
      t.organic_impressions, t.organic_clicks, t.organic_position || '',
      t.calls, t.quotes, t.texts, t.total_leads, t.cost_per_lead,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-performance-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Loading states ───
  if (loading && !hasAnyCachedData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading search performance...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !data) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">Error: {error}</div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { summary, insights } = data;

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Search Performance</h1>
          <p className="text-gray-600 mt-1">Google Paid + Microsoft Paid + Organic — unified search command center</p>
        </div>

        {/* Date Filter */}
        <DateFilterBar
          dateFilter={dateFilter}
          onFilterChange={handleDateFilterChange}
          dateDisplay={getDateRangeDisplay()}
          color="cyan"
        />

        {/* Section 1: Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Google Paid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h3 className="font-semibold text-gray-900">Google Paid</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Impressions</div>
                <div className="text-lg font-bold">{summary.google.impressions.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Clicks</div>
                <div className="text-lg font-bold">{summary.google.clicks.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Spend</div>
                <div className="text-lg font-bold">${summary.google.cost?.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Leads</div>
                <div className="text-lg font-bold">{summary.google.leads}</div>
              </div>
              <div>
                <div className="text-gray-500">CTR</div>
                <div className="font-semibold">{summary.google.ctr}%</div>
              </div>
              <div>
                <div className="text-gray-500">Cost/Lead</div>
                <div className="font-semibold">${summary.google.costPerLead?.toFixed(2) || '0.00'}</div>
              </div>
            </div>
          </div>

          {/* Microsoft Paid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              <h3 className="font-semibold text-gray-900">Microsoft Paid</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Impressions</div>
                <div className="text-lg font-bold">{summary.microsoft.impressions.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Clicks</div>
                <div className="text-lg font-bold">{summary.microsoft.clicks.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Spend</div>
                <div className="text-lg font-bold">${summary.microsoft.cost?.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Leads</div>
                <div className="text-lg font-bold">{summary.microsoft.leads}</div>
              </div>
              <div>
                <div className="text-gray-500">CTR</div>
                <div className="font-semibold">{summary.microsoft.ctr}%</div>
              </div>
              <div>
                <div className="text-gray-500">Cost/Lead</div>
                <div className="font-semibold">${summary.microsoft.costPerLead?.toFixed(2) || '0.00'}</div>
              </div>
            </div>
          </div>

          {/* Organic */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <h3 className="font-semibold text-gray-900">Google Organic</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Impressions</div>
                <div className="text-lg font-bold">{summary.organic.impressions.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Clicks</div>
                <div className="text-lg font-bold">{summary.organic.clicks.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">CTR</div>
                <div className="text-lg font-bold">{summary.organic.ctr}%</div>
              </div>
              <div>
                <div className="text-gray-500">Leads</div>
                <div className="text-lg font-bold text-green-600">{summary.organic.leads}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Combined Totals Row */}
        <div className="bg-gray-900 text-white rounded-xl p-4 flex items-center justify-between text-sm">
          <span className="font-semibold">Combined Totals</span>
          <div className="flex gap-6">
            <div><span className="text-gray-400">Impressions</span> <span className="font-bold ml-1">{summary.combined.impressions.toLocaleString()}</span></div>
            <div><span className="text-gray-400">Clicks</span> <span className="font-bold ml-1">{summary.combined.clicks.toLocaleString()}</span></div>
            <div><span className="text-gray-400">Spend</span> <span className="font-bold ml-1">${summary.combined.cost.toLocaleString()}</span></div>
            <div><span className="text-gray-400">Leads</span> <span className="font-bold ml-1">{summary.combined.leads}</span></div>
            <div>
              <span className="text-gray-400">Cost/Lead</span>
              <span className="font-bold ml-1">
                ${summary.combined.leads > 0 ? (summary.combined.cost / summary.combined.leads).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Actionable Insights */}
        {insights.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="w-full px-6 py-4 border-b border-gray-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-900">Actionable Insights</h3>
                <span className="text-sm text-gray-500">({insights.length})</span>
              </div>
              <span className="text-gray-400 text-sm">{showInsights ? 'Hide' : 'Show'}</span>
            </button>
            {showInsights && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {insights.slice(0, 10).map((insight, idx) => (
                  <InsightCard key={idx} insight={insight} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section 2: Unified Search Terms Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Search Terms</h3>
              <p className="text-sm text-gray-500">{filteredData.length} terms shown</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              >
                <option value="all">All Sources</option>
                <option value="google">Google Paid</option>
                <option value="microsoft">Microsoft Paid</option>
                <option value="organic">Organic</option>
              </select>
              {/* Export CSV */}
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-2 font-semibold text-gray-700 min-w-[200px]">Search Term</th>
                  <th className="text-center p-2 font-semibold text-gray-700">Sources</th>
                  <SortHeader label="Impressions" sortKey="impressions" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Clicks" sortKey="clicks" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Cost" sortKey="cost" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Leads" sortKey="leads" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Cost/Lead" sortKey="cost_per_lead" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Org Position" sortKey="position" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.slice(0, 100).map((term, idx) => (
                  <tr key={idx} className={`hover:bg-gray-50 ${term.sources.length > 1 ? 'bg-amber-50/30' : ''}`}>
                    <td className="p-2">
                      <div className="font-medium text-gray-900 max-w-xs truncate">{term.search_term}</div>
                      {/* Show campaign names on hover/expand if needed */}
                      {(term.google_campaigns.length > 0 || term.microsoft_campaigns.length > 0) && (
                        <div className="text-[10px] text-gray-400 truncate mt-0.5">
                          {[...term.google_campaigns, ...term.microsoft_campaigns].slice(0, 2).join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex gap-0.5 justify-center flex-wrap">
                        {term.sources.includes('G-Paid') && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">G</span>
                        )}
                        {term.sources.includes('M-Paid') && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800">M</span>
                        )}
                        {term.sources.includes('Organic') && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-800">O</span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 text-right text-gray-900">
                      <div>{term.total_impressions.toLocaleString()}</div>
                      {term.sources.length > 1 && (
                        <div className="text-[10px] text-gray-400">
                          {term.google_impressions > 0 && <span>G:{term.google_impressions.toLocaleString()} </span>}
                          {term.microsoft_impressions > 0 && <span>M:{term.microsoft_impressions.toLocaleString()} </span>}
                          {term.organic_impressions > 0 && <span>O:{term.organic_impressions.toLocaleString()}</span>}
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-right text-gray-900">{term.total_clicks.toLocaleString()}</td>
                    <td className="p-2 text-right text-gray-900">
                      {term.total_cost > 0 ? (
                        <div>
                          ${term.total_cost.toFixed(2)}
                          {term.google_cost > 0 && term.microsoft_cost > 0 && (
                            <div className="text-[10px] text-gray-400">
                              G:${term.google_cost.toFixed(2)} M:${term.microsoft_cost.toFixed(2)}
                            </div>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-2 text-right">
                      {term.total_leads > 0 ? (
                        <div>
                          <span className="font-semibold text-gray-900">{term.total_leads}</span>
                          <div className="flex gap-0.5 justify-end mt-0.5">
                            {term.calls > 0 && <span className="text-[10px] text-blue-600">C:{term.calls}</span>}
                            {term.quotes > 0 && <span className="text-[10px] text-yellow-600">Q:{term.quotes}</span>}
                            {term.texts > 0 && <span className="text-[10px] text-green-600">T:{term.texts}</span>}
                          </div>
                        </div>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="p-2 text-right">
                      {term.cost_per_lead > 0 ? (
                        <span className={`font-semibold ${
                          term.cost_per_lead > 50 ? 'text-red-600' :
                          term.cost_per_lead > 30 ? 'text-orange-500' :
                          'text-green-600'
                        }`}>
                          ${term.cost_per_lead.toFixed(2)}
                        </span>
                      ) : term.total_leads > 0 && term.total_cost === 0 ? (
                        <span className="font-semibold text-green-600">Free</span>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="p-2 text-right">
                      {term.organic_position > 0 ? (
                        <span className={`font-semibold ${
                          term.organic_position <= 3 ? 'text-green-600' :
                          term.organic_position <= 10 ? 'text-blue-600' :
                          'text-gray-600'
                        }`}>
                          #{term.organic_position.toFixed(1)}
                        </span>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredData.length > 100 && (
            <div className="text-center py-3 text-sm text-gray-500 border-t border-gray-200">
              Showing 100 of {filteredData.length} terms. Use filters or export CSV for full data.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Sub-components ──────────────────────────────────────

function SortHeader({ label, sortKey, currentKey, dir, onSort }: {
  label: string; sortKey: SortKey; currentKey: SortKey; dir: SortDir; onSort: (k: SortKey) => void;
}) {
  const isActive = sortKey === currentKey;
  return (
    <th
      className="text-right p-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center justify-end gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${isActive ? 'text-cyan-600' : 'text-gray-400'}`} />
        {isActive && <span className="text-[9px] text-cyan-600">{dir === 'desc' ? 'v' : '^'}</span>}
      </div>
    </th>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const config: Record<string, { icon: React.ReactNode; bgColor: string; borderColor: string; label: string }> = {
    waste: {
      icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
      bgColor: 'bg-red-50', borderColor: 'border-red-200', label: 'Waste',
    },
    top_performer: {
      icon: <TrendingUp className="w-4 h-4 text-green-600" />,
      bgColor: 'bg-green-50', borderColor: 'border-green-200', label: 'Top Performer',
    },
    platform_arbitrage: {
      icon: <DollarSign className="w-4 h-4 text-purple-600" />,
      bgColor: 'bg-purple-50', borderColor: 'border-purple-200', label: 'Arbitrage',
    },
    overlap: {
      icon: <Target className="w-4 h-4 text-amber-600" />,
      bgColor: 'bg-amber-50', borderColor: 'border-amber-200', label: 'Overlap',
    },
    coverage_gap: {
      icon: <Lightbulb className="w-4 h-4 text-blue-600" />,
      bgColor: 'bg-blue-50', borderColor: 'border-blue-200', label: 'Gap',
    },
  };

  const c = config[insight.type] || config.waste;
  const sevColor = insight.severity === 'high' ? 'text-red-600' : insight.severity === 'medium' ? 'text-amber-600' : 'text-gray-500';

  return (
    <div className={`${c.bgColor} border ${c.borderColor} rounded-lg p-3`}>
      <div className="flex items-start gap-2">
        {c.icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-gray-700">{c.label}</span>
            <span className={`text-[10px] font-medium ${sevColor} uppercase`}>{insight.severity}</span>
          </div>
          <div className="text-xs font-medium text-gray-900 truncate">{insight.search_term}</div>
          <div className="text-xs text-gray-600 mt-1">{insight.recommendation}</div>
        </div>
      </div>
    </div>
  );
}
