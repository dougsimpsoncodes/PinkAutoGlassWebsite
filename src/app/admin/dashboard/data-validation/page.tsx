'use client';

/**
 * Cross-Report Data Validation Page
 *
 * Hidden diagnostic tool (not in sidebar nav). Compares the two canonical
 * server-side sources: metricsBuilder (counts) and unifiedLeadsBuilder (rows).
 * Both should agree since they use the same logic.
 *
 * Does NOT use fetchUnifiedLeads or any client-side lead logic.
 *
 * Access: /admin/dashboard/data-validation
 */

import { useState, useMemo, useCallback } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { type DateFilter } from '@/lib/dateUtils';
import { calcROAS, calcCPL } from '@/lib/metricFormulas';
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

interface Check {
  name: string;
  report1: string;
  report2: string;
  value1: number | string;
  value2: number | string;
  status: 'match' | 'mismatch' | 'warn';
  note?: string;
}

const TOLERANCE = 0.01;

function valuesMatch(a: number, b: number): boolean {
  return Math.abs(a - b) <= TOLERANCE;
}

export default function DataValidationPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('7days');
  const [loading, setLoading] = useState(false);
  const [checks, setChecks] = useState<Check[]>([]);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runValidation = useCallback(async () => {
    setLoading(true);
    setChecks([]);

    try {
      // Fetch from both canonical server-side sources in parallel
      const [metricsRes, unifiedRes, googleUnifiedRes, microsoftUnifiedRes, googleAdsRes, microsoftAdsRes] = await Promise.all([
        fetch(`/api/admin/dashboard/metrics?period=${dateFilter}`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`/api/admin/dashboard/unified-leads?period=${dateFilter}`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`/api/admin/dashboard/unified-leads?period=${dateFilter}&platform=google`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`/api/admin/dashboard/unified-leads?period=${dateFilter}&platform=microsoft`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`/api/admin/dashboard/google-ads?period=${dateFilter}`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`/api/admin/dashboard/microsoft-ads?period=${dateFilter}`, { cache: 'no-store' }).then(r => r.json()),
      ]);

      const metrics = metricsRes;
      const unified = unifiedRes;
      const googleUnified = googleUnifiedRes;
      const microsoftUnified = microsoftUnifiedRes;

      const results: Check[] = [];

      // ── metricsBuilder vs unifiedLeadsBuilder (must match exactly) ──

      results.push({
        name: 'Total Leads',
        report1: 'metricsBuilder (Dashboard)',
        report2: 'unifiedLeadsBuilder (Leads page)',
        value1: metrics.leads.total,
        value2: unified.counts.total,
        status: metrics.leads.total === unified.counts.total ? 'match' : 'mismatch',
        note: metrics.leads.total !== unified.counts.total
          ? `Delta: ${Math.abs(metrics.leads.total - unified.counts.total)}. Both are server-side — this should not happen.`
          : undefined,
      });

      results.push({
        name: 'Google Leads',
        report1: 'metricsBuilder',
        report2: 'unifiedLeadsBuilder (google)',
        value1: metrics.leads.byPlatform.google.total,
        value2: googleUnified.counts.total,
        status: metrics.leads.byPlatform.google.total === googleUnified.counts.total ? 'match' : 'mismatch',
      });

      results.push({
        name: 'Microsoft Leads',
        report1: 'metricsBuilder',
        report2: 'unifiedLeadsBuilder (microsoft)',
        value1: metrics.leads.byPlatform.microsoft.total,
        value2: microsoftUnified.counts.total,
        status: metrics.leads.byPlatform.microsoft.total === microsoftUnified.counts.total ? 'match' : 'mismatch',
      });

      results.push({
        name: 'Call Leads',
        report1: 'metricsBuilder',
        report2: 'unifiedLeadsBuilder',
        value1: metrics.leads.calls,
        value2: unified.counts.calls,
        status: metrics.leads.calls === unified.counts.calls ? 'match' : 'mismatch',
      });

      results.push({
        name: 'Form Leads',
        report1: 'metricsBuilder',
        report2: 'unifiedLeadsBuilder',
        value1: metrics.leads.forms,
        value2: unified.counts.forms,
        status: metrics.leads.forms === unified.counts.forms ? 'match' : 'mismatch',
      });

      results.push({
        name: 'Text Leads',
        report1: 'metricsBuilder',
        report2: 'unifiedLeadsBuilder',
        value1: metrics.leads.texts,
        value2: unified.counts.texts,
        status: metrics.leads.texts === unified.counts.texts ? 'match' : 'mismatch',
      });

      // ── SPEND (Dashboard vs platform API) ──

      results.push({
        name: 'Google Spend',
        report1: 'Exec Dashboard',
        report2: 'Google Ads API',
        value1: metrics.spend.google,
        value2: googleAdsRes.spend,
        status: valuesMatch(metrics.spend.google, googleAdsRes.spend) ? 'match' : 'mismatch',
      });

      results.push({
        name: 'Microsoft Spend',
        report1: 'Exec Dashboard',
        report2: 'Microsoft Ads API',
        value1: metrics.spend.microsoft,
        value2: microsoftAdsRes.spend,
        status: valuesMatch(metrics.spend.microsoft, microsoftAdsRes.spend) ? 'match' : 'mismatch',
      });

      // ── REVENUE (metricsBuilder vs unifiedLeadsBuilder sum) ──

      const googleRevFromUnified = (googleUnified.leads || []).reduce((s: number, l: any) => s + (l.revenue_amount || 0), 0);
      const msRevFromUnified = (microsoftUnified.leads || []).reduce((s: number, l: any) => s + (l.revenue_amount || 0), 0);

      results.push({
        name: 'Google Attributed Revenue',
        report1: 'metricsBuilder',
        report2: 'unifiedLeadsBuilder (sum)',
        value1: metrics.revenue.byPlatform.google,
        value2: googleRevFromUnified,
        status: valuesMatch(metrics.revenue.byPlatform.google, googleRevFromUnified) ? 'match' : 'mismatch',
      });

      results.push({
        name: 'Microsoft Attributed Revenue',
        report1: 'metricsBuilder',
        report2: 'unifiedLeadsBuilder (sum)',
        value1: metrics.revenue.byPlatform.microsoft,
        value2: msRevFromUnified,
        status: valuesMatch(metrics.revenue.byPlatform.microsoft, msRevFromUnified) ? 'match' : 'mismatch',
      });

      // ── DERIVED METRICS ──

      const execRoas = calcROAS(metrics.revenue.attributed, metrics.spend.total);
      const unifiedRoas = calcROAS(googleRevFromUnified + msRevFromUnified, metrics.spend.total);

      results.push({
        name: 'ROAS',
        report1: 'metricsBuilder',
        report2: 'unifiedLeadsBuilder (derived)',
        value1: execRoas !== null ? `${execRoas.toFixed(2)}x` : '—',
        value2: unifiedRoas !== null ? `${unifiedRoas.toFixed(2)}x` : '—',
        status: execRoas !== null && unifiedRoas !== null && valuesMatch(execRoas, unifiedRoas) ? 'match' : 'warn',
      });

      const googleCplMetrics = calcCPL(metrics.spend.google, metrics.leads.byPlatform.google.total);
      const googleCplUnified = calcCPL(googleAdsRes.spend, googleUnified.counts.total);

      results.push({
        name: 'Google Cost / Lead',
        report1: 'metricsBuilder',
        report2: 'unifiedLeadsBuilder',
        value1: googleCplMetrics !== null ? `$${googleCplMetrics.toFixed(2)}` : '—',
        value2: googleCplUnified !== null ? `$${googleCplUnified.toFixed(2)}` : '—',
        status: googleCplMetrics !== null && googleCplUnified !== null && valuesMatch(googleCplMetrics, googleCplUnified) ? 'match' : 'warn',
      });

      // ── MATH SANITY CHECKS ──

      const leadSum = metrics.leads.byPlatform.google.total + metrics.leads.byPlatform.microsoft.total + metrics.leads.byPlatform.unattributed.total;
      results.push({
        name: 'Lead Totals Add Up',
        report1: 'leads.total',
        report2: 'google + microsoft + unattributed',
        value1: metrics.leads.total,
        value2: leadSum,
        status: metrics.leads.total === leadSum ? 'match' : 'mismatch',
      });

      const revSum = metrics.revenue.byPlatform.google + metrics.revenue.byPlatform.microsoft + metrics.revenue.byPlatform.unattributed;
      results.push({
        name: 'Attributed Revenue Adds Up',
        report1: 'revenue.attributed',
        report2: 'google + microsoft + unattributed',
        value1: `$${metrics.revenue.attributed.toFixed(2)}`,
        value2: `$${revSum.toFixed(2)}`,
        status: valuesMatch(metrics.revenue.attributed, revSum) ? 'match' : 'mismatch',
      });

      results.push({
        name: 'Spend Adds Up',
        report1: 'spend.total',
        report2: 'google + microsoft',
        value1: `$${metrics.spend.total.toFixed(2)}`,
        value2: `$${(metrics.spend.google + metrics.spend.microsoft).toFixed(2)}`,
        status: valuesMatch(metrics.spend.total, metrics.spend.google + metrics.spend.microsoft) ? 'match' : 'mismatch',
      });

      results.push({
        name: 'Attributed ≤ Gross Revenue',
        report1: 'revenue.attributed',
        report2: 'revenue.gross',
        value1: `$${metrics.revenue.attributed.toFixed(2)}`,
        value2: `$${metrics.revenue.gross.toFixed(2)}`,
        status: metrics.revenue.attributed <= metrics.revenue.gross + TOLERANCE ? 'match' : 'mismatch',
        note: metrics.revenue.attributed > metrics.revenue.gross + TOLERANCE ? 'Attributed revenue exceeds gross — possible attribution bug.' : undefined,
      });

      setChecks(results);
      setLastRun(new Date());
    } catch (err) {
      console.error('Validation error:', err);
      setChecks([{
        name: 'Validation Failed',
        report1: '—',
        report2: '—',
        value1: '—',
        value2: String(err),
        status: 'mismatch',
      }]);
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  const summary = useMemo(() => {
    const matches = checks.filter(c => c.status === 'match').length;
    const warns = checks.filter(c => c.status === 'warn').length;
    const mismatches = checks.filter(c => c.status === 'mismatch').length;
    return { matches, warns, mismatches, total: checks.length };
  }, [checks]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Data Validation</h1>
        <p className="text-gray-600 mt-1">Compares metricsBuilder vs unifiedLeadsBuilder — both server-side, should always match</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <button
          onClick={runValidation}
          disabled={loading}
          className="px-5 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 disabled:bg-pink-400 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Running...' : 'Run Validation'}
        </button>
        {lastRun && (
          <span className="text-xs text-gray-500 ml-auto">
            Last run: {lastRun.toLocaleTimeString()}
          </span>
        )}
      </div>

      {checks.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-700">{summary.matches}</div>
            <div className="text-xs text-emerald-600 mt-1">Passed</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">{summary.warns}</div>
            <div className="text-xs text-amber-600 mt-1">Warnings</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{summary.mismatches}</div>
            <div className="text-xs text-red-600 mt-1">Mismatches</div>
          </div>
        </div>
      )}

      {checks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Check</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Source A</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Value A</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Source B</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Value B</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {checks.map((check, i) => (
                <tr key={i} className={check.status === 'mismatch' ? 'bg-red-50' : check.status === 'warn' ? 'bg-amber-50' : ''}>
                  <td className="px-4 py-3">
                    {check.status === 'match' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    {check.status === 'warn' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    {check.status === 'mismatch' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{check.name}</div>
                    {check.note && <div className="text-xs text-gray-500 mt-1 max-w-xs">{check.note}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{check.report1}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-gray-900">{check.value1}</td>
                  <td className="px-4 py-3 text-gray-600">{check.report2}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-gray-900">{check.value2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {checks.length === 0 && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Select a period and click Run Validation to check cross-report consistency.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
