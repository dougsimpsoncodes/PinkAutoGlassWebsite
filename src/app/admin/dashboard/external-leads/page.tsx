'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import DateFilterBar, { DateFilter } from '@/components/admin/DateFilterBar';
import { getDateRange, isInDateRange } from '@/lib/dateUtils';
import { Globe, MapPin, Phone, Car, Calendar, ExternalLink, RadioTower } from 'lucide-react';

interface ExternalLead {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  phone_e164: string;
  zip: string | null;
  city: string | null;
  state: string | null;
  utm_source: string | null;
  status: string;
  vehicle_year: number | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatPhone(e164: string) {
  const d = e164.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  return e164;
}

export default function ExternalLeadsPage() {
  const [leads, setLeads] = useState<ExternalLead[]>([]);
  const [allNational, setAllNational] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>('7days');

  useEffect(() => {
    fetch('/api/admin/external-leads?limit=500')
      .then(r => r.json())
      .then(d => {
        setLeads(d.leads || []);
        setAllNational(d.allNationalLeads || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dateRangeObj = useMemo(() => getDateRange(dateFilter), [dateFilter]);

  const filteredLeads = useMemo(
    () => leads.filter(l => isInDateRange(l.created_at, dateRangeObj)),
    [leads, dateRangeObj]
  );

  // Group by state for the summary bar
  const byState = filteredLeads.reduce<Record<string, number>>((acc, l) => {
    const key = l.state || l.zip?.slice(0, 3) || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topStates = Object.entries(byState)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Globe className="w-7 h-7 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">External Leads</h1>
            </div>
            <p className="text-gray-500 text-sm">
              Leads from national sites outside Phoenix &amp; Denver. Stored for future partner referral.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
            <RadioTower className="w-4 h-4" />
            Market toggle coming soon
          </div>
        </div>

        <DateFilterBar
          dateFilter={dateFilter}
          onFilterChange={setDateFilter}
          color="gray"
        />

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Total External</p>
            <p className="text-3xl font-bold text-indigo-600">{filteredLeads.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">This Week</p>
            <p className="text-3xl font-bold text-gray-900">
              {filteredLeads.filter(l => new Date(l.created_at) > new Date(Date.now() - 7 * 86400000)).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Unique Markets</p>
            <p className="text-3xl font-bold text-gray-900">{Object.keys(byState).length}</p>
            <p className="text-xs text-gray-400">of {allNational} national total</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Top Market</p>
            <p className="text-2xl font-bold text-gray-900">{topStates[0]?.[0] ?? '—'}</p>
            <p className="text-xs text-gray-400">{topStates[0]?.[1] ?? 0} leads</p>
          </div>
        </div>

        {/* Geographic breakdown */}
        {topStates.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Geographic Breakdown</h2>
            <div className="flex flex-wrap gap-2">
              {topStates.map(([state, count]) => (
                <span key={state} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full">
                  <MapPin className="w-3 h-3" />
                  {state} <span className="text-indigo-400">·</span> {count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Leads table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">All External Leads</h2>
            <span className="text-xs text-gray-400">{leads.length} shown</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center">
              <Globe className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No external leads yet</p>
              <p className="text-gray-400 text-sm mt-1">They&apos;ll appear here once visitors from outside Phoenix &amp; Denver submit the form.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name / Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-300" />
                          {formatDate(lead.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {lead.first_name} {lead.last_name}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {formatPhone(lead.phone_e164)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-700">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {[lead.city, lead.state, lead.zip].filter(Boolean).join(', ') || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Car className="w-3.5 h-3.5 text-gray-400" />
                          {[lead.vehicle_year, lead.vehicle_make, lead.vehicle_model].filter(Boolean).join(' ') || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                          <ExternalLink className="w-3 h-3" />
                          {lead.utm_source || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Next steps callout */}
        <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-indigo-900 mb-2">Monetization Roadmap</h3>
          <ul className="text-sm text-indigo-700 space-y-1 list-disc list-inside">
            <li>Once a market hits ~20 leads/month, reach out to a local shop in that city to sell leads at $25–40 each</li>
            <li>When you&apos;re ready, add a broker partner API key per market — routing becomes automatic</li>
            <li>Phase 3: White-label the national sites under a partner brand per metro</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
