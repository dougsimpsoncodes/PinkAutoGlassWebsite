'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import DateFilterBar, { DateFilter } from '@/components/admin/DateFilterBar';
import { useSync } from '@/contexts/SyncContext';
import { getDateRange, isInDateRange } from '@/lib/dateUtils';
import {
  Search,
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  FileText,
  X,
  Check,
  Clock,
  MessageSquare,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Play,
  Filter
} from 'lucide-react';
import { UnifiedLead, fetchUnifiedLeads } from '@/lib/leadProcessing';

export default function LeadManagementDashboard() {
  // Get global sync state
  const { syncVersion } = useSync();

  // Cache all leads - fetch once, filter client-side
  const [allLeadsCache, setAllLeadsCache] = useState<UnifiedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'form' | 'call' | 'text'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<UnifiedLead | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<UnifiedLead>>({});
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');

  // Get date range using Mountain Time (consistent with server-side)
  const dateRangeObj = useMemo(() => getDateRange(dateFilter), [dateFilter]);

  // Filter leads by date range (client-side, instant) - uses Mountain Time
  const getFilteredLeads = useCallback(() => {
    if (allLeadsCache.length === 0) return [];

    const filteredLeads = allLeadsCache.filter(lead =>
      isInDateRange(lead.created_at, dateRangeObj)
    );

    return filteredLeads.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [allLeadsCache, dateRangeObj]);

  // Get filtered leads - computed from cache, no loading spinner
  const leads = getFilteredLeads();

  // Subscribe to global sync events
  useEffect(() => {
    if (syncVersion > 0) {
      fetchAllLeads();
    }
  }, [syncVersion]);

  // Initial load only
  useEffect(() => {
    fetchAllLeads();
  }, []);

  const fetchAllLeads = async () => {
    try {
      setLoading(true);
      const allLeads = await fetchUnifiedLeads({ includeAttribution: true });
      setAllLeadsCache(allLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };


  // Use consistent date display from shared utility (Mountain Time)
  const getDateRangeDisplay = () => dateRangeObj.display;

  const updateLead = async () => {
    if (!selectedLead || selectedLead.type !== 'form') return;

    try {
      const response = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLead.id,
          ...editData,
        }),
      });

      if (!response.ok) throw new Error('Failed to update lead');

      await fetchAllLeads();
      setSelectedLead({ ...selectedLead, ...editData });
      setEditMode(false);
      setEditData({});
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Failed to update lead');
    }
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    // Type filter
    if (filterType !== 'all' && lead.type !== filterType) return false;

    // Status filter
    if (filterStatus !== 'all' && lead.status !== filterStatus) return false;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        lead.name?.toLowerCase().includes(search) ||
        lead.phone?.toLowerCase().includes(search) ||
        lead.email?.toLowerCase().includes(search) ||
        lead.vehicle_make?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const statusOptions = [
    { value: 'all', label: 'All', color: 'gray' },
    { value: 'new', label: 'New', color: 'blue' },
    { value: 'contacted', label: 'Contacted', color: 'yellow' },
    { value: 'quoted', label: 'Quoted', color: 'purple' },
    { value: 'scheduled', label: 'Scheduled', color: 'indigo' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'lost', label: 'Lost', color: 'red' },
  ];

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'gray';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'text': return <MessageSquare className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-green-100 text-green-700';
      case 'text': return 'bg-blue-100 text-blue-700';
      default: return 'bg-purple-100 text-purple-700';
    }
  };

  const formatPhoneNumber = (num: string) => {
    if (!num) return '';
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return num;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Stats
  const stats = {
    total: leads.length,
    calls: leads.filter(l => l.type === 'call').length,
    texts: leads.filter(l => l.type === 'text').length,
    forms: leads.filter(l => l.type === 'form').length,
    new: leads.filter(l => l.status === 'new').length,
    totalRevenue: leads.reduce((sum, l) => sum + (l.revenue_amount || 0), 0),
  };

  // Only show spinner on initial load when we have no cached data
  if (loading && allLeadsCache.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leads...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-600 mt-1">All leads from calls, texts, and forms</p>
      </div>

      {/* Date Filter Bar */}
      <DateFilterBar
        dateFilter={dateFilter}
        onFilterChange={setDateFilter}
        dateDisplay={getDateRangeDisplay()}
        color="gray"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-500">
          <div className="text-sm text-gray-600">Total Leads</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600">Phone Calls</div>
          <div className="text-2xl font-bold text-gray-900">{stats.calls}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <div className="text-sm text-gray-600">Form Leads</div>
          <div className="text-2xl font-bold text-gray-900">{stats.forms}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600">New Leads</div>
          <div className="text-2xl font-bold text-gray-900">{stats.new}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-600">
          <div className="text-sm text-gray-600">Revenue</div>
          <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, email, or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex gap-1">
              {(['all', 'call', 'form'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterType === type
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'call' ? 'Calls' : 'Forms'}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-1 flex-wrap">
            {statusOptions.slice(0, 4).map(option => (
              <button
                key={option.value}
                onClick={() => setFilterStatus(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === option.value
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No leads found
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    {/* Type */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(lead.type)}`}>
                        {getTypeIcon(lead.type)}
                        {lead.type === 'call' ? 'Call' : lead.type === 'text' ? 'Text' : 'Form'}
                      </span>
                    </td>

                    {/* Name / Phone */}
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{formatPhoneNumber(lead.phone)}</div>
                      {lead.email && (
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      )}
                    </td>

                    {/* Details */}
                    <td className="px-4 py-4">
                      {lead.type === 'form' && (
                        <div className="text-sm text-gray-600">
                          {lead.vehicle_year} {lead.vehicle_make} {lead.vehicle_model}
                          {lead.service_type && (
                            <span className="ml-2 text-xs text-gray-500">({lead.service_type})</span>
                          )}
                        </div>
                      )}
                      {lead.type === 'call' && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {lead.result === 'Accepted' || lead.result === 'Call connected' ? (
                            <PhoneIncoming className="w-4 h-4 text-green-500" />
                          ) : lead.result === 'Missed' ? (
                            <PhoneMissed className="w-4 h-4 text-red-500" />
                          ) : (
                            <PhoneOutgoing className="w-4 h-4 text-blue-500" />
                          )}
                          <span>{lead.result}</span>
                          {lead.duration && lead.duration > 0 && (
                            <span className="text-gray-400">• {formatDuration(lead.duration)}</span>
                          )}
                        </div>
                      )}
                      {lead.notes && lead.type === 'call' && (
                        <div className="text-xs text-gray-400 mt-1">{lead.notes}</div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(lead.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-${getStatusColor(lead.status)}-100 text-${getStatusColor(lead.status)}-800`}>
                        {lead.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="text-pink-600 hover:text-pink-900 font-medium text-sm"
                        >
                          View
                        </button>
                        {lead.type === 'call' && lead.recording_id && (
                          <a
                            href={`/api/admin/recording/${lead.recording_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                          >
                            <Play className="w-3 h-3" />
                            Play
                          </a>
                        )}
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedLead.type)}`}>
                  {getTypeIcon(selectedLead.type)}
                  {selectedLead.type === 'call' ? 'Call' : selectedLead.type === 'text' ? 'Text' : 'Form'}
                </span>
                <h2 className="text-xl font-bold text-gray-900">{selectedLead.name}</h2>
              </div>
              <button
                onClick={() => {
                  setSelectedLead(null);
                  setEditMode(false);
                  setEditData({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Phone</div>
                    <a href={`tel:${selectedLead.phone}`} className="text-pink-600 hover:text-pink-800 font-medium">
                      {formatPhoneNumber(selectedLead.phone)}
                    </a>
                  </div>
                  {selectedLead.email && (
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <a href={`mailto:${selectedLead.email}`} className="text-pink-600 hover:text-pink-800">
                        {selectedLead.email}
                      </a>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-600">Created</div>
                    <div className="text-gray-900">{new Date(selectedLead.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Call-specific info */}
              {selectedLead.type === 'call' && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Call Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Result</div>
                      <div className="text-gray-900">{selectedLead.result}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="text-gray-900">{formatDuration(selectedLead.duration || 0)}</div>
                    </div>
                  </div>
                  {selectedLead.recording_id && (
                    <div className="mt-4">
                      <a
                        href={`/api/admin/recording/${selectedLead.recording_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Play className="w-4 h-4" />
                        Play Recording
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Form-specific info with editing */}
              {selectedLead.type === 'form' && (
                <>
                  {/* CRM Fields (Editable) */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">CRM Information</h3>
                      {!editMode ? (
                        <button
                          onClick={() => {
                            setEditMode(true);
                            setEditData({
                              status: selectedLead.status,
                              quote_amount: selectedLead.quote_amount,
                              revenue_amount: selectedLead.revenue_amount,
                              close_date: selectedLead.close_date,
                              notes: selectedLead.notes,
                            });
                          }}
                          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
                        >
                          Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditMode(false);
                              setEditData({});
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={updateLead}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        {editMode ? (
                          <select
                            value={editData.status || selectedLead.status}
                            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                          >
                            {statusOptions.filter(opt => opt.value !== 'all').map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-${getStatusColor(selectedLead.status)}-100 text-${getStatusColor(selectedLead.status)}-800`}>
                            {selectedLead.status}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quote Amount</label>
                        {editMode ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editData.quote_amount ?? selectedLead.quote_amount ?? ''}
                            onChange={(e) => setEditData({ ...editData, quote_amount: parseFloat(e.target.value) || undefined })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                            placeholder="0.00"
                          />
                        ) : (
                          <div className="text-gray-900">${selectedLead.quote_amount?.toLocaleString() || '-'}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Amount</label>
                        {editMode ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editData.revenue_amount ?? selectedLead.revenue_amount ?? ''}
                            onChange={(e) => setEditData({ ...editData, revenue_amount: parseFloat(e.target.value) || undefined })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                            placeholder="0.00"
                          />
                        ) : (
                          <div className="text-green-600 font-medium">${selectedLead.revenue_amount?.toLocaleString() || '-'}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Close Date</label>
                        {editMode ? (
                          <input
                            type="date"
                            value={editData.close_date ?? selectedLead.close_date ?? ''}
                            onChange={(e) => setEditData({ ...editData, close_date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                          />
                        ) : (
                          <div className="text-gray-900">{selectedLead.close_date || '-'}</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      {editMode ? (
                        <textarea
                          value={editData.notes ?? selectedLead.notes ?? ''}
                          onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                          placeholder="Add notes..."
                        />
                      ) : (
                        <div className="text-gray-900">{selectedLead.notes || 'No notes'}</div>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  {selectedLead.vehicle_make && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Vehicle Information</h3>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Car className="w-5 h-5 text-gray-400" />
                        {selectedLead.vehicle_year} {selectedLead.vehicle_make} {selectedLead.vehicle_model}
                      </div>
                      {selectedLead.service_type && (
                        <div className="mt-2 text-sm text-gray-600">
                          Service: <span className="capitalize">{selectedLead.service_type}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Phone className="w-5 h-5" />
                  Call
                </a>
                <a
                  href={`sms:${selectedLead.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <MessageSquare className="w-5 h-5" />
                  Text
                </a>
                {selectedLead.email && (
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Mail className="w-5 h-5" />
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
