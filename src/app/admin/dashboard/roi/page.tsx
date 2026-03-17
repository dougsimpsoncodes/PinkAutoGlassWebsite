'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import SyncButton from '@/components/admin/SyncButton';
import {
  DollarSign, TrendingUp, Users, Target, AlertCircle,
  Eye, MousePointerClick, Phone, FileText,
} from 'lucide-react';
import { getDateRange as getMtDateRange, getMountainTime, type DateFilter } from '@/lib/dateUtils';

interface GrossRevenueData {
  grossRevenue: number;
  attributedRevenue: number;
  invoiceCount: number;
  attributedLeadCount: number;
  attributionRate: number;
}

interface PlatformROI {
  uniqueCustomers: number;
  cost: number;
  revenue: number;
  costPerCustomer: number;
  revenuePerCustomer: number;
  roi: number;
  profit: number;
  profitMargin: number;
}

interface ROIData {
  dateRange: { start: string; end: string };
  platforms: {
    google_ads: PlatformROI;
    microsoft_ads: PlatformROI;
    organic: PlatformROI;
    direct: PlatformROI;
  };
  totals: {
    uniqueCustomers: number;
    totalCost: number;
    totalRevenue: number;
    avgCostPerCustomer: number;
    avgRevenuePerCustomer: number;
    overallROI: number;
    totalProfit: number;
    profitMargin: number;
  };
}

interface PlatformFunnel {
  impressions: number;
  clicks: number;
  uniqueCustomers: number;
  breakdown: { byCall: number; byForm: number };
  cost: number;
  ctr: number;
  conversionRate: number;
  costPerCustomer: number;
}

interface FunnelData {
  dateRange: { start: string; end: string };
  platforms: {
    google_ads: PlatformFunnel;
    microsoft_ads: PlatformFunnel;
    organic: PlatformFunnel;
    direct: PlatformFunnel;
  };
  totals: {
    impressions: number;
    clicks: number;
    uniqueCustomers: number;
    breakdown: { byCall: number; byForm: number };
    totalCost: number;
    avgCostPerCustomer: number;
    overallCTR: number;
    overallConversionRate: number;
  };
}

export default function AdPerformancePage() {
  const [roiData, setRoiData] = useState<ROIData | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [grossData, setGrossData] = useState<GrossRevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const getDateRangeParams = () => {
    if (dateRange === '90days') {
      const mtNow = getMountainTime();
      const today = new Date(mtNow.getFullYear(), mtNow.getMonth(), mtNow.getDate());
      const start = new Date(today);
      start.setDate(start.getDate() - 90);
      return {
        start: start.toISOString().split('T')[0],
        end: mtNow.toISOString().split('T')[0],
      };
    }
    const range = getMtDateRange(dateRange as DateFilter);
    return {
      start: range.start.toISOString().split('T')[0],
      end: range.end.toISOString().split('T')[0],
    };
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const range = getDateRangeParams();
      const [roiRes, funnelRes, grossRes] = await Promise.all([
        fetch(`/api/admin/roi?startDate=${range.start}&endDate=${range.end}`),
        fetch(`/api/admin/funnel?startDate=${range.start}&endDate=${range.end}`),
        fetch('/api/admin/total-revenue'),
      ]);

      if (roiRes.ok) setRoiData(await roiRes.json());
      if (funnelRes.ok) setFunnelData(await funnelRes.json());
      if (grossRes.ok) setGrossData(await grossRes.json());
    } catch (error) {
      console.error('Error fetching ad performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading ad performance data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const platforms = [
    { key: 'google_ads', name: 'Google Ads', icon: '🔵' },
    { key: 'microsoft_ads', name: 'Microsoft Ads', icon: '🟢' },
    { key: 'organic', name: 'Organic Search', icon: '🟣' },
    { key: 'direct', name: 'Direct/Unknown', icon: '⚪' },
  ];

  const isPaid = (key: string) => ['google_ads', 'microsoft_ads'].includes(key);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ad Performance</h1>
          <p className="text-gray-600 mt-1">Funnel, revenue, and ROI by platform</p>
        </div>
        <SyncButton scope="roi" onSyncComplete={fetchAllData} />
      </div>

      {/* Date Range Selector */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
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
          {roiData && (
            <div className="ml-auto text-sm text-gray-600">
              {roiData.dateRange.start} to {roiData.dateRange.end}
            </div>
          )}
        </div>
      </div>

      {/* ── REVENUE ATTRIBUTION BANNER ── */}
      {grossData && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Revenue Attribution Gap</h3>
              <p className="text-sm text-gray-600 mt-1">
                Only {grossData.attributionRate}% of invoiced revenue is linked to a lead source.
                Attribution requires matching phone numbers between leads and Omega invoices.
                Google call leads are harder to match since callers often don&apos;t submit a form.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">Gross Revenue (All Invoices)</p>
              <p className="text-2xl font-bold text-green-700">
                ${grossData.grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-green-600 mt-1">{grossData.invoiceCount} uploaded invoices • all time</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Attributed Revenue</p>
              <p className="text-2xl font-bold text-blue-700">
                ${grossData.attributedRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-blue-600 mt-1">{grossData.attributedLeadCount} leads matched to invoices</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Attribution Rate</p>
              <p className="text-2xl font-bold text-amber-700">{grossData.attributionRate}%</p>
              <p className="text-xs text-amber-600 mt-1">
                ${(grossData.grossRevenue - grossData.attributedRevenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} not yet attributed
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── FINANCIAL SUMMARY ── */}
      {roiData && (
        <>
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg shadow-lg p-8 mb-6 text-white">
            <h2 className="text-xl font-bold mb-5">Financial Summary (Attributed Revenue)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
                <div className="flex items-center gap-2 mb-1 text-sm opacity-90"><DollarSign className="w-4 h-4" />Attributed Rev</div>
                <div className="text-3xl font-bold">${roiData.totals.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
                <div className="flex items-center gap-2 mb-1 text-sm opacity-90"><Target className="w-4 h-4" />Ad Spend</div>
                <div className="text-3xl font-bold">${roiData.totals.totalCost.toLocaleString()}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
                <div className="flex items-center gap-2 mb-1 text-sm opacity-90"><TrendingUp className="w-4 h-4" />Profit</div>
                <div className="text-3xl font-bold">${roiData.totals.totalProfit.toLocaleString()}</div>
                <div className="text-xs opacity-75 mt-1">Margin: {roiData.totals.profitMargin}%</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
                <div className="flex items-center gap-2 mb-1 text-sm opacity-90"><TrendingUp className="w-4 h-4" />Overall ROI</div>
                <div className="text-3xl font-bold">{roiData.totals.overallROI.toFixed(2)}x</div>
                <div className="text-xs opacity-75 mt-1">${roiData.totals.overallROI.toFixed(2)} per $1 spent</div>
              </div>
            </div>
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm opacity-90 mb-1"><Users className="w-4 h-4" />Unique Customers</div>
                <div className="text-2xl font-bold">{roiData.totals.uniqueCustomers}</div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-1">Avg Cost / Customer</div>
                <div className="text-2xl font-bold">${roiData.totals.avgCostPerCustomer.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-1">Avg Revenue / Customer</div>
                <div className="text-2xl font-bold">${roiData.totals.avgRevenuePerCustomer.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Per-Platform ROI */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Platform ROI</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {platforms.map(platform => {
              const metrics = roiData.platforms[platform.key as keyof typeof roiData.platforms];
              if (metrics.uniqueCustomers === 0 && metrics.revenue === 0) return null;
              const paid = isPaid(platform.key);
              return (
                <div key={platform.key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{platform.icon}</span>
                      <h3 className="font-bold text-gray-900">{platform.name}</h3>
                    </div>
                    {paid && metrics.roi >= 1 && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Profitable</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs text-gray-500 mb-0.5">Customers</div>
                      <div className="text-xl font-bold">{metrics.uniqueCustomers}</div>
                    </div>
                    {paid && (
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-xs text-gray-500 mb-0.5">Ad Spend</div>
                        <div className="text-xl font-bold">${metrics.cost.toLocaleString()}</div>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs text-gray-500 mb-0.5">Revenue</div>
                      <div className="text-xl font-bold text-green-600">${metrics.revenue.toLocaleString()}</div>
                    </div>
                    {paid && (
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-xs text-gray-500 mb-0.5">ROI</div>
                        <div className={`text-xl font-bold ${metrics.roi >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                          {metrics.roi.toFixed(2)}x
                        </div>
                      </div>
                    )}
                  </div>
                  {paid && (
                    <div className="text-xs text-gray-500 flex justify-between pt-2 border-t border-gray-100">
                      <span>Cost/customer: ${metrics.costPerCustomer.toFixed(2)}</span>
                      <span>Rev/customer: ${metrics.revenuePerCustomer.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── MARKETING FUNNEL ── */}
      {funnelData && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Marketing Funnel</h2>
          <div className="bg-gradient-to-br from-pink-600 to-blue-600 rounded-lg shadow-lg p-6 mb-6 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm opacity-90 mb-1"><Eye className="w-4 h-4" />Impressions</div>
                <div className="text-3xl font-bold">{funnelData.totals.impressions.toLocaleString()}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm opacity-90 mb-1"><MousePointerClick className="w-4 h-4" />Clicks</div>
                <div className="text-3xl font-bold">{funnelData.totals.clicks.toLocaleString()}</div>
                <div className="text-xs opacity-75 mt-1">CTR: {funnelData.totals.overallCTR}%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm opacity-90 mb-1"><Users className="w-4 h-4" />Unique Customers</div>
                <div className="text-3xl font-bold">{funnelData.totals.uniqueCustomers}</div>
                <div className="text-xs opacity-75 mt-1">Conv: {funnelData.totals.overallConversionRate}%</div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <div>
                  <div className="text-xl font-bold">{funnelData.totals.breakdown.byCall}</div>
                  <div className="text-xs opacity-75">First contact: Call</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <div>
                  <div className="text-xl font-bold">{funnelData.totals.breakdown.byForm}</div>
                  <div className="text-xs opacity-75">First contact: Form</div>
                </div>
              </div>
            </div>
          </div>

          {/* Per-platform funnel */}
          <div className="space-y-4 mb-8">
            {platforms.map(platform => {
              const metrics = funnelData.platforms[platform.key as keyof typeof funnelData.platforms];
              if (metrics.impressions === 0 && metrics.clicks === 0 && metrics.uniqueCustomers === 0) return null;
              return (
                <div key={platform.key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{platform.icon}</span>
                      <h3 className="font-bold text-gray-900">{platform.name}</h3>
                    </div>
                    {metrics.cost > 0 && (
                      <span className="text-sm text-gray-600">Spend: <strong>${metrics.cost.toLocaleString()}</strong></span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Impressions</div>
                      <div className="text-xl font-bold">{metrics.impressions.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Clicks</div>
                      <div className="text-xl font-bold">{metrics.clicks.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">CTR: {metrics.ctr}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Customers</div>
                      <div className="text-xl font-bold">{metrics.uniqueCustomers}</div>
                      <div className="text-xs text-gray-400">Conv: {metrics.conversionRate}%</div>
                    </div>
                    {metrics.cost > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Cost/Customer</div>
                        <div className="text-xl font-bold">${metrics.costPerCustomer.toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                  {metrics.uniqueCustomers > 0 && (
                    <div className="text-xs text-gray-500 flex gap-4 pt-2 border-t border-gray-100">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />Call first: {metrics.breakdown.byCall}</span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" />Form first: {metrics.breakdown.byForm}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Key Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-base font-bold text-blue-900 mb-3">Key Insights</h3>
        <ul className="space-y-1.5 text-sm text-blue-800">
          <li><strong>ROI</strong> = Attributed Revenue / Ad Spend. Low attribution rate means true ROI is likely higher.</li>
          <li><strong>Attribution gap</strong> — Microsoft shows higher attributed revenue because form leads (with phone numbers) match invoices better than call-only leads.</li>
          <li><strong>To improve attribution</strong> — use a dedicated Google Ads forwarding number so call customers can be matched to invoices by phone.</li>
          <li><strong>Funnel</strong> — each customer counted once (first touch). Calls deduplicated by phone number.</li>
        </ul>
      </div>
    </DashboardLayout>
  );
}
