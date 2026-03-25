'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import DateFilterBar, { DateFilter } from '@/components/admin/DateFilterBar';
import { useMarket, type MarketFilter } from '@/contexts/MarketContext';
import { useSync } from '@/contexts/SyncContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Globe,
  TrendingUp,
  MousePointerClick,
  Eye,
  Target,
  Users,
  AlertTriangle,
  ExternalLink,
  MapPin,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DailyRow {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface DomainData {
  domain: string;
  label: string;
  color: string;
  utmSource: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  leads: number;
  daily: DailyRow[];
  gscError?: string;
}

interface SatelliteApiResponse {
  domains: DomainData[];
  dateRange: { startDate: string; endDate: string };
}

type ChartMetric = 'clicks' | 'impressions' | 'ctr' | 'position';
type SatelliteDomainMarket = 'colorado' | 'arizona' | 'national';
type InsightDomain = DomainData & {
  conversionRate: number;
  leadShare: number;
  market: SatelliteDomainMarket;
};

const SATELLITE_DOMAINS = [
  { domain: 'windshieldcostcalculator.com', utmSource: 'windshieldcostcalculator', market: 'colorado' },
  { domain: 'windshielddenver.com', utmSource: 'windshielddenver', market: 'colorado' },
  { domain: 'windshieldchiprepairdenver.com', utmSource: 'chiprepairdenver', market: 'colorado' },
  { domain: 'windshieldchiprepairboulder.com', utmSource: 'chiprepairboulder', market: 'colorado' },
  { domain: 'aurorawindshield.com', utmSource: 'aurorawindshield', market: 'colorado' },
  { domain: 'mobilewindshielddenver.com', utmSource: 'mobilewindshielddenver', market: 'colorado' },
  { domain: 'cheapestwindshieldnearme.com', utmSource: 'cheapestwindshield', market: 'colorado' },
  { domain: 'newwindshieldcost.com', utmSource: 'newwindshieldcost', market: 'colorado' },
  { domain: 'getawindshieldquote.com', utmSource: 'getawindshieldquote', market: 'colorado' },
  { domain: 'newwindshieldnearme.com', utmSource: 'newwindshieldnearme', market: 'colorado' },
  { domain: 'windshieldpricecompare.com', utmSource: 'windshieldpricecompare', market: 'colorado' },
  { domain: 'windshieldchiprepairmesa.com', utmSource: 'chiprepairmesa', market: 'arizona' },
  { domain: 'windshieldchiprepairphoenix.com', utmSource: 'chiprepairphoenix', market: 'arizona' },
  { domain: 'windshieldchiprepairscottsdale.com', utmSource: 'chiprepairscottsdale', market: 'arizona' },
  { domain: 'windshieldchiprepairtempe.com', utmSource: 'chiprepairtempe', market: 'arizona' },
  { domain: 'windshieldcostphoenix.com', utmSource: 'windshieldcostphoenix', market: 'arizona' },
  { domain: 'mobilewindshieldphoenix.com', utmSource: 'mobilewindshieldphoenix', market: 'arizona' },
  { domain: 'carwindshieldprices.com', utmSource: 'carwindshieldprices', market: 'national' },
  { domain: 'windshieldrepairprices.com', utmSource: 'windshieldrepairprices', market: 'national' },
  { domain: 'carglassprices.com', utmSource: 'carglassprices', market: 'national' },
  { domain: 'coloradospringswindshield.com', utmSource: 'coloradospringswindshield', market: 'colorado' },
  { domain: 'autoglasscoloradosprings.com', utmSource: 'autoglasscoloradosprings', market: 'colorado' },
  { domain: 'mobilewindshieldcoloradosprings.com', utmSource: 'mobilewindshieldcoloradosprings', market: 'colorado' },
  { domain: 'windshieldreplacementfortcollins.com', utmSource: 'windshieldreplacementfortcollins', market: 'colorado' },
] as const;

const SATELLITE_DOMAIN_MARKET_MAP = new Map<string, SatelliteDomainMarket>(
  SATELLITE_DOMAINS.map((domain) => [domain.utmSource, domain.market])
);

function getVisibleSatelliteMarkets(market: MarketFilter): Set<SatelliteDomainMarket> {
  if (market === 'all') {
    return new Set(['colorado', 'arizona', 'national']);
  }

  return new Set([market, 'national']);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateRange(filter: DateFilter): { startDate: string; endDate: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const today = fmt(now);

  switch (filter) {
    case 'today': {
      return { startDate: today, endDate: today };
    }
    case 'yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = fmt(y);
      return { startDate: yStr, endDate: yStr };
    }
    case '7days': {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { startDate: fmt(start), endDate: today };
    }
    case '30days': {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return { startDate: fmt(start), endDate: today };
    }
    case 'all': {
      return { startDate: '2020-01-01', endDate: today };
    }
    default:
      return { startDate: today, endDate: today };
  }
}

function formatCtr(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

function formatPosition(value: number): string {
  return value.toFixed(1);
}

function formatDate(dateStr: string): string {
  // dateStr is YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return dateStr;
}

// ─── Build chart data ─────────────────────────────────────────────────────────

function buildChartData(
  domains: DomainData[],
  metric: ChartMetric
): Array<Record<string, number | string>> {
  // Collect all unique dates across selected domains
  const dateSet = new Set<string>();
  for (const d of domains) {
    for (const row of d.daily) {
      dateSet.add(row.date);
    }
  }
  const allDates = Array.from(dateSet).sort();

  return allDates.map((date) => {
    const entry: Record<string, number | string> = { date };
    for (const d of domains) {
      const row = d.daily.find((r) => r.date === date);
      entry[d.utmSource] = row ? row[metric] : 0;
    }
    return entry;
  });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function SatelliteDomainsPage() {
  const { market } = useMarket();
  const { syncVersion } = useSync();

  const [dataCache, setDataCache] = useState<Record<DateFilter, SatelliteApiResponse | null>>({
    today: null,
    yesterday: null,
    '7days': null,
    '30days': null,
    all: null,
  });
  const [dateFilter, setDateFilter] = useState<DateFilter>('7days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chart state
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('clicks');
  const [selectedDomainKeys, setSelectedDomainKeys] = useState<Set<string> | null>(null); // null = all

  const data = dataCache[dateFilter];
  const hasAnyCachedData = Object.values(dataCache).some((d) => d !== null);
  const filteredDomains = useMemo(() => {
    if (!data) return [];

    const allowedMarkets = getVisibleSatelliteMarkets(market);

    return data.domains.filter((domain) => {
      const domainMarket = SATELLITE_DOMAIN_MARKET_MAP.get(domain.utmSource);
      return domainMarket ? allowedMarkets.has(domainMarket) : false;
    });
  }, [data, market]);

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async (filter: DateFilter) => {
    try {
      const { startDate, endDate } = getDateRange(filter);
      const res = await fetch(
        `/api/admin/satellite-domains?startDate=${startDate}&endDate=${endDate}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      const result: SatelliteApiResponse = await res.json();
      setDataCache((prev) => ({ ...prev, [filter]: result }));
      setError(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch satellite domain data');
      return null;
    }
  }, []);

  // Sync refresh
  useEffect(() => {
    if (syncVersion > 0) {
      setDataCache({ today: null, yesterday: null, '7days': null, '30days': null, all: null });
      setLoading(true);
      fetchData(dateFilter).finally(() => setLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncVersion]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchData(dateFilter).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
    if (!dataCache[filter]) {
      setLoading(true);
      fetchData(filter).finally(() => setLoading(false));
    }
  };

  // ── Sorted domains ──────────────────────────────────────────────────────────

  const sortedDomains = useMemo<InsightDomain[]>(() => {
    const totalLeads = filteredDomains.reduce((s, d) => s + d.leads, 0);
    const withRates = filteredDomains.map((d) => ({
      ...d,
      conversionRate: d.clicks > 0 ? d.leads / d.clicks : 0,
      leadShare: totalLeads > 0 ? d.leads / totalLeads : 0,
      market: SATELLITE_DOMAIN_MARKET_MAP.get(d.utmSource) ?? 'national',
    }));
    return [...withRates].sort((a, b) => b.impressions - a.impressions);
  }, [filteredDomains]);

  // ── Summary totals ──────────────────────────────────────────────────────────

  const totals = useMemo(() => {
    const domains = filteredDomains;
    const totalClicks = domains.reduce((s, d) => s + d.clicks, 0);
    const totalImpressions = domains.reduce((s, d) => s + d.impressions, 0);
    const totalLeads = domains.reduce((s, d) => s + d.leads, 0);

    // Weighted average CTR
    const weightedCtr =
      totalImpressions > 0
        ? domains.reduce((s, d) => s + d.ctr * d.impressions, 0) / totalImpressions
        : 0;

    // Weighted average position (weighted by impressions, only domains with data)
    const domainsWithPosition = domains.filter((d) => d.position > 0 && d.impressions > 0);
    const positionImpressions = domainsWithPosition.reduce((s, d) => s + d.impressions, 0);
    const weightedPosition =
      positionImpressions > 0
        ? domainsWithPosition.reduce((s, d) => s + d.position * d.impressions, 0) /
          positionImpressions
        : 0;

    return {
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: weightedCtr,
      position: weightedPosition,
      leads: totalLeads,
    };
  }, [filteredDomains]);

  const totalConversionRate = totals.clicks > 0 ? totals.leads / totals.clicks : 0;

  // ── Insights ────────────────────────────────────────────────────────────────

  const topLeads = useMemo(() => {
    return [...sortedDomains].sort((a, b) => b.leads - a.leads).slice(0, 3);
  }, [sortedDomains]);

  const topConversion = useMemo(() => {
    return [...sortedDomains]
      .filter((d) => d.clicks >= 10)
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 3);
  }, [sortedDomains]);

  const lowCtr = useMemo(() => {
    return [...sortedDomains]
      .filter((d) => d.impressions >= 250)
      .sort((a, b) => a.ctr - b.ctr)
      .slice(0, 3);
  }, [sortedDomains]);

  const lowConversion = useMemo(() => {
    return [...sortedDomains]
      .filter((d) => d.clicks >= 25)
      .sort((a, b) => a.conversionRate - b.conversionRate)
      .slice(0, 3);
  }, [sortedDomains]);

  // ── Chart domains (filtered to selected) ────────────────────────────────────

  const effectiveSelectedDomainKeys = useMemo(() => {
    if (selectedDomainKeys === null) return null;

    const visibleDomainKeys = new Set(filteredDomains.map((domain) => domain.utmSource));
    const overlappingKeys = [...selectedDomainKeys].filter((key) => visibleDomainKeys.has(key));

    if (overlappingKeys.length === 0) {
      return selectedDomainKeys.size === 0 ? new Set<string>() : null;
    }

    return new Set(overlappingKeys);
  }, [filteredDomains, selectedDomainKeys]);

  const chartDomains = useMemo(() => {
    if (effectiveSelectedDomainKeys === null) return filteredDomains;
    return filteredDomains.filter((d) => effectiveSelectedDomainKeys.has(d.utmSource));
  }, [effectiveSelectedDomainKeys, filteredDomains]);

  const chartData = useMemo(
    () => buildChartData(chartDomains, selectedMetric),
    [chartDomains, selectedMetric]
  );

  const allNoData = useMemo(
    () => filteredDomains.length > 0 && filteredDomains.every((d) => d.clicks === 0 && d.impressions === 0),
    [filteredDomains]
  );

  // ── Toggle domain selection ─────────────────────────────────────────────────

  const toggleDomain = (utmSource: string) => {
    setSelectedDomainKeys((prev) => {
      const all = filteredDomains.map((d) => d.utmSource);
      const current =
        prev === null
          ? new Set(all)
          : new Set(prev.size === 0 ? [] : [...prev].filter((key) => all.includes(key)));
      const next = new Set(current);
      if (next.has(utmSource)) {
        next.delete(utmSource);
      } else {
        next.add(utmSource);
      }

      if (next.size === all.length) {
        return null;
      }

      return next;
    });
  };

  const selectAll = () => {
    setSelectedDomainKeys(null);
  };

  const selectNone = () => {
    setSelectedDomainKeys(new Set());
  };

  const marketLabel =
    market === 'all'
      ? 'All Markets'
      : market === 'colorado'
      ? 'Denver / CO + National'
      : 'Phoenix / AZ + National';

  // ── Y-axis formatter ────────────────────────────────────────────────────────

  const yAxisFormatter = (value: number) => {
    if (selectedMetric === 'ctr') return `${(value * 100).toFixed(1)}%`;
    if (selectedMetric === 'position') return value.toFixed(1);
    return value.toLocaleString();
  };

  const tooltipFormatter = (value: number, name: string) => {
    const domain = data?.domains.find((d) => d.utmSource === name);
    const label = domain?.label ?? name;
    if (selectedMetric === 'ctr') return [`${(value * 100).toFixed(2)}%`, label];
    if (selectedMetric === 'position') return [value.toFixed(1), label];
    return [value.toLocaleString(), label];
  };

  // ── Loading / Error states ──────────────────────────────────────────────────

  if (loading && !hasAnyCachedData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading satellite site data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !data) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800">
          <div className="font-semibold mb-1">Error loading satellite domains</div>
          <p className="text-sm">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Satellite Sites</h1>
            {data?.dateRange && (
              <p className="text-sm text-gray-500 mt-1">
                Data through {data.dateRange.endDate}
              </p>
            )}
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-pink-600" />
            Showing {marketLabel}
          </div>
        </div>

        {/* Date Filter */}
        <DateFilterBar
          dateFilter={dateFilter}
          onFilterChange={handleDateFilterChange}
          color="blue"
        />

        {/* All domains have no data banner */}
        {allNoData && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              {dateFilter === 'today' || dateFilter === 'yesterday' ? (
                <>
                  <div className="font-semibold text-amber-900">GSC data not available yet</div>
                  <p className="text-sm text-amber-800 mt-1">
                    Google Search Console has a 2–3 day data delay. Today and yesterday&apos;s
                    data won&apos;t appear until Google processes it. Try <strong>Last 7 Days</strong> to see recent data.
                  </p>
                </>
              ) : (
                <>
                  <div className="font-semibold text-amber-900">No GSC data found</div>
                  <p className="text-sm text-amber-800 mt-1">
                    Make sure each domain is verified in Google Search Console with the same
                    credentials. Domain properties use the{' '}
                    <code className="bg-amber-100 px-1 rounded text-xs">sc-domain:</code> prefix.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard
            label="Total Clicks"
            value={totals.clicks.toLocaleString()}
            icon={MousePointerClick}
            color="bg-blue-500"
          />
          <StatCard
            label="Total Impressions"
            value={totals.impressions.toLocaleString()}
            icon={Eye}
            color="bg-indigo-500"
          />
          <StatCard
            label="Avg CTR"
            value={formatCtr(totals.ctr)}
            icon={TrendingUp}
            color="bg-green-500"
          />
          <StatCard
            label="Lead CVR"
            value={formatPercent(totalConversionRate)}
            icon={Target}
            color="bg-teal-500"
          />
          <StatCard
            label="Avg Position"
            value={totals.position > 0 ? formatPosition(totals.position) : '—'}
            icon={Target}
            color="bg-orange-500"
          />
          <StatCard
            label="Total Leads"
            value={totals.leads.toLocaleString()}
            icon={Users}
            color="bg-pink-500"
          />
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900">Top Lead Drivers</h2>
            <p className="text-xs text-gray-500 mt-0.5">Most leads in this period</p>
            <div className="mt-4 space-y-3">
              {topLeads.length === 0 ? (
                <div className="text-sm text-gray-400">No lead data yet.</div>
              ) : (
                topLeads.map((domain) => (
                  <div key={domain.domain} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: domain.color }}
                      />
                      <span className="text-sm font-medium text-gray-800">{domain.label}</span>
                    </div>
                    <div className="text-sm text-gray-600">{domain.leads} leads</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900">Highest Conversion</h2>
            <p className="text-xs text-gray-500 mt-0.5">Leads per click</p>
            <div className="mt-4 space-y-3">
              {topConversion.length === 0 ? (
                <div className="text-sm text-gray-400">Not enough click data yet.</div>
              ) : (
                topConversion.map((domain) => (
                  <div key={domain.domain} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: domain.color }}
                      />
                      <span className="text-sm font-medium text-gray-800">{domain.label}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatPercent(domain.conversionRate)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900">Opportunities</h2>
            <p className="text-xs text-gray-500 mt-0.5">High exposure, low engagement</p>
            <div className="mt-4 space-y-3">
              {lowCtr.length === 0 && lowConversion.length === 0 ? (
                <div className="text-sm text-gray-400">No clear opportunities yet.</div>
              ) : (
                <>
                  {lowCtr.map((domain) => (
                    <div key={`${domain.domain}-ctr`} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{domain.label}</span>
                      <span className="text-xs text-amber-600">
                        Low CTR {formatPercent(domain.ctr)}
                      </span>
                    </div>
                  ))}
                  {lowConversion.map((domain) => (
                    <div key={`${domain.domain}-cvr`} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{domain.label}</span>
                      <span className="text-xs text-rose-600">
                        Low CVR {formatPercent(domain.conversionRate)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Domain Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Domain Performance</h2>
            <p className="text-sm text-gray-500 mt-0.5">Sorted by impressions (highest first)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 min-w-[220px]">
                    Domain
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Clicks</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Impressions</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Avg CTR</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Lead CVR</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Avg Position</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Leads</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Lead Share</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedDomains.map((domain) => {
                  const hasData = domain.clicks > 0 || domain.impressions > 0;
                  const positionColor =
                    domain.position === 0
                      ? 'text-gray-400'
                      : domain.position <= 10
                      ? 'text-green-600 font-semibold'
                      : domain.position <= 20
                      ? 'text-yellow-600 font-semibold'
                      : 'text-red-600 font-semibold';

                  return (
                    <tr key={domain.domain} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: domain.color }}
                          />
                          <a
                            href={`https://${domain.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                          >
                            <Globe className="w-3.5 h-3.5 shrink-0" />
                            {domain.domain}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                          {domain.gscError && (
                            <span title={domain.gscError}>
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 pl-5 mt-0.5">{domain.label}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {domain.clicks.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {domain.impressions.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {domain.ctr > 0 ? formatCtr(domain.ctr) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {domain.conversionRate > 0 ? formatPercent(domain.conversionRate) : '—'}
                      </td>
                      <td className={`px-4 py-3 text-right ${positionColor}`}>
                        {domain.position > 0 ? formatPosition(domain.position) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium text-gray-900">{domain.leads}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {domain.leadShare > 0 ? formatPercent(domain.leadShare) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasData ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            No data
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Performance Over Time</h2>

          {/* Metric selector tabs */}
          <div className="flex gap-1">
            {(['clicks', 'impressions', 'ctr', 'position'] as ChartMetric[]).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  selectedMetric === metric
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {metric === 'ctr' ? 'CTR' : metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>

          {/* Domain toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              All
            </button>
            <button
              onClick={selectNone}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              None
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1" />
            {filteredDomains.map((domain) => {
              const isSelected =
                effectiveSelectedDomainKeys === null || effectiveSelectedDomainKeys.has(domain.utmSource);
              return (
                <button
                  key={domain.utmSource}
                  onClick={() => toggleDomain(domain.utmSource)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                    isSelected
                      ? 'border-transparent text-white'
                      : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
                  }`}
                  style={isSelected ? { backgroundColor: domain.color } : {}}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isSelected ? 'white' : domain.color }}
                  />
                  {domain.label}
                </button>
              );
            })}
          </div>

          {/* Y-axis label for position */}
          {selectedMetric === 'position' && (
            <p className="text-xs text-gray-500 -mb-2">
              Avg Position (lower number = better ranking)
            </p>
          )}

          {/* Chart */}
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-60 text-gray-400 text-sm">
              No daily data available for the selected domains and date range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tickFormatter={yAxisFormatter}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip
                  formatter={tooltipFormatter}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
                />
                {chartDomains.map((domain) => (
                  <Line
                    key={domain.utmSource}
                    type="monotone"
                    dataKey={domain.utmSource}
                    stroke={domain.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
